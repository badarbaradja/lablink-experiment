'use client';

// HAPUS import Defs, LinearGradient, Stop karena tidak ada di recharts
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '@/app/components/ui/Card';
import { MonthlyStat } from '@/app/types';

interface OverviewChartProps {
  data: MonthlyStat[];
}

export default function OverviewChart({ data }: OverviewChartProps) {
  return (
    <Card className="h-full min-h-100 flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground">Statistik Laboratorium</h3>
        <p className="text-sm text-muted-foreground">Tren aktivitas real-time tahun ini</p>
      </div>
      
      {/* PERBAIKAN: Ganti min-h-[300px] menjadi min-h-75 */}
      <div className="flex-1 w-full min-h-75">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* PERBAIKAN: Gunakan tag lowercase biasa (elemen SVG) */}
            <defs>
              <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
            
            <XAxis 
              dataKey="name" 
              stroke="currentColor" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              className="text-muted-foreground"
              dy={10}
            />
            <YAxis 
              stroke="currentColor" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              className="text-muted-foreground"
            />
            
            <Tooltip 
              cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
                borderRadius: '12px',
                color: 'var(--foreground)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 600 }}
              labelStyle={{ marginBottom: '8px', color: 'var(--muted-foreground)' }}
            />
            
            <Bar 
              dataKey="projects" 
              fill="url(#colorProjects)" 
              radius={[6, 6, 0, 0]} 
              name="Proyek"
              barSize={20}
              animationDuration={2000} 
              animationBegin={0}
              animationEasing="ease-out"
            />
            <Bar 
              dataKey="events" 
              fill="url(#colorEvents)" 
              radius={[6, 6, 0, 0]} 
              name="Event"
              barSize={20}
              animationDuration={2000}
              animationBegin={300}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}