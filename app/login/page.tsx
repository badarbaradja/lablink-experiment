'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { LoginResponse } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext';
import { motion, Variants } from 'framer-motion';
import { Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post<LoginResponse>('/auth/login', formData);
      api.setToken(response.token);
      localStorage.setItem('token', response.token); 

      // Trigger animasi keluar
      setIsExiting(true);

      // Delay routing agar animasi selesai
      setTimeout(() => {
        authLogin(response.token, response.user);
        if (!response.user.isPasswordChanged) {
           router.push('/dashboard/profile');
        } else {
           router.push('/dashboard');
        }
      }, 800); 

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
      setIsLoading(false); 
    }
  };

  // --- CONFIG ANIMASI ---
  const easeCustom = [0.76, 0, 0.24, 1] as const; 

  const leftPanelVariants: Variants = {
    initial: { x: 0, opacity: 1 },
    exit: { 
      x: '-100%', 
      opacity: 0,
      transition: { duration: 0.8, ease: easeCustom } 
    }
  };

  const rightPanelVariants: Variants = {
    initial: { x: 0, opacity: 1 },
    exit: { 
      x: '100%', 
      opacity: 0,
      transition: { duration: 0.8, ease: easeCustom }
    }
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { delay: 0.2, duration: 0.6 } 
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white">
      
      {/* === LEFT PANEL (BRANDING - MAROON) === */}
      <motion.div 
        className="hidden lg:flex w-1/2 bg-linear-to-br from-red-900 via-red-800 to-red-950 relative items-center justify-center text-white overflow-hidden"
        variants={leftPanelVariants}
        initial="initial"
        animate={isExiting ? "exit" : "initial"}
      >
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-red-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-orange-600/10 rounded-full blur-[120px]"></div>

        <motion.div 
          className="relative z-10 text-center px-12"
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          {/* LOGO MBC ASLI */}
          <div className="mb-8 inline-flex items-center justify-center">
             <div className="w-32 h-32 bg-white p-4 rounded-3xl flex items-center justify-center shadow-2xl shadow-black/20 transform hover:scale-105 transition-transform duration-300">
                {/* Menggunakan Standard IMG tag sesuai request */}
                <img 
                  alt="MBC Lab" 
                  className="w-full h-full object-contain" 
                  src="/Logo-mbc lab.png" 
                />
             </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 tracking-tight text-white drop-shadow-sm">
            Multimedia & Big Data <br/> Computing Laboratory
          </h1>
          <p className="text-lg text-red-100/80 leading-relaxed max-w-md mx-auto font-light">
            Platform manajemen terintegrasi untuk riset, proyek, dan administrasi laboratorium.
          </p>
        </motion.div>
      </motion.div>

      {/* === RIGHT PANEL (FORM - LIGHT MODE) === */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative"
        variants={rightPanelVariants}
        initial="initial"
        animate={isExiting ? "exit" : "initial"}
      >
        <div className="w-full max-w-md space-y-8 relative z-10">
          
          {/* Header Mobile Only (Logo Kecil) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-block p-3 bg-white border border-gray-100 shadow-md rounded-xl mb-4">
               <img 
                  alt="MBC Lab" 
                  className="w-12 h-12 object-contain" 
                  src="/Logo-mbc lab.png" 
               />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">LabLink</h1>
          </div>

          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={contentVariants}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Selamat Datang 👋</h2>
              <p className="text-gray-500">
                Masukkan kredensial akun LabLink Anda untuk masuk.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold leading-none text-gray-700" htmlFor="username">
                  Username / NIM
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-red-600 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Masukkan username atau NIM"
                    className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:bg-white hover:border-gray-300"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={isLoading || isExiting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold leading-none text-gray-700" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-red-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:bg-white hover:border-gray-300"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading || isExiting}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isExiting}
                className="group relative w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-red-700 text-white hover:bg-red-800 transition-all duration-300 shadow-lg shadow-red-900/20 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-2 font-medium"
              >
                {/* Background Animation on Hover */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                
                <span className="relative flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Memproses...
                    </>
                  ) : isExiting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Masuk ke Dashboard...
                    </>
                  ) : (
                    <>
                      Masuk Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="text-center text-sm text-gray-500 mt-8">
              <p>© 2026 MBC Laboratory. All rights reserved.</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}