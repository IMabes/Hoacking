const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const connection = require('./connection');
const emailService = require('./email-service');

const app = express();

// Production modu kontrolü
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Güvenlik middleware'leri
 */
// Helmet.js - Güvenlik header'ları
app.use(helmet({
    contentSecurityPolicy: false, // Frontend'de inline script'ler için
    crossOriginEmbedderPolicy: false
}));

// CORS yapılandırması - Sadece belirli origin'lere izin ver
const allowedOrigins = isProduction 
    ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'];

app.use(cors({
    origin: function (origin, callback) {
        // Origin yoksa (mobile app, Postman gibi) veya izin verilen listede ise
        if (!origin || allowedOrigins.includes(origin) || !isProduction) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy: Bu origin\'e izin verilmiyor'));
        }
    },
    credentials: true
}));

// JSON body parser - Boyut limiti
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Rate Limiting - API isteklerini sınırla
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // Her IP için maksimum 100 istek
    message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // Auth endpoint'leri için daha sıkı limit
    message: 'Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.',
    skipSuccessfulRequests: true
});

app.use('/api/', apiLimiter);
app.use('/login', authLimiter);
app.use('/register', authLimiter);
app.use('/api/auth/', authLimiter);
// Uploads klasörünü statik servis et
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

/**
 * Health check endpoint
 * Backend'in çalışıp çalışmadığını kontrol eder
 */
app.get('/', (req, res) => {
    res.json({ 
        message: 'Backend çalışıyor', 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// E-posta ve kullanıcı adı kontrolü endpoint'i
app.post('/api/auth/check-availability', (req, res) => {
    const { email, nickname } = req.body;
    
    if (!email || !nickname) {
        return res.status(400).json({ success: false, message: "E-posta ve kullanıcı adı gereklidir!" });
    }
    
    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Geçerli bir e-posta adresi giriniz!" });
    }
    
    // E-posta adresinin zaten kayıtlı olup olmadığını kontrol et
    const checkEmailSql = `SELECT ID FROM users WHERE umail = ?`;
    connection.query(checkEmailSql, [email], (err, emailResults) => {
        if (err) {
            console.error("DB Error (check email):", err);
            return res.status(500).json({ success: false, message: "Veritabanı hatası!" });
        }
        
        if (emailResults.length > 0) {
            return res.status(409).json({ success: false, message: "Bu e-posta adresi zaten kayıtlı!" });
        }
        
        // Kullanıcı adının zaten kayıtlı olup olmadığını kontrol et
        const checkNicknameSql = `SELECT ID FROM users WHERE unickname = ?`;
        connection.query(checkNicknameSql, [nickname], (err, nicknameResults) => {
            if (err) {
                if (!isProduction) {
                console.error("[DB] Kullanıcı adı kontrol hatası:", err.message);
            }
                return res.status(500).json({ success: false, message: "Veritabanı hatası!" });
            }
            
            if (nicknameResults.length > 0) {
                return res.status(409).json({ success: false, message: "Bu kullanıcı adı zaten kullanılıyor!" });
            }
            
            return res.json({ success: true, message: "E-posta ve kullanıcı adı kullanılabilir." });
        });
    });
});

// E-posta doğrulama kodu gönderme endpoint'i
app.post('/api/auth/send-verification-code', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, message: "E-posta adresi gereklidir!" });
    }
    
    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Geçerli bir e-posta adresi giriniz!" });
    }
    
    // E-posta adresinin zaten kayıtlı olup olmadığını kontrol et
    const checkEmailSql = `SELECT ID FROM users WHERE umail = ?`;
    connection.query(checkEmailSql, [email], async (err, results) => {
        if (err) {
            console.error("DB Error (check email):", err);
            return res.status(500).json({ success: false, message: "Veritabanı hatası!" });
        }
        
        if (results.length > 0) {
            return res.status(409).json({ success: false, message: "Bu e-posta adresi zaten kayıtlı!" });
        }
        
        // Doğrulama kodu gönder
        const result = await emailService.sendVerificationCode(email);
        
        if (result.success) {
            const response = { success: true, message: result.message };
            // Geliştirme modunda kod varsa frontend'e de gönder
            if (result.devMode && result.code) {
                response.devMode = true;
                response.code = result.code;
            }
            return res.json(response);
        } else {
            return res.status(500).json({ success: false, message: result.message });
        }
    });
});

// E-posta doğrulama kodu doğrulama endpoint'i
app.post('/api/auth/verify-code', (req, res) => {
    const { email, code } = req.body;
    
    if (!email || !code) {
        return res.status(400).json({ success: false, message: "E-posta ve doğrulama kodu gereklidir!" });
    }
    
    const result = emailService.verifyCode(email, code);
    
    if (result.success) {
        return res.json({ success: true, message: result.message });
    } else {
        return res.status(400).json({ success: false, message: result.message });
    }
});

// Şifre sıfırlama - E-posta kontrolü ve kod gönderme
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, message: "E-posta adresi gereklidir!" });
    }
    
    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Geçerli bir e-posta adresi giriniz!" });
    }
    
    // E-posta adresinin veritabanında kayıtlı olup olmadığını kontrol et
    const checkEmailSql = `SELECT ID, umail FROM users WHERE umail = ?`;
    connection.query(checkEmailSql, [email], async (err, results) => {
        if (err) {
            console.error("DB Error (check email):", err);
            return res.status(500).json({ success: false, message: "Veritabanı hatası!" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Bu e-posta adresi bir hesaba ait değildir." });
        }
        
        // E-posta kayıtlı, şifre sıfırlama kodu gönder
        const result = await emailService.sendPasswordResetCode(email);
        
        if (result.success) {
            const response = { success: true, message: result.message };
            // Geliştirme modunda kod varsa frontend'e de gönder
            if (result.devMode && result.code) {
                response.devMode = true;
                response.code = result.code;
            }
            return res.json(response);
        } else {
            return res.status(500).json({ success: false, message: result.message });
        }
    });
});

// Şifre sıfırlama - Kod doğrulama ve şifre güncelleme
app.post('/api/auth/reset-password', (req, res) => {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
        return res.status(400).json({ success: false, message: "E-posta, kod ve yeni şifre gereklidir!" });
    }
    
    // Şifre uzunluğu kontrolü
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Şifre en az 6 karakter olmalıdır!" });
    }
    
    // Şifre sıfırlama kodunu doğrula
    const verifyResult = emailService.verifyPasswordResetCode(email, code);
    
    if (!verifyResult.success) {
        return res.status(400).json({ success: false, message: verifyResult.message });
    }
    
    // Kod doğrulandı, şifreyi güncelle
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
    
    const updateSql = `UPDATE users SET upasswd = ? WHERE umail = ?`;
    connection.query(updateSql, [hashedPassword, email], (err, result) => {
        if (err) {
            console.error("DB Error (update password):", err);
            return res.status(500).json({ success: false, message: "Şifre güncellenirken bir hata oluştu!" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı!" });
        }
        
        // Şifre sıfırlama kodunu temizle
        emailService.clearPasswordResetCode(email);
        
        if (!isProduction) {
            console.log('[Auth] Şifre sıfırlama başarılı');
        }
        return res.json({ success: true, message: "Şifreniz başarıyla sıfırlandı!" });
    });
});

