// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173", "http://localhost:3000"], // Add your frontend origin
//         // You might also need to specify methods and credentials if necessary
//         // methods: ["GET", "POST"],
//         // credentials: true,
//     },
// });

// // Lưu trữ socket IDs của người dùng theo user ID (sử dụng mảng để hỗ trợ nhiều tab/thiết bị)
// const userSocketMap = new Map();

// io.on("connection", (socket) => {
//   const userId = socket.handshake.query.userId; // Lấy userId từ query params khi client kết nối

//   if (userId) {
//     console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
//     if (userSocketMap.has(userId)) {
//       userSocketMap.get(userId).push(socket.id); // Thêm socket ID vào mảng
//     } else {
//       userSocketMap.set(userId, [socket.id]); // Tạo mảng mới với socket ID
//     }
//   } else {
//     console.log("A user connected without userId", socket.id);
//   }

//   socket.on("disconnect", () => {
//     console.log("A user disconnected", socket.id);
//     // Xóa socket ID khỏi mảng khi người dùng ngắt kết nối
//     for (const [key, socketIds] of userSocketMap.entries()) {
//       const index = socketIds.indexOf(socket.id);
//       if (index > -1) {
//         socketIds.splice(index, 1);
//         if (socketIds.length === 0) {
//           userSocketMap.delete(key); // Xóa userId nếu không còn socket nào
//         }
//         break;
//       }
//     }
//   });

//   // Lắng nghe sự kiện tin nhắn riêng tư từ client (tùy chọn, có thể dùng sendMessage API)
//   socket.on("privateMessage", ({ senderId, receiverId, text, image }) => {
//     console.log(`Received private message from ${senderId} to ${receiverId}`);

//     const receiverSocketIds = userSocketMap.get(receiverId);

//     if (receiverSocketIds) {
//       // Phát sự kiện 'newMessage' đến tất cả các socket của người nhận
//       receiverSocketIds.forEach((socketId) => {
//         io.to(socketId).emit("newMessage", { senderId, text, image });
//       });
//     } else {
//       console.log(`Receiver ${receiverId} is not connected.`);
//       // Có thể gửi thông báo cho người gửi nếu người nhận không trực tuyến
//     }
//   });
// });

// export { io, app, server, userSocketMap };