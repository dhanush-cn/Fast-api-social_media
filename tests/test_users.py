# tests/test_users.py
import pytest
from jose import jwt
from app.config import settings


def test_create_user(client):
    res = client.post("/users/", json={"email": "hello123@test.com", "password": "password123"})
    assert res.status_code == 201
    new_user = res.json()
    assert new_user["email"] == "hello123@test.com"
    assert "password" not in new_user


def test_login_user(client, test_user):
    res = client.post("/login", data={"username": test_user["email"], "password": test_user["password"]})
    assert res.status_code == 200
    login_res = res.json()
    payload = jwt.decode(login_res["access_token"], settings.secret_key, algorithms=[settings.algorithm])
    assert payload.get("user_id") == test_user["id"]
    assert login_res["token_type"] == "bearer"


@pytest.mark.parametrize(
    "email, password, status_code",
    [
        ("wrongemail@test.com", "password123", 403),
        ("user1@test.com", "wrongpassword", 403),
        ("wrongemail@test.com", "wrongpassword", 403),
        (None, "password123", 422),
        ("user1@test.com", None, 422),
    ],
)
def test_incorrect_login(client, test_user, email, password, status_code):
    res = client.post("/login", data={"username": email, "password": password})
    assert res.status_code == status_code