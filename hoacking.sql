-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1
-- Üretim Zamanı: 20 Ara 2025, 18:21:44
-- Sunucu sürümü: 10.4.32-MariaDB
-- PHP Sürümü: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `hoacking`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `blogs`
--

CREATE TABLE `blogs` (
  `id` int(11) NOT NULL,
  `title` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo döküm verisi `blogs`
--

INSERT INTO `blogs` (`id`, `title`, `description`, `image_url`, `created_at`) VALUES
(5, 'Bir Web Sitesi Nasıl Hacklenir?', 'Bir web sitesine girdiğinde sadece bir giriş formu görürsün: Kullanıcı adı ve şifre. Ama bir saldırgan bu formu gördüğünde farklı bir şey düşünür:  “Bu form, veri tabanına nasıl bağlanıyor?”  Bu yazıda, SQL Injection (SQLi) saldırısının gerçekçi bir senaryo üzerinden nasıl gerçekleştiğini, arka planda hangi teknolojilerin çalıştığını ve bu saldırının nasıl önlenebileceğini adım adım inceleyeceğiz.', 'https://backend.multimatics.co.id:8080/uploads/article/dive-into-ethical-hacking-how-does-it-work-1703596124019.jpeg', '0000-00-00 00:00:00'),
(6, '2025 Siber Güvenlik Trendleri', '2025 yılında siber güvenlik dünyasında öne çıkan trendler ve gelişmeler. AI destekli tehditler, zero-trust mimarisi ve daha fazlası. 2025 yılı siber güvenlik dünyasında önemli değişiklikler getiriyor. Yapay zeka destekli saldırılar artarken, savunma tarafında da AI tabanlı çözümler geliştiriliyor. Zero-trust mimarisi artık bir lüks değil, zorunluluk haline geliyor. Kuantum bilgisayarların yaklaşmasıyla birlikte, kuantum dirençli şifreleme algoritmalarına geçiş başladı.', 'https://www.sestek.com/upload/admin/blog/ses-teknolojileri-ve-siber-guvenlik-yenilik-guvenlik--8230-20241221112825_800.jpg', '2025-12-20 14:34:57'),
(7, 'OWASP Top 10 2024 Güncellemesi', 'OWASP Top 10 listesinin 2024 güncellemesi ve değişiklikler. Yeni güvenlik açıkları ve korunma yöntemleri. OWASP Top 10 listesi, web uygulama güvenliğinde en kritik riskleri belirleyen önemli bir kaynaktır. 2024 güncellemesinde önemli değişiklikler var. Broken Access Control artık listenin başında yer alıyor. Cryptographic Failures yeni bir kategori olarak eklendi.', 'https://nerdssupport.com/wp-content/uploads/2025/03/6039c84e695ede694324b40d_owaspcode-1-1024x675-1-1.webp', '2025-12-20 14:34:57'),
(8, 'Phishing Saldırılarına Karşı Korunma Rehberi', 'Phishing saldırılarını nasıl tespit ederiz ve korunuruz? Pratik ipuçları ve örnekler. Phishing saldırıları, siber güvenlik tehditlerinin en yaygın olanlarından biridir. Saldırganlar, kullanıcıları kandırarak hassas bilgileri ele geçirmeye çalışır.', 'https://trilliummutual.com/wp-content/uploads/2020/03/Phishing.jpg', '2025-12-20 14:34:57'),
(9, 'Bulut Güvenliği: AWS Best Practices', 'AWS ortamında güvenli bir altyapı kurmak için en iyi uygulamalar ve öneriler. AWS, dünyanın en popüler bulut sağlayıcılarından biridir. Ancak güvenlik yapılandırması doğru yapılmazsa, ciddi riskler oluşabilir.', 'https://lh6.googleusercontent.com/lfGaw2vZtPlSYgwf9Aehv3Wv-J3fFV4GE85VBYQzcFmTQ0_m5mdLJtXuSqPz4dZpbYGb3ouBYzVTD7HG7TfkO2ZCr4k2az_uRJwfu1iM6C9X2xW_oi5W8h_D9FVuW1PcIpwr6OXQ', '2025-12-20 14:34:57'),
(10, 'Linux Sistem Güvenliği Temelleri', 'Linux sistemlerinde güvenlik yapılandırması, firewall kuralları ve sistem sertleştirme teknikleri. Linux sistemleri, sunucu ortamlarında yaygın olarak kullanılır. Ancak varsayılan yapılandırmalar her zaman güvenli değildir.', 'https://universodigital.org/wp-content/uploads/Introduccion-a-Linux2.jpg', '2025-12-20 14:34:57'),
(11, 'Kriptografi: Modern Şifreleme Algoritmaları', 'AES, RSA, ECC ve diğer modern şifreleme algoritmalarının karşılaştırması ve kullanım alanları. Kriptografi, modern siber güvenliğin temel taşlarından biridir.', 'https://ik.imagekit.io/edtechdigit/uscsi/Content/images/articles/a-brief-guide-on-cryptography-technology-for-cybersecurity.jpg', '2025-12-20 14:34:57'),
(12, 'SOC Kurulumu ve Yönetimi', 'Security Operations Center (SOC) nasıl kurulur? Ekip yapısı, araçlar ve süreçler. SOC, bir organizasyonun siber güvenlik operasyonlarının merkezidir.', 'https://www.sisainfosec.com/wp-content/uploads/elementor/thumbs/blog-what-is-soc-qowlnzd31v4cq6s37p7kou56hk42boofq7bbtkh1uy.webp', '2025-12-20 14:34:57'),
(13, 'Mobil Uygulama Güvenliği: Android ve iOS', 'Mobil uygulama geliştirirken dikkat edilmesi gereken güvenlik konuları ve best practices. Mobil uygulamalar, günlük hayatımızın vazgeçilmez bir parçası haline geldi.', 'https://lh5.googleusercontent.com/UIQ5BfSzTHAwok4ZOS5r3OUGh4P_Cv7umdC1T6kYkT_ySo1zdiFGzgmUDQ3x0jYPGm8iPi8vDC_V3yJeSHnrHWpzfFDd1BaFn1eejzQOIQ2uYz34j9epJ8pa94SEQCikHqmX1zhlbB_CHT_xGHvzijFH3J2Vn-efo_fVOZd0jRHR6RLcWXKSb_7Dlb1Pjw', '2025-12-20 14:34:57'),
(14, 'Olay Müdahale: NIST Framework Uygulaması', 'Siber güvenlik olaylarına müdahale süreçleri ve NIST framework\'ün pratik uygulaması. Olay müdahale, siber güvenlik ekibinin en kritik görevlerinden biridir.', 'https://cybercx.com.au/wp-content/uploads/2024/07/NIST-cybersecurity-framework.png', '2025-12-20 14:34:57'),
(15, 'IoT Güvenliği: Tehditler ve Çözümler', 'Nesnelerin İnterneti cihazlarının güvenlik açıkları ve korunma stratejileri. IoT cihazları, evlerimizden endüstriyel sistemlere kadar her yerde kullanılıyor.', 'https://www.also.com/ec/cms5/6000/blog/future-technologies/woman-uses-tablet-surrounded-by-iot-security-graphics-227780092_800px.jpg', '2025-12-20 14:34:57');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `is_featured` tinyint(1) DEFAULT 0 COMMENT 'Öne çıkan kurs (1: öne çıkan, 0: normal)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo döküm verisi `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `image_url`, `created_at`, `is_featured`) VALUES
(7, 'Exploit Attack ', 'Deneme amaçlı eklenmiştir!', 'https://www.sangfor.com/sites/default/files/2022-05/cyber_attack.jpg', '2025-12-15 16:02:30', 0),
(8, 'Linux Temelleri', 'Linux işletim sisteminin temellerini öğrenin. Komut satırı, dosya sistemi, kullanıcı yönetimi ve sistem yönetimi konularında uzmanlaşın.', 'https://www.natro.com/blog/wp-content/uploads/2018/11/linux-sunucu.jpeg', '2025-12-20 12:27:23', 0),
(9, 'Siber Güvenlik Temelleri', 'Siber güvenliğin temel kavramlarını öğrenin. Tehdit türleri, şifreleme, ağ güvenliği, web uygulama güvenliği ve olay müdahale konularında uzmanlaşın.', 'https://enstitu.ibb.istanbul/files/ismekOrg/Image/img_brans/brans_yenisitegaleri/siber-guvenlik1/3.jpg', '2025-12-20 12:59:21', 0),
(10, 'Penetrasyon Testi Eğitimi', 'Etik hackleme ve güvenlik değerlendirme sanatında uzmanlaşın. Penetrasyon testi metodolojileri, araçlar ve teknikler hakkında kapsamlı eğitim.', 'https://media.istockphoto.com/id/2174551157/tr/foto%C4%9Fraf/cyber-security-data-protection-business-technology-privacy-concept.jpg?s=612x612&w=0&k=20&c=S1E5XvQwMJVacFJC48AjB1mHOli0_wkQbiGYXQl86Uc=', '2025-12-20 16:39:59', 1),
(11, 'Web Uygulama Güvenliği', 'Web uygulamalarındaki güvenlik açıklarını öğrenin ve koruma tekniklerini uygulayın. OWASP Top 10, SQL Injection, XSS ve daha fazlası.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEhNlece16lRRpPts0f3NDPzUG5hS2svbp2g&s', '2025-12-20 14:34:57', 0),
(12, 'Ağ Güvenliği', 'Ağ protokollerini, güvenlik açıklarını ve koruma yöntemlerini öğrenin. Firewall, IDS/IPS, VPN ve daha fazlası.', 'https://www.uscybersecurity.net/wp-content/uploads/2021/02/NetworkSecurity.jpg', '2025-12-20 14:34:57', 0),
(13, 'Kriptografi Temelleri', 'Şifreleme algoritmaları, hash fonksiyonları, dijital imzalar ve kriptografik protokoller hakkında kapsamlı eğitim.', 'https://i0.wp.com/www.tugbaoksum.com/wp-content/uploads/2024/03/kriptografi.jpg?fit=640%2C364&ssl=1', '2025-12-20 14:34:57', 0),
(14, 'Zararlı Yazılım Analizi', 'Malware türleri, analiz teknikleri, sandbox ortamları ve reverse engineering temelleri.', 'https://image.hurimg.com/i/hurriyet/90/750x422/55ea68e2f018fbb8f87e0dfc.jpg', '2025-12-20 14:34:57', 0),
(15, 'Olay Müdahale', 'Siber güvenlik olaylarına müdahale süreçleri, forensics, log analizi ve iyileştirme teknikleri.', 'https://yunuskaya.com.tr/wp-content/uploads/2025/02/siber-png.webp', '2025-12-20 14:34:57', 0),
(16, 'Bulut Güvenliği', 'AWS, Azure ve GCP güvenlik modelleri, IAM, şifreleme ve compliance konuları.', 'https://www.biltay.com.tr/wp-content/uploads/2019/04/bulut-bilisim-header.jpg', '2025-12-20 14:34:57', 0),
(17, 'Mobil Güvenlik', 'Android ve iOS güvenlik modelleri, uygulama güvenliği, jailbreak/root tespiti ve mobil tehditler.', 'https://mediatrend.mediamarkt.com.tr/wp-content/uploads/2023/03/mt_nisan_2023_mobil_cihazlar_icin_guvenlik_uygulamalari.jpg', '2025-12-20 14:34:57', 0),
(18, 'IoT Güvenliği', 'Nesnelerin İnterneti cihazlarının güvenlik açıkları, saldırı yüzeyleri ve koruma stratejileri.', 'https://csiohxuwzaiysttknbez.supabase.co/storage/v1/object/public/images/news-pictures/iot-internet-of-things-bc8b3238-35be-4b75-ad3e-3e5b73436702.jpg', '2025-12-20 14:34:57', 0),
(19, 'Sosyal Mühendislik', 'İnsan faktörünü hedef alan saldırı teknikleri, phishing, pretexting ve korunma yöntemleri.', 'https://www.systemerror.com.tr/upload/galeri/walpaper/steal-data-concept-52683-37879.jpg', '2025-12-20 14:34:57', 0),
(20, 'Güvenlik Operasyonları', 'SOC kurulumu, SIEM kullanımı, tehdit istihbaratı ve güvenlik izleme teknikleri.', NULL, '2025-12-20 14:34:57', 0);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `forum_likes`
--

CREATE TABLE `forum_likes` (
  `id` int(11) NOT NULL,
  `reply_id` int(11) NOT NULL COMMENT 'Beğenilen yorum ID',
  `user_id` int(11) NOT NULL COMMENT 'Beğenen kullanıcı ID',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Forum beğenileri tablosu';

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `forum_replies`
--

CREATE TABLE `forum_replies` (
  `id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL COMMENT 'Hangi konuya ait',
  `user_id` int(11) NOT NULL COMMENT 'Yorumu yapan kullanıcı ID',
  `parent_reply_id` int(11) DEFAULT NULL COMMENT 'Yanıtlanan yorum ID (null ise konuya direkt yanıt)',
  `content` text NOT NULL COMMENT 'Yorum içeriği',
  `is_edited` tinyint(1) DEFAULT 0 COMMENT 'Düzenlenmiş mi',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Oluşturulma tarihi',
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'Güncellenme tarihi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Forum yorumları tablosu';

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `forum_topics`
--

CREATE TABLE `forum_topics` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Konuyu açan kullanıcı ID',
  `title` varchar(255) NOT NULL COMMENT 'Konu başlığı',
  `content` text NOT NULL COMMENT 'Konu içeriği',
  `category` varchar(50) DEFAULT 'general' COMMENT 'Kategori (general, help, discussion, etc.)',
  `views` int(11) DEFAULT 0 COMMENT 'Görüntülenme sayısı',
  `is_pinned` tinyint(1) DEFAULT 0 COMMENT 'Sabitlenmiş mi (1=sabitlenmiş)',
  `is_locked` tinyint(1) DEFAULT 0 COMMENT 'Kilitli mi (1=kilitli)',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Oluşturulma tarihi',
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'Güncellenme tarihi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Forum konuları tablosu';

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `time_limit` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo döküm verisi `quizzes`
--

INSERT INTO `quizzes` (`id`, `course_id`, `title`, `description`, `time_limit`, `created_at`) VALUES
(1, 8, 'Linux\'a Giriş ve Temel Komutlar', 'Linux işletim sistemine giriş, terminal kullanımı ve temel komutlar hakkında bilgilerinizi test edin.', 30, '2025-12-20 12:27:23'),
(2, 8, 'Dosya Sistemi ve Dizin Yapısı', 'Linux dosya sistemi hiyerarşisi, dizin yapısı ve dosya işlemleri konularını kapsar.', 30, '2025-12-20 12:27:23'),
(3, 8, 'Kullanıcı ve Grup Yönetimi', 'Linux\'ta kullanıcı oluşturma, grup yönetimi ve izin sistemleri hakkında bilgilerinizi test edin.', 25, '2025-12-20 12:27:23'),
(4, 8, 'Dosya İzinleri ve Güvenlik', 'chmod, chown, chgrp komutları ve dosya izinleri konularını kapsar.', 25, '2025-12-20 12:27:23'),
(5, 8, 'Süreç Yönetimi', 'Linux\'ta süreç yönetimi, ps, top, kill komutları ve sistem kaynaklarını izleme.', 30, '2025-12-20 12:27:23'),
(6, 8, 'Paket Yönetimi', 'apt, yum, dnf gibi paket yöneticileri ve yazılım kurulumu/kaldırma işlemleri.', 30, '2025-12-20 12:27:23'),
(7, 8, 'Ağ Yönetimi', 'Linux\'ta ağ yapılandırması, IP adresi yönetimi ve temel ağ komutları.', 25, '2025-12-20 12:27:23'),
(8, 8, 'Sistem Yönetimi ve Servisler', 'systemd, servis yönetimi, log dosyaları ve sistem bakımı.', 30, '2025-12-20 12:27:23'),
(9, 9, 'Siber Güvenliğe Giriş', 'Siber güvenlik kavramları, güvenlik prensipleri, CIA üçlüsü (Gizlilik, Bütünlük, Erişilebilirlik) ve temel güvenlik terminolojisi.', 30, '2025-12-20 12:59:21'),
(10, 9, 'Tehdit Türleri ve Saldırı Vektörleri', 'Malware türleri, phishing, sosyal mühendislik, DDoS saldırıları ve diğer yaygın siber tehditler hakkında bilgilerinizi test edin.', 30, '2025-12-20 12:59:21'),
(11, 9, 'Şifreleme ve Kriptografi', 'Simetrik ve asimetrik şifreleme, hash fonksiyonları, dijital imzalar ve SSL/TLS protokolleri konularını kapsar.', 35, '2025-12-20 12:59:21'),
(12, 9, 'Ağ Güvenliği', 'Firewall, IDS/IPS, VPN, ağ segmentasyonu ve ağ güvenlik protokolleri hakkında bilgilerinizi test edin.', 30, '2025-12-20 12:59:21'),
(13, 9, 'Web Uygulama Güvenliği', 'OWASP Top 10, SQL injection, XSS, CSRF ve diğer web uygulama güvenlik açıkları konularını kapsar.', 35, '2025-12-20 12:59:21'),
(14, 9, 'Güvenlik Politikaları ve Prosedürler', 'Güvenlik politikaları oluşturma, erişim kontrolü, kimlik doğrulama ve yetkilendirme süreçleri.', 25, '2025-12-20 12:59:21'),
(15, 9, 'Olay Müdahale (Incident Response)', 'Güvenlik olaylarını tespit etme, analiz etme, müdahale etme ve iyileştirme süreçleri.', 30, '2025-12-20 12:59:21'),
(16, 9, 'Güvenlik Testleri ve Penetrasyon Testi', 'Güvenlik açığı tarama, penetrasyon testi metodolojisi, etik hackleme ve güvenlik değerlendirmeleri.', 35, '2025-12-20 12:59:21'),
(19, 10, 'Penetrasyon Testine Giriş', 'Penetrasyon testinin temellerini, etik hackleme ilkelerini ve yasal hususları öğrenin. Penetrasyon testi metodolojisini ve çerçevesini anlayın.', 120, '2025-12-20 16:39:59'),
(20, 10, 'Keşif ve Bilgi Toplama', 'Pasif ve aktif keşif tekniklerinde uzmanlaşın. OSINT araçlarını, DNS numaralandırmasını, alt alan adı keşfini ve ayak izi metodolojilerini öğrenin.', 180, '2025-12-20 16:39:59'),
(21, 10, 'Taramalar ve Numaralandırma', 'Ağ taramaları, port tarama teknikleri, hizmet numaralandırması ve güvenlik açığı tespiti konularına derinlemesine dalın. Nmap, Masscan ve daha fazlasıyla pratik yapın.', 240, '2025-12-20 16:39:59'),
(22, 10, 'Web Uygulama Güvenliği', 'Yaygın web güvenlik açıklarını tanımlayın ve sömürün: SQL injection, XSS, CSRF, SSRF, dosya yükleme hataları ve kimlik doğrulama atlatma teknikleri.', 300, '2025-12-20 16:39:59'),
(23, 10, 'Ağ Penetrasyon Testi', 'Ağ seviyesi saldırıları, ortadaki adam teknikleri, ARP sahteciliği, ağ segmentasyonu testleri ve kablosuz güvenlik değerlendirmesini öğrenin.', 240, '2025-12-20 16:39:59'),
(24, 10, 'Sistem Sömürüsü', 'Windows ve Linux sistemlerinde yetki yükseltme konusunda uzmanlaşın. Tampon taşmaları, çekirdek sömürüleri, yanlış yapılandırmalar ve sömürü sonrası teknikleri öğrenin.', 360, '2025-12-20 16:39:59'),
(25, 10, 'Şifre Saldırıları ve Kırma', 'Şifre hashleme, gökkuşağı tabloları, kaba kuvvet saldırıları, sözlük saldırıları ve şifre politikası testlerini anlayın. Hashcat ve John the Ripper ile pratik yapın.', 180, '2025-12-20 16:39:59'),
(26, 10, 'Sosyal Mühendislik ve Phishing', 'Sosyal mühendislik taktikleri, phishing kampanyaları, ön bahane oluşturma ve insan faktörü sömürüsünü öğrenin. Etik hususlar ve savunma stratejileri.', 180, '2025-12-20 16:39:59'),
(27, 10, 'Kablosuz Güvenlik Testi', 'WPA/WPA2 kırma, sahte erişim noktaları, kötü ikiz saldırıları ve kablosuz ağ güvenlik değerlendirme tekniklerinde uzmanlaşın.', 240, '2025-12-20 16:39:59'),
(28, 10, 'Mobil Uygulama Güvenliği', 'iOS ve Android için mobil uygulama güvenlik testlerini öğrenin. Tersine mühendislik, API güvenliği, veri depolama güvenlik açıkları ve mobil özel saldırıları anlayın.', 300, '2025-12-20 16:39:59'),
(29, 10, 'Bulut Güvenlik Değerlendirmesi', 'Bulut ortamlarında penetrasyon testi. AWS, Azure ve GCP güvenlik testleri, yanlış yapılandırma tespiti ve bulut özel saldırı vektörleri.', 240, '2025-12-20 16:39:59'),
(30, 10, 'Rapor Yazma ve Dokümantasyon', 'Profesyonel penetrasyon test raporları oluşturmayı, risk değerlendirmesi, düzeltme önerileri ve müşteri iletişim stratejilerini öğrenin.', 120, '2025-12-20 16:39:59'),
(31, 11, 'OWASP Top 10 Temelleri', 'OWASP Top 10 güvenlik açıklarını öğrenin', 30, '2025-12-20 14:34:57'),
(32, 11, 'SQL Injection Saldırıları', 'SQL Injection saldırılarını anlayın ve korunma yöntemlerini öğrenin', 45, '2025-12-20 14:34:57'),
(33, 11, 'Cross-Site Scripting (XSS)', 'XSS saldırı türleri ve korunma yöntemleri', 35, '2025-12-20 14:34:57'),
(34, 11, 'CSRF Saldırıları', 'Cross-Site Request Forgery saldırıları ve korunma', 30, '2025-12-20 14:34:57'),
(35, 12, 'Firewall Yapılandırması', 'Firewall kuralları ve yapılandırması', 40, '2025-12-20 14:34:57'),
(36, 12, 'IDS/IPS Sistemleri', 'Intrusion Detection ve Prevention sistemleri', 40, '2025-12-20 14:34:57'),
(37, 12, 'VPN Teknolojileri', 'Virtual Private Network protokolleri ve güvenlik', 35, '2025-12-20 14:34:57'),
(38, 13, 'Simetrik Şifreleme', 'AES, DES ve diğer simetrik şifreleme algoritmaları', 35, '2025-12-20 14:34:57'),
(39, 13, 'RSA ve ECC', 'Asimetrik şifreleme algoritmaları', 40, '2025-12-20 14:34:57'),
(40, 13, 'Hash Fonksiyonları', 'SHA-256, SHA-3 ve hash kullanım alanları', 30, '2025-12-20 14:34:57'),
(41, 14, 'Malware Türleri', 'Virüs, trojan, worm ve diğer zararlı yazılım türleri', 30, '2025-12-20 14:34:57'),
(42, 14, 'Statik Analiz Teknikleri', 'Kod analizi ve disassembly teknikleri', 45, '2025-12-20 14:34:57'),
(43, 14, 'Dinamik Analiz', 'Sandbox ortamları ve davranış analizi', 40, '2025-12-20 14:34:57'),
(44, 15, 'Olay Müdahale Süreçleri', 'NIST framework ve olay müdahale adımları', 50, '2025-12-20 14:34:57'),
(45, 15, 'Dijital Adli Bilişim', 'Forensics araçları ve kanıt toplama teknikleri', 50, '2025-12-20 14:34:57'),
(46, 15, 'Log Analizi', 'Sistem ve uygulama loglarının analizi', 40, '2025-12-20 14:34:57'),
(47, 16, 'AWS Güvenlik Temelleri', 'AWS güvenlik servisleri ve best practices', 40, '2025-12-20 14:34:57'),
(48, 16, 'Azure Güvenlik', 'Azure güvenlik servisleri ve yapılandırması', 40, '2025-12-20 14:34:57'),
(49, 16, 'Google Cloud Platform Güvenliği', 'GCP güvenlik modelleri ve best practices', 40, '2025-12-20 14:34:57'),
(50, 17, 'Android Güvenlik Mimarisi', 'Android güvenlik katmanları ve izin sistemi', 35, '2025-12-20 14:34:57'),
(51, 17, 'iOS Güvenlik Mimarisi', 'iOS güvenlik katmanları ve sandbox modeli', 35, '2025-12-20 14:34:57'),
(52, 17, 'Mobil Uygulama Güvenliği', 'API güvenliği, veri şifreleme ve reverse engineering koruması', 40, '2025-12-20 14:34:57'),
(53, 18, 'IoT Güvenlik Tehditleri', 'IoT cihazlarına yönelik saldırı türleri', 30, '2025-12-20 14:34:57'),
(54, 18, 'IoT Güvenlik Protokolleri', 'MQTT, CoAP ve diğer IoT protokollerinin güvenliği', 35, '2025-12-20 14:34:57'),
(55, 18, 'IoT Cihaz Sertleştirme', 'IoT cihazlarının güvenlik yapılandırması', 30, '2025-12-20 14:34:57'),
(56, 19, 'Phishing Saldırıları', 'Phishing teknikleri ve tespit yöntemleri', 25, '2025-12-20 14:34:57'),
(57, 19, 'Pretexting Teknikleri', 'Sosyal mühendislikte pretexting ve korunma', 30, '2025-12-20 14:34:57'),
(58, 19, 'Sosyal Mühendislikten Korunma', 'Farkındalık eğitimi ve güvenlik politikaları', 25, '2025-12-20 14:34:57'),
(59, 20, 'SIEM Sistemleri', 'Security Information and Event Management sistemleri', 45, '2025-12-20 14:34:57'),
(60, 20, 'Tehdit İstihbaratı', 'Threat intelligence kaynakları ve kullanımı', 40, '2025-12-20 14:34:57'),
(61, 20, 'SOC Operasyonları', 'Günlük SOC süreçleri ve olay yönetimi', 45, '2025-12-20 14:34:57');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `quiz_answers`
--

CREATE TABLE `quiz_answers` (
  `id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_text` varchar(255) NOT NULL,
  `is_correct` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo döküm verisi `quiz_answers`
--

INSERT INTO `quiz_answers` (`id`, `question_id`, `answer_text`, `is_correct`) VALUES
(1, 1, 'pwd', 1),
(2, 1, 'ls', 0),
(3, 1, 'cd', 0),
(4, 1, 'dir', 0),
(5, 2, 'cat', 1),
(6, 2, 'less', 1),
(7, 2, 'more', 1),
(8, 2, 'rm', 0),
(9, 2, 'mv', 0),
(10, 3, 'Doğru', 1),
(11, 3, 'Yanlış', 0),
(12, 4, 'mkdir', 1),
(13, 4, 'mkfile', 0),
(14, 4, 'create', 0),
(15, 4, 'newdir', 0),
(16, 5, 'history', 1),
(17, 5, 'hist', 0),
(18, 5, 'log', 0),
(19, 5, 'past', 0),
(20, 6, '/', 1),
(21, 6, '\\', 0),
(22, 6, 'root', 0),
(23, 6, '~', 0),
(24, 7, '/home', 1),
(25, 7, '/usr', 0),
(26, 7, '/var', 0),
(27, 7, '/etc', 0),
(28, 8, '/etc', 1),
(29, 8, '/home', 0),
(30, 8, '/tmp', 0),
(31, 8, '/usr', 0),
(32, 9, 'find', 1),
(33, 9, 'locate', 1),
(34, 9, 'grep', 0),
(35, 9, 'which', 0),
(36, 10, '.', 1),
(37, 10, '_', 0),
(38, 10, '-', 0),
(39, 10, '~', 0),
(40, 11, 'useradd', 1),
(41, 11, 'adduser', 1),
(42, 11, 'newuser', 0),
(43, 11, 'createuser', 0),
(44, 12, 'passwd', 1),
(45, 12, 'chpass', 0),
(46, 12, 'setpass', 0),
(47, 12, 'password', 0),
(48, 13, 'whoami', 1),
(49, 13, 'who', 0),
(50, 13, 'user', 0),
(51, 13, 'id', 0),
(52, 14, 'usermod -aG', 1),
(53, 14, 'addgroup', 0),
(54, 14, 'groupadd', 0),
(55, 14, 'addtogroup', 0),
(56, 15, 'Doğru', 1),
(57, 15, 'Yanlış', 0),
(58, 16, 'chmod', 1),
(59, 16, 'chown', 0),
(60, 16, 'chgrp', 0),
(61, 16, 'chperm', 0),
(62, 17, 'chown', 1),
(63, 17, 'chmod', 0),
(64, 17, 'chuser', 0),
(65, 17, 'owner', 0),
(66, 18, 'rwxr-xr-x (sahip: okuma/yazma/çalıştırma, grup: okuma/çalıştırma, diğerleri: okuma/çalıştırma)', 1),
(67, 18, 'rw-rw-rw- (herkes okuma/yazma)', 0),
(68, 18, 'r--r--r-- (herkes sadece okuma)', 0),
(69, 18, 'rwxrwxrwx (herkes tam yetki)', 0),
(70, 19, 'ls -l', 1),
(71, 19, 'ls -a', 0),
(72, 19, 'ls -h', 0),
(73, 19, 'perm', 0),
(78, 21, 'Gizlilik, Bütünlük, Erişilebilirlik', 1),
(79, 21, 'Güvenlik, Performans, Ölçeklenebilirlik', 0),
(80, 21, 'Hız, Güvenlik, Maliyet', 0),
(81, 21, 'Veri, Bilgi, Bilgi Güvenliği', 0),
(82, 22, 'Malware (Kötücül Yazılım)', 1),
(83, 22, 'Phishing (Oltalama)', 1),
(84, 22, 'DDoS Saldırıları', 1),
(85, 22, 'Güvenlik Duvarı', 0),
(86, 23, 'Doğru', 0),
(87, 23, 'Yanlış', 1),
(88, 24, 'Least Privilege (En Az Ayrıcalık)', 1),
(89, 24, 'Defense in Depth (Derinlemesine Savunma)', 0),
(90, 24, 'Separation of Duties (Görev Ayrımı)', 0),
(91, 24, 'Need to Know (Bilme İhtiyacı)', 0),
(92, 25, 'Ağ Güvenliği', 1),
(93, 25, 'Uygulama Güvenliği', 1),
(94, 25, 'Veri Güvenliği', 1),
(95, 25, 'Donanım Performansı', 0),
(96, 26, 'Kullanıcıları sahte e-postalar veya web siteleri ile kandırarak hassas bilgileri çalma', 1),
(97, 26, 'Bir sisteme fiziksel erişim sağlama', 0),
(98, 26, 'Şifreleri kaba kuvvet ile kırma', 0),
(99, 26, 'Ağ trafiğini dinleme', 0),
(100, 27, 'Virüs', 1),
(101, 27, 'Trojan (Truva Atı)', 1),
(102, 27, 'Ransomware (Fidye Yazılımı)', 1),
(103, 27, 'Firewall', 0),
(104, 28, 'Doğru', 1),
(105, 28, 'Yanlış', 0),
(106, 29, 'E-posta ile sahte kimlik kullanma', 1),
(107, 29, 'Fiziksel güç kullanma', 0),
(108, 29, 'Yazılım açıklarından yararlanma', 0),
(109, 29, 'Ağ protokollerini manipüle etme', 0),
(110, 30, 'E-posta ekleri', 1),
(111, 30, 'Zararlı web siteleri', 1),
(112, 30, 'USB cihazlar', 1),
(113, 30, 'Güvenlik duvarı', 0),
(114, 31, 'Simetrik şifrelemede aynı anahtar kullanılır, asimetrikte farklı anahtarlar kullanılır', 1),
(115, 31, 'Simetrik şifreleme daha güvenlidir', 0),
(116, 31, 'Asimetrik şifreleme daha hızlıdır', 0),
(117, 31, 'İkisi arasında fark yoktur', 0),
(118, 32, 'Tek yönlü fonksiyondur (geri çevrilemez)', 1),
(119, 32, 'Aynı girdi her zaman aynı çıktıyı verir', 1),
(120, 32, 'Küçük bir değişiklik çıktıyı tamamen değiştirir', 1),
(121, 32, 'Geri çevrilebilir', 0),
(122, 33, 'Doğru', 0),
(123, 33, 'Yanlış', 1),
(124, 34, 'Belgenin bütünlüğünü ve gönderenin kimliğini doğrulamak', 1),
(125, 34, 'Belgeyi şifrelemek', 0),
(126, 34, 'Belgeyi sıkıştırmak', 0),
(127, 34, 'Belgeyi saklamak', 0),
(128, 35, 'AES (Advanced Encryption Standard)', 1),
(129, 35, 'RSA', 1),
(130, 35, 'SHA-256', 1),
(131, 35, 'HTTP', 0),
(132, 36, 'Ağ trafiğini kontrol ederek yetkisiz erişimleri engeller', 1),
(133, 36, 'Sadece virüsleri temizler', 0),
(134, 36, 'İnternet hızını artırır', 0),
(135, 36, 'Veritabanını yedekler', 0),
(136, 37, 'Firewall', 1),
(137, 37, 'IDS/IPS', 1),
(138, 37, 'VPN', 1),
(139, 37, 'Web Tarayıcısı', 0),
(140, 38, 'Doğru', 1),
(141, 38, 'Yanlış', 0),
(142, 39, 'IDS sadece tespit eder, IPS tespit edip engeller', 1),
(143, 39, 'IDS daha güvenlidir', 0),
(144, 39, 'IPS sadece tespit eder', 0),
(145, 39, 'İkisi arasında fark yoktur', 0),
(146, 40, 'Saldırı yüzeyini azaltır', 1),
(147, 40, 'Saldırıların yayılmasını sınırlar', 1),
(148, 40, 'Ağ performansını artırır', 1),
(149, 40, 'İnternet hızını artırır', 0),
(150, 41, 'En yaygın 10 web uygulama güvenlik açığı listesi', 1),
(151, 41, 'Bir şifreleme standardı', 0),
(152, 41, 'Bir ağ protokolü', 0),
(153, 41, 'Bir güvenlik duvarı türü', 0),
(154, 42, 'SQL Injection', 1),
(155, 42, 'XSS (Cross-Site Scripting)', 1),
(156, 42, 'CSRF (Cross-Site Request Forgery)', 1),
(157, 42, 'HTTPS', 0),
(158, 43, 'Doğru', 1),
(159, 43, 'Yanlış', 0),
(160, 44, 'Zararlı JavaScript kodunu web sayfasına enjekte etme', 1),
(161, 44, 'Veritabanı sorgularını manipüle etme', 0),
(162, 44, 'Ağ trafiğini dinleme', 0),
(163, 44, 'Şifreleri kırma', 0),
(164, 45, 'Input validation (Girdi doğrulama)', 1),
(165, 45, 'Output encoding (Çıktı kodlama)', 1),
(166, 45, 'Parameterized queries (Parametreli sorgular)', 1),
(167, 45, 'Güvenlik duvarı kaldırma', 0),
(168, 46, 'Bir organizasyonun güvenlik standartlarını ve kurallarını tanımlayan belge', 1),
(169, 46, 'Bir yazılım programı', 0),
(170, 46, 'Bir donanım cihazı', 0),
(171, 46, 'Bir ağ protokolü', 0),
(172, 47, 'DAC (Discretionary Access Control)', 1),
(173, 47, 'MAC (Mandatory Access Control)', 1),
(174, 47, 'RBAC (Role-Based Access Control)', 1),
(175, 47, 'HTTP', 0),
(176, 48, 'Doğru', 0),
(177, 48, 'Yanlış', 1),
(178, 49, 'Kullanıcılara rollere göre erişim hakkı verme sistemi', 1),
(179, 49, 'Bir şifreleme yöntemi', 0),
(180, 49, 'Bir ağ protokolü', 0),
(181, 49, 'Bir güvenlik duvarı türü', 0),
(182, 50, 'Şifre politikaları', 1),
(183, 50, 'Erişim kontrolü', 1),
(184, 50, 'Olay müdahale prosedürleri', 1),
(185, 50, 'Donanım performansı', 0),
(186, 51, 'Hazırlık, Tespit, Analiz, Müdahale, İyileştirme', 1),
(187, 51, 'Sadece müdahale', 0),
(188, 51, 'Sadece tespit', 0),
(189, 51, 'Sadece analiz', 0),
(190, 52, 'Olay Müdahale Lideri', 1),
(191, 52, 'Güvenlik Analisti', 1),
(192, 52, 'Forensics Uzmanı', 1),
(193, 52, 'Web Tasarımcısı', 0),
(194, 53, 'Doğru', 0),
(195, 53, 'Yanlış', 1),
(196, 54, 'Siber saldırıları analiz etmek ve kanıt toplamak', 1),
(197, 54, 'Yazılım geliştirmek', 0),
(198, 54, 'Ağ yapılandırması yapmak', 0),
(199, 54, 'Veritabanı yönetmek', 0),
(200, 55, 'Olayı tespit etme', 1),
(201, 55, 'Olayı analiz etme', 1),
(202, 55, 'Olayı belgeleme', 1),
(203, 55, 'Olayı görmezden gelme', 0),
(204, 56, 'Sistemlerdeki güvenlik açıklarını bulmak için yapılan kontrollü saldırı testleri', 1),
(205, 56, 'Yazılım performans testi', 0),
(206, 56, 'Ağ hız testi', 0),
(207, 56, 'Donanım testi', 0),
(208, 57, 'Black Box (Siyah Kutu)', 1),
(209, 57, 'White Box (Beyaz Kutu)', 1),
(210, 57, 'Gray Box (Gri Kutu)', 1),
(211, 57, 'Red Box (Kırmızı Kutu)', 0),
(212, 58, 'Doğru', 0),
(213, 58, 'Yanlış', 1),
(214, 59, 'Sistemlerdeki güvenlik açıklarını otomatik olarak tarama ve raporlama', 1),
(215, 59, 'Saldırı yapma', 0),
(216, 59, 'Sistem yedekleme', 0),
(217, 59, 'Ağ yapılandırması', 0),
(218, 60, 'Keşif (Reconnaissance)', 1),
(219, 60, 'Sömürü (Exploitation)', 1),
(220, 60, 'Raporlama (Reporting)', 1),
(221, 60, 'Saldırıyı gizleme', 0),
(227, 65, 'Broken Access Control', 1),
(228, 65, 'SQL Injection', 0),
(229, 65, 'Cross-Site Scripting', 0),
(230, 65, 'Insecure Design', 0),
(231, 66, 'Her 3-4 yılda bir', 1),
(232, 66, 'Her yıl', 0),
(233, 66, 'Her 5 yılda bir', 0),
(234, 66, 'Her 6 ayda bir', 0),
(235, 67, 'Prepared Statements kullanmak', 1),
(236, 67, 'Input validation', 0),
(237, 67, 'WAF kullanmak', 0),
(238, 67, 'HTTPS kullanmak', 0),
(239, 68, 'Tek tırnak (\')', 1),
(240, 68, 'Çift tırnak (\")', 0),
(241, 68, 'Noktalı virgül (;)', 0),
(242, 68, 'Yıldız (*)', 0),
(243, 69, '3 (Reflected, Stored, DOM-based)', 1),
(244, 69, '2 (Reflected, Stored)', 0),
(245, 69, '4', 0),
(246, 69, '1', 0),
(247, 70, 'Input sanitization ve output encoding', 1),
(248, 70, 'Sadece HTTPS kullanmak', 0),
(249, 70, 'CAPTCHA kullanmak', 0),
(250, 70, 'Session yönetimi', 0),
(251, 71, 'CSRF Token kullanmak', 1),
(252, 71, 'HTTPS kullanmak', 0),
(253, 71, 'Input validation', 0),
(254, 71, 'Session timeout', 0),
(255, 72, 'Layer 3 ve 4', 1),
(256, 72, 'Sadece Layer 3', 0),
(257, 72, 'Layer 7', 0),
(258, 72, 'Layer 2', 0),
(259, 73, 'Varsayılan olarak tüm trafiği engelle, sadece izin verilenleri geçir', 1),
(260, 73, 'Varsayılan olarak tüm trafiği geçir', 0),
(261, 73, 'Sadece HTTP trafiğini engelle', 0),
(262, 73, 'Sadece HTTPS trafiğini geçir', 0),
(263, 74, 'IDS tespit eder, IPS tespit edip engeller', 1),
(264, 74, 'IDS engeller, IPS sadece tespit eder', 0),
(265, 74, 'Aralarında fark yok', 0),
(266, 74, 'IDS aktif, IPS pasif', 0),
(267, 75, 'OpenVPN veya WireGuard', 1),
(268, 75, 'PPTP', 0),
(269, 75, 'L2TP', 0),
(270, 75, 'IPSec', 0),
(271, 76, '256 bit', 1),
(272, 76, '128 bit', 0),
(273, 76, '512 bit', 0),
(274, 76, '64 bit', 0),
(275, 77, 'Simetrik blok şifreleme', 1),
(276, 77, 'Asimetrik şifreleme', 0),
(277, 77, 'Hash fonksiyonu', 0),
(278, 77, 'Stream cipher', 0),
(279, 78, 'Büyük sayıların çarpanlarına ayrılmasının zorluğu', 1),
(280, 78, 'Hash fonksiyonlarının tek yönlülüğü', 0),
(281, 78, 'Rastgele sayı üretimi', 0),
(282, 78, 'Simetrik anahtar güvenliği', 0),
(283, 79, 'Daha küçük anahtar boyutlarıyla aynı güvenlik seviyesi', 1),
(284, 79, 'Daha hızlı şifreleme', 0),
(285, 79, 'Daha kolay uygulanması', 0),
(286, 79, 'Daha az bellek kullanımı', 0),
(287, 80, '256 bit', 1),
(288, 80, '128 bit', 0),
(289, 80, '512 bit', 0),
(290, 80, '160 bit', 0),
(291, 81, 'Worm', 1),
(292, 81, 'Virus', 0),
(293, 81, 'Trojan', 0),
(294, 81, 'Ransomware', 0),
(295, 82, 'Dosyaları şifreleyip fidye isteyen zararlı yazılım', 1),
(296, 82, 'Bilgisayarı yavaşlatan yazılım', 0),
(297, 82, 'Kişisel bilgileri çalan yazılım', 0),
(298, 82, 'Ağ trafiğini izleyen yazılım', 0),
(299, 83, 'IDA Pro veya Ghidra', 1),
(300, 83, 'Wireshark', 0),
(301, 83, 'Nmap', 0),
(302, 83, 'Metasploit', 0),
(303, 84, 'İzole edilmiş sandbox ortamı', 1),
(304, 84, 'Üretim ortamı', 0),
(305, 84, 'Geliştirme ortamı', 0),
(306, 84, 'Test ortamı', 0),
(307, 85, '4 aşama', 1),
(308, 85, '5 aşama', 0),
(309, 85, '6 aşama', 0),
(310, 85, '3 aşama', 0),
(311, 86, 'Hazırlık, Tespit ve Analiz, Müdahale, İyileştirme', 1),
(312, 86, 'Planlama, Uygulama, Kontrol, Kapatma', 0),
(313, 86, 'Tespit, Analiz, Müdahale, Raporlama', 0),
(314, 86, 'Hazırlık, Tespit, Müdahale, Sonlandırma', 0),
(315, 87, 'Hash değerleri alınmalı ve chain of custody tutulmalı', 1),
(316, 87, 'Sadece kopya alınmalı', 0),
(317, 87, 'Orijinal dosyalar değiştirilebilir', 0),
(318, 87, 'Hash değerlerine gerek yok', 0),
(319, 88, 'Zaman damgası ve olay korelasyonu', 1),
(320, 88, 'Log dosyası boyutu', 0),
(321, 88, 'Log formatı', 0),
(322, 88, 'Log sayısı', 0),
(323, 89, 'Kullanıcılara sadece ihtiyaç duydukları izinleri vermek', 1),
(324, 89, 'Tüm kullanıcılara admin yetkisi vermek', 0),
(325, 89, 'Hiçbir kullanıcıya izin vermemek', 0),
(326, 89, 'Sadece root kullanıcıya izin vermek', 0),
(327, 90, 'Bucket policy ve public access bloklama', 1),
(328, 90, 'Sadece bucket adı', 0),
(329, 90, 'Sadece şifreleme', 0),
(330, 90, 'Sadece IAM', 0),
(331, 91, 'Azure Active Directory', 1),
(332, 91, 'Azure IAM', 0),
(333, 91, 'Azure Identity', 0),
(334, 91, 'Azure Auth', 0),
(335, 92, 'Organization, Folder, Project ve Resource seviyelerinde', 1),
(336, 92, 'Sadece Project seviyesinde', 0),
(337, 92, 'Sadece Organization seviyesinde', 0),
(338, 92, 'Sadece Resource seviyesinde', 0),
(339, 93, 'AndroidManifest.xml', 1),
(340, 93, 'build.gradle', 0),
(341, 93, 'strings.xml', 0),
(342, 93, 'config.xml', 0),
(343, 94, 'Android 6.0 (Marshmallow)', 1),
(344, 94, 'Android 5.0', 0),
(345, 94, 'Android 7.0', 0),
(346, 94, 'Android 8.0', 0),
(347, 95, 'Sandbox mekanizması ile', 1),
(348, 95, 'Sadece izinlerle', 0),
(349, 95, 'Sadece şifrelemeyle', 0),
(350, 95, 'Sadece code signing ile', 0),
(351, 96, 'Keychain/Keystore ile şifrelenmiş olarak', 1),
(352, 96, 'Düz metin olarak', 0),
(353, 96, 'SharedPreferences\'ta', 0),
(354, 96, 'Log dosyalarında', 0),
(355, 97, 'Varsayılan şifreler', 1),
(356, 97, 'Şifreleme eksikliği', 0),
(357, 97, 'Güncelleme eksikliği', 0),
(358, 97, 'Ağ izolasyonu', 0),
(359, 98, 'IP kameralar ve router\'lar', 1),
(360, 98, 'Sadece akıllı telefonlar', 0),
(361, 98, 'Sadece bilgisayarlar', 0),
(362, 98, 'Sadece sunucular', 0),
(363, 99, 'TLS/SSL ile şifreleme ve authentication', 1),
(364, 99, 'Sadece şifre ile', 0),
(365, 99, 'Güvenlik gerekmez', 0),
(366, 99, 'Sadece IP filtreleme', 0),
(367, 100, 'Varsayılan şifreleri değiştirmek', 1),
(368, 100, 'Cihazı kapatmak', 0),
(369, 100, 'Ağdan ayırmak', 0),
(370, 100, 'Firmware güncellemek', 0),
(371, 101, 'E-posta gönderen adresini ve linkleri kontrol etmek', 1),
(372, 101, 'E-postayı hemen açmak', 0),
(373, 101, 'Tüm linklere tıklamak', 0),
(374, 101, 'Şifreleri paylaşmak', 0),
(375, 102, 'Belirli bir kişi veya organizasyona yönelik hedefli phishing', 1),
(376, 102, 'Toplu e-posta gönderimi', 0),
(377, 102, 'Sosyal medya saldırısı', 0),
(378, 102, 'Telefon ile yapılan saldırı', 0),
(379, 103, 'Sahte bir senaryo oluşturarak bilgi toplama', 1),
(380, 103, 'E-posta gönderme', 0),
(381, 103, 'Şifre kırma', 0),
(382, 103, 'Ağ dinleme', 0),
(383, 104, 'Kullanıcı farkındalık eğitimi ve güvenlik politikaları', 1),
(384, 104, 'Sadece teknik çözümler', 0),
(385, 104, 'Sadece şifreler', 0),
(386, 104, 'Sadece firewall', 0),
(387, 105, 'Güvenlik olaylarını toplamak, analiz etmek ve raporlamak', 1),
(388, 105, 'Sadece log tutmak', 0),
(389, 105, 'Sadece uyarı vermek', 0),
(390, 105, 'Sadece rapor oluşturmak', 0),
(391, 106, 'Syslog', 1),
(392, 106, 'JSON', 0),
(393, 106, 'XML', 0),
(394, 106, 'CSV', 0),
(395, 107, 'Gelecekteki saldırıları önceden tahmin etmek ve hazırlanmak', 1),
(396, 107, 'Sadece geçmiş saldırıları analiz etmek', 0),
(397, 107, 'Sadece log tutmak', 0),
(398, 107, 'Sadece rapor oluşturmak', 0),
(399, 108, 'Tehdit seviyesi, etki ve aciliyet faktörlerine göre', 1),
(400, 108, 'Sadece zaman faktörüne göre', 0),
(401, 108, 'Rastgele', 0),
(402, 108, 'Sadece kaynak faktörüne göre', 0);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `type` enum('single','multiple','true_false','write') DEFAULT 'single',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo döküm verisi `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question_text`, `type`, `created_at`) VALUES
(1, 1, 'Linux\'ta mevcut dizini görmek için hangi komut kullanılır?', 'single', '2025-12-20 12:27:23'),
(2, 1, 'Dosya içeriğini görüntülemek için hangi komutlar kullanılabilir? (Birden fazla seçenek)', 'multiple', '2025-12-20 12:27:23'),
(3, 1, 'Linux açık kaynak kodlu bir işletim sistemidir.', 'true_false', '2025-12-20 12:27:23'),
(4, 1, 'Bir dizin oluşturmak için hangi komut kullanılır?', 'single', '2025-12-20 12:27:23'),
(5, 1, 'Linux\'ta komut geçmişini görüntülemek için hangi komut kullanılır?', 'single', '2025-12-20 12:27:23'),
(6, 2, 'Linux dosya sisteminde kök dizin hangi sembol ile temsil edilir?', 'single', '2025-12-20 12:27:23'),
(7, 2, 'Kullanıcı ev dizinleri genellikle hangi dizinde bulunur?', 'single', '2025-12-20 12:27:23'),
(8, 2, 'Sistem yapılandırma dosyaları genellikle hangi dizinde bulunur?', 'single', '2025-12-20 12:27:23'),
(9, 2, 'Dosya arama yapmak için hangi komutlar kullanılabilir? (Birden fazla seçenek)', 'multiple', '2025-12-20 12:27:23'),
(10, 2, 'Linux\'ta gizli dosyalar hangi karakter ile başlar?', 'single', '2025-12-20 12:27:23'),
(11, 3, 'Yeni bir kullanıcı oluşturmak için hangi komut kullanılır?', 'single', '2025-12-20 12:27:23'),
(12, 3, 'Kullanıcı şifresini değiştirmek için hangi komut kullanılır?', 'single', '2025-12-20 12:27:23'),
(13, 3, 'Mevcut kullanıcıyı görmek için hangi komut kullanılır?', 'single', '2025-12-20 12:27:23'),
(14, 3, 'Bir kullanıcıyı gruba eklemek için hangi komut kullanılır?', 'single', '2025-12-20 12:27:23'),
(15, 3, 'Root kullanıcısı sistemde en yüksek yetkilere sahiptir.', 'true_false', '2025-12-20 12:27:23'),
(16, 4, 'Dosya izinlerini değiştirmek için hangi komut kullanılır?', 'single', '2025-12-20 12:27:23'),
(17, 4, 'Dosya sahibini değiştirmek için hangi komut kullanılır?', 'single', '2025-12-20 12:27:23'),
(18, 4, '755 izinleri ne anlama gelir?', 'single', '2025-12-20 12:27:23'),
(19, 4, 'Dosya izinlerini görüntülemek için hangi komut kullanılır?', 'single', '2025-12-20 12:27:23'),
(20, 4, 'Sembolik izin gösterimi kullanıldığında \"rwx\" ne anlama gelir?', 'single', '2025-12-20 12:27:23'),
(21, 9, 'CIA üçlüsü nedir?', '', '2025-12-20 12:59:21'),
(22, 9, 'Aşağıdakilerden hangisi siber güvenlik tehditlerinden biridir?', '', '2025-12-20 12:59:21'),
(23, 9, 'Güvenlik duvarı (Firewall) sadece gelen trafiği kontrol eder.', 'true_false', '2025-12-20 12:59:21'),
(24, 9, 'Hangi güvenlik prensibi, kullanıcılara sadece işlerini yapmak için gereken minimum erişim hakkını verir?', '', '2025-12-20 12:59:21'),
(25, 9, 'Aşağıdakilerden hangileri siber güvenlik kapsamına girer?', '', '2025-12-20 12:59:21'),
(26, 10, 'Phishing saldırısı nedir?', '', '2025-12-20 12:59:21'),
(27, 10, 'Aşağıdakilerden hangileri malware türleridir?', '', '2025-12-20 12:59:21'),
(28, 10, 'DDoS saldırısı, bir sistemi aşırı yükleyerek hizmeti kesintiye uğratmayı amaçlar.', 'true_false', '2025-12-20 12:59:21'),
(29, 10, 'Sosyal mühendislik saldırılarında en yaygın kullanılan yöntem nedir?', '', '2025-12-20 12:59:21'),
(30, 10, 'Aşağıdakilerden hangileri saldırı vektörleridir?', '', '2025-12-20 12:59:21'),
(31, 11, 'Simetrik şifreleme ile asimetrik şifreleme arasındaki temel fark nedir?', '', '2025-12-20 12:59:21'),
(32, 11, 'Aşağıdakilerden hangileri hash fonksiyonlarının özellikleridir?', '', '2025-12-20 12:59:21'),
(33, 11, 'SSL/TLS protokolü sadece web tarayıcıları için kullanılır.', 'true_false', '2025-12-20 12:59:21'),
(34, 11, 'Dijital imza ne için kullanılır?', '', '2025-12-20 12:59:21'),
(35, 11, 'Aşağıdakilerden hangileri kriptografik algoritmalardır?', '', '2025-12-20 12:59:21'),
(36, 12, 'Firewall (Güvenlik Duvarı) ne işe yarar?', '', '2025-12-20 12:59:21'),
(37, 12, 'Aşağıdakilerden hangileri ağ güvenlik araçlarıdır?', '', '2025-12-20 12:59:21'),
(38, 12, 'VPN, internet trafiğini şifreleyerek güvenli bir tünel oluşturur.', 'true_false', '2025-12-20 12:59:21'),
(39, 12, 'IDS ve IPS arasındaki fark nedir?', '', '2025-12-20 12:59:21'),
(40, 12, 'Ağ segmentasyonu neden önemlidir?', '', '2025-12-20 12:59:21'),
(41, 13, 'OWASP Top 10 nedir?', '', '2025-12-20 12:59:21'),
(42, 13, 'Aşağıdakilerden hangileri web uygulama güvenlik açıklarıdır?', '', '2025-12-20 12:59:21'),
(43, 13, 'SQL Injection saldırısı, veritabanı sorgularını manipüle ederek veri çalmayı amaçlar.', 'true_false', '2025-12-20 12:59:21'),
(44, 13, 'XSS (Cross-Site Scripting) saldırısı nedir?', '', '2025-12-20 12:59:21'),
(45, 13, 'Web uygulama güvenliğini sağlamak için hangi yöntemler kullanılabilir?', '', '2025-12-20 12:59:21'),
(46, 14, 'Güvenlik politikası nedir?', '', '2025-12-20 12:59:21'),
(47, 14, 'Erişim kontrolü modelleri nelerdir?', '', '2025-12-20 12:59:21'),
(48, 14, 'İki faktörlü kimlik doğrulama (2FA) sadece şifre kullanır.', 'true_false', '2025-12-20 12:59:21'),
(49, 14, 'RBAC (Role-Based Access Control) nedir?', '', '2025-12-20 12:59:21'),
(50, 14, 'Güvenlik politikaları hangi konuları kapsamalıdır?', '', '2025-12-20 12:59:21'),
(51, 15, 'Olay müdahale sürecinin aşamaları nelerdir?', '', '2025-12-20 12:59:21'),
(52, 15, 'Olay müdahale ekibinde hangi roller bulunmalıdır?', '', '2025-12-20 12:59:21'),
(53, 15, 'Olay müdahale sürecinde ilk adım, saldırıyı durdurmaktır.', 'true_false', '2025-12-20 12:59:21'),
(54, 15, 'Forensics (Adli Bilişim) nedir?', '', '2025-12-20 12:59:21'),
(55, 15, 'Olay müdahale sürecinde hangi adımlar önemlidir?', '', '2025-12-20 12:59:21'),
(56, 16, 'Penetrasyon testi nedir?', '', '2025-12-20 12:59:22'),
(57, 16, 'Penetrasyon testi türleri nelerdir?', '', '2025-12-20 12:59:22'),
(58, 16, 'Etik hackleme, yasal izin olmadan sistemlere erişmeyi içerir.', 'true_false', '2025-12-20 12:59:22'),
(59, 16, 'Vulnerability Assessment (Güvenlik Açığı Değerlendirmesi) nedir?', '', '2025-12-20 12:59:22'),
(60, 16, 'Penetrasyon testi sürecinde hangi aşamalar bulunur?', '', '2025-12-20 12:59:22'),
(65, 31, 'OWASP Top 10 listesinde en kritik güvenlik açığı hangisidir?', 'single', '2025-12-20 14:34:57'),
(66, 31, 'OWASP Top 10 hangi sıklıkla güncellenir?', 'single', '2025-12-20 14:34:57'),
(67, 32, 'SQL Injection saldırılarını önlemenin en etkili yöntemi nedir?', 'single', '2025-12-20 14:34:57'),
(68, 32, 'SQL Injection saldırısında kullanılan en yaygın karakter nedir?', 'single', '2025-12-20 14:34:57'),
(69, 33, 'XSS saldırılarının kaç ana türü vardır?', 'single', '2025-12-20 14:34:57'),
(70, 33, 'XSS saldırılarından korunmak için en etkili yöntem nedir?', 'single', '2025-12-20 14:34:57'),
(71, 34, 'CSRF saldırılarını önlemek için en yaygın yöntem nedir?', 'single', '2025-12-20 14:34:57'),
(72, 35, 'Stateful firewall hangi OSI katmanında çalışır?', 'single', '2025-12-20 14:34:57'),
(73, 35, 'Firewall\'da default deny policy nedir?', 'single', '2025-12-20 14:34:57'),
(74, 36, 'IDS ve IPS arasındaki temel fark nedir?', 'single', '2025-12-20 14:34:57'),
(75, 37, 'En güvenli VPN protokolü hangisidir?', 'single', '2025-12-20 14:34:57'),
(76, 38, 'AES-256 kaç bit anahtar kullanır?', 'single', '2025-12-20 14:34:57'),
(77, 38, 'AES hangi tür şifreleme algoritmasıdır?', 'single', '2025-12-20 14:34:57'),
(78, 39, 'RSA algoritmasının güvenliği neye dayanır?', 'single', '2025-12-20 14:34:57'),
(79, 39, 'ECC (Elliptic Curve Cryptography) RSA\'ya göre avantajı nedir?', 'single', '2025-12-20 14:34:57'),
(80, 40, 'SHA-256 kaç bit hash üretir?', 'single', '2025-12-20 14:34:57'),
(81, 41, 'Kendini kopyalayabilen ve ağ üzerinden yayılan zararlı yazılım türü nedir?', 'single', '2025-12-20 14:34:57'),
(82, 41, 'Ransomware nedir?', 'single', '2025-12-20 14:34:57'),
(83, 42, 'Statik analizde en yaygın kullanılan araç nedir?', 'single', '2025-12-20 14:34:57'),
(84, 43, 'Dinamik analiz için en uygun ortam nedir?', 'single', '2025-12-20 14:34:57'),
(85, 44, 'NIST olay müdahale çerçevesinde kaç aşama vardır?', 'single', '2025-12-20 14:34:57'),
(86, 44, 'NIST framework\'ün 4 aşaması nedir?', 'single', '2025-12-20 14:34:57'),
(87, 45, 'Dijital kanıtların bütünlüğünü korumak için ne yapılmalıdır?', 'single', '2025-12-20 14:34:57'),
(88, 46, 'Log analizinde en önemli faktör nedir?', 'single', '2025-12-20 14:34:57'),
(89, 47, 'AWS IAM\'de en az ayrıcalık prensibi nedir?', 'single', '2025-12-20 14:34:57'),
(90, 47, 'AWS S3 bucket güvenliği için en önemli ayar nedir?', 'single', '2025-12-20 14:34:57'),
(91, 48, 'Azure\'da kimlik yönetimi için hangi servis kullanılır?', 'single', '2025-12-20 14:34:57'),
(92, 49, 'GCP\'de IAM rolleri hangi seviyede tanımlanabilir?', 'single', '2025-12-20 14:34:57'),
(93, 50, 'Android\'de uygulama izinleri hangi dosyada tanımlanır?', 'single', '2025-12-20 14:34:57'),
(94, 50, 'Android\'de runtime izinleri hangi versiyondan itibaren kullanılmaya başlandı?', 'single', '2025-12-20 14:34:57'),
(95, 51, 'iOS\'da uygulama izolasyonu nasıl sağlanır?', 'single', '2025-12-20 14:34:57'),
(96, 52, 'Mobil uygulamalarda hassas veriler nasıl saklanmalıdır?', 'single', '2025-12-20 14:34:57'),
(97, 53, 'IoT cihazlarında en yaygın güvenlik açığı nedir?', 'single', '2025-12-20 14:34:57'),
(98, 53, 'Mirai botnet hangi tür IoT cihazlarını hedef almıştır?', 'single', '2025-12-20 14:34:57'),
(99, 54, 'MQTT protokolünde güvenlik nasıl sağlanır?', 'single', '2025-12-20 14:34:57'),
(100, 55, 'IoT cihazlarını güvenli hale getirmek için ilk adım nedir?', 'single', '2025-12-20 14:34:57'),
(101, 56, 'Phishing saldırılarını tespit etmenin en iyi yolu nedir?', 'single', '2025-12-20 14:34:57'),
(102, 56, 'Spear phishing nedir?', 'single', '2025-12-20 14:34:57'),
(103, 57, 'Pretexting nedir?', 'single', '2025-12-20 14:34:57'),
(104, 58, 'Sosyal mühendislik saldırılarına karşı en etkili korunma yöntemi nedir?', 'single', '2025-12-20 14:34:57'),
(105, 59, 'SIEM sistemlerinin temel amacı nedir?', 'single', '2025-12-20 14:34:57'),
(106, 59, 'SIEM sistemlerinde en yaygın kullanılan log formatı nedir?', 'single', '2025-12-20 14:34:57'),
(107, 60, 'Threat intelligence\'ın temel amacı nedir?', 'single', '2025-12-20 14:34:57'),
(108, 61, 'SOC\'ta olay önceliklendirme nasıl yapılır?', 'single', '2025-12-20 14:34:57');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `users`
--

CREATE TABLE `users` (
  `ID` int(11) NOT NULL COMMENT 'primary key, AUTO_INCREMENT',
  `uname` varchar(50) NOT NULL COMMENT 'name',
  `usurname` varchar(50) NOT NULL COMMENT 'surname',
  `unickname` varchar(50) NOT NULL COMMENT 'nickname',
  `umail` varchar(100) NOT NULL COMMENT 'mail',
  `upasswd` varchar(255) NOT NULL COMMENT 'password',
  `urole` enum('user','admin','moderator','') NOT NULL DEFAULT 'user' COMMENT 'Role',
  `uis_active` tinyint(4) NOT NULL DEFAULT 0,
  `ulast_login` datetime NOT NULL,
  `ucreated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='where user information is kept';

--
-- Tablo döküm verisi `users`
--

INSERT INTO `users` (`ID`, `uname`, `usurname`, `unickname`, `umail`, `upasswd`, `urole`, `uis_active`, `ulast_login`, `ucreated_at`) VALUES
(6, '-', '-', 'admin', '-@gmail.com', '25f43b1486ad95a1398e3eeb3d83bc4010015fcc9bedb35b432e00298d5021f7', 'admin', 0, '2025-12-20 20:20:11', '0000-00-00 00:00:00'),
(9, 'İremnaz', 'kılıçer', 'mabes35', 'iremnazkilicer1905@gmail.com', '253f8a5862bdd480b5d9e6dbd212386e9e55a9ff7e45152bf200a70f9199467c', 'admin', 0, '2025-12-20 19:34:46', '0000-00-00 00:00:00'),
(11, 'Abdullah', 'Deliahmetoğlu', 'abdush', 'abdullahdeliahmetoglu123@gmail.com', 'f0994408cf68c5cfa453d9a491496a79f7811d5db86f70bcddaefafd14a114df', 'admin', 0, '2025-12-20 19:53:50', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `user_courses`
--

CREATE TABLE `user_courses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Kullanıcı ID',
  `course_id` int(11) NOT NULL COMMENT 'Kurs ID',
  `status` enum('enrolled','in_progress','completed','paused') NOT NULL DEFAULT 'enrolled' COMMENT 'Kurs durumu: enrolled=kayıt olundu, in_progress=devam ediyor, completed=tamamlandı, paused=durduruldu',
  `enrolled_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Kursa kayıt olma zamanı',
  `started_at` datetime DEFAULT NULL COMMENT 'İlk quiz/modüle başlama zamanı',
  `completed_at` datetime DEFAULT NULL COMMENT 'Kursu tamamlama zamanı',
  `last_accessed_at` datetime DEFAULT NULL COMMENT 'Son erişim zamanı (kurs detay sayfası veya quiz açıldığında güncellenir)',
  `progress_percentage` int(11) DEFAULT 0 COMMENT 'İlerleme yüzdesi (0-100) - cache için, gerçek değer user_quiz_results tablosundan hesaplanabilir',
  `total_time_spent` int(11) DEFAULT 0 COMMENT 'Toplam harcanan süre (dakika cinsinden)',
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'Son güncelleme zamanı'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Kullanıcı kurs kayıtları ve ilerleme takibi';

--
-- Tablo döküm verisi `user_courses`
--

INSERT INTO `user_courses` (`id`, `user_id`, `course_id`, `status`, `enrolled_at`, `started_at`, `completed_at`, `last_accessed_at`, `progress_percentage`, `total_time_spent`, `updated_at`) VALUES
(1, 6, 9, 'completed', '2025-12-20 13:29:17', '2025-12-20 13:29:19', '2025-12-20 13:44:21', '2025-12-20 19:17:55', 100, 0, '2025-12-20 19:17:55'),
(2, 6, 8, 'in_progress', '2025-12-20 14:04:21', '2025-12-20 14:31:25', NULL, '2025-12-20 17:23:06', 25, 0, '2025-12-20 17:23:06'),
(3, 6, 7, 'enrolled', '2025-12-20 14:04:25', NULL, NULL, '2025-12-20 17:23:04', 0, 0, '2025-12-20 17:23:04'),
(4, 6, 10, 'enrolled', '2025-12-20 16:57:08', NULL, NULL, '2025-12-20 19:22:16', 0, 0, '2025-12-20 19:22:16'),
(5, 6, 12, 'in_progress', '2025-12-20 19:17:44', '2025-12-20 19:25:17', NULL, '2025-12-20 19:41:52', 67, 0, '2025-12-20 19:41:52'),
(6, 6, 20, 'enrolled', '2025-12-20 19:25:29', NULL, NULL, '2025-12-20 19:25:29', 0, 0, NULL),
(7, 6, 11, 'enrolled', '2025-12-20 19:25:33', NULL, NULL, '2025-12-20 19:25:33', 0, 0, NULL),
(8, 6, 13, 'in_progress', '2025-12-20 19:34:00', '2025-12-20 19:34:01', NULL, '2025-12-20 19:34:09', 33, 0, '2025-12-20 19:34:09'),
(9, 11, 8, 'enrolled', '2025-12-20 19:53:29', NULL, NULL, '2025-12-20 19:53:29', 0, 0, NULL);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `user_quiz_answers`
--

CREATE TABLE `user_quiz_answers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_id` int(11) NOT NULL,
  `is_correct` tinyint(1) DEFAULT 0,
  `answered_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo döküm verisi `user_quiz_answers`
--

INSERT INTO `user_quiz_answers` (`id`, `user_id`, `question_id`, `answer_id`, `is_correct`, `answered_at`) VALUES
(16, 6, 26, 96, 1, '2025-12-20 13:40:01'),
(17, 6, 27, 101, 1, '2025-12-20 13:40:01'),
(18, 6, 28, 105, 0, '2025-12-20 13:40:01'),
(19, 6, 29, 107, 0, '2025-12-20 13:40:01'),
(20, 6, 30, 111, 1, '2025-12-20 13:40:01'),
(26, 6, 31, 114, 1, '2025-12-20 13:41:27'),
(27, 6, 32, 120, 1, '2025-12-20 13:41:27'),
(28, 6, 33, 122, 0, '2025-12-20 13:41:27'),
(29, 6, 34, 125, 0, '2025-12-20 13:41:27'),
(30, 6, 35, 131, 0, '2025-12-20 13:41:27'),
(31, 6, 56, 205, 0, '2025-12-20 13:42:53'),
(32, 6, 57, 210, 1, '2025-12-20 13:42:53'),
(33, 6, 58, 213, 1, '2025-12-20 13:42:53'),
(34, 6, 59, 216, 0, '2025-12-20 13:42:53'),
(35, 6, 60, 220, 1, '2025-12-20 13:42:53'),
(36, 6, 51, 186, 1, '2025-12-20 13:43:03'),
(37, 6, 52, 191, 1, '2025-12-20 13:43:03'),
(38, 6, 53, 194, 0, '2025-12-20 13:43:03'),
(39, 6, 54, 197, 0, '2025-12-20 13:43:03'),
(40, 6, 55, 202, 1, '2025-12-20 13:43:03'),
(41, 6, 46, 168, 1, '2025-12-20 13:43:11'),
(42, 6, 47, 175, 0, '2025-12-20 13:43:11'),
(43, 6, 48, 177, 1, '2025-12-20 13:43:11'),
(44, 6, 49, 179, 0, '2025-12-20 13:43:11'),
(45, 6, 50, 184, 1, '2025-12-20 13:43:11'),
(46, 6, 41, 150, 1, '2025-12-20 13:43:53'),
(47, 6, 42, 157, 0, '2025-12-20 13:43:53'),
(48, 6, 43, 158, 1, '2025-12-20 13:43:53'),
(49, 6, 44, 162, 0, '2025-12-20 13:43:53'),
(50, 6, 45, 166, 1, '2025-12-20 13:43:53'),
(51, 6, 36, 132, 1, '2025-12-20 13:44:21'),
(52, 6, 37, 138, 1, '2025-12-20 13:44:21'),
(53, 6, 38, 141, 0, '2025-12-20 13:44:21'),
(54, 6, 39, 143, 0, '2025-12-20 13:44:21'),
(55, 6, 40, 148, 1, '2025-12-20 13:44:21'),
(71, 6, 21, 79, 0, '2025-12-20 14:28:43'),
(72, 6, 22, 83, 1, '2025-12-20 14:28:43'),
(73, 6, 23, 87, 1, '2025-12-20 14:28:43'),
(74, 6, 24, 89, 0, '2025-12-20 14:28:43'),
(75, 6, 25, 93, 1, '2025-12-20 14:28:43'),
(76, 6, 1, 1, 1, '2025-12-20 14:31:48'),
(77, 6, 2, 5, 1, '2025-12-20 14:31:48'),
(78, 6, 3, 10, 1, '2025-12-20 14:31:48'),
(79, 6, 4, 12, 1, '2025-12-20 14:31:48'),
(80, 6, 5, 16, 1, '2025-12-20 14:31:48'),
(83, 6, 6, 20, 1, '2025-12-20 16:21:50'),
(84, 6, 7, 25, 0, '2025-12-20 16:21:50'),
(85, 6, 8, 29, 0, '2025-12-20 16:21:50'),
(86, 6, 9, 34, 0, '2025-12-20 16:21:50'),
(87, 6, 10, 37, 0, '2025-12-20 16:21:50'),
(88, 6, 72, 255, 1, '2025-12-20 19:25:19'),
(89, 6, 73, 261, 0, '2025-12-20 19:25:19'),
(90, 6, 75, 269, 0, '2025-12-20 19:25:25'),
(91, 6, 76, 273, 0, '2025-12-20 19:34:08'),
(92, 6, 77, 277, 0, '2025-12-20 19:34:08');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `user_quiz_results`
--

CREATE TABLE `user_quiz_results` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `score` int(11) DEFAULT 0,
  `correct_count` int(11) DEFAULT 0,
  `incorrect_count` int(11) DEFAULT 0,
  `completed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo döküm verisi `user_quiz_results`
--

INSERT INTO `user_quiz_results` (`id`, `user_id`, `quiz_id`, `score`, `correct_count`, `incorrect_count`, `completed_at`) VALUES
(1, 6, 9, 60, 3, 2, '2025-12-20 14:28:43'),
(2, 6, 10, 60, 3, 2, '2025-12-20 13:40:01'),
(3, 6, 13, 60, 3, 2, '2025-12-20 13:43:53'),
(4, 6, 11, 40, 2, 3, '2025-12-20 13:41:27'),
(5, 6, 16, 60, 3, 2, '2025-12-20 13:42:53'),
(6, 6, 15, 60, 3, 2, '2025-12-20 13:43:03'),
(7, 6, 14, 60, 3, 2, '2025-12-20 13:43:11'),
(8, 6, 12, 60, 3, 2, '2025-12-20 13:44:21'),
(9, 6, 1, 100, 5, 0, '2025-12-20 14:31:48'),
(11, 6, 2, 20, 1, 4, '2025-12-20 16:21:50'),
(12, 6, 35, 50, 1, 1, '2025-12-20 19:25:19'),
(13, 6, 37, 0, 0, 1, '2025-12-20 19:25:25'),
(14, 6, 38, 0, 0, 2, '2025-12-20 19:34:08');

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `title` (`title`);

--
-- Tablo için indeksler `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Tablo için indeksler `forum_likes`
--
ALTER TABLE `forum_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`reply_id`,`user_id`),
  ADD KEY `idx_reply_id` (`reply_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Tablo için indeksler `forum_replies`
--
ALTER TABLE `forum_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_topic_id` (`topic_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_parent_reply_id` (`parent_reply_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Tablo için indeksler `forum_topics`
--
ALTER TABLE `forum_topics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Tablo için indeksler `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_quiz_course` (`course_id`);

--
-- Tablo için indeksler `quiz_answers`
--
ALTER TABLE `quiz_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_answer_question` (`question_id`);

--
-- Tablo için indeksler `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_question_quiz` (`quiz_id`);

--
-- Tablo için indeksler `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `unickname` (`unickname`),
  ADD UNIQUE KEY `umail` (`umail`) USING BTREE;

--
-- Tablo için indeksler `user_courses`
--
ALTER TABLE `user_courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_course` (`user_id`,`course_id`),
  ADD KEY `fk_usercourse_user` (`user_id`),
  ADD KEY `fk_usercourse_course` (`course_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_enrolled_at` (`enrolled_at`),
  ADD KEY `idx_last_accessed` (`last_accessed_at`);

--
-- Tablo için indeksler `user_quiz_answers`
--
ALTER TABLE `user_quiz_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_useranswer_user` (`user_id`),
  ADD KEY `fk_useranswer_question` (`question_id`),
  ADD KEY `fk_useranswer_answer` (`answer_id`);

--
-- Tablo için indeksler `user_quiz_results`
--
ALTER TABLE `user_quiz_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_result_user` (`user_id`),
  ADD KEY `fk_result_quiz` (`quiz_id`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Tablo için AUTO_INCREMENT değeri `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Tablo için AUTO_INCREMENT değeri `forum_likes`
--
ALTER TABLE `forum_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `forum_replies`
--
ALTER TABLE `forum_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `forum_topics`
--
ALTER TABLE `forum_topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- Tablo için AUTO_INCREMENT değeri `quiz_answers`
--
ALTER TABLE `quiz_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=403;

--
-- Tablo için AUTO_INCREMENT değeri `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- Tablo için AUTO_INCREMENT değeri `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT COMMENT 'primary key, AUTO_INCREMENT', AUTO_INCREMENT=12;

--
-- Tablo için AUTO_INCREMENT değeri `user_courses`
--
ALTER TABLE `user_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Tablo için AUTO_INCREMENT değeri `user_quiz_answers`
--
ALTER TABLE `user_quiz_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- Tablo için AUTO_INCREMENT değeri `user_quiz_results`
--
ALTER TABLE `user_quiz_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `forum_likes`
--
ALTER TABLE `forum_likes`
  ADD CONSTRAINT `fk_forum_like_reply` FOREIGN KEY (`reply_id`) REFERENCES `forum_replies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_forum_like_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`ID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `forum_replies`
--
ALTER TABLE `forum_replies`
  ADD CONSTRAINT `fk_forum_reply_parent` FOREIGN KEY (`parent_reply_id`) REFERENCES `forum_replies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_forum_reply_topic` FOREIGN KEY (`topic_id`) REFERENCES `forum_topics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_forum_reply_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`ID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `forum_topics`
--
ALTER TABLE `forum_topics`
  ADD CONSTRAINT `fk_forum_topic_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`ID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `fk_quiz_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `quiz_answers`
--
ALTER TABLE `quiz_answers`
  ADD CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `fk_question_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `user_courses`
--
ALTER TABLE `user_courses`
  ADD CONSTRAINT `fk_usercourse_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_usercourse_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`ID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `user_quiz_answers`
--
ALTER TABLE `user_quiz_answers`
  ADD CONSTRAINT `fk_useranswer_answer` FOREIGN KEY (`answer_id`) REFERENCES `quiz_answers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_useranswer_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_useranswer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`ID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `user_quiz_results`
--
ALTER TABLE `user_quiz_results`
  ADD CONSTRAINT `fk_result_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_result_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`ID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
