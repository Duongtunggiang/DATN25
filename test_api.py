import requests

url = 'http://localhost:5001/api/ocr'
files = {'file': open('C:/Users/asus/OneDrive/Hình ảnh/Saved Pictures/Giàng Tùng Dương.jpg', 'rb')}

response = requests.post(url, files=files)

print(response.json())
