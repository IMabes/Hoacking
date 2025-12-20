function updateNavbarAuth() {
  // localStorage'dan kullanıcıyı oku
  const userDataStr = localStorage.getItem("userData");
  let userData = null;
  try {
    userData = userDataStr ? JSON.parse(userDataStr) : null;
  } catch {
    userData = null;
  }

  const authButtons = document.getElementById("authButtons");
  const profileButton = document.getElementById("profileButton");
  const adminPanelButton = document.getElementById("adminPanelButton");

  // Navbar henüz yüklenmediyse sessizce çık
  if (!authButtons || !profileButton) return;

  // Giriş yoksa
  if (!userData || !userData.id) {
    authButtons.style.display = "flex";
    profileButton.style.display = "none";
    if (adminPanelButton) adminPanelButton.style.display = "none";
    return;
  }

  // Giriş varsa
  authButtons.style.display = "none";
  profileButton.style.display = "flex";

  // Admin kontrolü (role, urole veya nickname 'admin' ise)
  if (adminPanelButton) {
    const role = (userData.role || userData.urole || "").toLowerCase();
    const nick = (userData.nickname || "").toLowerCase();

    if (role === "admin" || nick === "admin") {
      adminPanelButton.style.display = "inline-block";
    } else {
      adminPanelButton.style.display = "none";
    }
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
    window.location.href = basePath + '../../index.html';
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

// Blog yazılarını veritabanından yükle ve dinamik kartlar oluştur
async function loadBlogs() {
  try {
    console.log("=== Blog yazıları yükleniyor ===");
    
    // Container'ı bul
    const container = document.getElementById("blogs-container");
    if (!container) {
      console.error("Blog container bulunamadı!");
      return;
    }

    // Container'ı temizle
    container.innerHTML = '';

    // Önce card.html template'ini yükle
    console.log("Blog card template yükleniyor...");
    const cardTemplateResponse = await fetch("../backend/includes/card.html");
    if (!cardTemplateResponse.ok) {
      throw new Error(`Card template yüklenemedi: ${cardTemplateResponse.status}`);
    }
    const cardTemplateHtml = await cardTemplateResponse.text();
    console.log("Blog card template yüklendi.");
    
    const temp = document.createElement("div");
    temp.innerHTML = cardTemplateHtml;

    // CSS <link> varsa head'e ekle (bir kere)
    const styleLink = temp.querySelector("link[rel='stylesheet']");
    if (
      styleLink &&
      !document.querySelector(`link[href="${styleLink.href}"]`)
    ) {
      document.head.appendChild(styleLink.cloneNode());
    }

    // Template'den .card-blog yapısını al
    const cardTemplate = temp.querySelector(".card-blog");
    if (!cardTemplate) {
      console.error("Blog card template içinde .card-blog bulunamadı!");
      return;
    }
    console.log("Blog card template yapısı alındı.");

    // Veritabanından blog yazılarını çek
    console.log("API'den blog yazıları çekiliyor...");
    const blogsResponse = await fetch("http://localhost:3000/api/blogs");
    
    if (!blogsResponse.ok) {
      // API hatası - sessizce container'ı gizle, hata mesajı gösterme
      console.warn("API hatası:", blogsResponse.status);
      container.style.display = 'none';
      return;
    }
    
    const blogsData = await blogsResponse.json();
    console.log("API Response:", blogsData);

    if (!blogsData.success) {
      // Başarısız response - sessizce container'ı gizle
      console.warn("Blog yazıları yüklenemedi:", blogsData.message || "Bilinmeyen hata");
      container.style.display = 'none';
      return;
    }

    if (!blogsData.blogs || blogsData.blogs.length === 0) {
      // Veri yok - sessizce container'ı gizle
      console.log("Veritabanında blog yazısı bulunamadı. Container gizleniyor.");
      container.style.display = 'none';
      return;
    }

    const blogs = blogsData.blogs;
    console.log(`${blogs.length} blog yazısı bulundu.`);

    // Container'ı görünür yap
    container.style.display = '';

    // Her blog yazısı için kart oluştur ve ekle
    // Görsel yoksa img'yi gizlemek için fallback kullanmıyoruz
    blogs.forEach((blog, index) => {
      const cardClone = cardTemplate.cloneNode(true);
      
      // Kart içeriğini güncelle
      const titleElement = cardClone.querySelector("h1");
      const descriptionElement = cardClone.querySelector("p");
      const imageElement = cardClone.querySelector("img");
      
      if (titleElement) {
        titleElement.textContent = blog.title || "BAŞLIK";
      }
      
      if (descriptionElement) {
        descriptionElement.textContent = blog.description || "Açıklama bulunmuyor.";
      }

      if (imageElement) {
        if (blog.image_url) {
          imageElement.src = blog.image_url;
          imageElement.alt = blog.title || "Blog görseli";
          imageElement.style.display = "";
        } else {
          imageElement.style.display = "none";
        }
      }

      // Kartı container'a ekle
      container.appendChild(cardClone);
      console.log(`✓ Blog kart ${index + 1} oluşturuldu: "${blog.title}"`);
    });

    console.log("=== Blog yazıları başarıyla yüklendi! ===");

  } catch (err) {
    // Hata durumunda sadece console'da log tut, kullanıcıya hata mesajı gösterme
    console.error("❌ Blog yazıları yüklenirken hata oluştu:", err);
    console.error("Hata detayı:", err.message);
    
    // Container'ı sessizce gizle
    const container = document.getElementById("blogs-container");
    if (container) {
      container.style.display = 'none';
    }
  }
}

// Kursları veritabanından yükle ve dinamik kartlar oluştur
async function loadCourses() {
  try {
    console.log("=== Kurslar yükleniyor ===");
    
    // Container'ı bul
    const container = document.getElementById("courses-container");
    if (!container) {
      console.error("Kurs container bulunamadı!");
      return;
    }

    // Container'ı temizle
    container.innerHTML = '';

    // Önce card.html template'ini yükle
    console.log("Card template yükleniyor...");
    const cardTemplateResponse = await fetch("../backend/includes/card.html");
    if (!cardTemplateResponse.ok) {
      throw new Error(`Card template yüklenemedi: ${cardTemplateResponse.status}`);
    }
    const cardTemplateHtml = await cardTemplateResponse.text();
    console.log("Card template yüklendi.");
    
    const temp = document.createElement("div");
    temp.innerHTML = cardTemplateHtml;

    // CSS <link> varsa head'e ekle (bir kere)
    const styleLink = temp.querySelector("link[rel='stylesheet']");
    if (
      styleLink &&
      !document.querySelector(`link[href="${styleLink.href}"]`)
    ) {
      document.head.appendChild(styleLink.cloneNode());
    }

    // Template'den .card-test yapısını al
    const cardTemplate = temp.querySelector(".card-test");
    if (!cardTemplate) {
      console.error("Card template içinde .card-test bulunamadı!");
      return;
    }
    console.log("Card template yapısı alındı.");

    // Veritabanından kursları çek
    console.log("API'den kurslar çekiliyor...");
    const coursesResponse = await fetch("http://localhost:3000/api/courses");
    
    if (!coursesResponse.ok) {
      // API hatası - sessizce container'ı gizle, hata mesajı gösterme
      console.warn("API hatası:", coursesResponse.status);
      container.style.display = 'none';
      return;
    }
    
    const coursesData = await coursesResponse.json();
    console.log("API Response:", coursesData);

    if (!coursesData.success) {
      // Başarısız response - sessizce container'ı gizle
      console.warn("Kurslar yüklenemedi:", coursesData.message || "Bilinmeyen hata");
      container.style.display = 'none';
      return;
    }

    if (!coursesData.courses || coursesData.courses.length === 0) {
      // Veri yok - sessizce container'ı gizle
      console.log("Veritabanında kurs bulunamadı. Container gizleniyor.");
      container.style.display = 'none';
      return;
    }

    const courses = coursesData.courses;
    console.log(`${courses.length} kurs bulundu.`);

    // Container'ı görünür yap
    container.style.display = '';

    // Her kurs için kart oluştur ve ekle
    // Görsel yoksa img'yi gizlemek için fallback kullanmıyoruz
    courses.forEach((course, index) => {
      const cardClone = cardTemplate.cloneNode(true);
      
      // Kart içeriğini güncelle
      const titleElement = cardClone.querySelector("h1");
      const descriptionElement = cardClone.querySelector("p");
      const imageElement = cardClone.querySelector("img");
      
      if (titleElement) {
        titleElement.textContent = course.title || "BAŞLIK";
      }
      
      if (descriptionElement) {
        descriptionElement.textContent = course.description || "Açıklama bulunmuyor.";
      }

      if (imageElement) {
        if (course.image_url) {
          imageElement.src = course.image_url;
          imageElement.alt = course.title || "Kurs görseli";
          imageElement.style.display = "";
        } else {
          imageElement.style.display = "none";
        }
      }

      // Kartı container'a ekle
      container.appendChild(cardClone);
      console.log(`✓ Kart ${index + 1} oluşturuldu: "${course.title}"`);
    });

    console.log("=== Kurslar başarıyla yüklendi! ===");

  } catch (err) {
    // Hata durumunda sadece console'da log tut, kullanıcıya hata mesajı gösterme
    console.error("❌ Kurslar yüklenirken hata oluştu:", err);
    console.error("Hata detayı:", err.message);
    
    // Container'ı sessizce gizle
    const container = document.getElementById("courses-container");
    if (container) {
      container.style.display = 'none';
    }
  }
}

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
  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) {
    fetch("../backend/includes/footer.html")
      .then((response) => response.text())
      .then((data) => {
        footerContainer.innerHTML = data;
      })
      .catch((err) => console.error("Footer yüklenemedi:", err));
  }

  // blob.html dosyasını yükle
  const blobContainer = document.getElementById("blob");
  if (blobContainer) {
    fetch("../backend/includes/blob.html")
      .then((response) => response.text())
      .then((data) => {
        blobContainer.innerHTML = data;
      })
      .catch((err) => console.error("Blob yüklenemedi:", err));
  }

  // Kursları veritabanından çek ve dinamik kartlar oluştur
  // DOM'un tamamen yüklenmesini bekle - sadece cources.html sayfasında
  if (window.location.pathname.includes('cources.html')) {
    // DOMContentLoaded event'ini bekle
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadCourses, 100);
        // Her 10 saniyede bir kursları kontrol et (veri eklendiğinde otomatik güncelleme)
        setInterval(loadCourses, 10000);
      });
    } else {
      // DOM zaten yüklü
      setTimeout(loadCourses, 100);
      // Her 10 saniyede bir kursları kontrol et
      setInterval(loadCourses, 10000);
    }
  }

  // Blog yazılarını veritabanından çek ve dinamik kartlar oluştur
  // DOM'un tamamen yüklenmesini bekle - sadece blog.html sayfasında
  if (window.location.pathname.includes('blog.html')) {
    // DOMContentLoaded event'ini bekle
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadBlogs, 100);
        // Her 10 saniyede bir blog yazılarını kontrol et (veri eklendiğinde otomatik güncelleme)
        setInterval(loadBlogs, 10000);
      });
    } else {
      // DOM zaten yüklü
      setTimeout(loadBlogs, 100);
      // Her 10 saniyede bir blog yazılarını kontrol et
      setInterval(loadBlogs, 10000);
    }
  }

  // 3D modeller (sadece ilgili container varsa yükle)
  fetch("../../backend/includes/model.html")
    .then((res) => res.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const chainModel = doc.querySelector(".chain-model");
      const chainContainer = document.getElementById("chain-model");
      if (chainModel && chainContainer) {
        chainContainer.innerHTML = "";
        chainContainer.appendChild(chainModel);
      }

      const abstractModel = doc.querySelector(".abstract-model");
      const abstractContainer = document.getElementById("abstract-model");
      if (abstractModel && abstractContainer) {
        abstractContainer.innerHTML = "";
        abstractContainer.appendChild(abstractModel);
      }
    })
    .catch((err) => console.error("Model yüklenemedi:", err));
}

// Sayfa yüklendiğinde tüm include'ları yükle
document.addEventListener("DOMContentLoaded", function () {
  loadIncludes();
});
