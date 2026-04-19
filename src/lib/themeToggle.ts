export function applyTheme(
  isDark: boolean,
  btn: HTMLButtonElement,
  icon: HTMLElement,
): void {
  icon.textContent = isDark ? "☀️" : "🌙";
  btn.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode",
  );
}

export function initThemeToggle(
  btn: HTMLButtonElement,
  icon: HTMLElement,
): void {
  const isDark = document.documentElement.classList.contains("dark");
  applyTheme(isDark, btn, icon);

  btn.addEventListener("click", () => {
    const next = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", next ? "dark" : "light");
    applyTheme(next, btn, icon);
  });
}
