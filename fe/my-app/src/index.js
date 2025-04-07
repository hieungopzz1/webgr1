import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { NotificationProvider } from './context/NotificationContext';
import './index.css';
import reportWebVitals from './reportWebVitals';
import 'bootstrap-icons/font/bootstrap-icons.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();