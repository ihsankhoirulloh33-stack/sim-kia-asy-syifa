import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { savePasien, generateNoRM, saveAntrian, getNextAntrianNumber, JENIS_LAYANAN_KIA, type Pasien, type Antrian } from '@/lib/storage';
import { UserPlus, Save, RotateCcw, FileText } from 'lucide-react';

const provinsiList = [
  'Jawa Timur', 'Jawa Tengah', 'Jawa Barat', 'DKI Jakarta', 'DI Yogyakarta',
  'Banten', 'Bali', 'Sumatera Utara', 'Sumatera Barat', 'Sumatera Selatan',
  'Kalimantan Timur', 'Kalimantan Selatan', 'Sulawesi Selatan', 'Papua',
];

const golonganDarahList = ['A', 'B', 'AB', 'O'];

export default function PendaftaranBaru() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    tanggalLahir: '',
    jenisKelamin: '' as 'Laki-laki' | 'Perempuan' | 'Lainnya' | '',
    alamat: '',
    provinsi: '',
    kodePos: '',
    noTelepon: '',
    email: '',
    golonganDarah: '',
    jenisLayanan: '' as typeof JENIS_LAYANAN_KIA[number] | '',
    keluhanPasien: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      nik: '',
      nama: '',
      tanggalLahir: '',
      jenisKelamin: '',
      alamat: '',
      provinsi: '',
      kodePos: '',
      noTelepon: '',
      email: '',
      golonganDarah: '',
      jenisLayanan: '',
      keluhanPasien: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nik || !formData.nama || !formData.tanggalLahir || !formData.jenisKelamin || !formData.alamat || !formData.noTelepon || !formData.jenisLayanan || !formData.keluhanPasien) {
      toast({
        title: 'Validasi Gagal',
        description: 'Mohon lengkapi semua field yang wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    if (formData.nik.length !== 16) {
      toast({
        title: 'Validasi Gagal',
        description: 'NIK harus 16 digit',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const noRM = generateNoRM();
      const pasienId = Date.now().toString();
      
      const pasien: Pasien = {
        id: pasienId,
        noRekamMedis: noRM,
        nik: formData.nik,
        nama: formData.nama,
        tanggalLahir: formData.tanggalLahir,
        jenisKelamin: formData.jenisKelamin as 'Laki-laki' | 'Perempuan' | 'Lainnya',
        alamat: formData.alamat,
        provinsi: formData.provinsi,
        kodePos: formData.kodePos,
        noTelepon: formData.noTelepon,
        email: formData.email || undefined,
        golonganDarah: formData.golonganDarah || undefined,
        tanggalDaftar: new Date().toISOString().split('T')[0],
        status: 'Aktif',
      };

      savePasien(pasien);

      // Create antrian with jenis layanan and keluhan
      const antrian: Antrian = {
        id: Date.now().toString(),
        pasienId: pasienId,
        namaPasien: formData.nama,
        noRekamMedis: noRM,
        noAntrian: getNextAntrianNumber(),
        jenisLayanan: formData.jenisLayanan as Antrian['jenisLayanan'],
        keluhanPasien: formData.keluhanPasien,
        status: 'Menunggu',
        waktuDaftar: new Date().toISOString(),
      };
      saveAntrian(antrian);

      toast({
        title: 'Pendaftaran Berhasil',
        description: `Pasien ${formData.nama} berhasil didaftarkan dengan No. RM: ${noRM}`,
      });

      handleReset();
      navigate('/');
    } catch (error) {
      toast({
        title: 'Pendaftaran Gagal',
        description: 'Terjadi kesalahan saat menyimpan data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout title="Pendaftaran Pasien Baru" subtitle="Formulir pendaftaran untuk pasien yang belum terdaftar">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Pribadi */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Data Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nik">NIK (Nomor Induk Kependudukan) *</Label>
                <Input
                  id="nik"
                  placeholder="Masukkan 16 digit NIK"
                  value={formData.nik}
                  onChange={(e) => handleInputChange('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                  maxLength={16}
                  required
                />
                <p className="text-xs text-muted-foreground">{formData.nik.length}/16 digit</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  placeholder="Masukkan nama lengkap pasien"
                  value={formData.nama}
                  onChange={(e) => handleInputChange('nama', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggalLahir">Tanggal Lahir *</Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => handleInputChange('tanggalLahir', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jenisKelamin">Jenis Kelamin *</Label>
                  <Select
                    value={formData.jenisKelamin}
                    onValueChange={(value) => handleInputChange('jenisKelamin', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="noTelepon">Nomor Telepon *</Label>
                <Input
                  id="noTelepon"
                  placeholder="Contoh: 08123456789"
                  value={formData.noTelepon}
                  onChange={(e) => handleInputChange('noTelepon', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Contoh: pasien@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="golonganDarah">Golongan Darah</Label>
                <Select
                  value={formData.golonganDarah}
                  onValueChange={(value) => handleInputChange('golonganDarah', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih golongan darah" />
                  </SelectTrigger>
                  <SelectContent>
                    {golonganDarahList.map((gol) => (
                      <SelectItem key={gol} value={gol}>{gol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Alamat & Layanan */}
          <div className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Alamat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat Lengkap *</Label>
                  <Textarea
                    id="alamat"
                    placeholder="Masukkan alamat lengkap"
                    value={formData.alamat}
                    onChange={(e) => handleInputChange('alamat', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provinsi">Provinsi</Label>
                    <Select
                      value={formData.provinsi}
                      onValueChange={(value) => handleInputChange('provinsi', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih provinsi" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinsiList.map((prov) => (
                          <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kodePos">Kode Pos</Label>
                    <Input
                      id="kodePos"
                      placeholder="Contoh: 63354"
                      value={formData.kodePos}
                      onChange={(e) => handleInputChange('kodePos', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Layanan & Keluhan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jenisLayanan">Jenis Layanan KIA *</Label>
                  <Select
                    value={formData.jenisLayanan}
                    onValueChange={(value) => handleInputChange('jenisLayanan', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis layanan" />
                    </SelectTrigger>
                    <SelectContent>
                      {JENIS_LAYANAN_KIA.map((layanan) => (
                        <SelectItem key={layanan} value={layanan}>{layanan}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keluhanPasien">Keluhan Pasien *</Label>
                  <Textarea
                    id="keluhanPasien"
                    placeholder="Deskripsikan keluhan pasien"
                    value={formData.keluhanPasien}
                    onChange={(e) => handleInputChange('keluhanPasien', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Menyimpan...' : 'Simpan & Daftarkan'}
          </Button>
        </div>
      </form>
    </MainLayout>
  );
}
