const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  tutorId: { // ID của Tutor trong cuộc trò chuyện
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
  },
  studentId: { // ID của Student trong cuộc trò chuyện
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  senderType: { // Xác định người gửi là 'tutor' hay 'student'
    type: String,
    enum: ['tutor', 'student'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  },
{ timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;