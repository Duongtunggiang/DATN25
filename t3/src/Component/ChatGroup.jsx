import React, { useEffect, useState } from 'react';
import { getChatMessages, sendChatMessage } from '../BackEnd/authen';

const ChatPopup = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchMessages = async () => {
    try {
      const data = await getChatMessages();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSend = async () => {
    if (newMessage.trim() === '') return;

    try {
      const userMsg = { sender: 'User', content: newMessage };
      setMessages((prev) => [...prev, userMsg]);

      const botReply = await sendChatMessage(newMessage);

      const botMsg = { sender: 'Bot', content: botReply };
      setMessages((prev) => [...prev, botMsg]);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary rounded-circle"
        style={{ width: 60, height: 60 }}
      >
        💬
      </button>

      {isOpen && (
        <div
          style={{
            width: 300,
            height: 400,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 10,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: 10 }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                <strong>{msg.sender}:</strong> {msg.content}
              </div>
            ))}
          </div>
          <div className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="btn btn-success" onClick={handleSend}>
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