// Kayıt endpoint'i (e-posta doğrulandıktan sonra)
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

    // E-posta doğrulanmış mı kontrol et
    if (!emailService.isEmailVerified(umail)) {
        return res.status(400).json({ message: "E-posta adresi doğrulanmamış. Lütfen önce e-posta doğrulaması yapın." });
    }

    // Kullanıcı adının varlığı kontrolü
    const checkNicknameSql = `SELECT ID FROM users WHERE unickname = ?`;
    connection.query(checkNicknameSql, [unickname], (err, results) => {
        if (err) {
            if (!isProduction) {
                console.error("[DB] Kullanıcı adı kontrol hatası:", err.message);
            }
            return res.status(500).json({ message: "Veritabanı hatası!" });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: "Bu kullanıcı adı zaten kullanılıyor!" });
        }

        // E-posta adresinin varlığı kontrolü (tekrar kontrol - güvenlik için)
        const checkEmailSql = `SELECT ID FROM users WHERE umail = ?`;
        connection.query(checkEmailSql, [umail], (err, results) => {
            if (err) {
                if (!isProduction) {
                    console.error("[DB] E-posta kontrol hatası:", err.message);
                }
                return res.status(500).json({ message: "Veritabanı hatası!" });
            }

            if (results.length > 0) {
                return res.status(409).json({ message: "Bu e-posta adresi zaten kayıtlı!" });
            }

            // Şifre hashleme
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

                // Doğrulama kodunu temizle (artık gerekli değil)
                emailService.clearVerification(umail);

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
    const sql = `SELECT ID, uname, usurname, unickname, umail, upasswd, urole FROM users WHERE unickname = ? OR umail = ?`;

    
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
            //Giriş response 
            return res.json({
                success: true,
                message: "Giriş başarılı!",
                user: {
                    id: user.ID,
                    nickname: user.unickname,
                    email: user.umail,
                    name: user.uname,
                    surname: user.usurname,
                    role: user.urole
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

// Admin özet endpoint - counts
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
    const featured = req.query.featured;
    const excludeFeatured = req.query.exclude_featured === 'true';
    let sql = `SELECT id, title, description, image_url, is_featured, created_at FROM courses`;
    
    if (featured === 'true') {
        // Sadece öne çıkan kursları getir
        sql += ` WHERE is_featured = 1`;
    } else if (excludeFeatured) {
        // Öne çıkan olmayan kursları getir (frontend için)
        sql += ` WHERE is_featured = 0 OR is_featured IS NULL`;
    }
    // Eğer hiçbir parametre yoksa, tüm kursları getir (admin panel için)
    
    sql += ` ORDER BY is_featured DESC, created_at DESC`;
    
    connection.query(sql, (err, results) => {
        if (err) {
            if (!isProduction) {
                console.error("[DB] Kurslar listesi hatası:", err.message);
            }
            return res.status(500).json({ success: false, message: "Kurslar yüklenirken bir hata oluştu!" });
        }

        // is_featured değerlerini boolean'a çevir (MySQL'den 0/1 olarak geliyor)
        const courses = results.map(course => ({
            ...course,
            is_featured: course.is_featured === 1 || course.is_featured === true
        }));

        return res.json({
            success: true,
            courses: courses
        });
    });
});

// Öne çıkan kursu getir
app.get('/api/courses/featured', (req, res) => {
    const sql = `SELECT id, title, description, image_url, is_featured, created_at FROM courses WHERE is_featured = 1 LIMIT 1`;
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("DB Error (featured course):", err);
            return res.status(500).json({ success: false, message: "Öne çıkan kurs yüklenemedi" });
        }

        return res.json({
            success: true,
            course: results.length > 0 ? results[0] : null
        });
    });
});

// Kurs ekleme endpoint
app.post('/api/courses', (req, res) => {
    const { title, description, image_url, is_featured } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Başlık gerekli" });
    const sql = `INSERT INTO courses (title, description, image_url, is_featured) VALUES (?, ?, ?, ?)`;
    connection.query(sql, [title, description || null, image_url || null, is_featured ? 1 : 0], (err, result) => {
        if (err) {
            console.error("DB Error (course insert):", err);
            return res.status(500).json({ success: false, message: "Kurs eklenemedi" });
        }
        return res.json({ success: true, id: result.insertId });
    });
});

// Kursu öne çıkan yap/kaldır (daha spesifik route, önce tanımlanmalı)
app.put('/api/courses/:id/featured', (req, res) => {
    const { id } = req.params;
    const { is_featured } = req.body;
    
    // Debug log kaldırıldı
    
    // Eğer bu kurs öne çıkan yapılıyorsa, önce diğer öne çıkan kursları kaldır, sonra bu kursu öne çıkan yap
    if (is_featured) {
        const clearFeaturedSql = `UPDATE courses SET is_featured = 0 WHERE is_featured = 1 AND id != ?`;
        connection.query(clearFeaturedSql, [id], (err) => {
            if (err) {
                console.error("DB Error (clear featured):", err);
                console.error("Error details:", err.code, err.sqlMessage);
                return res.status(500).json({ 
                    success: false, 
                    message: `Öne çıkan kurslar temizlenirken hata: ${err.sqlMessage || err.message}` 
                });
            }
            
            // Diğer öne çıkan kursları temizledikten sonra, bu kursu öne çıkan yap
            const sql = `UPDATE courses SET is_featured = 1 WHERE id = ?`;
            connection.query(sql, [id], (err, result) => {
                if (err) {
                    console.error("DB Error (set featured):", err);
                    console.error("Error code:", err.code);
                    console.error("Error message:", err.sqlMessage);
                    
                    if (err.code === 'ER_BAD_FIELD_ERROR' || err.sqlMessage && err.sqlMessage.includes('is_featured')) {
                        return res.status(500).json({ 
                            success: false, 
                            message: "Veritabanında 'is_featured' kolonu bulunamadı. Lütfen add_featured_column.sql dosyasını çalıştırın." 
                        });
                    }
                    
                    return res.status(500).json({ 
                        success: false, 
                        message: `Öne çıkan durumu güncellenemedi: ${err.sqlMessage || err.message}` 
                    });
                }
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: "Kurs bulunamadı." });
                }
                
                if (!isProduction) {
                    console.log('[Admin] Öne çıkan kurs güncellendi');
                }
                return res.json({ success: true, message: "Kurs öne çıkan olarak işaretlendi." });
            });
        });
    } else {
        // Öne çıkan durumundan çıkar
        const sql = `UPDATE courses SET is_featured = 0 WHERE id = ?`;
        connection.query(sql, [id], (err, result) => {
            if (err) {
                console.error("DB Error (remove featured):", err);
                console.error("Error code:", err.code);
                console.error("Error message:", err.sqlMessage);
                
                if (err.code === 'ER_BAD_FIELD_ERROR' || err.sqlMessage && err.sqlMessage.includes('is_featured')) {
                    return res.status(500).json({ 
                        success: false, 
                        message: "Veritabanında 'is_featured' kolonu bulunamadı. Lütfen add_featured_column.sql dosyasını çalıştırın." 
                    });
                }
                
                return res.status(500).json({ 
                    success: false, 
                    message: `Öne çıkan durumu güncellenemedi: ${err.sqlMessage || err.message}` 
                });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Kurs bulunamadı." });
            }
            
            if (!isProduction) {
                console.log('[Admin] Öne çıkan durumu kaldırıldı');
            }
            return res.json({ success: true, message: "Kurs öne çıkan durumundan çıkarıldı." });
        });
    }
});

//Kurs düzenleme endpoint (daha genel route, daha spesifik route'lardan sonra)
app.put('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, image_url, is_featured } = req.body;

    // Başlık zorunlu ise kontrol ediyoruz
    if (!title) {
        return res.status(400).json({ success: false, message: "Başlık gereklidir." });
    }

    const sql = `UPDATE courses SET title = ?, description = ?, image_url = ?, is_featured = ? WHERE id = ?`;
    
    connection.query(sql, [title, description || null, image_url || null, is_featured ? 1 : 0, id], (err, result) => {
        if (err) {
            console.error("DB Error (course update):", err);
            return res.status(500).json({ success: false, message: "Kurs güncellenemedi." });
        }

        // Eğer etkilenen satır yoksa, bu ID ile bir kurs bulunamamış demektir
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Güncellenecek kurs bulunamadı." });
        }

        return res.json({ success: true, message: "Kurs başarıyla güncellendi." });
    });
});

// Kurs silme endpoint
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
    const sql = `SELECT id, title, description, image_url, created_at FROM blogs ORDER BY created_at DESC`;
    
    connection.query(sql, (err, results) => {
        if (err) {
            if (!isProduction) {
                console.error("[DB] Blog yazıları listesi hatası:", err.message);
            }
            return res.status(500).json({ success: false, message: "Blog yazıları yüklenirken bir hata oluştu!" });
        }

        return res.json({
            success: true,
            blogs: results
        });
    });
});

// Blog ekleme endpoint
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

// Blog düzenleme endpoint
app.put('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, image_url } = req.body;

    // Başlık zorunlu ise kontrol ediyoruz
    if (!title) {
        return res.status(400).json({ success: false, message: "Başlık gereklidir." });
    }

    const sql = `UPDATE blogs SET title = ?, description = ?, image_url = ? WHERE id = ?`;
    
    connection.query(sql, [title, description || null, image_url || null, id], (err, result) => {
        if (err) {
            console.error("DB Error (blog update):", err);
            return res.status(500).json({ success: false, message: "Blog güncellenemedi." });
        }

        // Eğer etkilenen satır yoksa, bu ID ile bir blog bulunamamış demektir
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Güncellenecek blog bulunamadı." });
        }

        return res.json({ success: true, message: "Blog başarıyla güncellendi." });
    });
});

// Blog silme endpoint
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

/**
 * Session validation endpoint - Kullanıcı oturumunun geçerliliğini kontrol eder
 * Not: uis_active kontrolü kaldırıldı - kullanıcı logout yapmadığı sürece session geçerli sayılır
 */
