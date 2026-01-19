'use client';

import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';
import { Project, Event } from '@/app/types'; 
import { useAuth } from '@/app/context/AuthContext';
import Card from '@/app/components/ui/Card';
import StatCard from '@/app/components/ui/StatCard';
import { Users, FolderOpen, Calendar, Archive as ArchiveIcon, Clock, Activity, AlertCircle } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- TIPE DATA ---
interface MonthlyStat {
  name: string;
  projects: number;
  events: number;
}

interface DashboardSummary {
  statistics: {
    totalMembers: number;
    activeMembers: number;
    totalProjects: number;
    activeProjects: number;
    totalEvents: number;
    ongoingEvents: number;
    totalArchives: number;
    totalLetters: number;
  };
  upcomingDeadlines: Array<{
    id: string;
    name: string;
    code: string;
    type: 'PROJECT' | 'EVENT';
    daysRemaining: number;
  }>;
  recentActivities: Array<{
    action: string;
    userName: string;
    targetName: string;
    timeAgo: string;
  }>;
}

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// --- HELPER: PROCESS DATA (UPDATED LOGIC) ---
const processChartData = (projects: Project[], events: Event[]): MonthlyStat[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Inisialisasi data 0 untuk semua bulan
  const stats = months.map(name => ({ name, projects: 0, events: 0 }));

  // 1. PROSES PROJECT (Berdasarkan DEADLINE / endDate)
  projects.forEach(p => {
    // Pastikan endDate ada. Jika null, skip (jangan masuk ke Januari)
    if (p.endDate) {
      const date = new Date(p.endDate);
      const monthIndex = date.getMonth();
      // Validasi: pastikan tanggal valid dan index bulan 0-11
      if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex <= 11) {
        stats[monthIndex].projects += 1;
      }
    }
  });

  // 2. PROSES EVENT (Berdasarkan eventDate atau startDate)
  events.forEach(e => {
    // Cek eventDate (sesuai API) atau fallback ke startDate
    // @ts-ignore - Mengabaikan type checking ketat sementara jika interface Event belum update
    const dateStr = e.eventDate || e.startDate; 
    
    if (dateStr) {
      const date = new Date(dateStr);
      const monthIndex = date.getMonth();
      if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex <= 11) {
        stats[monthIndex].events += 1;
      }
    }
  });

  return stats;
};

// --- COMPONENT: SKELETON LOADING ---
const CardSkeleton = ({ count = 1 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-muted/50 rounded-xl animate-pulse h-32 w-full border border-border/50" />
    ))}
  </>
);

