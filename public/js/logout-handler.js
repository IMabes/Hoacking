// Global logout handler for all pages
// This ensures uis_active is set to 0 when user closes the page

(function() {
    // Handle page unload (when user closes tab/window or navigates away)
    window.addEventListener('beforeunload', async function() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (userData.id) {
            // Use navigator.sendBeacon for reliable logout on page close
            // sendBeacon sends data even if the page is closing
            const blob = new Blob([JSON.stringify({ userId: userData.id })], {
                type: 'application/json'
            });
            
            navigator.sendBeacon('http://localhost:3000/logout', blob);
        }
    });

    // Also handle visibility change (when user switches tabs)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Page is now hidden, but don't logout yet
            // Only logout on actual page close
        }
    });
})();

