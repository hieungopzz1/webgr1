
// import { getReceiverSocketId, io } from "../lib/socket.js";

const Tutor = require('../models/Tutor')
const Student = require('../models/Student');
const Message = require('../models/Message');
const cloudinary = require('cloudinary');

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const userRole = req.user.role; // Assuming req.user has a 'role' field ('tutor' or 'student')

        let filteredUsers;

        if (userRole === 'tutor') {
            // For a tutor, sidebar will show their students 
            filteredUsers = await Student.find({ tutors: loggedInUserId }).select("-password"); // Example: Find students associated with this tutor
        } else if (userRole === 'student') {
            // For a student, sidebar will show their tutors           
            filteredUsers = await Tutor.find({ students: loggedInUserId }).select("-password"); // Example: Find tutors associated with this student
        } else {
            return res.status(400).json({ error: "Invalid user role" }); 
        }

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: otherUserId } = req.params; // This is the ID of the Tutor or Student the logged-in user is chatting with
        const loggedInUserId = req.user._id;
        const userRole = req.user.role;

        let tutorId, studentId;

        if (userRole === 'tutor') {
            tutorId = loggedInUserId;
            studentId = otherUserId; // Assuming 'id' in params is Student ID when Tutor is logged in
        } else if (userRole === 'student') {
            tutorId = otherUserId; // Assuming 'id' in params is Tutor ID when Student is logged in
            studentId = loggedInUserId;
        } else {
            return res.status(400).json({ error: "Invalid user role" });
        }

        const messages = await Message.find({
            tutorId: tutorId,
            studentId: studentId,
        }).sort({ createdAt: 1 }); // Sort messages by createdAt in ascending order

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params; // ID of the receiver (Student if sender is Tutor, Tutor if sender is Student)
        const senderId = req.user._id;
        const userRole = req.user.role;

        let imageUrl;
        if (image) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        let tutorId, studentId, senderType;

        if (userRole === 'tutor') {
            tutorId = senderId;
            studentId = receiverId;
            senderType = 'tutor';
        } else if (userRole === 'student') {
            tutorId = receiverId;
            studentId = senderId;
            senderType = 'student';
        } else {
            return res.status(400).json({ error: "Invalid user role" });
        }

        const newMessage = new Message({
            tutorId,
            studentId,
            senderType,
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