'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { Member, Event, UpdateEventRequest } from '@/app/types';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';
import { useToast } from '@/app/hooks/useToast';
import Toast from '@/app/components/ui/Toast';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [eventId, setEventId] = useState<string>('');

  // Unpack params
  useEffect(() => {
    params.then(unwrappedParams => {
      setEventId(unwrappedParams.id);
    });
  }, [params]);
  
  // Committee State
  interface CommitteeItem { memberId: string; role: string; fullName?: string }
  const [committeeList, setCommitteeList] = useState<CommitteeItem[]>([]);
  const [newCommitteeMember, setNewCommitteeMember] = useState<CommitteeItem>({ memberId: '', role: '' });


  // Form State
  const [formData, setFormData] = useState<Partial<UpdateEventRequest>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: '',
    picId: '',
  });

  useEffect(() => {
    if (eventId) {
      loadInitialData();
    }
  }, [eventId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [membersData, eventData] = await Promise.all([
        api.get<any>('/members?page=0&size=1000'),
        api.get<Event>(`/events/${eventId}`)
      ]);

      if (membersData && membersData.content) {
        setMembers(membersData.content);
      } else if (Array.isArray(membersData)) {
        setMembers(membersData);
      } else {
        setMembers([]);
      }
      
      // Populate form
      setFormData({
        name: eventData.name,
        description: eventData.description || '',
        startDate: eventData.startDate || '',
        endDate: eventData.endDate || '',
        status: eventData.status,
        picId: eventData.pic.id,
      });

      // Populate committee
      if (eventData.committee) {
        setCommitteeList(eventData.committee.map(c => ({
            memberId: c.memberId,
            role: c.role,
            fullName: c.fullName
        })));
      }

    } catch (err) {
      showError('Gagal memuat data event');
      router.push('/dashboard/events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Committee Handlers
  const handleAddCommittee = () => {
    if (!newCommitteeMember.memberId || !newCommitteeMember.role) {
        return;
    }
    // Check duplicate
    if (committeeList.some(c => c.memberId === newCommitteeMember.memberId)) {
        showError('Member ini sudah ada di panitia');
        return;
    }

    const member = members.find(m => m.id === newCommitteeMember.memberId);
    setCommitteeList([...committeeList, { ...newCommitteeMember, fullName: member?.fullName }]);
    setNewCommitteeMember({ memberId: '', role: '' });
  };

  const handleRemoveCommittee = (memberId: string) => {
    setCommitteeList(committeeList.filter(c => c.memberId !== memberId));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.picId || !formData.startDate || !formData.endDate) {
        showError('Mohon lengkapi field wajib');
        return;
    }

    try {
      setIsSubmitting(true);
      
      // Include committee list in payload
      const payload: UpdateEventRequest = {
          ...formData,
          committee: committeeList.map(c => ({ memberId: c.memberId, role: c.role }))
      };

      await api.put(`/events/${eventId}`, payload);
      success('Event berhasil diperbarui');
      setTimeout(() => {
        router.push('/dashboard/events');
      }, 1500);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal memperbarui event');
      setIsSubmitting(false);
    }
  };

  const STATUSES = [
    { value: 'PLANNED', label: 'Planned' },
    { value: 'ONGOING', label: 'Ongoing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  if (isLoading) {
      return <div className="p-8 text-center text-gray-500">Memuat data event...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
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

             <div>
                  <Select
                      label="Status *"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      options={STATUSES}
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

          {/* Committee Management Section */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Susunan Panitia</h3>
            
            {/* Add Committee Form */}
            <div className="flex flex-col md:flex-row gap-3 items-end mb-4 bg-gray-50 p-4 rounded-lg">
                <div className="w-full md:w-1/2">
                    <Select
                        label="Pilih Member"
                        value={newCommitteeMember.memberId}
                        onChange={(e) => setNewCommitteeMember({ ...newCommitteeMember, memberId: e.target.value })}
                        options={members
                            .filter(m => m.id !== formData.picId && !committeeList.some(c => c.memberId === m.id))
                            .map(m => ({ value: m.id, label: `${m.fullName}` }))}
                    />
                </div>
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role / Jabatan</label>
                    <input 
                        type="text"
                        placeholder="Ex: Sekretaris"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newCommitteeMember.role}
                        onChange={(e) => setNewCommitteeMember({ ...newCommitteeMember, role: e.target.value })}
                    />
                </div>
                <Button 
                    type="button" 
                    onClick={handleAddCommittee}
                    disabled={!newCommitteeMember.memberId || !newCommitteeMember.role}
                >
                    + Tambah
                </Button>
            </div>

            {/* Committee List */}
            <div className="space-y-2">
                {committeeList.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">Belum ada panitia tambahan.</p>
                ) : (
                    committeeList.map((item) => (
                        <div key={item.memberId} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">{item.fullName || members.find(m => m.id === item.memberId)?.fullName}</p>
                                <p className="text-xs text-gray-500">{item.role}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveCommittee(item.memberId)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium px-3"
                            >
                                Hapus
                            </button>
                        </div>
                    ))
                )}
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
