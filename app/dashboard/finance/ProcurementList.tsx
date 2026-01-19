'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';
import { ProcurementRequest } from '@/app/types';
import Table from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';
import { useToast } from '@/app/hooks/useToast';
import { Check, X, ExternalLink, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils';
import { useAuth } from '@/app/context/AuthContext';

export default function ProcurementList() {
  const { user, isAdmin } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ content: ProcurementRequest[] }>('/finance/procurement?size=50');
      setRequests(response.content || []);
    } catch (err) {
      console.error(err);
      showError('Gagal memuat data pengadaan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Setujui pengadaan ini?')) return;
    try {
      setProcessingId(id);
      await api.post(`/finance/procurement/${id}/approve`, {});
      showSuccess('Pengadaan disetujui');
      fetchRequests();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal menyetujui');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Masukkan alasan penolakan:');
    if (!reason) return;
    
    try {
      setProcessingId(id);
      await api.post(`/finance/procurement/${id}/reject`, { reason });
      showSuccess('Pengadaan ditolak');
      fetchRequests();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal menolak');
    } finally {
      setProcessingId(null);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PURCHASED: 'bg-blue-100 text-blue-800',
  };

  const columns = [
    { 
      key: 'itemName', 
      header: 'Barang',
      render: (item: ProcurementRequest) => (
        <div>
           <div className="font-medium text-gray-900">{item.itemName}</div>
           {item.purchaseLink && (
             <a href={item.purchaseLink} target="_blank" className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
               Link <ExternalLink className="w-3 h-3"/>
             </a>
           )}
        </div>
      )
    },
    { 
      key: 'estimatedPrice', 
      header: 'Estimasi',
      render: (item: ProcurementRequest) => formatCurrency(item.estimatedPrice)
    },
    { 
        key: 'requester', 
        header: 'Pemohon',
        render: (item: ProcurementRequest) => (
            <div className="text-sm">
                <div className="font-medium">{item.requesterName}</div>
                <div className="text-xs text-gray-500">{(item as any).requesterNim || (item as any).requester?.username}</div>
            </div>
        )
    },
    {
        key: 'priority',
        header: 'Prioritas',
        render: (item: ProcurementRequest) => (
            <span className={`text-xs font-bold ${
                item.priority === 'HIGH' ? 'text-red-600' : 
                item.priority === 'LOW' ? 'text-green-600' : 'text-yellow-600'
            }`}>
                {item.priority === 'HIGH' ? 'TINGGI' : item.priority === 'LOW' ? 'RENDAH' : 'SEDANG'}
            </span>
        )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ProcurementRequest) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || 'bg-gray-100'}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: ProcurementRequest) => {
        if (item.status !== 'PENDING') return null;
        if (!isAdmin && user?.role !== 'TREASURER' && user?.role !== 'HEAD_LAB') return null;

        return (
          <div className="flex gap-2">
            <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 h-8 w-8 !p-0 flex items-center justify-center text-white"
                onClick={() => handleApprove(item.id)}
                disabled={!!processingId}
                isLoading={processingId === item.id}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button 
                size="sm" 
                variant="danger"
                className="h-8 w-8 !p-0 flex items-center justify-center"
                onClick={() => handleReject(item.id)}
                disabled={!!processingId}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daftar Pengajuan Pengadaan</h3>
        <Button size="sm" variant="ghost" onClick={fetchRequests}><RefreshCw className="w-4 h-4"/></Button>
      </div>
      <Table columns={columns} data={requests} keyField="id" isLoading={isLoading} emptyMessage="Tidak ada pengajuan." />
    </div>
  );
}
