// Tüm sayfalar için global çıkış işleyicisi
// Bu, kullanıcı sayfayı kapatırken uis_active'ı 0'a çeker

(function() {
    // Sayfa yüklenmediğinde (kullanıcı sekme/pencereyi kapatır veya başka bir sayfaya geçer)
    window.addEventListener('beforeunload', async function() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (userData.id) {
            // sendBeacon kullanarak çıkış işlemi güvenli bir şekilde gerçekleştir
            // sendBeacon sayfa kapatılırken bile veri gönderir
            const blob = new Blob([JSON.stringify({ userId: userData.id })], {
                type: 'application/json'
            });
            
            navigator.sendBeacon('http://localhost:3000/logout', blob);
        }
    });

    // Ayrıca sayfa görünürlüğü değişikliklerini işle (kullanıcı sekme/pencereyi değiştirir)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Sayfa gizlendi, ancak çıkış yapılmadı
            // Sadece sayfa kapatıldığında çıkış yapılır
        }
    });
})();

