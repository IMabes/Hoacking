const mysql = require("mysql2");

// Bağlantı havuzu oluşturma (performans ve hata işleme için)
const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "hoacking",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Bağlantıyı test et
connection.getConnection((err, conn) => {
    if (err) {
        console.error("MySQL bağlantı hatası:", err);
        return;
    }
    console.log("MySQL bağlantısı başarılı!");
    conn.release(); // Bağlantıyı havuzuna geri ver
});

// Bağlantı hatası işleme
connection.on('error', (err) => {
    console.error('MySQL pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('MySQL connection lost. Reconnecting...');
    } else {
        throw err;
    }
});

module.exports = connection;