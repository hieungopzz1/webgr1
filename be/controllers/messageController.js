const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Message = require("../models/Message");
const cloudinary = require("../config/cloudinary");
// const { io, userSocketMap } = require("../config/socket");

const getUsersForSidebar = async (req, res) => {
  try {
    const tutors = await Tutor.find({}, 'firstName lastName email');
    const students = await Student.find({}, 'firstName lastName email');
    const allUsers = [
        ...tutors.map((t) => ({ id: t._id, firstName: t.firstName, lastName: t.lastName, email: t.email, role: 'tutor' })),
        ...students.map((s) => ({ id: s._id, firstName: s.firstName, lastName: s.lastName, email: s.email, role: 'student' })),
    ];
    res.json(allUsers);
} catch (error) {
    console.error('Error fetching all users:', error.message);
    res.status(500).json({ error: 'Internal server error' });
}
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // Sort messages by creation time

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const sendMessage = async (req, res) => {
  try {
    const { text, image, receiverId } = req.body; // Lấy dữ liệu từ body
    const senderId = req.user._id; // Lấy senderId từ user đã xác thực

    console.log("Sender ID:", senderId , "Receiver ID:", receiverId);

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl, // Lưu URL ảnh nếu có
    });

    await newMessage.save();

    // Real-time update qua Socket.IO
    const io = req.app.get("socketio"); // Lấy instance Socket.IO
    const onlineUsers = req.app.get("onlineUsers"); // Lấy danh sách người online

    console.log('🟢 Current online users:', onlineUsers);

    // Gửi tin nhắn đến người nhận
    const receiverSocketId = onlineUsers?.get(receiverId)?.socketId;
    console.log("🔴 Receiver Socket ID:", receiverSocketId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Gửi tin nhắn đến người gửi (để cập nhật giao diện của họ)
    const senderSocketId = onlineUsers?.get(senderId)?.socketId;
    console.log("🟡 Sender Socket ID:", senderSocketId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
// const Tutor = require("../models/Tutor");
// const Student = require("../models/Student");
const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = req.app.get("onlineUsers");
    if (!onlineUsers || onlineUsers.size === 0) {
      return res.json([]);
    }
    const tutorIds = [];
    const studentIds = [];
    onlineUsers.forEach((info, userId) => {
      if (info.role === "Tutor") tutorIds.push(userId);
      else if (info.role === "Student") studentIds.push(userId);
    });

    const tutors = await Tutor.find(
      { _id: { $in: tutorIds } },
      "firstName lastName email"
    );
    const students = await Student.find(
      { _id: { $in: studentIds } },
      "firstName lastName email"
    );
    const userMap = [...tutors, ...students].reduce((acc, user) => {
      acc[user._id] = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };
      return acc;
    }, {});

    const onlineList = Array.from(onlineUsers.entries()).map(([id]) => ({
      id,
      firstName: userMap[id]?.firstName || "Unknown",
      lastName: userMap[id]?.lastName || "",
      email: userMap[id]?.email || "",
    }));

    res.json(onlineList);
  } catch (error) {
    console.error("Error in getOnlineUsers:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  getOnlineUsers,
};
