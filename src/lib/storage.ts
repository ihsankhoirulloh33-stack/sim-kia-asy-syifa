// Local Storage Helper untuk SIM KIA

export interface Pasien {
  id: string;
  noRekamMedis: string;
  nik: string;
  nama: string;
  tanggalLahir: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan' | 'Lainnya';
  alamat: string;
  provinsi: string;
  kodePos: string;
  noTelepon: string;
  email?: string;
  golonganDarah?: string;
  tanggalDaftar: string;
  status: 'Aktif' | 'Sembuh' | 'Kronis';
}

export interface RekamMedis {
  id: string;
  pasienId: string;
  tanggal: string;
  keluhan: string;
  diagnosis: string;
  tindakan: string;
  obat: string[];
  dokter: string;
  catatan?: string;
}

export interface JadwalKonsultasi {
  id: string;
  pasienId: string;
  namaPasien: string;
  tanggal: string;
  waktu: string;
  dokter: string;
  jenisKonsultasi: 'Pemeriksaan Umum' | 'Kontrol' | 'Konsultasi' | 'Darurat' | 'Spesialis';
  status: 'Terjadwal' | 'Dikonfirmasi' | 'Selesai' | 'Dibatalkan';
  catatan?: string;
}

export interface PemeriksaanDokter {
  id: string;
  pasienId: string;
  antrianId: string;
  namaPasien: string;
  noRekamMedis: string;
  tanggal: string;
  dokter: string;
  jenisLayanan: 'Konsultasi KIA' | 'KB' | 'Imunisasi' | 'Pemeriksaan Kehamilan' | 'Pemeriksaan Nifas' | 'Lainnya';
  // Asesmen Awal
  keluhanPasien: string;
  // Riwayat Kesehatan
  alergi: string[];
  riwayatPenyakit: string[];
  // Pemeriksaan Fisik
  pemeriksaanFisik: {
    tekananDarah: string;
    denyutJantung: string;
    suhu: string;
    berat: string;
    tinggi: string;
    respirasi: string;
    lingkarPerut?: string;
    lingkarLengan?: string;
  };
  // Catatan Dokter
  diagnosis: string;
  tindakan: string;
  obatObatan: string[];
  rencanaPeawatan: string;
  tindakLanjut: string;
  // Status verifikasi
  isVerified: boolean;
  verifiedAt?: string;
}

export interface Antrian {
  id: string;
  pasienId: string;
  namaPasien: string;
  noRekamMedis: string;
  noAntrian: number;
  jenisLayanan: 'Konsultasi KIA' | 'KB' | 'Imunisasi' | 'Pemeriksaan Kehamilan' | 'Pemeriksaan Nifas' | 'Lainnya';
  keluhanPasien: string;
  status: 'Menunggu' | 'Sedang Dilayani' | 'Selesai';
  waktuDaftar: string;
}

const STORAGE_KEYS = {
  PASIEN: 'sim_kia_pasien',
  REKAM_MEDIS: 'sim_kia_rekam_medis',
  JADWAL: 'sim_kia_jadwal',
  PEMERIKSAAN_DOKTER: 'sim_kia_pemeriksaan_dokter',
  ANTRIAN: 'sim_kia_antrian',
  SETTINGS: 'sim_kia_settings',
};

// Daftar Dokter
export const DOKTER_LIST = [
  'dr. Sad Omega Kencanawaty',
  'dr. Haryo Hadiatho',
  'dr. Reny Endyawati',
  'dr. Debora Singgih',
  'dr. Sella Dumaika Desmonda',
];

// Jenis Layanan KIA
export const JENIS_LAYANAN_KIA = [
  'Konsultasi KIA',
  'KB',
  'Imunisasi',
  'Pemeriksaan Kehamilan',
  'Pemeriksaan Nifas',
  'Lainnya',
];

// Generic storage functions
function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Pasien functions
export function getAllPasien(): Pasien[] {
  return getFromStorage<Pasien>(STORAGE_KEYS.PASIEN);
}

export function getPasienById(id: string): Pasien | undefined {
  return getAllPasien().find(p => p.id === id);
}

export function getPasienByNoRM(noRM: string): Pasien | undefined {
  return getAllPasien().find(p => p.noRekamMedis === noRM);
}

export function savePasien(pasien: Pasien): void {
  const pasienList = getAllPasien();
  const existingIndex = pasienList.findIndex(p => p.id === pasien.id);
  if (existingIndex >= 0) {
    pasienList[existingIndex] = pasien;
  } else {
    pasienList.push(pasien);
  }
  saveToStorage(STORAGE_KEYS.PASIEN, pasienList);
}

export function deletePasien(id: string): void {
  const pasienList = getAllPasien().filter(p => p.id !== id);
  saveToStorage(STORAGE_KEYS.PASIEN, pasienList);
}

export function searchPasien(query: string): Pasien[] {
  const lowerQuery = query.toLowerCase();
  return getAllPasien().filter(p => 
    p.nama.toLowerCase().includes(lowerQuery) ||
    p.noRekamMedis.toLowerCase().includes(lowerQuery) ||
    p.noTelepon.includes(query) ||
    p.nik.includes(query)
  );
}