app.post('/api/auth/validate', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.json({ success: false, valid: false, message: "Kullanıcı ID gereklidir" });
    }

    // Kullanıcının var olup olmadığını kontrol et (uis_active kontrolü yok)
    // Kullanıcı logout yapmadığı sürece session geçerli sayılır
    const sql = `SELECT ID, uname, usurname, unickname, umail, urole FROM users WHERE ID = ?`;
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            if (!isProduction) {
                console.error("[DB] Session validation hatası:", err.message);
            }
            return res.json({ success: false, valid: false, message: "Oturum doğrulanamadı" });
        }

        if (results.length === 0) {
            return res.json({ success: true, valid: false, message: "Kullanıcı bulunamadı" });
        }

        const user = results[0];
        return res.json({
            success: true,
            valid: true,
            user: {
                id: user.ID,
                nickname: user.unickname,
                email: user.umail,
                name: user.uname,
                surname: user.usurname,
                role: user.urole
            }
        });
    });
});

// Get quiz by ID with questions and answers
// IMPORTANT: This route must come BEFORE /api/courses/:courseId/quizzes to avoid route conflicts
app.get('/api/quizzes/:id', (req, res) => {
    const { id } = req.params;
    // Debug log kaldırıldı
    const quizId = parseInt(id, 10);
    
    if (isNaN(quizId)) {
        console.error('Invalid quiz ID:', id);
        return res.status(400).json({ success: false, message: "Geçersiz quiz ID'si" });
    }
    
    // Debug log kaldırıldı
    // Get quiz info
    const quizSql = `SELECT id, course_id, title, description, time_limit, created_at FROM quizzes WHERE id = ?`;
    
    connection.query(quizSql, [quizId], (err, quizResults) => {
        if (err) {
            console.error("DB Error (get quiz):", err);
            return res.status(500).json({ success: false, message: "Quiz yüklenemedi" });
        }
        
        // Debug log kaldırıldı
        
        if (quizResults.length === 0) {
            // Debug log kaldırıldı
            return res.status(404).json({ success: false, message: "Quiz bulunamadı" });
        }
        
        const quiz = quizResults[0];
        
        // Get questions for this quiz
        const questionSql = `SELECT id, question_text, type, created_at FROM quiz_questions WHERE quiz_id = ? ORDER BY created_at ASC`;
        connection.query(questionSql, [quizId], (err, questionResults) => {
            if (err) {
                console.error("DB Error (get questions):", err);
                return res.status(500).json({ success: false, message: "Sorular yüklenemedi" });
            }
            
            if (questionResults.length === 0) {
                return res.json({
                    success: true,
                    quiz: {
                        ...quiz,
                        questions: []
                    }
                });
            }
            
            const questionIds = questionResults.map(q => q.id);
            const placeholders = questionIds.map(() => '?').join(',');
            
            // Get answers for these questions
            const answerSql = `SELECT id, question_id, answer_text, is_correct FROM quiz_answers WHERE question_id IN (${placeholders}) ORDER BY question_id, id ASC`;
            connection.query(answerSql, questionIds, (err, answerResults) => {
                if (err) {
                    console.error("DB Error (get answers):", err);
                    return res.status(500).json({ success: false, message: "Cevaplar yüklenemedi" });
                }
                
                // Organize answers by question
                const answersByQuestion = {};
                answerResults.forEach(answer => {
                    if (!answersByQuestion[answer.question_id]) {
                        answersByQuestion[answer.question_id] = [];
                    }
                    answersByQuestion[answer.question_id].push({
                        id: answer.id,
                        answer_text: answer.answer_text,
                        is_correct: answer.is_correct === 1
                    });
                });
                
                // Combine questions with answers
                const questions = questionResults.map(question => ({
                    id: question.id,
                    question_text: question.question_text,
                    type: question.type,
                    answers: answersByQuestion[question.id] || []
                }));
                
                return res.json({
                    success: true,
                    quiz: {
                        id: quiz.id,
                        course_id: quiz.course_id,
                        title: quiz.title,
                        description: quiz.description,
                        time_limit: quiz.time_limit,
                        created_at: quiz.created_at,
                        questions: questions
                    }
                });
            });
        });
    });
});

// Get quizzes for a specific course
// Activity ping endpoint - for activity tracker
app.post('/api/activity/ping', (req, res) => {
    // Simple endpoint to track user activity
    // Can be extended later to log activity in database
    return res.json({ success: true, message: "Activity ping received" });
});

// Debug endpoint to check user quiz results
app.get('/api/debug/user/:userId/quiz-results', (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Geçersiz kullanıcı ID" });
    }
    
    const sql = `SELECT * FROM user_quiz_results WHERE user_id = ? ORDER BY completed_at DESC`;
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ success: false, message: "Veri alınamadı" });
        }
        return res.json({ success: true, results: results });
    });
});

app.get('/api/courses/:courseId/quizzes', (req, res) => {
    const { courseId } = req.params;
    const userId = req.query.userId ? parseInt(req.query.userId, 10) : null;

    // Get the course by ID
    const courseSql = `SELECT id, title FROM courses WHERE id = ?`;
    connection.query(courseSql, [courseId], (err, courseResults) => {
        if (err) {
            console.error("DB Error (get course):", err);
            return res.status(500).json({ success: false, message: "Kurs bulunamadı" });
        }

        if (courseResults.length === 0) {
            return res.status(404).json({ success: false, message: "Kurs bulunamadı" });
        }

        const course = courseResults[0];
        const actualCourseId = course.id;

        // Get all quizzes for this course
        const quizSql = `SELECT id, title, description, time_limit, created_at FROM quizzes WHERE course_id = ? ORDER BY created_at ASC`;
        connection.query(quizSql, [actualCourseId], (err, quizResults) => {
            if (err) {
                console.error("DB Error (get quizzes):", err);
                return res.status(500).json({ success: false, message: "Testler yüklenemedi" });
            }

            // For each quiz, get questions and answers
            if (quizResults.length === 0) {
                return res.json({ success: true, quizzes: [] });
            }

            const quizIds = quizResults.map(q => q.id);
            const placeholders = quizIds.map(() => '?').join(',');

            // Get all questions for these quizzes
            const questionSql = `SELECT id, quiz_id, question_text, type, created_at FROM quiz_questions WHERE quiz_id IN (${placeholders}) ORDER BY quiz_id, created_at ASC`;
            connection.query(questionSql, quizIds, (err, questionResults) => {
                if (err) {
                    console.error("DB Error (get questions):", err);
                    return res.status(500).json({ success: false, message: "Sorular yüklenemedi" });
                }

                // Get all answers for these questions
                if (questionResults.length === 0) {
                    // No questions, return quizzes without questions
                    return res.json({
                        success: true,
                        quizzes: quizResults.map(quiz => ({
                            ...quiz,
                            questions: []
                        }))
                    });
                }

                const questionIds = questionResults.map(q => q.id);
                const answerPlaceholders = questionIds.map(() => '?').join(',');

                const answerSql = `SELECT id, question_id, answer_text, is_correct FROM quiz_answers WHERE question_id IN (${answerPlaceholders}) ORDER BY question_id, id ASC`;
                connection.query(answerSql, questionIds, (err, answerResults) => {
                    if (err) {
                        console.error("DB Error (get answers):", err);
                        return res.status(500).json({ success: false, message: "Cevaplar yüklenemedi" });
                    }

                    // Organize data: group answers by question, questions by quiz
                    const answersByQuestion = {};
                    answerResults.forEach(answer => {
                        if (!answersByQuestion[answer.question_id]) {
                            answersByQuestion[answer.question_id] = [];
                        }
                        answersByQuestion[answer.question_id].push({
                            id: answer.id,
                            answer_text: answer.answer_text,
                            is_correct: answer.is_correct === 1
                        });
                    });

                    const questionsByQuiz = {};
                    questionResults.forEach(question => {
                        if (!questionsByQuiz[question.quiz_id]) {
                            questionsByQuiz[question.quiz_id] = [];
                        }
                        questionsByQuiz[question.quiz_id].push({
                            id: question.id,
                            question_text: question.question_text,
                            type: question.type,
                            answers: answersByQuestion[question.id] || []
                        });
                    });

                    // Get user quiz results if userId is provided
                    const getUserResults = (callback) => {
                        if (!userId || isNaN(userId)) {
                            console.log('No userId provided, skipping user results');
                            return callback({});
                        }
                        
                        if (quizIds.length === 0) {
                            // Debug log kaldırıldı
                            return callback({});
                        }
                        
                        // Güvenli placeholder oluştur (SQL injection önleme)
                        // quizIds array'inden gelen değerler zaten integer olarak doğrulanmış
                        const quizPlaceholders = quizIds.map(() => '?').join(',');
                        const userResultsSql = `SELECT quiz_id, score, completed_at FROM user_quiz_results WHERE user_id = ? AND quiz_id IN (${quizPlaceholders})`;
                        
                        if (!isProduction) {
                            console.log('[Debug] Kullanıcı quiz sonuçları sorgulanıyor');
                        }
                        
                        connection.query(userResultsSql, [userId, ...quizIds], (err, userResults) => {
                            if (err) {
                                console.error("DB Error (get user results):", err);
                                return callback({});
                            }
                            
                            console.log('Raw user results from DB:', userResults);
                            console.log('Number of results:', userResults.length);
                            
                            const resultsByQuiz = {};
                            userResults.forEach(result => {
                                console.log(`Processing result: quiz_id=${result.quiz_id}, score=${result.score}`);
                                resultsByQuiz[result.quiz_id] = {
                                    score: result.score,
                                    completed_at: result.completed_at
                                };
                            });
                            
                            console.log('Results by quiz ID (final):', resultsByQuiz);
                            console.log('Result keys:', Object.keys(resultsByQuiz));
                            callback(resultsByQuiz);
                        });
                    };

                    getUserResults((userResultsByQuiz) => {
                        // Debug logları sadece development modunda
                        if (!isProduction && Object.keys(userResultsByQuiz).length > 0) {
                            console.log('[Debug] Kullanıcı quiz sonuçları bulundu');
                        }
                        
                        // Combine everything with user progress
                        const quizzes = quizResults.map(quiz => {
                            const userResult = userResultsByQuiz[quiz.id] || null;
                            const totalQuestions = (questionsByQuiz[quiz.id] || []).length;
                            const progress = userResult ? 100 : 0; // If completed, 100%
                            
                            console.log(`Quiz ${quiz.id} (${quiz.title}):`, {
                                hasUserResult: !!userResult,
                                userResult: userResult,
                                progress: progress,
                                totalQuestions: totalQuestions
                            });
                            
                            const quizData = {
                                id: quiz.id,
                                title: quiz.title,
                                description: quiz.description,
                                time_limit: quiz.time_limit,
                                created_at: quiz.created_at,
                                questions: questionsByQuiz[quiz.id] || [],
                                user_result: userResult,
                                progress: progress,
                                total_questions: totalQuestions
                            };
                            
                            console.log(`Final quiz data for ${quiz.id}:`, JSON.stringify(quizData, null, 2));
                            return quizData;
                        });

                        return res.json({ success: true, quizzes });
                    });
                });
            });
        });
    });
});

