from pathlib import Path
import random
from typing import List


def generate_sample_text(title: str, author: str, category: str, difficulty: str, word_count: int) -> str:
    """Generate sample text with metadata header"""

    # Common words for generating sample text
    common_words = [
        "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
        "programming", "typing", "practice", "keyboard", "skills", "improve",
        "text", "exercise", "learning", "speed", "accuracy", "focus"
    ]

    # Generate content
    words: List[str] = []
    for _ in range(word_count):
        words.append(random.choice(common_words))

    content = " ".join(words)

    # Format with metadata
    text = f"""# title: {title}
# author: {author}
# difficulty: {difficulty}
# category: {category}

{content}
"""

    return text


def create_sample_texts():
    """Create sample texts in different categories"""
    texts_dir = Path("../texts/input")

    samples = [
        ("The Art of Typing", "John Doe", "technical", "easy", 200),
        ("Programming Basics", "Jane Smith", "technical", "medium", 300),
        ("Classic Literature Excerpt", "Anonymous", "classics", "hard", 400),
        ("Keyboard Mastery", "Tech Writer", "technical", "medium", 250),
    ]

    for title, author, category, difficulty, word_count in samples:
        category_dir = texts_dir / category
        category_dir.mkdir(parents=True, exist_ok=True)

        filename = title.lower().replace(" ", "_") + ".txt"
        filepath = category_dir / filename

        text = generate_sample_text(title, author, category, difficulty, word_count)
        filepath.write_text(text, encoding="utf-8")
        print(f"Created: {filepath}")


if __name__ == "__main__":
    create_sample_texts()
