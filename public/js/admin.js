async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

function formatDate(val) {
  if (!val) return '-';
  const d = new Date(val);
  return d.toLocaleDateString('tr-TR');
}

function renderCourses(courses, isOverview = false) {
  const body = isOverview 
    ? document.getElementById('overview-courses-table-body')
    : document.getElementById('courses-table-body');
  if (!body) return;
  body.innerHTML = '';
  
  console.log('renderCourses çağrıldı, kurs sayısı:', courses.length);
  console.log('İlk kurs örneği:', courses[0]);
  
  courses.forEach((c) => {
    // Kurs ID'sini kontrol et
    if (!c.id && !c.ID) {
      console.warn('Kurs ID bulunamadı:', c);
    }
    
    const courseId = c.id || c.ID;
    if (!courseId) {
      console.error('Kurs ID yok, atlanıyor:', c);
      return;
    }
    
    const row = document.createElement('div');
    row.className = 'table-row';
    const isFeatured = c.is_featured === 1 || c.is_featured === true;
    const starIcon = isFeatured ? '⭐' : '☆'; // Dolu yıldız vs boş yıldız
    row.innerHTML = `
      <span>${c.title || '-'}</span>
      <span>${(c.category || '').toString() || '-'}</span>
      <span class="pill">${c.image_url ? 'Var' : 'Yok'}</span>
      <span class="pill ${isFeatured ? 'featured' : ''}">${isFeatured ? '<span class="star-yellow">⭐</span> Öne Çıkan' : 'Normal'}</span>
      <span>${formatDate(c.created_at)}</span>
      ${!isOverview ? `
      <span class="table-actions">
        <button class="ghost small" onclick="previewCourse(${courseId})">Ön İzleme</button>
        <button class="ghost small" onclick="manageModules(${courseId})">Modüller</button>
        <button class="ghost small ${isFeatured ? 'active featured-btn' : ''}" onclick="toggleFeatured(${courseId}, ${!isFeatured})" title="${isFeatured ? 'Öne çıkan durumundan çıkar' : 'Öne çıkan yap'}">
          ${isFeatured ? '<span class="star-yellow">⭐</span> Öne Çıkardan Kaldır' : '☆ Öne Çıkar'}
        </button>
        <button class="ghost small" onclick="editCourse(${courseId})">Düzenle</button>
        <button class="danger small" data-type="course" data-id="${courseId}">Sil</button>
      </span>
      ` : ''}
    `;
    body.appendChild(row);
  });
}

function renderBlogs(blogs, isOverview = false) {
  const body = isOverview
    ? document.getElementById('overview-blogs-table-body')
    : document.getElementById('blogs-table-body');
  if (!body) return;
  body.innerHTML = '';
  blogs.forEach((b) => {
    const row = document.createElement('div');
    row.className = 'table-row';
    const desc = (b.description || '').toString().slice(0, 60) + ((b.description || '').length > 60 ? '…' : '');
    row.innerHTML = `
      <span>${b.title || '-'}</span>
      <span>${desc || '-'}</span>
      <span class="pill">${b.image_url ? 'Var' : 'Yok'}</span>
      <span>${formatDate(b.created_at)}</span>
      ${!isOverview ? `
      <span class="table-actions">
        <button class="ghost small" onclick="previewBlog(${b.id})">Ön İzleme</button>
        <button class="ghost small" onclick="editBlog(${b.id})">Düzenle</button>
        <button class="danger small" data-type="blog" data-id="${b.id}">Sil</button>
      </span>
      ` : ''}
    `;
    body.appendChild(row);
  });
}

function renderUsers(users) {
  const body = document.getElementById('users-table-body');
  if (!body) return;
  body.innerHTML = '';
  users.forEach((u) => {
    const row = document.createElement('div');
    row.className = 'table-row';
    
    // Rol renklendirmesi
    const role = u.urole || 'user';
    let roleClass = 'pill';
    let roleText = 'Kullanıcı';
    if (role === 'admin') {
      roleClass = 'pill featured';
      roleText = 'Admin';
    } else if (role === 'moderator') {
      roleClass = 'pill';
      roleText = 'Moderatör';
    }
    
    row.innerHTML = `
      <span>${u.uname || '-'}</span>
      <span>${u.unickname || '-'}</span>
      <span>${u.umail || '-'}</span>
      <span class="${roleClass}">${roleText}</span>
      <span class="pill">${u.uis_active ? 'Aktif' : 'Pasif'}</span>
      <span>${formatDate(u.ucreated_at)}</span>
      <span class="table-actions">
        <button class="ghost small" onclick="editUserRole(${u.id}, '${role}')" title="Rol Değiştir">Rol</button>
        <button class="danger small" data-type="user" data-id="${u.id}">Sil</button>
      </span>
    `;
    body.appendChild(row);
  });
}

function renderStats(summary) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? 0;
  };
  set('stat-courses', summary.courses ?? 0);
  set('stat-blogs', summary.blogs ?? 0);
  set('stat-users', summary.totalUsers ?? 0);
  set('stat-active', summary.activeUsers ?? 0);
}