// Get blog by ID
app.get('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT id, title, description, image_url, created_at FROM blogs WHERE id = ?`;
    
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error("DB Error (get blog):", err);
            return res.status(500).json({ success: false, message: "Blog yazısı yüklenemedi" });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Blog yazısı bulunamadı" });
        }

        return res.json({ success: true, blog: results[0] });
    });
});

// Get course by ID
app.get('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const userId = req.query.userId ? parseInt(req.query.userId, 10) : null;
    // ID'yi integer'a çevir ve doğrula
    const courseId = parseInt(id, 10);
    
    if (isNaN(courseId) || courseId <= 0) {
        return res.status(400).json({ success: false, message: "Geçersiz kurs ID'si" });
    }
    
    const sql = `SELECT id, title, description, image_url, is_featured, created_at FROM courses WHERE id = ?`;
    
    connection.query(sql, [courseId], (err, results) => {
        if (err) {
            console.error("[DB] Kurs yükleme hatası:", err);
            return res.status(500).json({ success: false, message: "Kurs yüklenemedi" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Kurs bulunamadı" });
        }

        // Kullanıcı ID'si varsa, kurs erişimini kaydet
        if (userId && !isNaN(userId) && userId > 0) {
            trackCourseAccess(userId, courseId);
        }

        return res.json({ success: true, course: results[0] });
    });
});

// Track course access - Kullanıcı kursa eriştiğinde çağrılır
function trackCourseAccess(userId, courseId) {
    // Kullanıcının bu kursa kaydı var mı kontrol et
    const checkSql = `SELECT id, status, started_at FROM user_courses WHERE user_id = ? AND course_id = ?`;
    
    connection.query(checkSql, [userId, courseId], (err, results) => {
        if (err) {
            console.error("DB Error (check user course):", err);
            return;
        }
        
        if (results.length === 0) {
            // Yeni kayıt oluştur
            const insertSql = `INSERT INTO user_courses (user_id, course_id, status, enrolled_at, last_accessed_at) 
                              VALUES (?, ?, 'enrolled', NOW(), NOW())`;
            connection.query(insertSql, [userId, courseId], (err) => {
                if (err) {
                    console.error("DB Error (insert user course):", err);
                } else {
                    console.log(`User ${userId} enrolled in course ${courseId}`);
                }
            });
        } else {
            // Mevcut kaydı güncelle - last_accessed_at'i güncelle
            const updateSql = `UPDATE user_courses SET last_accessed_at = NOW() WHERE user_id = ? AND course_id = ?`;
            connection.query(updateSql, [userId, courseId], (err) => {
                if (err) {
                    console.error("DB Error (update user course access):", err);
                }
            });
        }
    });
}

// Track quiz start - Kullanıcı quiz'e başladığında çağrılır
function trackQuizStart(userId, quizId) {
    // Quiz'in hangi kursa ait olduğunu bul
    const quizSql = `SELECT course_id FROM quizzes WHERE id = ?`;
    
    connection.query(quizSql, [quizId], (err, quizResults) => {
        if (err || quizResults.length === 0) {
            console.error("DB Error (get quiz course):", err);
            return;
        }
        
        const courseId = quizResults[0].course_id;
        
        // Kullanıcının bu kursa kaydı var mı kontrol et
        const checkSql = `SELECT id, status, started_at FROM user_courses WHERE user_id = ? AND course_id = ?`;
        
        connection.query(checkSql, [userId, courseId], (err, results) => {
            if (err) {
                console.error("DB Error (check user course):", err);
                return;
            }
            
            if (results.length === 0) {
                // Yeni kayıt oluştur ve başlat
                const insertSql = `INSERT INTO user_courses (user_id, course_id, status, enrolled_at, started_at, last_accessed_at) 
                                  VALUES (?, ?, 'in_progress', NOW(), NOW(), NOW())`;
                connection.query(insertSql, [userId, courseId], (err) => {
                    if (err) {
                        console.error("DB Error (insert user course):", err);
                    } else {
                        // Debug log kaldırıldı
                    }
                });
            } else {
                const userCourse = results[0];
                // Eğer daha önce başlatılmamışsa, started_at'i güncelle ve status'u in_progress yap
                if (!userCourse.started_at) {
                    const updateSql = `UPDATE user_courses SET status = 'in_progress', started_at = NOW(), last_accessed_at = NOW() 
                                      WHERE user_id = ? AND course_id = ?`;
                    connection.query(updateSql, [userId, courseId], (err) => {
                        if (err) {
                            console.error("DB Error (update user course start):", err);
                        } else {
                            // Debug log kaldırıldı
                        }
                    });
                } else {
                    // Sadece last_accessed_at'i güncelle
                    const updateSql = `UPDATE user_courses SET last_accessed_at = NOW() WHERE user_id = ? AND course_id = ?`;
                    connection.query(updateSql, [userId, courseId], (err) => {
                        if (err) {
                            console.error("DB Error (update user course access):", err);
                        }
                    });
                }
            }
        });
    });
}

// Get user by ID
app.get('/api/user/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Geçersiz kullanıcı ID'si" });
    }
    
    const sql = `SELECT ID as id, uname, usurname, unickname, umail, urole, uis_active, ucreated_at FROM users WHERE ID = ?`;
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("DB Error (get user):", err);
            return res.status(500).json({ success: false, message: "Kullanıcı bilgileri alınamadı" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
        }
        
        const user = results[0];
        return res.json({
            success: true,
            user: {
                id: user.id,
                nickname: user.unickname,
                email: user.umail,
                name: user.uname,
                surname: user.usurname,
                role: user.urole,
                is_active: user.uis_active,
                created_at: user.ucreated_at
            }
        });
    });
});

