const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu trữ ảnh
const storage = multer.diskStorage({
    destination: './uploads/', // Thư mục lưu ảnh
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Kiểm tra loại file hợp lệ
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, JPG, PNG) are allowed!'));
    }
};

// Khởi tạo Multer
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // Giới hạn 2MB
});

module.exports = upload;
