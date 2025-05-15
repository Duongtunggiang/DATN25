from flask import Flask, request, jsonify
import cv2
import pytesseract
import numpy as np
from PIL import Image
import io
import re

# Cấu hình đường dẫn Tesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = Flask(__name__)

# ---------- API OCR ----------
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

    match = re.search(r'\d{12}', text)
    if match:
        info['cccd'] = match.group()

    return info

@app.route("/api/ocr", methods=["POST"])
def ocr_cccd():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    image_bytes = file.read()

    try:
        info = extract_info_from_image(image_bytes)
        return jsonify(info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------- API Chatbot ----------
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data.get("message", "").lower()

    car_data = {
        "toyota": {"available": True, "price": 500000},
        "kia": {"available": False, "price": 400000}
    }
# Kiểm tra các câu hỏi chào hỏi
    greetings = ["xin chào", "chào bạn", "hi", "hello", "chào", "chào anh", "chào chị"]
    farewells = ["tạm biệt", "bye", "hẹn gặp lại", "chào tạm biệt", "goodbye"]
    asks_about_me = ["bạn ăn cơm chưa?", "bạn có khỏe không?", "hôm nay thế nào?", "bạn làm gì?"]

    # Kiểm tra các câu hỏi chào hỏi
    if any(greeting in user_input for greeting in greetings):
        return jsonify({"reply": "Xin chào, tôi là trợ lý ảo của bạn. Bạn cần giúp gì?"})

    # Kiểm tra các câu hỏi tạm biệt
    if any(farewell in user_input for farewell in farewells):
        return jsonify({"reply": "Tạm biệt, hẹn gặp lại bạn sau!"})

    # Kiểm tra các câu hỏi thăm
    if any(ask in user_input for ask in asks_about_me):
        return jsonify({"reply": "Mình ổn, cảm ơn bạn đã hỏi. Còn bạn thì sao?"})

    # Câu hỏi về xe
    for brand in car_data:
        if brand in user_input:  # Kiểm tra nếu thương hiệu xe có trong câu hỏi
            car = car_data[brand]
            available = "còn trống" if car["available"] else "đã thuê"
            return jsonify({
                "reply": f"Xe {brand.capitalize()} {available}, giá thuê: {car['price']} VND/ngày"
            })

    # Nếu không hiểu
    return jsonify({"reply": "Xin lỗi, tôi không hiểu câu hỏi của bạn."})

# ---------- Run App ----------
if __name__ == "__main__":
    app.run(port=5001)
