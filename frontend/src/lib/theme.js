// Keep this key in sync with the inline boot script in index.html.
const THEME_STORAGE_KEY = "lms_theme";

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getTheme() {
  const saved = readSavedTheme();

  if (saved === "dark" || saved === "light") {
    return saved;
  }

  return systemPrefersDark() ? "dark" : "light";
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode. The class is already on, it just will not survive a reload.
  }
}
