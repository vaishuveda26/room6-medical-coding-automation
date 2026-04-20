import re

from app.core.code_dictionary import CODE_DICTIONARY


class CodeMapper:
    def map_codes(self, note_text: str) -> list[dict]:
        normalized_text = note_text.lower()
        suggestions: list[dict] = []

        for entry in CODE_DICTIONARY:
            matched_keywords = [
                keyword
                for keyword in entry.keywords
                if re.search(rf"\b{re.escape(keyword.lower())}\b", normalized_text)
            ]
            if not matched_keywords:
                continue

            confidence = min(0.55 + (0.1 * len(matched_keywords)), 0.95)
            evidence = [
                {
                    "keyword": keyword,
                    "context": self._extract_context(note_text, keyword),
                }
                for keyword in matched_keywords
            ]
            suggestions.append(
                {
                    "code": entry.code,
                    "code_type": entry.code_type,
                    "description": entry.description,
                    "confidence": round(confidence, 2),
                    "evidence": evidence,
                }
            )

        suggestions.sort(key=lambda item: item["confidence"], reverse=True)
        return suggestions

    @staticmethod
    def _extract_context(note_text: str, keyword: str) -> str:
        lowered_note = note_text.lower()
        keyword_index = lowered_note.find(keyword.lower())
        if keyword_index == -1:
            return ""

        start = max(keyword_index - 30, 0)
        end = min(keyword_index + len(keyword) + 30, len(note_text))
        return note_text[start:end].strip()