// Get user progress statistics
app.get('/api/user/:id/progress', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Geçersiz kullanıcı ID'si" });
    }
    
    // Sadece kullanıcının başladığı kursları getir (user_courses tablosundan)
    const coursesProgressSql = `
        SELECT 
            c.id,
            c.title,
            c.description,
            c.image_url,
            uc.status,
            uc.progress_percentage,
            COUNT(DISTINCT q.id) as total_quizzes,
            COUNT(DISTINCT uqr.quiz_id) as completed_quizzes,
            COALESCE(SUM(CASE WHEN uqr.quiz_id IS NOT NULL THEN q.time_limit ELSE 0 END), 0) as minutes_learned
        FROM user_courses uc
        JOIN courses c ON c.id = uc.course_id
        LEFT JOIN quizzes q ON q.course_id = c.id
        LEFT JOIN user_quiz_results uqr ON uqr.quiz_id = q.id AND uqr.user_id = ?
        WHERE uc.user_id = ?
        GROUP BY c.id, c.title, c.description, c.image_url, uc.status, uc.progress_percentage
        ORDER BY uc.last_accessed_at DESC
    `;
    
    connection.query(coursesProgressSql, [userId, userId], (err, coursesResults) => {
        if (err) {
            console.error("DB Error (courses progress):", err);
            return res.status(500).json({ success: false, message: "Kurs ilerleme verileri alınamadı" });
        }
        
        // Kullanıcının başladığı tüm kursların toplam quiz sayısını hesapla
        let totalQuizzes = 0;
        let completedQuizzes = 0;
        let coursesCompleted = 0;
        let coursesInProgress = 0;
        let totalHours = 0;
        
        coursesResults.forEach(course => {
            totalQuizzes += course.total_quizzes || 0;
            completedQuizzes += course.completed_quizzes || 0;
            totalHours += Math.round((course.minutes_learned || 0) / 60);
            
            if (course.total_quizzes > 0) {
                // Sadece status = 'completed' olanları say
                if (course.status === 'completed' || (course.completed_quizzes === course.total_quizzes && course.total_quizzes > 0)) {
                    coursesCompleted++;
                } else if (course.completed_quizzes > 0 || course.status === 'in_progress') {
                    coursesInProgress++;
                }
            }
        });
        
        // Total progress: Kullanıcının başladığı kurslardaki quiz'lerin tamamlanma yüzdesi
        const totalProgress = totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;
        
        return res.json({
            success: true,
            progress: {
                totalProgress,
                coursesCompleted,
                coursesInProgress,
                totalHours,
                totalQuizzes,
                completedQuizzes
            },
            courses: coursesResults.map(course => {
                // Calculate progress: use progress_percentage from DB if available, otherwise calculate from quizzes
                let progress = 0;
                if (course.progress_percentage !== null && course.progress_percentage !== undefined) {
                    progress = course.progress_percentage;
                } else if (course.total_quizzes > 0) {
                    progress = Math.round((course.completed_quizzes / course.total_quizzes) * 100);
                }
                
                // Determine status based on quiz completion - Veritabanından gelen status'u quiz tamamlama durumuna göre kontrol et
                let status = course.status || 'enrolled';
                if (course.total_quizzes > 0) {
                    // Eğer tüm quiz'ler tamamlandıysa, status'u 'completed' yap
                    if (course.completed_quizzes === course.total_quizzes && course.total_quizzes > 0) {
                        status = 'completed';
                        // Veritabanında da güncelle (async, hata kontrolü yapmadan)
                        if (course.status !== 'completed') {
                            const updateStatusSql = `
                                UPDATE user_courses 
                                SET status = 'completed',
                                    progress_percentage = ?,
                                    completed_at = CASE WHEN completed_at IS NULL THEN NOW() ELSE completed_at END,
                                    updated_at = NOW()
                                WHERE user_id = ? AND course_id = ?
                            `;
                            connection.query(updateStatusSql, [progress, userId, course.id], (err) => {
                                if (err) {
                                    console.error("DB Error (update course status to completed):", err);
                                } else {
                                    // Debug log kaldırıldı
                                }
                            });
                        }
                    } else if (course.completed_quizzes > 0 || progress > 0) {
                        // Eğer en az bir quiz tamamlandıysa, status'u 'in_progress' yap
                        if (course.status === 'enrolled' || course.status === 'paused') {
                            status = 'in_progress';
                            // Veritabanında da güncelle
                            const updateStatusSql = `
                                UPDATE user_courses 
                                SET status = 'in_progress',
                                    progress_percentage = ?,
                                    started_at = CASE WHEN started_at IS NULL THEN NOW() ELSE started_at END,
                                    updated_at = NOW()
                                WHERE user_id = ? AND course_id = ?
                            `;
                            connection.query(updateStatusSql, [progress, userId, course.id], (err) => {
                                if (err) {
                                    console.error("DB Error (update course status to in_progress):", err);
                                } else {
                                    // Debug log kaldırıldı
                                }
                            });
                        } else if (course.status === 'in_progress') {
                            // Zaten in_progress ise, sadece progress_percentage'i güncelle
                            if (course.progress_percentage !== progress) {
                                const updateProgressSql = `
                                    UPDATE user_courses 
                                    SET progress_percentage = ?,
                                        updated_at = NOW()
                                    WHERE user_id = ? AND course_id = ?
                                `;
                                connection.query(updateProgressSql, [progress, userId, course.id], (err) => {
                                    if (err) {
                                        console.error("DB Error (update course progress):", err);
                                    }
                                });
                            }
                        }
                    }
                }
                
                return {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    image_url: course.image_url,
                    total_quizzes: course.total_quizzes,
                    completed_quizzes: course.completed_quizzes,
                    progress: progress,
                    hours_learned: Math.round((course.minutes_learned || 0) / 60),
                    status: status
                };
            })
        });
    });
});

// Save quiz result
app.post('/api/quizzes/:quizId/results', (req, res) => {
    const { quizId } = req.params;
    const { userId, score, correctCount, incorrectCount, answers } = req.body;
    
    if (!userId || score === undefined) {
        return res.status(400).json({ success: false, message: "Eksik veri" });
    }
    
    const quizIdInt = parseInt(quizId, 10);
    const userIdInt = parseInt(userId, 10);
    
    if (isNaN(quizIdInt) || isNaN(userIdInt)) {
        return res.status(400).json({ success: false, message: "Geçersiz ID" });
    }
    
    // Check if result already exists
    const checkSql = `SELECT id FROM user_quiz_results WHERE user_id = ? AND quiz_id = ?`;
    connection.query(checkSql, [userIdInt, quizIdInt], (err, existingResults) => {
        if (err) {
            console.error("DB Error (check result):", err);
            return res.status(500).json({ success: false, message: "Sonuç kontrol edilemedi" });
        }
        
        const resultSql = existingResults.length > 0
            ? `UPDATE user_quiz_results SET score = ?, correct_count = ?, incorrect_count = ?, completed_at = NOW() WHERE user_id = ? AND quiz_id = ?`
            : `INSERT INTO user_quiz_results (user_id, quiz_id, score, correct_count, incorrect_count, completed_at) VALUES (?, ?, ?, ?, ?, NOW())`;
        
        const resultParams = existingResults.length > 0
            ? [score, correctCount, incorrectCount, userIdInt, quizIdInt]
            : [userIdInt, quizIdInt, score, correctCount, incorrectCount];
        
        connection.query(resultSql, resultParams, (err, result) => {
            if (err) {
                console.error("DB Error (save result):", err);
                return res.status(500).json({ success: false, message: "Sonuç kaydedilemedi" });
            }
            
            const resultId = existingResults.length > 0 ? existingResults[0].id : result.insertId;
            
            // Save user answers if provided
            if (answers && Array.isArray(answers) && answers.length > 0) {
                // Delete old answers for this quiz
                const deleteAnswersSql = `DELETE FROM user_quiz_answers WHERE user_id = ? AND question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = ?)`;
                connection.query(deleteAnswersSql, [userIdInt, quizIdInt], (err) => {
                    if (err) {
                        console.error("DB Error (delete old answers):", err);
                    }
                    
                    // Insert new answers
                    const answerValues = answers.map(answer => [userIdInt, answer.questionId, answer.answerId, answer.isCorrect ? 1 : 0]);
                    const insertAnswersSql = `INSERT INTO user_quiz_answers (user_id, question_id, answer_id, is_correct) VALUES ?`;
                    
                    connection.query(insertAnswersSql, [answerValues], (err) => {
                        if (err) {
                            console.error("DB Error (save answers):", err);
                        }
                    });
                });
            }
            
            // Quiz başlangıcını kaydet (eğer daha önce kaydedilmemişse)
            trackQuizStart(userIdInt, quizIdInt);
            
            // Kurs ilerlemesini güncelle
            updateCourseProgress(userIdInt, quizIdInt);
            
            return res.json({
                success: true,
                message: "Sonuç kaydedildi",
                resultId: resultId
            });
        });
    });
});

