import cv2
import pytesseract
import numpy as np
from PIL import Image
import io
import base64
import re

# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def clean_text(text):
    text = re.sub(r'[^\w\s/]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_info_from_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    open_cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    
    text = pytesseract.image_to_string(open_cv_image, lang='eng+vie', config='--psm 6')
    text = clean_text(text)
    
    print("Raw OCR text:", text)  

    info = {
        "raw_text": text,
        "firstName": None,
        "lastName": None,
        "cccd": None,
        "dob": None
    }

    cccd_match = re.search(r'\d{12}', text)
    if cccd_match:
        info['cccd'] = cccd_match.group()

    dob_pattern = r'Ngay sinh.*?(\d{2}/\d{2}/\d{4})'
    dob_match = re.search(dob_pattern, text, re.IGNORECASE)
    if dob_match:
        dob = dob_match.group(1)
        day, month, year = dob.split('/')
        info['dob'] = f"{year}-{month}-{day}"

    # Pattern mới: tìm tên viết hoa, chỉ lấy các từ viết hoa liên tiếp
    name_pattern = r'(?:Ho va ten|Full name).*?((?:[A-Z][A-Z\s]*?)(?=\s*Ngay sinh|$))'
    name_match = re.search(name_pattern, text, re.IGNORECASE)
    
    if name_match:
        full_name = name_match.group(1).strip()
        print("Found full name:", full_name)
        
        # Chỉ lấy các từ viết hoa
        name_parts = [part for part in full_name.split() if part.isupper()]
        
        if len(name_parts) >= 2:
            info['lastName'] = name_parts[-1]
            info['firstName'] = ' '.join(name_parts[:-1])
        else:
            info['firstName'] = full_name

    print("Extracted info:", info) 
    return info
