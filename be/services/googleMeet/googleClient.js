const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

/**
 * Xác thực với Google API sử dụng OAuth2
 * @returns {Promise<Object>} Google OAuth2 client đã xác thực
 */
function authorize() {
  return new Promise((resolve, reject) => {
    try {
      // Đọc file credentials.json
      if (!fs.existsSync(CREDENTIALS_PATH)) {
        return reject(new Error('Không tìm thấy file credentials.json'));
      }
      
      const content = fs.readFileSync(CREDENTIALS_PATH);
      const data = JSON.parse(content);
      const credentials = data.installed || data.web;

      if (!credentials || !Array.isArray(credentials.redirect_uris)) {
        return reject(new Error('File credentials.json không có redirect_uris hợp lệ'));
      }

      const { client_id, client_secret, redirect_uris } = credentials;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      if (!fs.existsSync(TOKEN_PATH)) {
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: ['https://www.googleapis.com/auth/calendar']
        });
        return reject(new Error(`Vui lòng xác thực ứng dụng bằng URL: ${authUrl}`));
      }
      
      const token = fs.readFileSync(TOKEN_PATH);
      oAuth2Client.setCredentials(JSON.parse(token));
      resolve(oAuth2Client);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { authorize }; 