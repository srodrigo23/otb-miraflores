from sqlalchemy.orm import sessionmaker
import sqlalchemy

from app.models import Neighbor
from app.models import User
from app.models import NeighborMeter
from app.models import Measure
from app.models import MeterReading

from app.enums import UserType, MeasureType, MeterReadingStatus
from app.services.neighbor_meters import get_previous_readings_by_meter

import pandas as pd
# from datetime import datetime
from app.core.settings import settings

import bcrypt

# here url database
engine=sqlalchemy.create_engine(settings.DB_URL_SQLITE)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def hash_password(text:str):
  return bcrypt.hashpw(text, bcrypt.gensalt())

def create_neighbors(path:str)->None:
  df = pd.read_csv(path)
  total_rows = len(df)
  created_count = 0
  skipped_count = 0
  meter_count = 0
  print(f"\n[INFO] Leyendo {total_rows} registros desde: {path}")
  for idx, (_, row) in enumerate(df.iterrows(), start=1):
    nombres = str(row['Nombres']).strip() if pd.notna(row['Nombres']) else ''
    apellido_paterno = str(row['Apellido Paterno']).strip() if pd.notna(row['Apellido Paterno']) else ''
    apellido_materno = str(row['Apellido Materno']).strip() if pd.notna(row['Apellido Materno']) else ''
    last_name = f"{apellido_paterno} {apellido_materno}".strip()

    nombre_parts = nombres.split() if nombres else ['']
    first_name = nombre_parts[0] if len(nombre_parts) > 0 else ''
    second_name = ' '.join(nombre_parts[1:]) if len(nombre_parts) > 1 else ''
    
    meter_code = str(row['Cod. medidor'])
    section = str(row['Seccion'])
    
    print(f"\n[{idx}/{total_rows}] Procesando: {first_name} {last_name} | Medidor: {meter_code} | Sección: {section}")
    
    neighbor_exist = db.query(Neighbor).filter(Neighbor.first_name == first_name, Neighbor.last_name == last_name).all()
    
    if(len(neighbor_exist)==0):
      neighbor = Neighbor(
        first_name=first_name,#or apellido_paterno,
        second_name=second_name,
        last_name=last_name,
        ci=int(row['CI']) if pd.notna(row['CI']) else None,
        phone_number=int(row['Cel']) if pd.notna(row['Cel']) else None,
        email=None,
      )

      db.add(neighbor)
      db.commit()
      db.refresh(neighbor)
      created_count += 1
      print(f"  -> Vecino creado (ID: {neighbor.id})")
      
      meter = NeighborMeter(
        neighbor_id=neighbor.id,
        meter_code = meter_code,
        section = section,
        initial_reading = 0
      )
      db.add(meter)
      db.commit()
      db.refresh(meter)
      meter_count += 1
      print(f"  -> Medidor registrado (ID: {meter.id})")
      
    else: 
      print(f"  -> Vecino ya existe (ID: {neighbor_exist[0].id}), registrando solo medidor")
      meter = NeighborMeter(
        neighbor_id=neighbor_exist[0].id,
        meter_code = meter_code,
        section = section,
        initial_reading = 0
      )
      db.add(meter)
      db.commit()
      db.refresh(meter)
      meter_count += 1
      skipped_count += 1
      print(f"  -> Medidor registrado (ID: {meter.id})")

  print(f"\n{'='*50}")
  print(f"RESUMEN DE CARGA:")
  print(f"  Total registros leídos: {total_rows}")
  print(f"  Vecinos creados: {created_count}")
  print(f"  Vecinos ya existentes (omitidos): {skipped_count}")
  print(f"  Medidores registrados: {meter_count}")
  print(f"{'='*50}\n")


def _parse_reading(raw) -> int | None:
  """
  The reading columns come out of pandas as floats whenever the column has any
  blank, so 5790 arrives as 5790.0. Returns None for anything unreadable.
  """
  if pd.isna(raw):
    return None
  try:
    return int(float(str(raw).strip()))
  except ValueError:
    return None


