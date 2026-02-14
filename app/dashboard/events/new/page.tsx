'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { Member, CreateEventRequest, EventScheduleRequest, PageResponse } from '@/app/types';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';
import { useToast } from '@/app/hooks/useToast';
import Toast from '@/app/components/ui/Toast';
import { Plus, Trash2 } from 'lucide-react';

export default function NewEventPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<CreateEventRequest>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    picId: '',
    schedules: []
  });

  const [schedules, setSchedules] = useState<EventScheduleRequest[]>([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get<PageResponse<Member>>('/members?page=0&size=1000');
      if (response && response.content) {
        setMembers(response.content);
      } else {
        setMembers([]);
      }
    } catch (err) {
      showError('Gagal memuat data member');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Schedule Management
  const addSchedule = () => {
    setSchedules([...schedules, {
      activityDate: formData.startDate || '',
      title: '',
      startTime: '08:00',
      endTime: '16:00',
      location: 'Lab Riset'
    }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: keyof EventScheduleRequest, value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setSchedules(newSchedules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.picId || !formData.startDate || !formData.endDate) {
        showError('Mohon lengkapi field wajib');
        return;
    }

    // Validate schedules
    for (const schedule of schedules) {
        if (!schedule.title || !schedule.activityDate) {
            showError('Mohon lengkapi judul dan tanggal pada setiap jadwal');
            return;
        }
        // Check date range
        if (formData.startDate && formData.endDate) {
            if (schedule.activityDate < formData.startDate || schedule.activityDate > formData.endDate) {
                showError(`Jadwal "${schedule.title}" diluar tanggal event`);
                return;
            }
        }
    }

    try {
      setIsSubmitting(true);
      const payload = {
          ...formData,
          schedules: schedules
      };
      
      await api.post('/events', payload);
      success('Event berhasil dibuat');
      setTimeout(() => {
        router.push('/dashboard/events');
      }, 1500);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal membuat event');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Buat Event Baru</h1>
        <Button variant="ghost" onClick={() => router.back()}>Kembali</Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Event *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Workshop IoT Basic"
                  required
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
             </div>
             
             <div className="md:col-span-2">
                  <Select
                      label="Ketua Pelaksana (PIC) *"
                      name="picId"
                      value={formData.picId}
                      onChange={handleChange}
                      options={members.map(m => ({ value: m.id, label: `${m.fullName} (${m.expertDivision})` }))}
                      required
                  />
                  <p className="text-xs text-gray-500 mt-1">Hanya memilih PIC utama. Anggota panitia lain dapat ditambahkan setelah event dibuat.</p>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
             <textarea
               name="description"
               value={formData.description}
               onChange={handleChange}
               rows={4}
               className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
               placeholder="Jelaskan detail kegiatan..."
             />
          </div>

          {/* Schedule Section */}
          <div className="border-t border-gray-100 pt-6">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-gray-900">Jadwal Detil</h3>
                 <Button type="button" variant="secondary" onClick={addSchedule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Jadwal
                 </Button>
             </div>
             
             <div className="space-y-4">
                {schedules.length === 0 && (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                        Belum ada jadwal detil. Klik tombol Tambah Jadwal untuk membuat.
                    </div>
                )}
                
                {schedules.map((schedule, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                        <button 
                            type="button" 
                            onClick={() => removeSchedule(index)}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Judul Kegiatan</label>
                                <input
                                    type="text"
                                    value={schedule.title}
                                    onChange={(e) => updateSchedule(index, 'title', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                                    placeholder="Contoh: Sesi 1 - Pengenalan Dasar"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
                                <input
                                    type="date"
                                    value={schedule.activityDate}
                                    onChange={(e) => updateSchedule(index, 'activityDate', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Lokasi</label>
                                <input
                                    type="text"
                                    value={schedule.location || ''}
                                    onChange={(e) => updateSchedule(index, 'location', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                                    placeholder="Ruang Rapat / Lab"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Jam Mulai</label>
                                    <input
                                        type="time"
                                        value={schedule.startTime || ''}
                                        onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Jam Selesai</label>
                                    <input
                                        type="time"
                                        value={schedule.endTime || ''}
                                        onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
             <Button type="button" variant="secondary" onClick={() => router.back()}>
               Batal
             </Button>
             <Button type="submit" isLoading={isSubmitting}>
               Buat Event
             </Button>
          </div>
        </form>
      </Card>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
