const express = require('express');
const app = express();
const connection = require('./connection');

// JSON body okumak için
app.use(express.json());

app.post('/register', (req, res) => {
    const { uName, uSurname, uNickname, uMail, uPassword } = req.body;

    // Eksik varsa hata
    if (!uName || !uSurname || !uNickname || !uMail || !uPassword) {
        return res.status(400).json({ message: "Eksik bilgi var!" });
    }

    const sql = `
        INSERT INTO users (uName, uSurname, uNickname, uMail, uPassword)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [uName, uSurname, uNickname, uMail, uPassword];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Veritabanı hatası!" });
        }

        return res.json({
            message: "Kullanıcı başarıyla kaydedildi!",
            userId: result.insertId
        });
    });
});

app.listen(3000, () => console.log("Server çalışıyor: http://localhost:3000"));
