import pytest
from fastapi.testclient import TestClient

def test_get_current_user_unauthorized(client: TestClient):
    response = client.get("/api/users/me")
    assert response.status_code == 401

def test_search_users(client: TestClient, test_user, test_skill):
    test_user.offered_skills.append(test_skill)
    
    response = client.get("/api/users/")
    assert response.status_code == 200
    users = response.json()
    assert len(users) >= 0

def test_search_users_with_filters(client: TestClient, test_user):
    response = client.get("/api/users/?availability=available")
    assert response.status_code == 200
    users = response.json()
    assert len(users) >= 0

def test_get_user_profile_public(client: TestClient, test_user):
    response = client.get(f"/api/users/{test_user.id}")
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["id"] == test_user.id
    assert user_data["name"] == test_user.name
    assert "email" not in user_data

def test_get_user_profile_not_found(client: TestClient):
    response = client.get("/api/users/99999")
    assert response.status_code == 404