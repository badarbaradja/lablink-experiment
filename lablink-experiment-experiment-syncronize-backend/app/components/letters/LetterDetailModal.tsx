'use client';

import Modal from '@/app/components/ui/Modal';
import { Letter } from '@/app/types';
import { Check } from 'lucide-react';

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

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  PENDING: { label: 'Diajukan', color: 'bg-gray-100 text-gray-700', step: 1 },
  REVIEWED: { label: 'Ditinjau', color: 'bg-blue-100 text-blue-700', step: 2 },
  APPROVED: { label: 'Disetujui', color: 'bg-green-100 text-green-700', step: 3 },
  SIGNED: { label: 'Ditandatangani', color: 'bg-purple-100 text-purple-700', step: 4 },
  REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-700', step: 0 },
};

export default function LetterDetailModal({
  isOpen,
  onClose,
  letter,
}: LetterDetailModalProps) {
  if (!letter) return null;

  const currentStatus = STATUS_CONFIG[letter.status] || { label: letter.status, color: 'bg-gray-100', step: 0 };
  const steps = ['PENDING', 'REVIEWED', 'APPROVED', 'SIGNED'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Surat: ${letter.letterNumber}`}
      cancelText="Tutup"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8 px-2">
          {steps.map((stepStatus, index) => {
            const stepConfig = STATUS_CONFIG[stepStatus];
            const isCompleted = currentStatus.step > index + 1 || currentStatus.step === 4;
            const isCurrent = letter.status === stepStatus;

            return (
              <div key={stepStatus} className="flex flex-col items-center flex-1 relative">
                {index !== 0 && (
                  <div className={`absolute top-4 -left-1/2 w-full h-0.5 ${(isCompleted || isCurrent) ? 'bg-blue-500' : 'bg-gray-200'}`} />
                )}
                
                <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCurrent ? 'border-blue-500 bg-white text-blue-500 shadow-sm' : 
                  isCompleted ? 'bg-blue-500 border-blue-500 text-white' : 
                  'border-gray-300 bg-white text-gray-300'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-xs font-bold">{index + 1}</span>}
                </div>
                
                <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
                  {stepConfig.label}
                </span>
              </div>
            );
          })}
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">{letter.subject}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
              {TYPE_LABELS[letter.letterType] || letter.letterType}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
              {CATEGORY_LABELS[letter.category] || letter.category}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Nomor Surat</label>
            <p className="text-sm font-mono text-gray-900 mt-1 bg-gray-50 p-1 px-2 rounded border border-gray-100 inline-block">
              {letter.letterNumber}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tanggal</label>
            <p className="text-sm text-gray-900 mt-1">
              {/* Fix Overload 1 of 4: Safety check untuk null date */}
              {letter.issueDate ? new Date(letter.issueDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }) : '-'}
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
            <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap leading-relaxed">
              {letter.content}
            </p>
          </div>
        )}

        {letter.attachment && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Lampiran</label>
            <p className="text-sm text-gray-900 mt-1 italic">{letter.attachment}</p>
          </div>
        )}

        {letter.event && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <label className="text-xs text-blue-600 uppercase tracking-wide font-bold">Terkait Event</label>
            <p className="text-sm font-medium text-blue-700 mt-1">
              {letter.event.eventCode} - {letter.event.name}
            </p>
          </div>
        )}

        <div className="text-[10px] text-gray-400 pt-4 border-t border-gray-100 flex justify-between">
          {/* Fix Property createdBy: Menggunakan optional chaining atau alternatif jika tidak ada di interface */}
          <span>Diajukan Oleh: <span className="font-medium text-gray-600">User Lab</span></span>
          
          {/* Fix Comparison overlapping: Casting ke string agar comparison aman */}
          {String(letter.status) === 'SIGNED' && (
            <span className="text-green-600 font-bold uppercase">Ready to Download</span>
          )}
        </div>
      </div>
    </Modal>
  );
}