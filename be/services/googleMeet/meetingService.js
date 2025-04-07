const { google } = require('googleapis');
const { authorize } = require('./googleClient');

/**
 * Tạo một cuộc họp Google Meet 
 * @param {Object} meetingInfo - Thông tin cuộc họp
 * @param {String} meetingInfo.summary - Tiêu đề cuộc họp
 * @param {String} meetingInfo.description - Mô tả cuộc họp
 * @param {Date} meetingInfo.startTime - Thời gian bắt đầu
 * @param {Date} meetingInfo.endTime - Thời gian kết thúc
 * @returns {Promise<String>} Link tham gia Google Meet
 */
async function createGoogleMeeting(meetingInfo) {
  try {
    const authClient = await authorize();
    
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    const event = {
      summary: meetingInfo.summary || 'Cuộc họp học trực tuyến',
      description: meetingInfo.description || 'Cuộc họp được tạo tự động từ hệ thống',
      start: {
        dateTime: meetingInfo.startTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: meetingInfo.endTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.conferenceData.entryPoints.find(
      e => e.entryPointType === 'video'
    ).uri;

    return meetLink;
  } catch (error) {
    console.error('Lỗi khi tạo Google Meet:', error.message);
    throw error;
  }
}

module.exports = {
  createGoogleMeeting,
}; 