/**
 * Theme initialization on app load
 * Add this to main.jsx or App.jsx
 */

// Initialize theme from localStorage on app load
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Default to dark mode
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
};

// Call on app initialization
initializeTheme();

export default initializeTheme;
