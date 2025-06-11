document.addEventListener('DOMContentLoaded', () => {
  const chatbotIcon = document.getElementById('chatbot-icon');
  const chatContainer = document.getElementById('chat-container');
  const closeChatBtn = document.getElementById('close-chat');
  const sendBtn = document.getElementById('send-btn');
  const messageInput = document.getElementById('message-input');
  const messagesDiv = document.getElementById('chat-messages');
  const typingIndicator = document.getElementById('typing-indicator');

  // Mở/đóng chat
  chatbotIcon.addEventListener('click', () => {
    chatContainer.classList.toggle('hidden');
  });

  closeChatBtn.addEventListener('click', () => {
    chatContainer.classList.add('hidden');
  });

  // Hàm gửi tin nhắn
  const sendMessage = () => {
    const message = messageInput.value.trim();
    if (message) {
      addMessage(message, 'user');
      messageInput.value = '';
      
      // --- [Mới] Hiển thị hiệu ứng đang chờ ---
      typingIndicator.classList.remove('hidden');
      messagesDiv.scrollTop = messagesDiv.scrollHeight; // Cuộn xuống để thấy hiệu ứng

      fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        // --- [Mới] Ẩn hiệu ứng và thêm tin nhắn của bot ---
        typingIndicator.classList.add('hidden');
        addMessage(data.response, 'bot');
      })
      .catch(error => {
        console.error('Error:', error);
        // --- [Mới] Ẩn hiệu ứng và thêm tin nhắn lỗi ---
        typingIndicator.classList.add('hidden');
        addMessage('Rất tiếc, có lỗi xảy ra. Vui lòng thử lại!', 'bot');
      });
    }
  };

  // Gửi bằng nút Send
  sendBtn.addEventListener('click', sendMessage);

  // --- [Mới] Gửi bằng phím Enter ---
  messageInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  // Hàm thêm tin nhắn vào giao diện
  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Tự động cuộn xuống tin nhắn mới nhất
  }
});