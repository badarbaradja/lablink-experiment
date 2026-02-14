'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/app/lib/api';
import { Member, UpdateMemberRequest } from '@/app/types';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Modal from '@/app/components/ui/Modal';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';

const expertDivisions = [
  { value: 'CYBER_SECURITY', label: 'Cyber Security' },
  { value: 'BIG_DATA', label: 'Big Data' },
  { value: 'GIS', label: 'Geographic Information System' },
  { value: 'GAME_TECH', label: 'Game Technology' },
];

const departments = [
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'EKSTERNAL', label: 'Eksternal' },
  { value: 'IT_SUPPORT', label: 'IT Support' },
];

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<UpdateMemberRequest>({
    fullName: '',
    expertDivision: '',
    department: '',
    email: '',
    phoneNumber: '',
    socialMediaLink: '',
  });
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      setIsFetching(true);
      const member = await api.get<Member>(`/members/${id}`);
      setFormData({
        fullName: member.fullName,
        expertDivision: member.expertDivision,
        department: member.department,
        email: member.email || '',
        phoneNumber: member.phoneNumber || '',
        socialMediaLink: member.socialMediaLink || '',
      });
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load member');
      router.back();
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      setIsLoading(true);
      await api.put(`/members/${id}`, formData);
      success(`Member ${formData.fullName} berhasil diperbarui`);
      setShowConfirmModal(false);
      setTimeout(() => {
        router.push('/dashboard/members');
      }, 1500);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update member');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Member</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <Input
              label="Nama Lengkap"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Divisi Keahlian
                </label>
                <select
                  name="expertDivision"
                  value={formData.expertDivision}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {expertDivisions.map((div) => (
                    <option key={div.value} value={div.value}>
                      {div.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departemen
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan email"
              />
              <Input
                label="No. Telepon"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Masukkan no. telepon"
              />
            </div>

            <Input
              label="Social Media Link"
              name="socialMediaLink"
              value={formData.socialMediaLink}
              onChange={handleChange}
              placeholder="Link Instagram/LinkedIn/etc"
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit">Simpan Perubahan</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmUpdate}
        title="Konfirmasi Perubahan"
        confirmText="Simpan"
        cancelText="Batal"
        variant="primary"
        isLoading={isLoading}
      >
        <p>
          Apakah Anda yakin ingin menyimpan perubahan untuk member{' '}
          <strong>{formData.fullName}</strong>?
        </p>
      </Modal>

      {/* Toast Notifications */}
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
