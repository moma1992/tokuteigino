"""
Basic endpoint tests to verify the API is working
"""
import pytest


def test_root_endpoint(client):
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "TOKUTEI Learning API is running" in response.json()["message"]


def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_hello_endpoint(client):
    """Test hello endpoint"""
    response = client.get("/api/v1/hello")
    assert response.status_code == 200
    assert "Hello from TOKUTEI Learning API" in response.json()["message"]


def test_openapi_docs(client):
    """Test that OpenAPI docs are accessible"""
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_json(client):
    """Test that OpenAPI JSON schema is accessible"""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    openapi_spec = response.json()
    assert openapi_spec["info"]["title"] == "TOKUTEI Learning API"
    assert "/api/v1/materials/upload" in openapi_spec["paths"]