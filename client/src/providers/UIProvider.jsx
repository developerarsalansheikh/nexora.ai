import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext(undefined);

/**
 * UI State provider wrapping global layout constraints, sidebar toggles, and modal states.
 */
export const UIProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'create-project' | 'task-details' | null
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('nexora_theme');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('nexora_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <UIContext.Provider
      value={{
        sidebarCollapsed,
        toggleSidebar,
        activeModal,
        openModal,
        closeModal,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

/**
 * Custom hook to hook into global UI controllers.
 */
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be wrapped within a UIProvider provider container.');
  }
  return context;
};
