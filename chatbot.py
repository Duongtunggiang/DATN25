from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data.get("message", "").lower()  # Chuyển tất cả về chữ thường

    # Giả lập dữ liệu (sau này thay bằng truy vấn DB hoặc API từ Java)
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

if __name__ == "__main__":
    app.run(port=5001)
