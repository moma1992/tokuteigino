"""
Tests for PDF text extraction functionality - TDD approach
"""
import pytest
import io
from app.utils import (
    validate_pdf_file, 
    extract_text_from_pdf, 
    chunk_text, 
    generate_file_hash,
    sanitize_filename,
    format_file_size,
    PDFProcessingError
)


@pytest.fixture
def sample_pdf_bytes():
    """Create a sample PDF file content for testing"""
    # Simple PDF content with text (using ASCII only for tests)
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
/Length 80
>>
stream
BT
/F1 12 Tf
72 720 Td
(This is a sample PDF for testing) Tj
0 -20 Td
(Japanese text: Hello World) Tj
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
320
%%EOF"""
    return pdf_content


@pytest.fixture
def corrupted_pdf_bytes():
    """Create corrupted PDF content for testing"""
    return b"This is not a valid PDF file content"


class TestPDFValidation:
    """Test cases for PDF file validation"""
    
    def test_validate_valid_pdf(self, sample_pdf_bytes):
        """Test validation of valid PDF file"""
        # Should not raise exception
        validate_pdf_file(sample_pdf_bytes)
    
    def test_validate_empty_file(self):
        """Test validation of empty file should fail"""
        with pytest.raises(PDFProcessingError) as exc_info:
            validate_pdf_file(b"")
        assert "empty" in str(exc_info.value).lower()
    
    def test_validate_oversized_file(self):
        """Test validation of oversized file should fail"""
        oversized_content = b"x" * (60 * 1024 * 1024)  # 60MB
        with pytest.raises(PDFProcessingError) as exc_info:
            validate_pdf_file(oversized_content, max_size=50 * 1024 * 1024)
        assert "size exceeds" in str(exc_info.value).lower()
    
    def test_validate_corrupted_pdf(self, corrupted_pdf_bytes):
        """Test validation of corrupted PDF should fail"""
        with pytest.raises(PDFProcessingError) as exc_info:
            validate_pdf_file(corrupted_pdf_bytes)
        assert "invalid pdf" in str(exc_info.value).lower()
    
    def test_validate_custom_max_size(self, sample_pdf_bytes):
        """Test validation with custom max size"""
        small_max_size = 100  # 100 bytes
        with pytest.raises(PDFProcessingError) as exc_info:
            validate_pdf_file(sample_pdf_bytes, max_size=small_max_size)
        assert "size exceeds" in str(exc_info.value).lower()


class TestTextExtraction:
    """Test cases for text extraction from PDF"""
    
    def test_extract_text_success(self, sample_pdf_bytes):
        """Test successful text extraction from PDF"""
        text, metadata = extract_text_from_pdf(sample_pdf_bytes)
        
        # Check that text was extracted
        assert isinstance(text, str)
        assert len(text) > 0
        assert "sample PDF" in text or "testing" in text
        
        # Check metadata
        assert isinstance(metadata, dict)
        assert "page_count" in metadata
        assert "text_length" in metadata
        assert "extracted_pages" in metadata
        assert metadata["page_count"] >= 1
        assert metadata["text_length"] > 0
    
    def test_extract_text_with_metadata(self, sample_pdf_bytes):
        """Test text extraction with metadata"""
        text, metadata = extract_text_from_pdf(sample_pdf_bytes)
        
        # Should extract text and return metadata
        assert isinstance(text, str)
        assert len(text) > 0
        assert isinstance(metadata, dict)
        assert "page_count" in metadata
    
    def test_extract_text_from_corrupted_pdf(self, corrupted_pdf_bytes):
        """Test text extraction from corrupted PDF should fail"""
        with pytest.raises(PDFProcessingError) as exc_info:
            extract_text_from_pdf(corrupted_pdf_bytes)
        assert "failed to extract" in str(exc_info.value).lower()
    
    def test_extract_text_empty_content(self):
        """Test text extraction from empty content should fail"""
        with pytest.raises(PDFProcessingError) as exc_info:
            extract_text_from_pdf(b"")
        assert "failed to extract" in str(exc_info.value).lower()


class TestTextChunking:
    """Test cases for text chunking functionality"""
    
    def test_chunk_short_text(self):
        """Test chunking of short text"""
        short_text = "This is a short text."
        chunks = chunk_text(short_text, chunk_size=100)
        
        assert len(chunks) == 1
        assert chunks[0] == short_text
    
    def test_chunk_long_text(self):
        """Test chunking of long text"""
        long_text = "This is a sentence. " * 100  # Create long text
        chunks = chunk_text(long_text, chunk_size=200, overlap=50)
        
        assert len(chunks) > 1
        
        # Check that each chunk is within size limit
        for chunk in chunks:
            assert len(chunk) <= 250  # chunk_size + some tolerance for sentence boundaries
        
        # Check overlap exists between consecutive chunks
        if len(chunks) > 1:
            # Should have some overlap
            assert len(chunks[0]) > 150  # Should be close to chunk_size if sentence boundary found
    
    def test_chunk_with_sentence_boundaries(self):
        """Test chunking respects sentence boundaries"""
        text = "First sentence. Second sentence. Third sentence. Fourth sentence."
        chunks = chunk_text(text, chunk_size=30, overlap=10)
        
        # Should break at sentence boundaries when possible
        for chunk in chunks:
            if "." in chunk and len(chunk) < 60:  # If chunk has period and isn't too long
                assert chunk.strip().endswith(".")
    
    def test_chunk_empty_text(self):
        """Test chunking of empty text"""
        chunks = chunk_text("", chunk_size=100)
        assert len(chunks) == 0
    
    def test_chunk_with_custom_parameters(self):
        """Test chunking with custom parameters"""
        text = "A" * 500  # 500 character text
        chunks = chunk_text(text, chunk_size=100, overlap=20)
        
        assert len(chunks) > 4  # Should be split into multiple chunks
        
        # Check chunk sizes
        for i, chunk in enumerate(chunks):
            if i < len(chunks) - 1:  # Not the last chunk
                assert len(chunk) <= 120  # Should be around chunk_size
            else:  # Last chunk
                assert len(chunk) > 0


class TestUtilityFunctions:
    """Test cases for utility functions"""
    
    def test_generate_file_hash(self, sample_pdf_bytes):
        """Test file hash generation"""
        hash1 = generate_file_hash(sample_pdf_bytes)
        hash2 = generate_file_hash(sample_pdf_bytes)
        
        # Same content should produce same hash
        assert hash1 == hash2
        assert len(hash1) == 64  # SHA-256 produces 64 character hex string
        
        # Different content should produce different hash
        different_content = b"different content"
        hash3 = generate_file_hash(different_content)
        assert hash1 != hash3
    
    def test_sanitize_filename(self):
        """Test filename sanitization"""
        # Test unsafe characters
        unsafe_name = 'file<>:"/\\|?*name.pdf'
        sanitized = sanitize_filename(unsafe_name)
        assert "<" not in sanitized
        assert ">" not in sanitized
        assert ":" not in sanitized
        assert "/" not in sanitized
        assert "\\" not in sanitized
        assert "|" not in sanitized
        assert "?" not in sanitized
        assert "*" not in sanitized
        
        # Test empty filename
        assert sanitize_filename("") == "untitled"
        assert sanitize_filename("   ") == "untitled"
        
        # Test long filename
        long_name = "a" * 150 + ".pdf"
        sanitized = sanitize_filename(long_name)
        assert len(sanitized) <= 100
        assert sanitized.endswith(".pdf")
        
        # Test normal filename
        normal_name = "document.pdf"
        assert sanitize_filename(normal_name) == normal_name
    
    def test_format_file_size(self):
        """Test file size formatting"""
        # Test bytes
        assert format_file_size(0) == "0 B"
        assert format_file_size(512) == "512.0 B"
        
        # Test KB
        assert format_file_size(1024) == "1.0 KB"
        assert format_file_size(1536) == "1.5 KB"
        
        # Test MB
        assert format_file_size(1024 * 1024) == "1.0 MB"
        assert format_file_size(1024 * 1024 * 2.5) == "2.5 MB"
        
        # Test GB
        assert format_file_size(1024 * 1024 * 1024) == "1.0 GB"
        
        # Test large numbers
        large_size = 50 * 1024 * 1024  # 50 MB
        result = format_file_size(large_size)
        assert "50.0 MB" == result


class TestIntegrationTextProcessing:
    """Integration tests for complete text processing pipeline"""
    
    def test_full_processing_pipeline(self, sample_pdf_bytes):
        """Test complete processing from PDF to chunks"""
        # Step 1: Validate PDF
        validate_pdf_file(sample_pdf_bytes)
        
        # Step 2: Extract text
        text, metadata = extract_text_from_pdf(sample_pdf_bytes)
        assert len(text) > 0
        
        # Step 3: Chunk text
        chunks = chunk_text(text, chunk_size=100, overlap=20)
        assert len(chunks) >= 1
        
        # Step 4: Generate hash
        file_hash = generate_file_hash(sample_pdf_bytes)
        assert len(file_hash) == 64
        
        # Verify all steps completed successfully
        assert isinstance(text, str)
        assert isinstance(metadata, dict)
        assert isinstance(chunks, list)
        assert isinstance(file_hash, str)
    
    def test_processing_with_error_handling(self, corrupted_pdf_bytes):
        """Test processing pipeline with error handling"""
        # Should fail at validation step
        with pytest.raises(PDFProcessingError):
            validate_pdf_file(corrupted_pdf_bytes)
        
        # Should fail at extraction step if validation is bypassed
        with pytest.raises(PDFProcessingError):
            extract_text_from_pdf(corrupted_pdf_bytes)
        
        # Hash generation should still work for any content
        file_hash = generate_file_hash(corrupted_pdf_bytes)
        assert len(file_hash) == 64