async function loadAdminData() {
  try {
    console.log('=== Admin verileri yükleniyor ===');
    
    const [summaryRes, coursesRes, blogsRes, usersRes] = await Promise.all([
      fetchJSON('http://localhost:3000/api/admin/summary').catch(err => {
        console.error('Summary API hatası:', err);
        return { success: false, error: err.message };
      }),
      fetchJSON('http://localhost:3000/api/courses').catch(err => {
        console.error('Courses API hatası:', err);
        return { success: false, error: err.message };
      }),
      fetchJSON('http://localhost:3000/api/blogs').catch(err => {
        console.error('Blogs API hatası:', err);
        return { success: false, error: err.message };
      }),
      fetchJSON('http://localhost:3000/api/users').catch(err => {
        console.error('Users API hatası:', err);
        return { success: false, error: err.message };
      }),
    ]);

    console.log('API Yanıtları:', {
      summary: summaryRes,
      courses: coursesRes,
      blogs: blogsRes,
      users: usersRes
    });
    
    if (summaryRes && summaryRes.success) {
      renderStats(summaryRes);
    } else {
      console.warn('Summary yüklenemedi:', summaryRes);
    }
    
    if (coursesRes && coursesRes.success && coursesRes.courses) {
      console.log('Kurslar render ediliyor, kurs sayısı:', coursesRes.courses.length);
      renderCourses(coursesRes.courses, false); // Kurslar sayfası için
      renderCourses(coursesRes.courses, true); // Genel Bakış için
    } else {
      console.warn('Kurslar yüklenemedi veya boş:', coursesRes);
      // Boş listeleri göster
      renderCourses([], false);
      renderCourses([], true);
    }
    
    if (blogsRes && blogsRes.success && blogsRes.blogs) {
      renderBlogs(blogsRes.blogs, false); // Blog sayfası için
      renderBlogs(blogsRes.blogs, true); // Genel Bakış için
    } else {
      console.warn('Bloglar yüklenemedi:', blogsRes);
      renderBlogs([], false);
      renderBlogs([], true);
    }
    
    if (usersRes && usersRes.success && usersRes.users) {
      renderUsers(usersRes.users);
    } else {
      console.warn('Kullanıcılar yüklenemedi:', usersRes);
      renderUsers([]);
    }
    
    console.log('=== Admin verileri yükleme tamamlandı ===');
  } catch (err) {
    console.error('Admin data load error:', err);
    alert('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
  }
}

async function createCourse(data) {
  await fetch('http://localhost:3000/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

async function createBlog(data) {
  await fetch('http://localhost:3000/api/blogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

async function deleteItem(type, id) {
  let url;
  if (type === 'course') {
    url = `http://localhost:3000/api/courses/${id}`;
  } else if (type === 'blog') {
    url = `http://localhost:3000/api/blogs/${id}`;
  } else if (type === 'user') {
    url = `http://localhost:3000/api/users/${id}`;
  } else {
    console.error('Unknown type:', type);
    return;
  }
  
  const confirmed = confirm(`Bu ${type === 'user' ? 'kullanıcıyı' : type === 'course' ? 'kursu' : 'blog yazısını'} silmek istediğinizden emin misiniz?`);
  if (!confirmed) return;
  
  try {
    const response = await fetch(url, { method: 'DELETE' });
    
    // Response'un başarılı olup olmadığını kontrol et
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText || 'Sunucu hatası' };
      }
      alert(`Silme işlemi başarısız: ${errorData.message || `HTTP ${response.status}`}`);
      return;
    }
    
    const data = await response.json();
    if (data.success) {
      alert(`${type === 'user' ? 'Kullanıcı' : type === 'course' ? 'Kurs' : 'Blog'} başarıyla silindi.`);
      loadAdminData();
    } else {
      alert(`Silme işlemi başarısız: ${data.message || 'Bilinmeyen hata'}`);
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert(`Silme işlemi sırasında bir hata oluştu: ${error.message || 'Bağlantı hatası'}`);
  }
}

function attachActions() {
  const courseForm = document.getElementById('course-form');
  if (courseForm) {
    courseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(courseForm);
      let imageUrl = form.get('image_url');
      const file = form.get('image_file');
      if (file && file.size > 0) {
        const up = new FormData();
        up.append('file', file);
        const upRes = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: up,
        }).then(r => r.json());
        if (upRes.success) imageUrl = upRes.url;
      }
      await createCourse({
        title: form.get('title'),
        description: form.get('description'),
        image_url: imageUrl,
      });
      courseForm.reset();
      loadAdminData();
    });
  }

  const blogForm = document.getElementById('blog-form');
  if (blogForm) {
    blogForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(blogForm);
      let imageUrl = form.get('image_url');
      const file = form.get('image_file');
      if (file && file.size > 0) {
        const up = new FormData();
        up.append('file', file);
        const upRes = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: up,
        }).then(r => r.json());
        if (upRes.success) imageUrl = upRes.url;
      }
      await createBlog({
        title: form.get('title'),
        description: form.get('description'),
        image_url: imageUrl,
      });
      blogForm.reset();
      loadAdminData();
    });
  }

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-type][data-id]');
    if (!btn) return;
    const type = btn.dataset.type;
    const id = btn.dataset.id;
    await deleteItem(type, id);
    loadAdminData();
  });

  const refreshCourses = document.getElementById('refresh-courses');
  if (refreshCourses) refreshCourses.addEventListener('click', loadAdminData);
  const refreshBlogs = document.getElementById('refresh-blogs');
  if (refreshBlogs) refreshBlogs.addEventListener('click', loadAdminData);
  const refreshUsers = document.getElementById('refresh-users');
  if (refreshUsers) refreshUsers.addEventListener('click', loadAdminData);
}

// Kullanıcı rolü düzenle
async function editUserRole(userId, currentRole) {
  try {
    // Modal aç
    const modal = document.getElementById('edit-item-modal');
    const content = document.getElementById('edit-item-content');
    const title = document.getElementById('edit-item-modal-title');
    
    if (!modal || !content || !title) {
      alert('Modal elementi bulunamadı.');
      return;
    }
    
    title.textContent = 'Kullanıcı Rolü Değiştir';
    
    content.innerHTML = `
      <form id="edit-user-role-form" class="modal-form">
        <div>
          <label>Kullanıcı Rolü</label>
          <select id="edit-user-role" required>
            <option value="user" ${currentRole === 'user' ? 'selected' : ''}>Kullanıcı</option>
            <option value="moderator" ${currentRole === 'moderator' ? 'selected' : ''}>Moderatör</option>
            <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="ghost" onclick="closeEditItemModal()">İptal</button>
          <button type="submit" class="primary">Kaydet</button>
        </div>
      </form>
    `;
    
    // Form submit
    document.getElementById('edit-user-role-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await updateUserRole(userId);
    });
    
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Edit user role error:', error);
    alert('Rol değiştirme formu açılırken bir hata oluştu.');
  }
}

