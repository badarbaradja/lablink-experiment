'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { Member, Project, UpdateProjectRequest, PageResponse } from '@/app/types';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';
import { useToast } from '@/app/hooks/useToast';
import Toast from '@/app/components/ui/Toast';

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>('');

  // Unpack params
  useEffect(() => {
    params.then(unwrappedParams => {
      setProjectId(unwrappedParams.id);
    });
  }, [params]);
  
  // Form State
  const [formData, setFormData] = useState<Partial<UpdateProjectRequest>>({
    name: '',
    division: '',
    activityType: '',
    status: '',
    progressPercent: 0,
    leaderId: '',
    teamMemberIds: [],
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (projectId) {
      loadInitialData();
    }
  }, [projectId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [membersData, projectData] = await Promise.all([
        api.get<PageResponse<Member>>('/members?page=0&size=1000'),
        api.get<Project>(`/projects/${projectId}`)
      ]);

      setMembers(membersData.content);
      
      // Populate form
      setFormData({
        name: projectData.name,
        division: projectData.division,
        activityType: projectData.activityType,
        status: projectData.status,
        progressPercent: projectData.progressPercent,
        leaderId: projectData.leader.id,
        teamMemberIds: projectData.teamMembers.map(m => m.id),
        description: projectData.description || '',
        startDate: projectData.startDate || '',
        endDate: projectData.endDate || '',
      });
    } catch (err) {
      showError('Gagal memuat data proyek');
      router.push('/dashboard/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTeamMember = (memberId: string) => {
    setFormData(prev => {
        const currentIds = prev.teamMemberIds || [];
        if (currentIds.includes(memberId)) {
            return { ...prev, teamMemberIds: currentIds.filter((id: string) => id !== memberId) };
        } else {
            return { ...prev, teamMemberIds: [...currentIds, memberId] };
        }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.division || !formData.leaderId) {
        showError('Mohon lengkapi field wajib (Nama, Divisi, Ketua)');
        return;
    }

    try {
      setIsSubmitting(true);
      await api.put(`/projects/${projectId}`, formData);
      success('Proyek berhasil diperbarui');
      setTimeout(() => {
        router.push('/dashboard/projects');
      }, 1500);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal memperbarui proyek');
      setIsSubmitting(false);
    }
  };

  const DIVISIONS = [
    { value: 'BIG_DATA', label: 'Big Data' },
    { value: 'CYBER_SECURITY', label: 'Cyber Security' },
    { value: 'GAME_TECH', label: 'Game Tech' },
    { value: 'GIS', label: 'GIS' },
    { value: 'JARKOM', label: 'Jarkom' },
    { value: 'PEMROGRAMAN', label: 'Pemrograman' },
    { value: 'CROSS_DIVISION', label: 'Lintas Divisi' },
  ];

  const ACTIVITY_TYPES = [
    { value: 'RISET', label: 'Riset' },
    { value: 'HKI', label: 'HKI' },
    { value: 'PENGABDIAN', label: 'Pengabdian Masyarakat' },
    { value: 'INTERNAL', label: 'Proyek Internal' },
  ];

  const STATUSES = [
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  if (isLoading) {
      return <div className="p-8 text-center text-gray-500">Memuat data proyek...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Proyek</h1>
        <Button variant="ghost" onClick={() => router.back()}>Kembali</Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Proyek *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
             </div>

             <Select
                label="Divisi *"
                name="division"
                value={formData.division}
                onChange={handleChange}
                options={DIVISIONS}
                required
             />

             <Select
                label="Tipe Aktivitas *"
                name="activityType"
                value={formData.activityType}
                onChange={handleChange}
                options={ACTIVITY_TYPES}
                required
             />

              <Select
                label="Status *"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={STATUSES}
                required
             />

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress ({formData.progressPercent}%)</label>
                <input 
                  type="range" 
                  name="progressPercent"
                  min="0" 
                  max="100" 
                  value={formData.progressPercent} 
                  onChange={(e) => setFormData(prev => ({ ...prev, progressPercent: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
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
             />
          </div>

          {/* Team Assignment */}
          <div className="border-t border-gray-100 pt-6">
             <h3 className="text-lg font-bold text-gray-900 mb-4">Tim Proyek</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Select
                      label="Ketua Proyek *"
                      name="leaderId"
                      value={formData.leaderId}
                      onChange={handleChange}
                      options={members.map(m => ({ value: m.id, label: `${m.fullName} (${m.expertDivision})` }))}
                      required
                  />
                </div>
                
                {/* Team Members Selection */}
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-2">Anggota Tim</label>
                   <div className="border border-gray-200 rounded-xl p-4 h-64 overflow-y-auto bg-gray-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {members.filter(m => m.id !== formData.leaderId).map(member => (
                         <div 
                           key={member.id} 
                           onClick={() => toggleTeamMember(member.id)}
                           className={`
                             cursor-pointer p-3 rounded-lg border flex items-center gap-3 transition-colors select-none
                             ${formData.teamMemberIds?.includes(member.id) 
                               ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                               : 'bg-white border-gray-200 hover:border-blue-300'}
                           `}
                         >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.teamMemberIds?.includes(member.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                               {formData.teamMemberIds?.includes(member.id) && <span className="text-white text-xs">✓</span>}
                            </div>
                            <div className="overflow-hidden">
                               <p className="text-sm font-medium text-gray-900 truncate">{member.fullName}</p>
                               <p className="text-xs text-gray-500 truncate">{member.expertDivision}</p>
                            </div>
                         </div>
                      ))}
                   </div>
                   <p className="text-xs text-gray-500 mt-2">Ketua proyek tidak perlu dipilih lagi disini.</p>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
             <Button type="button" variant="secondary" onClick={() => router.back()}>
               Batal
             </Button>
             <Button type="submit" isLoading={isSubmitting}>
               Simpan Perubahan
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
