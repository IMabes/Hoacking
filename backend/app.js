const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const connection = require('./connection');

const app = express();

// Arakatman
app.use(cors());
app.use(express.json());
// Uploads klasörünü statik servis et
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Test endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Backend çalışıyor!', status: 'ok' });
});

app.post('/register', (req, res) => {
    const { uname, usurname, unickname, umail, upasswd } = req.body;

    // Tüm alanların doldurulması gerekiyor
    if (!uname || !usurname || !unickname || !umail || !upasswd) {
        return res.status(400).json({ message: "Tüm alanlar doldurulmalıdır!" });
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(umail)) {
        return res.status(400).json({ message: "Geçerli bir e-posta adresi giriniz!" });
    }

    // Şifre uzunluğu kontrolü
    if (upasswd.length < 6) {
        return res.status(400).json({ message: "Şifre en az 6 karakter olmalıdır!" });
    }

    // Kullanıcı adının varlığı kontrolü
    const checkNicknameSql = `SELECT ID FROM users WHERE unickname = ?`;
    connection.query(checkNicknameSql, [unickname], (err, results) => {
        if (err) {
            console.error("DB Error (check nickname):", err);
            return res.status(500).json({ message: "Veritabanı hatası!" });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: "Bu kullanıcı adı zaten kullanılıyor!" });
        }

        // E-posta adresinin varlığı kontrolü
        const checkEmailSql = `SELECT ID FROM users WHERE umail = ?`;
        connection.query(checkEmailSql, [umail], (err, results) => {
            if (err) {
                console.error("DB Error (check email):", err);
                return res.status(500).json({ message: "Veritabanı hatası!" });
            }

            if (results.length > 0) {
                return res.status(409).json({ message: "Bu e-posta adresi zaten kayıtlı!" });
            }

            // Şifre hashleme (bcrypt kullanılması daha iyi, ancak şimdilik basit hash kullanıyoruz)
            // Üretim için, bcrypt yükleyin: npm install bcrypt
            const crypto = require('crypto');
            const hashedPassword = crypto.createHash('sha256').update(upasswd).digest('hex');

            // Yeni kullanıcı ekleme
            const insertSql = `
                INSERT INTO users (uname, usurname, unickname, umail, upasswd)
                VALUES (?, ?, ?, ?, ?)
            `;

            const values = [uname, usurname, unickname, umail, hashedPassword];

            connection.query(insertSql, values, (err, result) => {
                if (err) {
                    console.error("DB Error (insert):", err);
                    // Tekrarlı anahtar hatası kontrolü
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ message: "Bu kullanıcı adı veya e-posta zaten kayıtlı!" });
                    }
                    return res.status(500).json({ message: "Kayıt sırasında bir hata oluştu!" });
                }

                // Kullanıcı verilerini localStorage için döndür
                return res.json({
                    message: "Kullanıcı başarıyla kaydedildi!",
                    userId: result.insertId,
                    user: {
                        id: result.insertId,
                        nickname: unickname,
                        email: umail,
                        name: uname,
                        surname: usurname
                    }
                });
            });
        });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Giriş verilerinin kontrolü
    if (!username || !password) {
        return res.status(400).json({ message: "Kullanıcı adı ve şifre gereklidir!" });
    }

    // Kullanıcı adı veya e-posta adresine göre kullanıcı bulma
    const sql = `SELECT ID, uname, usurname, unickname, umail, upasswd FROM users WHERE unickname = ? OR umail = ?`;
    
    connection.query(sql, [username, username], (err, results) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Veritabanı hatası!" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı!" });
        }

        const user = results[0];
        const crypto = require('crypto');
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Şifreleri karşılaştır - hem hashlenmiş hem de düz metin desteği (geriye dönük uyumluluk için)
        if (user.upasswd === hashedPassword || user.upasswd === password) {
            // uis_active'ı 1 ve ulast_login zaman damgasını güncelle
            const updateSql = `UPDATE users SET uis_active = 1, ulast_login = NOW() WHERE ID = ?`;
            connection.query(updateSql, [user.ID], (updateErr) => {
                if (updateErr) {
                    console.error("DB Error (update active status):", updateErr);
                    // Güncelleme başarısız olsa bile hala başarılı olarak döndür
                }
            });

            return res.json({
                success: true,
                message: "Giriş başarılı!",
                user: {
                    id: user.ID,
                    nickname: user.unickname,
                    email: user.umail,
                    name: user.uname,
                    surname: user.usurname
                }
            });
        } else {
            return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı!" });
        }
    });
});

