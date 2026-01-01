import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  UserCheck,
  FileText,
  Search,
  Settings,
  LogOut,
  Calendar,
  Stethoscope,
  Menu,
  X,
  Users,
} from 'lucide-react';
import { logout, getSession } from '@/lib/auth';
import logoKlinik from '@/assets/logo-klinik.png';
import logoStikes from '@/assets/logo-stikes.png';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const getNavItems = (role?: string): NavItem[] => {
  const items: NavItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/' },
    { icon: <UserPlus className="w-5 h-5" />, label: 'Pendaftaran Baru', path: '/pendaftaran-baru' },
    { icon: <UserCheck className="w-5 h-5" />, label: 'Pendaftaran Lama', path: '/pendaftaran-lama' },
    { icon: <Stethoscope className="w-5 h-5" />, label: 'Pemeriksaan Dokter', path: '/pemeriksaan' },
    { icon: <FileText className="w-5 h-5" />, label: 'Riwayat Medis', path: '/riwayat-medis' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Jadwal Konsultasi', path: '/jadwal' },
    { icon: <Search className="w-5 h-5" />, label: 'Pencarian Pasien', path: '/pencarian' },
  ];
  
  if (role === 'superadmin' || role === 'admin') {
    items.push({ icon: <Users className="w-5 h-5" />, label: 'Manajemen User', path: '/manajemen-user' });
  }
  
  items.push({ icon: <Settings className="w-5 h-5" />, label: 'Pengaturan', path: '/pengaturan' });
  
  return items;
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const session = getSession();
  const navItems = getNavItems(session?.role);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  const NavContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <img src={logoKlinik} alt="Logo Klinik" className="w-12 h-12 rounded-full bg-white p-1" />
          <div>
            <h1 className="font-heading font-bold text-sm leading-tight">SIM KIA</h1>
            <p className="text-xs opacity-80">Klinik Asy-Syifa Husada</p>
          </div>
        </div>
        <div className="text-xs opacity-60">Versi 1.0</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setIsMobileOpen(false);
            }}
            className={location.pathname === item.path ? 'nav-item-active w-full' : 'nav-item w-full'}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-200 hover:bg-red-500/20 hover:text-red-100"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Keluar</span>
        </button>
        
        <div className="mt-4 pt-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <img src={logoStikes} alt="Logo STIKES" className="w-8 h-8" />
            <div className="text-xs opacity-70">
              <p>Support by</p>
              <p className="font-medium">STIKES Buana Husada</p>
            </div>
          </div>
          <p className="text-xs opacity-50">Design by Mochamad Bakhtiar Danuaji</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 gradient-primary text-sidebar-foreground
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <NavContent />
      </aside>
    </>
  );
}
