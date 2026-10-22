import pytest

NEW_NEIGHBOR={"names":"Jhon", "pat_lname":"Doe"}

def test_requires_session(client):
    assert client.get("/neighbors").status_code == 401

def test_collector_cannot_create_neighbor(collector_client):
    response = collector_client.post("/neighbors", json=NEW_NEIGHBOR)
    
    assert response.status_code == 403

def test_admin_creates_neighbor(admin_client):
    response = admin_client.post("/neighbors", json=NEW_NEIGHBOR)
    
    assert response.status_code == 201
    assert response.json()["names"] == "JHON"