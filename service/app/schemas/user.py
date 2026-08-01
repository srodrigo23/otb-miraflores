from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

from ..enums import UserType


class User(BaseModel):
  username:str
  password_hash:str = Field(exclude=True)
  role: UserType
  first_name:str | None=None
  last_name:str | None=None
  is_active: bool

  model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
  username:Optional[str] = None

  first_name: Optional[str] = None
  last_name: Optional[str] = None

  password_hash:Optional[str] = None
  role: Optional[UserType] = None
  is_active:Optional[bool] = None