// Track quiz access - Kullanıcı quiz sayfasını açtığında
app.post('/api/quizzes/:quizId/track-access', (req, res) => {
    const { quizId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir" });
    }
    
    const quizIdInt = parseInt(quizId, 10);
    const userIdInt = parseInt(userId, 10);
    
    if (isNaN(quizIdInt) || isNaN(userIdInt)) {
        return res.status(400).json({ success: false, message: "Geçersiz ID" });
    }
    
    trackQuizStart(userIdInt, quizIdInt);
    return res.json({ success: true, message: "Quiz erişimi kaydedildi" });
});

// Track quiz start - Kullanıcı quiz'e başladığında çağrılır
function trackQuizStart(userId, quizId) {
    // Quiz'in hangi kursa ait olduğunu bul
    const quizSql = `SELECT course_id FROM quizzes WHERE id = ?`;
    
    connection.query(quizSql, [quizId], (err, quizResults) => {
        if (err || quizResults.length === 0) {
            console.error("DB Error (get quiz course):", err);
            return;
        }
        
        const courseId = quizResults[0].course_id;
        
        // Kullanıcının bu kursa kaydı var mı kontrol et
        const checkSql = `SELECT id, status, started_at FROM user_courses WHERE user_id = ? AND course_id = ?`;
        
        connection.query(checkSql, [userId, courseId], (err, results) => {
            if (err) {
                console.error("DB Error (check user course):", err);
                return;
            }
            
            if (results.length === 0) {
                // Yeni kayıt oluştur ve başlat
                const insertSql = `INSERT INTO user_courses (user_id, course_id, status, enrolled_at, started_at, last_accessed_at) 
                                  VALUES (?, ?, 'in_progress', NOW(), NOW(), NOW())`;
                connection.query(insertSql, [userId, courseId], (err) => {
                    if (err) {
                        console.error("DB Error (insert user course):", err);
                    } else {
                        // Debug log kaldırıldı
                    }
                });
            } else {
                const userCourse = results[0];
                // Eğer daha önce başlatılmamışsa, started_at'i güncelle ve status'u in_progress yap
                if (!userCourse.started_at) {
                    const updateSql = `UPDATE user_courses SET status = 'in_progress', started_at = NOW(), last_accessed_at = NOW() 
                                      WHERE user_id = ? AND course_id = ?`;
                    connection.query(updateSql, [userId, courseId], (err) => {
                        if (err) {
                            console.error("DB Error (update user course start):", err);
                        } else {
                            // Debug log kaldırıldı
                        }
                    });
                } else {
                    // Sadece last_accessed_at'i güncelle
                    const updateSql = `UPDATE user_courses SET last_accessed_at = NOW() WHERE user_id = ? AND course_id = ?`;
                    connection.query(updateSql, [userId, courseId], (err) => {
                        if (err) {
                            console.error("DB Error (update user course access):", err);
                        }
                    });
                }
            }
        });
    });
}

// Update course progress - Quiz tamamlandıktan sonra kurs ilerlemesini güncelle
function updateCourseProgress(userId, quizId) {
    // Quiz'in hangi kursa ait olduğunu bul
    const quizSql = `SELECT course_id FROM quizzes WHERE id = ?`;
    
    connection.query(quizSql, [quizId], (err, quizResults) => {
        if (err || quizResults.length === 0) {
            console.error("DB Error (get quiz course):", err);
            return;
        }
        
        const courseId = quizResults[0].course_id;
        
        // Önce user_courses kaydının var olup olmadığını kontrol et
        const checkSql = `SELECT id FROM user_courses WHERE user_id = ? AND course_id = ?`;
        
        connection.query(checkSql, [userId, courseId], (err, checkResults) => {
            if (err) {
                console.error("DB Error (check user course):", err);
                return;
            }
            
            // Eğer kayıt yoksa oluştur
            if (checkResults.length === 0) {
                const insertSql = `INSERT INTO user_courses (user_id, course_id, status, enrolled_at, started_at, last_accessed_at) 
                                  VALUES (?, ?, 'in_progress', NOW(), NOW(), NOW())`;
                connection.query(insertSql, [userId, courseId], (err) => {
                    if (err) {
                        console.error("DB Error (insert user course):", err);
                        return;
                    }
                    // Debug log kaldırıldı
                    // Kayıt oluşturulduktan sonra ilerlemeyi hesapla
                    calculateAndUpdateProgress(userId, courseId);
                });
            } else {
                // Kayıt varsa direkt ilerlemeyi hesapla ve güncelle
                calculateAndUpdateProgress(userId, courseId);
            }
        });
    });
}

// Kurs ilerlemesini hesapla ve güncelle
function calculateAndUpdateProgress(userId, courseId) {
    // Kursun toplam quiz sayısını ve kullanıcının tamamladığı quiz sayısını bul
    const progressSql = `
        SELECT 
            COUNT(DISTINCT q.id) as total_quizzes,
            COUNT(DISTINCT uqr.quiz_id) as completed_quizzes
        FROM courses c
        LEFT JOIN quizzes q ON q.course_id = c.id
        LEFT JOIN user_quiz_results uqr ON uqr.quiz_id = q.id AND uqr.user_id = ?
        WHERE c.id = ?
        GROUP BY c.id
    `;
    
    connection.query(progressSql, [userId, courseId], (err, progressResults) => {
        if (err || progressResults.length === 0) {
            console.error("DB Error (get course progress):", err);
            return;
        }
        
        const progress = progressResults[0];
        const progressPercentage = progress.total_quizzes > 0 
            ? Math.round((progress.completed_quizzes / progress.total_quizzes) * 100) 
            : 0;
        
        // user_courses tablosunu güncelle
        const updateSql = `
            UPDATE user_courses 
            SET progress_percentage = ?,
                status = CASE 
                    WHEN ? = 100 THEN 'completed'
                    WHEN ? > 0 THEN 'in_progress'
                    ELSE status
                END,
                completed_at = CASE 
                    WHEN ? = 100 AND completed_at IS NULL THEN NOW()
                    ELSE completed_at
                END,
                updated_at = NOW()
            WHERE user_id = ? AND course_id = ?
        `;
        
        connection.query(updateSql, [progressPercentage, progressPercentage, progressPercentage, progressPercentage, userId, courseId], (err, result) => {
            if (err) {
                console.error("DB Error (update course progress):", err);
            } else {
                if (result.affectedRows > 0) {
                    // Debug log kaldırıldı
                } else {
                    // Debug log kaldırıldı
                }
            }
        });
    });
}

// Get user badges - Kullanıcının kazandığı rozetleri hesapla
app.get('/api/user/:id/badges', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Geçersiz kullanıcı ID'si" });
    }
    
    // Kullanıcının kurs ve quiz istatistiklerini al
    const statsSql = `
        SELECT 
            COUNT(DISTINCT uc.course_id) as total_courses_enrolled,
            COUNT(DISTINCT CASE WHEN uc.status = 'completed' THEN uc.course_id END) as completed_courses,
            COUNT(DISTINCT uqr.quiz_id) as completed_quizzes,
            SUM(q.time_limit) as total_minutes_learned,
            MIN(uc.enrolled_at) as first_course_date,
            COUNT(DISTINCT CASE WHEN DATE(uc.enrolled_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND uc.status = 'completed' THEN uc.course_id END) as courses_last_week
        FROM user_courses uc
        LEFT JOIN user_quiz_results uqr ON uqr.user_id = uc.user_id
        LEFT JOIN quizzes q ON q.id = uqr.quiz_id
        WHERE uc.user_id = ?
    `;
    
    connection.query(statsSql, [userId], (err, statsResults) => {
        if (err) {
            console.error("DB Error (get user stats):", err);
            return res.status(500).json({ success: false, message: "İstatistikler alınamadı" });
        }
        
        const stats = statsResults[0] || {};
        const badges = [];
        
        // First Steps - İlk kursu tamamladı
        if (stats.completed_courses >= 1) {
            badges.push({
                name: "İlk Adımlar",
                icon: "🎯",
                description: "İlk kursunuzu tamamladınız",
                earned: true
            });
        }
        
        // Quick Learner - Son 7 günde 3 kurs tamamladı
        if (stats.courses_last_week >= 3) {
            badges.push({
                name: "Hızlı Öğrenen",
                icon: "⚡",
                description: "Bir haftada 3 kurs tamamladınız",
                earned: true
            });
        }
        
        // Security Expert - 5 veya daha fazla kurs tamamladı
        if (stats.completed_courses >= 5) {
            badges.push({
                name: "Güvenlik Uzmanı",
                icon: "🛡️",
                description: "5 güvenlik kursunu tamamladınız",
                earned: true
            });
        }
        
        // Night Owl - Gece yarısından sonra 50 saat öğrenme (basitleştirilmiş: toplam 50 saat)
        const totalHours = Math.round((stats.total_minutes_learned || 0) / 60);
        if (totalHours >= 50) {
            badges.push({
                name: "Gece Kuşu",
                icon: "🦉",
                description: "50 saat öğrenme tamamladınız",
                earned: true
            });
        }
        
        return res.json({
            success: true,
            badges: badges
        });
    });
});

