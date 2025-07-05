"""
Utility functions for TOKUTEI Learning API
"""
import os
import io
import hashlib
from typing import BinaryIO, Tuple, List, Optional
from PyPDF2 import PdfReader
import logging

logger = logging.getLogger(__name__)


class PDFProcessingError(Exception):
    """Exception raised when PDF processing fails"""
    pass


def validate_pdf_file(file_content: bytes, max_size: int = 50 * 1024 * 1024) -> None:
    """
    Validate PDF file content and size
    
    Args:
        file_content: The PDF file content as bytes
        max_size: Maximum allowed file size in bytes (default: 50MB)
    
    Raises:
        PDFProcessingError: If validation fails
    """
    # Check file size
    if len(file_content) > max_size:
        raise PDFProcessingError(f"File size exceeds maximum allowed size of {max_size} bytes")
    
    if len(file_content) == 0:
        raise PDFProcessingError("File is empty")
    
    # Check if it's a valid PDF by trying to read it
    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        
        # Check if PDF has pages
        if len(reader.pages) == 0:
            raise PDFProcessingError("PDF file contains no pages")
            
    except Exception as e:
        if isinstance(e, PDFProcessingError):
            raise
        raise PDFProcessingError(f"Invalid PDF file: {str(e)}")


def extract_text_from_pdf(file_content: bytes) -> Tuple[str, dict]:
    """
    Extract text from PDF file
    
    Args:
        file_content: The PDF file content as bytes
    
    Returns:
        Tuple of (extracted_text, metadata)
    
    Raises:
        PDFProcessingError: If text extraction fails
    """
    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        
        # Extract text from all pages
        text_parts = []
        page_count = len(reader.pages)
        
        for i, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()
                if page_text.strip():  # Only add non-empty pages
                    text_parts.append(page_text)
            except Exception as e:
                logger.warning(f"Failed to extract text from page {i + 1}: {str(e)}")
                continue
        
        extracted_text = "\n\n".join(text_parts)
        
        # Get metadata
        metadata = {
            "page_count": page_count,
            "text_length": len(extracted_text),
            "extracted_pages": len(text_parts)
        }
        
        # Add document info if available
        if reader.metadata:
            metadata.update({
                "title": reader.metadata.get("/Title", ""),
                "author": reader.metadata.get("/Author", ""),
                "subject": reader.metadata.get("/Subject", ""),
                "creator": reader.metadata.get("/Creator", ""),
                "producer": reader.metadata.get("/Producer", ""),
                "creation_date": str(reader.metadata.get("/CreationDate", "")),
                "modification_date": str(reader.metadata.get("/ModDate", ""))
            })
        
        if not extracted_text.strip():
            raise PDFProcessingError("No text could be extracted from the PDF")
        
        return extracted_text, metadata
        
    except Exception as e:
        if isinstance(e, PDFProcessingError):
            raise
        raise PDFProcessingError(f"Failed to extract text from PDF: {str(e)}")


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """
    Split text into overlapping chunks for embedding
    
    Args:
        text: The text to chunk
        chunk_size: Maximum size of each chunk in characters
        overlap: Number of characters to overlap between chunks
    
    Returns:
        List of text chunks
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # If this isn't the last chunk, try to break at a sentence boundary
        if end < len(text):
            # Look for sentence endings within the last 100 characters
            sentence_end = -1
            for i in range(max(0, end - 100), end):
                if text[i] in '.!?。！？':
                    sentence_end = i + 1
                    break
            
            if sentence_end > start:
                end = sentence_end
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        # Move start position with overlap
        start = end - overlap if end < len(text) else end
    
    return chunks


def generate_file_hash(file_content: bytes) -> str:
    """
    Generate SHA-256 hash of file content
    
    Args:
        file_content: The file content as bytes
    
    Returns:
        Hexadecimal hash string
    """
    return hashlib.sha256(file_content).hexdigest()


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe storage
    
    Args:
        filename: Original filename
    
    Returns:
        Sanitized filename
    """
    # Remove or replace unsafe characters
    unsafe_chars = '<>:"/\\|?*'
    sanitized = filename
    
    for char in unsafe_chars:
        sanitized = sanitized.replace(char, '_')
    
    # Remove leading/trailing whitespace and dots
    sanitized = sanitized.strip(' .')
    
    # Ensure filename is not empty
    if not sanitized:
        sanitized = "untitled"
    
    # Limit length
    if len(sanitized) > 100:
        name, ext = os.path.splitext(sanitized)
        sanitized = name[:100-len(ext)] + ext
    
    return sanitized


def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human readable format
    
    Args:
        size_bytes: File size in bytes
    
    Returns:
        Formatted file size string
    """
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    size = float(size_bytes)
    
    while size >= 1024.0 and i < len(size_names) - 1:
        size /= 1024.0
        i += 1
    
    return f"{size:.1f} {size_names[i]}"