from fastapi import HTTPException, UploadFile, status


class NoteFileParser:
    allowed_content_types = {"text/plain", "application/octet-stream"}

    async def parse_upload(self, note_file: UploadFile) -> str:
        if note_file.content_type not in self.allowed_content_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Please upload a plain text file.",
            )

        raw_bytes = await note_file.read()
        if not raw_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        try:
            return raw_bytes.decode("utf-8").strip()
        except UnicodeDecodeError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be UTF-8 encoded text.",
            ) from exc