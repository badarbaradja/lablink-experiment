'use client';

import { useState } from 'react';
import Modal from '@/app/components/ui/Modal';
import { Letter } from '@/app/types';
import { useToast } from '@/app/hooks/useToast';
import Toast from '@/app/components/ui/Toast';

interface DownloadLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: Letter | null;
}

export default function DownloadLetterModal({
  isOpen,
  onClose,
  letter,
}: DownloadLetterModalProps) {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [extraData, setExtraData] = useState({
    nama_pemohon: '',
    jabatan_pemohon: '',
    nim_pemohon: '',
    nomor_pemohon: '',
    nama_kegiatan: '',
    waktu_mulai: '',
    waktu_selesai: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExtraData(prev => ({ ...prev, [name]: value }));
  };

  const handleDownload = async () => {
    if (!letter) return;
    
    try {
      setIsDownloading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:8081/api/administration/letters/${letter.id}/download`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(extraData),
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mendownload dokumen');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Surat_${letter.letterNumber.replace(/\//g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      success('Dokumen berhasil didownload');
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal mendownload dokumen');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!letter) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDownload}
        title="Download Surat"
        confirmText="⬇️ Download"
        cancelText="Batal"
        isLoading={isDownloading}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
            📄 Isi data berikut untuk mengisi placeholder di template surat:
            <br />
            <strong>{letter.letterNumber}</strong> - {letter.subject}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemohon</label>
              <input
                type="text"
                name="nama_pemohon"
                value={extraData.nama_pemohon}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nama lengkap pemohon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan Pemohon</label>
              <input
                type="text"
                name="jabatan_pemohon"
                value={extraData.jabatan_pemohon}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ketua / Sekretaris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIM Pemohon</label>
              <input
                type="text"
                name="nim_pemohon"
                value={extraData.nim_pemohon}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="1101xxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. HP Pemohon</label>
              <input
                type="text"
                name="nomor_pemohon"
                value={extraData.nomor_pemohon}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kegiatan</label>
              <input
                type="text"
                name="nama_kegiatan"
                value={extraData.nama_kegiatan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nama event/kegiatan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai</label>
              <input
                type="text"
                name="waktu_mulai"
                value={extraData.waktu_mulai}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="08:00 WIB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai</label>
              <input
                type="text"
                name="waktu_selesai"
                value={extraData.waktu_selesai}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="17:00 WIB"
              />
            </div>
          </div>
        </div>
      </Modal>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
