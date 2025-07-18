import fitz
import requests
import io

def extract_chunks(pdf_path, chunk_size=400):
    doc = fitz.open(pdf_path)
    chunks = []
    for page in doc:
        text = page.get_text() # type: ignore
        for i in range(0, len(text), chunk_size):
            chunk = text[i:i + chunk_size].strip()
            if chunk:
                chunks.append(chunk)
    return chunks

import requests
import io
import fitz  # PyMuPDF

def extract_text_from_pdf_url(pdf_url):
    try:
        response = requests.get(pdf_url)

        if response.status_code != 200:
            raise Exception("Failed to download PDF")

        pdf_bytes = io.BytesIO(response.content)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        text = ""
        for i, page in enumerate(doc):
            page_text = page.get_text()
            text += page_text

        return text

    except Exception as e:
        raise


def extract_text_from_pdf_path(path):
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text()  # type: ignore
    return text

def chunk_text(text, chunk_size=400):
    return [text[i:i + chunk_size].strip() for i in range(0, len(text), chunk_size) if text[i:i + chunk_size].strip()]
