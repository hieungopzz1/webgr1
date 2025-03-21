const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Message = require("../models/Message");
const cloudinary = require("../config/cloudinary"); 


const getUsersForSidebar = async (req, res) => {
  try {
    const students = await Student.find(
      {},
      "firstName lastName email role avatar"
    );
    const tutors = await Tutor.find({}, "firstName lastName email role avatar");

    const users = [...students, ...tutors];

    res.status(200).json({ message: "Success", users });
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
      const { text,image } = req.body;
      const  {receiverId}  = req.body;
      const{ senderId }= req.body;
      console.log(senderId,receiverId)
      let imageUrl;
      if (image) {
          const uploadResponse = await cloudinary.uploader.upload(image);
          imageUrl = uploadResponse.secure_url;
      }

      const newMessage = new Message({
          senderId,
          receiverId,
          text,
          image: imageUrl,
      });

      await newMessage.save();

      // const receiverSocketId = getReceiverSocketId(receiverId);
      // if (receiverSocketId) {
      //     io.to(receiverSocketId).emit("newMessage", newMessage);
      // }
      
      res.status(201).json(newMessage);
  } catch (error) {
      console.log("Error in sendMessage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
  }
};
  module.exports = { getUsersForSidebar,getMessages,sendMessage };
