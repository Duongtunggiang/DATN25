from flask import Flask, request, jsonify
import cv2
import pytesseract
import numpy as np
from PIL import Image
import io
import re
import mysql.connector
from ocr_utils import extract_info_from_image

# ---------- CẤU HÌNH ----------
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
app = Flask(__name__)

# ---------- HÀM HỖ TRỢ DB ----------
def get_all_brands():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="3112",
        database="api520"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT brand FROM car")
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return [r[0].lower() for r in results]

def get_car_data_from_db(brand):
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="3112",
        database="api520"
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM car WHERE car_name = %s", (brand,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result

# ---------- API OCR ----------
@app.route("/api/ocr", methods=["POST"])
def ocr_cccd():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    image_bytes = file.read()

    try:
        info = extract_info_from_image(image_bytes)
        print("OCR Result:", info)  # Debug log
        return jsonify(info)
    except Exception as e:
        print("OCR Error:", str(e))  # Debug log
        return jsonify({"error": str(e)}), 500

# ---------- API CHATBOT ----------
@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(force=True)
        user_input = data.get("message", "").lower()
    except Exception as e:
        return jsonify({"reply": f"Lỗi định dạng JSON: {str(e)}"}), 400

    brands = get_all_brands()
    for brand in brands:
        if brand in user_input:
            car = get_car_data_from_db(brand)
            print(">>> car from DB:", car)  # Debug
            if car:
                available_status = car.get("available", "").lower()
                available = "còn trống" if available_status == "available" else "đã thuê"
                return jsonify({
                    "reply": f"Xe {brand.capitalize()} {available}, giá thuê: {car.get('price', 'N/A')} VND/ngày"
                })
            else:
                return jsonify({"reply": f"Hiện không có thông tin về xe {brand}."})


    # Câu chào hỏi
    greetings = ["xin chào", "chào bạn", "hi", "hello", "chào", "chào anh", "chào chị"]
    farewells = ["tạm biệt", "bye", "hẹn gặp lại", "chào tạm biệt", "goodbye"]
    asks_about_me = ["bạn ăn cơm chưa?", "bạn có khỏe không?", "hôm nay thế nào?", "bạn làm gì?"]

    if any(greeting in user_input for greeting in greetings):
        return jsonify({"reply": "Xin chào, tôi là trợ lý ảo của bạn. Bạn cần giúp gì?"})

    if any(farewell in user_input for farewell in farewells):
        return jsonify({"reply": "Tạm biệt, hẹn gặp lại bạn sau!"})

    if any(ask in user_input for ask in asks_about_me):
        return jsonify({"reply": "Mình ổn, cảm ơn bạn đã hỏi. Còn bạn thì sao?"})

    # Không hiểu nội dung
    return jsonify({"reply": "Xin lỗi, tôi không hiểu câu hỏi của bạn."})

# ---------- CHẠY APP ----------
if __name__ == "__main__":
    app.run(port=5001)
