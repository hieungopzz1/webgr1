const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Message = require("../models/Message");
const cloudinary = require("../config/cloudinary"); 
const { io, userSocketMap } = require("../config/socket");


const getUsersForSidebar = async (req, res) => {
  try {
      const loggedInUserId = req.user._id; // Get logged-in user's ID

      const students = await Student.find(
          { _id: { $ne: loggedInUserId } }, // Exclude students with the logged-in ID
          "firstName lastName email role avatar _id"
      );
      const tutors = await Tutor.find(
          { _id: { $ne: loggedInUserId } }, // Exclude tutors with the logged-in ID
          "firstName lastName email role avatar _id"
      );

      const users = [...students, ...tutors];

      res.status(200).json(users);
  } catch (error) {
      res
          .status(500)
          .json({ message: "Error retrieving users", error: error.message });
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
    const { text, image, receiverId } = req.body; // Keep receiverId from body
    const senderId = req.user._id; // Get senderId from authenticated user

    console.log(senderId, receiverId);
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl, // Uncomment this to handle image URLs
    });

    await newMessage.save();

    console.log(`Emitting 'newMessage' event to receiverId: ${receiverId}`);

    const receiverSocketIds = userSocketMap.get(receiverId);

    if (receiverSocketIds) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("newMessage", newMessage);
      });
    } else {
      console.log(`Receiver ${receiverId} is not connected.`);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
  module.exports = { getUsersForSidebar,getMessages,sendMessage };
