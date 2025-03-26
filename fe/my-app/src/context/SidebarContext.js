import React, { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem } from '../utils/storage';

const SidebarContext = createContext();

const SIDEBAR_STATE_KEY = 'sidebarExpanded';

export const SidebarProvider = ({ children }) => {
  const [expanded, setExpanded] = useState(() => {
    const savedState = getItem(SIDEBAR_STATE_KEY);
    return savedState !== null ? savedState : true;
  });

  useEffect(() => {
    setItem(SIDEBAR_STATE_KEY, expanded);
  }, [expanded]);

  const toggleSidebar = () => {
    setExpanded(prev => !prev);
  };

  const expandSidebar = () => {
    setExpanded(true);
  };

  const collapseSidebar = () => {
    setExpanded(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        expanded,
        toggleSidebar,
        expandSidebar,
        collapseSidebar
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  
  return context;
};

export default SidebarContext;
