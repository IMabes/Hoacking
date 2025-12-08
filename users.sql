-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1
-- Üretim Zamanı: 06 Ara 2025, 07:44:23
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
-- Tablo için tablo yapısı `users`
--

CREATE TABLE `users` (
  `ID` int(11) NOT NULL AUTO_INCREMENT COMMENT 'primary key, AUTO_INCREMENT',
  `uname` varchar(100) NOT NULL COMMENT 'User first name',
  `usurname` varchar(100) NOT NULL COMMENT 'User last name/surname',
  `unickname` varchar(50) NOT NULL COMMENT 'User nickname/username',
  `umail` varchar(255) NOT NULL COMMENT 'User email address',
  `upasswd` varchar(255) NOT NULL COMMENT 'User password (hashed)',
  `urole` enum('user','admin') NOT NULL DEFAULT 'user' COMMENT 'User role',
  `uis_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'User active status (1=active, 0=inactive)',
  `ulast_login` datetime DEFAULT NULL COMMENT 'Last login timestamp',
  `ucreated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `unickname` (`unickname`),
  UNIQUE KEY `umail` (`umail`),
  KEY `idx_urole` (`urole`),
  KEY `idx_uis_active` (`uis_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User accounts table';

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `unickname` (`unickname`),
  ADD UNIQUE KEY `umail` (`umail`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT COMMENT 'primary key, AUTO_INCREMENT';
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
