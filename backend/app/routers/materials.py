"""
API routes for learning materials management
"""
import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

from app.database import get_authenticated_client, get_supabase_client, NotFoundError, UnauthorizedError, ValidationError
from app.models import (
    LearningMaterialResponse, 
    LearningMaterialListResponse,
    UploadResponse, 
    ProcessingStatusResponse,
    ErrorResponse,
    ProcessingStatus,
    LearningMaterialCreate,
    LearningMaterialUpdate
)
from app.utils import (
    validate_pdf_file, 
    extract_text_from_pdf, 
    chunk_text,
    generate_file_hash,
    sanitize_filename,
    format_file_size,
    PDFProcessingError
)

router = APIRouter(prefix="/api/v1/materials", tags=["Learning Materials"])
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    try:
        client = get_authenticated_client(credentials.credentials)
        user_response = client.auth.get_user()
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        
        # Get user profile from database
        profile_response = client.table("profiles").select("*").eq("id", user_response.user.id).execute()
        if not profile_response.data:
            raise HTTPException(status_code=401, detail="User profile not found")
        
        profile = profile_response.data[0]
        
        # Add profile data to user object
        user_response.user.user_metadata = profile
        user_response.user.access_token = credentials.credentials
        
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def require_teacher_role(user=Depends(get_current_user)):
    """Require user to have teacher role"""
    if user.user_metadata.get("role") != "teacher":
        raise HTTPException(
            status_code=403, 
            detail="Only teachers can upload learning materials"
        )
    return user


async def process_pdf_background(
    material_id: str, 
    file_content: bytes, 
    user_id: str,
    client: Client
):
    """Background task to process PDF file"""
    try:
        # Update status to processing
        client.table("learning_materials").update({
            "processing_status": ProcessingStatus.PROCESSING.value
        }).eq("id", material_id).execute()
        
        # Extract text from PDF
        extracted_text, metadata = extract_text_from_pdf(file_content)
        
        # Update material with extracted text
        client.table("learning_materials").update({
            "processed_text": extracted_text,
            "processing_status": ProcessingStatus.COMPLETED.value,
            "metadata": metadata
        }).eq("id", material_id).execute()
        
        # TODO: Generate embeddings and questions in future iterations
        
    except Exception as e:
        # Update status to failed with error message
        client.table("learning_materials").update({
            "processing_status": ProcessingStatus.FAILED.value,
            "error_message": str(e)
        }).eq("id", material_id).execute()


