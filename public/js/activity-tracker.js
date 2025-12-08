/**
 * Kullanıcı Aktivite Takipçisi
 * Kullanıcı aktivitesini takip eder ve uis_active durumunu günceller
 * Implements heartbeat system, page visibility detection, and automatic logout
 */

(function() {
    'use strict';

    const ACTIVITY_PING_INTERVAL = 60000; // 60 saniyede bir ping at
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 dakika boşta kalma süresi
    const HEARTBEAT_ENDPOINT = 'http://localhost:3000/api/activity/ping';
    const LOGOUT_ENDPOINT = 'http://localhost:3000/logout';

    let pingInterval = null;
    let inactivityTimer = null;
    let lastActivityTime = Date.now();
    let isPageVisible = true;

    /**
     * localStorage'dan kullanıcı verilerini yükle
     */
    function getUserData() {
        try {
            return JSON.parse(localStorage.getItem('userData') || '{}');
        } catch (e) {
            return {};
        }
    }

    /**
     * Server'a heartbeat ping at
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
        
        // Boşta kalma süresini sıfırla
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        
        // Yeni boşta kalma süresi ayarla
        inactivityTimer = setTimeout(() => {
            handleInactivity();
        }, INACTIVITY_TIMEOUT);
    }

    /**
     * Kullanıcı boşta kalma durumunu işle
     */
    function handleInactivity() {
        console.log('User inactive for 30 minutes, logging out...');
        performLogout();
    }

    /**
     * Çıkış işlemi gerçekleştir ve uis_active'ı 0'a çek
     */
    async function performLogout() {
        const userData = getUserData();
        
        if (!userData.id) {
            return;
        }

        stopActivityTracking();

        try {
            // sendBeacon kullanarak çıkış işlemi güvenli bir şekilde gerçekleştir
            const blob = new Blob([JSON.stringify({ userId: userData.id })], {
                type: 'application/json'
            });
            
            if (navigator.sendBeacon) {
                navigator.sendBeacon(LOGOUT_ENDPOINT, blob);
            } else {
                // sendBeacon mevcut değilse fetch kullanarak çıkış işlemi gerçekleştir
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

        // localStorage'ı temizle
        localStorage.removeItem('userData');
        
        // Eğer mevcut sayfa index.html değilse, index.html sayfasına yönlendir
        if (window.location.pathname !== '/index.html' && !window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }

    /**
     * Aktivite takip işlemini başlat
     */
    function startActivityTracking() {
        const userData = getUserData();
        
        if (!userData.id) {
            return;
        }

        // Mevcut aralıkları temizle -> Mevcut aralıkları temizle
        stopActivityTracking();

        // Başlangıç heartbeat
        sendHeartbeat();
        updateActivity();

        // Periyodik heartbeat ayarla
        pingInterval = setInterval(() => {
            if (isPageVisible) {
                sendHeartbeat();
                updateActivity();
            }
        }, ACTIVITY_PING_INTERVAL);

        // Kullanıcı interaksiyonlarını takip et
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });

        console.log('Activity tracking started');
    }

    /**
     * Aktivite takip işlemini durdur
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
     * Sayfa görünürlüğü değişikliklerini işle
     */
    function handleVisibilityChange() {
        isPageVisible = !document.hidden;
        
        if (isPageVisible) {
            // Sayfa görünür oldu - aktiviteyi güncelle
            updateActivity();
            sendHeartbeat();
        }
    }

    /**
     * Sayfa yüklenmediğinde (kullanıcı sekme/pencereyi kapatır)
     */
    function handlePageUnload() {
        const userData = getUserData();
        
        if (userData.id) {
            // sendBeacon kullanarak çıkış işlemi güvenli bir şekilde gerçekleştir
            const blob = new Blob([JSON.stringify({ userId: userData.id })], {
                type: 'application/json'
            });
            
            navigator.sendBeacon(LOGOUT_ENDPOINT, blob);
        }
    }

    /**
     * Aktivite takipçisini başlat
     */
    function init() {
        const userData = getUserData();
        
        if (userData.id) {
            // Kullanıcı giriş yaptı - aktivite takip işlemini başlat
            startActivityTracking();
            
            // Sayfa görünürlüğü değişikliklerini takip et
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            // Sayfa yüklenmediğinde (kullanıcı sekme/pencereyi kapatır)
            window.addEventListener('beforeunload', handlePageUnload);
            
            // Sayfa gizlendiğinde (mobile tarayıcılar için)
            window.addEventListener('pagehide', handlePageUnload);
        }
    }

    // DOM hazır olduğunda başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Gerekirse manuel kontrol için fonksiyonları dışa aktar
    window.activityTracker = {
        start: startActivityTracking,
        stop: stopActivityTracking,
        logout: performLogout,
        ping: sendHeartbeat
    };

})();

