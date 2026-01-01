import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getPasienByNoRM, searchPasien, saveAntrian, getNextAntrianNumber, JENIS_LAYANAN_KIA, type Pasien, type Antrian } from '@/lib/storage';
import { Search, UserCheck, Calendar, Phone, MapPin, Droplets, AlertCircle, FileText, CreditCard } from 'lucide-react';

export default function PendaftaranLama() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pasien[]>([]);
  const [selectedPasien, setSelectedPasien] = useState<Pasien | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [jenisLayanan, setJenisLayanan] = useState('');
  const [keluhanPasien, setKeluhanPasien] = useState('');

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Pencarian Kosong',
        description: 'Masukkan nomor rekam medis, NIK, atau nama pasien',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    
    // Try exact RM match first
    const exactMatch = getPasienByNoRM(searchQuery);
    if (exactMatch) {
      setSearchResults([exactMatch]);
      setSelectedPasien(exactMatch);
    } else {
      // Search by name, phone, or NIK
      const results = searchPasien(searchQuery);
      setSearchResults(results);
      setSelectedPasien(results.length === 1 ? results[0] : null);
    }
    
    setIsSearching(false);
  };

  const handleDaftarAntrian = () => {
    if (!selectedPasien) {
      toast({
        title: 'Pilih Pasien',
        description: 'Silakan pilih pasien terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    if (!jenisLayanan || !keluhanPasien) {
      toast({
        title: 'Lengkapi Data',
        description: 'Pilih jenis layanan dan masukkan keluhan pasien',
        variant: 'destructive',
      });
      return;
    }

    const antrian: Antrian = {
      id: Date.now().toString(),
      pasienId: selectedPasien.id,
      namaPasien: selectedPasien.nama,
      noRekamMedis: selectedPasien.noRekamMedis,
      noAntrian: getNextAntrianNumber(),
      jenisLayanan: jenisLayanan as Antrian['jenisLayanan'],
      keluhanPasien: keluhanPasien,
      status: 'Menunggu',
      waktuDaftar: new Date().toISOString(),
    };

    saveAntrian(antrian);

    toast({
      title: 'Pendaftaran Berhasil',
      description: `${selectedPasien.nama} berhasil didaftarkan ke antrian`,
    });

    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'Aktif': 'status-badge status-aktif',
      'Sembuh': 'status-badge status-sembuh',
      'Kronis': 'status-badge status-kronis',
    };
    return statusClasses[status] || 'status-badge';
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <MainLayout title="Pendaftaran Pasien Lama" subtitle="Cari dan daftarkan pasien yang sudah terdaftar ke antrian">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Section */}
        <Card className="lg:col-span-1 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Cari Pasien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">No. RM / NIK / Nama / No. Telepon</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Contoh: 00-00-01"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Hasil Pencarian ({searchResults.length})</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((pasien) => (
                    <button
                      key={pasien.id}
                      onClick={() => setSelectedPasien(pasien)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedPasien?.id === pasien.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium text-sm">{pasien.nama}</p>
                      <p className="text-xs text-muted-foreground">{pasien.noRekamMedis}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-4 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Pasien tidak ditemukan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Details */}
        <Card className="lg:col-span-2 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Detail Pasien
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPasien ? (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedPasien.nama}</h3>
                    <p className="text-muted-foreground">{selectedPasien.noRekamMedis}</p>
                  </div>
                  <span className={getStatusBadge(selectedPasien.status)}>
                    {selectedPasien.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">NIK</p>
                      <p className="font-medium">{selectedPasien.nik}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal Lahir</p>
                      <p className="font-medium">
                        {new Date(selectedPasien.tanggalLahir).toLocaleDateString('id-ID')}
                        <span className="text-muted-foreground ml-2">
                          ({calculateAge(selectedPasien.tanggalLahir)} tahun)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telepon</p>
                      <p className="font-medium">{selectedPasien.noTelepon}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Alamat</p>
                      <p className="font-medium">{selectedPasien.alamat}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Droplets className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Golongan Darah</p>
                      <p className="font-medium">{selectedPasien.golonganDarah || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Layanan & Keluhan */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Layanan & Keluhan
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Jenis Layanan KIA *</Label>
                      <Select value={jenisLayanan} onValueChange={setJenisLayanan}>
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
                  </div>

                  <div className="space-y-2">
                    <Label>Keluhan Pasien *</Label>
                    <Textarea
                      placeholder="Deskripsikan keluhan pasien"
                      value={keluhanPasien}
                      onChange={(e) => setKeluhanPasien(e.target.value)}
                    />
                  </div>
                </div>

                {/* Action */}
                <div className="pt-4 border-t border-border">
                  <Button onClick={handleDaftarAntrian} className="w-full md:w-auto">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Daftarkan ke Antrian
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Cari pasien menggunakan nomor rekam medis, NIK, atau nama</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
