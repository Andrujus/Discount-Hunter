import httpx
import re
import io
from fastapi import UploadFile
from app.config import get_settings
from PIL import Image, ImageEnhance, ImageOps


class OCRError(RuntimeError):
    pass


def _preprocess_image(image_bytes: bytes) -> bytes:
    """Preprocess image for better OCR: convert to grayscale, enhance contrast, auto-orient."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        # Auto-orient based on EXIF
        img = ImageOps.exif_transpose(img)
        
        # Convert to grayscale
        img = img.convert('L')
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2.0)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.5)
        
        # Save to bytes
        output = io.BytesIO()
        img.save(output, format='PNG')
        return output.getvalue()
    except Exception:
        # If preprocessing fails, return original
        return image_bytes


def _extract_product_name(text: str) -> str:
    """Extract a clean product name from OCR text with improved heuristics."""
    if not text or not text.strip():
        return "Unknown Product"
    
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    
    # Filter valid product-related lines
    valid_lines = []
    for line in lines:
        # Skip very short lines
        if len(line) < 2:
            continue
        # Skip lines that are only numbers or special chars
        if not re.search(r'[a-zA-Z]', line):
            continue
        
        lower_line = line.lower()
        
        # Skip obvious noise
        if any(skip in lower_line for skip in [
            'www.', 'http://', 'https://',
            'barcode:', 'scan here'
        ]):
            continue
        
        # Skip pure price patterns
        if re.match(r'^[€$£¥]?\s*\d+[.,]\d{2}\s*[€$£¥]?$', line.strip()):
            continue
        
        valid_lines.append(line)
    
    if not valid_lines:
        return "Unknown Product"
    
    # Try to combine first 2-3 lines if they seem related (brand + product name + variant)
    if len(valid_lines) >= 2:
        # Check if first few lines have good content
        combined_candidates = []
        
        # Try first 2 lines
        two_line = ' '.join(valid_lines[:2])
        if 10 <= len(two_line) <= 100:
            combined_candidates.append(two_line)
        
        # Try first 3 lines if available
        if len(valid_lines) >= 3:
            three_line = ' '.join(valid_lines[:3])
            if 15 <= len(three_line) <= 100:
                combined_candidates.append(three_line)
        
        # Pick the best multi-line combination
        if combined_candidates:
            # Prefer longer but not too long
            best = max(combined_candidates, key=lambda x: len(x) if len(x) <= 80 else 40)
            product_name = ' '.join(best.split())
            return product_name[:80]
    
    # Fall back to single best line
    candidates = []
    for line in valid_lines:
        alpha_count = sum(c.isalpha() for c in line)
        digit_count = sum(c.isdigit() for c in line)
        
        if alpha_count > digit_count:
            score = alpha_count * 2.0
        else:
            score = alpha_count * 0.5
        
        if 5 <= len(line) <= 50:
            score *= 1.5
        
        candidates.append((score, line))
    
    if candidates:
        candidates.sort(reverse=True)
        product_name = candidates[0][1]
        product_name = ' '.join(product_name.split())
        return product_name[:80]
    
    # Last resort
    return valid_lines[0][:60] if valid_lines else "Unknown Product"


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
        return "Unknown Product (No OCR API Key)"

    # Preprocess image for better OCR
    processed_content = _preprocess_image(content)

    async with httpx.AsyncClient() as client:
        # Always use .png extension since we convert to PNG
        filename = "image.png"
        files = {"file": (filename, processed_content, "image/png")}
        data = {
            "apikey": api_key,
            "language": "eng",
            "isOverlayRequired": "false",
            "OCREngine": "2",
            "filetype": "PNG"
        }

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

    # Debug: print raw OCR text
    print(f"[OCR DEBUG] Raw text from OCR: {text[:200]}..." if len(text) > 200 else f"[OCR DEBUG] Raw text from OCR: {text}")
    
    # Use intelligent extraction
    extracted = _extract_product_name(text)
    print(f"[OCR DEBUG] Extracted product name: {extracted}")
    
    return extracted
