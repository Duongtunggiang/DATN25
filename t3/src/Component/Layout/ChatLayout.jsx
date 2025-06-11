import React from 'react';
import { Outlet } from 'react-router-dom';
import ChatList from '../ChatList';
import '../../css/chat.css';

const ChatLayout = () => {
  return (
    <div className="chat-layout mt-3 mb-5 px-5 shadow ">
      <ChatList />
      <div className="chat-main-content ">
        <Outlet />
      </div>
    </div>
  );
};

export default ChatLayout; 