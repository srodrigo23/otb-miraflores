from pydantic import BaseModel

class LoginSchema(BaseModel):
  username:str
  password:str


class LoginRequest(BaseModel):
  username:str
  password:str
