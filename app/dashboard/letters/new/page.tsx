'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { Event, CreateLetterRequest } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';
import { useToast } from '@/app/hooks/useToast';
import Toast from '@/app/components/ui/Toast';

const LETTER_TYPES = [
  { value: 'PMJ', label: 'Peminjaman' },
  { value: 'IZN', label: 'Izin' },
  { value: 'STF', label: 'Sertifikat/Piagam' },
  { value: 'SP', label: 'Surat Pengantar' },
  { value: 'UND', label: 'Undangan' },
];

const CATEGORIES = [
  { value: 'RK', label: 'Internal (Rektorat)' },
  { value: 'INT', label: 'Internal MBC' },
  { value: 'EXT', label: 'Eksternal' },
  { value: 'WSH', label: 'Workshop/Seminar' },
];

export default function NewLetterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    letterType: '',
    category: '',
    subject: '',
    recipient: '',
    content: '',
    attachment: '',
    eventId: '',
    borrowDate: '',
    borrowReturnDate: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsData = await api.get<Event[]>('/events');
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.letterType || !formData.category || !formData.subject || !formData.recipient) {
      showError('Mohon lengkapi field wajib');
      return;
    }

    // PMJ requires borrow date/time
    if (formData.letterType === 'PMJ' && (!formData.borrowDate || !formData.borrowReturnDate)) {
      showError('Untuk Surat Peminjaman, tanggal mulai dan tanggal kembali wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: CreateLetterRequest = {
        letterType: formData.letterType,
        category: formData.category,
        subject: formData.subject,
        recipient: formData.recipient,
        content: formData.content || undefined,
        attachment: formData.attachment || undefined,
        eventId: formData.eventId || undefined,
        borrowDate: formData.borrowDate || undefined,
        borrowReturnDate: formData.borrowReturnDate || undefined,
      };

      await api.post('/administration/letters', payload);
      success('Pengajuan surat berhasil dikirim. Menunggu persetujuan Admin.');

      setTimeout(() => {
        router.push('/dashboard/letters');
      }, 1500);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal mengajukan surat');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Memuat data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ajukan Surat Baru</h1>
        <Button variant="ghost" onClick={() => router.back()}>Kembali</Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
        <strong>💡 Informasi:</strong> Surat akan diajukan atas nama Anda <strong>({user?.fullName || 'User'})</strong>. 
        Setelah disetujui Admin, Anda dapat mendownload surat dalam format Word.
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Jenis Surat *"
              name="letterType"
              value={formData.letterType}
              onChange={handleChange}
              options={[{ value: '', label: '-- Pilih Jenis --' }, ...LETTER_TYPES]}
              required
            />

            <Select
              label="Kategori *"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={[{ value: '', label: '-- Pilih Kategori --' }, ...CATEGORIES]}
              required
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Perihal *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: Permohonan Peminjaman Videotron"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan *</label>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: Kepala Bagian Sarana dan Prasarana"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Select
                label="Kegiatan Terkait *"
                name="eventId"
                value={formData.eventId}
                onChange={handleChange}
                options={[
                  { value: '', label: '-- Pilih Kegiatan --' },
                  ...events.map(e => ({ value: e.id, label: `${e.eventCode} - ${e.name}` }))
                ]}
              />
            </div>

            {/* Borrow date/time - shown for PMJ type */}
            {formData.letterType === 'PMJ' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam *</label>
                  <input
                    type="date"
                    name="borrowDate"
                    value={formData.borrowDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kembali *</label>
                  <input
                    type="date"
                    name="borrowReturnDate"
                    value={formData.borrowReturnDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label>
              <input
                type="text"
                name="attachment"
                value={formData.attachment}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: 1 Lembar Proposal"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Isi Surat (Opsional)</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Isi atau catatan tambahan untuk surat..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              📤 Ajukan Surat
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
