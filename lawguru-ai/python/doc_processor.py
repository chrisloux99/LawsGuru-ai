"""Document processor — extracts text and chunks documents."""

import hashlib
from pathlib import Path
from typing import TypedDict


class Chunk(TypedDict):
    id: str
    text: str
    metadata: dict


def extract_text(file_path: str, mime_type: str) -> str:
    """Extract text from a document file."""
    path = Path(file_path)

    if mime_type == "application/pdf":
        return _extract_pdf(path)
    elif mime_type in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ):
        return _extract_docx(path)
    elif mime_type == "text/plain" or path.suffix == ".txt":
        return path.read_text(encoding="utf-8", errors="replace")
    else:
        return path.read_text(encoding="utf-8", errors="replace")


def _extract_pdf(path: Path) -> str:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n\n".join(pages)


def _extract_docx(path: Path) -> str:
    from docx import Document

    doc = Document(str(path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


def chunk_text(text: str, chunk_size: int = 512, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks by character count."""
    if not text.strip():
        return []

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size

        # Try to break at sentence boundary
        if end < len(text):
            # Look for sentence end within the last 20% of the chunk
            search_start = start + int(chunk_size * 0.8)
            for sep in [". ", ".\n", "\n\n", "\n"]:
                pos = text.rfind(sep, search_start, end)
                if pos != -1:
                    end = pos + len(sep)
                    break

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap

    return chunks


def make_chunk_id(drive_file_id: str, chunk_index: int) -> str:
    """Deterministic chunk ID from file ID + index."""
    raw = f"{drive_file_id}_{chunk_index}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def process_file(
    file_path: str,
    mime_type: str,
    drive_file_id: str,
    file_name: str,
    chunk_size: int = 512,
    chunk_overlap: int = 50,
) -> list[Chunk]:
    """Extract text from a file and split into chunks with metadata."""
    text = extract_text(file_path, mime_type)
    if not text.strip():
        return []

    text_chunks = chunk_text(text, chunk_size, chunk_overlap)

    result: list[Chunk] = []
    for i, chunk_text_str in enumerate(text_chunks):
        result.append(
            {
                "id": make_chunk_id(drive_file_id, i),
                "text": chunk_text_str,
                "metadata": {
                    "driveFileId": drive_file_id,
                    "fileName": file_name,
                    "mimeType": mime_type,
                    "chunkIndex": i,
                    "totalChunks": len(text_chunks),
                },
            }
        )

    return result
