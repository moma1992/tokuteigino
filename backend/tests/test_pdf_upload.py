"""
Tests for PDF upload functionality - TDD approach
"""
import pytest
import io
import os
from unittest.mock import Mock, patch, AsyncMock
from app.models import ProcessingStatus, UploadResponse, ErrorResponse


class TestPDFUpload:
    """Test cases for PDF upload functionality"""
    
    def test_upload_pdf_success(self, client, sample_pdf_bytes, mock_teacher_user, mock_supabase_client):
        """Test successful PDF upload"""
        with patch('app.routers.materials.get_current_user') as mock_get_user, \
             patch('app.database.get_authenticated_client') as mock_get_client:
            
            # Mock authentication
            mock_get_user.return_value = mock_teacher_user
            mock_get_client.return_value = mock_supabase_client
            
            # Mock successful upload result
            mock_supabase_client.table.return_value.insert.return_value.execute.return_value.data = [{
                "id": "material-123",
                "title": "Test Material",
                "processing_status": "pending"
            }]
            
            # Create test file
            files = {
                "file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")
            }
            data = {
                "title": "Test Material",
                "description": "A test PDF material"
            }
            
            response = client.post(
                "/api/v1/materials/upload",
                files=files,
                data=data,
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 201
            response_data = response.json()
            assert response_data["title"] == "Test Material"
            assert response_data["processing_status"] == "pending"
            assert "material_id" in response_data
    
    def test_upload_pdf_without_auth(self, client, sample_pdf_bytes):
        """Test PDF upload without authentication should fail"""
        files = {
            "file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")
        }
        data = {"title": "Test Material"}
        
        response = client.post("/api/v1/materials/upload", files=files, data=data)
        
        assert response.status_code == 403
        assert "credentials" in response.json()["detail"].lower()
    
    def test_upload_non_pdf_file(self, client, mock_teacher_user):
        """Test upload of non-PDF file should fail"""
        with patch('app.routers.materials.get_current_user') as mock_get_user:
            mock_get_user.return_value = mock_teacher_user
            
            # Create non-PDF file
            files = {
                "file": ("test.txt", io.BytesIO(b"This is not a PDF"), "text/plain")
            }
            data = {"title": "Test Material"}
            
            response = client.post(
                "/api/v1/materials/upload",
                files=files,
                data=data,
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 400
            assert "pdf" in response.json()["detail"].lower()
    
    def test_upload_oversized_file(self, client, mock_auth_user):
        """Test upload of oversized file should fail"""
        with patch('app.database.get_authenticated_client') as mock_client:
            mock_supabase = Mock()
            mock_client.return_value = mock_supabase
            mock_supabase.auth.get_user.return_value.user = mock_auth_user
            
            # Create oversized file (52MB)
            oversized_content = b"x" * (52 * 1024 * 1024)
            files = {
                "file": ("huge.pdf", io.BytesIO(oversized_content), "application/pdf")
            }
            data = {"title": "Huge Material"}
            
            response = client.post(
                "/api/v1/materials/upload",
                files=files,
                data=data,
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 400
            assert "size" in response.json()["error"].lower()
    
    def test_upload_empty_file(self, client, mock_auth_user):
        """Test upload of empty file should fail"""
        with patch('app.database.get_authenticated_client') as mock_client:
            mock_supabase = Mock()
            mock_client.return_value = mock_supabase
            mock_supabase.auth.get_user.return_value.user = mock_auth_user
            
            files = {
                "file": ("empty.pdf", io.BytesIO(b""), "application/pdf")
            }
            data = {"title": "Empty Material"}
            
            response = client.post(
                "/api/v1/materials/upload",
                files=files,
                data=data,
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 400
            assert "empty" in response.json()["error"].lower()
    
    def test_upload_without_title(self, client, sample_pdf_bytes, mock_auth_user):
        """Test upload without title should fail"""
        with patch('app.database.get_authenticated_client') as mock_client:
            mock_supabase = Mock()
            mock_client.return_value = mock_supabase
            mock_supabase.auth.get_user.return_value.user = mock_auth_user
            
            files = {
                "file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")
            }
            # No title provided
            data = {"description": "A test PDF material"}
            
            response = client.post(
                "/api/v1/materials/upload",
                files=files,
                data=data,
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 422
            assert "title" in response.json()["detail"][0]["field"]
    
    def test_upload_student_role_denied(self, client, sample_pdf_bytes):
        """Test that students cannot upload materials"""
        student_user = Mock()
        student_user.id = "student-123"
        student_user.email = "student@test.com"
        student_user.user_metadata = {
            "id": "student-123",
            "email": "student@test.com",
            "role": "student",
            "full_name": "Test Student"
        }
        
        with patch('app.routers.materials.get_current_user') as mock_get_user:
            mock_get_user.return_value = student_user
            
            files = {
                "file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")
            }
            data = {"title": "Test Material"}
            
            response = client.post(
                "/api/v1/materials/upload",
                files=files,
                data=data,
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 403
            assert "teacher" in response.json()["detail"].lower()
    
    def test_upload_storage_failure(self, client, sample_pdf_bytes, mock_auth_user):
        """Test handling of storage upload failure"""
        with patch('app.database.get_authenticated_client') as mock_client:
            mock_supabase = Mock()
            mock_client.return_value = mock_supabase
            mock_supabase.auth.get_user.return_value.user = mock_auth_user
            
            # Mock storage upload failure
            mock_supabase.storage.from_.return_value.upload.side_effect = Exception("Storage error")
            
            files = {
                "file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")
            }
            data = {"title": "Test Material"}
            
            response = client.post(
                "/api/v1/materials/upload",
                files=files,
                data=data,
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 500
            assert "storage" in response.json()["error"].lower()
    
    def test_upload_database_failure(self, client, sample_pdf_bytes, mock_auth_user):
        """Test handling of database insert failure"""
        with patch('app.database.get_authenticated_client') as mock_client:
            mock_supabase = Mock()
            mock_client.return_value = mock_supabase
            mock_supabase.auth.get_user.return_value.user = mock_auth_user
            
            # Mock successful storage upload
            mock_supabase.storage.from_.return_value.upload.return_value = {
                "path": "learning_materials/teacher-123/test.pdf"
            }
            
            # Mock database insert failure
            mock_supabase.table.return_value.insert.return_value.execute.side_effect = Exception("DB error")
            
            files = {
                "file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")
            }
            data = {"title": "Test Material"}
            
            response = client.post(
                "/api/v1/materials/upload",
                files=files,
                data=data,
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 500
            assert "database" in response.json()["error"].lower()


class TestProcessingStatus:
    """Test cases for processing status endpoint"""
    
    def test_get_processing_status_success(self, client, mock_auth_user):
        """Test successful processing status retrieval"""
        with patch('app.database.get_authenticated_client') as mock_client:
            mock_supabase = Mock()
            mock_client.return_value = mock_supabase
            mock_supabase.auth.get_user.return_value.user = mock_auth_user
            
            # Mock database query
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{
                "id": "material-123",
                "processing_status": "processing",
                "error_message": None
            }]
            
            response = client.get(
                "/api/v1/materials/material-123/status",
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 200
            assert response.json()["status"] == "processing"
    
    def test_get_processing_status_not_found(self, client, mock_auth_user):
        """Test processing status for non-existent material"""
        with patch('app.database.get_authenticated_client') as mock_client:
            mock_supabase = Mock()
            mock_client.return_value = mock_supabase
            mock_supabase.auth.get_user.return_value.user = mock_auth_user
            
            # Mock empty database result
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
            
            response = client.get(
                "/api/v1/materials/nonexistent/status",
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 404
    
    def test_get_processing_status_unauthorized(self, client):
        """Test processing status without authentication"""
        response = client.get("/api/v1/materials/material-123/status")
        
        assert response.status_code == 401