// Kullanıcı rolü güncelle
async function updateUserRole(userId) {
  try {
    const role = document.getElementById('edit-user-role').value;
    
    if (!role) {
      alert('Lütfen bir rol seçin.');
      return;
    }
    
    const response = await fetch(`http://localhost:3000/api/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: role })
    });
    
    // Response'un başarılı olup olmadığını kontrol et
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorText = await response.text();
        // Eğer HTML döndüyse (hata sayfası), sadece ilk satırı al
        if (errorText.startsWith('<!DOCTYPE') || errorText.startsWith('<html')) {
          errorMessage = 'Sunucu hatası: HTML yanıt alındı (endpoint bulunamadı olabilir)';
        } else {
          errorMessage = errorText.substring(0, 100);
        }
      } catch (e) {
        errorMessage = 'Yanıt okunamadı';
      }
      throw new Error(errorMessage);
    }
    
    // Content-Type kontrolü
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      throw new Error('Sunucudan JSON yanıt alınamadı');
    }
    
    const data = await response.json();
    
    if (data.success) {
      alert('Kullanıcı rolü başarıyla güncellendi.');
      closeEditItemModal();
      loadAdminData();
    } else {
      alert(`Rol güncellenirken bir hata oluştu: ${data.message || 'Bilinmeyen hata'}`);
    }
  } catch (error) {
    console.error('Update user role error:', error);
    alert(`Rol güncellenirken bir hata oluştu: ${error.message || 'Bağlantı hatası'}`);
  }
}

// Admin panelindeki Çıkış butonu
function setupAdminLogout() {
  // Sidebar'daki çıkış butonu
  const adminLogoutBtn = document.getElementById('admin-logout-btn') || document.querySelector('.sidebar .logout');
  // Header'daki çıkış butonu
  const adminLogoutBtnHeader = document.getElementById('admin-logout-btn-header');
  
  // Logout fonksiyonu
  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Tıklanan butonu bul ve devre dışı bırak
    const clickedBtn = e.target;
    clickedBtn.disabled = true;
    clickedBtn.textContent = 'Çıkış yapılıyor...';
    
    try {
      // localStorage'dan kullanıcı bilgisini al
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      // Eğer kullanıcı giriş yaptıysa backend'e çıkış isteği gönder
      if (userData.id) {
        try {
          const response = await fetch('http://localhost:3000/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userData.id }),
          });
          
          // Response'u kontrol et
          if (!response.ok) {
            console.warn('Logout response not OK:', response.status);
          }
        } catch (err) {
          console.error('Admin logout error:', err);
          // Hata olsa bile devam et
        }
      }

      // Tarayıcı tarafındaki oturum bilgisini temizle
      localStorage.removeItem('userData');
      localStorage.removeItem('lastSessionValidation');
      localStorage.removeItem('isInAdminPanel'); // Admin panel flag'ini temizle
      
      // Özel olayı tetikle (eğer başka yerler dinliyorsa)
      window.dispatchEvent(new Event('userLogout'));

      // Kısa bir gecikme sonrası yönlendir (UI feedback için)
      setTimeout(() => {
        // Kullanıcıyı ana siteye yönlendir (index.html)
        // Admin paneli public/admin.html'de, index.html root'ta
        window.location.href = '../index.html';
      }, 300);
    } catch (error) {
      console.error('Logout process error:', error);
      // Hata olsa bile localStorage'ı temizle ve yönlendir
      localStorage.removeItem('userData');
      localStorage.removeItem('lastSessionValidation');
      window.location.href = '../index.html';
    }
  };
  
  // Sidebar butonuna event listener ekle
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', handleLogout);
  }
  
  // Header butonuna event listener ekle
  if (adminLogoutBtnHeader) {
    adminLogoutBtnHeader.addEventListener('click', handleLogout);
  }
}


// Section değiştirme fonksiyonu
function switchSection(sectionName) {
  // Tüm panelleri gizle
  document.querySelectorAll('[data-section-panel]').forEach(panel => {
    panel.style.display = 'none';
  });
  
  // Seçilen section'ın tüm panellerini göster (overview için stats ve panel'ler)
  document.querySelectorAll(`[data-section-panel="${sectionName}"]`).forEach(panel => {
    panel.style.display = 'block';
  });
  
  // Menü linklerindeki active class'ını güncelle
  document.querySelectorAll('.menu a').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === sectionName) {
      link.classList.add('active');
    }
  });
}

// Ön izleme fonksiyonları
function previewCourse(courseId) {
  window.open(`course-detail.html?id=${courseId}`, '_blank');
}

function previewBlog(blogId) {
  window.open(`blog-detail.html?id=${blogId}`, '_blank');
}

// Düzenleme fonksiyonları
async function toggleFeatured(courseId, makeFeatured) {
  try {
    console.log('Toggle featured called:', { courseId, makeFeatured });
    
    const response = await fetch(`http://localhost:3000/api/courses/${courseId}/featured`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: makeFeatured })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText || 'Sunucu hatası' };
      }
      alert(errorData.message || `Sunucu hatası: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!data.success) {
      alert(data.message || 'İşlem başarısız oldu.');
      return;
    }
    
    // Kurs listesini yenile
    await loadAdminData();
    
    alert(data.message || (makeFeatured ? 'Kurs öne çıkan olarak işaretlendi.' : 'Kurs öne çıkan durumundan çıkarıldı.'));
  } catch (error) {
    console.error('Toggle featured error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    alert(`İşlem sırasında bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
  }
}

async function editCourse(courseId) {
  try {
    // Kurs bilgilerini getir
    const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
    const data = await response.json();
    
    if (!data.success || !data.course) {
      alert('Kurs bilgileri alınamadı.');
      return;
    }
    
    const course = data.course;
    
    // Modal aç
    openEditModal('course', courseId, {
      title: course.title || '',
      description: course.description || '',
      image_url: course.image_url || '',
      is_featured: course.is_featured === 1 || course.is_featured === true
    });
  } catch (error) {
    console.error('Edit course error:', error);
    alert('Kurs bilgileri alınırken bir hata oluştu.');
  }
}

async function editBlog(blogId) {
  try {
    // Blog bilgilerini getir
    const response = await fetch(`http://localhost:3000/api/blogs/${blogId}`);
    const data = await response.json();
    
    if (!data.success || !data.blog) {
      alert('Blog bilgileri alınamadı.');
      return;
    }
    
    const blog = data.blog;
    
    // Modal aç
    openEditModal('blog', blogId, {
      title: blog.title || '',
      description: blog.description || '',
      image_url: blog.image_url || ''
    });
  } catch (error) {
    console.error('Edit blog error:', error);
    alert('Blog bilgileri alınırken bir hata oluştu.');
  }
}

// Düzenleme modalı
function openEditModal(type, id, data) {
  const modal = document.getElementById('edit-modal');
  if (!modal) {
    // Modal yoksa oluştur
    createEditModal();
  }
  
  const modalTitle = document.getElementById('edit-modal-title');
  const editForm = document.getElementById('edit-form');
  const editTypeInput = document.getElementById('edit-type');
  const editIdInput = document.getElementById('edit-id');
  
  modalTitle.textContent = type === 'course' ? 'Kurs Düzenle' : 'Blog Düzenle';
  editTypeInput.value = type;
  editIdInput.value = id;
  
  // Form alanlarını doldur
  document.getElementById('edit-title').value = data.title;
  document.getElementById('edit-description').value = data.description || '';
  document.getElementById('edit-image-url').value = data.image_url || '';
  
  // Kurs için is_featured checkbox'ını göster/ayarla
  const featuredContainer = document.getElementById('edit-featured-container');
  if (featuredContainer) {
    if (type === 'course') {
      featuredContainer.style.display = 'block';
      const featuredCheckbox = document.getElementById('edit-is-featured');
      if (featuredCheckbox) {
        featuredCheckbox.checked = data.is_featured === true || data.is_featured === 1;
      }
    } else {
      featuredContainer.style.display = 'none';
    }
  }
  
  // Modal'ı göster
  document.getElementById('edit-modal').style.display = 'flex';
}

function createEditModal() {
  const modal = document.createElement('div');
  modal.id = 'edit-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="edit-modal-title">Düzenle</h2>
        <button class="modal-close" onclick="closeEditModal()">&times;</button>
      </div>
      <form id="edit-form" class="modal-form">
        <input type="hidden" id="edit-type" />
        <input type="hidden" id="edit-id" />
        <input type="text" id="edit-title" placeholder="Başlık" required />
        <textarea id="edit-description" placeholder="Açıklama" rows="4"></textarea>
        <input type="text" id="edit-image-url" placeholder="Görsel URL (opsiyonel)" />
        <label class="file-label">
          <span>Görsel Yükle</span>
          <input type="file" id="edit-image-file" accept="image/*" />
        </label>
        <div id="edit-featured-container" style="display: none;">
          <label class="checkbox-label">
            <input type="checkbox" id="edit-is-featured" />
            <span>Öne Çıkan Kurs Olarak İşaretle</span>
          </label>
        </div>
        <div class="modal-actions">
          <button type="button" class="ghost" onclick="closeEditModal()">İptal</button>
          <button type="submit" class="primary">Kaydet</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Form submit event
  document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveEdit();
  });
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

