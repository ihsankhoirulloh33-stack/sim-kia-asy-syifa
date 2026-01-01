import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import PendaftaranBaru from "./pages/PendaftaranBaru";
import PendaftaranLama from "./pages/PendaftaranLama";
import RiwayatMedis from "./pages/RiwayatMedis";
import JadwalKonsultasi from "./pages/JadwalKonsultasi";
import PemeriksaanDokter from "./pages/PemeriksaanDokter";
import PencarianPasien from "./pages/PencarianPasien";
import Pengaturan from "./pages/Pengaturan";
import Login from "./pages/Login";
import ManajemenUser from "./pages/ManajemenUser";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/pendaftaran-baru" element={<ProtectedRoute><PendaftaranBaru /></ProtectedRoute>} />
          <Route path="/pendaftaran-lama" element={<ProtectedRoute><PendaftaranLama /></ProtectedRoute>} />
          <Route path="/riwayat-medis" element={<ProtectedRoute><RiwayatMedis /></ProtectedRoute>} />
          <Route path="/jadwal" element={<ProtectedRoute><JadwalKonsultasi /></ProtectedRoute>} />
          <Route path="/pemeriksaan" element={<ProtectedRoute><PemeriksaanDokter /></ProtectedRoute>} />
          <Route path="/pencarian" element={<ProtectedRoute><PencarianPasien /></ProtectedRoute>} />
          <Route path="/pengaturan" element={<ProtectedRoute><Pengaturan /></ProtectedRoute>} />
          <Route path="/manajemen-user" element={<ProtectedRoute><ManajemenUser /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
