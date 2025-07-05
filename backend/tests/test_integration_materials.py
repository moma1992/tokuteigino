"""
Integration tests for materials API with proper dependency overrides
"""
import pytest
import io
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from app.models import ProcessingStatus


class TestMaterialsIntegration:
    """Integration tests for materials API endpoints"""
    
    @pytest.fixture
    def app_with_overrides(self, mock_teacher_user, mock_supabase_client):
        """Create app with dependency overrides for testing"""
        from main import app
        from app.routers.materials import get_current_user
        from app.database import get_authenticated_client, get_supabase_client
        
        # Override dependencies
        app.dependency_overrides[get_current_user] = lambda: mock_teacher_user
        app.dependency_overrides[get_authenticated_client] = lambda token: mock_supabase_client
        app.dependency_overrides[get_supabase_client] = lambda: mock_supabase_client
        
        yield app
        
        # Clean up
        app.dependency_overrides = {}
    
    @pytest.fixture
    def client_with_auth(self, app_with_overrides):
        """Create authenticated test client"""
        return TestClient(app_with_overrides)
    
    @patch('app.database.get_supabase_client')
    @patch('app.database.get_authenticated_client')
    def test_list_materials_empty(self, mock_get_auth_client, mock_get_client, client, mock_teacher_user, mock_supabase_client):
        """Test listing empty materials"""
        # Set up mocks for Supabase client creation
        mock_get_client.return_value = mock_supabase_client
        mock_get_auth_client.return_value = mock_supabase_client
        
        # Mock auth.get_user() response
        mock_auth_response = Mock()
        mock_auth_response.user = mock_teacher_user
        mock_supabase_client.auth.get_user.return_value = mock_auth_response
        
        # Mock profile response first (for authentication)
        mock_profile_response = Mock()
        mock_profile_response.data = [mock_teacher_user.user_metadata]
        
        # Mock empty materials response (for materials listing)
        mock_materials_response = Mock()
        mock_materials_response.data = []
        mock_materials_response.count = 0
        
        # Set up the chain of method calls - return profile first, then materials
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            mock_profile_response,  # First call for user profile
        ]
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.range.return_value.order.return_value.execute.return_value = mock_materials_response
        
        response = client.get(
            "/api/v1/materials/",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        if response.status_code != 200:
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["size"] == 20
    
    @patch('app.database.get_supabase_client')
    @patch('app.database.get_authenticated_client')
    def test_list_materials_with_data(self, mock_get_auth_client, mock_get_client, client, mock_teacher_user, mock_supabase_client):
        """Test listing materials with data"""
        # Set up mocks for Supabase client creation
        mock_get_client.return_value = mock_supabase_client
        mock_get_auth_client.return_value = mock_supabase_client
        
        # Mock auth.get_user() response
        mock_auth_response = Mock()
        mock_auth_response.user = mock_teacher_user
        mock_supabase_client.auth.get_user.return_value = mock_auth_response
        
        # Mock profile response first (for authentication)
        mock_profile_response = Mock()
        mock_profile_response.data = [mock_teacher_user.user_metadata]
        
        # Mock database response with materials
        mock_materials_response = Mock()
        mock_materials_response.data = [{
            "id": "material-1",
            "teacher_id": "teacher-123",
            "title": "Test Material 1",
            "description": "Test description",
            "file_path": "path/to/file1.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "processed_text": "Sample text",
            "processing_status": "completed",
            "error_message": None,
            "metadata": {},
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }]
        mock_materials_response.count = 1
        
        # Set up the chain of method calls - return profile first, then materials
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            mock_profile_response,  # First call for user profile
        ]
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.range.return_value.order.return_value.execute.return_value = mock_materials_response
        
        response = client.get(
            "/api/v1/materials/",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["title"] == "Test Material 1"
        assert data["total"] == 1
    
    def test_get_material_success(self, client_with_auth, mock_supabase_client):
        """Test getting a specific material"""
        # Mock database response
        mock_response = Mock()
        mock_response.data = [{
            "id": "material-1",
            "teacher_id": "teacher-123",
            "title": "Test Material",
            "description": "Test description",
            "file_path": "path/to/file.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "processed_text": "Sample text",
            "processing_status": "completed",
            "error_message": None,
            "metadata": {},
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }]
        
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client_with_auth.get(
            "/api/v1/materials/material-1",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "material-1"
        assert data["title"] == "Test Material"
    
    def test_get_material_not_found(self, client_with_auth, mock_supabase_client):
        """Test getting non-existent material"""
        # Mock empty database response
        mock_response = Mock()
        mock_response.data = []
        
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client_with_auth.get(
            "/api/v1/materials/nonexistent-id",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert response.status_code == 404
    
    def test_get_processing_status_success(self, client_with_auth, mock_supabase_client):
        """Test getting processing status"""
        # Mock database response
        mock_response = Mock()
        mock_response.data = [{
            "id": "material-1",
            "processing_status": "processing",
            "error_message": None,
            "teacher_id": "teacher-123"
        }]
        
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client_with_auth.get(
            "/api/v1/materials/material-1/status",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["material_id"] == "material-1"
        assert data["status"] == "processing"
    
    def test_update_material_success(self, client_with_auth, mock_supabase_client):
        """Test updating a material"""
        # Mock existing material check
        existing_response = Mock()
        existing_response.data = [{
            "id": "material-1",
            "teacher_id": "teacher-123",
            "title": "Old Title"
        }]
        
        # Mock update response
        update_response = Mock()
        update_response.data = [{
            "id": "material-1",
            "teacher_id": "teacher-123",
            "title": "New Title",
            "description": "Updated description",
            "file_path": "path/to/file.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "processed_text": "Sample text",
            "processing_status": "completed",
            "error_message": None,
            "metadata": {},
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }]
        
        # Set up different responses for select and update
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = existing_response
        mock_supabase_client.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = update_response
        
        response = client_with_auth.put(
            "/api/v1/materials/material-1",
            json={"title": "New Title", "description": "Updated description"},
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Title"
        assert data["description"] == "Updated description"
    
    def test_delete_material_success(self, client_with_auth, mock_supabase_client):
        """Test deleting a material"""
        # Mock existing material
        existing_response = Mock()
        existing_response.data = [{
            "id": "material-1",
            "teacher_id": "teacher-123",
            "title": "Test Material",
            "file_path": "path/to/file.pdf"
        }]
        
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = existing_response
        
        # Mock storage and database delete operations
        mock_supabase_client.storage.from_.return_value.remove.return_value = True
        mock_supabase_client.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = Mock()
        
        response = client_with_auth.delete(
            "/api/v1/materials/material-1",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "deleted successfully" in data["message"]
    
    def test_pagination_parameters(self, client_with_auth, mock_supabase_client):
        """Test pagination with different parameters"""
        # Mock database response
        mock_response = Mock()
        mock_response.data = []
        mock_response.count = 0
        
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.range.return_value.order.return_value.execute.return_value = mock_response
        
        # Test custom page and size
        response = client_with_auth.get(
            "/api/v1/materials/?page=2&size=10",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 2
        assert data["size"] == 10
        assert data["pages"] == 0  # No items, so 0 pages
    
    def test_invalid_pagination_parameters(self, client_with_auth):
        """Test invalid pagination parameters"""
        # Test page < 1
        response = client_with_auth.get(
            "/api/v1/materials/?page=0",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        assert response.status_code == 400
        assert "Page must be >= 1" in response.json()["detail"]
        
        # Test size > 100
        response = client_with_auth.get(
            "/api/v1/materials/?size=200",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        assert response.status_code == 400
        assert "Size must be between 1 and 100" in response.json()["detail"]
        
        # Test size < 1
        response = client_with_auth.get(
            "/api/v1/materials/?size=0",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        assert response.status_code == 400
        assert "Size must be between 1 and 100" in response.json()["detail"]


class TestStudentAccess:
    """Test student access to materials"""
    
    @pytest.fixture
    def app_with_student_auth(self, mock_student_user, mock_supabase_client):
        """Create app with student authentication"""
        from main import app
        from app.routers.materials import get_current_user
        from app.database import get_authenticated_client, get_supabase_client
        
        # Override dependencies
        app.dependency_overrides[get_current_user] = lambda: mock_student_user
        app.dependency_overrides[get_authenticated_client] = lambda token: mock_supabase_client
        app.dependency_overrides[get_supabase_client] = lambda: mock_supabase_client
        
        yield app
        
        # Clean up
        app.dependency_overrides = {}
    
    @pytest.fixture
    def student_client(self, app_with_student_auth):
        """Create student test client"""
        return TestClient(app_with_student_auth)
    
    def test_student_list_materials(self, student_client, mock_supabase_client):
        """Test student can list accessible materials"""
        # Mock database response
        mock_response = Mock()
        mock_response.data = []
        mock_response.count = 0
        
        # Mock the query chain for students (more complex with teacher relationships)
        mock_supabase_client.table.return_value.select.return_value.in_.return_value.range.return_value.order.return_value.execute.return_value = mock_response
        
        response = student_client.get(
            "/api/v1/materials/",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0


class TestUnauthorizedAccess:
    """Test unauthorized access attempts"""
    
    def test_list_materials_no_auth(self, client):
        """Test listing materials without authentication"""
        response = client.get("/api/v1/materials/")
        assert response.status_code == 403
        assert "Not authenticated" in response.json()["detail"]
    
    def test_get_material_no_auth(self, client):
        """Test getting material without authentication"""
        response = client.get("/api/v1/materials/some-id")
        assert response.status_code == 403
    
    def test_update_material_no_auth(self, client):
        """Test updating material without authentication"""
        response = client.put(
            "/api/v1/materials/some-id",
            json={"title": "New Title"}
        )
        assert response.status_code == 403
    
    def test_delete_material_no_auth(self, client):
        """Test deleting material without authentication"""
        response = client.delete("/api/v1/materials/some-id")
        assert response.status_code == 403