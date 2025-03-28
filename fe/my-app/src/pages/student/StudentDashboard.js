import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5001");

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/dashboard/student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data.dashboard);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Lấy userId từ localStorage hoặc context
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      console.log("📡 Đăng ký socket với ID:", user.id);
      socket.emit("register", user.id);
    }

    // Lắng nghe sự kiện từ server khi có blog mới
    socket.on("updateDashboard", (data) => {
      console.log("📡 Nhận sự kiện updateDashboard từ server:", data);
      alert(data.message);
      fetchDashboard(); // Cập nhật dữ liệu sau khi có bài viết mới
    });

    return () => {
      socket.off("updateDashboard");
    };
  }, []);

  return (
    <div>
      <h2>Student Dashboard</h2>
      {dashboardData ? (
        <>
          <h3>Blogs</h3>
          {dashboardData.blogs.map((blog) => (
            <div key={blog._id}>
              <h4>{blog.title}</h4>
              <p>{blog.content}</p>
            </div>
          ))}

          <h3>Comments</h3>
          {dashboardData.comments.map((comment) => (
            <div key={comment._id}>
              <p>{comment.content}</p>
            </div>
          ))}

          <h3>Total Likes: {dashboardData.likes}</h3>
          <h3>Absences: {dashboardData.absences}</h3>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default StudentDashboard;
