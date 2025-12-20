// Check authentication and navigate or show message
function checkAuthAndNavigate(url) {
  const userDataStr = localStorage.getItem('userData');
  let userData = null;
  
  try {
    userData = userDataStr ? JSON.parse(userDataStr) : null;
  } catch (e) {
    userData = null;
  }
  
  // If no user data, show nice message
  if (!userData || !userData.id) {
    showAuthRequiredModal();
    return;
  }
  
  // User is authenticated, navigate
  window.location.href = url;
}

// Show authentication required modal
function showAuthRequiredModal() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'auth-required-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div style="
      background: linear-gradient(135deg, rgba(10, 2, 26, 0.95) 0%, rgba(15, 8, 30, 0.95) 100%);
      border: 2px solid rgba(0, 255, 136, 0.3);
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 255, 136, 0.2);
      animation: slideUp 0.3s ease;
    ">
      <div style="
        font-size: 4rem;
        margin-bottom: 20px;
        filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.5));
      ">🔒</div>
      <h2 style="
        font-family: 'Pixelify Sans', sans-serif;
        font-size: 1.8rem;
        color: #00ff88;
        margin-bottom: 15px;
        text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
      ">Kurslara Erişim İçin Giriş Yapın</h2>
      <p style="
        color: rgba(255, 255, 255, 0.8);
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 30px;
      ">Kurslara erişmek için giriş yapmanız gerekiyor. Hesabınız yoksa kayıt olabilirsiniz.</p>
      <div style="
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
      ">
        <button onclick="window.location.href='login.html'" style="
          padding: 12px 30px;
          background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
          border: none;
          border-radius: 25px;
          color: #0a021a;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 5px 20px rgba(0, 255, 136, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(0, 255, 136, 0.4)'" 
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 5px 20px rgba(0, 255, 136, 0.3)'">
          Giriş Yap
        </button>
        <button onclick="window.location.href='register.html'" style="
          padding: 12px 30px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(0, 255, 136, 0.3);
          border-radius: 25px;
          color: #00ff88;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        " onmouseover="this.style.background='rgba(0, 255, 136, 0.15)'; this.style.borderColor='rgba(0, 255, 136, 0.5)'" 
        onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='rgba(0, 255, 136, 0.3)'">
          Kayıt Ol
        </button>
        <button onclick="closeAuthModal()" style="
          padding: 12px 30px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          color: rgba(255, 255, 255, 0.7);
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseover="this.style.borderColor='rgba(255, 255, 255, 0.4)'; this.style.color='rgba(255, 255, 255, 0.9)'" 
        onmouseout="this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.color='rgba(255, 255, 255, 0.7)'">
          İptal
        </button>
      </div>
    </div>
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
  `;
  
  document.body.appendChild(modal);
  
  // Close on overlay click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeAuthModal();
    }
  });
}

// Close auth modal
function closeAuthModal() {
  const modal = document.getElementById('auth-required-modal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Validate session with backend before showing authenticated state
async function validateSession(userData) {
  if (!userData || !userData.id) {
    return false;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userData.id })
    });

    const data = await response.json();
    
    if (data.success && data.valid && data.user) {
      // Update localStorage with fresh user data from backend
      localStorage.setItem('userData', JSON.stringify(data.user));
      return true;
    } else {
      // Session invalid, clear localStorage
      localStorage.removeItem('userData');
      localStorage.removeItem('lastSessionValidation');
      return false;
    }
  } catch (error) {
    console.error('Session validation error:', error);
    // Network hatası durumunda localStorage'ı SİLMİYORUZ
    // Sadece backend'e ulaşılamadığı için hata olabilir
    // localStorage'ı sadece gerçekten invalid session durumunda siliyoruz
    return false; // Hata durumunda false döndür ama localStorage'ı koru
  }
}

async function updateNavbarAuth(skipValidation = false) {
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

  // Eğer skipValidation true ise (yeni login yapıldıysa), validation'ı atla
  // Ayrıca sayfa değişikliklerinde de validation yapmıyoruz - sadece navbar'ı güncelliyoruz
  if (!skipValidation) {
    // Sadece belirli aralıklarla validation yap (her navbar güncellemesinde değil)
    const lastValidation = localStorage.getItem('lastSessionValidation');
    const now = Date.now();
    const validationInterval = 5 * 60 * 1000; // 5 dakika
    
    const needsValidation = !lastValidation || (now - parseInt(lastValidation)) > validationInterval;
    
    if (needsValidation) {
      // Validate session with backend
      const isValid = await validateSession(userData);
      
      if (!isValid) {
        // Session invalid, show login buttons
        authButtons.style.display = "flex";
        profileButton.style.display = "none";
        if (adminPanelButton) adminPanelButton.style.display = "none";
        return;
      }

      // Get updated userData after validation
      const updatedUserDataStr = localStorage.getItem("userData");
      try {
        userData = updatedUserDataStr ? JSON.parse(updatedUserDataStr) : null;
      } catch {
        userData = null;
      }
      
      // Validation zamanını kaydet
      localStorage.setItem('lastSessionValidation', now.toString());
    }
  }

  // Giriş varsa ve geçerliyse
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
    localStorage.removeItem('lastSessionValidation');
    // Özel olayı tetikle ve navbar'ı güncelle
    window.dispatchEvent(new Event('userLogout'));
    // Navbar'ı hemen güncelle
    updateNavbarAuth();
    // index.html sayfasına yönlendir
    // index.html root dizinde (public'in bir üstünde)
    const currentPath = window.location.pathname;
    if (currentPath.includes('/public/')) {
      // public klasöründeysek, bir üst dizine çık
      window.location.href = '../index.html';
    } else {
      // Root dizindeysek direkt index.html
      window.location.href = 'index.html';
    }
  }
}

// Fonksiyonları global olarak kullanılabilir hale getir
window.logout = logout;
window.updateNavbarAuth = updateNavbarAuth;

// Sayfa yüklenmediğinde (kullanıcı sekme/pencereyi kapatır)
// NOT: Bu event sadece gerçek sayfa kapatılmasında çalışmalı
// Sayfa içi navigasyon için logout-handler.js'deki mantık kullanılıyor
// Burada sadece backend'e bilgi gönderiyoruz, localStorage'ı silmiyoruz
window.addEventListener('beforeunload', async function() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  if (userData.id) {
    // sendBeacon kullanarak çıkış işlemi güvenli bir şekilde gerçekleştir
    // Ancak localStorage'ı burada silmiyoruz - logout-handler.js bunu yapacak
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
  // Yeni login yapıldığında validation'ı atla
  updateNavbarAuth(true);
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

      // Add click handler to navigate to blog detail page
      cardClone.style.cursor = 'pointer';
      cardClone.addEventListener('click', function() {
        window.location.href = `blog-detail.html?id=${blog.id}`;
      });

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

// Öne çıkan kursu yükle
async function loadFeaturedCourse() {
  try {
    const featuredContainer = document.getElementById("featured-course-container");
    if (!featuredContainer) return;
    
    const response = await fetch("http://localhost:3000/api/courses/featured");
    const data = await response.json();
    
    if (data.success && data.course) {
      const course = data.course;
      document.getElementById("featured-course-title").textContent = course.title || "Kurs Başlığı";
      document.getElementById("featured-course-description").textContent = course.description || "Kurs açıklaması";
      
      const iconElement = document.getElementById("featured-course-icon");
      if (course.image_url) {
        iconElement.innerHTML = `<img src="${course.image_url}" alt="${course.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px;" />`;
      } else {
        iconElement.textContent = "🎯";
      }
      
      const btn = document.getElementById("featured-course-btn");
      if (btn && course.id) {
        btn.onclick = function() {
          checkAuthAndNavigate(`course-detail.html?id=${course.id}`);
        };
      }
      
      featuredContainer.style.display = "block";
    } else {
      featuredContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Öne çıkan kurs yüklenirken hata:", error);
    const featuredContainer = document.getElementById("featured-course-container");
    if (featuredContainer) featuredContainer.style.display = "none";
  }
}

// Kursları veritabanından yükle ve dinamik kartlar oluştur
async function loadCourses() {
  try {
    console.log("=== Kurslar yükleniyor ===");
    
    // Öne çıkan kursu yükle
    await loadFeaturedCourse();
    
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

    // Veritabanından kursları çek (öne çıkan olmayanlar)
    console.log("API'den kurslar çekiliyor...");
    const coursesResponse = await fetch("http://localhost:3000/api/courses?exclude_featured=true");
    
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

    // Get user progress if logged in
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    let userProgress = {};
    
    if (userData.id) {
      try {
        const progressResponse = await fetch(`http://localhost:3000/api/user/${userData.id}/progress`);
        const progressData = await progressResponse.json();
        if (progressData.success && progressData.courses) {
          progressData.courses.forEach(course => {
            userProgress[course.id] = course;
          });
        }
      } catch (err) {
        console.error('Error fetching user progress:', err);
      }
    }

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
      const buttonElement = cardClone.querySelector(".card-test-btn");
      const cardInfo = cardClone.querySelector(".card-test-info");
      
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
          // Görsel yoksa ikon göster
          const imageContainer = cardClone.querySelector(".card-test-image");
          if (imageContainer) {
            imageElement.style.display = "none";
            // İkon ekle
            const icon = document.createElement("div");
            icon.className = "card-test-icon";
            icon.textContent = "🎯"; // Varsayılan ikon
            imageContainer.appendChild(icon);
          }
        }
      }

      // Add progress bar if user has progress for this course
      // Progress bar should be at the bottom, right above the button
      if (userProgress[course.id] && cardInfo && buttonElement) {
        const progress = userProgress[course.id].progress || 0;
        const progressBar = document.createElement('div');
        progressBar.className = 'course-card-progress';
        progressBar.style.cssText = 'margin-top: auto; margin-bottom: 12px; width: 100%;';
        progressBar.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.7);">İlerleme</span>
            <span style="font-size: 0.85rem; color: #00ff88; font-weight: 600;">${progress}%</span>
          </div>
          <div style="width: 100%; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden;">
            <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #ff0099, #00ff88); border-radius: 2px; transition: width 0.5s ease;"></div>
          </div>
        `;
        // Insert progress bar right before the button
        buttonElement.parentNode.insertBefore(progressBar, buttonElement);
      }

      // Butona tıklama olayı ekle - authentication kontrolü ile
      if (buttonElement && course.id) {
        buttonElement.addEventListener('click', function(e) {
          e.stopPropagation();
          checkAuthAndNavigate(`course-detail.html?id=${course.id}`);
        });
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
  // Admin panelinden geri butonuyla dönüldüyse oturumu kapat
  window.addEventListener('pageshow', function(event) {
    // Eğer sayfa back/forward navigation ile yüklendiyse
    const navigationType = performance.getEntriesByType('navigation')[0]?.type;
    const isBackForward = navigationType === 'back_forward' || event.persisted;
    
    if (isBackForward) {
      const isInAdminPanel = localStorage.getItem('isInAdminPanel');
      
      // Eğer admin panelinde değilsek ama flag hala varsa, geri butonuyla dönmüşüz demektir
      if (isInAdminPanel === 'true' && !window.location.pathname.includes('admin.html')) {
        console.log('Admin panelinden geri butonuyla dönüldü, oturum kapatılıyor...');
        
        // Oturumu kapat
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (userData.id) {
          // Backend'e logout isteği gönder
          fetch('http://localhost:3000/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userData.id }),
            keepalive: true
          }).catch(err => console.error('Logout error:', err));
        }
        
        // localStorage'ı temizle
        localStorage.removeItem('userData');
        localStorage.removeItem('lastSessionValidation');
        localStorage.removeItem('isInAdminPanel');
        
        // Navbar'ı güncelle
        window.dispatchEvent(new Event('userLogout'));
        if (typeof updateNavbarAuth === 'function') {
          updateNavbarAuth();
        }
      }
    }
  });
  
  // Sayfa değişikliklerinde validation yapmıyoruz
  // Sadece navbar'ı güncelliyoruz - validation updateNavbarAuth içinde yapılacak
  // Ancak validation'ı sadece belirli aralıklarla yapıyoruz (her sayfa yüklemesinde değil)
  
  // localStorage'dan son validation zamanını kontrol et
  const lastValidation = localStorage.getItem('lastSessionValidation');
  const now = Date.now();
  const validationInterval = 5 * 60 * 1000; // 5 dakika
  
  // Eğer son validation 5 dakikadan eskiyse veya hiç yapılmamışsa, validation yap
  const needsValidation = !lastValidation || (now - parseInt(lastValidation)) > validationInterval;
  
  if (needsValidation) {
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData.id) {
          // Validate with backend - if invalid, will be cleared in updateNavbarAuth
          validateSession(userData).then((isValid) => {
            // Validation zamanını kaydet
            if (isValid) {
              localStorage.setItem('lastSessionValidation', now.toString());
            }
          });
        }
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('userData');
      }
    } else {
      // No user data, update validation time anyway
      localStorage.setItem('lastSessionValidation', now.toString());
    }
  }

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
