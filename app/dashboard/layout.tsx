'use client';

import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import { SidebarProvider, useSidebar } from '@/app/context/SidebarContext';
import { motion } from 'framer-motion';

// Inner Component - Menggunakan hook useSidebar & Framer Motion
function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  // Easing yang sangat halus (Luxurious feel)
  const easeCustom = [0.25, 0.1, 0.25, 1.0] as const;

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      
      {/* 1. ANIMASI SIDEBAR (REVISI SESUAI VIDEO) 
        - Tidak lagi dari '-100%'. 
        - Hanya bergeser sedikit (-50px) dan fade in dari opacity 0.
        - Durasi diperlama (1.2s) agar munculnya perlahan seperti di video.
      */}
      <motion.div
        initial={{ x: -50, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }}
        transition={{ 
          duration: 1.2, 
          ease: easeCustom,
          delay: 0.3 // Mulai muncul saat layar login sedang terbuka
        }}
        className="fixed inset-y-0 left-0 z-40 h-full shadow-xl"
      >
        <Sidebar />
      </motion.div>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-500 ease-in-out ${
          isCollapsed ? 'ml-24' : 'ml-72'
        }`}
      >
        
        {/* 2. ANIMASI HEADER (REVISI SESUAI VIDEO)
          - Tidak lagi turun dari langit-langit.
          - Hanya turun sedikit (-50px) dan fade in.
        */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            duration: 1.0, 
            ease: easeCustom,
            delay: 0.5 // Muncul sedikit setelah sidebar terlihat
          }}
          className="sticky top-0 z-30"
        >
          <Header />
        </motion.div>
        
        {/* 3. ANIMASI PAGE CONTENT (Fade In & Scale Up Sedikit)
          - Memberikan efek konten muncul ke permukaan.
        */}
        <motion.main 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1.0, 
            delay: 0.7, // Muncul paling terakhir
            ease: easeCustom 
          }}
          className="flex-1 p-6 overflow-x-hidden"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

// Outer Component - Provider Wrapper
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>
        {children}
      </DashboardContent>
    </SidebarProvider>
  );
}