'use client';

import Modal from '@/app/components/ui/Modal';
import { Letter } from '@/app/types';

interface LetterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: Letter | null;
}

const TYPE_LABELS: Record<string, string> = {
  PMJ: 'Peminjaman',
  IZN: 'Izin',
  STF: 'Sertifikat/Piagam',
  SP: 'Surat Pengantar',
  UND: 'Undangan',
};

const CATEGORY_LABELS: Record<string, string> = {
  RK: 'Internal (Rektorat)',
  INT: 'Internal MBC',
  EXT: 'Eksternal',
  WSH: 'Workshop/Seminar',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-700',
  SENT: 'bg-green-100 text-green-700',
};

export default function LetterDetailModal({
  isOpen,
  onClose,
  letter,
}: LetterDetailModalProps) {
  if (!letter) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Surat: ${letter.letterNumber}`}
      cancelText="Tutup"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{letter.subject}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {TYPE_LABELS[letter.letterType] || letter.letterType}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              {CATEGORY_LABELS[letter.category] || letter.category}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[letter.status] || 'bg-gray-100'}`}>
              {letter.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Nomor Surat</label>
            <p className="text-sm font-mono text-gray-900 mt-1">{letter.letterNumber}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tanggal</label>
            <p className="text-sm text-gray-900 mt-1">
              {new Date(letter.issueDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tujuan</label>
          <p className="text-sm text-gray-900 mt-1">{letter.recipient}</p>
        </div>

        {letter.content && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Isi Surat</label>
            <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
              {letter.content}
            </p>
          </div>
        )}

        {letter.attachment && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Lampiran</label>
            <p className="text-sm text-gray-900 mt-1">{letter.attachment}</p>
          </div>
        )}

        {letter.event && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Terkait Event</label>
            <p className="text-sm font-medium text-blue-700 mt-1">
              {letter.event.eventCode} - {letter.event.name}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          Dibuat oleh: {letter.createdBy || '-'}
        </div>
      </div>
    </Modal>
  );
}
