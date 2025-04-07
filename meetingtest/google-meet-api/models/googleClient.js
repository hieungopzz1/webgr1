const fs = require('fs');
const { google } = require('googleapis');

function authorize() {
  return new Promise((resolve, reject) => {
    fs.readFile('credentials.json', (err, content) => {
      if (err) return reject('Không đọc được file credentials.json');

      const data = JSON.parse(content);
      const credentials = data.installed || data.web;

      if (!credentials || !Array.isArray(credentials.redirect_uris)) {
        return reject('File credentials.json không có redirect_uris hợp lệ');
      }

      const { client_id, client_secret, redirect_uris } = credentials;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      fs.readFile('token.json', (err, token) => {
        if (err) {
          const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar']
          });
          console.log('Authorize this app by visiting this URL:', authUrl);
          return reject('Vui lòng xác thực ứng dụng bằng URL trên.');
        }
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(oAuth2Client);
      });
    });
  });
}

module.exports = { authorize };