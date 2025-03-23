// const jwt = require('jsonwebtoken');

// const isAdmin = (req, res, next) => {
//   const token = req.header('Authorization');

//   if (!token) {
//     return res.status(401).json({ message: 'No token, authorization denied' });
//   }

//   try {
//     // Giải mã token để lấy thông tin người dùng
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded.id;

//     // Kiểm tra xem người dùng có phải là admin không
//     if (decoded.role !== 'Admin') {
//       return res.status(403).json({ message: 'Access denied, admin only' });
//     }

//     // Tiếp tục xử lý nếu người dùng là admin
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };

// module.exports = isAdmin;
