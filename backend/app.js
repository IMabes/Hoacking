const express = require('express');
const cors = require('cors');
const connection = require('./connection');

const app = express();

// Arakatman
app.use(cors());
app.use(express.json());

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

app.listen(3000, () => console.log("Server çalışıyor: http://localhost:3000"));
