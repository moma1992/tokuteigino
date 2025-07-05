"""
Pydantic models for TOKUTEI Learning API
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from enum import Enum


class ProcessingStatus(str, Enum):
    """Processing status for learning materials"""
    PENDING = "pending"
    PROCESSING = "processing" 
    COMPLETED = "completed"
    FAILED = "failed"


class QuestionType(str, Enum):
    """Types of questions that can be generated"""
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"


class UserRole(str, Enum):
    """User roles in the system"""
    STUDENT = "student"
    TEACHER = "teacher"


# Request Models
class LearningMaterialCreate(BaseModel):
    """Schema for creating a new learning material"""
    title: str = Field(..., min_length=1, max_length=255, description="Title of the learning material")
    description: Optional[str] = Field(None, description="Description of the learning material")
    
    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()


class LearningMaterialUpdate(BaseModel):
    """Schema for updating a learning material"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    
    @validator('title')
    def validate_title(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip() if v else v


class QuestionCreate(BaseModel):
    """Schema for creating a new question"""
    material_id: str = Field(..., description="ID of the learning material")
    question_text: str = Field(..., min_length=5, max_length=1000)
    question_with_furigana: Optional[str] = None
    options: List[str] = Field(..., min_items=2, max_items=4)
    correct_answer: int = Field(..., ge=0, le=3)
    explanation: Optional[str] = None
    difficulty_level: int = Field(1, ge=1, le=5)
    question_type: QuestionType = QuestionType.MULTIPLE_CHOICE


class LearningRecordCreate(BaseModel):
    """Schema for creating a learning record"""
    question_id: str = Field(..., description="ID of the question")
    selected_answer: int = Field(..., ge=0, le=3)
    is_correct: bool
    time_spent: int = Field(..., ge=0, le=3600, description="Time spent in seconds")
    session_id: Optional[str] = None


# Response Models
class LearningMaterialResponse(BaseModel):
    """Schema for learning material response"""
    id: str
    teacher_id: str
    title: str
    description: Optional[str]
    file_path: Optional[str]
    file_size: Optional[int]
    file_type: Optional[str]
    processed_text: Optional[str]
    processing_status: ProcessingStatus
    error_message: Optional[str]
    metadata: Dict[str, Any] = {}
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class LearningMaterialListResponse(BaseModel):
    """Schema for paginated learning materials list"""
    items: List[LearningMaterialResponse]
    total: int
    page: int
    size: int
    pages: int


class QuestionResponse(BaseModel):
    """Schema for question response"""
    id: str
    material_id: str
    question_text: str
    question_with_furigana: Optional[str]
    options: List[str]
    correct_answer: int
    explanation: Optional[str]
    difficulty_level: int
    question_type: QuestionType
    metadata: Dict[str, Any] = {}
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class QuestionsListResponse(BaseModel):
    """Schema for paginated questions list"""
    items: List[QuestionResponse]
    total: int
    page: int
    size: int
    pages: int


class LearningRecordResponse(BaseModel):
    """Schema for learning record response"""
    id: str
    student_id: str
    question_id: str
    selected_answer: int
    is_correct: bool
    time_spent: int
    session_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    """Schema for file upload response"""
    material_id: str
    title: str
    file_path: str
    file_size: int
    processing_status: ProcessingStatus
    message: str


class ProcessingStatusResponse(BaseModel):
    """Schema for processing status response"""
    material_id: str
    status: ProcessingStatus
    progress: Optional[int] = Field(None, ge=0, le=100, description="Processing progress percentage")
    error_message: Optional[str] = None
    estimated_completion: Optional[datetime] = None


class ErrorResponse(BaseModel):
    """Schema for error responses"""
    error: str
    detail: Optional[str] = None
    status_code: int


class UserProfile(BaseModel):
    """Schema for user profile"""
    id: str
    email: str
    full_name: str
    role: UserRole
    avatar_url: Optional[str] = None
    preferred_language: Optional[str] = "ja"
    learning_level: Optional[str] = None
    organization_name: Optional[str] = None
    teacher_code: Optional[str] = None
    max_students: Optional[int] = None
    subscription_plan: Optional[str] = "free"
    subscription_status: Optional[str] = "active"
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True