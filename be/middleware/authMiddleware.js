const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Admin = require("../models/Admin");


const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const token = authHeader.split(" ")[1]; // Lấy token sau chữ "Bearer"
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // Lưu user vào request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: No permission" });
    }
    next();
  };
};


const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "mysecretkey"
      );

      // Tìm user trong cả 3 collection
      const user =
        (await Student.findById(decoded.id).select("-password")) ||
        (await Tutor.findById(decoded.id).select("-password")) ||
        (await Admin.findById(decoded.id).select("-password"));

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
module.exports = { authenticateUser,protect, authorizeRole };
