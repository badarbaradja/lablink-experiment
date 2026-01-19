'use client';

import { useState } from 'react';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import { api } from '@/app/lib/api';
import { useToast } from '@/app/hooks/useToast';
import Select from '@/app/components/ui/Select';

interface CreateProcurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateProcurementModal({ isOpen, onClose, onSuccess }: CreateProcurementModalProps) {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    reason: '',
    estimatedPrice: 0,
    priority: 'MEDIUM',
    purchaseLink: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName || !formData.estimatedPrice) {
      error('Nama barang dan estimasi harga wajib diisi');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/finance/procurement', formData);
      success('Pengajuan pengadaan berhasil dikirim');
      setFormData({
        itemName: '',
        description: '',
        reason: '',
        estimatedPrice: 0,
        priority: 'MEDIUM',
        purchaseLink: '',
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Gagal mengajukan pengadaan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajukan Pengadaan Barang"
      cancelText="Batal"
      hideFooter={true}
      // Remove default confirm button to use custom form submission
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nama Barang
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            placeholder="Contoh: Kertas A4, Tinta Printer"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimasi Harga (Rp)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={formData.estimatedPrice || ''}
                onChange={(e) => setFormData({ ...formData, estimatedPrice: Number(e.target.value) })}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
               <Select
                 label="Prioritas"
                 value={formData.priority}
                 onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                 options={[
                   { value: 'LOW', label: 'Rendah' },
                   { value: 'MEDIUM', label: 'Sedang' },
                   { value: 'HIGH', label: 'Tinggi' },
                 ]}
               />
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alasan Pengadaan
          </label>
          <textarea
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            rows={2}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Mengapa barang ini dibutuhkan?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Deskripsi / Spesifikasi (Opsional)
          </label>
          <textarea
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Warna, Ukuran, Merk, dll."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link Pembelian (Opsional)
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            value={formData.purchaseLink}
            onChange={(e) => setFormData({ ...formData, purchaseLink: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Ajukan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