async function saveEdit() {
  const type = document.getElementById('edit-type').value;
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value;
  const description = document.getElementById('edit-description').value;
  let imageUrl = document.getElementById('edit-image-url').value;
  
  const fileInput = document.getElementById('edit-image-file');
  const file = fileInput.files[0];
  
  // Eğer dosya yüklendiyse
  if (file && file.size > 0) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadRes = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      }).then(r => r.json());
      if (uploadRes.success) {
        imageUrl = uploadRes.url;
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }
  
  const url = type === 'course' 
    ? `http://localhost:3000/api/courses/${id}`
    : `http://localhost:3000/api/blogs/${id}`;
  
  const bodyData = type === 'course' 
    ? { 
        title, 
        description, 
        image_url: imageUrl,
        is_featured: document.getElementById('edit-is-featured')?.checked || false
      }
    : { title, description, image_url: imageUrl };
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });
    
    const data = await response.json();
    if (data.success) {
      alert(`${type === 'course' ? 'Kurs' : 'Blog'} başarıyla güncellendi.`);
      closeEditModal();
      loadAdminData();
    } else {
      alert(`Güncelleme başarısız: ${data.message || 'Bilinmeyen hata'}`);
    }
  } catch (error) {
    console.error('Update error:', error);
    alert('Güncelleme sırasında bir hata oluştu.');
  }
}

// Siteye geri dön fonksiyonu
function goToSite() {
  window.location.href = '../index.html';
}

// ========== MODÜL YÖNETİMİ ==========

let currentCourseId = null;
let currentModuleId = null;

// Modül yönetim modalını aç
async function manageModules(courseId) {
  // CourseId kontrolü
  if (!courseId || courseId === 'undefined' || courseId === 'null') {
    console.error('Geçersiz courseId:', courseId);
    alert('Kurs ID bulunamadı. Lütfen sayfayı yenileyin.');
    return;
  }
  
  // String ise number'a çevir
  const courseIdNum = parseInt(courseId, 10);
  if (isNaN(courseIdNum)) {
    console.error('CourseId sayıya çevrilemedi:', courseId);
    alert('Geçersiz kurs ID formatı.');
    return;
  }
  
  currentCourseId = courseIdNum;
  
  console.log('manageModules çağrıldı, courseId:', courseIdNum, 'Type:', typeof courseIdNum);
  
  // Modal elementlerini kontrol et
  const modal = document.getElementById('module-management-modal');
  const content = document.getElementById('module-management-content');
  const title = document.getElementById('module-modal-title');
  
  if (!modal || !content || !title) {
    console.error('Modal elementleri bulunamadı:', { modal, content, title });
    alert('Modal elementleri bulunamadı. Sayfayı yenileyin.');
    return;
  }
  
  console.log('Modal elementleri bulundu');
  
  // Kurs bilgisini al
  try {
    console.log('Kurs bilgisi alınıyor, courseId:', courseIdNum);
    const courseRes = await fetch(`http://localhost:3000/api/courses/${courseIdNum}`);
    
    if (!courseRes.ok) {
      const errorText = await courseRes.text();
      console.error('Kurs bilgisi alınamadı:', courseRes.status, errorText);
      throw new Error(`HTTP error! status: ${courseRes.status}`);
    }
    
    const courseData = await courseRes.json();
    console.log('Kurs bilgisi alındı:', courseData);
    
    if (!courseData.success) {
      alert(`Kurs bilgileri alınamadı: ${courseData.message || 'Bilinmeyen hata'}`);
      return;
    }
    
    // Modülleri yükle
    console.log('Modüller yükleniyor, courseId:', courseIdNum);
    const modulesRes = await fetch(`http://localhost:3000/api/courses/${courseIdNum}/modules`);
    
    if (!modulesRes.ok) {
      const errorText = await modulesRes.text();
      console.error('Modüller yüklenemedi:', modulesRes.status, errorText);
      throw new Error(`HTTP error! status: ${modulesRes.status}`);
    }
    
    const modulesData = await modulesRes.json();
    console.log('Modüller yüklendi:', modulesData);
    const modules = modulesData.success ? modulesData.modules : [];
    
    title.textContent = `Modül Yönetimi - ${courseData.course.title}`;
    
    content.innerHTML = `
      <div style="margin-bottom: 24px; padding: 20px; background: var(--surface-2); border-radius: 16px; border: 1px solid var(--border); flex-shrink: 0;">
        <h3 style="margin: 0 0 16px; color: var(--accent); font-size: 18px; font-weight: 600;">Yeni Modül Ekle</h3>
        <form id="module-form" class="modal-form" style="gap: 16px; padding: 0;">
          <div>
            <label>Modül Başlığı</label>
            <input type="text" id="module-title" placeholder="Modül başlığını girin" required />
          </div>
          <div>
            <label>Modül Açıklaması</label>
            <textarea id="module-description" placeholder="Modül açıklamasını girin" rows="3"></textarea>
          </div>
          <div>
            <label>Süre (dakika)</label>
            <input type="number" id="module-time-limit" placeholder="0" min="0" value="0" />
          </div>
          <div style="margin-top: 8px;">
            <button type="submit" class="primary" style="width: 100%;">Modül Ekle</button>
          </div>
        </form>
      </div>
      
      <div style="display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden;">
        <h3 style="margin-bottom: 12px; color: var(--accent); font-size: 16px; font-weight: 600; flex-shrink: 0;">Modüller (${modules.length})</h3>
        <div id="modules-list" style="display: flex; flex-direction: column; gap: 8px; overflow-y: auto; overflow-x: hidden; padding-right: 4px; flex: 1; min-height: 0;">
          ${modules.length === 0 ? '<p style="color: var(--muted); padding: 20px; text-align: center;">Henüz modül eklenmemiş.</p>' : ''}
        </div>
      </div>
    `;
    
    // Modül form submit
    const moduleForm = document.getElementById('module-form');
    if (moduleForm) {
      // Önceki event listener'ı kaldır (eğer varsa)
      const newForm = moduleForm.cloneNode(true);
      moduleForm.parentNode.replaceChild(newForm, moduleForm);
      
      newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addModule();
      });
    }
    
    // Modülleri render et
    renderModulesList(modules);
    
    // Modal'ı göster
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Manage modules error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      courseId: courseId,
      name: error.name
    });
    
    // Daha açıklayıcı hata mesajı
    let errorMessage = 'Modül yönetimi açılırken bir hata oluştu.';
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun.';
    } else if (error.message.includes('404')) {
      errorMessage = 'Kurs bulunamadı. Lütfen kurs ID\'sini kontrol edin.';
    } else if (error.message.includes('500')) {
      errorMessage = 'Sunucu hatası oluştu. Lütfen backend loglarını kontrol edin.';
    } else {
      errorMessage = `Hata: ${error.message || 'Bilinmeyen hata'}`;
    }
    
    alert(errorMessage);
  }
}

