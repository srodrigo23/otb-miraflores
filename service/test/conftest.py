import os

os.environ["ENVIRONMENT"] = "TEST"
os.environ["DB_URL_SQLITE"] = "sqlite://"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.enums import UserType
from app.main import app
from app.models import User
from app.services.auth import hash_password
from app.services.cookie import COOKIE_NAME
from app.services.jwt import create_access_token

# In-memory SQLite; StaticPool keeps a single connection so every session
# sees the same database
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(bind=engine, autoflush=False)

@pytest.fixture
def db():
    """
    Fresh schema per test: no test can leak data into another.
    """
    Base.metadata.create_all(bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
          
@pytest.fixture
def client(db):
    """
    HTTP client whose routes use the test session instead of the real one.
    """
    app.dependency_overrides[get_db] = lambda: db 
    yield TestClient(app)
    app.dependency_overrides.clear()
    
def _make_user(db, username: str, role: UserType) -> User:
    user = User(
        username=username,
        password_hash=hash_password("secret123"),
        role=role,
    )
    db.add(user)
    db.commit()
    return user

@pytest.fixture
def admin(db):
    return _make_user(db, "admin", UserType.ADMIN)


@pytest.fixture
def collector(db):
    return _make_user(db, "collector", UserType.COLLECTOR)
  
@pytest.fixture
def admin_client(client, admin):
    """Client already logged in as admin, without going through /auth/login."""
    client.cookies.set(COOKIE_NAME, create_access_token({"sub": str(admin.id)}))
    return client

@pytest.fixture
def collector_client(client, collector):
    client.cookies.set(COOKIE_NAME, create_access_token({"sub": str(collector.id)}))
    return client