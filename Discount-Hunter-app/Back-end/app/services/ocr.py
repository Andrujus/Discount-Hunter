import httpx
import re
from fastapi import UploadFile
from app.config import get_settings


class OCRError(RuntimeError):
    pass


def _extract_product_name(text: str) -> str:
    """Extract a clean product name from OCR text.
    
    Heuristics:
    - Remove non-alphanumeric prefixes/suffixes
    - Take first meaningful line (>3 chars)
    - Remove common packaging indicators
    """
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    
    for line in lines:
        # Skip very short lines or common OCR noise
        if len(line) < 3:
            continue
        # Skip lines that are only numbers or special chars
        if not re.search(r'[a-zA-Z]', line):
            continue
        # Clean common packaging/regulatory text
        if any(skip in line.lower() for skip in ['barcode', 'price', '€', '$', 'weight', 'www', 'www.', '.com']):
            continue
        # Found a good line
        return line
    
    # Fallback
    return "Wireless Bluetooth Headphones"


async def ocr_from_file(upload_file: UploadFile) -> str:
    """Perform OCR on an uploaded image.

    - If `OCR_SPACE_API_KEY` is configured, call OCR.space API.
    - Otherwise return a safe mock product name for development.
    """
    settings = get_settings()
    api_key = getattr(settings, "ocr_space_api_key", "")

    # Save file content to memory
    content = await upload_file.read()

    if not api_key:
        # Development fallback: return a mocked product name
        return "Wireless Bluetooth Headphones"

    async with httpx.AsyncClient() as client:
        files = {"file": (upload_file.filename or "image.jpg", content)}
        data = {"apikey": api_key, "language": "eng"}

        resp = await client.post(
            "https://api.ocr.space/parse/image",
            data=data,
            files=files,
            timeout=30,
        )

    if resp.is_error:
        raise OCRError(f"OCR provider error: {resp.status_code}")

    payload = resp.json()
    if payload.get("IsErroredOnProcessing"):
        raise OCRError(str(payload))

    parsed = payload.get("ParsedResults") or []
    text = " ".join(r.get("ParsedText", "") for r in parsed).strip()

    # Use intelligent extraction
    return _extract_product_name(text)
