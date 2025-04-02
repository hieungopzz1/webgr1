import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar/Sidebar';
import Footer from '../../components/footer/Footer';
import CreateBlogModal from '../../components/CreateBlogModal/CreateBlogModal';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const [isCreateBlogModalOpen, setIsCreateBlogModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsCreateBlogModalOpen(true);
    window.addEventListener('openCreateBlogModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openCreateBlogModal', handleOpenModal);
    };
  }, []);

  const handleBlogCreated = (newBlog) => {
    // Dispatch một event để thông báo blog mới đã được tạo
    window.dispatchEvent(new CustomEvent('blogCreated', { detail: newBlog }));
  };

  return (
    <div className="main-layout">
      <div className="main-layout__content">
        <Sidebar />
        <main className="main-content">
          {children}
          <Footer />
        </main>
      </div>
      <CreateBlogModal
        isOpen={isCreateBlogModalOpen}
        onClose={() => setIsCreateBlogModalOpen(false)}
        onSuccess={handleBlogCreated}
      />
    </div>
  );
};

export default MainLayout;
