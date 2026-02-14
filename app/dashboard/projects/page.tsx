'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { Project } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Table from '@/app/components/ui/Table';
import Select from '@/app/components/ui/Select';
import ProjectDetailModal from '@/app/components/projects/ProjectDetailModal';
import CreateArchiveModal from '@/app/components/archives/CreateArchiveModal';
import Modal from '@/app/components/ui/Modal';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
// IMPORT ANIMASI
import { PageWrapper, AnimatedSection } from '@/app/components/ui/PageAnimation';

export default function ProjectsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({ isOpen: false, project: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [archiveModal, setArchiveModal] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({ isOpen: false, project: null });
  
  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivision, setFilterDivision] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortConfig, setSortConfig] = useState('newest');

  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      // Fetch "all" projects for client-side filtering by requesting a large page size
      // Ideally we should implement server-side filtering, but to keep current UI logic working:
      const response = await api.get<any>('/projects?page=0&size=1000');
      // Handle Spring Data Page structure
      if (response.content) {
        setProjects(response.content);
      } else {
        // Fallback if backend API structure changes
        setProjects([]);
        console.error('Unexpected API response structure:', response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (project: Project) => {
    setDeleteModal({ isOpen: true, project });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.project) return;

    try {
      setIsDeleting(true);
      await api.delete(`/projects/${deleteModal.project.id}`);
      setProjects(projects.filter((p) => p.id !== deleteModal.project!.id));
      success(`Proyek ${deleteModal.project.projectCode} berhasil dihapus`);
      setDeleteModal({ isOpen: false, project: null });
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal menghapus proyek');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects
    .filter(project => {
      const matchSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        project.projectCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDivision = filterDivision === 'ALL' || project.division === filterDivision;
      const matchStatus = filterStatus === 'ALL' || project.status === filterStatus;
      
      return matchSearch && matchDivision && matchStatus;
    })
    .sort((a, b) => {
      switch (sortConfig) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest': default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const columns = [
    { key: 'projectCode', header: 'Kode' },
    { key: 'name', header: 'Nama Proyek' },
    { 
      key: 'leader', 
      header: 'Ketua',
      render: (item: Project) => (
        <span className="font-medium text-blue-600 dark:text-blue-400">{item.leader.fullName}</span>
      )
    },
    { 
      key: 'division', 
      header: 'Divisi',
      render: (item: Project) => (
        <span className="text-xs px-2 py-1 bg-slate-500/10 text-slate-700 dark:text-slate-300 rounded-full font-medium">
          {item.division.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Project) => {
        const colors: Record<string, string> = {
          NOT_STARTED: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
          IN_PROGRESS: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
          ON_HOLD: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
          COMPLETED: 'bg-green-500/10 text-green-700 dark:text-green-400',
          CANCELLED: 'bg-red-500/10 text-red-700 dark:text-red-400',
        };

        if (item.approvalStatus === 'PENDING') {
           return (
             <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
               Pending Approval
             </span>
           );
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[item.status] || 'bg-slate-500/10'}`}>
            {item.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
       key: 'progressPercent',
       header: 'Progress',
       render: (item: Project) => (
         <div className="w-24">
            <div className="flex justify-between text-xs mb-1 text-muted-foreground">
               <span>{item.progressPercent}%</span>
            </div>
            <div className="w-full bg-secondary dark:bg-muted rounded-full h-1.5">
               <div 
                 className={`h-1.5 rounded-full ${item.progressPercent === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                 style={{ width: `${item.progressPercent}%` }}
               ></div>
            </div>
         </div>
       )
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Project) => (
        <div className="flex gap-2">
           <Button
             size="sm"
             variant="secondary"
             onClick={(e) => {
               e.stopPropagation();
               setSelectedProject(item);
             }}
           >
             Detail
           </Button>
          {isAdmin && item.status === 'COMPLETED' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setArchiveModal({ isOpen: true, project: item });
              }}
            >
              📁 Arsipkan
            </Button>
          )}
          {isAdmin && (
            <>
              {isAdmin && item.approvalStatus === 'PENDING' && (
               <Button
                 size="sm"
                 variant="ghost"
                 onClick={(e) => {
                   e.stopPropagation();
                   router.push(`/dashboard/projects/${item.id}`);
                 }}
               >
                 Edit
               </Button>
              )}
              {isAdmin && item.approvalStatus !== 'PENDING' && (
                 // Allow Edit only if NOT Rejected/Approved? Or maybe just hide it? 
                 // User specifically asked about Rejected.
                 // Let's hide it for REJECTED and APPROVED.
                 null
              )}
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
            </>
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

  // UPDATE: Menggunakan PageWrapper untuk membungkus halaman
  return (
    <PageWrapper className="space-y-6 pb-10">
      {/* SECTION 1: Header */}
      <AnimatedSection className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        {/* Allow all authenticated users to create projects */}
        <Button onClick={() => router.push('/dashboard/projects/new')}>
          + Buat Proyek
        </Button>
      </AnimatedSection>

      {/* SECTION 2: Filters & Table */}
      <AnimatedSection>
        <Card>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari proyek / kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-input border border-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 placeholder:text-muted-foreground"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                label=""
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Semua Divisi' },
                  { value: 'BIG_DATA', label: 'Big Data' },
                  { value: 'CYBER_SECURITY', label: 'Cyber Security' },
                  { value: 'GAME_TECH', label: 'Game Tech' },
                  { value: 'GIS', label: 'GIS' },
                ]}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                label=""
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Semua Status' },
                  { value: 'NOT_STARTED', label: 'Not Started' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'ON_HOLD', label: 'On Hold' },
                  { value: 'COMPLETED', label: 'Completed' },
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
                  { value: 'name_asc', label: 'Nama (A-Z)' },
                  { value: 'name_desc', label: 'Nama (Z-A)' },
                ]}
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredProjects}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="Belum ada proyek"
          />
        </Card>
      </AnimatedSection>

      {/* Components Overlay (Modal & Toast) tetap berada di dalam wrapper atau di luar tidak masalah,
          tapi diletakkan di sini agar rapi */}
      <ProjectDetailModal
         isOpen={!!selectedProject}
         onClose={() => setSelectedProject(null)}
         project={selectedProject}
         onSuccess={() => {
           setSelectedProject(null);
           fetchProjects();
         }}
      />

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, project: null })}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus"
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      >
        <p className="text-foreground">
          Apakah Anda yakin ingin menghapus proyek{' '}
          <strong>{deleteModal.project?.name}</strong>?
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>

      <CreateArchiveModal
        isOpen={archiveModal.isOpen}
        onClose={() => setArchiveModal({ isOpen: false, project: null })}
        onSuccess={() => {
          fetchProjects();
          setArchiveModal({ isOpen: false, project: null });
        }}
        sourceType="PROJECT"
        sourceId={archiveModal.project?.id || ''}
        sourceName={archiveModal.project?.name || ''}
      />

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