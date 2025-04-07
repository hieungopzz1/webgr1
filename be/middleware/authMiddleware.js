const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Admin = require("../models/Admin");

/**
 * Middleware xác thực người dùng bằng token JWT
 */
const authenticateUser = async (req, res, next) => {
  try {
    let token;
    
    // Lấy token từ header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Kiểm tra nếu không có token
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Tìm người dùng dựa trên ID từ token
    const user = 
      (await Admin.findById(decoded.id)) || 
      (await Student.findById(decoded.id)) || 
      (await Tutor.findById(decoded.id));
      
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Thêm user vào request để sử dụng trong các controller
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Not authorized' });
  }
};

/**
 * Middleware kiểm tra quyền của người dùng
 */
const authorizeRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Forbidden: You do not have permission to access this resource' 
      });
    }
    
    next();
  };
};

/**
 * Middleware bảo vệ route (legacy, giữ cho tương thích với code cũ)
 */
const protect = async (req, res, next) => {
  return authenticateUser(req, res, next);
};

module.exports = {
  authenticateUser,
  authorizeRole,
  protect
};
