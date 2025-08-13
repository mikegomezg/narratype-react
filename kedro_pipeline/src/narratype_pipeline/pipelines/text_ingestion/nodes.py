from typing import Dict, List, Any
from pathlib import Path
import re


def scan_text_files(input_dir: str) -> List[Dict[str, Any]]:
    """Scan directory for text files"""
    texts: List[Dict[str, Any]] = []
    input_path = Path(input_dir)

    for text_file in input_path.rglob("*.txt"):
        with open(text_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse metadata header
        metadata = parse_metadata(content)

        texts.append({
            "path": str(text_file),
            "content": content,
            "metadata": metadata,
            "word_count": len(content.split())
        })

    return texts


def parse_metadata(content: str) -> Dict[str, str]:
    """Extract metadata from text header"""
    metadata: Dict[str, str] = {}
    lines = content.split('\n')

    for line in lines[:10]:  # Check first 10 lines
        if line.startswith('#'):
            match = re.match(r'#\s*(\w+):\s*(.+)', line)
            if match:
                key, value = match.groups()
                metadata[key] = value.strip()
        elif line.strip() and not line.startswith('#'):
            break  # Stop at first non-metadata line

    return metadata


def validate_texts(texts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Validate and clean text data"""
    valid_texts: List[Dict[str, Any]] = []

    for text in texts:
        if text.get("word_count", 0) > 50:  # Minimum word count
            valid_texts.append(text)

    return valid_texts
