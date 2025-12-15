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

function renderCourses(courses) {
  const body = document.getElementById('courses-table-body');
  if (!body) return;
  body.innerHTML = '';
  courses.forEach((c) => {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <span>${c.title || '-'}</span>
      <span>${(c.category || '').toString() || '-'}</span>
      <span class="pill">${c.image_url ? 'Var' : 'Yok'}</span>
      <span>${formatDate(c.created_at)}</span>
      <span class="table-actions">
        <button class="ghost small">Düzenle</button>
        <button class="danger small" data-type="course" data-id="${c.id}">Sil</button>
      </span>
    `;
    body.appendChild(row);
  });
}

function renderBlogs(blogs) {
  const body = document.getElementById('blogs-table-body');
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
      <span class="table-actions">
        <button class="ghost small">Düzenle</button>
        <button class="danger small" data-type="blog" data-id="${b.id}">Sil</button>
      </span>
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
    row.innerHTML = `
      <span>${u.uname || '-'}</span>
      <span>${u.unickname || '-'}</span>
      <span>${u.umail || '-'}</span>
      <span class="pill">${u.uis_active ? 'Aktif' : 'Pasif'}</span>
      <span>${formatDate(u.ucreated_at)}</span>
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
    const [summaryRes, coursesRes, blogsRes, usersRes] = await Promise.all([
      fetchJSON('http://localhost:3000/api/admin/summary'),
      fetchJSON('http://localhost:3000/api/courses'),
      fetchJSON('http://localhost:3000/api/blogs'),
      fetchJSON('http://localhost:3000/api/users'),
    ]);

    if (summaryRes.success) renderStats(summaryRes);
    if (coursesRes.success && coursesRes.courses) renderCourses(coursesRes.courses);
    if (blogsRes.success && blogsRes.blogs) renderBlogs(blogsRes.blogs);
    if (usersRes.success && usersRes.users) renderUsers(usersRes.users);
  } catch (err) {
    console.error('Admin data load error:', err);
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
  const url = type === 'course'
    ? `http://localhost:3000/api/courses/${id}`
    : `http://localhost:3000/api/blogs/${id}`;
  await fetch(url, { method: 'DELETE' });
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

document.addEventListener('DOMContentLoaded', () => {
  attachActions();
  loadAdminData();
});

