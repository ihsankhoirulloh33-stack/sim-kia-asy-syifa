import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAllPasien, getAllPemeriksaan, type Pasien, type PemeriksaanDokter } from '@/lib/storage';
import { Search, FileText, User, Calendar, Pill, Stethoscope } from 'lucide-react';

export default function RiwayatMedis() {
  const [pasienList, setPasienList] = useState<Pasien[]>([]);
  const [filteredPasien, setFilteredPasien] = useState<Pasien[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPasien, setSelectedPasien] = useState<Pasien | null>(null);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanDokter[]>([]);

  useEffect(() => {
    const pasien = getAllPasien();
    setPasienList(pasien);
    setFilteredPasien(pasien);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = pasienList.filter(p =>
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.noRekamMedis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nik?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPasien(filtered);
    } else {
      setFilteredPasien(pasienList);
    }
  }, [searchQuery, pasienList]);

  const handleViewRekamMedis = (pasien: Pasien) => {
    setSelectedPasien(pasien);
    const allPemeriksaan = getAllPemeriksaan();
    const pasienPemeriksaan = allPemeriksaan.filter(p => p.pasienId === pasien.id);
    setPemeriksaanList(pasienPemeriksaan);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'Aktif': 'status-badge status-aktif',
      'Sembuh': 'status-badge status-sembuh',
      'Kronis': 'status-badge status-kronis',
    };
    return statusClasses[status] || 'status-badge';
  };

  return (
    <MainLayout title="Riwayat Medis" subtitle="Lihat riwayat medis dan rekam medis pasien">
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Daftar Pasien
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari pasien (nama/RM/NIK)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>No. RM</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Nama Pasien</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPasien.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data pasien
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPasien.map((pasien) => (
                    <TableRow key={pasien.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{pasien.noRekamMedis}</TableCell>
                      <TableCell className="font-mono text-sm">{pasien.nik || '-'}</TableCell>
                      <TableCell className="font-medium">{pasien.nama}</TableCell>
                      <TableCell>{pasien.jenisKelamin}</TableCell>
                      <TableCell>
                        <span className={getStatusBadge(pasien.status)}>{pasien.status}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewRekamMedis(pasien)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Detail
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Rekam Medis - {selectedPasien?.nama}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {selectedPasien && (
                              <div className="space-y-6">
                                {/* Patient Info */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                  <div>
                                    <p className="text-xs text-muted-foreground">No. Rekam Medis</p>
                                    <p className="font-medium">{selectedPasien.noRekamMedis}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">NIK</p>
                                    <p className="font-medium">{selectedPasien.nik || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <span className={getStatusBadge(selectedPasien.status)}>
                                      {selectedPasien.status}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Tanggal Lahir</p>
                                    <p className="font-medium">
                                      {new Date(selectedPasien.tanggalLahir).toLocaleDateString('id-ID')}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Golongan Darah</p>
                                    <p className="font-medium">{selectedPasien.golonganDarah || '-'}</p>
                                  </div>
                                </div>

                                {/* Riwayat Pemeriksaan */}
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-primary" />
                                    Riwayat Kunjungan & Pemeriksaan
                                  </h4>
                                  {pemeriksaanList.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">
                                      Belum ada riwayat pemeriksaan
                                    </p>
                                  ) : (
                                    <div className="space-y-3">
                                      {pemeriksaanList.map((pm) => (
                                        <div key={pm.id} className="p-4 border border-border rounded-lg">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                              {new Date(pm.tanggal).toLocaleDateString('id-ID')}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              oleh {pm.dokter}
                                            </span>
                                          </div>
                                          
                                          {/* Tanda Vital */}
                                          <div className="grid grid-cols-3 gap-2 text-xs bg-muted/30 p-2 rounded mb-2">
                                            <div>TD: {pm.pemeriksaanFisik.tekananDarah}</div>
                                            <div>Nadi: {pm.pemeriksaanFisik.denyutJantung} bpm</div>
                                            <div>Suhu: {pm.pemeriksaanFisik.suhu}°C</div>
                                          </div>

                                          <div className="grid grid-cols-1 gap-2 text-sm">
                                            <div>
                                              <span className="text-muted-foreground">Keluhan: </span>
                                              {pm.keluhanPasien}
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">Diagnosis: </span>
                                              {pm.diagnosis}
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">Tindakan: </span>
                                              {pm.rencanaPeawatan}
                                            </div>
                                            {pm.obatObatan && pm.obatObatan.length > 0 && (
                                              <div className="flex items-start gap-1">
                                                <Pill className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                <span>{pm.obatObatan.join(', ')}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
