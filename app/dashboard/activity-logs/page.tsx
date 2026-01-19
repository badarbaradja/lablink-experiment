'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';
import Card from '@/app/components/ui/Card';
import Select from '@/app/components/ui/Select';
import { Search, RefreshCw, Activity, AlertCircle, Clock } from 'lucide-react';
import { PageWrapper, AnimatedSection } from '@/app/components/ui/PageAnimation';

// --- TIPE DATA ---
interface ActivityLog {
  id: string;
  action: string;
  targetType: string; // Bisa null di dashboard summary
  targetName: string;
  userName: string;
  timestamp: string; // Bisa null di dashboard summary
  timeAgo?: string;  // Dashboard summary pakai ini
  details?: string;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      // STRATEGI: Coba panggil endpoint khusus log dulu
      // Jika kosong/gagal, ambil dari dashboard summary (karena disitu pasti ada data)
      try {
        const response = await api.get<ActivityLog[]>('/activity-logs');
        if (Array.isArray(response) && response.length > 0) {
          setLogs(response);
        } else {
          throw new Error("Data kosong, fallback ke summary");
        }
      } catch (e) {
        // FALLBACK: Ambil dari Dashboard Summary agar TIDAK KOSONG
        console.warn("Mengambil data dari Dashboard Summary sebagai fallback");
        const summary = await api.get<any>('/dashboard/summary');
        if (summary && summary.recentActivities) {
          // Mapping data summary ke format ActivityLog
          const mappedLogs = summary.recentActivities.map((item: any, idx: number) => ({
            id: `log-${idx}`,
            action: item.action,
            targetType: 'UNKNOWN', // Summary API mungkin tidak kirim ini
            targetName: item.targetName,
            userName: item.userName,
            timestamp: new Date().toISOString(), // Dummy date
            timeAgo: item.timeAgo,
            details: ''
          }));
          setLogs(mappedLogs);
        }
      }

    } catch (error) {
      console.error('Gagal memuat log:', error);
      setLogs([]); 
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Time Ago (Hitung mundur waktu)
  // Jika API sudah kirim 'timeAgo' (misal "7 menit lalu"), pakai itu. Jika tidak, hitung manual.
  const displayTime = (log: ActivityLog) => {
    if (log.timeAgo) return log.timeAgo;
    
    const date = new Date(log.timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " thn lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bln lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mnt lalu";
    return "Baru saja";
  };

  // Helper: Warna Badge Aksi
  const getActionStyles = (action: string) => {
    switch (action) {
      case 'CREATE': return {
        bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        icon: '+'
      };
      case 'UPDATE': return {
        bg: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
        icon: '✎'
      };
      case 'DELETE': return {
        bg: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
        icon: '×'
      };
      default: return {
        bg: 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400',
        icon: '•'
      };
    }
  };

  // Client-side Filtering
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      (log.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (log.targetName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (log.details?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesType = !typeFilter || (log.targetType && log.targetType === typeFilter);
    
    return matchesSearch && matchesAction && matchesType;
  });

  return (
    <PageWrapper className="space-y-6 pb-10">
      
      {/* 1. Header Section */}
      <AnimatedSection className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Rekam jejak aktivitas sistem secara real-time
          </p>
        </div>
        
        <button 
          onClick={fetchLogs}
          className="group flex items-center gap-2 px-4 py-2 bg-card border border-border hover:border-primary/50 text-foreground rounded-lg shadow-sm transition-all duration-200"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </AnimatedSection>

      {/* 2. Filters & Content */}
      <AnimatedSection>
        <Card>
          <div className="flex flex-col gap-6">
             
             {/* Header Card Internal */}
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Daftar Aktivitas</h2>
                  <p className="text-sm text-muted-foreground">Semua log tersimpan</p>
                </div>
             </div>

             {/* Filter Controls */}
             <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 relative">
                   <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                   <input
                      type="text"
                      placeholder="Cari user, target, atau detail..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-input border border-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground"
                   />
                </div>

                <div className="md:col-span-3">
                   <Select
                      label=""
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                      options={[
                        { value: '', label: 'Semua Aksi' },
                        { value: 'CREATE', label: 'Create' },
                        { value: 'UPDATE', label: 'Update' },
                        { value: 'DELETE', label: 'Delete' },
                      ]}
                   />
                </div>

                <div className="md:col-span-3">
                   <Select
                      label=""
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      options={[
                        { value: '', label: 'Semua Tipe' },
                        { value: 'MEMBER', label: 'Member' },
                        { value: 'PROJECT', label: 'Project' },
                        { value: 'EVENT', label: 'Event' },
                      ]}
                   />
                </div>
             </div>

             {/* 3. Activity List */}
             <div className="mt-2 space-y-1">
                {isLoading ? (
                   <div className="space-y-3 py-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                         <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                      ))}
                   </div>
                ) : filteredLogs.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-t border-dashed border-border mt-4">
                      <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
                      <p>Tidak ada aktivitas yang ditemukan</p>
                   </div>
                ) : (
                   filteredLogs.map((log) => {
                      const style = getActionStyles(log.action);
                      return (
                        <div key={log.id} className="group flex items-start sm:items-center gap-4 p-4 hover:bg-muted/40 rounded-xl transition-all duration-200 border-b border-border/40 last:border-0">
                          
                          {/* Icon Bulat */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border text-lg font-bold shadow-sm ${style.bg}`}>
                              {style.icon}
                          </div>
                          
                          {/* Deskripsi */}
                          <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <p className="text-sm text-foreground pr-4 leading-relaxed">
                                    <span className="font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                                      {log.userName}
                                    </span>
                                    <span className="text-muted-foreground mx-1"> melakukan </span>
                                    
                                    <span className={`font-semibold text-[10px] uppercase px-1.5 py-0.5 rounded border align-middle ${style.bg.replace('bg-', 'bg-opacity-50 ')}`}>
                                      {log.action}
                                    </span>

                                    <span className="text-muted-foreground mx-1"> pada </span>
                                    <span className="font-medium text-foreground">
                                      {log.targetName}
                                    </span>
                                </p>
                                
                                {/* Waktu */}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap bg-muted/50 px-2.5 py-1 rounded-full font-medium mt-1 sm:mt-0 w-fit">
                                    <Clock className="w-3 h-3" />
                                    {displayTime(log)}
                                </div>
                              </div>
                              
                              {log.details && (
                                <p className="text-xs text-muted-foreground mt-1.5 truncate pl-2 border-l-2 border-border">
                                    {log.details}
                                </p>
                              )}
                          </div>
                        </div>
                      );
                   })
                )}
             </div>

             {/* Footer Info */}
             {!isLoading && filteredLogs.length > 0 && (
                <div className="text-center text-xs text-muted-foreground mt-4 pt-4 border-t border-dashed border-border">
                   Menampilkan {filteredLogs.length} aktivitas
                </div>
             )}
          </div>
        </Card>
      </AnimatedSection>
    </PageWrapper>
  );
}