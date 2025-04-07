const { google } = require('googleapis');

let authClient = null;

function setAuthClient(client) {
  authClient = client;
}

async function createMeeting(req, res) {
  if (!authClient) {
    return res.status(500).send('OAuth2 client chưa được thiết lập.');
  }

  const calendar = google.calendar({ version: 'v3', auth: authClient });

  const event = {
    summary: 'Cuộc họp Google Meet',
    description: 'Được tạo từ Node.js API',
    start: {
      dateTime: new Date(Date.now() + 5 * 60000).toISOString(),
      timeZone: 'Asia/Ho_Chi_Minh',
    },
    end: {
      dateTime: new Date(Date.now() + 35 * 60000).toISOString(),
      timeZone: 'Asia/Ho_Chi_Minh',
    },
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.conferenceData.entryPoints.find(e => e.entryPointType === 'video').uri;
    res.json({ meetLink });
  } catch (err) {
    console.error('Lỗi khi tạo Google Meet:', err);
    res.status(500).send('Không thể tạo Google Meet.');
  }
}

module.exports = {
  setAuthClient,
  createMeeting
};