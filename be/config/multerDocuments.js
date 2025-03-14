const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu trữ tài liệu
const storage = multer.diskStorage({
  destination: './uploads/documents/',  // Lưu tài liệu vào thư mục "documents"
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));  // Tạo tên tệp duy nhất
  }
});

// Kiểm tra loại tài liệu hợp lệ
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;  // Chỉ chấp nhận pdf, doc, docx
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);  // Nếu hợp lệ, cho phép tải lên
  } else {
    cb(new Error('Only .pdf, .doc, .docx files are allowed!'));  // Nếu không hợp lệ, trả lỗi
  }
};

// Khởi tạo Multer cho tài liệu
const uploadDocuments = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }  // Giới hạn kích thước tệp: 10MB
});

module.exports = uploadDocuments;
