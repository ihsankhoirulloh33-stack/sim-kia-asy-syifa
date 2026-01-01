import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, UserCheck, CheckCircle2, TrendingUp, Calendar, Activity } from 'lucide-react';
import { getStatistik, getAntrianHariIni, getAllJadwal, initializeSampleData, type Antrian } from '@/lib/storage';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  variant: 'primary' | 'warning' | 'info' | 'success';
}

function StatCard({ title, value, icon, description, variant }: StatCardProps) {
  const variantClasses = {
    primary: 'stat-card-primary',
    warning: 'stat-card-warning',
    info: 'stat-card-info',
    success: 'stat-card-success',
  };

  return (
    <div className={`${variantClasses[variant]} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-xs mt-2 opacity-70">{description}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPasien: 0,
    pasienAktif: 0,
    pasienSembuh: 0,
    pasienKronis: 0,
    menunggu: 0,
    sedangDilayani: 0,
    selesai: 0,
  });
  const [antrian, setAntrian] = useState<Antrian[]>([]);
  const [jadwalHariIni, setJadwalHariIni] = useState(0);

  useEffect(() => {
    initializeSampleData();
    const statistik = getStatistik();
    setStats(statistik);
    setAntrian(getAntrianHariIni());
    
    const today = new Date().toISOString().split('T')[0];
    const jadwal = getAllJadwal().filter(j => j.tanggal === today);
    setJadwalHariIni(jadwal.length);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'Menunggu': 'status-badge status-menunggu',
      'Sedang Dilayani': 'status-badge status-dilayani',
      'Selesai': 'status-badge status-selesai',
    };
    return statusClasses[status] || 'status-badge';
  };

  return (
    <MainLayout title="Dashboard" subtitle="Selamat datang di Sistem Informasi Manajemen KIA">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Pasien"
          value={stats.totalPasien}
          icon={<Users className="w-6 h-6" />}
          description="Pasien terdaftar di klinik"
          variant="primary"
        />
        <StatCard
          title="Pasien Menunggu"
          value={stats.menunggu}
          icon={<Clock className="w-6 h-6" />}
          description="Dalam antrian hari ini"
          variant="warning"
        />
        <StatCard
          title="Sedang Dilayani"
          value={stats.sedangDilayani}
          icon={<UserCheck className="w-6 h-6" />}
          description="Proses pemeriksaan"
          variant="info"
        />
        <StatCard
          title="Selesai"
          value={stats.selesai}
          icon={<CheckCircle2 className="w-6 h-6" />}
          description="Pelayanan selesai hari ini"
          variant="success"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Antrian Hari Ini */}
        <Card className="lg:col-span-2 animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Antrian Hari Ini
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('id-ID')}
            </span>
          </CardHeader>
          <CardContent>
            {antrian.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Belum ada antrian hari ini
              </p>
            ) : (
              <div className="space-y-3">
                {antrian.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {item.noAntrian}
                      </div>
                      <div>
                        <p className="font-medium">{item.namaPasien}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.waktuDaftar).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={getStatusBadge(item.status)}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-success" />
                Status Pasien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm">Aktif</span>
                </div>
                <span className="font-semibold">{stats.pasienAktif}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-info"></div>
                  <span className="text-sm">Sembuh</span>
                </div>
                <span className="font-semibold">{stats.pasienSembuh}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span className="text-sm">Kronis</span>
                </div>
                <span className="font-semibold">{stats.pasienKronis}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                Jadwal Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-primary">{jadwalHariIni}</p>
                <p className="text-sm text-muted-foreground mt-1">Konsultasi terjadwal</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
