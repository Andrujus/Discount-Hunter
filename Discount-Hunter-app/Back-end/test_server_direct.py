#!/usr/bin/env python3
"""Direct test of FastAPI app without uvicorn."""

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

# Test health endpoint
print("Testing /healthz...")
response = client.get("/healthz")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}\n")

# Test registration
print("Testing /api/auth/register...")
register_payload = {
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "password123"
}
response = client.post("/api/auth/register", json=register_payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}\n")

# Test login
print("Testing /api/auth/login...")
login_payload = {
    "email": "test@example.com",
    "password": "password123"
}
response = client.post("/api/auth/login", json=login_payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}\n")

print("All tests completed!")
