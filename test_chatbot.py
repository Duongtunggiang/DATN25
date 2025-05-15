import requests

url = 'http://localhost:5001/api/chat'

while True:
    message = input("Bạn: ")
    if message.lower() == 'exit':
        break

    try:
        response = requests.post(url, json={"message": message})
        reply = response.json().get("reply")
        print("Chatbot:", reply)
    except Exception as e:
        print("Chatbot: Xin lỗi, có lỗi xảy ra.")
