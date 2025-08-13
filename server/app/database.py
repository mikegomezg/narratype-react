from typing import Optional
import aiosqlite
from pathlib import Path


DB_PATH = Path("../data/narratype.db")


async def init_db():
    """Initialize SQLite database with schema"""
    DB_PATH.parent.mkdir(exist_ok=True)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS texts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT UNIQUE NOT NULL,
                display_path TEXT NOT NULL,
                title TEXT NOT NULL,
                author TEXT,
                category TEXT,
                difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
                word_count INTEGER,
                is_favorite INTEGER DEFAULT 0,
                last_practiced DATETIME,
                times_practiced INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS practice_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text_id INTEGER NOT NULL,
                started_at DATETIME NOT NULL,
                ended_at DATETIME,
                exercise_type TEXT,
                lesson_number INTEGER,
                exercise_number INTEGER,
                wpm REAL,
                accuracy REAL,
                characters_typed INTEGER,
                errors INTEGER,
                completed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (text_id) REFERENCES texts(id)
            )
        """)

        await db.commit()


async def get_db():
    """Get database connection"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db
