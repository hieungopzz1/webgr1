import React, { useState, useEffect } from 'react';
import { getStudents } from '../../utils/api'; // Giả sử hàm API này lấy danh sách sinh viên
import Avatar from '../../components/avatar/Avatar'; // Avatar component
import Button from '../../components/button/Button'; // Button component
import DashboardCard from '../../components/dashboardcard/DashboardCard'; // DashboardCard component

const StudentProgress = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy dữ liệu danh sách sinh viên
    const fetchStudents = async () => {
      try {
        const data = await getStudents(); // API để lấy danh sách sinh viên
        setStudents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students data", error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="student-progress">
      <h2>List of Students</h2>
      <div className="search-filter">
        <input type="text" placeholder="Search for students..." />
        <button>Filter</button>
      </div>

      <DashboardCard title="Student Progress Overview">
        <table className="student-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Avatar</th>
              <th>Personal Information</th>
              <th>Interactive Status</th>
              <th>Academic Progress</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>
                  <Avatar name={student.name} status={student.status} />
                </td>
                <td>
                  <div>{student.name}</div>
                  <div>Code: {student.code}</div>
                  <div>Email: {student.email}</div>
                </td>
                <td>{student.status}</td>
                <td>{student.progress}%</td>
                <td>
                  <Button label="Details" onClick={() => alert('Details Clicked')} />
                  <Button label="Send Message" onClick={() => alert('Send Message Clicked')} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardCard>
    </div>
  );
};

export default StudentProgress;
