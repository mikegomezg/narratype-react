from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import aiosqlite
import re

from app.database import get_db


router = APIRouter()


class TextMetadata(BaseModel):
    id: Optional[int] = None
    filename: str
    display_path: str
    title: str
    author: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    word_count: int
    is_favorite: bool = False
    last_practiced: Optional[str] = None
    times_practiced: int = 0


class FavoriteRequest(BaseModel):
    is_favorite: bool


class RegisterRequest(BaseModel):
    filename: str


def scan_texts_directory() -> List[dict]:
    """Scan the texts/input directory for available texts"""
    texts_dir = Path("../texts/input")
    texts = []

    if not texts_dir.exists():
        return texts

    for text_file in texts_dir.rglob("*.txt"):
        relative_path = text_file.relative_to(texts_dir)
        category = relative_path.parts[0] if len(relative_path.parts) > 1 else "uncategorized"

        # Parse metadata from file header
        try:
            file_content = text_file.read_text(encoding="utf-8")
        except Exception:
            file_content = ""

        metadata = {
            "filename": str(text_file),
            "display_path": str(relative_path),
            "title": text_file.stem.replace("_", " ").title(),
            "category": category,
            "word_count": len(file_content.split())
        }

        texts.append(metadata)

    return texts


@router.get("/", response_model=List[TextMetadata])
async def list_texts(db: aiosqlite.Connection = Depends(get_db)):
    """List all available texts with their metadata"""
    # Get filesystem texts
    fs_texts = scan_texts_directory()

    # Get database entries
    cursor = await db.execute("""
        SELECT * FROM texts
    """)
    db_texts = await cursor.fetchall()
    db_texts_by_filename = {row["filename"]: dict(row) for row in db_texts}

    # Merge filesystem and database data
    result: List[TextMetadata] = []
    for text in fs_texts:
        db_entry = db_texts_by_filename.get(text["filename"])
        if db_entry:
            text.update({
                "id": db_entry["id"],
                "is_favorite": bool(db_entry["is_favorite"]),
                "last_practiced": db_entry["last_practiced"],
                "times_practiced": db_entry["times_practiced"]
            })
        result.append(TextMetadata(**text))

    return result


@router.post("/{text_id}/favorite")
async def toggle_favorite(
    text_id: int,
    payload: FavoriteRequest,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Toggle favorite status for a text"""
    await db.execute(
        "UPDATE texts SET is_favorite = ? WHERE id = ?",
        (1 if payload.is_favorite else 0, text_id)
    )
    await db.commit()
    return {"success": True}


@router.get("/{text_id}/content")
async def get_text_content(
    text_id: int,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Get the full content of a text for practice"""
    # First try to get from database
    cursor = await db.execute(
        "SELECT * FROM texts WHERE id = ?",
        (text_id,)
    )
    db_text = await cursor.fetchone()

    if db_text:
        filename = db_text["filename"]
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()

            # Parse and remove metadata headers
            lines = content.split('\n')
            content_start = 0
            for i, line in enumerate(lines):
                if line.strip() and not line.startswith('#'):
                    content_start = i
                    break

            clean_content = '\n'.join(lines[content_start:]).strip()

            # Update last_practiced
            await db.execute(
                "UPDATE texts SET last_practiced = datetime('now'), times_practiced = times_practiced + 1 WHERE id = ?",
                (text_id,)
            )
            await db.commit()

            return {
                "id": text_id,
                "title": db_text["title"],
                "content": clean_content,
                "word_count": len(clean_content.split())
            }
        except Exception as e:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail=f"Could not read text file: {e}")

    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Text not found")


@router.post("/register")
async def register_text(
    payload: RegisterRequest,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Register a text in the database (called when first practiced)"""
    # Check if already exists
    cursor = await db.execute(
        "SELECT id FROM texts WHERE filename = ?",
        (payload.filename,)
    )
    existing = await cursor.fetchone()

    if existing:
        return {"id": existing["id"]}

    # Parse file for metadata
    path = Path(payload.filename)
    if not path.exists():
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="File not found")

    content = path.read_text(encoding='utf-8')
    metadata: dict[str, str] = {}

    for line in content.split('\n')[:10]:
        if line.startswith('#'):
            match = re.match(r'#\s*(\w+):\s*(.+)', line)
            if match:
                key, value = match.groups()
                metadata[key] = value.strip()

    # Insert into database
    await db.execute(
        """
        INSERT INTO texts (filename, display_path, title, author, category, difficulty, word_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.filename,
            str(path.relative_to(Path("../texts/input"))),
            metadata.get("title", path.stem.replace("_", " ").title()),
            metadata.get("author"),
            metadata.get("category", "uncategorized"),
            metadata.get("difficulty"),
            len(content.split())
        )
    )
    await db.commit()

    cursor = await db.execute("SELECT last_insert_rowid() as id")
    result = await cursor.fetchone()
    return {"id": result["id"]}
