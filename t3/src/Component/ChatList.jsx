import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getChatsByCustomer, getChatsByCarOwner, GetProfile, getProfileByAccountId, getChatCUSMessage } from '../BackEnd/authen';
import { FaUser, FaComments } from 'react-icons/fa';
import '../css/chat.css';
import { toast } from 'react-hot-toast';
import defaultAvatar from '../Images/avatars/default-avatar.png';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [chatProfiles, setChatProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { chatId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decodedToken = JSON.parse(jsonPayload);
      console.log('Decoded token:', decodedToken);
      setUserRole(decodedToken.role);
    }
  }, []);

  const fetchChatPartnerProfile = async (accountId) => {
    try {
      // Chỉ fetch nếu chưa có profile hoặc profile hiện tại là System Admin
      const currentProfile = chatProfiles[accountId];
      const isSystemAdmin = currentProfile?.firstName === 'System' && currentProfile?.lastName === 'Admin';
      
      if (!currentProfile || isSystemAdmin) {
        console.log('Fetching profile for account:', accountId);
        const profile = await getProfileByAccountId(accountId);
        console.log('Received profile:', profile);
        
        // Chỉ lưu profile nếu không phải System Admin và có đầy đủ thông tin
        if (profile && profile.firstName && profile.lastName && 
            !(profile.firstName === 'System' && profile.lastName === 'Admin')) {
          console.log('Saving profile for account:', accountId, profile);
          setChatProfiles(prev => {
            const newProfiles = {
              ...prev,
              [accountId]: profile
            };
            console.log('Updated profiles:', newProfiles);
            return newProfiles;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching chat partner profile:', error);
    }
  };

  const fetchMessagesAndProfile = async (chatId) => {
    try {
      const messages = await getChatCUSMessage(chatId);
      console.log('Messages:', messages);
      
      if (messages && messages.length > 0) {
        const firstMessage = messages[0];
        const receiverId = firstMessage.receiverId;
        console.log('Receiver ID from message:', receiverId);
        
        if (receiverId) {
          await fetchChatPartnerProfile(receiverId);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (userRole) {
      fetchChats();
    }
  }, [userRole]);

  useEffect(() => {
    if (chatId) {
      setSelectedChat(chatId);
      fetchMessagesAndProfile(chatId);
    }
  }, [chatId]);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return defaultAvatar;
    return `http://localhost:8080${avatarPath}`;
  };

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching chats for role:', userRole);
      let response;
      if (userRole === 'CUSTOMER') {
        response = await getChatsByCustomer();
      } else if (userRole === 'CAR_OWNER') {
        response = await getChatsByCarOwner();
      }
      
      console.log('Raw chat response:', response);
      
      if (response && Array.isArray(response)) {
        let unreadCount = 0;
        const chatsWithUnread = await Promise.all(response.map(async (chat) => {
          console.log('Processing chat:', chat);
          const unread = chat.unreadCount || 0;
          unreadCount += unread;
          
          // Lấy account ID của người đang chat với mình
          let partnerAccountId;
          let partnerName;
          if (userRole === 'CUSTOMER') {
            partnerAccountId = chat.carOwnerAccountId;
            partnerName = chat.carOwnerName;
            console.log('Customer chatting with car owner account:', partnerAccountId, 'Name:', partnerName, 'Chat data:', chat);
          } else {
            partnerAccountId = chat.customerAccountId;
            partnerName = chat.customerName;
            console.log('Car owner chatting with customer account:', partnerAccountId, 'Name:', partnerName, 'Chat data:', chat);
          }
          
          // Fetch profile của người đang chat
          if (partnerAccountId) {
            console.log('Fetching profile for partner account ID:', partnerAccountId);
            await fetchChatPartnerProfile(partnerAccountId);
          }
          
          return {
            ...chat,
            unreadCount: unread,
            partnerAccountId: partnerAccountId,
            partnerName: partnerName,
            lastMessage: chat.lastMessage || 'Chưa có tin nhắn',
            lastMessageTime: chat.lastMessageTime
          };
        }));
        
        console.log('Processed chats:', chatsWithUnread);
        console.log('Current chatProfiles:', chatProfiles);
        setUnreadMessages(unreadCount);
        setChats(chatsWithUnread);
      } else {
        console.log('Invalid response format:', response);
        setChats([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Không thể tải danh sách chat');
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatClick = (chatId) => {
    setSelectedChat(chatId);
    navigate(`/chat/${chatId}`);
    // Refresh chat list to update unread counts
    fetchChats();
  };

  if (isLoading) {
    return (
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <div className="chat-sidebar-title">
            <FaComments className="chat-sidebar-icon" />
            <h2>Tin nhắn</h2>
          </div>
        </div>
        <div className="chat-sidebar-content p-3">
          <div className="loading-chats">
            Đang tải danh sách chat...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <div className="chat-sidebar-title">
          <FaComments className="chat-sidebar-icon" />
          <h2>Tin nhắn {unreadMessages > 0 && <span className="unread-badge">{unreadMessages}</span>}</h2>
        </div>
      </div>
      <div className="chat-sidebar-content p-3">
        {chats && chats.length > 0 ? (
          chats.map((chat) => {
            const partnerProfile = chatProfiles[chat.partnerAccountId];
            console.log('Rendering chat with partner profile:', partnerProfile, 'for partnerAccountId:', chat.partnerAccountId, 'Chat data:', chat);
            return (
              <div
                key={chat.id}
                className={`chat-sidebar-item ${chatId === chat.id ? 'active' : ''}`}
                onClick={() => handleChatClick(chat.id)}
              >
                <div className="chat-sidebar-avatar">
                  <img
                    src={getAvatarUrl(partnerProfile?.avatarPath)}
                    alt={partnerProfile ? `${partnerProfile.firstName} ${partnerProfile.lastName || ''}` : chat.partnerName}
                    onError={(e) => e.target.src = defaultAvatar}
                  />
                </div>
                <div className="chat-sidebar-info">
                  <div className="chat-sidebar-name">
                    {partnerProfile ? (
                      <>
                        {partnerProfile.firstName} {partnerProfile.lastName || ''}
                      </>
                    ) : (
                      chat.partnerName || 'Đang tải...'
                    )}
                  </div>
                  <div className="chat-sidebar-preview">
                    {chat.lastMessage}
                    {chat.lastMessageTime && (
                      <span className="chat-sidebar-time">
                        {new Date(chat.lastMessageTime).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </span>
                    )}
                  </div>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="chat-sidebar-unread">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-chats">
            Chưa có cuộc trò chuyện nào
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList; 