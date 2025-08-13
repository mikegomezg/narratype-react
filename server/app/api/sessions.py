from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends
import aiosqlite

from app.database import get_db


router = APIRouter()


@router.get("/")
async def list_sessions(db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute(
        "SELECT * FROM practice_sessions ORDER BY started_at DESC LIMIT 100"
    )
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]


@router.post("/")
async def create_session(
    text_id: int,
    exercise_type: Optional[str] = None,
    lesson_number: Optional[int] = None,
    exercise_number: Optional[int] = None,
    db: aiosqlite.Connection = Depends(get_db),
):
    started_at = datetime.utcnow().isoformat()
    await db.execute(
        """
        INSERT INTO practice_sessions(
            text_id, started_at, exercise_type, lesson_number, exercise_number
        ) VALUES(?, ?, ?, ?, ?)
        """,
        (text_id, started_at, exercise_type, lesson_number, exercise_number),
    )
    await db.commit()
    cursor = await db.execute("SELECT last_insert_rowid() as id")
    row = await cursor.fetchone()
    return {"id": row["id"], "started_at": started_at}


@router.post("/{session_id}/complete")
async def complete_session(
    session_id: int,
    wpm: Optional[float] = None,
    accuracy: Optional[float] = None,
    characters_typed: Optional[int] = None,
    errors: Optional[int] = None,
    db: aiosqlite.Connection = Depends(get_db),
):
    ended_at = datetime.utcnow().isoformat()
    await db.execute(
        """
        UPDATE practice_sessions
        SET ended_at = ?, wpm = ?, accuracy = ?, characters_typed = ?, errors = ?, completed = 1
        WHERE id = ?
        """,
        (ended_at, wpm, accuracy, characters_typed, errors, session_id),
    )
    await db.commit()
    return {"success": True, "ended_at": ended_at}
