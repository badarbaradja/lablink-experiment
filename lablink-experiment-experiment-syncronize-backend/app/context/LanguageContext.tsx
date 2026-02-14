"use client";
import React, { createContext, useContext, useState } from 'react';

type Language = 'id' | 'en';

const translations = {
  id: {
    dashboard: "Dashboard", // Tetap Dashboard (umum)
    projects: "Proyek",
    members: "Anggota",
    events: "Kegiatan",
    letters: "Surat",
    archives: "Arsip",
    presence: "Presensi",
    periods: "Periode",
    activity_logs: "Log Aktivitas",
    profile: "Profil",
    logout: "Keluar",
    welcome: "Halo",
  },
  en: {
    dashboard: "Dashboard",
    projects: "Projects",
    members: "Members",
    events: "Events",
    letters: "Letters",
    archives: "Archives",
    presence: "Presence",
    periods: "Periods",
    activity_logs: "Activity Logs",
    profile: "Profile",
    logout: "Logout",
    welcome: "Welcome",
  }
};

// Kita buat type context-nya
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Default value KOSONG dulu
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('id');

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  // Guard Clause: Kalau lupa pasang provider, kasih error jelas
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}