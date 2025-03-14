import React, { useState, useEffect } from 'react';
import { getAssignments } from '../../utils/api'; // API để lấy danh sách bài tập
import Button from '../../components/button/Button'; // Button component
import DashboardCard from '../../components/dashboardcard/DashboardCard'; // DashboardCard component

const AssignmentReview = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  useEffect(() => {
    // Lấy dữ liệu danh sách bài tập
    const fetchAssignments = async () => {
      try {
        const data = await getAssignments(); // API để lấy dữ liệu bài tập
        setAssignments(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assignments", error);
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    // Lọc bài tập theo tên sinh viên hoặc ID bài tập
    setFilteredAssignments(
      assignments.filter((assignment) =>
        assignment.studentName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, assignments]);

  const handleGradeAssignment = (assignmentId) => {
    // Logic để giảng viên chấm điểm bài tập
    alert(`Grade Assignment ${assignmentId}`);
  };

  const handleCommentAssignment = (assignmentId) => {
    // Logic để giảng viên để lại nhận xét cho bài tập
    alert(`Comment on Assignment ${assignmentId}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="assignment-review">
      <h2>Assignment Review</h2>

      {/* Tìm kiếm bài tập */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for assignments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <DashboardCard title="Assignments Overview">
        <table className="assignment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Assignment Title</th>
              <th>Status</th>
              <th>Grade</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment, index) => (
                <tr key={assignment.id}>
                  <td>{index + 1}</td>
                  <td>{assignment.studentName}</td>
                  <td>{assignment.title}</td>
                  <td>{assignment.status}</td>
                  <td>{assignment.grade || "Not Graded"}</td>
                  <td>
                    <Button
                      label="Grade"
                      onClick={() => handleGradeAssignment(assignment.id)}
                    />
                    <Button
                      label="Comment"
                      onClick={() => handleCommentAssignment(assignment.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No assignments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </DashboardCard>
    </div>
  );
};

export default AssignmentReview;
