-- ============================================
-- SIM KIA Klinik Asy-Syifa Husada
-- Database MySQL untuk phpMyAdmin
-- Versi: 1.0
-- ============================================

-- Buat Database
CREATE DATABASE IF NOT EXISTS sim_kia_asyifa
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sim_kia_asyifa;

-- ============================================
-- TABEL PASIEN
-- ============================================
CREATE TABLE IF NOT EXISTS pasien (
    id VARCHAR(50) PRIMARY KEY,
    no_rm VARCHAR(10) NOT NULL UNIQUE COMMENT 'Format: 00-00-01',
    nik VARCHAR(16) NOT NULL UNIQUE COMMENT 'Nomor Induk Kependudukan',
    nama_lengkap VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin ENUM('Laki-laki', 'Perempuan', 'Lainnya') NOT NULL,
    alamat TEXT NOT NULL,
    provinsi VARCHAR(50) NOT NULL,
    kode_pos VARCHAR(10),
    no_telepon VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL COMMENT 'Opsional',
    golongan_darah ENUM('A', 'B', 'AB', 'O', 'Tidak Tahu') DEFAULT 'Tidak Tahu',
    status_pernikahan ENUM('Belum Menikah', 'Menikah', 'Cerai') DEFAULT 'Belum Menikah',
    pekerjaan VARCHAR(100),
    status ENUM('Aktif', 'Sembuh', 'Kronis', 'Meninggal') DEFAULT 'Aktif',
    tanggal_daftar DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_no_rm (no_rm),
    INDEX idx_nik (nik),
    INDEX idx_nama (nama_lengkap),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABEL DOKTER
-- ============================================
CREATE TABLE IF NOT EXISTS dokter (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    spesialisasi VARCHAR(100) DEFAULT 'Umum',
    no_telepon VARCHAR(20),
    jadwal_praktik VARCHAR(255),
    status ENUM('Aktif', 'Tidak Aktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Data Dokter
INSERT INTO dokter (nama, spesialisasi, status) VALUES
('dr. Sad Omega Kencanawaty', 'Umum', 'Aktif'),
('dr. Haryo Hadiatho', 'Umum', 'Aktif'),
('dr. Reny Endyawati', 'Umum', 'Aktif'),
('dr. Debora Singgih', 'Umum', 'Aktif'),
('dr. Sella Dumaika Desmonda', 'Umum', 'Aktif');

-- ============================================
-- TABEL JENIS LAYANAN KIA
-- ============================================
CREATE TABLE IF NOT EXISTS jenis_layanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    status ENUM('Aktif', 'Tidak Aktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Jenis Layanan KIA
INSERT INTO jenis_layanan (kode, nama) VALUES
('konsultasi', 'Konsultasi Umum'),
('kb', 'Keluarga Berencana (KB)'),
('anc', 'Pemeriksaan Kehamilan (ANC)'),
('pnc', 'Pemeriksaan Nifas (PNC)'),
('imunisasi', 'Imunisasi'),
('mtbs', 'MTBS (Manajemen Terpadu Balita Sakit)'),
('kb_iud', 'Pemasangan IUD'),
('kb_implant', 'Pemasangan Implant'),
('kb_suntik', 'KB Suntik'),
('kb_pil', 'KB Pil'),
('usg', 'USG Kehamilan'),
('konseling', 'Konseling Kesehatan'),
('lainnya', 'Lainnya');

-- ============================================
-- TABEL ANTRIAN
-- ============================================
CREATE TABLE IF NOT EXISTS antrian (
    id VARCHAR(50) PRIMARY KEY,
    pasien_id VARCHAR(50) NOT NULL,
    no_antrian INT NOT NULL,
    tanggal DATE NOT NULL,
    jenis_layanan VARCHAR(50) NOT NULL,
    keluhan TEXT,
    dokter VARCHAR(100),
    status ENUM('Menunggu', 'Dipanggil', 'Sedang Dilayani', 'Selesai', 'Batal') DEFAULT 'Menunggu',
    waktu_daftar DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    waktu_panggil DATETIME NULL,
    waktu_selesai DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pasien_id) REFERENCES pasien(id) ON DELETE CASCADE,
    INDEX idx_tanggal (tanggal),
    INDEX idx_status (status),
    INDEX idx_pasien (pasien_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABEL PEMERIKSAAN DOKTER
-- ============================================
CREATE TABLE IF NOT EXISTS pemeriksaan_dokter (
    id VARCHAR(50) PRIMARY KEY,
    antrian_id VARCHAR(50) NOT NULL,
    pasien_id VARCHAR(50) NOT NULL,
    dokter VARCHAR(100) NOT NULL,
    tanggal_pemeriksaan DATETIME NOT NULL,
    jenis_kunjungan ENUM('Konsultasi', 'Kontrol', 'Darurat', 'Rutin', 'Spesialis') DEFAULT 'Konsultasi',
    
    -- Asesmen Awal
    keluhan_utama TEXT,
    riwayat_penyakit_sekarang TEXT,
    riwayat_penyakit_dahulu TEXT,
    riwayat_alergi TEXT,
    riwayat_obat TEXT,
    
    -- Pemeriksaan Fisik
    tekanan_darah_sistolik INT COMMENT 'mmHg',
    tekanan_darah_diastolik INT COMMENT 'mmHg',
    denyut_jantung INT COMMENT 'x/menit',
    suhu_tubuh DECIMAL(4,1) COMMENT 'Celsius',
    berat_badan DECIMAL(5,1) COMMENT 'kg',
    tinggi_badan DECIMAL(5,1) COMMENT 'cm',
    respirasi INT COMMENT 'x/menit',
    lingkar_perut DECIMAL(5,1) COMMENT 'cm',
    lingkar_lengan DECIMAL(5,1) COMMENT 'cm',
    saturasi_oksigen INT COMMENT 'SpO2 %',
    
    -- Pemeriksaan Fisik Umum
    keadaan_umum ENUM('Baik', 'Sedang', 'Lemah') DEFAULT 'Baik',
    kesadaran ENUM('Compos Mentis', 'Apatis', 'Somnolen', 'Sopor', 'Koma') DEFAULT 'Compos Mentis',
    pemeriksaan_kepala TEXT,
    pemeriksaan_mata TEXT,
    pemeriksaan_telinga TEXT,
    pemeriksaan_hidung TEXT,
    pemeriksaan_mulut TEXT,
    pemeriksaan_leher TEXT,
    pemeriksaan_dada TEXT,
    pemeriksaan_abdomen TEXT,
    pemeriksaan_ekstremitas TEXT,
    
    -- Catatan Dokter
    diagnosis TEXT,
    diagnosis_sekunder TEXT,
    kode_icd10 VARCHAR(20),
    rencana_perawatan TEXT,
    tindakan TEXT,
    obat_obatan TEXT,
    edukasi_pasien TEXT,
    tindak_lanjut TEXT,
    tanggal_kontrol DATE NULL,
    
    -- Status Verifikasi
    status ENUM('Dalam Pemeriksaan', 'Selesai', 'Dirujuk') DEFAULT 'Dalam Pemeriksaan',
    verifikasi BOOLEAN DEFAULT FALSE,
    waktu_verifikasi DATETIME NULL,
    catatan_tambahan TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (antrian_id) REFERENCES antrian(id) ON DELETE CASCADE,
    FOREIGN KEY (pasien_id) REFERENCES pasien(id) ON DELETE CASCADE,
    INDEX idx_tanggal (tanggal_pemeriksaan),
    INDEX idx_dokter (dokter),
    INDEX idx_pasien (pasien_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABEL JADWAL KONSULTASI
-- ============================================
CREATE TABLE IF NOT EXISTS jadwal_konsultasi (
    id VARCHAR(50) PRIMARY KEY,
    pasien_id VARCHAR(50) NOT NULL,
    dokter VARCHAR(100) NOT NULL,
    tanggal DATE NOT NULL,
    waktu TIME NOT NULL,
    jenis_konsultasi ENUM('Pemeriksaan Umum', 'Kontrol', 'Konsultasi', 'Darurat', 'Spesialis', 'KB', 'ANC', 'PNC', 'Imunisasi') DEFAULT 'Pemeriksaan Umum',
    keluhan TEXT,
    status ENUM('Terjadwal', 'Dikonfirmasi', 'Selesai', 'Dibatalkan') DEFAULT 'Terjadwal',
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pasien_id) REFERENCES pasien(id) ON DELETE CASCADE,
    INDEX idx_tanggal (tanggal),
    INDEX idx_dokter (dokter),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABEL RIWAYAT KUNJUNGAN
-- ============================================
CREATE TABLE IF NOT EXISTS riwayat_kunjungan (
    id VARCHAR(50) PRIMARY KEY,
    pasien_id VARCHAR(50) NOT NULL,
    pemeriksaan_id VARCHAR(50),
    tanggal_kunjungan DATETIME NOT NULL,
    jenis_layanan VARCHAR(50),
    dokter VARCHAR(100),
    diagnosis TEXT,
    tindakan TEXT,
    obat TEXT,
    biaya DECIMAL(12,2) DEFAULT 0,
    status ENUM('Selesai', 'Dirujuk', 'Kontrol Ulang') DEFAULT 'Selesai',
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pasien_id) REFERENCES pasien(id) ON DELETE CASCADE,
    FOREIGN KEY (pemeriksaan_id) REFERENCES pemeriksaan_dokter(id) ON DELETE SET NULL,
    INDEX idx_pasien (pasien_id),
    INDEX idx_tanggal (tanggal_kunjungan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABEL PENGATURAN APLIKASI
-- ============================================
CREATE TABLE IF NOT EXISTS pengaturan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kunci VARCHAR(100) NOT NULL UNIQUE,
    nilai TEXT,
    deskripsi VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Pengaturan Default
INSERT INTO pengaturan (kunci, nilai, deskripsi) VALUES
('nama_klinik', 'Klinik Asy-Syifa Husada', 'Nama Klinik'),
('alamat_klinik', 'Jl. Raya Ponorogo No. 123', 'Alamat Klinik'),
('telepon_klinik', '(0352) 123456', 'Nomor Telepon Klinik'),
('email_klinik', 'info@asyifa-husada.com', 'Email Klinik'),
('last_rm_number', '0', 'Nomor RM terakhir untuk auto-generate');

-- ============================================
-- TABEL USER (untuk login)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Hashed password',
    nama_lengkap VARCHAR(100) NOT NULL,
    role ENUM('Admin', 'Dokter', 'Perawat', 'Pendaftaran') DEFAULT 'Pendaftaran',
    email VARCHAR(100),
    status ENUM('Aktif', 'Tidak Aktif') DEFAULT 'Aktif',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert User Default (password: admin123 - harus di-hash)
INSERT INTO users (username, password, nama_lengkap, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'Admin');

-- ============================================
-- VIEWS UNTUK STATISTIK
-- ============================================

-- View Statistik Harian
CREATE OR REPLACE VIEW v_statistik_harian AS
SELECT 
    DATE(a.tanggal) as tanggal,
    COUNT(*) as total_pasien,
    SUM(CASE WHEN a.status = 'Menunggu' THEN 1 ELSE 0 END) as menunggu,
    SUM(CASE WHEN a.status = 'Sedang Dilayani' THEN 1 ELSE 0 END) as sedang_dilayani,
    SUM(CASE WHEN a.status = 'Selesai' THEN 1 ELSE 0 END) as selesai,
    SUM(CASE WHEN a.status = 'Batal' THEN 1 ELSE 0 END) as batal
FROM antrian a
GROUP BY DATE(a.tanggal);

-- View Antrian Hari Ini
CREATE OR REPLACE VIEW v_antrian_hari_ini AS
SELECT 
    a.id,
    a.no_antrian,
    p.no_rm,
    p.nama_lengkap,
    p.jenis_kelamin,
    a.jenis_layanan,
    a.keluhan,
    a.dokter,
    a.status,
    a.waktu_daftar
FROM antrian a
JOIN pasien p ON a.pasien_id = p.id
WHERE DATE(a.tanggal) = CURDATE()
ORDER BY a.no_antrian;

-- View Riwayat Pemeriksaan Lengkap
CREATE OR REPLACE VIEW v_riwayat_pemeriksaan AS
SELECT 
    pd.id,
    pd.tanggal_pemeriksaan,
    p.no_rm,
    p.nik,
    p.nama_lengkap,
    p.jenis_kelamin,
    p.tanggal_lahir,
    pd.dokter,
    pd.jenis_kunjungan,
    pd.keluhan_utama,
    pd.tekanan_darah_sistolik,
    pd.tekanan_darah_diastolik,
    pd.denyut_jantung,
    pd.suhu_tubuh,
    pd.berat_badan,
    pd.tinggi_badan,
    pd.diagnosis,
    pd.obat_obatan,
    pd.status,
    pd.verifikasi
FROM pemeriksaan_dokter pd
JOIN pasien p ON pd.pasien_id = p.id
ORDER BY pd.tanggal_pemeriksaan DESC;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure untuk generate No. RM baru
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_generate_no_rm(OUT new_rm VARCHAR(10))
BEGIN
    DECLARE last_num INT;
    DECLARE new_num INT;
    
    -- Ambil nomor terakhir
    SELECT COALESCE(MAX(
        CAST(REPLACE(no_rm, '-', '') AS UNSIGNED)
    ), 0) INTO last_num FROM pasien;
    
    SET new_num = last_num + 1;
    
    -- Format: 00-00-01
    SET new_rm = CONCAT(
        LPAD(FLOOR(new_num / 10000), 2, '0'), '-',
        LPAD(FLOOR((new_num MOD 10000) / 100), 2, '0'), '-',
        LPAD(new_num MOD 100, 2, '0')
    );
END //
DELIMITER ;

-- Procedure untuk mendaftarkan pasien baru
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_daftar_pasien_baru(
    IN p_nik VARCHAR(16),
    IN p_nama VARCHAR(100),
    IN p_tanggal_lahir DATE,
    IN p_jenis_kelamin VARCHAR(20),
    IN p_alamat TEXT,
    IN p_provinsi VARCHAR(50),
    IN p_kode_pos VARCHAR(10),
    IN p_telepon VARCHAR(20),
    IN p_email VARCHAR(100),
    IN p_golongan_darah VARCHAR(20),
    IN p_pekerjaan VARCHAR(100),
    OUT p_id VARCHAR(50),
    OUT p_no_rm VARCHAR(10)
)
BEGIN
    DECLARE new_rm VARCHAR(10);
    
    -- Generate No. RM
    CALL sp_generate_no_rm(new_rm);
    
    -- Generate ID
    SET p_id = CONCAT('PSN-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', FLOOR(RAND() * 1000));
    SET p_no_rm = new_rm;
    
    -- Insert pasien
    INSERT INTO pasien (id, no_rm, nik, nama_lengkap, tanggal_lahir, jenis_kelamin, 
                       alamat, provinsi, kode_pos, no_telepon, email, golongan_darah, pekerjaan)
    VALUES (p_id, new_rm, p_nik, p_nama, p_tanggal_lahir, p_jenis_kelamin,
            p_alamat, p_provinsi, p_kode_pos, p_telepon, p_email, p_golongan_darah, p_pekerjaan);
END //
DELIMITER ;

-- Procedure untuk membuat antrian
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_buat_antrian(
    IN p_pasien_id VARCHAR(50),
    IN p_jenis_layanan VARCHAR(50),
    IN p_keluhan TEXT,
    IN p_dokter VARCHAR(100),
    OUT p_antrian_id VARCHAR(50),
    OUT p_no_antrian INT
)
BEGIN
    -- Hitung nomor antrian hari ini
    SELECT COALESCE(MAX(no_antrian), 0) + 1 INTO p_no_antrian
    FROM antrian
    WHERE DATE(tanggal) = CURDATE();
    
    -- Generate ID
    SET p_antrian_id = CONCAT('ANT-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', FLOOR(RAND() * 1000));
    
    -- Insert antrian
    INSERT INTO antrian (id, pasien_id, no_antrian, tanggal, jenis_layanan, keluhan, dokter)
    VALUES (p_antrian_id, p_pasien_id, p_no_antrian, CURDATE(), p_jenis_layanan, p_keluhan, p_dokter);
END //
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger untuk update status antrian setelah pemeriksaan selesai
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_after_pemeriksaan_verifikasi
AFTER UPDATE ON pemeriksaan_dokter
FOR EACH ROW
BEGIN
    IF NEW.verifikasi = TRUE AND OLD.verifikasi = FALSE THEN
        UPDATE antrian 
        SET status = 'Selesai', waktu_selesai = NOW()
        WHERE id = NEW.antrian_id;
        
        -- Insert ke riwayat kunjungan
        INSERT INTO riwayat_kunjungan (id, pasien_id, pemeriksaan_id, tanggal_kunjungan, 
                                       jenis_layanan, dokter, diagnosis, tindakan, obat)
        SELECT 
            CONCAT('RK-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', FLOOR(RAND() * 1000)),
            NEW.pasien_id,
            NEW.id,
            NOW(),
            a.jenis_layanan,
            NEW.dokter,
            NEW.diagnosis,
            NEW.tindakan,
            NEW.obat_obatan
        FROM antrian a WHERE a.id = NEW.antrian_id;
    END IF;
END //
DELIMITER ;

-- ============================================
-- SAMPLE DATA (OPSIONAL)
-- ============================================

-- Uncomment untuk menambahkan data contoh
/*
-- Pasien Contoh
INSERT INTO pasien (id, no_rm, nik, nama_lengkap, tanggal_lahir, jenis_kelamin, alamat, provinsi, kode_pos, no_telepon, status) VALUES
('PSN-001', '00-00-01', '3502010101900001', 'Tn. Agus Susanto', '1990-01-15', 'Laki-laki', 'Jl. Merdeka No. 45', 'Jawa Timur', '63411', '081234567890', 'Aktif'),
('PSN-002', '00-00-02', '3502010202850002', 'Ny. Siti Rahayu', '1985-05-20', 'Perempuan', 'Jl. Pahlawan No. 12', 'Jawa Timur', '63412', '082345678901', 'Aktif'),
('PSN-003', '00-00-03', '3502010303150003', 'An. Valerica Aoskay', '2015-08-10', 'Perempuan', 'Jl. Sudirman No. 78', 'Jawa Timur', '63413', '083456789012', 'Aktif');
*/

-- ============================================
-- GRANT PRIVILEGES (sesuaikan username)
-- ============================================
-- GRANT ALL PRIVILEGES ON sim_kia_asyifa.* TO 'your_username'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- SELESAI
-- ============================================
SELECT 'Database SIM KIA Klinik Asy-Syifa Husada berhasil dibuat!' AS status;
