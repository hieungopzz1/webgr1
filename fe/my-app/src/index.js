import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SidebarProvider } from './context/SidebarContext';
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();