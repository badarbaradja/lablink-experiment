'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';
import { Member, CreateTransactionRequest, FinanceCategory } from '@/app/types';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import { X } from 'lucide-react';

interface CreateTransactionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTransactionModal({ onClose, onSuccess }: CreateTransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [error, setError] = useState('');

  // Local state for optional fields not directly in DTO
  const [picId, setPicId] = useState('');
  const [notes, setNotes] = useState('');

  const [formData, setFormData] = useState<CreateTransactionRequest>({
    description: '',
    amount: 0,
    type: 'EXPENSE',
    categoryId: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchMembers();
    fetchCategories();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get<any>('/members?page=0&size=1000');
      if (response && response.content) {
        setMembers(response.content);
      } else if (Array.isArray(response)) {
        setMembers(response);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  const fetchCategories = async () => {
      try {
          const response = await api.get<FinanceCategory[]>('/finance/categories');
          setCategories(response || []);
      } catch (err) {
          console.error('Failed to fetch categories:', err);
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.description || formData.amount <= 0 || !formData.transactionDate || !formData.categoryId) {
      setError('Mohon lengkapi data wajib (Deskripsi, Jumlah > 0, Kategori, Tanggal)');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Append extra info to description if needed
      let finalDescription = formData.description;
      if (picId) {
          const pic = members.find(m => m.id === picId);
          if (pic) finalDescription += ` (PIC: ${pic.fullName})`;
      }
      if (notes) {
          finalDescription += ` - Note: ${notes}`;
      }

      await api.post('/finance/transactions/simple', {
          ...formData,
          description: finalDescription
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === 'BOTH' || c.type === formData.type);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Catat Transaksi</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Jenis Transaksi</label>
                  <div className="flex bg-muted p-1 rounded-lg">
                    <button
                      type="button"
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.type === 'INCOME' ? 'bg-background shadow text-green-600' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'INCOME' }))}
                    >
                      Pemasukan
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.type === 'EXPENSE' ? 'bg-background shadow text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'EXPENSE' }))}
                    >
                      Pengeluaran
                    </button>
                  </div>
               </div>

               <Input
                 label="Tanggal"
                 type="date"
                 name="transactionDate"
                 value={formData.transactionDate}
                 onChange={handleChange}
                 required
               />
            </div>

            <Input
              label="Deskripsi Transaksi"
              name="description"
              placeholder="Contoh: Pembelian Hosting, Iuran Bulan Jan"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Jumlah (Rp) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-input border border-input rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="0"
                    min="0"
                    required
                  />
               </div>

               <Select
                 label="Kategori"
                 name="categoryId"
                 value={formData.categoryId}
                 onChange={handleChange}
                 options={[
                     { value: '', label: '- Pilih Kategori -' },
                     ...filteredCategories.map(c => ({ value: c.id, label: c.name }))
                 ]}
                 required
               />
            </div>

            <Select
              label="PIC / Penanggung Jawab (Opsional)"
              name="picId"
              value={picId}
              onChange={(e) => setPicId(e.target.value)}
              options={[
                { value: '', label: '- Pilih PIC -' },
                ...members.map(m => ({ value: m.id, label: m.fullName }))
              ]}
            />

            <div>
              <label className="block text-sm font-medium mb-1">Catatan Tambahan</label>
              <textarea
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-input border border-input rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
                placeholder="Detail tambahan..."
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" form="transaction-form" isLoading={isSubmitting}>
            Simpan Transaksi
          </Button>
        </div>
      </div>
    </div>
  );
}
