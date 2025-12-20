const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * E-posta gönderici yapılandırması
 * SMTP ayarları environment variables'dan alınır
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'hoackingg@gmail.com',
        pass: process.env.SMTP_PASS || 'entd iixm xtll ssjc'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Production modu kontrolü
const isProduction = process.env.NODE_ENV === 'production';

/**
 * SMTP bağlantısını doğrula
 * Sadece başlangıçta bir kez çalışır
 */
transporter.verify(function(error, success) {
    if (error) {
        console.warn('[SMTP] Yapılandırma hatası:', error.message);
        if (!isProduction) {
            console.warn('[SMTP] Geliştirme modu: E-posta gönderilemezse kod konsola yazdırılacak');
        }
    } else {
        console.log('[SMTP] Bağlantı başarılı');
    }
});

/**
 * Doğrulama kodları için in-memory storage
 * Format: email -> { code, expiresAt, attempts, verified?, type? }
 * Kodlar 10 dakika sonra otomatik olarak expire olur
 */
const verificationCodes = new Map();

// Doğrulama kodu gönder
async function sendVerificationCode(email) {
    try {
        // 6 haneli rastgele kod oluştur
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Kodu sakla (10 dakika geçerli)
        verificationCodes.set(email, {
            code: code,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 dakika
            attempts: 0 // Yanlış deneme sayısı
        });
        
        // E-posta içeriği
        const fromEmail = process.env.SMTP_USER || 'iremnazkilicer1905@gmail.com';
        const mailOptions = {
            from: `"Hocking" <${fromEmail}>`,
            to: email,
            subject: 'Hocking - E-posta Doğrulama Kodu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a021a; color: #fff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #00ff88; font-family: 'Pixelify Sans', sans-serif;">HOCKING</h1>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 30px; border-radius: 15px; border: 1px solid rgba(0, 255, 136, 0.3);">
                        <h2 style="color: #00ff88; margin-top: 0;">E-posta Doğrulama Kodu</h2>
                        <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
                            Merhaba,<br><br>
                            Hocking platformuna kayıt olmak için aşağıdaki doğrulama kodunu kullanın:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; background: rgba(0, 255, 136, 0.1); padding: 20px 40px; border-radius: 10px; border: 2px solid #00ff88;">
                                <span style="font-size: 32px; font-weight: bold; color: #00ff88; letter-spacing: 5px; font-family: 'Courier New', monospace;">${code}</span>
                            </div>
                        </div>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin-top: 20px;">
                            Bu kod 10 dakika süreyle geçerlidir.<br>
                            Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                        </p>
                    </div>
                    <div style="text-align: center; margin-top: 30px; color: rgba(255, 255, 255, 0.4); font-size: 12px;">
                        <p>© 2025 Hocking. Tüm hakları saklıdır.</p>
                    </div>
                </div>
            `
        };
        
        // E-posta göndermeyi dene
        try {
            const info = await transporter.sendMail(mailOptions);
            if (!isProduction) {
                console.log('[Email] Doğrulama kodu gönderildi:', email);
            }
            
            return { success: true, message: 'Doğrulama kodu e-posta adresinize gönderildi. Lütfen e-posta kutunuzu kontrol edin.' };
        } catch (sendError) {
            // Hata logla (production'da sadece hata mesajı, development'te detay)
            if (isProduction) {
                console.error('[Email] Gönderme hatası:', sendError.message);
            } else {
                console.error('[Email] Gönderme hatası:', sendError);
                console.log('[Dev] Doğrulama kodu:', code, 'E-posta:', email);
            }
            
            // Hata mesajını oluştur
            let errorMessage = 'E-posta gönderilemedi. ';
            if (sendError.code === 'EAUTH') {
                errorMessage += 'SMTP kimlik doğrulama hatası.';
            } else if (sendError.code === 'ECONNECTION') {
                errorMessage += 'SMTP bağlantı hatası.';
            } else {
                errorMessage += 'Teknik bir sorun oluştu.';
            }
            
            // Development modunda kod göster, production'da gösterme
            if (!isProduction) {
                return { 
                    success: true, 
                    message: `Doğrulama kodunuz: ${code} (${errorMessage})`,
                    devMode: true,
                    code: code
                };
            } else {
                return { 
                    success: false, 
                    message: errorMessage + ' Lütfen daha sonra tekrar deneyin.'
                };
            }
        }
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, message: 'Doğrulama kodu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' };
    }
}

// Doğrulama kodunu kontrol et
function verifyCode(email, code) {
    const verification = verificationCodes.get(email);
    
    if (!verification) {
        return { success: false, message: 'Doğrulama kodu bulunamadı. Lütfen yeni kod isteyin.' };
    }
    
    // Süre dolmuş mu kontrol et
    if (Date.now() > verification.expiresAt) {
        verificationCodes.delete(email);
        return { success: false, message: 'Doğrulama kodu süresi dolmuş. Lütfen yeni kod isteyin.' };
    }
    
    // Yanlış deneme sayısı kontrolü (max 5 deneme)
    if (verification.attempts >= 5) {
        verificationCodes.delete(email);
        return { success: false, message: 'Çok fazla yanlış deneme yapıldı. Lütfen yeni kod isteyin.' };
    }
    
    // Kod kontrolü
    if (verification.code !== code) {
        verification.attempts++;
        return { success: false, message: 'Doğrulama kodu hatalı. Kalan deneme hakkı: ' + (5 - verification.attempts) };
    }
    
    // Kod doğru, doğrulanmış olarak işaretle
    verificationCodes.set(email, {
        ...verification,
        verified: true,
        verifiedAt: Date.now()
    });
    
    return { success: true, message: 'E-posta doğrulandı.' };
}

// E-posta doğrulanmış mı kontrol et
function isEmailVerified(email) {
    const verification = verificationCodes.get(email);
    return verification && verification.verified === true;
}

// Doğrulanmış e-postayı temizle (kayıt tamamlandıktan sonra)
function clearVerification(email) {
    verificationCodes.delete(email);
}

// Şifre sıfırlama kodu gönder
async function sendPasswordResetCode(email) {
    try {
        // 6 haneli rastgele kod oluştur
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Kodu sakla (10 dakika geçerli)
        verificationCodes.set(`reset_${email}`, {
            code: code,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 dakika
            attempts: 0, // Yanlış deneme sayısı
            type: 'password_reset'
        });
        
        // E-posta içeriği
        const fromEmail = process.env.SMTP_USER || 'hoackingg@gmail.com';
        const mailOptions = {
            from: `"Hocking" <${fromEmail}>`,
            to: email,
            subject: 'Hocking - Şifre Sıfırlama Kodu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a021a; color: #fff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #00ff88; font-family: 'Pixelify Sans', sans-serif;">HOCKING</h1>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 30px; border-radius: 15px; border: 1px solid rgba(0, 255, 136, 0.3);">
                        <h2 style="color: #00ff88; margin-top: 0;">Şifre Sıfırlama Kodu</h2>
                        <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
                            Merhaba,<br><br>
                            Hocking hesabınızın şifresini sıfırlamak için aşağıdaki doğrulama kodunu kullanın:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; background: rgba(0, 255, 136, 0.1); padding: 20px 40px; border-radius: 10px; border: 2px solid #00ff88;">
                                <span style="font-size: 32px; font-weight: bold; color: #00ff88; letter-spacing: 5px; font-family: 'Courier New', monospace;">${code}</span>
                            </div>
                        </div>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin-top: 20px;">
                            Bu kod 10 dakika süreyle geçerlidir.<br>
                            Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                        </p>
                    </div>
                    <div style="text-align: center; margin-top: 30px; color: rgba(255, 255, 255, 0.4); font-size: 12px;">
                        <p>© 2025 Hocking. Tüm hakları saklıdır.</p>
                    </div>
                </div>
            `
        };
        
        // E-posta göndermeyi dene
        try {
            const info = await transporter.sendMail(mailOptions);
            if (!isProduction) {
                console.log('[Email] Şifre sıfırlama kodu gönderildi:', email);
            }
            
            return { success: true, message: 'Şifre sıfırlama kodu e-posta adresinize gönderildi.' };
        } catch (sendError) {
            // Hata logla
            if (isProduction) {
                console.error('[Email] Şifre sıfırlama gönderme hatası:', sendError.message);
            } else {
                console.error('[Email] Şifre sıfırlama gönderme hatası:', sendError);
                console.log('[Dev] Şifre sıfırlama kodu:', code, 'E-posta:', email);
            }
            
            // Development modunda kod göster, production'da gösterme
            if (!isProduction) {
                return { 
                    success: true, 
                    message: `Şifre sıfırlama kodunuz: ${code} (E-posta gönderilemedi)`,
                    devMode: true,
                    code: code
                };
            } else {
                return { 
                    success: false, 
                    message: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.'
                };
            }
        }
    } catch (error) {
        console.error('Password reset service error:', error);
        return { success: false, message: 'Şifre sıfırlama kodu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' };
    }
}

