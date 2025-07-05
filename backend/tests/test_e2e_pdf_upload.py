"""
End-to-end integration test for PDF upload functionality
"""
import pytest
import io
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient


class TestPDFUploadE2E:
    """End-to-end tests for PDF upload workflow"""
    
    @patch('supabase.create_client')
    @patch('app.routers.materials.require_teacher_role')
    def test_complete_pdf_upload_workflow(self, mock_require_teacher, mock_create_client, client, mock_teacher_user, mock_supabase_client, sample_pdf_bytes):
        """Test complete PDF upload workflow from upload to text extraction"""
        # Set up mocks for Supabase client creation
        mock_create_client.return_value = mock_supabase_client
        # Ensure mock_teacher_user has access_token
        mock_teacher_user.access_token = "mock-jwt-token"
        mock_require_teacher.return_value = mock_teacher_user
        
        # Mock auth.get_user() response
        mock_auth_response = Mock()
        mock_auth_response.user = mock_teacher_user
        mock_supabase_client.auth.get_user.return_value = mock_auth_response
        
        # Mock profile response (for authentication)
        mock_profile_response = Mock()
        mock_profile_response.data = [mock_teacher_user.user_metadata]
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            mock_profile_response,  # First call for user profile
        ]
        
        # Mock storage upload response
        mock_supabase_client.storage.from_.return_value.upload.return_value = {
            "path": "test/path/file.pdf"
        }
        
        # Mock database insert response
        mock_insert_response = Mock()
        mock_insert_response.data = [{
            "id": "material-123",
            "teacher_id": "teacher-123",
            "title": "Test PDF Upload",
            "description": "E2E test file",
            "file_path": "test/path/file.pdf",
            "file_size": len(sample_pdf_bytes),
            "file_type": "application/pdf",
            "processed_text": "Hello World",  # Extracted from sample PDF
            "processing_status": "completed",
            "error_message": None,
            "metadata": {"pages": 1},
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }]
        mock_supabase_client.table.return_value.insert.return_value.execute.return_value = mock_insert_response
        
        # Perform PDF upload
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}
        data = {
            "title": "Test PDF Upload",
            "description": "E2E test file"
        }
        
        response = client.post(
            "/api/v1/materials/upload",
            files=files,
            data=data,
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        # Debug response if not 200
        if response.status_code != 200:
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
        
        # Verify upload response
        assert response.status_code == 200
        upload_data = response.json()
        assert upload_data["material_id"] == "material-123"
        assert upload_data["status"] == "completed"
        assert upload_data["file_size"] == len(sample_pdf_bytes)
        assert upload_data["extracted_text"] == "Hello World"
        assert upload_data["metadata"]["pages"] == 1
    
    @patch('app.database.get_supabase_client')
    @patch('app.database.get_authenticated_client')
    @patch('app.routers.materials.require_teacher_role')
    def test_pdf_upload_then_retrieve_workflow(self, mock_require_teacher, mock_get_auth_client, mock_get_client, client, mock_teacher_user, mock_supabase_client, sample_pdf_bytes):
        """Test uploading PDF then retrieving it via API"""
        # Set up mocks for Supabase client creation
        mock_get_client.return_value = mock_supabase_client
        mock_get_auth_client.return_value = mock_supabase_client
        
        # Mock auth.get_user() response
        mock_auth_response = Mock()
        mock_auth_response.user = mock_teacher_user
        mock_supabase_client.auth.get_user.return_value = mock_auth_response
        
        # Mock profile response (for authentication)
        mock_profile_response = Mock()
        mock_profile_response.data = [mock_teacher_user.user_metadata]
        
        # Mock material response (for retrieval)
        mock_material_response = Mock()
        mock_material_response.data = [{
            "id": "material-123",
            "teacher_id": "teacher-123",
            "title": "Test PDF Upload",
            "description": "E2E test file",
            "file_path": "test/path/file.pdf",
            "file_size": len(sample_pdf_bytes),
            "file_type": "application/pdf",
            "processed_text": "Hello World",
            "processing_status": "completed",
            "error_message": None,
            "metadata": {"pages": 1},
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }]
        
        # Set up sequence of database calls
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            mock_profile_response,  # First call for authentication
            mock_material_response,  # Second call for material retrieval
        ]
        
        # Mock storage upload
        mock_supabase_client.storage.from_.return_value.upload.return_value = {"path": "test/path/file.pdf"}
        
        # Mock database insert
        mock_insert_response = Mock()
        mock_insert_response.data = [mock_material_response.data[0]]
        mock_supabase_client.table.return_value.insert.return_value.execute.return_value = mock_insert_response
        
        # Step 1: Upload PDF
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}
        data = {"title": "Test PDF Upload", "description": "E2E test file"}
        
        upload_response = client.post(
            "/api/v1/materials/upload",
            files=files,
            data=data,
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        material_id = upload_data["material_id"]
        
        # Step 2: Retrieve uploaded material
        retrieve_response = client.get(
            f"/api/v1/materials/{material_id}",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert retrieve_response.status_code == 200
        retrieve_data = retrieve_response.json()
        assert retrieve_data["id"] == material_id
        assert retrieve_data["title"] == "Test PDF Upload"
        assert retrieve_data["processed_text"] == "Hello World"
        assert retrieve_data["processing_status"] == "completed"
    
    @patch('app.database.get_supabase_client')
    @patch('app.database.get_authenticated_client')
    @patch('app.routers.materials.require_teacher_role')
    def test_pdf_upload_processing_status_workflow(self, mock_require_teacher, mock_get_auth_client, mock_get_client, client, mock_teacher_user, mock_supabase_client, sample_pdf_bytes):
        """Test PDF upload with processing status tracking"""
        # Set up mocks for Supabase client creation
        mock_get_client.return_value = mock_supabase_client
        mock_get_auth_client.return_value = mock_supabase_client
        
        # Mock auth.get_user() response
        mock_auth_response = Mock()
        mock_auth_response.user = mock_teacher_user
        mock_supabase_client.auth.get_user.return_value = mock_auth_response
        
        # Mock profile response (for authentication)
        mock_profile_response = Mock()
        mock_profile_response.data = [mock_teacher_user.user_metadata]
        
        # Mock status response (for status check)
        mock_status_response = Mock()
        mock_status_response.data = [{
            "id": "material-123",
            "processing_status": "processing",
            "error_message": None,
            "teacher_id": "teacher-123"
        }]
        
        # Set up sequence of database calls
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            mock_profile_response,  # First call for authentication
            mock_status_response,   # Second call for status check
        ]
        
        # Mock storage upload
        mock_supabase_client.storage.from_.return_value.upload.return_value = {"path": "test/path/file.pdf"}
        
        # Mock database insert with processing status
        mock_insert_response = Mock()
        mock_insert_response.data = [{
            "id": "material-123",
            "teacher_id": "teacher-123",
            "title": "Test PDF Upload",
            "description": "E2E test file",
            "file_path": "test/path/file.pdf",
            "file_size": len(sample_pdf_bytes),
            "file_type": "application/pdf",
            "processed_text": "",
            "processing_status": "processing",
            "error_message": None,
            "metadata": {},
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }]
        mock_supabase_client.table.return_value.insert.return_value.execute.return_value = mock_insert_response
        
        # Step 1: Upload PDF
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}
        data = {"title": "Test PDF Upload", "description": "E2E test file"}
        
        upload_response = client.post(
            "/api/v1/materials/upload",
            files=files,
            data=data,
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        material_id = upload_data["material_id"]
        
        # Step 2: Check processing status
        status_response = client.get(
            f"/api/v1/materials/{material_id}/status",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert status_response.status_code == 200
        status_data = status_response.json()
        assert status_data["material_id"] == material_id
        assert status_data["status"] == "processing"
        assert status_data["error_message"] is None
    
    @patch('app.database.get_supabase_client')
    @patch('app.database.get_authenticated_client')
    @patch('app.routers.materials.require_teacher_role')
    def test_pdf_upload_list_workflow(self, mock_require_teacher, mock_get_auth_client, mock_get_client, client, mock_teacher_user, mock_supabase_client, sample_pdf_bytes):
        """Test uploading PDF then listing materials"""
        # Set up mocks for Supabase client creation
        mock_get_client.return_value = mock_supabase_client
        mock_get_auth_client.return_value = mock_supabase_client
        
        # Mock auth.get_user() response
        mock_auth_response = Mock()
        mock_auth_response.user = mock_teacher_user
        mock_supabase_client.auth.get_user.return_value = mock_auth_response
        
        # Mock profile response (for authentication)
        mock_profile_response = Mock()
        mock_profile_response.data = [mock_teacher_user.user_metadata]
        
        # Mock list response (with uploaded material)
        mock_list_response = Mock()
        mock_list_response.data = [{
            "id": "material-123",
            "teacher_id": "teacher-123",
            "title": "Test PDF Upload",
            "description": "E2E test file",
            "file_path": "test/path/file.pdf",
            "file_size": len(sample_pdf_bytes),
            "file_type": "application/pdf",
            "processed_text": "Hello World",
            "processing_status": "completed",
            "error_message": None,
            "metadata": {"pages": 1},
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }]
        mock_list_response.count = 1
        
        # Set up sequence of database calls
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            mock_profile_response,  # First call for authentication (upload)
            mock_profile_response,  # Second call for authentication (list)
        ]
        
        # Mock the list query chain
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.range.return_value.order.return_value.execute.return_value = mock_list_response
        
        # Mock storage upload
        mock_supabase_client.storage.from_.return_value.upload.return_value = {"path": "test/path/file.pdf"}
        
        # Mock database insert
        mock_insert_response = Mock()
        mock_insert_response.data = [mock_list_response.data[0]]
        mock_supabase_client.table.return_value.insert.return_value.execute.return_value = mock_insert_response
        
        # Step 1: Upload PDF
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}
        data = {"title": "Test PDF Upload", "description": "E2E test file"}
        
        upload_response = client.post(
            "/api/v1/materials/upload",
            files=files,
            data=data,
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert upload_response.status_code == 200
        
        # Step 2: List materials
        list_response = client.get(
            "/api/v1/materials/",
            headers={"Authorization": "Bearer mock-jwt-token"}
        )
        
        assert list_response.status_code == 200
        list_data = list_response.json()
        assert list_data["total"] == 1
        assert len(list_data["items"]) == 1
        assert list_data["items"][0]["title"] == "Test PDF Upload"
        assert list_data["items"][0]["processing_status"] == "completed"