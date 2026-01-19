'use client';

import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';
import { Archive } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Table from '@/app/components/ui/Table';
import Select from '@/app/components/ui/Select';
import ArchiveDetailModal from '@/app/components/archives/ArchiveDetailModal';
import Modal from '@/app/components/ui/Modal';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
// IMPORT ANIMASI
import { PageWrapper, AnimatedSection } from '@/app/components/ui/PageAnimation';

export default function ArchivesPage() {
  const { isAdmin } = useAuth();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    archive: Archive | null;
  }>({ isOpen: false, archive: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [sortConfig, setSortConfig] = useState('newest');

  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Archive[]>('/archives');
      setArchives(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat arsip');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (archive: Archive) => {
    setDeleteModal({ isOpen: true, archive });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.archive) return;

    try {
      setIsDeleting(true);
      await api.delete(`/archives/${deleteModal.archive.id}`);
      setArchives(archives.filter((a) => a.id !== deleteModal.archive!.id));
      success(`Arsip ${deleteModal.archive.archiveCode} berhasil dihapus`);
      setDeleteModal({ isOpen: false, archive: null });
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal menghapus arsip');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredArchives = archives
    .filter(archive => {
      const matchSearch =
        archive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        archive.archiveCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (archive.source?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchType = filterType === 'ALL' || archive.archiveType === filterType;
      const matchDept = filterDepartment === 'ALL' || archive.department === filterDepartment;

      return matchSearch && matchType && matchDept;
    })
    .sort((a, b) => {
      switch (sortConfig) {
        case 'title_asc': return a.title.localeCompare(b.title);
        case 'title_desc': return b.title.localeCompare(a.title);
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest': default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const TYPE_COLORS: Record<string, string> = {
    PUBLIKASI: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    HKI: 'bg-green-500/10 text-green-700 dark:text-green-400',
    PKM: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    LAPORAN: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    SERTIFIKAT: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  };

  const columns = [
    { key: 'archiveCode', header: 'Kode' },
    { key: 'title', header: 'Judul' },
    {
      key: 'archiveType',
      header: 'Tipe',
      render: (item: Archive) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[item.archiveType] || 'bg-slate-500/10'}`}>
          {item.archiveType}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Sumber',
      render: (item: Archive) => (
        <span className="text-sm text-muted-foreground">
          {item.department === 'INTERNAL' ? '📁 Project' : '📅 Event'}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Nama Sumber',
      render: (item: Archive) => (
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate max-w-37.5 block" title={item.source?.name}>
          {item.source?.name || '-'}
        </span>
      ),
    },
    {
      key: 'publishDate',
      header: 'Tgl. Publikasi',
      render: (item: Archive) => (
        <span className="text-sm text-muted-foreground">
          {item.publishDate
            ? new Date(item.publishDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Archive) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedArchive(item);
            }}
          >
            Detail
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(item);
              }}
            >
              Hapus
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  // --- IMPLEMENTASI ANIMASI ---
  return (
    <PageWrapper className="space-y-6 pb-10">
      
      {/* 1. Header Section - Muncul Pertama */}
      <AnimatedSection className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Archives / Arsip</h1>
      </AnimatedSection>

      {/* 2. Content Section (Card) - Muncul Kedua */}
      <AnimatedSection>
        <Card>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari judul / kode / sumber..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-input border border-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 placeholder:text-muted-foreground"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                label=""
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Semua Tipe' },
                  { value: 'PUBLIKASI', label: 'Publikasi' },
                  { value: 'HKI', label: 'HKI' },
                  { value: 'PKM', label: 'PKM' },
                  { value: 'LAPORAN', label: 'Laporan' },
                  { value: 'SERTIFIKAT', label: 'Sertifikat' },
                ]}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                label=""
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Semua Sumber' },
                  { value: 'INTERNAL', label: 'Project' },
                  { value: 'EKSTERNAL', label: 'Event' },
                ]}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                label=""
                value={sortConfig}
                onChange={(e) => setSortConfig(e.target.value)}
                options={[
                  { value: 'newest', label: 'Terbaru' },
                  { value: 'oldest', label: 'Terlama' },
                  { value: 'title_asc', label: 'Judul (A-Z)' },
                  { value: 'title_desc', label: 'Judul (Z-A)' },
                ]}
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredArchives}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="Belum ada arsip."
          />
        </Card>
      </AnimatedSection>

      {/* Modals & Toasts (Tidak dianimasi karena overlay/pop-up) */}
      <ArchiveDetailModal
        isOpen={!!selectedArchive}
        onClose={() => setSelectedArchive(null)}
        archive={selectedArchive}
      />

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, archive: null })}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus"
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      >
        <p className="text-foreground">
          Apakah Anda yakin ingin menghapus arsip{' '}
          <strong>{deleteModal.archive?.title}</strong>?
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Tindakan ini tidak dapat dibatalkan.
        </p>
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