from pathlib import Path
import sqlite3


def main():
    db_path = Path("data/narratype.db")
    if not db_path.exists():
        print("Database not found:", db_path)
        return

    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        print("\n== texts (up to 10) ==")
        for row in cur.execute("SELECT * FROM texts ORDER BY created_at DESC LIMIT 10"):
            print(dict(row))

        print("\n== practice_sessions (up to 10) ==")
        for row in cur.execute("SELECT * FROM practice_sessions ORDER BY started_at DESC LIMIT 10"):
            print(dict(row))


if __name__ == "__main__":
    main()
