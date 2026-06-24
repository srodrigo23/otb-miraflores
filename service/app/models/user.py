
import bcrypt
from sqlalchemy import Column, Integer, String, Enum, Boolean
from app.db.database import Base

from ..enums import UserType

class User(Base):
  
  __tablename__ = "users"
  id = Column(Integer, primary_key=True, index=True)
  username = Column(String(64))
  first_name= Column(String, nullable=True, default='')
  last_name= Column(String, nullable=True, default='')
  password_hash = Column(String(128))
  role = Column(Enum(UserType), nullable=False)
  is_active = Column(Boolean, nullable=True, default=True)
  
  def verify_password(self, password:str):
    return bcrypt.checkpw(
      password.encode('utf-8'), 
      self.password_hash.encode('utf-8')
    )
    # return pwhash == self.password_hash
  
  