// Logout endpoint
app.post('/logout', (req, res) => {
    const { userId } = req.body;

    // Giriş verilerinin kontrolü
    if (!userId) {
        return res.status(400).json({ message: "Kullanıcı ID gereklidir!" });
    }

    // uis_active'ı 0'a çek
    const updateSql = `UPDATE users SET uis_active = 0 WHERE ID = ?`;
    connection.query(updateSql, [userId], (err, result) => {
        if (err) {
            console.error("DB Error (logout):", err);
            return res.status(500).json({ message: "Çıkış sırasında bir hata oluştu!" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
        }

        return res.json({
            success: true,
            message: "Çıkış başarılı!"
        });
    });
});

// Admin summary endpoint - counts
app.get('/api/admin/summary', async (req, res) => {
    const queries = {
        totalUsers: 'SELECT COUNT(*) as cnt FROM users',
        activeUsers: 'SELECT COUNT(*) as cnt FROM users WHERE uis_active = 1',
        courses: 'SELECT COUNT(*) as cnt FROM courses',
        blogs: 'SELECT COUNT(*) as cnt FROM blogs',
    };

    const runQuery = (sql) =>
        new Promise((resolve, reject) => {
            connection.query(sql, (err, results) => {
                if (err) return reject(err);
                resolve(results[0]?.cnt || 0);
            });
        });

    try {
        const [totalUsers, activeUsers, courses, blogs] = await Promise.all([
            runQuery(queries.totalUsers),
            runQuery(queries.activeUsers),
            runQuery(queries.courses),
            runQuery(queries.blogs),
        ]);

        return res.json({
            success: true,
            totalUsers,
            activeUsers,
            courses,
            blogs,
        });
    } catch (err) {
        console.error("DB Error (admin summary):", err);
        return res.status(500).json({ success: false, message: "Admin özet verileri alınamadı." });
    }
});

// Upload endpoint
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
    }
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Dosya bulunamadı' });
    const url = `http://localhost:3000/uploads/${req.file.filename}`;
    return res.json({ success: true, url });
});

// Courses endpoint - Tüm kursları getir
app.get('/api/courses', (req, res) => {
    const sql = `SELECT id, title, description, image_url, created_at FROM courses ORDER BY created_at DESC`;
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("DB Error (courses):", err);
            return res.status(500).json({ message: "Kurslar yüklenirken bir hata oluştu!" });
        }

        return res.json({
            success: true,
            courses: results
        });
    });
});

// Course create
app.post('/api/courses', (req, res) => {
    const { title, description, image_url } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Başlık gerekli" });
    const sql = `INSERT INTO courses (title, description, image_url) VALUES (?, ?, ?)`;
    connection.query(sql, [title, description || null, image_url || null], (err, result) => {
        if (err) {
            console.error("DB Error (course insert):", err);
            return res.status(500).json({ success: false, message: "Kurs eklenemedi" });
        }
        return res.json({ success: true, id: result.insertId });
    });
});

// Course delete
app.delete('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM courses WHERE id = ?`;
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB Error (course delete):", err);
            return res.status(500).json({ success: false, message: "Kurs silinemedi" });
        }
        return res.json({ success: true, affected: result.affectedRows });
    });
});

// Blogs endpoint - Tüm blog yazılarını getir
app.get('/api/blogs', (req, res) => {
    // Veritabanındaki sütun isimlerine göre: id, title, description, image_url, created_at
    const sql = `SELECT id, title, description, image_url, created_at FROM blogs ORDER BY created_at DESC`;
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("DB Error (blogs):", err);
            return res.status(500).json({ message: "Blog yazıları yüklenirken bir hata oluştu!" });
        }

        return res.json({
            success: true,
            blogs: results
        });
    });
});

// Blog create
app.post('/api/blogs', (req, res) => {
    const { title, description, image_url } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Başlık gerekli" });
    const sql = `INSERT INTO blogs (title, description, image_url) VALUES (?, ?, ?)`;
    connection.query(sql, [title, description || null, image_url || null], (err, result) => {
        if (err) {
            console.error("DB Error (blog insert):", err);
            return res.status(500).json({ success: false, message: "Blog eklenemedi" });
        }
        return res.json({ success: true, id: result.insertId });
    });
});

// Blog delete
app.delete('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM blogs WHERE id = ?`;
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB Error (blog delete):", err);
            return res.status(500).json({ success: false, message: "Blog silinemedi" });
        }
        return res.json({ success: true, affected: result.affectedRows });
    });
});

// Users list
app.get('/api/users', (req, res) => {
    const sql = `SELECT ID as id, uname, usurname, unickname, umail, uis_active, ucreated_at FROM users ORDER BY ucreated_at DESC`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("DB Error (users):", err);
            return res.status(500).json({ success: false, message: "Kullanıcılar alınamadı" });
        }
        return res.json({ success: true, users: results });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log("===================================");
    console.log(`Server çalışıyor: http://localhost:${PORT}`);
    console.log(`API Endpoint: http://localhost:${PORT}/api/courses`);
    console.log("===================================");
});
