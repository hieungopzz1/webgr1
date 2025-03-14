import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseDetail } from '../../utils/api'; // API để lấy chi tiết khóa học

const CourseDetail = () => {
  const { courseId } = useParams(); // Lấy ID khóa học từ URL
  const [courseDetail, setCourseDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const data = await getCourseDetail(courseId); // Lấy thông tin chi tiết khóa học
        setCourseDetail(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course details", error);
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!courseDetail) {
    return <p>Course not found.</p>;
  }

  return (
    <div className="course-detail">
      <h2>{courseDetail.name}</h2>
      <p><strong>Status:</strong> {courseDetail.status}</p>
      <p><strong>Description:</strong> {courseDetail.description}</p>
      <p><strong>Start Date:</strong> {courseDetail.startDate}</p>
      <p><strong>End Date:</strong> {courseDetail.endDate}</p>
      {/* Bạn có thể thêm các thông tin khác về khóa học ở đây */}
    </div>
  );
};

export default CourseDetail;
