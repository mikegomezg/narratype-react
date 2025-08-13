from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import aiosqlite

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
    is_favorite: bool,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Toggle favorite status for a text"""
    await db.execute(
        "UPDATE texts SET is_favorite = ? WHERE id = ?",
        (1 if is_favorite else 0, text_id)
    )
    await db.commit()
    return {"success": True}
