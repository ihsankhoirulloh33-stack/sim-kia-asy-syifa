import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  getAntrianHariIni, 
  saveAntrian,
  savePemeriksaanDokter,
  getAllPemeriksaanDokter,
  getPasienById,
  DOKTER_LIST,
  type Antrian, 
  type PemeriksaanDokter as PemeriksaanType 
} from '@/lib/storage';
import { 
  Stethoscope, 
  Eye, 
  CheckCircle2, 
  Clock, 
  User, 
  Activity, 
  Heart, 
  Thermometer, 
  Weight, 
  Ruler,
  Wind,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function PemeriksaanDokter() {
  const { toast } = useToast();
  const [antrianList, setAntrianList] = useState<Antrian[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanType[]>([]);
  const [selectedAntrian, setSelectedAntrian] = useState<Antrian | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'antrian' | 'riwayat'>('antrian');
  const [viewingPemeriksaan, setViewingPemeriksaan] = useState<PemeriksaanType | null>(null);
  
  const [formData, setFormData] = useState({
    dokter: '',
    // Riwayat Kesehatan
    alergi: '',
    riwayatPenyakit: '',
    // Pemeriksaan Fisik
    tekananDarah: '',
    denyutJantung: '',
    suhu: '',
    berat: '',
    tinggi: '',
    respirasi: '',
    lingkarPerut: '',
    lingkarLengan: '',
    // Catatan Dokter
    diagnosis: '',
    tindakan: '',
    obatObatan: '',
    rencanaPeawatan: '',
    tindakLanjut: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const antrian = getAntrianHariIni().filter(a => a.status !== 'Selesai');
    setAntrianList(antrian);
    setPemeriksaanList(getAllPemeriksaanDokter());
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      dokter: '',
      alergi: '',
      riwayatPenyakit: '',
      tekananDarah: '',
      denyutJantung: '',
      suhu: '',
      berat: '',
      tinggi: '',
      respirasi: '',
      lingkarPerut: '',
      lingkarLengan: '',
      diagnosis: '',
      tindakan: '',
      obatObatan: '',
      rencanaPeawatan: '',
      tindakLanjut: '',
    });
  };

  const handleStartPemeriksaan = (antrian: Antrian) => {
    // Update status antrian ke Sedang Dilayani
    const updatedAntrian = { ...antrian, status: 'Sedang Dilayani' as const };
    saveAntrian(updatedAntrian);
    setSelectedAntrian(updatedAntrian);
    setIsDialogOpen(true);
    loadData();
  };

  const handleSubmitPemeriksaan = () => {
    if (!selectedAntrian || !formData.dokter || !formData.diagnosis) {
      toast({
        title: 'Validasi Gagal',
        description: 'Mohon lengkapi data dokter dan diagnosis',
        variant: 'destructive',
      });
      return;
    }

    const pemeriksaan: PemeriksaanType = {
      id: Date.now().toString(),
      pasienId: selectedAntrian.pasienId,
      antrianId: selectedAntrian.id,
      namaPasien: selectedAntrian.namaPasien,
      noRekamMedis: selectedAntrian.noRekamMedis,
      tanggal: new Date().toISOString().split('T')[0],
      dokter: formData.dokter,
      jenisLayanan: selectedAntrian.jenisLayanan,
      keluhanPasien: selectedAntrian.keluhanPasien,
      alergi: formData.alergi ? formData.alergi.split(',').map(a => a.trim()) : [],
      riwayatPenyakit: formData.riwayatPenyakit ? formData.riwayatPenyakit.split(',').map(r => r.trim()) : [],
      pemeriksaanFisik: {
        tekananDarah: formData.tekananDarah,
        denyutJantung: formData.denyutJantung,
        suhu: formData.suhu,
        berat: formData.berat,
        tinggi: formData.tinggi,
        respirasi: formData.respirasi,
        lingkarPerut: formData.lingkarPerut || undefined,
        lingkarLengan: formData.lingkarLengan || undefined,
      },
      diagnosis: formData.diagnosis,
      tindakan: formData.tindakan,
      obatObatan: formData.obatObatan ? formData.obatObatan.split(',').map(o => o.trim()) : [],
      rencanaPeawatan: formData.rencanaPeawatan,
      tindakLanjut: formData.tindakLanjut,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    };

    savePemeriksaanDokter(pemeriksaan);

    // Update antrian status ke Selesai
    const updatedAntrian = { ...selectedAntrian, status: 'Selesai' as const };
    saveAntrian(updatedAntrian);

    toast({
      title: 'Pemeriksaan Selesai',
      description: `Pasien ${selectedAntrian.namaPasien} telah selesai ditangani`,
    });

    resetForm();
    setIsDialogOpen(false);
    setSelectedAntrian(null);
    loadData();
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'Menunggu': 'status-badge status-menunggu',
      'Sedang Dilayani': 'status-badge status-dilayani',
      'Selesai': 'status-badge status-selesai',
    };
    return statusClasses[status] || 'status-badge';
  };

  return (
    <MainLayout title="Pemeriksaan Dokter" subtitle="Kelola pemeriksaan dan verifikasi pasien">
      {/* Tab Switch */}
      <div className="flex gap-2 mb-6">
        <Button 
          variant={viewMode === 'antrian' ? 'default' : 'outline'}
          onClick={() => setViewMode('antrian')}
        >
          <Clock className="w-4 h-4 mr-2" />
          Antrian Hari Ini
        </Button>
        <Button 
          variant={viewMode === 'riwayat' ? 'default' : 'outline'}
          onClick={() => setViewMode('riwayat')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Riwayat Pemeriksaan
        </Button>
      </div>

      {viewMode === 'antrian' ? (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Antrian Pasien Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead>No. Antrian</TableHead>
                    <TableHead>No. RM</TableHead>
                    <TableHead>Nama Pasien</TableHead>
                    <TableHead>Jenis Layanan</TableHead>
                    <TableHead>Keluhan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {antrianList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada pasien dalam antrian
                      </TableCell>
                    </TableRow>
                  ) : (
                    antrianList.map((antrian) => (
                      <TableRow key={antrian.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {antrian.noAntrian}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{antrian.noRekamMedis}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {antrian.namaPasien}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="status-badge status-dilayani">{antrian.jenisLayanan}</span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{antrian.keluhanPasien}</TableCell>
                        <TableCell>
                          <span className={getStatusBadge(antrian.status)}>{antrian.status}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {antrian.status === 'Menunggu' && (
                            <Button size="sm" onClick={() => handleStartPemeriksaan(antrian)}>
                              <Stethoscope className="w-4 h-4 mr-1" />
                              Periksa
                            </Button>
                          )}
                          {antrian.status === 'Sedang Dilayani' && (
                            <Button size="sm" variant="outline" onClick={() => {
                              setSelectedAntrian(antrian);
                              setIsDialogOpen(true);
                            }}>
                              <Eye className="w-4 h-4 mr-1" />
                              Lanjutkan
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Riwayat Pemeriksaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>No. RM</TableHead>
                    <TableHead>Nama Pasien</TableHead>
                    <TableHead>Dokter</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pemeriksaanList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Belum ada riwayat pemeriksaan
                      </TableCell>
                    </TableRow>
                  ) : (
                    pemeriksaanList.map((pemeriksaan) => (
                      <TableRow key={pemeriksaan.id} className="hover:bg-muted/50">
                        <TableCell>{new Date(pemeriksaan.tanggal).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell className="font-mono">{pemeriksaan.noRekamMedis}</TableCell>
                        <TableCell>{pemeriksaan.namaPasien}</TableCell>
                        <TableCell>{pemeriksaan.dokter}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{pemeriksaan.diagnosis}</TableCell>
                        <TableCell>
                          {pemeriksaan.isVerified ? (
                            <span className="status-badge status-selesai flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="status-badge status-menunggu">Pending</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setViewingPemeriksaan(pemeriksaan)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog Pemeriksaan */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          resetForm();
          setSelectedAntrian(null);
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Pemeriksaan Pasien
            </DialogTitle>
          </DialogHeader>
          
          {selectedAntrian && (
            <div className="space-y-6 pt-4">
              {/* Info Pasien */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Nama Pasien</p>
                  <p className="font-medium">{selectedAntrian.namaPasien}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">No. RM</p>
                  <p className="font-medium font-mono">{selectedAntrian.noRekamMedis}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Jenis Layanan</p>
                  <p className="font-medium">{selectedAntrian.jenisLayanan}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">No. Antrian</p>
                  <p className="font-medium">{selectedAntrian.noAntrian}</p>
                </div>
              </div>

              {/* Keluhan Pasien */}
              <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-xs text-warning font-medium mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Keluhan Pasien
                </p>
                <p className="text-sm">{selectedAntrian.keluhanPasien}</p>
              </div>

              {/* Dokter */}
              <div className="space-y-2">
                <Label>Dokter Pemeriksa *</Label>
                <Select value={formData.dokter} onValueChange={(v) => handleInputChange('dokter', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih dokter" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOKTER_LIST.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Riwayat Kesehatan */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Riwayat Kesehatan
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Alergi</Label>
                    <Input
                      placeholder="Pisahkan dengan koma (contoh: Penisilin, Seafood)"
                      value={formData.alergi}
                      onChange={(e) => handleInputChange('alergi', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Riwayat Penyakit</Label>
                    <Input
                      placeholder="Pisahkan dengan koma (contoh: Diabetes, Hipertensi)"
                      value={formData.riwayatPenyakit}
                      onChange={(e) => handleInputChange('riwayatPenyakit', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Pemeriksaan Fisik */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Pemeriksaan Fisik
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Activity className="w-3 h-3" /> TD (mmHg)
                    </Label>
                    <Input
                      placeholder="120/80"
                      value={formData.tekananDarah}
                      onChange={(e) => handleInputChange('tekananDarah', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Heart className="w-3 h-3" /> DJ (bpm)
                    </Label>
                    <Input
                      placeholder="80"
                      value={formData.denyutJantung}
                      onChange={(e) => handleInputChange('denyutJantung', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Thermometer className="w-3 h-3" /> Suhu (°C)
                    </Label>
                    <Input
                      placeholder="36.5"
                      value={formData.suhu}
                      onChange={(e) => handleInputChange('suhu', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Wind className="w-3 h-3" /> Respirasi
                    </Label>
                    <Input
                      placeholder="18"
                      value={formData.respirasi}
                      onChange={(e) => handleInputChange('respirasi', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Weight className="w-3 h-3" /> Berat (kg)
                    </Label>
                    <Input
                      placeholder="70"
                      value={formData.berat}
                      onChange={(e) => handleInputChange('berat', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Ruler className="w-3 h-3" /> Tinggi (cm)
                    </Label>
                    <Input
                      placeholder="170"
                      value={formData.tinggi}
                      onChange={(e) => handleInputChange('tinggi', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Lingkar Perut (cm)</Label>
                    <Input
                      placeholder="80"
                      value={formData.lingkarPerut}
                      onChange={(e) => handleInputChange('lingkarPerut', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Lingkar Lengan (cm)</Label>
                    <Input
                      placeholder="25"
                      value={formData.lingkarLengan}
                      onChange={(e) => handleInputChange('lingkarLengan', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Catatan Dokter */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-primary" />
                  Catatan Dokter
                </h4>
                
                <div className="space-y-2">
                  <Label>Diagnosis *</Label>
                  <Textarea
                    placeholder="Diagnosis dokter"
                    value={formData.diagnosis}
                    onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tindakan</Label>
                  <Textarea
                    placeholder="Tindakan yang dilakukan"
                    value={formData.tindakan}
                    onChange={(e) => handleInputChange('tindakan', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Obat-obatan</Label>
                  <Input
                    placeholder="Pisahkan dengan koma (contoh: Paracetamol 500mg 3x1, Amoxicillin 500mg 3x1)"
                    value={formData.obatObatan}
                    onChange={(e) => handleInputChange('obatObatan', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rencana Perawatan</Label>
                  <Textarea
                    placeholder="Rencana perawatan yang diberikan"
                    value={formData.rencanaPeawatan}
                    onChange={(e) => handleInputChange('rencanaPeawatan', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tindak Lanjut</Label>
                  <Input
                    placeholder="Jadwal kontrol atau instruksi lanjutan"
                    value={formData.tindakLanjut}
                    onChange={(e) => handleInputChange('tindakLanjut', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSubmitPemeriksaan}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Selesai & Verifikasi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Detail Pemeriksaan */}
      <Dialog open={!!viewingPemeriksaan} onOpenChange={() => setViewingPemeriksaan(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Detail Pemeriksaan
            </DialogTitle>
          </DialogHeader>
          {viewingPemeriksaan && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Pasien</p>
                  <p className="font-medium">{viewingPemeriksaan.namaPasien}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">No. RM</p>
                  <p className="font-medium font-mono">{viewingPemeriksaan.noRekamMedis}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal</p>
                  <p className="font-medium">{new Date(viewingPemeriksaan.tanggal).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dokter</p>
                  <p className="font-medium">{viewingPemeriksaan.dokter}</p>
                </div>
              </div>

              <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-xs text-warning font-medium mb-1">Keluhan Pasien</p>
                <p className="text-sm">{viewingPemeriksaan.keluhanPasien}</p>
              </div>

              {/* Riwayat Kesehatan */}
              {(viewingPemeriksaan.alergi.length > 0 || viewingPemeriksaan.riwayatPenyakit.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {viewingPemeriksaan.alergi.length > 0 && (
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="text-xs text-destructive font-medium mb-1">⚠️ Alergi</p>
                      <p className="text-sm">{viewingPemeriksaan.alergi.join(', ')}</p>
                    </div>
                  )}
                  {viewingPemeriksaan.riwayatPenyakit.length > 0 && (
                    <div className="p-3 bg-warning/10 rounded-lg">
                      <p className="text-xs text-warning font-medium mb-1">📋 Riwayat Penyakit</p>
                      <p className="text-sm">{viewingPemeriksaan.riwayatPenyakit.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Vital Signs */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-primary/5 rounded-lg text-center">
                  <Activity className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">TD</p>
                  <p className="font-semibold text-sm">{viewingPemeriksaan.pemeriksaanFisik.tekananDarah || '-'}</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg text-center">
                  <Heart className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">DJ</p>
                  <p className="font-semibold text-sm">{viewingPemeriksaan.pemeriksaanFisik.denyutJantung || '-'} bpm</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg text-center">
                  <Thermometer className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Suhu</p>
                  <p className="font-semibold text-sm">{viewingPemeriksaan.pemeriksaanFisik.suhu || '-'} °C</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg text-center">
                  <Wind className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Respirasi</p>
                  <p className="font-semibold text-sm">{viewingPemeriksaan.pemeriksaanFisik.respirasi || '-'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Diagnosis</p>
                  <p className="p-3 bg-muted/50 rounded-lg">{viewingPemeriksaan.diagnosis}</p>
                </div>
                {viewingPemeriksaan.tindakan && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tindakan</p>
                    <p className="p-3 bg-muted/50 rounded-lg">{viewingPemeriksaan.tindakan}</p>
                  </div>
                )}
                {viewingPemeriksaan.obatObatan.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Obat-obatan</p>
                    <ul className="p-3 bg-muted/50 rounded-lg list-disc list-inside">
                      {viewingPemeriksaan.obatObatan.map((obat, i) => (
                        <li key={i} className="text-sm">{obat}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {viewingPemeriksaan.tindakLanjut && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tindak Lanjut</p>
                    <p className="p-3 bg-muted/50 rounded-lg">{viewingPemeriksaan.tindakLanjut}</p>
                  </div>
                )}
              </div>

              {viewingPemeriksaan.isVerified && (
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Terverifikasi pada {new Date(viewingPemeriksaan.verifiedAt!).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
