import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Kullanıcı ID'sini localStorage'dan al
  const getCurrentUserId = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // İlk yüklemede kullanıcıya özel dark mode'u yükle
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      const saved = localStorage.getItem(`darkMode_${userId}`);
      if (saved) {
        setDarkMode(JSON.parse(saved));
      } else {
        setDarkMode(false); // Default: Light mode
      }
    } else {
      setDarkMode(false); // Login olmamışsa light mode
    }
  }, []);

  // Dark mode değiştiğinde kullanıcıya özel kaydet
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      localStorage.setItem(`darkMode_${userId}`, JSON.stringify(darkMode));
    }
    
    // HTML'e dark class ekle/çıkar
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const value = {
    darkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};