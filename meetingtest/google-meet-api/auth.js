// auth.js
const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

// Đọc file credentials
fs.readFile(CREDENTIALS_PATH, (err, content) => {
  if (err) return console.error('Lỗi đọc credentials.json:', err);
  authorize(JSON.parse(content));
});

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n👉 Truy cập link sau trong trình duyệt để xác thực:\n\n', authUrl, '\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\n📥 Nhập mã xác thực tại đây: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('❌ Lỗi lấy token:', err.message);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('\n✅ Đã lưu token vào token.json! Bạn có thể chạy lại index.js\n');
    });
  });
}
