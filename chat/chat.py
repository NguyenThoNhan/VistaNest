from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)  # Cho phép Live Server kết nối (port 5500)
API_KEY = "AIzaSyB7Gc9KiKhOGt0BozqyT4incDzmrZ6ppb0"  # Thay bằng API key thực tế của bạn
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')
chat = model.start_chat()

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    try:
        userInput = request.json.get('message')
        if not userInput:
            return jsonify({'response': 'Vui lòng nhập tin nhắn!'})
        if userInput.lower() == 'exit':
            return jsonify({'response': 'Tạm biệt! Hẹn gặp lại!'})
        response = chat.send_message(userInput)
        return jsonify({'response': response.text})
    except Exception as e:
        return jsonify({'response': f'Lỗi: {str(e)}'})

if __name__ == '__main__':
    app.run(port=5000, debug=True)