import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChatCUSMessage, sendTextMessage, getProfileByAccountId, sendImageMessage } from '../BackEnd/authen';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaUser, FaComments, FaUserFriends, FaCar, FaClock, FaImage } from 'react-icons/fa';
import '../css/chat.css';
import defaultAvatar from '../Images/avatars/default-avatar.png';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [chatInfo, setChatInfo] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUserId = parseInt(localStorage.getItem('userId'));

  useEffect(() => {
    if (!chatId) {
      toast.error('Không tìm thấy cuộc trò chuyện');
      navigate('/chat');
      return;
    }
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isNewMessage = lastMessage.timestamp > Date.now() - 5000; // 5 seconds threshold
      if (isNewMessage) {
        scrollToBottom();
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchPartnerProfile = async (accountId) => {
    try {
      console.log('Fetching profile for account:', accountId);
      const profile = await getProfileByAccountId(accountId);
      console.log('Received profile:', profile);
      
      if (profile && profile.firstName && profile.lastName && 
          !(profile.firstName === 'System' && profile.lastName === 'Admin')) {
        console.log('Setting partner profile:', profile);
        setPartnerProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching partner profile:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        navigate('/dang-nhap');
        return;
      }
      const response = await getChatCUSMessage(chatId);
      if (response && Array.isArray(response)) {
        const sortedMessages = response.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sortedMessages);
        if (sortedMessages.length > 0) {
          const firstMessage = sortedMessages[0];
          const partnerAccountId = firstMessage.isSender ? firstMessage.receiverAccountId : firstMessage.senderAccountId;
          const partnerName = firstMessage.isSender ? firstMessage.receiverName : firstMessage.senderName;
          
          console.log('Partner info:', { partnerAccountId, partnerName, message: firstMessage });
          
          setChatInfo({
            name: partnerName,
            accountId: partnerAccountId
          });

          if (partnerAccountId) {
            await fetchPartnerProfile(partnerAccountId);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn');
        navigate('/dang-nhap');
      } else {
        toast.error(error.response?.data || 'Không thể tải tin nhắn');
      }
    }
  };

  const handleImageSelect = (event) => {
    console.log('handleImageSelect called');
    const file = event.target.files[0];
    console.log('Selected file:', file);
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      console.log('Setting selected image and preview');
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('FileReader completed, setting preview');
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log('handleSendMessage called');
    console.log('Current state:', { newMessage, selectedImage, imagePreview });

    if (!newMessage.trim() && !selectedImage) {
      console.log('No message or image to send');
      return;
    }

    try {
      setIsLoading(true);
      let messageSent = false;

      // Send image if selected
      if (selectedImage) {
        console.log('Preparing to send image...');
        const formData = new FormData();
        formData.append('file', selectedImage);
        formData.append('chatId', chatId);

        console.log('FormData contents:', {
          file: selectedImage,
          chatId: chatId
        });

        try {
          const messageData = await sendImageMessage(formData);
          console.log('Image sent successfully:', messageData);
          messageSent = true;
        } catch (error) {
          console.error('Error sending image:', error);
          toast.error(error.message || 'Không thể gửi ảnh');
          return;
        }
      }

      // Send text message if there is text
      if (newMessage.trim()) {
        console.log('Sending text message...');
        try {
          await sendTextMessage(chatId, newMessage);
          messageSent = true;
        } catch (error) {
          console.error('Error sending text message:', error);
          toast.error('Không thể gửi tin nhắn');
          return;
        }
      }

      if (messageSent) {
        setNewMessage('');
        setSelectedImage(null);
        setImagePreview(null);
        await fetchMessages();
        toast.success('Gửi tin nhắn thành công');
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast.error('Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isThisYear = date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (isThisYear) {
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else {
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  };

  const shouldShowTime = (currentMessage, previousMessage, isLastMessage, isLastMessageOfType) => {
    // Always show time for the last message of each type (sent/received)
    if (isLastMessage || isLastMessageOfType) return true;
    
    if (!previousMessage) return true;
    
    const currentTime = new Date(currentMessage.timestamp);
    const previousTime = new Date(previousMessage.timestamp);
    const timeDiff = Math.abs(currentTime - previousTime);
    
    // Show time if messages are more than 35 minutes apart
    return timeDiff > 35 * 60 * 1000;
  };

  const shouldShowDate = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();
    
    return currentDate !== previousDate;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    
    if (isToday) {
      return 'Hôm nay';
    } else if (isYesterday) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return defaultAvatar;
    return `http://localhost:8080${avatarPath}`;
  };

  const renderMessageContent = (message) => {
    if (message.messageType === 'image') {
      return (
        <div className="chat-page-image-container">
          <img 
            src={`http://localhost:8080${message.content}`} 
            alt="Shared image" 
            className="chat-page-image"
            onClick={() => window.open(`http://localhost:8080${message.content}`, '_blank')}
          />
        </div>
      );
    }
    return <div className="chat-page-text-content">{message.content}</div>;
  };

  if (!chatId) {
    return (
      <div className="chat-page-default">
        <div className="chat-page-default-content">
          <div className="chat-page-default-icon">
            <FaComments size={64} color="#0084ff" />
          </div>
          <h2>Chào mừng đến với Chat</h2>
          <p>Hãy chọn một cuộc trò chuyện để bắt đầu</p>
          <div className="chat-page-default-features">
            <div className="chat-page-default-feature">
              <FaUserFriends size={24} />
              <span>Trò chuyện với chủ xe</span>
            </div>
            <div className="chat-page-default-feature">
              <FaCar size={24} />
              <span>Thảo luận về xe</span>
            </div>
            <div className="chat-page-default-feature">
              <FaClock size={24} />
              <span>Lịch sử trò chuyện</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-page-header">
        <div className="chat-page-header-info">
          <div className="chat-page-header-avatar">
            <img 
              src={getAvatarUrl(partnerProfile?.avatarPath)} 
              alt={partnerProfile ? `${partnerProfile.firstName} ${partnerProfile.lastName || ''}` : chatInfo?.name}
              onError={(e) => e.target.src = defaultAvatar}
            />
          </div>
          <div className="chat-page-header-name">
            <h3>
              {partnerProfile ? (
                <>
                  {partnerProfile.firstName} {partnerProfile.lastName || ''}
                </>
              ) : (
                chatInfo?.name || 'Đang tải...'
              )}
            </h3>
          </div>
        </div>
      </div>

      <div className="chat-page-messages" ref={messagesContainerRef}>
        {messages && messages.length > 0 ? (
          messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const isLastMessageOfType = !messages.slice(index + 1).some(m => m.isSender === message.isSender);
            const showTime = shouldShowTime(message, messages[index - 1], isLastMessage, isLastMessageOfType);
            const showDate = shouldShowDate(message, messages[index - 1]);
            const isSameSender = index > 0 && message.isSender === messages[index - 1].isSender;
            
            return (
              <React.Fragment key={message.id}>
                {showDate && (
                  <div className="chat-page-date-divider">
                    {formatDate(message.timestamp)}
                  </div>
                )}
                <div
                  className={`chat-page-message ${message.isSender ? 'chat-page-sent' : 'chat-page-received'} ${isSameSender ? 'chat-page-same-sender' : ''}`}
                >
                  {message.messageType === 'image' ? (
                    renderMessageContent(message)
                  ) : (
                    <div className="chat-page-content">
                      {renderMessageContent(message)}
                      {showTime && (
                        <div className="chat-page-time">
                          {formatTime(message.timestamp)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <div className="chat-page-no-messages">
            Chưa có tin nhắn nào
          </div>
        )}
        {isLoading && (
          <div className="chat-page-message chat-page-received">
            <div className="chat-page-typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-page-input-container">
        {imagePreview && (
          <div className="chat-page-image-preview">
            <img src={imagePreview} alt="Preview" />
            <div className="chat-page-image-actions">
              <button 
                type="button"
                className="chat-page-cancel-image"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}
        <div className="chat-page-input-wrapper">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="chat-page-image-button"
            onClick={() => fileInputRef.current.click()}
          >
            <FaImage />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            disabled={isLoading}
            className="chat-page-input"
          />
          <button
            type="submit"
            className="chat-page-send-button"
            disabled={isLoading || (!newMessage.trim() && !selectedImage)}
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage; 