import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', { 
  autoConnect: false,
});

export default socket;