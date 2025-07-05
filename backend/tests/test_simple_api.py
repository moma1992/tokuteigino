"""
Simple API tests to verify basic endpoint functionality
"""
import pytest
from unittest.mock import Mock, patch


class TestMaterialsAPI:
    """Simple tests for materials API endpoints"""
    
    def test_list_materials_teacher_success(self, client, mock_teacher_user, mock_supabase_client):
        """Test listing materials for teacher"""
        with patch('app.routers.materials.get_current_user', return_value=mock_teacher_user), \
             patch('app.database.get_authenticated_client', return_value=mock_supabase_client):
            
            # Mock database response
            mock_supabase_client.table.return_value.select.return_value.eq.return_value.range.return_value.order.return_value.execute.return_value.data = []
            mock_supabase_client.table.return_value.select.return_value.eq.return_value.range.return_value.order.return_value.execute.return_value.count = 0
            
            response = client.get(
                "/api/v1/materials/",
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 200
            response_data = response.json()
            assert "items" in response_data
            assert "total" in response_data
            assert "page" in response_data
            assert response_data["total"] == 0
    
    def test_get_material_not_found(self, client, mock_teacher_user, mock_supabase_client):
        """Test getting non-existent material"""
        with patch('app.routers.materials.get_current_user', return_value=mock_teacher_user), \
             patch('app.database.get_authenticated_client', return_value=mock_supabase_client):
            
            # Mock empty database response
            mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
            
            response = client.get(
                "/api/v1/materials/nonexistent-id",
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 404
    
    def test_get_processing_status_not_found(self, client, mock_teacher_user, mock_supabase_client):
        """Test getting processing status for non-existent material"""
        with patch('app.routers.materials.get_current_user', return_value=mock_teacher_user), \
             patch('app.database.get_authenticated_client', return_value=mock_supabase_client):
            
            # Mock empty database response
            mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
            
            response = client.get(
                "/api/v1/materials/nonexistent-id/status",
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 404
    
    def test_list_materials_pagination(self, client, mock_teacher_user, mock_supabase_client):
        """Test materials list with pagination parameters"""
        with patch('app.routers.materials.get_current_user', return_value=mock_teacher_user), \
             patch('app.database.get_authenticated_client', return_value=mock_supabase_client):
            
            # Mock database response
            mock_supabase_client.table.return_value.select.return_value.eq.return_value.range.return_value.order.return_value.execute.return_value.data = []
            mock_supabase_client.table.return_value.select.return_value.eq.return_value.range.return_value.order.return_value.execute.return_value.count = 0
            
            response = client.get(
                "/api/v1/materials/?page=2&size=10",
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 200
            response_data = response.json()
            assert response_data["page"] == 2
            assert response_data["size"] == 10
    
    def test_list_materials_invalid_pagination(self, client, mock_teacher_user):
        """Test materials list with invalid pagination parameters"""
        with patch('app.routers.materials.get_current_user', return_value=mock_teacher_user):
            
            # Test invalid page
            response = client.get(
                "/api/v1/materials/?page=0",
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            assert response.status_code == 400
            
            # Test invalid size
            response = client.get(
                "/api/v1/materials/?size=200",
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            assert response.status_code == 400
    
    def test_update_material_not_found(self, client, mock_teacher_user, mock_supabase_client):
        """Test updating non-existent material"""
        with patch('app.routers.materials.get_current_user', return_value=mock_teacher_user), \
             patch('app.database.get_authenticated_client', return_value=mock_supabase_client):
            
            # Mock empty database response
            mock_supabase_client.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
            
            response = client.put(
                "/api/v1/materials/nonexistent-id",
                json={"title": "Updated Title"},
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 404
    
    def test_delete_material_not_found(self, client, mock_teacher_user, mock_supabase_client):
        """Test deleting non-existent material"""
        with patch('app.routers.materials.get_current_user', return_value=mock_teacher_user), \
             patch('app.database.get_authenticated_client', return_value=mock_supabase_client):
            
            # Mock empty database response
            mock_supabase_client.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
            
            response = client.delete(
                "/api/v1/materials/nonexistent-id",
                headers={"Authorization": "Bearer mock-jwt-token"}
            )
            
            assert response.status_code == 404


class TestAuthenticationEndpoints:
    """Test authentication requirements for endpoints"""
    
    def test_list_materials_without_auth(self, client):
        """Test listing materials without authentication"""
        response = client.get("/api/v1/materials/")
        assert response.status_code == 403
    
    def test_get_material_without_auth(self, client):
        """Test getting material without authentication"""
        response = client.get("/api/v1/materials/some-id")
        assert response.status_code == 403
    
    def test_update_material_without_auth(self, client):
        """Test updating material without authentication"""
        response = client.put(
            "/api/v1/materials/some-id",
            json={"title": "Updated Title"}
        )
        assert response.status_code == 403
    
    def test_delete_material_without_auth(self, client):
        """Test deleting material without authentication"""
        response = client.delete("/api/v1/materials/some-id")
        assert response.status_code == 403