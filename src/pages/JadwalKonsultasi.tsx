import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getAllJadwal, saveJadwal, deleteJadwal, getAllPasien, type JadwalKonsultasi as JadwalType, type Pasien } from '@/lib/storage';
import { Calendar, Plus, Edit2, Trash2, Clock, User, Stethoscope } from 'lucide-react';

const jenisKonsultasiOptions = ['Pemeriksaan Umum', 'Kontrol', 'Konsultasi', 'Darurat', 'Spesialis'];
const statusOptions = ['Terjadwal', 'Dikonfirmasi', 'Selesai', 'Dibatalkan'];
const dokterList = ['dr. Bambang Wijaya', 'dr. Dewi Kusuma', 'dr. Ahmad Fauzi', 'dr. Sri Wahyuni'];

export default function JadwalKonsultasi() {
  const { toast } = useToast();
  const [jadwalList, setJadwalList] = useState<JadwalType[]>([]);
  const [pasienList, setPasienList] = useState<Pasien[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<JadwalType | null>(null);
  
  const [formData, setFormData] = useState({
    pasienId: '',
    tanggal: '',
    waktu: '',
    dokter: '',
    jenisKonsultasi: '',
    catatan: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setJadwalList(getAllJadwal());
    setPasienList(getAllPasien());
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      pasienId: '',
      tanggal: '',
      waktu: '',
      dokter: '',
      jenisKonsultasi: '',
      catatan: '',
    });
    setEditingJadwal(null);
  };

  const handleSubmit = () => {
    if (!formData.pasienId || !formData.tanggal || !formData.waktu || !formData.dokter || !formData.jenisKonsultasi) {
      toast({
        title: 'Validasi Gagal',
        description: 'Mohon lengkapi semua field yang wajib',
        variant: 'destructive',
      });
      return;
    }

    const pasien = pasienList.find(p => p.id === formData.pasienId);
    
    const jadwal: JadwalType = {
      id: editingJadwal?.id || Date.now().toString(),
      pasienId: formData.pasienId,
      namaPasien: pasien?.nama || '',
      tanggal: formData.tanggal,
      waktu: formData.waktu,
      dokter: formData.dokter,
      jenisKonsultasi: formData.jenisKonsultasi as JadwalType['jenisKonsultasi'],
      status: editingJadwal?.status || 'Terjadwal',
      catatan: formData.catatan,
    };

    saveJadwal(jadwal);
    loadData();
    resetForm();
    setIsDialogOpen(false);

    toast({
      title: editingJadwal ? 'Jadwal Diperbarui' : 'Jadwal Ditambahkan',
      description: `Jadwal konsultasi untuk ${pasien?.nama} berhasil ${editingJadwal ? 'diperbarui' : 'ditambahkan'}`,
    });
  };

  const handleEdit = (jadwal: JadwalType) => {
    setEditingJadwal(jadwal);
    setFormData({
      pasienId: jadwal.pasienId,
      tanggal: jadwal.tanggal,
      waktu: jadwal.waktu,
      dokter: jadwal.dokter,
      jenisKonsultasi: jadwal.jenisKonsultasi,
      catatan: jadwal.catatan || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      deleteJadwal(id);
      loadData();
      toast({
        title: 'Jadwal Dihapus',
        description: 'Jadwal konsultasi berhasil dihapus',
      });
    }
  };

  const handleStatusChange = (jadwal: JadwalType, newStatus: string) => {
    const updated = { ...jadwal, status: newStatus as JadwalType['status'] };
    saveJadwal(updated);
    loadData();
    toast({
      title: 'Status Diperbarui',
      description: `Status jadwal diubah menjadi ${newStatus}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'Terjadwal': 'status-badge status-menunggu',
      'Dikonfirmasi': 'status-badge status-dilayani',
      'Selesai': 'status-badge status-selesai',
      'Dibatalkan': 'status-badge status-dibatalkan',
    };
    return statusClasses[status] || 'status-badge';
  };

  return (
    <MainLayout title="Jadwal Konsultasi" subtitle="Kelola jadwal konsultasi pasien">
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Daftar Jadwal
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Jadwal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingJadwal ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Pasien *</Label>
                    <Select value={formData.pasienId} onValueChange={(v) => handleInputChange('pasienId', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pasien" />
                      </SelectTrigger>
                      <SelectContent>
                        {pasienList.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nama} ({p.noRekamMedis})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tanggal *</Label>
                      <Input
                        type="date"
                        value={formData.tanggal}
                        onChange={(e) => handleInputChange('tanggal', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Waktu *</Label>
                      <Input
                        type="time"
                        value={formData.waktu}
                        onChange={(e) => handleInputChange('waktu', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dokter *</Label>
                    <Select value={formData.dokter} onValueChange={(v) => handleInputChange('dokter', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih dokter" />
                      </SelectTrigger>
                      <SelectContent>
                        {dokterList.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Jenis Konsultasi *</Label>
                    <Select value={formData.jenisKonsultasi} onValueChange={(v) => handleInputChange('jenisKonsultasi', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis konsultasi" />
                      </SelectTrigger>
                      <SelectContent>
                        {jenisKonsultasiOptions.map((j) => (
                          <SelectItem key={j} value={j}>{j}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Catatan</Label>
                    <Input
                      placeholder="Catatan tambahan (opsional)"
                      value={formData.catatan}
                      onChange={(e) => handleInputChange('catatan', e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingJadwal ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Pasien</TableHead>
                  <TableHead>Dokter</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jadwalList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada jadwal konsultasi
                    </TableCell>
                  </TableRow>
                ) : (
                  jadwalList.map((jadwal) => (
                    <TableRow key={jadwal.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(jadwal.tanggal).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {jadwal.waktu}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {jadwal.namaPasien}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-muted-foreground" />
                          {jadwal.dokter}
                        </div>
                      </TableCell>
                      <TableCell>{jadwal.jenisKonsultasi}</TableCell>
                      <TableCell>
                        <Select
                          value={jadwal.status}
                          onValueChange={(v) => handleStatusChange(jadwal, v)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <span className={getStatusBadge(jadwal.status)}>{jadwal.status}</span>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(jadwal)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(jadwal.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
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