// Modül listesini render et
function renderModulesList(modules) {
  const list = document.getElementById('modules-list');
  if (!list) return;
  
  list.innerHTML = modules.map(module => `
    <div class="module-item" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px;">
        <div style="flex: 1; min-width: 0;">
          <h4 style="margin: 0 0 6px; color: var(--text); font-size: 15px; font-weight: 600; line-height: 1.3;">${module.title || 'Başlıksız Modül'}</h4>
          <p style="margin: 0 0 8px; color: var(--muted); font-size: 13px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${module.description || 'Açıklama yok'}</p>
          <div style="display: flex; gap: 10px; font-size: 12px; color: var(--muted); flex-wrap: wrap;">
            ${module.time_limit > 0 ? `<span style="display: flex; align-items: center; gap: 4px;">⏱️ ${module.time_limit} dk</span>` : ''}
            <span style="display: flex; align-items: center; gap: 4px;">📚 ID: ${module.id}</span>
          </div>
        </div>
        <div style="display: flex; gap: 6px; flex-shrink: 0;">
          <button class="ghost small" onclick="manageQuestions(${module.id}, '${module.title.replace(/'/g, "\\'")}')">Sorular</button>
          <button class="ghost small" onclick="editModule(${module.id})">Düzenle</button>
          <button class="danger small" onclick="deleteModule(${module.id})">Sil</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Modül ekle
async function addModule() {
  const title = document.getElementById('module-title').value;
  const description = document.getElementById('module-description').value;
  const timeLimit = parseInt(document.getElementById('module-time-limit').value) || 0;
  
  try {
    const res = await fetch('http://localhost:3000/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: currentCourseId,
        title,
        description,
        time_limit: timeLimit
      })
    });
    
    const data = await res.json();
    if (data.success) {
      // Formu temizle
      document.getElementById('module-form').reset();
      
      // Modül listesini yeniden yükle ve render et
      await refreshModulesList();
      
      alert('Modül başarıyla eklendi.');
    } else {
      alert(`Hata: ${data.message || 'Modül eklenemedi'}`);
    }
  } catch (error) {
    console.error('Add module error:', error);
    alert('Modül eklenirken bir hata oluştu.');
  }
}

// Modül listesini yenile (modal içeriğini yeniden oluşturmadan)
async function refreshModulesList() {
  try {
    const modulesRes = await fetch(`http://localhost:3000/api/courses/${currentCourseId}/modules`);
    
    if (!modulesRes.ok) {
      console.error('Modüller yüklenemedi:', modulesRes.status);
      return;
    }
    
    const modulesData = await modulesRes.json();
    const modules = modulesData.success ? modulesData.modules : [];
    
    // Modül sayısını güncelle
    const modulesHeader = document.querySelector('#module-management-content h3');
    if (modulesHeader && modulesHeader.textContent.includes('Modüller')) {
      modulesHeader.textContent = `Modüller (${modules.length})`;
    }
    
    // Modül listesini render et
    renderModulesList(modules);
  } catch (error) {
    console.error('Refresh modules list error:', error);
  }
}

// Modül düzenle
async function editModule(moduleId) {
  try {
    const res = await fetch(`http://localhost:3000/api/modules/${moduleId}`);
    const data = await res.json();
    
    if (!data.success || !data.module) {
      alert('Modül bilgileri alınamadı.');
      return;
    }
    
    const module = data.module;
    
    // Düzenleme modalını aç
    const modal = document.getElementById('edit-item-modal');
    const content = document.getElementById('edit-item-content');
    const title = document.getElementById('edit-item-modal-title');
    
    title.textContent = 'Modül Düzenle';
    
    content.innerHTML = `
      <form id="edit-module-form" class="modal-form">
        <div>
          <label>Modül Başlığı</label>
          <input type="text" id="edit-module-title" value="${(module.title || '').replace(/"/g, '&quot;')}" placeholder="Modül başlığını girin" required />
        </div>
        <div>
          <label>Modül Açıklaması</label>
          <textarea id="edit-module-description" rows="4" placeholder="Modül açıklamasını girin">${(module.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        </div>
        <div>
          <label>Süre (dakika)</label>
          <input type="number" id="edit-module-time-limit" value="${module.time_limit || 0}" min="0" placeholder="0" />
        </div>
        <div class="modal-actions">
          <button type="button" class="ghost" onclick="closeEditItemModal()">İptal</button>
          <button type="submit" class="primary">Kaydet</button>
        </div>
      </form>
    `;
    
    // Form submit
    document.getElementById('edit-module-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await updateModule(moduleId);
    });
    
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Edit module error:', error);
    alert('Modül bilgileri alınırken bir hata oluştu.');
  }
}

// Modül güncelle
async function updateModule(moduleId) {
  const title = document.getElementById('edit-module-title').value;
  const description = document.getElementById('edit-module-description').value;
  const timeLimit = parseInt(document.getElementById('edit-module-time-limit').value) || 0;
  
  try {
    const updateRes = await fetch(`http://localhost:3000/api/modules/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        time_limit: timeLimit
      })
    });
    
    const updateData = await updateRes.json();
    if (updateData.success) {
      closeEditItemModal();
      await refreshModulesList(); // Listeyi yenile
      alert('Modül başarıyla güncellendi.');
    } else {
      alert(`Hata: ${updateData.message || 'Modül güncellenemedi'}`);
    }
  } catch (error) {
    console.error('Update module error:', error);
    alert('Modül güncellenirken bir hata oluştu.');
  }
}

// Modül sil
async function deleteModule(moduleId) {
  if (!confirm('Bu modülü silmek istediğinizden emin misiniz? Tüm sorular ve cevaplar da silinecektir.')) {
    return;
  }
  
  try {
    const res = await fetch(`http://localhost:3000/api/modules/${moduleId}`, {
      method: 'DELETE'
    });
    
    const data = await res.json();
    if (data.success) {
      await refreshModulesList(); // Listeyi yenile
      alert('Modül başarıyla silindi.');
    } else {
      alert(`Hata: ${data.message || 'Modül silinemedi'}`);
    }
  } catch (error) {
    console.error('Delete module error:', error);
    alert('Modül silinirken bir hata oluştu.');
  }
}

// Modül modalını kapat
function closeModuleModal() {
  document.getElementById('module-management-modal').style.display = 'none';
  currentCourseId = null;
}

// ========== SORU YÖNETİMİ ==========

