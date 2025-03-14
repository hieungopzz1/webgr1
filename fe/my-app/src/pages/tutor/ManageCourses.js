import React, { useState, useEffect } from 'react';
import { getCourses } from '../../utils/api';  // API để lấy danh sách khóa học
import Button from '../../components/button/Button';  // Sử dụng Button component
import DashboardCard from '../../components/dashboardcard/DashboardCard';  // Sử dụng DashboardCard component
import { Link } from 'react-router-dom'; // Sử dụng Link để điều hướng

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();  // Lấy dữ liệu từ API
        setCourses(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses data", error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    // Lọc khóa học theo tên khi tìm kiếm
    setFilteredCourses(
      courses.filter((course) => 
        course.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, courses]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="manage-courses">
      <h2>Manage Courses</h2>

      {/* Tìm kiếm khóa học */}
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search for courses..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </div>

      <DashboardCard title="Courses Overview">
        <table className="course-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, index) => (
                <tr key={course.id}>
                  <td>{index + 1}</td>
                  <td>{course.name}</td>
                  <td>{course.status}</td>
                  <td>
                    {/* Thêm liên kết xem chi tiết khóa học */}
                    <Link to={`/course-detail/${course.id}`}>
                      <Button label="View Details" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No courses found</td>
              </tr>
            )}
          </tbody>
        </table>
      </DashboardCard>
    </div>
  );
};

export default ManageCourses;
