'use client';

import Modal from '@/app/components/ui/Modal';
import { Archive } from '@/app/types';

interface ArchiveDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  archive: Archive | null;
}

export default function ArchiveDetailModal({
  isOpen,
  onClose,
  archive,
}: ArchiveDetailModalProps) {
  if (!archive) return null;

  const TYPE_COLORS: Record<string, string> = {
    PUBLIKASI: 'bg-purple-100 text-purple-700',
    HKI: 'bg-green-100 text-green-700',
    PKM: 'bg-blue-100 text-blue-700',
    LAPORAN: 'bg-orange-100 text-orange-700',
    SERTIFIKAT: 'bg-yellow-100 text-yellow-700',
  };

  const DEPT_COLORS: Record<string, string> = {
    INTERNAL: 'bg-indigo-100 text-indigo-700',
    EKSTERNAL: 'bg-teal-100 text-teal-700',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Arsip: ${archive.archiveCode}`}
      cancelText="Tutup"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{archive.title}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[archive.archiveType] || 'bg-gray-100'}`}>
              {archive.archiveType}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${DEPT_COLORS[archive.department] || 'bg-gray-100'}`}>
              {archive.department}
            </span>
          </div>
        </div>

        {/* Source Info */}
        {archive.source && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Sumber ({archive.sourceType === 'PROJECT' ? 'Proyek' : 'Event'})
            </label>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {archive.source.code} - {archive.source.name}
            </p>
            {archive.source.leader && (
              <p className="text-xs text-gray-500 mt-1">
                {archive.sourceType === 'PROJECT' ? 'Leader' : 'PIC'}: {archive.source.leader}
              </p>
            )}
          </div>
        )}

        {archive.description && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Deskripsi</label>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1 whitespace-pre-wrap">
              {archive.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {archive.publishLocation && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Lokasi Publikasi</label>
              <p className="text-sm text-gray-900 mt-1">{archive.publishLocation}</p>
            </div>
          )}
          {archive.referenceNumber && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">No. Referensi</label>
              <p className="text-sm text-gray-900 mt-1 font-mono">{archive.referenceNumber}</p>
            </div>
          )}
        </div>

        {archive.publishDate && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tanggal Publikasi</label>
            <p className="text-sm text-gray-900 mt-1">
              {new Date(archive.publishDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
