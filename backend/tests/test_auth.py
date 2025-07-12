import pytest
from fastapi.testclient import TestClient

def test_register_user(client: TestClient):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "New User",
            "email": "new@example.com",
            "password": "newpassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User registered successfully"
    assert "user_id" in data

def test_register_duplicate_email(client: TestClient, test_user):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Another User",
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_login_success(client: TestClient, test_user):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Login successful"
    assert "user_id" in data

def test_login_invalid_credentials(client: TestClient, test_user):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_login_nonexistent_user(client: TestClient):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_logout(client: TestClient, test_user):
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword"
        }
    )
    assert login_response.status_code == 200
    
    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 200
    assert logout_response.json()["message"] == "Logged out successfully"