import React, { useEffect, useState, useRef } from 'react';
import { getChatMessages, sendChatMessage } from '../BackEnd/authen';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa';
import '../css/ChatBot.css';

const ChatPopup = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const data = await getChatMessages();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (newMessage.trim() === '') return;

    try {
      setIsLoading(true);
      const userMsg = { sender: 'User', content: newMessage };
      setMessages((prev) => [...prev, userMsg]);
      setNewMessage('');

      const botReply = await sendChatMessage(newMessage);
      const botMsg = { sender: 'Bot', content: botReply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-widget">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-button"
          title="Mở chat bot"
        >
          <FaRobot className="chatbot-icon" />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-popup">
            <div className="chatbot-header">
              <div className="chatbot-title">
                <FaRobot className="chatbot-icon" />
                <span>Chat Bot Hỗ Trợ</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="chatbot-close-button"
                title="Đóng chat"
              >
                <FaTimes />
              </button>
            </div>

            <div className="chatbot-messages">
              <div className="chatbot-welcome-message">
                <FaRobot className="chatbot-welcome-icon" />
                <div className="chatbot-welcome-text">
                  <h3>Xin chào! 👋</h3>
                  <p>Tôi có thể giúp gì cho bạn?</p>
                </div>
              </div>

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chatbot-message ${msg.sender === 'User' ? 'chatbot-user-message' : 'chatbot-bot-message'}`}
                >
                  <div className="chatbot-message-content">
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="chatbot-message chatbot-bot-message">
                  <div className="chatbot-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input">
              <input
                type="text"
                placeholder="Nhập tin nhắn của bạn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                className="chatbot-send-button"
                disabled={isLoading || !newMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