// Generate No Rekam Medis format: 00-00-01
export function generateNoRM(): string {
  const pasienList = getAllPasien();
  const count = pasienList.length + 1;
  
  // Format: XX-XX-XX (6 digit dengan separator)
  const padded = count.toString().padStart(6, '0');
  return `${padded.slice(0, 2)}-${padded.slice(2, 4)}-${padded.slice(4, 6)}`;
}

// Rekam Medis functions
export function getAllRekamMedis(): RekamMedis[] {
  return getFromStorage<RekamMedis>(STORAGE_KEYS.REKAM_MEDIS);
}

export function getRekamMedisByPasienId(pasienId: string): RekamMedis[] {
  return getAllRekamMedis().filter(rm => rm.pasienId === pasienId);
}

export function saveRekamMedis(rekamMedis: RekamMedis): void {
  const list = getAllRekamMedis();
  const existingIndex = list.findIndex(rm => rm.id === rekamMedis.id);
  if (existingIndex >= 0) {
    list[existingIndex] = rekamMedis;
  } else {
    list.push(rekamMedis);
  }
  saveToStorage(STORAGE_KEYS.REKAM_MEDIS, list);
}

// Jadwal functions
export function getAllJadwal(): JadwalKonsultasi[] {
  return getFromStorage<JadwalKonsultasi>(STORAGE_KEYS.JADWAL);
}

export function saveJadwal(jadwal: JadwalKonsultasi): void {
  const list = getAllJadwal();
  const existingIndex = list.findIndex(j => j.id === jadwal.id);
  if (existingIndex >= 0) {
    list[existingIndex] = jadwal;
  } else {
    list.push(jadwal);
  }
  saveToStorage(STORAGE_KEYS.JADWAL, list);
}

export function deleteJadwal(id: string): void {
  const list = getAllJadwal().filter(j => j.id !== id);
  saveToStorage(STORAGE_KEYS.JADWAL, list);
}

// Pemeriksaan Dokter functions
export function getAllPemeriksaanDokter(): PemeriksaanDokter[] {
  return getFromStorage<PemeriksaanDokter>(STORAGE_KEYS.PEMERIKSAAN_DOKTER);
}

export function getAllPemeriksaan(): PemeriksaanDokter[] {
  return getAllPemeriksaanDokter();
}

export function getPemeriksaanByPasienId(pasienId: string): PemeriksaanDokter[] {
  return getAllPemeriksaanDokter().filter(p => p.pasienId === pasienId);
}

export function savePemeriksaanDokter(pemeriksaan: PemeriksaanDokter): void {
  const list = getAllPemeriksaanDokter();
  const existingIndex = list.findIndex(p => p.id === pemeriksaan.id);
  if (existingIndex >= 0) {
    list[existingIndex] = pemeriksaan;
  } else {
    list.push(pemeriksaan);
  }
  saveToStorage(STORAGE_KEYS.PEMERIKSAAN_DOKTER, list);
}

// Antrian functions
export function getAllAntrian(): Antrian[] {
  return getFromStorage<Antrian>(STORAGE_KEYS.ANTRIAN);
}

export function getAntrianHariIni(): Antrian[] {
  const today = new Date().toISOString().split('T')[0];
  return getAllAntrian().filter(a => a.waktuDaftar.startsWith(today));
}

export function saveAntrian(antrian: Antrian): void {
  const list = getAllAntrian();
  const existingIndex = list.findIndex(a => a.id === antrian.id);
  if (existingIndex >= 0) {
    list[existingIndex] = antrian;
  } else {
    list.push(antrian);
  }
  saveToStorage(STORAGE_KEYS.ANTRIAN, list);
}

export function getNextAntrianNumber(): number {
  const antrianHariIni = getAntrianHariIni();
  return antrianHariIni.length + 1;
}

// Statistics
export function getStatistik() {
  const pasien = getAllPasien();
  const antrianHariIni = getAntrianHariIni();
  
  return {
    totalPasien: pasien.length,
    pasienAktif: pasien.filter(p => p.status === 'Aktif').length,
    pasienSembuh: pasien.filter(p => p.status === 'Sembuh').length,
    pasienKronis: pasien.filter(p => p.status === 'Kronis').length,
    menunggu: antrianHariIni.filter(a => a.status === 'Menunggu').length,
    sedangDilayani: antrianHariIni.filter(a => a.status === 'Sedang Dilayani').length,
    selesai: antrianHariIni.filter(a => a.status === 'Selesai').length,
  };
}

// Settings
export interface Settings {
  namaKlinik: string;
  alamatKlinik: string;
  teleponKlinik: string;
  emailKlinik: string;
}

export function getSettings(): Settings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    namaKlinik: 'Klinik Asy-Syifa Husada',
    alamatKlinik: 'Takeran, Magetan, Jawa Timur',
    teleponKlinik: '(0351) 123456',
    emailKlinik: 'info@asysyifahusada.com',
  };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Initialize with sample data
