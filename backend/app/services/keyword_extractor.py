import re

from app.core.code_dictionary import CODE_DICTIONARY


class KeywordExtractor:
    def extract(self, note_text: str) -> list[str]:
        normalized_text = note_text.lower()
        found: set[str] = set()

        for entry in CODE_DICTIONARY:
            for keyword in entry.keywords:
                pattern = rf"\b{re.escape(keyword.lower())}\b"
                if re.search(pattern, normalized_text):
                    found.add(keyword.lower())

        return sorted(found)