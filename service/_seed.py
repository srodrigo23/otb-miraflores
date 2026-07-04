from sqlalchemy.orm import sessionmaker
import sqlalchemy

from app.models import Neighbor
from app.models import User
from app.models import NeighborMeter

from app.enums import UserType

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
  for _, row in df.iterrows():
    nombres = str(row['Nombres']).strip() if pd.notna(row['Nombres']) else ''
    apellido_paterno = str(row['Apellido Paterno']).strip() if pd.notna(row['Apellido Paterno']) else ''
    apellido_materno = str(row['Apellido Materno']).strip() if pd.notna(row['Apellido Materno']) else ''
    last_name = f"{apellido_paterno} {apellido_materno}".strip()

    nombre_parts = nombres.split() if nombres else ['']
    first_name = nombre_parts[0] if len(nombre_parts) > 0 else ''
    second_name = ' '.join(nombre_parts[1:]) if len(nombre_parts) > 1 else ''
    
    meter_code = str(row['Cod. medidor'])
    section = str(row['Seccion'])
    
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
      
      meter = NeighborMeter(
        neighbor_id=neighbor.id,
        meter_code = meter_code,
        section = section
      )
      db.add(meter)
      db.commit()
      db.refresh(meter)
      
    else: 
      meter = NeighborMeter(
        neighbor_id=neighbor_exist[0].id,
        meter_code = meter_code,
        section = section
      )
      db.add(meter)
      db.commit()
      db.refresh(meter)

  # print(f"\nTotal de vecinos agregados: {len(df)}")


def create_system_users()->None:
### create system admyn's users
  password = hash_password(b'qwerty').decode('utf-8')
  users = [
    User(username="sergio.cardenas", first_name="sergio", last_name="cardenas", password_hash=password, role=UserType.ADMIN), 
    User(username="miriam.lucana", first_name="miriam", last_name="lucana", password_hash=password, role=UserType.ADMIN), 
    User(username="reynaldo.perez", first_name="reynaldo", last_name="perez", password_hash=password, role=UserType.ADMIN)
  ]
  [db.add(user) for user in users ]

  db.commit()
  # db.refresh()
  print(f"Usuarios creados: {len(users)}" )
create_neighbors(path='data/vecinos_of.csv')
create_system_users()
