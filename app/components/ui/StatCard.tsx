import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  trend,
  subtitle 
}: StatCardProps) {
  const colorStyles = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-red-500 to-rose-500',
    cyan: 'from-cyan-500 to-blue-500',
  };

  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        {/* PERBAIKAN: Menggunakan 'bg-linear-to-br' (Tailwind v4) menggantikan 'bg-gradient-to-br' */}
        <div className={`w-14 h-14 bg-linear-to-br ${colorStyles[color]} rounded-xl flex items-center justify-center shadow-lg text-white`}>
          <Icon className="w-7 h-7" />
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
            trend.isPositive 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <h3 className="text-3xl font-bold mb-1">{value}</h3>
      <p className="text-muted-foreground font-medium mb-1">{title}</p>
      {subtitle && <p className="text-sm text-muted-foreground/80">{subtitle}</p>}
    </div>
  );
}