import { useEffect, useState } from "react";
import io from "socket.io-client";
import api from "../../utils/api"


const socket = io("http://localhost:5001");

const TutorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/dashboard/tutor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching tutor dashboard:", error);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Lấy userId từ localStorage hoặc context
    const user = JSON.parse(localStorage.getItem("userData"));
    if (user && user.id) {
      console.log("📡 Đăng ký socket với ID:", user.id);
      socket.emit("register", user.id);
    }

    // Lắng nghe sự kiện updateDashboard khi có blog mới
    socket.on("updateDashboard", (data) => {
      console.log("📡 Nhận sự kiện updateDashboard từ server:", data);
      fetchDashboard(); // Cập nhật dữ liệu
    });

    return () => {
      socket.off("updateDashboard");
    };
  }, []);

  return (
    <div>
      <h2>Tutor Dashboard</h2>
      {dashboardData ? (
        <>
          <h3>Total Blogs: {dashboardData.totalBlogs}</h3>
          <h3>Total Likes: {dashboardData.totalLikes}</h3>
          <h3>Students Assigned: {dashboardData.totalStudents}</h3>
          <h3>Total Comment: {dashboardData.totalComments}</h3>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TutorDashboard;
