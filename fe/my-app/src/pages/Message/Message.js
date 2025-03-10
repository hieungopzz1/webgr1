import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import './Message.css';

const Message = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    if (id) {
      fetchMessages(id);
    }
  }, [id]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/messages/users');
      setUsers(response.data);
      if (id) {
        const selected = response.data.find(user => user._id === id);
        setSelectedUser(selected);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('text', newMessage);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await api.post(`/messages/send/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="message-page">
      <div className="message-sidebar">
        <div className="message-sidebar__header">
          <h2>Messages</h2>
        </div>
        <div className="message-sidebar__users">
          {users.map((user) => (
            <div
              key={user._id}
              className={`message-sidebar__user ${selectedUser?._id === user._id ? 'active' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="message-sidebar__user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.firstName} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.firstName[0]}
                  </div>
                )}
              </div>
              <div className="message-sidebar__user-info">
                <h3>{user.firstName} {user.lastName}</h3>
                <p>{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="message-content">
        {selectedUser ? (
          <>
            <div className="message-content__header">
              <div className="message-content__user-info">
                <div className="message-content__user-avatar">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.firstName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {selectedUser.firstName[0]}
                    </div>
                  )}
                </div>
                <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
              </div>
            </div>

            <div className="message-content__messages">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`message ${
                    message.senderType === 'tutor' ? 'sent' : 'received'
                  }`}
                >
                  {message.image && (
                    <div className="message-image">
                      <img src={message.image} alt="Shared" />
                    </div>
                  )}
                  {message.text && <div className="message-text">{message.text}</div>}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-content__input" onSubmit={handleSendMessage}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept="image/*"
              />
              <button
                type="button"
                className="message-content__attach"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="bi bi-paperclip"></i>
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-content__text-input"
              />
              <button type="submit" className="message-content__send">
                <i className="bi bi-send"></i>
              </button>
            </form>
          </>
        ) : (
          <div className="message-content__empty">
            <i className="bi bi-chat-dots"></i>
            <h2>Select a conversation to start messaging</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;