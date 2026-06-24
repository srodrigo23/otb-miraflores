'''
UPDATE ROWS first_name, last_name
'''
from sqlalchemy.orm import sessionmaker, Session
from app.core.settings import settings
import app.schemas.schema as schema
import app.models as models
import sqlalchemy
# from datetime import datetime, timedelta

def get_user_by_id(db:Session, id:int):
  user = db.query(models.User).filter(models.User.id == id).first()
  if not user:
    return None # improve to error management
  return user

engine = sqlalchemy.create_engine(settings.DB_URL_SUPABASE)
from app.db.database import Base
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

users  = [
  {
    "id":4,
    "update":{
      "fn":"SERGIO", 
      "ln":"CARDENAS"
    }
  },
  {
    "id":5,
    "update":{
      "fn":"MIRIAM", 
      "ln":"LUCANA"
    }
  },
  {
    "id":6,
    "update":{
      "fn":"REYNALDO", 
      "ln":"PEREZ"
    }
  },
]

for el in users:
  user = get_user_by_id(db=db, id=el['id'])
  user_to_update = schema.UserUpdate(
    first_name=el['update']['fn'],
    last_name=el['update']['ln'],
    is_active=True
  )

  update_data = user_to_update.model_dump(exclude_unset=True)
  for key, value in update_data.items():
    setattr(user, key, value)
  db.commit()
  db.refresh(user)