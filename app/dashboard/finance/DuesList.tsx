'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';
import { DuesPayment } from '@/app/types';
import Table from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';
import { useToast } from '@/app/hooks/useToast';
import { Check, RefreshCw, Eye } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import Modal from '@/app/components/ui/Modal';

export default function DuesList() {
  const { user, isAdmin } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  
  const [dues, setDues] = useState<DuesPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Proof Modal
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const fetchDues = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<DuesPayment[]>('/finance/dues');
      setDues(response || []);
    } catch (err) {
      console.error(err);
      showError('Gagal memuat data kas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
  }, []);

  const handleVerify = async (id: string) => {
    if (!confirm('Verifikasi pembayaran ini? Saldo akan bertambah otomatis.')) return;
    try {
      setProcessingId(id);
      await api.post(`/finance/dues/${id}/verify`, {});
      showSuccess('Pembayaran diverifikasi');
      fetchDues();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal verifikasi');
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    { 
      key: 'date', 
      header: 'Tanggal',
      render: (item: DuesPayment) => (
        <span className="text-sm">
             {new Date(item.paidAt).toLocaleDateString('id-ID')}
        </span>
      )
    },
    { 
        key: 'member', 
        header: 'Nama',
        render: (item: DuesPayment) => (
            <div className="text-sm">
                <div className="font-medium">{item.memberName}</div>
                <div className="text-xs text-gray-500">{item.memberNim}</div>
            </div>
        )
    },
    {
        key: 'period',
        header: 'Periode',
        render: (item: DuesPayment) => (
            <div className="text-sm font-medium">
               {item.paymentMonth}/{item.paymentYear}
            </div>
        )
    },
    { 
      key: 'amount', 
      header: 'Jumlah',
      render: (item: DuesPayment) => (
          <span className="font-medium text-green-600">{formatCurrency(item.amount)}</span>
      )
    },
    {
      key: 'proof',
      header: 'Bukti',
      render: (item: DuesPayment) => item.paymentProofUrl ? (
          <Button size="sm" variant="ghost" onClick={() => setSelectedProof(item.paymentProofUrl || '')}>
              <Eye className="w-4 h-4 text-blue-500" />
          </Button>
      ) : <span className="text-xs text-gray-400">Tidak ada</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: DuesPayment) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {item.status === 'VERIFIED' ? 'Terverifikasi' : 'Menunggu'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: DuesPayment) => {
        if (item.status !== 'PENDING') return <span className="text-xs text-gray-400">-</span>;
        if (!isAdmin && user?.role !== 'TREASURER' && user?.role !== 'HEAD_LAB') return null;

        return (
          <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 h-8 w-8 !p-0 flex items-center justify-center text-white"
              onClick={() => handleVerify(item.id)}
              disabled={!!processingId}
              isLoading={processingId === item.id}
          >
            <Check className="w-4 h-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daftar Pembayaran Kas</h3>
        <Button size="sm" variant="ghost" onClick={fetchDues}><RefreshCw className="w-4 h-4"/></Button>
      </div>
      <Table columns={columns} data={dues} keyField="id" isLoading={isLoading} emptyMessage="Tidak ada data kas." />

      {selectedProof && (
         <Modal 
            isOpen={!!selectedProof} 
            onClose={() => setSelectedProof(null)}
            title="Bukti Transfer"
            hideFooter={true}
         >
             <div className="flex justify-center">
                 <img src={selectedProof} alt="Bukti Transfer" className="max-h-[400px] object-contain rounded-lg border" />
             </div>
             <div className="mt-4 flex justify-center">
                <Button onClick={() => window.open(selectedProof, '_blank')}>Buka Tab Baru</Button>
             </div>
         </Modal>
      )}
    </div>
  );
}
