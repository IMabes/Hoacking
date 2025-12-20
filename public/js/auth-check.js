// Authentication check utility
// This file should be included in pages that require authentication

async function checkAuthentication() {
    // Get user data from localStorage
    const userDataStr = localStorage.getItem('userData');
    let userData = null;
    
    try {
        userData = userDataStr ? JSON.parse(userDataStr) : null;
    } catch (e) {
        userData = null;
    }
    
    // If no user data, redirect to login
    if (!userData || !userData.id) {
        alert('Bu sayfaya erişmek için giriş yapmalısınız.');
        window.location.href = 'login.html';
        return false;
    }
    
    // Validate session with backend
    try {
        const response = await fetch('http://localhost:3000/api/auth/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userData.id })
        });
        
        const data = await response.json();
        
        if (data.success && data.valid && data.user) {
            // Session is valid, update localStorage
            localStorage.setItem('userData', JSON.stringify(data.user));
            return true;
        } else {
            // Session invalid, clear and redirect
            localStorage.removeItem('userData');
            localStorage.removeItem('lastSessionValidation');
            alert('Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.');
            window.location.href = 'login.html';
            return false;
        }
    } catch (error) {
        console.error('Authentication check error:', error);
        // Network hatası durumunda - eğer localStorage'da userData varsa erişime izin ver
        // Backend'e ulaşılamadığı için hata olabilir, bu durumda kullanıcıyı logout etme
        if (userData && userData.id) {
            console.warn('Backend\'e ulaşılamadı, ancak localStorage\'da kullanıcı verisi var. Erişime izin veriliyor.');
            return true;
        }
        // Kullanıcı verisi yoksa login sayfasına yönlendir
        alert('Oturum doğrulanamadı. Lütfen tekrar giriş yapın.');
        window.location.href = 'login.html';
        return false;
    }
}

// Auto-check on page load - run immediately (before DOMContentLoaded)
(async function() {
    // Hide body content while checking
    if (document.body) {
        document.body.style.display = 'none';
    }
    
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
        // Already redirected, stop here
        return;
    }
    
    // Show body if authenticated
    if (document.body) {
        document.body.style.display = '';
    }
})();
