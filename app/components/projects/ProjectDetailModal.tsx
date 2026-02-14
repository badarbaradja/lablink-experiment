import { useState } from 'react';
import { api } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/app/hooks/useToast';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import { Project } from '@/app/types';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess?: () => void;
}

export default function ProjectDetailModal({
  isOpen,
  onClose,
  project,
  onSuccess,
}: ProjectDetailModalProps) {
  const { user, isAdmin } = useAuth(); // isAdmin is minimal check, ideally check role
  const { success: showSuccess, error: showError } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!project) return null;
  
  // Reset state when modal closes/opens
  if (!isOpen && showRejectForm) setShowRejectForm(false);

  // Helper to check if user can approve
  const canApprove = isAdmin || user?.role === 'RESEARCH_COORD' || user?.role === 'DIVISION_HEAD';

  const handleApprove = async () => {
    // Basic confirmation
    if (typeof window !== 'undefined' && !window.confirm('Apakah Anda yakin ingin menyetujui proyek ini?')) return;

    try {
      setIsProcessing(true);
      console.log(`Approving project ${project.id}...`);
      await api.post(`/projects/${project.id}/approve`, {});
      console.log('Approval success');
      showSuccess('Proyek berhasil disetujui');
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      console.error('Approval failed:', err);
      showError(err instanceof Error ? err.message : 'Gagal menyetujui proyek');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Harap masukkan alasan penolakan');
      return;
    }
    
    try {
      setIsProcessing(true);
      await api.post(`/projects/${project.id}/reject`, { rejectionReason });
      showSuccess('Proyek berhasil ditolak');
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal menolak proyek');
    } finally {
      setIsProcessing(false);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    NOT_STARTED: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    ON_HOLD: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const statusLabel = project.status.replace('_', ' ');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Proyek: ${project.projectCode}`}
      cancelText="Tutup"
    >
      <div className="space-y-6">
        {/* APPROVAL SECTION for Pending Projects */}
        {project.approvalStatus === 'PENDING' && canApprove && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <h4 className="text-sm font-bold text-yellow-800 mb-2">Persetujuan Diperlukan</h4>
                <p className="text-xs text-yellow-700 mb-4">
                    Proyek ini menunggu persetujuan dari Admin atau Kepala Divisi.
                </p>
                
                {!showRejectForm ? (
                    <div className="flex gap-2">
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white" 
                            onClick={handleApprove}
                            isLoading={isProcessing}
                        >
                            ✓ Setujui
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={() => setShowRejectForm(true)}
                            isLoading={isProcessing}
                        >
                            ✕ Tolak
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <textarea
                            className="w-full text-sm p-2 border rounded-md"
                            placeholder="Masukkan alasan penolakan..."
                            rows={2}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="secondary" onClick={() => setShowRejectForm(false)}>Batal</Button>
                            <Button size="sm" variant="danger" onClick={handleReject} isLoading={isProcessing}>Kirim Penolakan</Button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* ... Existing Content ... */}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                STATUS_COLORS[project.status] || 'bg-gray-100'
              }`}
            >
              {statusLabel}
            </span>
            {project.approvalStatus && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    project.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {project.approvalStatus}
                </span>
            )}
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
              {project.division.replace('_', ' ')}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              {project.activityType}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
            Progress ({project.progressPercent}%)
          </label>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div
              className={`h-2.5 rounded-full ${
                project.progressPercent === 100 ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${project.progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Tanggal Mulai
            </label>
            <p className="text-sm text-gray-900 mt-1">
              {project.startDate
                ? new Date(project.startDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Tanggal Selesai
            </label>
            <p className="text-sm text-gray-900 mt-1">
              {project.endDate
                ? new Date(project.endDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'}
            </p>
          </div>
        </div>

        {project.description && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Deskripsi
            </label>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
              {project.description}
            </p>
          </div>
        )}
        
        {/* Rejection Detail if Rejected */}
        {project.approvalStatus === 'REJECTED' && project.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
             <label className="text-xs text-red-800 uppercase tracking-wide font-semibold">Alasan Penolakan</label>
             <p className="text-sm text-red-700 mt-1">{project.rejectionReason}</p>
          </div>
        )}

        {/* Team Section */}
        <div className="border-t border-gray-100 pt-4">
          <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3 block">
            Tim Proyek
          </label>
          
          <div className="space-y-4">
            {/* Leader */}
            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                {project.leader.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {project.leader.fullName} <span className="text-blue-600 text-xs font-normal">(Ketua)</span>
                </p>
                <p className="text-xs text-gray-500">{project.leader.expertDivision}</p>
              </div>
            </div>

            {/* Members */}
            {project.teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                      {member.fullName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">{member.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{member.expertDivision}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <p className="text-sm text-gray-400 italic">Belum ada anggota tim tambahan.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
