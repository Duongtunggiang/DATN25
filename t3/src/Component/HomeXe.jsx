import React, { useEffect, useState } from 'react';
import { getCustomerChats } from '../BackEnd/authen';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HomeXe = () => {
  const [chats, setChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchChats();
    // Set up polling for new messages
    const interval = setInterval(fetchChats, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchChats = async () => {
    try {
      const chatData = await getCustomerChats();
      setChats(chatData);
      
      // Count unread messages
      const unread = chatData.reduce((count, chat) => {
        return count + (chat.unreadMessages || 0);
      }, 0);
      
      if (unread > unreadCount) {
        // Show notification for new messages
        toast.info(`Bạn có ${unread} tin nhắn chưa đọc`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  // ... rest of your component code ...

  return (
    <div>
      {/* Your existing JSX */}
      {unreadCount > 0 && (
        <div className="notification-badge">
          {unreadCount}
        </div>
      )}
    </div>
  );
};

export default HomeXe; 