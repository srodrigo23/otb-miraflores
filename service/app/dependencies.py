from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.enums import UserType
from app.models.user import User
from app.services.auth import get_user_by_id
from app.services.jwt import decode_token


def get_current_user(
    access_token: str | None = Cookie(default=None), 
    db: Session = Depends(get_db)
) -> User:

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="not authorized"
        )

    payload = decode_token(token=access_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token or expired token",
        )

    user = get_user_by_id(db, user_id=payload["sub"])
    if not user:
        # or not user.is_active
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user


def require_roles(*roles: UserType):
    """
    Returns a dependency that allows only users with one of the given roles
    """

    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene acceso a este recurso",
            )
        return current_user

    return checker
