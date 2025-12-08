/**
 * User Activity Tracker
 * Tracks user activity and updates uis_active status
 * Implements heartbeat system, page visibility detection, and automatic logout
 */

(function() {
    'use strict';

    const ACTIVITY_PING_INTERVAL = 60000; // Ping every 60 seconds (1 minute)
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
    const HEARTBEAT_ENDPOINT = 'http://localhost:3000/api/activity/ping';
    const LOGOUT_ENDPOINT = 'http://localhost:3000/logout';

    let pingInterval = null;
    let inactivityTimer = null;
    let lastActivityTime = Date.now();
    let isPageVisible = true;

    /**
     * Get user data from localStorage
     */
    function getUserData() {
        try {
            return JSON.parse(localStorage.getItem('userData') || '{}');
        } catch (e) {
            return {};
        }
    }

    /**
     * Send heartbeat ping to server
     */
    async function sendHeartbeat() {
        const userData = getUserData();
        
        if (!userData.id) {
            stopActivityTracking();
            return;
        }

        try {
            const response = await fetch(HEARTBEAT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.id })
            });

            if (!response.ok) {
                console.warn('Heartbeat failed:', response.status);
            }
        } catch (error) {
            console.error('Heartbeat error:', error);
        }
    }

    /**
     * Update last activity timestamp
     */
    function updateActivity() {
        lastActivityTime = Date.now();
        
        // Reset inactivity timer
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        
        // Set new inactivity timer
        inactivityTimer = setTimeout(() => {
            handleInactivity();
        }, INACTIVITY_TIMEOUT);
    }

    /**
     * Handle user inactivity
     */
    function handleInactivity() {
        console.log('User inactive for 30 minutes, logging out...');
        performLogout();
    }

    /**
     * Perform logout and set uis_active to 0
     */
    async function performLogout() {
        const userData = getUserData();
        
        if (!userData.id) {
            return;
        }

        stopActivityTracking();

        try {
            // Use sendBeacon for reliable logout even if page is closing
            const blob = new Blob([JSON.stringify({ userId: userData.id })], {
                type: 'application/json'
            });
            
            if (navigator.sendBeacon) {
                navigator.sendBeacon(LOGOUT_ENDPOINT, blob);
            } else {
                // Fallback to fetch if sendBeacon is not available
                await fetch(LOGOUT_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userData.id }),
                    keepalive: true
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Clear localStorage
        localStorage.removeItem('userData');
        
        // Redirect to home page if not already there
        if (window.location.pathname !== '/index.html' && !window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }

    /**
     * Start activity tracking
     */
    function startActivityTracking() {
        const userData = getUserData();
        
        if (!userData.id) {
            return;
        }

        // Clear any existing intervals
        stopActivityTracking();

        // Initial heartbeat
        sendHeartbeat();
        updateActivity();

        // Set up periodic heartbeat
        pingInterval = setInterval(() => {
            if (isPageVisible) {
                sendHeartbeat();
                updateActivity();
            }
        }, ACTIVITY_PING_INTERVAL);

        // Track user interactions
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });

        console.log('Activity tracking started');
    }

    /**
     * Stop activity tracking
     */
    function stopActivityTracking() {
        if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
        }
        
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
        }
    }

    /**
     * Handle page visibility changes
     */
    function handleVisibilityChange() {
        isPageVisible = !document.hidden;
        
        if (isPageVisible) {
            // Page became visible - update activity
            updateActivity();
            sendHeartbeat();
        }
    }

    /**
     * Handle page unload (user closes tab/window)
     */
    function handlePageUnload() {
        const userData = getUserData();
        
        if (userData.id) {
            // Use sendBeacon for reliable logout on page close
            const blob = new Blob([JSON.stringify({ userId: userData.id })], {
                type: 'application/json'
            });
            
            navigator.sendBeacon(LOGOUT_ENDPOINT, blob);
        }
    }

    /**
     * Initialize activity tracker
     */
    function init() {
        const userData = getUserData();
        
        if (userData.id) {
            // User is logged in - start tracking
            startActivityTracking();
            
            // Set up page visibility detection
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            // Set up page unload handler
            window.addEventListener('beforeunload', handlePageUnload);
            
            // Set up pagehide handler (for mobile browsers)
            window.addEventListener('pagehide', handlePageUnload);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export functions for manual control if needed
    window.activityTracker = {
        start: startActivityTracking,
        stop: stopActivityTracking,
        logout: performLogout,
        ping: sendHeartbeat
    };

})();

