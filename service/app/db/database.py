from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, declared_attr

from app.core.settings import settings

DATABASE_URL = settings.DB_URL_SUPABASE if settings.ENVIRONMENT == "PRODUCTION" else settings.DB_URL_SQLITE 

engine = create_engine(
  DATABASE_URL,  
  # connect_args={"check_same_thread": True} # only for sqlite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class BaseModel:
  def __repr__(self):
    cols = []
    for c in self.__table__.columns:
      val = getattr(self, c.name, None)
      cols.append(f"{c.name}={val!r}")
    return f"{self.__class__.__name__}({', '.join(cols)})"

Base = declarative_base(cls=BaseModel)

def get_db():
  db = SessionLocal()
  try:
      yield db
  finally:
      db.close()