// Get user recent activity - Kullanıcının son aktivitelerini getir
app.get('/api/user/:id/activity', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const limit = parseInt(req.query.limit) || 10;
    
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Geçersiz kullanıcı ID'si" });
    }
    
    // Quiz tamamlama aktiviteleri - Kurs ilerlemesi ile birlikte
    const quizActivitySql = `
        SELECT 
            'quiz_completed' as activity_type,
            'Tamamlandı' as action,
            c.title as course_name,
            q.title as quiz_title,
            uqr.completed_at as activity_time,
            uqr.score as score,
            q.id as quiz_id,
            c.id as course_id,
            uc.progress_percentage as course_progress
        FROM user_quiz_results uqr
        JOIN quizzes q ON q.id = uqr.quiz_id
        JOIN courses c ON c.id = q.course_id
        LEFT JOIN user_courses uc ON uc.user_id = uqr.user_id AND uc.course_id = c.id
        WHERE uqr.user_id = ?
        ORDER BY uqr.completed_at DESC
        LIMIT ?
    `;
    
    // Kurs başlatma aktiviteleri
    const courseStartSql = `
        SELECT 
            'course_started' as activity_type,
            'Başlatıldı' as action,
            c.title as course_name,
            uc.started_at as activity_time,
            NULL as score,
            NULL as quiz_id,
            c.id as course_id
        FROM user_courses uc
        JOIN courses c ON c.id = uc.course_id
        WHERE uc.user_id = ? AND uc.started_at IS NOT NULL
        ORDER BY uc.started_at DESC
        LIMIT ?
    `;
    
    // Kurs tamamlama aktiviteleri
    const courseCompleteSql = `
        SELECT 
            'course_completed' as activity_type,
            'Tamamlandı' as action,
            c.title as course_name,
            uc.completed_at as activity_time,
            uc.progress_percentage as score,
            NULL as quiz_id,
            c.id as course_id
        FROM user_courses uc
        JOIN courses c ON c.id = uc.course_id
        WHERE uc.user_id = ? AND uc.completed_at IS NOT NULL
        ORDER BY uc.completed_at DESC
        LIMIT ?
    `;
    
    // Kurs ilerleme aktiviteleri (quiz tamamlandıktan sonra ilerleme güncellendiğinde)
    const progressActivitySql = `
        SELECT 
            'progress_updated' as activity_type,
            CONCAT('Tamamlandı ', uc.progress_percentage, '%') as action,
            c.title as course_name,
            uc.updated_at as activity_time,
            uc.progress_percentage as score,
            NULL as quiz_id,
            c.id as course_id
        FROM user_courses uc
        JOIN courses c ON c.id = uc.course_id
        WHERE uc.user_id = ? AND uc.progress_percentage > 0 AND uc.progress_percentage < 100
        ORDER BY uc.updated_at DESC
        LIMIT ?
    `;
    
    // Tüm aktiviteleri ayrı ayrı çek ve birleştir
    Promise.all([
        new Promise((resolve, reject) => {
            connection.query(quizActivitySql, [userId, limit], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(courseStartSql, [userId, limit], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(courseCompleteSql, [userId, limit], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(progressActivitySql, [userId, limit], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        })
    ]).then(([quizResults, startResults, completeResults, progressResults]) => {
        // Tüm sonuçları birleştir
        const allResults = [...quizResults, ...startResults, ...completeResults, ...progressResults];
        
        // Zamanına göre sırala
        allResults.sort((a, b) => new Date(b.activity_time) - new Date(a.activity_time));
        
        // Limit'e göre kes
        const results = allResults.slice(0, limit);
        
        // Aktivite verilerini formatla
        
        // Aktivite verilerini formatla
        const activities = results.map(activity => {
            let actionText = activity.action;
            let courseText = activity.course_name;
            
            // Aktivite tipine göre formatla
            if (activity.activity_type === 'quiz_completed') {
                // Quiz tamamlandı - Kurs ilerlemesini göster
                if (activity.course_progress !== null && activity.course_progress > 0) {
                    actionText = `Completed ${activity.course_progress}% of`;
                } else {
                    actionText = 'Completed';
                    courseText = activity.quiz_title || activity.course_name;
                }
            } else if (activity.activity_type === 'progress_updated') {
                actionText = `Completed ${activity.score || activity.course_progress || 0}% of`;
            } else if (activity.activity_type === 'course_completed') {
                actionText = 'Completed';
            }
            
            // Zaman formatını hesapla
            const activityTime = new Date(activity.activity_time);
            const now = new Date();
            const diffMs = now - activityTime;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            const diffWeeks = Math.floor(diffDays / 7);
            
            let timeText = '';
            if (diffMins < 1) {
                timeText = 'Az önce';
            } else if (diffMins < 60) {
                timeText = diffMins === 1 ? '1 dakika önce' : `${diffMins} dakika önce`;
            } else if (diffHours < 24) {
                timeText = diffHours === 1 ? '1 saat önce' : `${diffHours} saat önce`;
            } else if (diffDays < 7) {
                timeText = diffDays === 1 ? '1 gün önce' : `${diffDays} gün önce`;
            } else {
                timeText = diffWeeks === 1 ? '1 hafta önce' : `${diffWeeks} hafta önce`;
            }
            
            return {
                action: actionText,
                course: courseText,
                time: timeText,
                activity_type: activity.activity_type,
                activity_time: activity.activity_time
            };
        });
        
        return res.json({
            success: true,
            activities: activities
        });
    }).catch((err) => {
        console.error("DB Error (get user activity):", err);
        return res.status(500).json({ success: false, message: "Aktivite verileri alınamadı" });
    });
});

// Kullanıcıları listeleme endpoint
app.get('/api/users', (req, res) => {
    const sql = `SELECT ID as id, uname, usurname, unickname, umail, urole, uis_active, ucreated_at FROM users ORDER BY ucreated_at DESC`;
    connection.query(sql, (err, results) => {
        if (err) {
            if (!isProduction) {
                console.error("[DB] Kullanıcılar listesi hatası:", err.message);
            }
            return res.status(500).json({ success: false, message: "Kullanıcılar alınamadı" });
        }
        return res.json({ success: true, users: results });
    });
});

// Kullanıcı rolü güncelleme endpoint
app.put('/api/users/:id/role', (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Geçersiz kullanıcı ID'si" });
    }
    
    // Rol validasyonu
    const validRoles = ['user', 'admin', 'moderator'];
    if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: "Geçersiz rol. Geçerli roller: user, admin, moderator" });
    }
    
    const sql = `UPDATE users SET urole = ? WHERE ID = ?`;
    connection.query(sql, [role, userId], (err, result) => {
        if (err) {
            if (!isProduction) {
                console.error("[DB] Rol güncelleme hatası:", err.message);
            }
            return res.status(500).json({ success: false, message: "Rol güncellenemedi" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
        }
        
        return res.json({ success: true, message: "Kullanıcı rolü başarıyla güncellendi" });
    });
});

// Kullanıcı silme endpoint
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Geçersiz kullanıcı ID'si" });
    }
    
    const sql = `DELETE FROM users WHERE ID = ?`;
    connection.query(sql, [userId], (err, result) => {
        if (err) {
            if (!isProduction) {
                console.error("[DB] Kullanıcı silme hatası:", err.message);
            }
            return res.status(500).json({ success: false, message: "Kullanıcı silinemedi" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
        }
        
        return res.json({ success: true, message: "Kullanıcı başarıyla silindi", affected: result.affectedRows });
    });
});

// ========== MODÜL (QUIZ) YÖNETİMİ ==========

// Bir kursun modüllerini getir
app.get('/api/courses/:courseId/modules', (req, res) => {
    const { courseId } = req.params;
    const sql = `SELECT id, course_id, title, description, time_limit, created_at FROM quizzes WHERE course_id = ? ORDER BY created_at ASC`;
    
    connection.query(sql, [courseId], (err, results) => {
        if (err) {
            console.error("DB Error (get modules):", err);
            return res.status(500).json({ success: false, message: "Modüller yüklenemedi" });
        }
        return res.json({ success: true, modules: results });
    });
});

