"""
Simple authentication tests to verify basic functionality
"""
import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException
from app.routers.materials import get_current_user, require_teacher_role
from fastapi.security import HTTPAuthorizationCredentials


def test_get_current_user_success():
    """Test successful user authentication"""
    # Mock credentials
    mock_credentials = Mock()
    mock_credentials.credentials = "valid-jwt-token"
    
    # Mock Supabase responses
    mock_user = Mock()
    mock_user.id = "user-123"
    
    mock_auth_response = Mock()
    mock_auth_response.user = mock_user
    
    mock_profile_response = Mock()
    mock_profile_response.data = [{
        "id": "user-123",
        "email": "user@test.com",
        "role": "teacher",
        "full_name": "Test User"
    }]
    
    mock_supabase = Mock()
    mock_supabase.auth.get_user.return_value = mock_auth_response
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_profile_response
    
    with patch('app.routers.materials.get_authenticated_client', return_value=mock_supabase):
        user = get_current_user(mock_credentials)
        
        assert user.id == "user-123"
        assert user.user_metadata["role"] == "teacher"
        assert user.access_token == "valid-jwt-token"


def test_get_current_user_invalid_token():
    """Test authentication with invalid token"""
    mock_credentials = Mock()
    mock_credentials.credentials = "invalid-token"
    
    mock_supabase = Mock()
    mock_supabase.auth.get_user.side_effect = Exception("Invalid token")
    
    with patch('app.routers.materials.get_authenticated_client', return_value=mock_supabase):
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(mock_credentials)
        
        assert exc_info.value.status_code == 401


def test_require_teacher_role_success():
    """Test teacher role requirement with valid teacher"""
    mock_user = Mock()
    mock_user.user_metadata = {"role": "teacher"}
    
    # Should not raise exception
    result = require_teacher_role(mock_user)
    assert result == mock_user


def test_require_teacher_role_student_denied():
    """Test teacher role requirement with student user"""
    mock_user = Mock()
    mock_user.user_metadata = {"role": "student"}
    
    with pytest.raises(HTTPException) as exc_info:
        require_teacher_role(mock_user)
    
    assert exc_info.value.status_code == 403
    assert "teacher" in exc_info.value.detail.lower()


def test_require_teacher_role_no_role():
    """Test teacher role requirement with user having no role"""
    mock_user = Mock()
    mock_user.user_metadata = {}
    
    with pytest.raises(HTTPException) as exc_info:
        require_teacher_role(mock_user)
    
    assert exc_info.value.status_code == 403