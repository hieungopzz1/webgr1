import { useState, useEffect } from 'react';
import { getStudents, getUpcomingMeetings, getReports, getMessages } from '../utils/api';

const useTutorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [report, setReport] = useState({});
  const [messages, setMessages] = useState([]);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách sinh viên
        const studentsData = await getStudents();
        setStudents(studentsData);

        // Lấy cuộc họp sắp tới
        const meetingsData = await getUpcomingMeetings();
        setUpcomingMeetings(meetingsData);

        // Lấy báo cáo tương tác
        const reportData = await getReports();
        setReport(reportData);

        // Lấy tin nhắn mới
        const messagesData = await getMessages();
        setMessages(messagesData);

        // Lấy thông báo quan trọng
        setAnnouncement('There are changes to the meeting schedule on 12/12/2023.');
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  return { students, upcomingMeetings, report, messages, announcement };
};

export default useTutorDashboard;
