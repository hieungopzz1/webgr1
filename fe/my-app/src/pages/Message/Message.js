import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import InputField from '../../components/inputField/InputField';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Message.css';
import socket from '../../context/socket';
import useAuth from '../../hooks/useAuth';

const Message = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [offlineUsers, setOfflineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [notification, setNotification] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState({});
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const { user } = useAuth();
    const loggedInUserId = user?.id;

    const fetchAllUsers = async () => {
        try {
            const allUsersResponse = await api.get('/api/messages/users');
            const onlineUsersResponse = await api.get('/api/messages/online-users');
            console.log('API /api/users response:', allUsersResponse.data);
            console.log('API /api/online-users response:', onlineUsersResponse.data);

            if (allUsersResponse.data && Array.isArray(allUsersResponse.data) && 
                onlineUsersResponse.data && Array.isArray(onlineUsersResponse.data)) {
                const onlineIds = onlineUsersResponse.data.map((u) => u.id);
                const filteredAllUsers = allUsersResponse.data.filter((u) => u.id !== loggedInUserId);

                const online = filteredAllUsers.filter((u) => onlineIds.includes(u.id));
                const offline = filteredAllUsers.filter((u) => !onlineIds.includes(u.id));

                setOnlineUsers(online);
                setOfflineUsers(offline);

                if (id) {
                    const selected = filteredAllUsers.find((u) => u.id === id);
                    setSelectedUser(selected || null);
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error.response?.data || error.message);
        }
    };

    const fetchMessages = async (receiverId) => {
        try {
            const response = await api.get(`/api/messages/${receiverId}`);
            console.log('Fetched messages:', response.data);
            if (response.data && Array.isArray(response.data)) {
                setMessages(response.data);
                setUnreadMessages((prev) => ({ ...prev, [receiverId]: 0 }));
            }
        } catch (error) {
            console.error('Error fetching messages:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        if (!loggedInUserId) {
            console.log('Waiting for loggedInUserId...');
            return;
        }

        console.log('Connecting Socket.IO with userId:', loggedInUserId);
        socket.io.opts.query = { userId: loggedInUserId };
        socket.connect();

        socket.on('connect', () => {
            console.log('Socket connected. Socket ID:', socket.id);
            socket.emit('register', { 
                userId: loggedInUserId, 
                role: user.role, 
                firstName: user.firstName, 
                lastName: user.lastName 
            });
        });

        socket.on('onlineUsers', () => {
            console.log('Socket received online users');
            fetchAllUsers();
        });

        socket.on('newMessage', (newMessageData) => {
            console.log('New message received:', newMessageData);
            if (
                (newMessageData.senderId === id && newMessageData.receiverId === loggedInUserId) ||
                (newMessageData.senderId === loggedInUserId && newMessageData.receiverId === id)
            ) {
                setMessages((prev) => [...prev, newMessageData]);
            }

            if (newMessageData.senderId !== loggedInUserId && newMessageData.senderId !== selectedUser?.id) {
                setUnreadMessages((prev) => ({
                    ...prev,
                    [newMessageData.senderId]: (prev[newMessageData.senderId] || 0) + 1,
                }));
            }

            if (newMessageData.senderId !== loggedInUserId) {
                const sender = [...onlineUsers, ...offlineUsers].find((u) => u.id === newMessageData.senderId);
                setNotification({
                    message: `${sender ? `${sender.firstName} ${sender.lastName}` : 'Someone'} sent you a message`,
                    timestamp: Date.now(),
                });
                setTimeout(() => setNotification(null), 3000);
            }
        });

        fetchAllUsers();
        if (id) {
            fetchMessages(id);
        }

        return () => {
            console.log('Disconnecting Socket.IO');
            socket.off('connect');
            socket.off('onlineUsers');
            socket.off('newMessage');
            socket.disconnect();
        };
    }, [id, loggedInUserId, user?.role, user?.firstName, user?.lastName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedFile && !selectedUser?.id) return;

        try {
            const formData = new FormData();
            if (newMessage.trim()) formData.append('text', newMessage.trim());
            if (selectedFile) formData.append('image', selectedFile);
            if (selectedUser?.id) formData.append('receiverId', selectedUser.id);

            const tempMessage = {
                _id: `temp-${Date.now()}`,
                senderId: loggedInUserId,
                receiverId: selectedUser.id,
                text: newMessage.trim() || '',
                image: selectedFile ? URL.createObjectURL(selectedFile) : null,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, tempMessage]);
            setNewMessage('');
            setSelectedFile(null);

            const response = await api.post('/api/messages/send', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Message sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending message:', error.response?.data || error.message);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    return (
        <div className="message-page">
            {notification && (
                <div className="notification-toast">
                    {notification.message}
                </div>
            )}

            <div className="message-sidebar">
                <div className="message-sidebar__header">
                    <h2>Messages</h2>
                </div>

                {/* Online users */}
                <div className="message-sidebar__section">
                    <h3 className="message-sidebar__section-title">Online</h3>
                    <div className="message-sidebar__users">
                        {onlineUsers.map((user) => (
                            <div
                                key={user.id}
                                className={`message-sidebar__user ${selectedUser?.id === user.id ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedUser(user);
                                    navigate(`/messages/${user.id}`);
                                    fetchMessages(user.id);
                                }}
                            >
                                <div className="message-sidebar__user-avatar">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {(user.firstName || 'U')[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="message-sidebar__user-info">
                                    <h3>
                                        {user.firstName} {user.lastName}
                                        {unreadMessages[user.id] > 0 && (
                                            <span className="unread-count">1</span>
                                        )}
                                    </h3>
                                    <p>{user.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Offline users */}
                <div className="message-sidebar__section">
                    <h3 className="message-sidebar__section-title">Offline</h3>
                    <div className="message-sidebar__users scrollable-list">
                        {offlineUsers.map((user) => (
                            <div
                                key={user.id}
                                className={`message-sidebar__user ${selectedUser?.id === user.id ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedUser(user);
                                    navigate(`/messages/${user.id}`);
                                    fetchMessages(user.id);
                                }}
                            >
                                <div className="message-sidebar__user-avatar">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {(user.firstName || 'U')[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="message-sidebar__user-info">
                                    <h3>
                                        {user.firstName} {user.lastName}
                                        {unreadMessages[user.id] > 0 && (
                                            <span className="unread-count">1</span>
                                        )}
                                    </h3>
                                    <p>{user.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="message-content">
                {selectedUser ? (
                    <>
                        <div className="message-content__header">
                            <div className="message-content__user-info">
                                <div className="message-content__user-avatar">
                                    {selectedUser.avatar ? (
                                        <img src={selectedUser.avatar} alt={`${selectedUser.firstName} ${selectedUser.lastName}`} />
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
                                        message.senderId === loggedInUserId ? 'sent' : 'received'
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