// Şifre sıfırlama kodunu kontrol et
function verifyPasswordResetCode(email, code) {
    const verification = verificationCodes.get(`reset_${email}`);
    
    if (!verification) {
        return { success: false, message: 'Şifre sıfırlama kodu bulunamadı. Lütfen yeni kod isteyin.' };
    }
    
    // Süre dolmuş mu kontrol et
    if (Date.now() > verification.expiresAt) {
        verificationCodes.delete(`reset_${email}`);
        return { success: false, message: 'Şifre sıfırlama kodu süresi dolmuş. Lütfen yeni kod isteyin.' };
    }
    
    // Yanlış deneme sayısı kontrolü (max 5 deneme)
    if (verification.attempts >= 5) {
        verificationCodes.delete(`reset_${email}`);
        return { success: false, message: 'Çok fazla yanlış deneme yapıldı. Lütfen yeni kod isteyin.' };
    }
    
    // Kod kontrolü
    if (verification.code !== code) {
        verification.attempts++;
        return { success: false, message: 'Doğrulama kodu hatalı. Kalan deneme hakkı: ' + (5 - verification.attempts) };
    }
    
    // Kod doğru, doğrulanmış olarak işaretle
    verificationCodes.set(`reset_${email}`, {
        ...verification,
        verified: true,
        verifiedAt: Date.now()
    });
    
    return { success: true, message: 'Şifre sıfırlama kodu doğrulandı.' };
}

// Şifre sıfırlama kodu doğrulanmış mı kontrol et
function isPasswordResetCodeVerified(email) {
    const verification = verificationCodes.get(`reset_${email}`);
    return verification && verification.verified === true;
}

// Şifre sıfırlama kodunu temizle
function clearPasswordResetCode(email) {
    verificationCodes.delete(`reset_${email}`);
}

// Süresi dolmuş kodları temizle (her 5 dakikada bir çalıştırılabilir)
function cleanupExpiredCodes() {
    const now = Date.now();
    for (const [email, verification] of verificationCodes.entries()) {
        if (now > verification.expiresAt) {
            verificationCodes.delete(email);
        }
    }
}

// Her 5 dakikada bir süresi dolmuş kodları temizle
setInterval(cleanupExpiredCodes, 5 * 60 * 1000);

module.exports = {
    sendVerificationCode,
    verifyCode,
    isEmailVerified,
    clearVerification,
    sendPasswordResetCode,
    verifyPasswordResetCode,
    isPasswordResetCodeVerified,
    clearPasswordResetCode
};

