import cv2
import pytesseract
import numpy as np
from PIL import Image
import io
import base64

# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_info_from_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    open_cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    
    text = pytesseract.image_to_string(open_cv_image, lang='eng+vie')

    info = {
        "raw_text": text,
        "name": None,
        "cccd": None,
        "dob": None
    }

    import re
    match = re.search(r'\d{12}', text)
    if match:
        info['cccd'] = match.group()

    return info
