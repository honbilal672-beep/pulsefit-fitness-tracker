import { createContext, useContext, useEffect, useState } from "react";
const ThemeContext = createContext(void 0);
const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("pulsefit_theme");
    return saved === "light" || saved === "dark" ? saved : "light";
  });
  useEffect(() => {
    localStorage.setItem("pulsefit_theme", theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);
  const toggleTheme = () => {
    setThemeState((prev) => prev === "dark" ? "light" : "dark");
  };
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };
  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>;
};
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
export {
  ThemeProvider,
  useTheme
};
