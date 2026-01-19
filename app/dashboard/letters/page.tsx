'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { Letter, IncomingLetter } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Table from '@/app/components/ui/Table';
import Select from '@/app/components/ui/Select';
import LetterDetailModal from '@/app/components/letters/LetterDetailModal';
import Modal from '@/app/components/ui/Modal';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
// IMPORT ANIMASI
import { PageWrapper, AnimatedSection } from '@/app/components/ui/PageAnimation';

const TYPE_LABELS: Record<string, string> = {
  PMJ: 'Peminjaman',
  IZN: 'Izin',
  STF: 'Sertifikat',
  SP: 'Surat Pengantar',
  UND: 'Undangan',
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  APPROVED: 'bg-green-500/10 text-green-700 dark:text-green-400',
  REJECTED: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
};

export default function LettersPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming'>('outgoing');
  
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [incomingLetters, setIncomingLetters] = useState<IncomingLetter[]>([]);
  const [isLoadingIncoming, setIsLoadingIncoming] = useState(false);

  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; letter: Letter | null }>({ isOpen: false, letter: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortConfig, setSortConfig] = useState('newest');

  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    fetchLetters();
  }, []);

  useEffect(() => {
    if (activeTab === 'incoming' && incomingLetters.length === 0) {
      fetchIncomingLetters();
    }
  }, [activeTab]);

  const fetchLetters = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Letter[]>('/administration/letters');
      setLetters(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat surat');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIncomingLetters = async () => {
    try {
      setIsLoadingIncoming(true);
      const response = await api.get<IncomingLetter[]>('/administration/letters/incoming');
      setIncomingLetters(response);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal memuat surat masuk');
    } finally {
      setIsLoadingIncoming(false);
    }
  };

  const handleDeleteClick = (letter: Letter) => {
    setDeleteModal({ isOpen: true, letter });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.letter) return;
    try {
      setIsDeleting(true);
      await api.delete(`/administration/letters/${deleteModal.letter.id}`);
      setLetters(letters.filter((l) => l.id !== deleteModal.letter!.id));
      success(`Surat berhasil dihapus`);
      setDeleteModal({ isOpen: false, letter: null });
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal menghapus surat');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async (letter: Letter) => {
    try {
      setIsApproving(true);
      const updated = await api.patch<Letter>(`/administration/letters/${letter.id}/approve`);
      setLetters(letters.map(l => l.id === letter.id ? updated : l));
      success(`Surat berhasil disetujui. Nomor: ${updated.letterNumber}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal menyetujui surat');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (letter: Letter) => {
    try {
      setIsApproving(true);
      const updated = await api.patch<Letter>(`/administration/letters/${letter.id}/reject?reason=Tidak memenuhi syarat`);
      setLetters(letters.map(l => l.id === letter.id ? updated : l));
      success('Surat berhasil ditolak');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal menolak surat');
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownload = async (letter: Letter) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8081/api/administration/letters/${letter.id}/download`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal mendownload dokumen');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Surat_${letter.letterNumber?.replace(/\//g, '-') || letter.id}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Dokumen berhasil didownload');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal mendownload dokumen');
    }
  };

  const filteredLetters = letters
    .filter(letter => {
      const matchSearch =
        letter.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (letter.letterNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        letter.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        letter.requesterName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === 'ALL' || letter.letterType === filterType;
      const matchStatus = filterStatus === 'ALL' || letter.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    })
    .sort((a, b) => {
      switch (sortConfig) {
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest': default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const outgoingColumns = [
    {
      key: 'letterNumber',
      header: 'No. Surat',
      render: (item: Letter) => (
        <span className={item.letterNumber ? 'font-mono text-sm text-foreground' : 'text-muted-foreground italic'}>
          {item.letterNumber || (item.status === 'REJECTED' ? '-' : 'Menunggu Approval')}
        </span>
      ),
    },
    {
      key: 'requesterName',
      header: 'Pemohon',
      render: (item: Letter) => (
        <div>
          <div className="font-medium text-foreground">{item.requesterName}</div>
          <div className="text-xs text-muted-foreground">{item.requesterNim}</div>
        </div>
      ),
    },
    { key: 'subject', header: 'Perihal' },
    {
      key: 'letterType',
      header: 'Jenis',
      render: (item: Letter) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400">
          {TYPE_LABELS[item.letterType] || item.letterType}
        </span>
      ),
    },
    {
      key: 'event',
      header: 'Kegiatan',
      render: (item: Letter) => (
        <span className="text-sm text-muted-foreground">
          {item.event?.name || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Letter) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[item.status] || 'bg-slate-500/10'}`}>
          {STATUS_LABELS[item.status] || item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Letter) => (
        <div className="flex gap-1 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLetter(item);
            }}
          >
            Detail
          </Button>
          
          {isAdmin && item.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(item);
                }}
                disabled={isApproving}
              >
                ✅ Setujui
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(item);
                }}
                disabled={isApproving}
              >
                ❌ Tolak
              </Button>
            </>
          )}

          {item.status === 'APPROVED' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(item);
              }}
            >
              ⬇️ Download
            </Button>
          )}

          {isAdmin && (
            <Button
              size="sm"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(item);
              }}
            >
              🗑️
            </Button>
          )}
        </div>
      ),
    },
  ];

  const incomingColumns = [
    { key: 'referenceNumber', header: 'No. Referensi' },
    { key: 'sender', header: 'Pengirim' },
    { key: 'subject', header: 'Perihal' },
    {
      key: 'receivedDate',
      header: 'Tanggal Diterima',
      render: (item: IncomingLetter) => (
        <span className="text-sm text-muted-foreground">
          {new Date(item.receivedDate).toLocaleDateString('id-ID')}
        </span>
      ),
    },
  ];

  return (
    // WRAPPER UTAMA: Mengatur spacing dan animasi container
    <PageWrapper className="space-y-6 pb-10">
      
      {/* SECTION 1: Header (Muncul Pertama) */}
      <AnimatedSection className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Surat / Administrasi</h1>
        </div>
        <Button onClick={() => router.push('/dashboard/letters/new')}>
          + Buat Surat
        </Button>
      </AnimatedSection>

      {/* SECTION 2: Tabs (Muncul Kedua) */}
      <AnimatedSection className="flex space-x-4 border-b border-border">
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`pb-2 px-4 transition-colors ${
            activeTab === 'outgoing' 
            ? 'border-b-2 border-primary text-primary font-medium' 
            : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          📤 Surat Keluar
        </button>
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-2 px-4 transition-colors ${
            activeTab === 'incoming' 
            ? 'border-b-2 border-primary text-primary font-medium' 
            : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          📥 Surat Masuk
        </button>
      </AnimatedSection>

      {/* SECTION 3: Content Card (Muncul Ketiga) */}
      <AnimatedSection>
        {activeTab === 'outgoing' ? (
          <Card>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari nomor / perihal / pemohon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-input border border-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 placeholder:text-muted-foreground"
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'Semua Jenis' },
                    { value: 'PMJ', label: 'Peminjaman' },
                    { value: 'IZN', label: 'Izin' },
                    { value: 'STF', label: 'Sertifikat' },
                    { value: 'SP', label: 'Surat Pengantar' },
                    { value: 'UND', label: 'Undangan' },
                  ]}
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'Semua Status' },
                    { value: 'PENDING', label: 'Menunggu' },
                    { value: 'APPROVED', label: 'Disetujui' },
                    { value: 'REJECTED', label: 'Ditolak' },
                  ]}
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={sortConfig}
                  onChange={(e) => setSortConfig(e.target.value)}
                  options={[
                    { value: 'newest', label: 'Terbaru' },
                    { value: 'oldest', label: 'Terlama' },
                  ]}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Memuat...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredLetters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Tidak ada surat</div>
            ) : (
              <Table data={filteredLetters} columns={outgoingColumns} keyField="id" />
            )}
          </Card>
        ) : (
          <Card>
            {isLoadingIncoming ? (
              <div className="text-center py-8 text-muted-foreground">Memuat...</div>
            ) : incomingLetters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Tidak ada surat masuk</div>
            ) : (
              <Table data={incomingLetters} columns={incomingColumns} keyField="id" />
            )}
          </Card>
        )}
      </AnimatedSection>

      {/* Modals (Tanpa animasi entry karena dikontrol state terpisah) */}
      {selectedLetter && (
        <LetterDetailModal
          isOpen={!!selectedLetter}
          onClose={() => setSelectedLetter(null)}
          letter={selectedLetter}
        />
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, letter: null })}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus"
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      >
        <p className="text-foreground">Apakah Anda yakin ingin menghapus surat ini?</p>
      </Modal>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </PageWrapper>
  );
}