let currentModuleTitle = null;

// Soru yönetim modalını aç
async function manageQuestions(moduleId, moduleTitle) {
  currentModuleId = moduleId;
  currentModuleTitle = moduleTitle;
  
  // Eğer moduleTitle parametresi yoksa, modül bilgisini al
  if (!moduleTitle) {
    try {
      const moduleRes = await fetch(`http://localhost:3000/api/modules/${moduleId}`);
      const moduleData = await moduleRes.json();
      if (moduleData.success && moduleData.module) {
        moduleTitle = moduleData.module.title;
        currentModuleTitle = moduleTitle;
      }
    } catch (error) {
      console.error('Get module title error:', error);
    }
  }
  
  try {
    // Modül detayını al (sorularla birlikte)
    const res = await fetch(`http://localhost:3000/api/modules/${moduleId}`);
    const data = await res.json();
    
    if (!data.success || !data.module) {
      alert('Modül bilgileri alınamadı.');
      return;
    }
    
    const module = data.module;
    const questions = module.questions || [];
    
    // Modal içeriğini oluştur
    const modal = document.getElementById('question-management-modal');
    const content = document.getElementById('question-management-content');
    const title = document.getElementById('question-modal-title');
    
    title.textContent = `Soru Yönetimi - ${moduleTitle}`;
    
    content.innerHTML = `
      <div style="margin-bottom: 24px; padding: 20px; background: var(--surface-2); border-radius: 16px; border: 1px solid var(--border);">
        <h3 style="margin: 0 0 16px; color: var(--accent); font-size: 18px; font-weight: 600;">Yeni Soru Ekle</h3>
        <form id="question-form" class="modal-form" style="gap: 16px; padding: 0;">
          <div>
            <label>Soru Metni</label>
            <textarea id="question-text" placeholder="Soru metnini girin" rows="4" required></textarea>
          </div>
          <div>
            <label>Soru Tipi</label>
            <select id="question-type">
              <option value="single">Tek Seçim</option>
              <option value="multiple">Çoklu Seçim</option>
              <option value="true_false">Doğru/Yanlış</option>
              <option value="write">Yazılı Cevap</option>
            </select>
          </div>
          <div style="margin-top: 8px;">
            <button type="submit" class="primary" style="width: 100%;">Soru Ekle</button>
          </div>
        </form>
      </div>
      
      <div>
        <h3 style="margin-bottom: 12px; color: var(--accent); font-size: 16px; font-weight: 600;">Sorular (${questions.length})</h3>
        <div id="questions-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 500px; overflow-y: auto; padding-right: 4px;">
          ${questions.length === 0 ? '<p style="color: var(--muted); padding: 20px; text-align: center;">Henüz soru eklenmemiş.</p>' : ''}
        </div>
      </div>
    `;
    
    // Soru form submit
    document.getElementById('question-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await addQuestion();
    });
    
    // Soruları render et
    renderQuestionsList(questions);
    
    // Modal'ı göster
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Manage questions error:', error);
    alert('Soru yönetimi açılırken bir hata oluştu.');
  }
}

// Soru listesini render et
function renderQuestionsList(questions) {
  const list = document.getElementById('questions-list');
  if (!list) return;
  
  list.innerHTML = questions.map((question, index) => `
    <div class="question-item" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px;">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; flex-wrap: wrap;">
            <span style="color: var(--accent); font-weight: 600; font-size: 13px;">Soru ${index + 1}</span>
            <span style="padding: 3px 6px; border-radius: 5px; background: rgba(0,255,136,0.1); color: var(--accent); font-size: 11px;">
              ${question.type === 'single' ? 'Tek Seçim' : question.type === 'multiple' ? 'Çoklu Seçim' : question.type === 'true_false' ? 'Doğru/Yanlış' : 'Yazılı'}
            </span>
          </div>
          <p style="margin: 0 0 8px; color: var(--text); font-size: 14px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${question.question_text}</p>
          <div id="answers-${question.id}" style="margin-top: 8px;">
            ${renderAnswers(question.answers || [], question.id)}
          </div>
        </div>
        <div style="display: flex; gap: 6px; flex-shrink: 0;">
          <button class="ghost small" onclick="manageAnswers(${question.id}, '${question.question_text.replace(/'/g, "\\'")}')">Cevaplar</button>
          <button class="ghost small" onclick="editQuestion(${question.id})">Düzenle</button>
          <button class="danger small" onclick="deleteQuestion(${question.id})">Sil</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Cevapları render et
function renderAnswers(answers, questionId) {
  if (answers.length === 0) {
    return '<p style="color: var(--muted); font-size: 13px;">Henüz cevap eklenmemiş.</p>';
  }
  
  return `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      ${answers.map((answer, idx) => `
        <div style="display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: rgba(255,255,255,0.02); border-radius: 6px;">
          <span style="color: ${answer.is_correct ? '#00ff88' : 'var(--muted)'}; font-size: 14px;">
            ${answer.is_correct ? '✓' : '○'}
          </span>
          <span style="color: var(--text); font-size: 13px; line-height: 1.3;">${answer.answer_text}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// Soru ekle
async function addQuestion() {
  const questionText = document.getElementById('question-text').value;
  const questionType = document.getElementById('question-type').value;
  
  try {
    const res = await fetch('http://localhost:3000/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: currentModuleId,
        question_text: questionText,
        type: questionType
      })
    });
    
    const data = await res.json();
    if (data.success) {
      document.getElementById('question-form').reset();
      await refreshQuestionsList(); // Soru listesini yenile
      alert('Soru başarıyla eklendi. Şimdi cevapları ekleyebilirsiniz.');
    } else {
      alert(`Hata: ${data.message || 'Soru eklenemedi'}`);
    }
  } catch (error) {
    console.error('Add question error:', error);
    alert('Soru eklenirken bir hata oluştu.');
  }
}

// Soru düzenle
async function editQuestion(questionId) {
  try {
    const res = await fetch(`http://localhost:3000/api/modules/${currentModuleId}`);
    const data = await res.json();
    
    if (!data.success || !data.module) {
      alert('Soru bilgileri alınamadı.');
      return;
    }
    
    const question = data.module.questions.find(q => q.id === questionId);
    if (!question) {
      alert('Soru bulunamadı.');
      return;
    }
    
    // Düzenleme modalını aç
    const modal = document.getElementById('edit-item-modal');
    const content = document.getElementById('edit-item-content');
    const title = document.getElementById('edit-item-modal-title');
    
    title.textContent = 'Soru Düzenle';
    
    const typeOptions = {
      'single': 'Tek Seçim',
      'multiple': 'Çoklu Seçim',
      'true_false': 'Doğru/Yanlış',
      'write': 'Yazılı Cevap'
    };
    
    content.innerHTML = `
      <form id="edit-question-form" class="modal-form">
        <div>
          <label>Soru Metni</label>
          <textarea id="edit-question-text" rows="5" placeholder="Soru metnini girin" required>${(question.question_text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        </div>
        <div>
          <label>Soru Tipi</label>
          <select id="edit-question-type">
            <option value="single" ${question.type === 'single' ? 'selected' : ''}>Tek Seçim</option>
            <option value="multiple" ${question.type === 'multiple' ? 'selected' : ''}>Çoklu Seçim</option>
            <option value="true_false" ${question.type === 'true_false' ? 'selected' : ''}>Doğru/Yanlış</option>
            <option value="write" ${question.type === 'write' ? 'selected' : ''}>Yazılı Cevap</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="ghost" onclick="closeEditItemModal()">İptal</button>
          <button type="submit" class="primary">Kaydet</button>
        </div>
      </form>
    `;
    
    // Form submit
    document.getElementById('edit-question-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await updateQuestion(questionId);
    });
    
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Edit question error:', error);
    alert('Soru bilgileri alınırken bir hata oluştu.');
  }
}

// Soru güncelle
async function updateQuestion(questionId) {
  const questionText = document.getElementById('edit-question-text').value;
  const questionType = document.getElementById('edit-question-type').value;
  
  try {
    const updateRes = await fetch(`http://localhost:3000/api/questions/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_text: questionText,
        type: questionType
      })
    });
    
    const updateData = await updateRes.json();
    if (updateData.success) {
      closeEditItemModal();
      await refreshQuestionsList(); // Soru listesini yenile
      alert('Soru başarıyla güncellendi.');
    } else {
      alert(`Hata: ${updateData.message || 'Soru güncellenemedi'}`);
    }
  } catch (error) {
    console.error('Update question error:', error);
    alert('Soru güncellenirken bir hata oluştu.');
  }
}

// Soru sil
async function deleteQuestion(questionId) {
  if (!confirm('Bu soruyu silmek istediğinizden emin misiniz? Tüm cevaplar da silinecektir.')) {
    return;
  }
  
  try {
    const res = await fetch(`http://localhost:3000/api/questions/${questionId}`, {
      method: 'DELETE'
    });
    
    const data = await res.json();
    if (data.success) {
      await refreshQuestionsList(); // Soru listesini yenile
      alert('Soru başarıyla silindi.');
    } else {
      alert(`Hata: ${data.message || 'Soru silinemedi'}`);
    }
  } catch (error) {
    console.error('Delete question error:', error);
    alert('Soru silinirken bir hata oluştu.');
  }
}

