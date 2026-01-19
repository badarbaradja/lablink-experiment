'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// === KONFIGURASI ANIMASI "MEWAH" ===

// 1. Container: Mengatur tempo munculnya anak-anak (stagger)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Jeda 0.1 detik antar elemen (Flowing effect)
      delayChildren: 0.1,   // Tunggu sebentar sebelum mulai
    }
  }
};

// 2. Item: Efek muncul dari bawah ke atas (Fade Up)
const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30, // Geser ke bawah 30px
    scale: 0.98 // Sedikit lebih kecil
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      // Cubic Bezier untuk efek "Smooth/Mahal" (seperti iOS)
      duration: 0.8, 
      ease: [0.2, 0.65, 0.3, 0.9] 
    }
  }
};

// === KOMPONEN UTAMA ===

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

// Gunakan ini untuk membungkus SATU HALAMAN PENUH
export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Gunakan ini untuk membungkus SETIAP BAGIAN (Card, Header, Table) agar muncul berurutan
export function AnimatedSection({ children, className = "" }: PageWrapperProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}