def seed_meter_readings(
  measure_id: int,
  path: str,
  reading_column: str,
  meter_column: str = 'Cod. medidor',
  baseline: bool = False,
  zero_as_unread: bool = True,
) -> None:
  """
  Loads one reading column of the CSV into a measure that already exists.

  Each row is matched to its NeighborMeter by meter code, so both the measure
  and the meters have to be registered beforehand. Re-running it overwrites the
  readings of that same measure instead of duplicating them, so a column can be
  corrected and loaded again.

  baseline: for the first campaign the CSV holds the accumulated index of the
    meter, not a consumption. Billing that against 0 would charge the whole life
    of the meter, so previous_reading is set equal to current_reading and the
    campaign records the starting point without generating consumption.
  zero_as_unread: meters carrying 0 in the column were never read; recording
    them as READED would report a consumption drop that never happened.
  """
  measure = db.query(Measure).filter(Measure.id == measure_id).first()
  if measure is None:
    print(f"\n[ERROR] No existe una medición con id={measure_id}")
    return

  df = pd.read_csv(path)
  for column in (meter_column, reading_column):
    if column not in df.columns:
      print(f"\n[ERROR] La columna '{column}' no está en {path}")
      print(f"        Columnas disponibles: {list(df.columns)}")
      return

  # The same rule the API applies when it generates the empty readings, so a
  # seeded measure bills exactly like one filled from the app.
  previous_readings = get_previous_readings_by_meter(db=db, measure=measure)

  meters_by_code = {meter.meter_code: meter for meter in db.query(NeighborMeter).all()}
  existing_readings = {
    reading.meter_id: reading
    for reading in db.query(MeterReading).filter(MeterReading.measure_id == measure.id).all()
  }

  total_rows = len(df)
  created_count = 0
  updated_count = 0
  unread_count = 0
  unmatched: list[str] = []

  print(f"\n[INFO] Cargando '{reading_column}' en la medición {measure.id} "
        f"(periodo: {measure.period}) desde: {path}")
  print(f"[INFO] {total_rows} filas | baseline={baseline} | zero_as_unread={zero_as_unread}")

  for idx, (_, row) in enumerate(df.iterrows(), start=1):
    meter_code = str(row[meter_column]).strip()
    meter = meters_by_code.get(meter_code)

    if meter is None:
      unmatched.append(meter_code)
      print(f"  [{idx}/{total_rows}] Medidor '{meter_code}' no registrado, se omite")
      continue

    value = _parse_reading(row[reading_column])
    current_reading = value if value is not None else 0
    is_read = value is not None and not (zero_as_unread and value == 0)
    status = MeterReadingStatus.READED if is_read else MeterReadingStatus.UNREAD
    if not is_read:
      unread_count += 1

    previous_reading = (
      current_reading if baseline
      else previous_readings.get(meter.id, meter.initial_reading or 0)
    )

    reading = existing_readings.get(meter.id)
    if reading is None:
      reading = MeterReading(measure_id=measure.id, meter_id=meter.id)
      db.add(reading)
      created_count += 1
      action = 'creada'
    else:
      updated_count += 1
      action = 'actualizada'

    reading.current_reading = current_reading
    reading.previous_reading = previous_reading
    reading.status = status

    print(f"  [{idx}/{total_rows}] {meter_code}: {previous_reading} -> {current_reading} "
          f"({status.value}) [{action}]")

  # A single commit for the whole batch: committing inside the loop expires
  # every instance already added and leaves them without loaded attributes.
  db.commit()

  # Having actual readings is what moves a measure out of CREATED, the same way
  # filling the first one from the app does.
  if measure.status == MeasureType.CREATED and (created_count + updated_count) > 0:
    measure.status = MeasureType.IN_PROGRESS
    db.commit()
    print(f"\n[INFO] Medición {measure.id} pasó a {measure.status.value}")

  print(f"\n{'='*50}")
  print(f"RESUMEN DE LECTURAS:")
  print(f"  Medición: {measure.id} ({measure.period})")
  print(f"  Columna leída: {reading_column}")
  print(f"  Total filas del CSV: {total_rows}")
  print(f"  Lecturas creadas: {created_count}")
  print(f"  Lecturas actualizadas: {updated_count}")
  print(f"  Sin lectura (UNREAD): {unread_count}")
  print(f"  Medidores no registrados: {len(unmatched)}")
  if unmatched:
    print(f"    -> {', '.join(unmatched)}")
  print(f"{'='*50}\n")


def create_system_users()->None:
### create system admyn's users
  password = hash_password(b'qwerty').decode('utf-8')
  users = [
    User(username="sergio.cardenas", first_name="sergio", last_name="cardenas", password_hash=password, role=UserType.ADMIN), 
    User(username="miriam.lucana", first_name="miriam", last_name="lucana", password_hash=password, role=UserType.ADMIN), 
    User(username="reynaldo.perez", first_name="reynaldo", last_name="perez", password_hash=password, role=UserType.ADMIN)
  ]
  print(f"\n[INFO] Creando {len(users)} usuarios del sistema...")
  for user in users:
    db.add(user)
    print(f"  -> Usuario creado: {user.username} ({user.role})")

  db.commit()
  # db.refresh()
  print(f"\n[OK] Usuarios creados exitosamente: {len(users)}" )

if __name__ == "__main__":
  # Already loaded: meter_code is unique, so running these against a populated
  # database raises IntegrityError. Uncomment them only on an empty one.
  # create_neighbors(path='data/vecinos_of.csv')
  # create_system_users()

  # First campaign of the year: the column holds the accumulated index of each
  # meter, so it is loaded as a baseline (no consumption billed).
  seed_meter_readings(
    measure_id=1,
    path='data/vecinos_of.csv',
    reading_column='LEC. 05/01/25',
    baseline=True,
  )