// Soru listesini yenile
async function refreshQuestionsList() {
  try {
    const res = await fetch(`http://localhost:3000/api/modules/${currentModuleId}`);
    const data = await res.json();
    
    if (!data.success || !data.module) {
      console.error('Soru listesi yüklenemedi');
      return;
    }
    
    const questions = data.module.questions || [];
    
    // Soru sayısını güncelle
    const questionsHeader = document.querySelector('#question-management-content h3');
    if (questionsHeader && questionsHeader.textContent.includes('Sorular')) {
      questionsHeader.textContent = `Sorular (${questions.length})`;
    }
    
    // Soru listesini render et
    renderQuestionsList(questions);
  } catch (error) {
    console.error('Refresh questions list error:', error);
  }
}

// Cevap listesini yenile
async function refreshAnswersList(questionId) {
  if (!questionId) questionId = currentQuestionId;
  if (!questionId) return;
  
  try {
    const res = await fetch(`http://localhost:3000/api/questions/${questionId}/answers`);
    const data = await res.json();
    
    if (!data.success) {
      console.error('Cevap listesi yüklenemedi');
      return;
    }
    
    const answers = data.answers || [];
    
    // Cevap sayısını güncelle
    const answersHeader = document.querySelector('#question-management-content h3');
    if (answersHeader && answersHeader.textContent.includes('Cevaplar')) {
      answersHeader.textContent = `Cevaplar (${answers.length})`;
    }
    
    // Cevap listesini render et
    renderAnswersList(answers, questionId);
  } catch (error) {
    console.error('Refresh answers list error:', error);
  }
}

// Soru modalını kapat
function closeQuestionModal() {
  document.getElementById('question-management-modal').style.display = 'none';
  currentModuleId = null;
}

// Düzenleme modalını kapat
function closeEditItemModal() {
  document.getElementById('edit-item-modal').style.display = 'none';
}

// ========== CEVAP YÖNETİMİ ==========

let currentQuestionId = null;

// Cevap yönetim modalını aç
async function manageAnswers(questionId, questionText) {
  currentQuestionId = questionId;
  try {
    // Cevapları getir
    const res = await fetch(`http://localhost:3000/api/questions/${questionId}/answers`);
    const data = await res.json();
    
    const answers = data.success ? data.answers : [];
    
    // Modal içeriğini oluştur
    const modal = document.getElementById('question-management-modal');
    const content = document.getElementById('question-management-content');
    const title = document.getElementById('question-modal-title');
    
    title.textContent = `Cevap Yönetimi - ${questionText.substring(0, 50)}${questionText.length > 50 ? '...' : ''}`;
    
    content.innerHTML = `
      <div style="margin-bottom: 20px; padding: 16px; background: var(--surface-2); border-radius: 12px; border: 1px solid var(--border); flex-shrink: 0;">
        <h4 style="margin: 0 0 8px; color: var(--text);">Soru:</h4>
        <p style="margin: 0; color: var(--muted);">${questionText}</p>
      </div>
      
      <div style="margin-bottom: 24px; padding: 20px; background: var(--surface-2); border-radius: 16px; border: 1px solid var(--border); flex-shrink: 0;">
        <h3 style="margin: 0 0 16px; color: var(--accent); font-size: 18px; font-weight: 600;">Yeni Cevap Ekle</h3>
        <form id="answer-form" class="modal-form" style="gap: 16px; padding: 0;">
          <div>
            <label>Cevap Metni</label>
            <input type="text" id="answer-text" placeholder="Cevap metnini girin" required />
          </div>
          <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--surface); border-radius: 12px; border: 1px solid var(--border);">
            <input type="checkbox" id="answer-is-correct" />
            <label for="answer-is-correct" style="margin: 0; cursor: pointer; color: var(--text); font-weight: 500;">Doğru Cevap</label>
          </div>
          <div style="margin-top: 8px;">
            <button type="submit" class="primary" style="width: 100%;">Cevap Ekle</button>
          </div>
        </form>
      </div>
      
      <div style="display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden;">
        <h3 style="margin-bottom: 12px; color: var(--accent); font-size: 16px; font-weight: 600; flex-shrink: 0;">Cevaplar (${answers.length})</h3>
        <div id="answers-list" style="display: flex; flex-direction: column; gap: 8px; overflow-y: auto; overflow-x: hidden; padding-right: 4px; flex: 1; min-height: 0;">
          ${answers.length === 0 ? '<p style="color: var(--muted); padding: 20px; text-align: center;">Henüz cevap eklenmemiş.</p>' : ''}
        </div>
      </div>
      
      <div style="margin-top: 20px; flex-shrink: 0;">
        <button class="ghost" onclick="manageQuestions(${currentModuleId}, '${currentModuleTitle ? currentModuleTitle.replace(/'/g, "\\'") : ''}')">Sorulara Dön</button>
      </div>
    `;
    
    // Cevap form submit
    document.getElementById('answer-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await addAnswer(questionId);
    });
    
    // Cevapları render et
    renderAnswersList(answers, questionId);
    
    // Modal'ı göster
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Manage answers error:', error);
    alert('Cevap yönetimi açılırken bir hata oluştu.');
  }
}

