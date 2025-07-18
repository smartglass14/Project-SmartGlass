from pydantic import BaseModel

class PDFUploadInput(BaseModel):
    file_url: str
    user_id: str = "default"

class QuestionInput(BaseModel):
    question: str
    user_id: str = "default"

class SummaryOptions(BaseModel):
    bullet_points: bool = False
    max_tokens: int = 4000