export function initializeSampleData(): void {
  if (getAllPasien().length === 0) {
    const samplePasien: Pasien[] = [
      {
        id: '1',
        noRekamMedis: '00-00-01',
        nik: '3519012345670001',
        nama: 'Tn. Agus Susono',
        tanggalLahir: '1985-03-15',
        jenisKelamin: 'Laki-laki',
        alamat: 'Jl. Merdeka No. 123',
        provinsi: 'Jawa Timur',
        kodePos: '63354',
        noTelepon: '081234567890',
        email: 'agus.susono@email.com',
        golonganDarah: 'A',
        tanggalDaftar: '2024-12-01',
        status: 'Aktif',
      },
      {
        id: '2',
        noRekamMedis: '00-00-02',
        nik: '3519012345670002',
        nama: 'Ny. Siti Rahayu',
        tanggalLahir: '1990-07-22',
        jenisKelamin: 'Perempuan',
        alamat: 'Jl. Pahlawan No. 45',
        provinsi: 'Jawa Timur',
        kodePos: '63354',
        noTelepon: '082345678901',
        email: 'siti.rahayu@email.com',
        golonganDarah: 'B',
        tanggalDaftar: '2024-12-05',
        status: 'Kronis',
      },
      {
        id: '3',
        noRekamMedis: '00-00-03',
        nik: '3519012345670003',
        nama: 'An. Valerica Aoskay',
        tanggalLahir: '2018-11-10',
        jenisKelamin: 'Perempuan',
        alamat: 'Jl. Sudirman No. 78',
        provinsi: 'Jawa Timur',
        kodePos: '63354',
        noTelepon: '083456789012',
        golonganDarah: 'O',
        tanggalDaftar: '2024-12-10',
        status: 'Sembuh',
      },
    ];
    
    samplePasien.forEach(p => savePasien(p));

    // Sample Antrian
    const today = new Date().toISOString();
    const sampleAntrian: Antrian[] = [
      { id: 'a1', pasienId: '1', namaPasien: 'Tn. Agus Susono', noRekamMedis: '00-00-01', noAntrian: 1, jenisLayanan: 'Konsultasi KIA', keluhanPasien: 'Demam dan batuk', status: 'Selesai', waktuDaftar: today },
      { id: 'a2', pasienId: '2', namaPasien: 'Ny. Siti Rahayu', noRekamMedis: '00-00-02', noAntrian: 2, jenisLayanan: 'KB', keluhanPasien: 'Konsultasi KB', status: 'Sedang Dilayani', waktuDaftar: today },
      { id: 'a3', pasienId: '3', namaPasien: 'An. Valerica Aoskay', noRekamMedis: '00-00-03', noAntrian: 3, jenisLayanan: 'Imunisasi', keluhanPasien: 'Imunisasi rutin', status: 'Menunggu', waktuDaftar: today },
    ];
    sampleAntrian.forEach(a => saveAntrian(a));

    // Sample Jadwal
    const sampleJadwal: JadwalKonsultasi[] = [
      {
        id: 'j1',
        pasienId: '1',
        namaPasien: 'Tn. Agus Susono',
        tanggal: '2025-01-02',
        waktu: '09:00',
        dokter: 'dr. Sad Omega Kencanawaty',
        jenisKonsultasi: 'Kontrol',
        status: 'Terjadwal',
      },
      {
        id: 'j2',
        pasienId: '2',
        namaPasien: 'Ny. Siti Rahayu',
        tanggal: '2025-01-03',
        waktu: '10:30',
        dokter: 'dr. Reny Endyawati',
        jenisKonsultasi: 'Konsultasi',
        status: 'Dikonfirmasi',
      },
    ];
    sampleJadwal.forEach(j => saveJadwal(j));

    // Sample Pemeriksaan Dokter
    const samplePemeriksaan: PemeriksaanDokter[] = [
      {
        id: 'pd1',
        pasienId: '1',
        antrianId: 'a1',
        namaPasien: 'Tn. Agus Susono',
        noRekamMedis: '00-00-01',
        tanggal: new Date().toISOString().split('T')[0],
        dokter: 'dr. Sad Omega Kencanawaty',
        jenisLayanan: 'Konsultasi KIA',
        keluhanPasien: 'Demam dan batuk',
        alergi: ['Penisilin'],
        riwayatPenyakit: ['Hipertensi'],
        pemeriksaanFisik: {
          tekananDarah: '130/85',
          denyutJantung: '78',
          suhu: '37.5',
          berat: '70',
          tinggi: '170',
          respirasi: '18',
        },
        diagnosis: 'ISPA (Infeksi Saluran Pernapasan Atas)',
        tindakan: 'Pemberian obat',
        obatObatan: ['Paracetamol 500mg 3x1', 'Ambroxol 30mg 3x1'],
        rencanaPeawatan: 'Istirahat cukup, minum air putih yang banyak',
        tindakLanjut: 'Kontrol 3 hari lagi jika tidak membaik',
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      },
    ];
    samplePemeriksaan.forEach(p => savePemeriksaanDokter(p));
  }
}
