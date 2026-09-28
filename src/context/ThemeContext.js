import React, { createContext, useState, useContext } from 'react';

const lightTheme = {
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  subText: '#6C757D',
  primary: '#D9534F',
  border: '#CED4DA',
  isDark: false,
};

const darkTheme = {
  background: '#121212',
  cardBackground: '#1E1E1E',
  text: '#FFFFFF',
  subText: '#A0A0A0',
  primary: '#E57373',
  border: '#333333',
  isDark: true,
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}