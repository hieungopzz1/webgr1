import React, { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      darkMode: 'Dark Mode',
      language: 'Language',
      vietnamese: 'Tiếng Việt',
      english: 'English',
      switchToLight: 'Switch to light mode',
      switchToDark: 'Switch to dark mode'
    },
    sidebar: {
      home: 'Home',
      search: 'Search',
      messages: 'Messages',
      notifications: 'Notifications',
      timetable: 'Timetable',
      dashboard: 'Dashboard',
      createAccount: 'Create Account',
      tutorAssignment: 'Tutor Assignment',
      settings: 'Settings'
    }
  },
  vi: {
    settings: {
      title: 'Cài đặt',
      appearance: 'Giao diện',
      darkMode: 'Chế độ tối',
      language: 'Ngôn ngữ',
      vietnamese: 'Tiếng Việt',
      english: 'English',
      switchToLight: 'Chuyển sang chế độ sáng',
      switchToDark: 'Chuyển sang chế độ tối'
    },
    sidebar: {
      home: 'Trang chủ',
      search: 'Tìm kiếm',
      messages: 'Tin nhắn',
      notifications: 'Thông báo',
      timetable: 'Thời khóa biểu',
      dashboard: 'Bảng điều khiển',
      createAccount: 'Tạo tài khoản',
      tutorAssignment: 'Phân công giảng dạy',
      settings: 'Cài đặt'
    }
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'vi';
  });

  const translate = useCallback((key) => {
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      if (!translation[k]) return key;
      translation = translation[k];
    }
    
    return translation;
  }, [language]);

  const changeLanguage = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.setAttribute('lang', newLanguage);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, translate, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};