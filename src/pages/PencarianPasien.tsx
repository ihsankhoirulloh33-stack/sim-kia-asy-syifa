import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { searchPasien, type Pasien } from '@/lib/storage';
import { Search, User, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PencarianPasien() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Pasien[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      const found = searchPasien(query);
      setResults(found);
      setHasSearched(true);
    }
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
    <MainLayout title="Pencarian Pasien" subtitle="Cari data pasien berdasarkan nama, nomor rekam medis, atau nomor telepon">
      <div className="space-y-6">
        {/* Search Box */}
        <Card className="animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nama, nomor RM, atau nomor telepon..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button onClick={handleSearch} className="h-12 px-8">
                <Search className="w-5 h-5 mr-2" />
                Cari
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Hasil Pencarian ({results.length} pasien ditemukan)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Tidak ada pasien ditemukan</p>
                  <p className="text-sm">Coba kata kunci lain</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="table-header">
                        <TableHead>No. RM</TableHead>
                        <TableHead>Nama Pasien</TableHead>
                        <TableHead>Jenis Kelamin</TableHead>
                        <TableHead>Usia</TableHead>
                        <TableHead>Telepon</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((pasien) => (
                        <TableRow key={pasien.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm">{pasien.noRekamMedis}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{pasien.nama}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {pasien.provinsi}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{pasien.jenisKelamin}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {calculateAge(pasien.tanggalLahir)} tahun
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              {pasien.noTelepon}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={getStatusBadge(pasien.status)}>{pasien.status}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/riwayat-medis')}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Riwayat
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <Card className="animate-fade-in">
            <CardContent className="py-16">
              <div className="text-center text-muted-foreground">
                <Search className="w-20 h-20 mx-auto mb-6 opacity-20" />
                <p className="text-xl font-medium mb-2">Mulai Pencarian</p>
                <p className="text-sm max-w-md mx-auto">
                  Masukkan nama pasien, nomor rekam medis, atau nomor telepon untuk mencari data pasien
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
