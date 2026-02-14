'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from 'next-themes';
import { Moon, Sun, LogOut, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 1. Handle Hydration & Scroll Effect
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    api.clearToken();
    router.push('/login');
  };

  if (!mounted) return null;

  // 2. Format Tanggal (Indonesia Fixed)
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 3. Ambil Inisial Nama (Misal: "Badar Zaki" -> "B")
  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A';

  return (
    <header 
      className={`
        sticky top-0 z-30 h-16 px-6 flex items-center justify-between transition-all duration-300
        ${scrolled 
          ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-xs' 
          : 'bg-transparent'
        }
      `}
    >
      
      {/* KIRI: Sapaan & Tanggal */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          Halo, <span className="text-primary">{user?.fullName || user?.username || 'Admin'}</span> 👋
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
          {currentDate}
        </p>
      </div>

      {/* KANAN: Controls */}
      <div className="flex items-center gap-4">
        
        {/* Toggle Dark Mode (Dengan Animasi) */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all focus:outline-none"
          title="Ganti Tema"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ y: -20, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Separator Vertikal Kecil */}
        <div className="h-6 w-px bg-border hidden sm:block"></div>

        {/* User Info (Desktop Only) */}
        <div className="hidden sm:flex items-center gap-3">
           <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground leading-none">{user?.fullName}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-1">{user?.role}</p>
           </div>
           {/* Avatar Circle */}
           <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold shadow-sm">
              {userInitial}
           </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-1"
          title="Keluar Aplikasi"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}