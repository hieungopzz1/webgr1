import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import InputField from '../../components/inputField/InputField';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Message.css';

const Message = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/api/messages/users');
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
        if (id) {
          const selected = response.data.find(user => user._id === id);
          setSelectedUser(selected || null);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [id]);

  const fetchMessages = useCallback(async (userId) => {
    try {
      const response = await api.get(`/api/messages/${userId}`);
      if (response.data && Array.isArray(response.data)) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    if (id) {
      fetchMessages(id);
    }
  }, [id, fetchUsers, fetchMessages]);

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
      if (newMessage.trim()) {
        formData.append('text', newMessage.trim());
      }
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await api.post(`/api/messages/send/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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
                  <img src={user.avatar} alt={user.firstName || 'User'} />
                ) : (
                  <div className="avatar-placeholder">
                    {(user.firstName || 'U')[0]}
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
                    <img src={selectedUser.avatar} alt={selectedUser.firstName || 'User'} />
                  ) : (
                    <div className="avatar-placeholder">
                      {(selectedUser.firstName || 'U')[0]}
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
              <InputField
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-content__text-input"
                fullWidth
                size="small"
                variant="standard"
                endAdornment={
                  <button type="submit" className="message-content__send">
                    <i className="bi bi-send"></i>
                  </button>
                }
              />
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