// --- COMPONENT: EMPTY STATE ---
const EmptyState = ({ title, description }: { title: string, description: string }) => (
  <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
    <p className="font-semibold text-sm">{title}</p>
    <p className="text-xs">{description}</p>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  
  // State
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [chartData, setChartData] = useState<MonthlyStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      // Fetching Parallel
      const [summaryRes, projectsRes, eventsRes] = await Promise.all([
        api.get<DashboardSummary>('/dashboard/summary'),
        api.get<Project[]>('/projects'),
        api.get<Event[]>('/events')
      ]);

      setSummaryData(summaryRes);
      
      // Proses data untuk grafik
      const processedStats = processChartData(projectsRes, eventsRes);
      setChartData(processedStats);

    } catch (err) {
      console.error(err);
      setError(null); 
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* 1. HERO SECTION */}
      <motion.div variants={itemVariants} className="relative rounded-2xl p-8 shadow-xl overflow-hidden border border-red-900/20 group">
        <div className="absolute inset-0 bg-linear-to-r from-red-900 via-red-800 to-red-950 transition-transform duration-700 group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-md">
            Selamat Datang, {user?.fullName || 'Admin'}! 👋
          </h1>
          <p className="text-red-100 font-medium max-w-xl leading-relaxed">
            Pantau seluruh aktivitas laboratorium, progres proyek, dan kegiatan akademik dalam satu dashboard terintegrasi.
          </p>
        </div>
      </motion.div>

      {/* 2. STATS GRID */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            <StatCard
              title="Total Members"
              value={summaryData?.statistics.totalMembers || 0}
              subtitle={`${summaryData?.statistics.activeMembers || 0} active`}
              icon={Users} 
              color="blue"
            />
            <StatCard
              title="Total Projects"
              value={summaryData?.statistics.totalProjects || 0}
              subtitle={`${summaryData?.statistics.activeProjects || 0} active`}
              icon={FolderOpen} 
              color="green" 
            />
            <StatCard
              title="Total Events"
              value={summaryData?.statistics.totalEvents || 0}
              subtitle={`${summaryData?.statistics.ongoingEvents || 0} ongoing`}
              icon={Calendar} 
              color="purple" 
            />
            <StatCard
              title="Total Archives"
              value={summaryData?.statistics.totalArchives || 0}
              subtitle={`${summaryData?.statistics.totalLetters || 0} letters`}
              icon={ArchiveIcon} 
              color="orange" 
            />
          </>
        )}
      </motion.div>

      {/* 3. BENTO GRID (Chart + Deadline) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART SECTION */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
           <Card className="h-full min-h-100">
             <div className="flex items-center justify-between mb-6">
               <div>
                 <h2 className="text-lg font-bold text-foreground">Overview Statistik</h2>
                 <p className="text-sm text-muted-foreground">Deadline Project & Jadwal Event per Bulan</p>
               </div>
             </div>

             {isLoading ? (
               <div className="h-75 bg-muted/30 animate-pulse rounded-xl" />
             ) : (
               <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 12, fill: '#94a3b8' }} 
                       dy={10}
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 12, fill: '#94a3b8' }} 
                     />
                     <Tooltip 
                       cursor={{ fill: 'transparent' }}
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                     />
                     {/* Projects = Merah (Deadline) */}
                     <Bar dataKey="projects" name="Deadline Proyek" fill="#991b1b" radius={[4, 4, 0, 0]} barSize={20} />
                     {/* Events = Biru (Jadwal) */}
                     <Bar dataKey="events" name="Event" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             )}
           </Card>
        </motion.div>

        {/* DEADLINE SECTION */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Deadline</h2>
                <p className="text-sm text-muted-foreground">30 hari ke depan</p>
              </div>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-87.5">
              {isLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
                </div>
              ) : !summaryData || summaryData.upcomingDeadlines.length === 0 ? (
                <div className="h-full flex items-center justify-center py-10">
                   <EmptyState title="Aman!" description="Tidak ada deadline dekat" />
                </div>
              ) : (
                summaryData.upcomingDeadlines.slice(0, 5).map((item) => (
                  <div key={item.id} className="group flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/60 rounded-xl border border-transparent hover:border-border transition-all duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === 'PROJECT' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                      }`}>
                         {item.type === 'PROJECT' ? <FolderOpen className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate max-w-30" title={item.name}>{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.code}</p>
                      </div>
                    </div>
                    <div className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.daysRemaining <= 3 ? 'bg-red-500/10 text-red-600' : 'bg-orange-500/10 text-orange-600'
                    }`}>
                      {item.daysRemaining} Hari
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* 4. ACTIVITY LOGS */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Aktivitas Terbaru</h2>
              <p className="text-sm text-muted-foreground">Log aktivitas sistem real-time</p>
            </div>
          </div>

          <div className="space-y-1">
            {isLoading ? (
               <div className="space-y-3">
                 {[1,2].map((i) => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}
               </div>
            ) : !summaryData || summaryData.recentActivities.length === 0 ? (
              <div className="py-8"><EmptyState title="Kosong" description="Belum ada aktivitas tercatat" /></div>
            ) : (
              summaryData.recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-muted/30 rounded-xl transition-colors border-b border-border/50 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border ${
                    activity.action === 'CREATE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                    activity.action === 'UPDATE' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                    'bg-red-500/10 border-red-500/20 text-red-600'
                  }`}>
                    {activity.action[0]}
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-sm text-foreground">
                      <span className="font-bold">{activity.userName}</span>
                      <span className="text-muted-foreground"> melakukan </span>
                      <span className="font-medium text-xs uppercase px-1.5 py-0.5 rounded bg-muted">{activity.action}</span>
                      <span className="text-muted-foreground"> pada </span>
                      <span className="font-medium">{activity.targetName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-1 rounded-full">{activity.timeAgo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}