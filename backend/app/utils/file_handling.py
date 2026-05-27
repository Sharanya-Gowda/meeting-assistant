import os
from fastapi import UploadFile, HTTPException
from docx import Document
import io

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB strict boundary limit
ALLOWED_EXTENSIONS = {".txt", ".md", ".docx"}

def validate_file(file: UploadFile) -> bool:
    """
    Enforces security baselines: validates filename suffixes and binary content size limits.
    """
    # 1. Validate File Extension Suffix
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. System constraints allow only .txt, .md, and .docx formats."
        )
    
    # 2. Validate File Memory Size Bounds
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)  # Always reset cursor memory stream pointer
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File payload size is too large. Ingestion is constrained to a maximum of 10 Megabytes (10MB)."
        )
        
    return True

def extract_text_from_file(file: UploadFile) -> str:
    """
    Detects mime variants and safely decodes content buffers into a clean string stream.
    """
    _, ext = os.path.splitext(file.filename.lower())
    raw_content = file.file.read()
    file.file.seek(0)  # Clean cursor stream state
    
    try:
        # Parse Standard Plaintext formats (.txt / .md)
        if ext in {".txt", ".md"}:
            extracted_text = raw_content.decode("utf-8").strip()
            
        # Parse Microsoft Word Formats (.docx)
        elif ext == ".docx":
            doc_stream = io.BytesIO(raw_content)
            document = Document(doc_stream)
            full_text = [paragraph.text for paragraph in document.paragraphs]
            extracted_text = "\n".join(full_text).strip()
            
        # Enforce content presence validations
        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="File contains no readable text content elements."
            )
            
        return extracted_text

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Corrupted file payload pattern or parsing failure encountered: {str(e)}"
        )