'use client';

import { ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ 
  title, 
  description = "Fitur ini sedang dalam tahap pengembangan. Nantikan pembaruan selanjutnya!" 
}: ComingSoonProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-75"></div>
        <div className="relative bg-slate-800/50 p-6 rounded-full border border-slate-700 shadow-2xl animate-bounce duration-[2000ms]">
          <Construction className="w-16 h-16 text-blue-400" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
        {title}
      </h1>
      <h2 className="text-2xl font-semibold text-white mb-2">
        Coming Soon
      </h2>

      <p className="text-slate-400 max-w-md mb-8 text-lg">
        {description}
      </p>

      <Link 
        href="/dashboard"
        className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1"
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