// Cevap listesini render et
function renderAnswersList(answers, questionId) {
  const list = document.getElementById('answers-list');
  if (!list) return;
  
  list.innerHTML = answers.map(answer => `
    <div class="answer-item" style="background: var(--surface-2); border: 1px solid ${answer.is_correct ? 'rgba(0,255,136,0.4)' : 'var(--border)'}; border-radius: 10px; padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
          <span style="color: ${answer.is_correct ? '#00ff88' : 'var(--muted)'}; font-size: 16px; flex-shrink: 0;">
            ${answer.is_correct ? '✓' : '○'}
          </span>
          <span style="color: var(--text); font-size: 14px; line-height: 1.3;">${answer.answer_text}</span>
          ${answer.is_correct ? '<span style="padding: 3px 6px; border-radius: 5px; background: rgba(0,255,136,0.1); color: #00ff88; font-size: 11px; flex-shrink: 0;">Doğru</span>' : ''}
        </div>
        <div style="display: flex; gap: 6px; flex-shrink: 0;">
          <button class="ghost small" onclick="editAnswer(${answer.id}, ${questionId})">Düzenle</button>
          <button class="danger small" onclick="deleteAnswer(${answer.id}, ${questionId})">Sil</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Cevap ekle
async function addAnswer(questionId) {
  if (!questionId) questionId = currentQuestionId;
  const answerText = document.getElementById('answer-text').value;
  const isCorrect = document.getElementById('answer-is-correct').checked;
  
  try {
    const res = await fetch('http://localhost:3000/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_id: questionId,
        answer_text: answerText,
        is_correct: isCorrect
      })
    });
    
    const data = await res.json();
    if (data.success) {
      document.getElementById('answer-form').reset();
      await refreshAnswersList(questionId); // Cevap listesini yenile
      alert('Cevap başarıyla eklendi.');
    } else {
      alert(`Hata: ${data.message || 'Cevap eklenemedi'}`);
    }
  } catch (error) {
    console.error('Add answer error:', error);
    alert('Cevap eklenirken bir hata oluştu.');
  }
}

// Cevap düzenle
async function editAnswer(answerId, questionId) {
  try {
    const res = await fetch(`http://localhost:3000/api/questions/${questionId}/answers`);
    const data = await res.json();
    
    if (!data.success) {
      alert('Cevap bilgileri alınamadı.');
      return;
    }
    
    const answer = data.answers.find(a => a.id === answerId);
    if (!answer) {
      alert('Cevap bulunamadı.');
      return;
    }
    
    // Düzenleme modalını aç
    const modal = document.getElementById('edit-item-modal');
    const content = document.getElementById('edit-item-content');
    const title = document.getElementById('edit-item-modal-title');
    
    title.textContent = 'Cevap Düzenle';
    
    content.innerHTML = `
      <form id="edit-answer-form" class="modal-form">
        <div>
          <label>Cevap Metni</label>
          <input type="text" id="edit-answer-text" value="${(answer.answer_text || '').replace(/"/g, '&quot;')}" placeholder="Cevap metnini girin" required />
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--surface-2); border-radius: 12px; border: 1px solid var(--border);">
          <input type="checkbox" id="edit-answer-is-correct" ${answer.is_correct ? 'checked' : ''} />
          <label for="edit-answer-is-correct" style="margin: 0; cursor: pointer; color: var(--text); font-weight: 500;">Doğru Cevap</label>
        </div>
        <div class="modal-actions">
          <button type="button" class="ghost" onclick="closeEditItemModal()">İptal</button>
          <button type="submit" class="primary">Kaydet</button>
        </div>
      </form>
    `;
    
    // Form submit
    document.getElementById('edit-answer-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await updateAnswer(answerId, questionId);
    });
    
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Edit answer error:', error);
    alert('Cevap bilgileri alınırken bir hata oluştu.');
  }
}

// Cevap güncelle
async function updateAnswer(answerId, questionId) {
  if (!questionId) questionId = currentQuestionId;
  const answerText = document.getElementById('edit-answer-text').value;
  const isCorrect = document.getElementById('edit-answer-is-correct').checked;
  
  try {
    const updateRes = await fetch(`http://localhost:3000/api/answers/${answerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer_text: answerText,
        is_correct: isCorrect
      })
    });
    
    const updateData = await updateRes.json();
    if (updateData.success) {
      closeEditItemModal();
      await refreshAnswersList(questionId); // Cevap listesini yenile
      alert('Cevap başarıyla güncellendi.');
    } else {
      alert(`Hata: ${updateData.message || 'Cevap güncellenemedi'}`);
    }
  } catch (error) {
    console.error('Update answer error:', error);
    alert('Cevap güncellenirken bir hata oluştu.');
  }
}

// Cevap sil
async function deleteAnswer(answerId, questionId) {
  if (!confirm('Bu cevabı silmek istediğinizden emin misiniz?')) {
    return;
  }
  
  if (!questionId) questionId = currentQuestionId;
  
  try {
    const res = await fetch(`http://localhost:3000/api/answers/${answerId}`, {
      method: 'DELETE'
    });
    
    const data = await res.json();
    if (data.success) {
      await refreshAnswersList(questionId); // Cevap listesini yenile
      alert('Cevap başarıyla silindi.');
    } else {
      alert(`Hata: ${data.message || 'Cevap silinemedi'}`);
    }
  } catch (error) {
    console.error('Delete answer error:', error);
    alert('Cevap silinirken bir hata oluştu.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Admin panelinde olduğumuzu işaretle
  localStorage.setItem('isInAdminPanel', 'true');
  
  attachActions();
  setupAdminLogout();
  loadAdminData();
  
  // Menü linklerine tıklama olayı ekle
  document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      switchSection(section);
    });
  });
  
  // İlk yüklemede overview'ı göster
  switchSection('overview');
  
  // Modal dışına tıklandığında kapat
  document.addEventListener('click', (e) => {
    const moduleModal = document.getElementById('module-management-modal');
    const questionModal = document.getElementById('question-management-modal');
    const editModal = document.getElementById('edit-item-modal');
    
    if (e.target === moduleModal) {
      closeModuleModal();
    }
    if (e.target === questionModal) {
      closeQuestionModal();
    }
    if (e.target === editModal) {
      closeEditItemModal();
    }
  });
});

