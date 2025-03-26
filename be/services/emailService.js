require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Gửi email thông báo
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} text - Nội dung email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sendEmailAllocation = async (to, subject, text) => {
  if (!isValidEmail(to)) {
    console.error(`⚠️ Email không hợp lệ: ${to}`);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Admin" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`✅ Email sent successfully to: ${to}, Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Lỗi gửi email đến ${to}:`, error.message);
    return false;
  }
};

module.exports = sendEmailAllocation;