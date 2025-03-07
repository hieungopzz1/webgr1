import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Settings.css';

const Settings = () => {
  const { language, translate, changeLanguage } = useLanguage();
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleThemeChange = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        <header className="settings-header">
          <h1>{translate('settings.title')}</h1>
        </header>

        <section className="settings-section">
          <h2>{translate('settings.appearance')}</h2>
          <div className="settings-option">
            <div className="option-info">
              <span className="option-label">{translate('settings.darkMode')}</span>
              <span className="option-description">
                {isDarkMode ? translate('settings.switchToLight') : translate('settings.switchToDark')}
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={handleThemeChange}
              />
              <span className="slider">
                <i className={`bi ${isDarkMode ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`} />
              </span>
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>{translate('settings.language')}</h2>
          <div className="language-options">
            <button
              className={`language-button ${language === 'vi' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('vi')}
            >
              <span className="flag">🇻🇳</span>
              <span className="language-name">{translate('settings.vietnamese')}</span>
            </button>
            <button
              className={`language-button ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              <span className="flag">🇬🇧</span>
              <span className="language-name">{translate('settings.english')}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings; 