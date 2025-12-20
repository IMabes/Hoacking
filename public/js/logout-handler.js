// Tüm sayfalar için global çıkış işleyicisi
// Bu, kullanıcı sayfayı kapatırken uis_active'ı 0'a çeker

(function() {
    // Sayfa yüklenmediğinde (kullanıcı sekme/pencereyi kapatır)
    // NOT: beforeunload hem sayfa kapatıldığında hem de sayfa değişikliklerinde tetiklenir
    // Bu yüzden localStorage'ı burada SİLMİYORUZ - sadece backend'e bilgi gönderiyoruz
    // localStorage sadece manuel logout işleminde silinecek
    window.addEventListener('beforeunload', async function() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (userData.id) {
            // sendBeacon kullanarak çıkış işlemi güvenli bir şekilde gerçekleştir
            // sendBeacon sayfa kapatılırken bile veri gönderir
            const blob = new Blob([JSON.stringify({ userId: userData.id })], {
                type: 'application/json'
            });
            
            // Backend'e logout isteği gönder (uis_active'ı 0 yap)
            navigator.sendBeacon('http://localhost:3000/logout', blob);
            
            // localStorage'ı SİLMİYORUZ - sayfa değişikliklerinde oturum korunmalı
            // localStorage sadece manuel logout işleminde silinecek
        }
    });

    // pagehide event'i daha güvenilir - sayfa gerçekten kapatıldığında tetiklenir
    window.addEventListener('pagehide', function(event) {
        // Eğer sayfa cache'e alınıyorsa (back/forward navigation), logout yapma
        if (event.persisted) {
            return;
        }
        
        // Sayfa gerçekten kapatıldı, ama yine de localStorage'ı koruyoruz
        // Çünkü kullanıcı başka bir sayfaya geçiyor olabilir
    });
})();

