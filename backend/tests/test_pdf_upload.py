"""
Tests for PDF upload functionality - TDD approach
"""
import pytest
import io
import os
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock
from app.models import ProcessingStatus, UploadResponse, ErrorResponse


@pytest.fixture
def client():
    """Create a test client"""
    from main import app
    return TestClient(app)


@pytest.fixture
def sample_pdf_bytes():
    """Create a sample PDF file content for testing"""
    # Simple PDF content (minimal valid PDF)
    pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Hello World) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000189 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
284
%%EOF"""
    return pdf_content


@pytest.fixture
def mock_auth_user():
    """Mock authenticated user"""
    return {
        "id": "teacher-123",
        "email": "teacher@test.com",
        "role": "teacher"
    }


class TestPDFUpload:
    """Test cases for PDF upload functionality"""
    
    def test_upload_pdf_success(self, client, sample_pdf_bytes, mock_auth_user):
        """Test successful PDF upload"""
        with patch('app.database.get_authenticated_client') as mock_client:
            # Mock Supabase operations
            mock_supabase = Mock()
            mock_client.return_value = mock_supabase
            mock_supabase.auth.get_user.return_value.user = mock_auth_user
            
            # Mock storage upload
            mock_supabase.storage.from_.return_value.upload.return_value = {
                "path": "learning_materials/teacher-123/test.pdf"
            }
            
            # Mock database insert
            mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{
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
        
        assert response.status_code == 401
        assert "authentication" in response.json()["error"].lower()
    
    def test_upload_non_pdf_file(self, client, mock_auth_user):
        """Test upload of non-PDF file should fail"""
        with patch('app.database.get_authenticated_client') as mock_client:
            mock_supabase = Mock()
            mock_client.return_value = mock_supabase
            mock_supabase.auth.get_user.return_value.user = mock_auth_user
            
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
            assert "pdf" in response.json()["error"].lower()
    
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
        student_user = {
            "id": "student-123",
            "email": "student@test.com", 
            "role": "student"
        }
        
        with patch('app.database.get_authenticated_client') as mock_client:
            mock_supabase = Mock()
            mock_client.return_value = mock_supabase
            mock_supabase.auth.get_user.return_value.user = student_user
            
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
            assert "teacher" in response.json()["error"].lower()
    
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