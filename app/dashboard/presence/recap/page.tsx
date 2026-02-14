'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';
import { Presence } from '@/app/types/presence';
import { Member, PageResponse } from '@/app/types';
import Card from '@/app/components/ui/Card';
import Select from '@/app/components/ui/Select';
import Modal from '@/app/components/ui/Modal';
import { Calendar, Filter, Download } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Week {
  start: Date;
  end: Date;
  label: string;
}

export default function PresenceRecapPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('MEETING');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');

  const MONTHS = [
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Feb' },
    { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Agu' },
    { value: 9, label: 'Sep' },
    { value: 10, label: 'Okt' },
    { value: 11, label: 'Nov' },
    { value: 12, label: 'Des' },
  ];

  useEffect(() => {
    // Redirect non-admins
    if (user && !isAdmin) {
      router.push('/dashboard/presence');
      return;
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    fetchData();
  }, [selectedType, selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;

      const [membersData, presenceData] = await Promise.all([
        api.get<PageResponse<Member>>('/members?page=0&size=1000'),
        api.getAllPresence({ 
          type: selectedType,
          startDate,
          endDate
        })
      ]);

      setMembers(membersData.content);
      setPresences(presenceData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedPresence, setSelectedPresence] = useState<Presence | null>(null);

  // Helper to generate weeks in month
  const getWeeksInMonth = () => {
    // ... existing logic ...
    const weeks: Week[] = [];
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);

    let current = new Date(firstDay);
    
    while (current <= lastDay) {
      const weekStart = new Date(current);
      const currentDay = current.getDay();
      const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
      
      let weekEnd = new Date(current);
      weekEnd.setDate(current.getDate() + daysUntilSunday);
      
      if (weekEnd > lastDay) {
        weekEnd = new Date(lastDay);
      }
      
      weeks.push({
        start: weekStart,
        end: weekEnd,
        label: `${weekStart.getDate()} - ${weekEnd.getDate()} ${MONTHS[selectedMonth-1].label}`
      });
      
      current = new Date(weekEnd);
      current.setDate(current.getDate() + 1);
    }
    return weeks;
  };

  const getPresenceInWeek = (memberName: string, week: Week) => {
    return presences.find(p => {
      if (p.memberName !== memberName) return false;
      
      const pDate = new Date(p.date);
      pDate.setHours(0,0,0,0);
      const wStart = new Date(week.start); wStart.setHours(0,0,0,0);
      const wEnd = new Date(week.end); wEnd.setHours(0,0,0,0);
      
      return pDate >= wStart && pDate <= wEnd;
    });
  };

  const YEARS = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - 2 + i;
    return { value: y, label: String(y) };
  });

  const PRESENCE_TYPES = [
    { value: 'MEETING', label: 'Rapat 2 Mingguan' },
    { value: 'ON_CALL', label: 'On Call' },
    { value: 'OTHER', label: 'Lainnya' }
  ];

  const weeks = getWeeksInMonth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekap Presensi</h1>
          <p className="text-gray-500">Monitoring kehadiran anggota per minggu</p>
        </div>
        
        {/* Filters */}
        {/* Filters Removed from Header */}
      </div>

      <Card className="overflow-hidden">
        {/* Filters & Search */}
        <div className="p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                label=""
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={PRESENCE_TYPES}
              />
            </div>
            <div className="w-full md:w-32">
              <Select
                label=""
                value={String(selectedMonth)}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                options={MONTHS.map(m => ({ value: String(m.value), label: m.label }))}
              />
            </div>
            <div className="w-full md:w-32">
              <Select
                label=""
                value={String(selectedYear)}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                options={YEARS.map(y => ({ value: String(y.value), label: y.label }))}
              />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-64 shadow-sm">
                  Nama Anggota
                </th>
                {weeks.map((week, idx) => (
                  <th key={idx} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    {week.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={weeks.length + 1} className="px-6 py-10 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : (
                members
                  .filter(m => 
                    m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    m.expertDivision.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white shadow-sm">
                      {member.fullName}
                      <div className="text-xs text-gray-400 font-normal">{member.expertDivision}</div>
                    </td>
                    {weeks.map((week, idx) => {
                      const presence = getPresenceInWeek(member.fullName, week);
                      return (
                        <td key={idx} className={`px-4 py-4 whitespace-nowrap text-center border-l border-gray-100 ${
                          presence ? 'bg-green-50' : ''
                        }`}>
                          {presence ? (
                            <button 
                              onClick={() => setSelectedPresence(presence)}
                              className="group flex flex-col items-center w-full hover:bg-green-100 p-2 rounded transition-colors"
                            >
                              <span className="text-green-600 font-bold text-lg">✓</span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(presence.date).getDate()} {MONTHS[new Date(presence.date).getMonth()].label}
                              </span>
                            </button>
                          ) : (
                            <span className="text-gray-200">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="flex justify-end">
        <p className="text-sm text-gray-500 italic">
          * Klik pada tanda centang untuk melihat bukti kehadiran
        </p>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedPresence}
        onClose={() => setSelectedPresence(null)}
        title="Detail Presensi"
        cancelText="Tutup"
        // No confirm button needed
      >
        {selectedPresence && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Judul Kegiatan</label>
              <p className="font-medium text-gray-900">{selectedPresence.title}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tipe</label>
                 <p className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block mt-1">
                   {selectedPresence.type === 'MEETING' ? 'Rapat 2 Mingguan' : selectedPresence.type.replace('_', ' ')}
                 </p>
              </div>
              <div>
                 <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tanggal</label>
                 <p className="text-sm text-gray-900 mt-1">
                   {new Date(selectedPresence.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                 </p>
              </div>
            </div>

            {selectedPresence.notes && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Catatan</label>
                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100 mt-1 italic">
                  "{selectedPresence.notes}"
                </p>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Foto Bukti</label>
              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img 
                  src={selectedPresence.imageUrl} 
                  alt="Bukti Kehadiran" 
                  className="w-full h-auto max-h-[300px] object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
