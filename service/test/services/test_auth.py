
from app.services.auth import hash_password, verify_password

def test_hash_and_verify_roundtrip():
  h = hash_password("secret123")
  assert verify_password("secret123", h) is True
  assert verify_password("wrong", h) is False