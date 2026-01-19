'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/app/lib/api';
import { Member } from '@/app/types';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
import { EXPERT_DIVISIONS, DEPARTMENTS } from '@/app/lib/constants';
import { User, Lock, Mail, Phone, Link as LinkIcon, Briefcase, Building, ShieldAlert } from 'lucide-react';
// IMPORT ANIMASI
import { PageWrapper, AnimatedSection } from '@/app/components/ui/PageAnimation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [memberData, setMemberData] = useState<Member | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    email: '',
    phoneNumber: '',
    socialMediaLink: '',
    expertDivision: '',
    department: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchMemberData();
    }
  }, [user?.id]);

  const fetchMemberData = async () => {
    try {
      const data = await api.get<Member>(`/members/${user!.id}`);
      setMemberData(data);
      setProfileForm({
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        socialMediaLink: data.socialMediaLink || '',
        expertDivision: data.expertDivision || '',
        department: data.department || '',
      });
    } catch (err) {
      showError('Gagal memuat data profile');
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoadingProfile(true);
      await api.put('/auth/profile', profileForm);
      success('Profile berhasil diperbarui!');
      fetchMemberData(); 
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal memperbarui profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('Password baru tidak cocok');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showError('Password minimal 6 karakter');
      return;
    }

    try {
      setIsLoadingPassword(true);
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      success('Password berhasil diubah! Silakan login kembali');
      
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 2000);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal mengubah password');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  if (!user) return null;

  const mustChangePassword = !user.isPasswordChanged;

  return (
    <PageWrapper className="space-y-8 pb-10">
      
      {/* 1. Warning Banner (Jika Belum Ganti Password) */}
      {mustChangePassword && (
        <AnimatedSection>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">Penting: Keamanan Akun</h2>
              <p className="text-sm text-red-600/90 dark:text-red-400/90 mt-0.5">Anda masih menggunakan password default. Segera ubah password Anda untuk keamanan.</p>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* 2. Hero Profile Header */}
      {/* 2. Hero Profile Header */}
      <AnimatedSection>
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm group">
          {/* Background Gradient - Nuansa Lab MBC (Ungu-Biru Modern) */}
          <div className="absolute top-0 left-0 w-full h-full md:h-48 bg-linear-to-r from-violet-600 to-indigo-600 opacity-100"></div>
          
          {/* Pattern Overlay (Opsional - agar tidak terlalu polos) */}
          <div className="absolute inset-0 bg-[url('/file.svg')] opacity-5 bg-repeat space-x-4"></div>

          <div className="relative px-8 pb-8 pt-8 md:pt-24">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar - Diberi Border Putih Tebal agar Kontras */}
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl ring-4 ring-white/30 z-10">
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-violet-700 select-none">
                  {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              
              {/* User Info - TEKS DIPAKSA PUTIH AGAR KONTRAS DENGAN GRADIENT */}
              <div className="flex-1 text-center md:text-left mb-2 z-10">
                <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-tight">
                  {user.fullName}
                </h1>
                
                {/* Username dengan warna putih agak transparan */}
                <p className="text-white/80 font-medium text-lg mt-1">
                  @{user.username}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                  {/* Badge Role - Menggunakan background putih transparan (Glassmorphism) */}
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                    {user.role}
                  </span>
                  
                  {memberData?.expertDivision && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/20 text-white border border-white/10 backdrop-blur-sm">
                      {memberData.expertDivision}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 3. Edit Profile Form */}
        {!mustChangePassword && (
          <AnimatedSection>
            <Card className="h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Informasi Pribadi</h2>
                  <p className="text-sm text-muted-foreground">Perbarui data diri Anda</p>
                </div>
              </div>
            
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">NIM / Username</label>
                    <div className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground text-sm font-medium">
                      {user.username}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Nama Lengkap</label>
                    <div className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground text-sm font-medium">
                      {user.fullName}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-9 w-4 h-4 text-muted-foreground z-10" />
                    <Input label="Email" type="email" name="email" value={profileForm.email} onChange={handleProfileChange} placeholder="email@example.com" className="pl-9" />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-9 w-4 h-4 text-muted-foreground z-10" />
                    <Input label="Nomor Telepon" type="tel" name="phoneNumber" value={profileForm.phoneNumber} onChange={handleProfileChange} placeholder="08123456789" className="pl-9" />
                  </div>

                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-9 w-4 h-4 text-muted-foreground z-10" />
                    <Input label="Social Media Link" type="url" name="socialMediaLink" value={profileForm.socialMediaLink} onChange={handleProfileChange} placeholder="https://linkedin.com/in/username" className="pl-9" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-9 w-4 h-4 text-muted-foreground z-10" />
                        <Select label="Divisi Keahlian" name="expertDivision" value={profileForm.expertDivision} onChange={handleProfileChange} options={EXPERT_DIVISIONS} className="pl-9" />
                    </div>
                    <div className="relative">
                        <Building className="absolute left-3 top-9 w-4 h-4 text-muted-foreground z-10" />
                        <Select label="Departemen" name="department" value={profileForm.department} onChange={handleProfileChange} options={DEPARTMENTS} className="pl-9" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" isLoading={isLoadingProfile} className="w-full">
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </Card>
          </AnimatedSection>
        )}

        {/* 4. Change Password Form */}
        <AnimatedSection>
          <Card className="h-full border-red-200 dark:border-red-900/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Keamanan</h2>
                <p className="text-sm text-muted-foreground">Ubah password akun</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <Input label="Password Saat Ini" type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
              
              <div className="space-y-4">
                <Input label="Password Baru" type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required />
                <Input label="Konfirmasi Password Baru" type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">Perhatian</h4>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-amber-600/90 dark:text-amber-500/90">
                      <li>Password minimal 6 karakter.</li>
                      <li>Anda akan logout otomatis setelah berhasil.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button type="submit" isLoading={isLoadingPassword} variant="danger" className="w-full">
                Ubah Password
              </Button>
            </form>
          </Card>
        </AnimatedSection>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </PageWrapper>
  );
}