@router.post("/upload", response_model=UploadResponse, status_code=201)
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    user=Depends(require_teacher_role)
):
    """
    Upload a PDF file for learning material creation
    
    - **file**: PDF file to upload (max 50MB)
    - **title**: Title for the learning material 
    - **description**: Optional description
    
    Returns material_id and processing status
    """
    try:
        # Validate file type
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Validate PDF file
        try:
            validate_pdf_file(file_content)
        except PDFProcessingError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Validate title
        if not title.strip():
            raise HTTPException(status_code=400, detail="Title cannot be empty")
        
        # Generate material ID and file path
        material_id = str(uuid.uuid4())
        sanitized_filename = sanitize_filename(file.filename)
        file_path = f"learning_materials/{user.id}/{material_id}/{sanitized_filename}"
        
        # Get Supabase client
        client = get_authenticated_client(user.access_token)
        
        # Upload file to Supabase Storage
        try:
            storage_response = client.storage.from_("learning_materials").upload(
                file_path, file_content
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload file to storage: {str(e)}"
            )
        
        # Create database record
        try:
            material_data = {
                "id": material_id,
                "teacher_id": user.id,
                "title": title.strip(),
                "description": description.strip() if description else None,
                "file_path": file_path,
                "file_size": len(file_content),
                "file_type": file.content_type,
                "processing_status": ProcessingStatus.PENDING.value,
                "metadata": {
                    "original_filename": file.filename,
                    "file_hash": generate_file_hash(file_content),
                    "upload_timestamp": str(uuid.uuid1().time)
                }
            }
            
            db_response = client.table("learning_materials").insert(material_data).execute()
            
            if not db_response.data:
                raise Exception("Failed to create material record")
                
        except Exception as e:
            # Cleanup: try to delete uploaded file
            try:
                client.storage.from_("learning_materials").remove([file_path])
            except:
                pass  # Ignore cleanup errors
            
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create material record: {str(e)}"
            )
        
        # Start background processing  
        background_tasks.add_task(
            process_pdf_background,
            material_id,
            file_content,
            user.id,
            get_supabase_client()  # Use a fresh client for background task
        )
        
        return UploadResponse(
            material_id=material_id,
            title=title.strip(),
            file_path=file_path,
            file_size=len(file_content),
            processing_status=ProcessingStatus.PENDING,
            message=f"File uploaded successfully. Processing started for '{title}'"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/{material_id}/status", response_model=ProcessingStatusResponse)
async def get_processing_status(
    material_id: str,
    user=Depends(get_current_user)
):
    """
    Get processing status for a learning material
    
    - **material_id**: ID of the learning material
    
    Returns current processing status and progress
    """
    try:
        client = get_authenticated_client(user.access_token)
        
        # Query material with access control
        query = client.table("learning_materials").select(
            "id, processing_status, error_message, teacher_id"
        ).eq("id", material_id)
        
        response = query.execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Material not found")
        
        material = response.data[0]
        
        # Check access rights
        user_role = user.user_metadata.get("role")
        if user_role == "teacher" and material["teacher_id"] != user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        elif user_role == "student":
            # Check if student has access through teacher relationship
            teacher_check = client.table("teacher_students").select("teacher_id").eq(
                "student_id", user.id
            ).eq("teacher_id", material["teacher_id"]).eq("status", "accepted").execute()
            
            if not teacher_check.data:
                raise HTTPException(status_code=403, detail="Access denied")
        
        return ProcessingStatusResponse(
            material_id=material_id,
            status=ProcessingStatus(material["processing_status"]),
            error_message=material.get("error_message")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get processing status: {str(e)}"
        )


@router.get("/", response_model=LearningMaterialListResponse)
async def list_materials(
    page: int = 1,
    size: int = 20,
    status: Optional[ProcessingStatus] = None,
    user=Depends(get_current_user)
):
    """
    List learning materials for the current user
    
    - **page**: Page number (1-indexed)
    - **size**: Number of items per page (max 100)
    - **status**: Filter by processing status
    
    Returns paginated list of materials
    """
    try:
        # Validate pagination parameters
        if page < 1:
            raise HTTPException(status_code=400, detail="Page must be >= 1")
        if size < 1 or size > 100:
            raise HTTPException(status_code=400, detail="Size must be between 1 and 100")
        
        client = get_authenticated_client(user.access_token)
        user_role = user.user_metadata.get("role")
        
        # Build query based on user role
        if user_role == "teacher":
            query = client.table("learning_materials").select(
                "*", count="exact"
            ).eq("teacher_id", user.id)
        else:  # student
            # Get materials from teachers the student is connected to
            query = client.table("learning_materials").select(
                "*", count="exact"
            ).in_(
                "teacher_id",
                client.table("teacher_students").select("teacher_id").eq(
                    "student_id", user.id
                ).eq("status", "accepted")
            )
        
        # Apply status filter if provided
        if status:
            query = query.eq("processing_status", status.value)
        
        # Apply pagination
        offset = (page - 1) * size
        query = query.range(offset, offset + size - 1).order("created_at", desc=True)
        
        response = query.execute()
        
        items = [LearningMaterialResponse(**item) for item in response.data]
        total = response.count or 0
        pages = (total + size - 1) // size  # Ceiling division
        
        return LearningMaterialListResponse(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list materials: {str(e)}"
        )


@router.get("/{material_id}", response_model=LearningMaterialResponse)
async def get_material(
    material_id: str,
    user=Depends(get_current_user)
):
    """
    Get a specific learning material by ID
    
    - **material_id**: ID of the learning material
    
    Returns detailed material information
    """
    try:
        client = get_authenticated_client(user.access_token)
        
        # Query material with access control
        response = client.table("learning_materials").select("*").eq("id", material_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Material not found")
        
        material = response.data[0]
        
        # Check access rights
        user_role = user.user_metadata.get("role")
        if user_role == "teacher" and material["teacher_id"] != user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        elif user_role == "student":
            # Check if student has access through teacher relationship
            teacher_check = client.table("teacher_students").select("teacher_id").eq(
                "student_id", user.id
            ).eq("teacher_id", material["teacher_id"]).eq("status", "accepted").execute()
            
            if not teacher_check.data:
                raise HTTPException(status_code=403, detail="Access denied")
        
        return LearningMaterialResponse(**material)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get material: {str(e)}"
        )


@router.put("/{material_id}", response_model=LearningMaterialResponse)
async def update_material(
    material_id: str,
    update_data: LearningMaterialUpdate,
    user=Depends(require_teacher_role)
):
    """
    Update a learning material (teachers only)
    
    - **material_id**: ID of the learning material
    - **update_data**: Fields to update
    
    Returns updated material information
    """
    try:
        client = get_authenticated_client(user.access_token)
        
        # Check if material exists and belongs to teacher
        existing = client.table("learning_materials").select("*").eq(
            "id", material_id
        ).eq("teacher_id", user.id).execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Material not found")
        
        # Prepare update data
        update_dict = {}
        if update_data.title is not None:
            update_dict["title"] = update_data.title
        if update_data.description is not None:
            update_dict["description"] = update_data.description
        
        if not update_dict:
            # No updates provided, return existing material
            return LearningMaterialResponse(**existing.data[0])
        
        # Perform update
        response = client.table("learning_materials").update(update_dict).eq(
            "id", material_id
        ).eq("teacher_id", user.id).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update material")
        
        return LearningMaterialResponse(**response.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update material: {str(e)}"
        )


@router.delete("/{material_id}")
async def delete_material(
    material_id: str,
    user=Depends(require_teacher_role)
):
    """
    Delete a learning material (teachers only)
    
    - **material_id**: ID of the learning material
    
    Removes material and associated file from storage
    """
    try:
        client = get_authenticated_client(user.access_token)
        
        # Check if material exists and belongs to teacher
        existing = client.table("learning_materials").select("*").eq(
            "id", material_id
        ).eq("teacher_id", user.id).execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Material not found")
        
        material = existing.data[0]
        
        # Delete file from storage if exists
        if material.get("file_path"):
            try:
                client.storage.from_("learning_materials").remove([material["file_path"]])
            except Exception as e:
                # Log warning but don't fail the deletion
                pass
        
        # Delete from database (CASCADE will handle related records)
        client.table("learning_materials").delete().eq("id", material_id).eq(
            "teacher_id", user.id
        ).execute()
        
        return {"message": f"Material '{material['title']}' deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete material: {str(e)}"
        )