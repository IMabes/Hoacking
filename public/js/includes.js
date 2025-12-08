// Navbar kimlik doğrulama işlevleri
function updateNavbarAuth() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const authButtons = document.getElementById('authButtons');
  const profileButton = document.getElementById('profileButton');
  
  if (userData.id) {
    // Kullanıcı giriş yaptı - profil düğmesini göster, giriş/kayıt düğmelerini gizle
    if (authButtons) authButtons.style.display = 'none';
    if (profileButton) profileButton.style.display = 'flex';
  } else {
    // Kullanıcı giriş yapmamış - giriş/kayıt düğmelerini göster, profil düğmesini gizle
    if (authButtons) authButtons.style.display = 'flex';
    if (profileButton) profileButton.style.display = 'none';
  }
}

// Çıkış işlevi
async function logout() {
  // Aktivite takipçisinin çıkış işlevini kullanabilirsin
  if (window.activityTracker && window.activityTracker.logout) {
    window.activityTracker.logout();
  } else {
    // Manuel çıkış işlemi
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (userData.id) {
      try {
        await fetch('http://localhost:3000/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('userData');
    // Özel olayı tetikle ve navbar'ı güncelle
    window.dispatchEvent(new Event('userLogout'));
    // Navbar'ı hemen güncelle
    updateNavbarAuth();
    // index.html sayfasına yönlendir (şu anki sayfanın konumuna göre)
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    window.location.href = basePath + '/index.html';
  }
}

// Fonksiyonları global olarak kullanılabilir hale getir
window.logout = logout;
window.updateNavbarAuth = updateNavbarAuth;

// Sayfa yüklenmediğinde (kullanıcı sekme/pencereyi kapatır)
window.addEventListener('beforeunload', async function() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  if (userData.id) {
    // sendBeacon kullanarak çıkış işlemi güvenli bir şekilde gerçekleştir
    const blob = new Blob([JSON.stringify({ userId: userData.id })], {
      type: 'application/json'
    });
    navigator.sendBeacon('http://localhost:3000/logout', blob);
  }
});

// Depolama değişikliklerini takip et (kullanıcı başka bir sekmede giriş/çıkış yapıldığında)
window.addEventListener('storage', function(e) {
  if (e.key === 'userData') {
    updateNavbarAuth();
  }
});

// Özel olayları takip et
window.addEventListener('userLogin', function() {
  updateNavbarAuth();
});

window.addEventListener('userLogout', function() {
  updateNavbarAuth();
});

function loadIncludes() {
  // navbar.html dosyasını yükle
  fetch("../backend/includes/navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;
      // navbar auth durumunu yükleme sonrası güncelle
      setTimeout(() => {
        updateNavbarAuth();
      }, 50);
    })
    .catch((err) => console.error("Navbar yüklenemedi:", err));

    // footer.html dosyasını yükle
  fetch("../backend/includes/footer.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer-container").innerHTML = data;
  })
  .catch((err) => console.error("Footer yüklenemedi:", err));

  // blob.html dosyasını yükle
  fetch("../backend/includes/blob.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("blob").innerHTML = data;
    })
    .catch((err) => console.error("Blob yüklenemedi:", err));

  // card.html dosyasını yükle (test sayfası)
  fetch("../backend/includes/card.html")
    .then((response) => response.text())
    .then((data) => {
      const temp = document.createElement("div");
      temp.innerHTML = data;

      // CSS <link> varsa head'e ekle (bir kere)
      const styleLink = temp.querySelector("link[rel='stylesheet']");
      if (
        styleLink &&
        !document.querySelector(`link[href="${styleLink.href}"]`)
      ) {
        document.head.appendChild(styleLink.cloneNode());
      }

      const cardContent = temp.querySelector(".card-test");

      document.querySelectorAll(".card-test").forEach((card) => {
        card.innerHTML = cardContent.innerHTML;
      });
    })
    .catch((err) => console.error("Card yüklenemedi:", err));

  //kart ekleme BLOG SAYFASI
  fetch("../backend/includes/card.html")
    .then((response) => response.text())
    .then((data) => {
      const temp = document.createElement("div");
      temp.innerHTML = data;

      // CSS <link> varsa head'e ekle (bir kere)
      const styleLink = temp.querySelector("link[rel='stylesheet']");
      if (
        styleLink &&
        !document.querySelector(`link[href="${styleLink.href}"]`)
      ) {
        document.head.appendChild(styleLink.cloneNode());
      }

      const cardContent = temp.querySelector(".card-blog");

      document.querySelectorAll(".card-blog").forEach((card) => {
        card.innerHTML = cardContent.innerHTML;
      });
    })
    .catch((err) => console.error("Card yüklenemedi:", err));

    //modeller
  
    fetch('../../backend/includes/model.html')
    .then(res => res.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const selectedModel = doc.querySelector('.chain-model'); // istediğin model
  
      // Bir model kapsayıcı div olsun, örn: <div id="model-container"></div> sayfanda
      const container = document.getElementById('chain-model');
      container.innerHTML = '';  // varsa içeriği temizle
      container.appendChild(selectedModel); // yeni modeli ekle
    });
  



    fetch('../../backend/includes/model.html')
    .then(res => res.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const selectedModel = doc.querySelector('.abstract-model'); // istediğin model
  
      // Bir model kapsayıcı div olsun, örn: <div id="model-container"></div> sayfanda
      const container = document.getElementById('abstract-model');
      container.innerHTML = '';  // varsa içeriği temizle
      container.appendChild(selectedModel); // yeni modeli ekle
    });
  
    
  
  

}

// Sayfa yüklendiğinde çalıştır
document.addEventListener("DOMContentLoaded", function() {
  loadIncludes();
  // Also update navbar when DOM is ready
  setTimeout(updateNavbarAuth, 100);
});

// Also update navbar immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateNavbarAuth);
} else {
  // DOM is already loaded, update immediately
  setTimeout(updateNavbarAuth, 50);
}
