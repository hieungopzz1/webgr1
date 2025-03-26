import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '../../utils/api';
import InputField from '../../components/inputField/InputField';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Message.css';
import socket from '../../context/socket';
import useAuth from '../../hooks/useAuth';

const Message = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // Initialize useNavigate
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const { user } = useAuth();


    const fetchLoggedInUser = useCallback(async () => {
      try {
          const response = await api.get('/api/auth/me');
          if (response.data && response.data.id) { // Access 'id' directly from response.data
              setLoggedInUserId(response.data.id);
          } else {
              console.error('Could not fetch logged-in user ID');
          }
      } catch (error) {
          console.error('Error fetching logged-in user:', error);
      }
  }, []);

    const fetchUsers = useCallback(async () => {
      try {
          const response = await api.get('/api/messages/users');
          if (response.data && Array.isArray(response.data)) {
              console.log('Fetched Users:', response.data); // ADD THIS LINE
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
      const connectSocket = () => {
          console.log('Attempting to connect socket. loggedInUserId:', loggedInUserId);
          if (loggedInUserId) {
              console.log('Socket object before setting query:', socket);
              socket.io.opts.query = { userId: loggedInUserId }; // This line is correct
              console.log('Socket options after setting query:', socket.io.opts);
              socket.connect();
              console.log('Socket connected or attempting to connect.');
  
              socket.on('newMessage', (newMessageData) => {
                  if (
                      (newMessageData.senderId === id && newMessageData.receiverId === loggedInUserId) ||
                      (newMessageData.senderId === loggedInUserId && newMessageData.receiverId === id)
                  ) {
                      setMessages((prevMessages) => [...prevMessages, newMessageData]);
                  }
              });
  
              return () => {
                  console.log('Disconnecting socket.');
                  socket.off('newMessage');
                  socket.disconnect();
              };
          } else {
              console.log('loggedInUserId is not yet available, delaying socket connection.');
              return undefined;
          }
      };
  
      fetchLoggedInUser();
      fetchUsers();
      console.log('Logged-in User ID outside connectSocket:', loggedInUserId);
      if (id) {
          fetchMessages(id);
      }
  
      return connectSocket();
  }, [id, fetchUsers, fetchMessages, loggedInUserId, fetchLoggedInUser]);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // const handleSendMessage = async (e) => {
    //   e.preventDefault();
    //   if (!newMessage.trim() && !selectedFile && !selectedUser?._id) return;
  
    //   try {
    //     const formData = new FormData();
    //     if (newMessage.trim()) {
    //       formData.append('text', newMessage.trim());
    //     }
    //     if (selectedFile) {
    //       formData.append('image', selectedFile);
    //     }
    //     if (selectedUser?._id) {
    //       console.log('Sending receiverId:', selectedUser._id);
    //       formData.append('receiverId', selectedUser._id);
    //     } else {
    //       console.error('selectedUser or selectedUser._id is missing!');
    //       return;
    //     }
  
    //     const response = await api.post(`/api/messages/send`, formData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data',
    //       },
    //     });
  
    //     if (response.data) {
    //       // The 'newMessage' event will be emitted by the backend and handled by the socket listener
    //       setNewMessage('');
    //       setSelectedFile(null);
    //     }
    //   } catch (error) {
    //     console.error('Error sending message:', error);
    //   }
    // };

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim() && !selectedFile && !selectedUser?._id) return;

      try {
          const formData = new FormData();
          if (newMessage.trim()) {
              formData.append('text', newMessage.trim());
          }
          if (selectedFile) {
              formData.append('image', selectedFile);
          }
          if (selectedUser?._id) {
              console.log('Sending receiverId:', selectedUser._id);
              formData.append('receiverId', selectedUser._id);
          } else {
              console.error('selectedUser or selectedUser._id is missing!');
              return;
          }

          // Optimistic UI Update: Add the message to the local state immediately
          const tempMessage = {
              _id: `temp-${Date.now()}`, // Temporary ID for the optimistic update
              senderId: loggedInUserId,
              receiverId: selectedUser._id,
              text: newMessage.trim(),
              image: selectedFile ? URL.createObjectURL(selectedFile) : null, // Preview local image
              createdAt: new Date(),
          };
          setMessages(prev => [...prev, tempMessage]);
          setNewMessage('');
          setSelectedFile(null);

          // Now, make the API call to the backend
          const response = await api.post(`/api/messages/send`, formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });

          if (response.data) {
              // The 'newMessage' event will be emitted by the backend and handled by the socket listener
              console.log('Message sent successfully to backend:', response.data);
          }
      } catch (error) {
          console.error('Error sending message:', error);
          // Optionally, you could remove the optimistically added message from the state on error
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
                            onClick={() => {
                                setSelectedUser(user);
                                navigate(`/messages/${user._id}`); // Update the URL here
                                console.log('Selected User in Sidebar:', user); 
                            }}
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