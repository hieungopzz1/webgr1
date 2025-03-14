import React, { useState, useEffect } from 'react';
import { updateProfile, updatePassword } from '../../utils/api'; // API để cập nhật thông tin cá nhân và mật khẩu
import Button from '../../components/button/Button';  // Button component
import DashboardCard from '../../components/dashboardcard/DashboardCard';  // DashboardCard component
import { useNavigate } from 'react-router-dom'; // Dùng để điều hướng sau khi đăng xuất

const Settings = () => {
  const [user, setUser] = useState({ name: '', email: '', avatar: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Dùng để điều hướng trang

  useEffect(() => {
    // Lấy dữ liệu người dùng (thông tin cá nhân)
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();  // Giả sử bạn có API để lấy thông tin người dùng
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await updateProfile(user);
      alert('Profile updated successfully');
    } catch (error) {
      setErrorMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setLoading(true);
    setErrorMessage('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(passwordData);  // API để cập nhật mật khẩu
      alert('Password updated successfully');
    } catch (error) {
      setErrorMessage('Error updating password');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem('token');
    // Điều hướng người dùng về trang login
    navigate('/login');
  };

  return (
    <div className="settings">
      <h2>Settings</h2>

      {/* Thông tin cá nhân */}
      <DashboardCard title="Profile Information">
        <div className="profile-info">
          <div>
            <label>Name</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div>
            <label>Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setUser({ ...user, avatar: e.target.files[0] })}
            />
          </div>
          <Button label="Update Profile" onClick={handleProfileUpdate} />
        </div>
      </DashboardCard>

      {/* Đổi mật khẩu */}
      <DashboardCard title="Change Password">
        <div className="password-change">
          <div>
            <label>Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </div>
          <div>
            <label>New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
          </div>
          <div>
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </div>
          <Button label="Update Password" onClick={handlePasswordUpdate} />
        </div>
      </DashboardCard>

      {/* Đăng xuất */}
      <Button label="Log Out" className="logout-button" onClick={handleLogout} />

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Settings;
