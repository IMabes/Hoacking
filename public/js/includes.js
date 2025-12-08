// Navbar authentication functions
function updateNavbarAuth() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const authButtons = document.getElementById('authButtons');
  const profileButton = document.getElementById('profileButton');
  
  if (userData.id) {
    // User is logged in - show profile button, hide login/register buttons
    if (authButtons) authButtons.style.display = 'none';
    if (profileButton) profileButton.style.display = 'flex';
  } else {
    // User is not logged in - show login/register buttons, hide profile button
    if (authButtons) authButtons.style.display = 'flex';
    if (profileButton) profileButton.style.display = 'none';
  }
}

// Logout function
async function logout() {
  // Use activity tracker's logout function if available
  if (window.activityTracker && window.activityTracker.logout) {
    window.activityTracker.logout();
  } else {
    // Fallback to manual logout
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
    // Trigger custom event to update navbar
    window.dispatchEvent(new Event('userLogout'));
    // Update navbar immediately
    updateNavbarAuth();
    // Redirect to index.html (relative to current page)
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    window.location.href = basePath + '/index.html';
  }
}

// Make functions globally available
window.logout = logout;
window.updateNavbarAuth = updateNavbarAuth;

// Handle page unload (when user closes tab/window)
window.addEventListener('beforeunload', async function() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  if (userData.id) {
    // Use navigator.sendBeacon for reliable logout on page close
    const blob = new Blob([JSON.stringify({ userId: userData.id })], {
      type: 'application/json'
    });
    navigator.sendBeacon('http://localhost:3000/logout', blob);
  }
});

// Listen for storage changes (when user logs in/out in another tab)
window.addEventListener('storage', function(e) {
  if (e.key === 'userData') {
    updateNavbarAuth();
  }
});

// Listen for custom events
window.addEventListener('userLogin', function() {
  updateNavbarAuth();
});

window.addEventListener('userLogout', function() {
  updateNavbarAuth();
});

function loadIncludes() {
  // Navbar yükle
  fetch("../backend/includes/navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;
      // Update navbar auth state after loading
      setTimeout(() => {
        updateNavbarAuth();
      }, 50);
    })
    .catch((err) => console.error("Navbar yüklenemedi:", err));

    // footer yükle
  fetch("../backend/includes/footer.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer-container").innerHTML = data;
  })
  .catch((err) => console.error("Footer yüklenemedi:", err));

  // Blob yükle
  fetch("../backend/includes/blob.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("blob").innerHTML = data;
    })
    .catch((err) => console.error("Blob yüklenemedi:", err));

  //kart ekleme TEST SAYFASI
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
