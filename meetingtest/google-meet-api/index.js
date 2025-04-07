// index.js
const express = require('express');
const app = express();
const googleClient = require('./models/googleClient');
const meetingController = require('./controllers/meetingController');
const meetingRoutes = require('./routes/meetingRoutes');

// Middleware để parse JSON request body (nếu cần)
app.use(express.json());

// Thực hiện xác thực OAuth2 và khởi động server
googleClient.authorize().then(authClient => {
  // Truyền OAuth2 client đã xác thực vào controller
  meetingController.setAuthClient(authClient);

  // Sử dụng các routes đã định nghĩa
  app.use('/', meetingRoutes);

  // Mở cổng server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to authorize Google API client:', err);
});
