import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getSettings, saveSettings, type Settings } from '@/lib/storage';
import { Settings as SettingsIcon, Building2, Phone, Mail, Save, Info, Database, Shield } from 'lucide-react';
import logoKlinik from '@/assets/logo-klinik.png';
import logoStikes from '@/assets/logo-stikes.png';

export default function Pengaturan() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    namaKlinik: '',
    alamatKlinik: '',
    teleponKlinik: '',
    emailKlinik: '',
  });

  useEffect(() => {
    const currentSettings = getSettings();
    setSettings(currentSettings);
  }, []);

  const handleInputChange = (field: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveSettings(settings);
    toast({
      title: 'Pengaturan Disimpan',
      description: 'Pengaturan klinik berhasil diperbarui',
    });
  };

  const handleClearData = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan!')) {
      localStorage.clear();
      toast({
        title: 'Data Dihapus',
        description: 'Semua data telah dihapus. Halaman akan dimuat ulang.',
      });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <MainLayout title="Pengaturan" subtitle="Kelola pengaturan aplikasi dan informasi klinik">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Informasi Klinik
              </CardTitle>
              <CardDescription>
                Pengaturan dasar informasi klinik yang akan ditampilkan di aplikasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namaKlinik">Nama Klinik</Label>
                <Input
                  id="namaKlinik"
                  value={settings.namaKlinik}
                  onChange={(e) => handleInputChange('namaKlinik', e.target.value)}
                  placeholder="Klinik Asy-Syifa Husada"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamatKlinik">Alamat Klinik</Label>
                <Input
                  id="alamatKlinik"
                  value={settings.alamatKlinik}
                  onChange={(e) => handleInputChange('alamatKlinik', e.target.value)}
                  placeholder="Takeran, Magetan, Jawa Timur"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teleponKlinik">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telepon
                  </Label>
                  <Input
                    id="teleponKlinik"
                    value={settings.teleponKlinik}
                    onChange={(e) => handleInputChange('teleponKlinik', e.target.value)}
                    placeholder="(0351) 123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailKlinik">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="emailKlinik"
                    type="email"
                    value={settings.emailKlinik}
                    onChange={(e) => handleInputChange('emailKlinik', e.target.value)}
                    placeholder="info@klinik.com"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pengaturan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Database className="w-5 h-5" />
                Manajemen Data
              </CardTitle>
              <CardDescription>
                Hati-hati! Aksi di bagian ini dapat menghapus data secara permanen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-destructive">Hapus Semua Data</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Menghapus semua data pasien, rekam medis, jadwal, dan pengaturan. 
                      Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleClearData}>
                    Hapus Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Tentang Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                <img src={logoKlinik} alt="Logo Klinik" className="w-16 h-16" />
                <div>
                  <h3 className="font-bold text-lg">SIM KIA</h3>
                  <p className="text-sm text-muted-foreground">Klinik Asy-Syifa Husada</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versi</span>
                  <span className="font-medium">1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Penyimpanan</span>
                  <span className="font-medium">Local Storage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format Tanggal</span>
                  <span className="font-medium">Indonesia (id-ID)</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Design by</p>
                <p className="font-medium">Mochamad Bakhtiar Danuaji</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <img src={logoStikes} alt="Logo STIKES" className="w-10 h-10" />
                <div>
                  <p className="text-xs text-muted-foreground">Support by</p>
                  <p className="text-sm font-medium">STIKES Buana Husada Ponorogo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-success" />
                Keamanan Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Semua data disimpan secara lokal di perangkat Anda menggunakan Local Storage browser. 
                Data tidak dikirim ke server manapun dan tetap privat di perangkat Anda.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
