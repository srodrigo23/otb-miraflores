
from fastapi import APIRouter, Response, HTTPException, Depends
from sqlalchemy.orm import Session

from app.services.auth import verify_credentials
from app.services.jwt import create_access_token
from app.services.cookie import set_auth_cookie, delete_auth_cookie
from app.dependencies import get_current_user

from ..schemas.auth import LoginSchema
from app.db.database import get_db

from app.schemas import schema

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=schema.User)
def login(credentials: LoginSchema, response: Response, db: Session = Depends(get_db)):
  user = verify_credentials(credentials.username, credentials.password, db)
  if not user:
    raise HTTPException(status_code=401, detail="Invalid Credentials")
  
  token = create_access_token({"sub":str(user.id)})
  set_auth_cookie(response=response, token=token)
  return user

@router.get('/me', response_model=schema.User)
def me(current_user=Depends(get_current_user)):
  return current_user

@router.post('/logout')
def logout(response: Response):
  delete_auth_cookie(response=response)
  return{"logout":True}