// Modül ekle
app.post('/api/modules', (req, res) => {
    const { course_id, title, description, time_limit } = req.body;
    if (!course_id || !title) {
        return res.status(400).json({ success: false, message: "Kurs ID ve başlık gerekli" });
    }
    const sql = `INSERT INTO quizzes (course_id, title, description, time_limit) VALUES (?, ?, ?, ?)`;
    connection.query(sql, [course_id, title, description || null, time_limit || 0], (err, result) => {
        if (err) {
            console.error("DB Error (module insert):", err);
            return res.status(500).json({ success: false, message: "Modül eklenemedi" });
        }
        return res.json({ success: true, id: result.insertId });
    });
});

// Modül güncelle
app.put('/api/modules/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, time_limit } = req.body;
    if (!title) {
        return res.status(400).json({ success: false, message: "Başlık gereklidir" });
    }
    const sql = `UPDATE quizzes SET title = ?, description = ?, time_limit = ? WHERE id = ?`;
    connection.query(sql, [title, description || null, time_limit || 0, id], (err, result) => {
        if (err) {
            console.error("DB Error (module update):", err);
            return res.status(500).json({ success: false, message: "Modül güncellenemedi" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Modül bulunamadı" });
        }
        return res.json({ success: true, message: "Modül başarıyla güncellendi" });
    });
});

// Modül sil
app.delete('/api/modules/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM quizzes WHERE id = ?`;
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB Error (module delete):", err);
            return res.status(500).json({ success: false, message: "Modül silinemedi" });
        }
        return res.json({ success: true, affected: result.affectedRows });
    });
});

// Modül detayını getir (sorularla birlikte)
app.get('/api/modules/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT id, course_id, title, description, time_limit, created_at FROM quizzes WHERE id = ?`;
    connection.query(sql, [id], (err, moduleResults) => {
        if (err) {
            console.error("DB Error (get module):", err);
            return res.status(500).json({ success: false, message: "Modül yüklenemedi" });
        }
        if (moduleResults.length === 0) {
            return res.status(404).json({ success: false, message: "Modül bulunamadı" });
        }
        const module = moduleResults[0];
        
        // Soruları getir
        const questionSql = `SELECT id, question_text, type, created_at FROM quiz_questions WHERE quiz_id = ? ORDER BY created_at ASC`;
        connection.query(questionSql, [id], (err, questionResults) => {
            if (err) {
                console.error("DB Error (get questions):", err);
                return res.json({ success: true, module: { ...module, questions: [] } });
            }
            
            if (questionResults.length === 0) {
                return res.json({ success: true, module: { ...module, questions: [] } });
            }
            
            const questionIds = questionResults.map(q => q.id);
            const placeholders = questionIds.map(() => '?').join(',');
            const answerSql = `SELECT id, question_id, answer_text, is_correct FROM quiz_answers WHERE question_id IN (${placeholders}) ORDER BY question_id, id ASC`;
            
            connection.query(answerSql, questionIds, (err, answerResults) => {
                if (err) {
                    console.error("DB Error (get answers):", err);
                    return res.json({ success: true, module: { ...module, questions: questionResults.map(q => ({ ...q, answers: [] })) } });
                }
                
                const answersByQuestion = {};
                answerResults.forEach(answer => {
                    if (!answersByQuestion[answer.question_id]) {
                        answersByQuestion[answer.question_id] = [];
                    }
                    answersByQuestion[answer.question_id].push({
                        id: answer.id,
                        answer_text: answer.answer_text,
                        is_correct: answer.is_correct === 1
                    });
                });
                
                const questions = questionResults.map(question => ({
                    id: question.id,
                    question_text: question.question_text,
                    type: question.type,
                    answers: answersByQuestion[question.id] || []
                }));
                
                return res.json({ success: true, module: { ...module, questions } });
            });
        });
    });
});

// ========== SORU (QUESTION) YÖNETİMİ ==========

// Bir modülün sorularını getir
app.get('/api/modules/:moduleId/questions', (req, res) => {
    const { moduleId } = req.params;
    const sql = `SELECT id, quiz_id, question_text, type, created_at FROM quiz_questions WHERE quiz_id = ? ORDER BY created_at ASC`;
    
    connection.query(sql, [moduleId], (err, results) => {
        if (err) {
            console.error("DB Error (get questions):", err);
            return res.status(500).json({ success: false, message: "Sorular yüklenemedi" });
        }
        return res.json({ success: true, questions: results });
    });
});

// Soru ekle
app.post('/api/questions', (req, res) => {
    const { quiz_id, question_text, type } = req.body;
    if (!quiz_id || !question_text) {
        return res.status(400).json({ success: false, message: "Modül ID ve soru metni gerekli" });
    }
    const sql = `INSERT INTO quiz_questions (quiz_id, question_text, type) VALUES (?, ?, ?)`;
    connection.query(sql, [quiz_id, question_text, type || 'single'], (err, result) => {
        if (err) {
            console.error("DB Error (question insert):", err);
            return res.status(500).json({ success: false, message: "Soru eklenemedi" });
        }
        return res.json({ success: true, id: result.insertId });
    });
});

// Soru güncelle
app.put('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    const { question_text, type } = req.body;
    if (!question_text) {
        return res.status(400).json({ success: false, message: "Soru metni gereklidir" });
    }
    const sql = `UPDATE quiz_questions SET question_text = ?, type = ? WHERE id = ?`;
    connection.query(sql, [question_text, type || 'single', id], (err, result) => {
        if (err) {
            console.error("DB Error (question update):", err);
            return res.status(500).json({ success: false, message: "Soru güncellenemedi" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Soru bulunamadı" });
        }
        return res.json({ success: true, message: "Soru başarıyla güncellendi" });
    });
});

// Soru sil
app.delete('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM quiz_questions WHERE id = ?`;
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB Error (question delete):", err);
            return res.status(500).json({ success: false, message: "Soru silinemedi" });
        }
        return res.json({ success: true, affected: result.affectedRows });
    });
});

// ========== CEVAP (ANSWER) YÖNETİMİ ==========

// Bir sorunun cevaplarını getir
app.get('/api/questions/:questionId/answers', (req, res) => {
    const { questionId } = req.params;
    const sql = `SELECT id, question_id, answer_text, is_correct FROM quiz_answers WHERE question_id = ? ORDER BY id ASC`;
    
    connection.query(sql, [questionId], (err, results) => {
        if (err) {
            console.error("DB Error (get answers):", err);
            return res.status(500).json({ success: false, message: "Cevaplar yüklenemedi" });
        }
        return res.json({ success: true, answers: results });
    });
});

// Cevap ekle
app.post('/api/answers', (req, res) => {
    const { question_id, answer_text, is_correct } = req.body;
    if (!question_id || !answer_text) {
        return res.status(400).json({ success: false, message: "Soru ID ve cevap metni gerekli" });
    }
    const sql = `INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)`;
    connection.query(sql, [question_id, answer_text, is_correct ? 1 : 0], (err, result) => {
        if (err) {
            console.error("DB Error (answer insert):", err);
            return res.status(500).json({ success: false, message: "Cevap eklenemedi" });
        }
        return res.json({ success: true, id: result.insertId });
    });
});

// Cevap güncelle
app.put('/api/answers/:id', (req, res) => {
    const { id } = req.params;
    const { answer_text, is_correct } = req.body;
    if (!answer_text) {
        return res.status(400).json({ success: false, message: "Cevap metni gereklidir" });
    }
    const sql = `UPDATE quiz_answers SET answer_text = ?, is_correct = ? WHERE id = ?`;
    connection.query(sql, [answer_text, is_correct ? 1 : 0, id], (err, result) => {
        if (err) {
            console.error("DB Error (answer update):", err);
            return res.status(500).json({ success: false, message: "Cevap güncellenemedi" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Cevap bulunamadı" });
        }
        return res.json({ success: true, message: "Cevap başarıyla güncellendi" });
    });
});

// Cevap sil
app.delete('/api/answers/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM quiz_answers WHERE id = ?`;
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB Error (answer delete):", err);
            return res.status(500).json({ success: false, message: "Cevap silinemedi" });
        }
        return res.json({ success: true, affected: result.affectedRows });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log("===================================");
    console.log(`Server çalışıyor: http://localhost:${PORT}`);
    console.log(`API Endpoint: http://localhost:${PORT}/api/courses`);
    console.log("===================================");
});
