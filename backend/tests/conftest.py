"""
Shared test configuration and fixtures
"""
import pytest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """Create a test client"""
    from main import app
    return TestClient(app)


@pytest.fixture
def authenticated_client(mock_teacher_user):
    """Create a test client with mocked authentication"""
    from main import app
    from app.routers.materials import get_current_user
    
    # Override the dependency
    app.dependency_overrides[get_current_user] = lambda: mock_teacher_user
    
    client = TestClient(app)
    yield client
    
    # Clean up
    app.dependency_overrides = {}


@pytest.fixture
def mock_teacher_user():
    """Mock authenticated teacher user"""
    user = Mock()
    user.id = "teacher-123"
    user.email = "teacher@test.com"
    user.user_metadata = {
        "id": "teacher-123",
        "email": "teacher@test.com",
        "role": "teacher",
        "full_name": "Test Teacher"
    }
    user.access_token = "mock-jwt-token"
    return user


@pytest.fixture
def mock_student_user():
    """Mock authenticated student user"""
    user = Mock()
    user.id = "student-123"
    user.email = "student@test.com"
    user.user_metadata = {
        "id": "student-123",
        "email": "student@test.com",
        "role": "student",
        "full_name": "Test Student"
    }
    user.access_token = "mock-jwt-token"
    return user


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client with all common operations"""
    mock_client = Mock()
    
    # Mock storage operations
    mock_storage = Mock()
    mock_client.storage.from_.return_value = mock_storage
    mock_storage.upload.return_value = {"path": "test/path"}
    mock_storage.remove.return_value = True
    
    # Mock database operations
    mock_table = Mock()
    mock_client.table.return_value = mock_table
    
    # Mock chained operations
    mock_execute = Mock()
    mock_execute.data = []
    mock_execute.count = 0
    
    mock_table.insert.return_value.execute.return_value = mock_execute
    mock_table.select.return_value.eq.return_value.execute.return_value = mock_execute
    mock_table.update.return_value.eq.return_value.execute.return_value = mock_execute
    mock_table.delete.return_value.eq.return_value.execute.return_value = mock_execute
    mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = mock_execute
    
    return mock_client


@pytest.fixture 
def sample_pdf_bytes():
    """Sample PDF content for testing"""
    return b"""%PDF-1.4
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