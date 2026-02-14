'use client';

import { useState } from 'react';
import Modal from '@/app/components/ui/Modal';
import Select from '@/app/components/ui/Select';
import { api } from '@/app/lib/api';
import { CreateArchiveRequest } from '@/app/types';
import { useToast } from '@/app/hooks/useToast';
import Toast from '@/app/components/ui/Toast';

interface CreateArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sourceType: 'PROJECT' | 'EVENT';
  sourceId: string;
  sourceName: string;
}

export default function CreateArchiveModal({
  isOpen,
  onClose,
  onSuccess,
  sourceType,
  sourceId,
  sourceName,
}: CreateArchiveModalProps) {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateArchiveRequest>>({
    title: sourceName,
    description: '',
    archiveType: '',
    publishLocation: '',
    referenceNumber: '',
    publishDate: '',
  });

  const PROJECT_TYPES = [
    { value: 'PUBLIKASI', label: 'Publikasi' },
    { value: 'HKI', label: 'HKI (Hak Kekayaan Intelektual)' },
    { value: 'PKM', label: 'PKM' },
  ];

  const EVENT_TYPES = [
    { value: 'LAPORAN', label: 'Laporan Kegiatan' },
    { value: 'SERTIFIKAT', label: 'Sertifikat' },
  ];

  const archiveTypes = sourceType === 'PROJECT' ? PROJECT_TYPES : EVENT_TYPES;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.archiveType) {
      showError('Mohon lengkapi field wajib');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload: CreateArchiveRequest = {
        title: formData.title!,
        description: formData.description,
        archiveType: formData.archiveType!,
        sourceType: sourceType,
        projectId: sourceType === 'PROJECT' ? sourceId : undefined,
        eventId: sourceType === 'EVENT' ? sourceId : undefined,
        publishLocation: formData.publishLocation,
        referenceNumber: formData.referenceNumber,
        publishDate: formData.publishDate || undefined,
      };

      await api.post('/archives', payload);
      success('Arsip berhasil dibuat');
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);

    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal membuat arsip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleSubmit}
        title={`Arsipkan ${sourceType === 'PROJECT' ? 'Proyek' : 'Event'}`}
        confirmText="Simpan Arsip"
        cancelText="Batal"
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
            📁 Mengarsipkan <strong>{sourceName}</strong>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Arsip *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <Select
            label="Tipe Arsip *"
            name="archiveType"
            value={formData.archiveType}
            onChange={handleChange}
            options={archiveTypes}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {sourceType === 'PROJECT' ? 'Nama Jurnal / Konferensi' : 'Lokasi Penerbitan'}
              </label>
              <input
                type="text"
                name="publishLocation"
                value={formData.publishLocation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {sourceType === 'PROJECT' ? 'DOI / No. Registrasi' : 'No. Sertifikat'}
              </label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Publikasi</label>
            <input
              type="date"
              name="publishDate"
              value={formData.publishDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </Modal>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
