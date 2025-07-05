"""
Database connection and utilities for TOKUTEI Learning API
"""
import os
from typing import Optional
from supabase import create_client, Client
from functools import lru_cache


@lru_cache()
def get_supabase_client() -> Client:
    """
    Get Supabase client instance with connection pooling
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_anon_key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set"
        )
    
    return create_client(supabase_url, supabase_anon_key)


def get_authenticated_client(jwt_token: str) -> Client:
    """
    Get Supabase client with user authentication
    """
    client = get_supabase_client()
    client.auth.set_session_from_url(jwt_token)
    return client


class DatabaseError(Exception):
    """Custom exception for database operations"""
    pass


class NotFoundError(DatabaseError):
    """Exception raised when a resource is not found"""
    pass


class UnauthorizedError(DatabaseError):
    """Exception raised when user is not authorized"""
    pass


class ValidationError(DatabaseError):
    """Exception raised when data validation fails"""
    pass