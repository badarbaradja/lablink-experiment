'use client';

import { useState } from 'react';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import { api } from '@/app/lib/api';
import { useToast } from '@/app/hooks/useToast';
import Select from '@/app/components/ui/Select';

interface CreateDuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateDuesModal({ isOpen, onClose, onSuccess }: CreateDuesModalProps) {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    paymentMonth: new Date().getMonth() + 1, // 1-12
    paymentYear: new Date().getFullYear(),
    amount: 0,
    periodId: '', // Ideally fetched or selected
  });

  // Helper for months
  const months = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
    { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !file) {
      error('Jumlah pembayaran dan bukti transfer wajib diisi');
      return;
    }

    try {
      setIsLoading(true);
      
      const payload = {
          paymentMonth: Number(formData.paymentMonth),
          paymentYear: Number(formData.paymentYear),
          amount: Number(formData.amount),
          periodId: 'PERIOD-001' // HARDCODED TEMPORARILY - Should use active period
      };

      const formDataObj = new FormData();
      formDataObj.append('data', JSON.stringify(payload));
      formDataObj.append('file', file);

      await api.postMultipart('/finance/dues', formDataObj);
      
      success('Pembayaran kas berhasil dikirim');
      setFormData({
        paymentMonth: new Date().getMonth() + 1,
        paymentYear: new Date().getFullYear(),
        amount: 0,
        periodId: '',
      });
      setFile(null);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Gagal mengirim pembayaran kas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bayar Uang Kas"
      cancelText="Batal"
      hideFooter={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
             <Select
                 label="Bulan"
                 value={String(formData.paymentMonth)}
                 onChange={(e) => setFormData({ ...formData, paymentMonth: Number(e.target.value) })}
                 options={months.map(m => ({ value: String(m.value), label: m.label }))}
             />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tahun
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={formData.paymentYear}
                onChange={(e) => setFormData({ ...formData, paymentYear: Number(e.target.value) })}
                required
              />
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nominal (Rp)
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            placeholder="0"
            required
            min="0"
          />
          <p className="text-xs text-muted-foreground mt-1">Sesuai kesepakatan: Rp 20.000 / bulan</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bukti Transfer (Gambar)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                        <p className="text-sm text-green-600 font-medium">{file.name}</p>
                    ) : (
                        <>
                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="text-sm text-gray-500"><span className="font-semibold">Klik untuk upload</span> atau drag and drop</p>
                            <p className="text-xs text-gray-500">SVG, PNG, JPG (MAX. 2MB)</p>
                        </>
                    )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Kirim Pembayaran
          </Button>
        </div>
      </form>
    </Modal>
  );
}
