'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';
import { Period } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext'; // Import Auth
import Card from '@/app/components/ui/Card';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { Plus, Search, Calendar, CheckCircle, Archive, Edit, Trash2, Power, XCircle, Eye } from 'lucide-react';
// IMPORT ANIMASI
import { PageWrapper, AnimatedSection } from '@/app/components/ui/PageAnimation';

export default function PeriodsPage() {
  const { isAdmin } = useAuth(); // Cek Role User
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Period[]>('/periods');
      setPeriods(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch periods:', error);
      setPeriods([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS (Hanya bisa dipanggil jika Admin) ---
  const handleActivatePeriod = async (id: string) => {
    try {
      await api.patch(`/periods/${id}/activate`, {});
      fetchPeriods();
    } catch (error) {
      console.error('Failed to activate period:', error);
    }
  };

  const handleArchivePeriod = async (id: string) => {
    if (!confirm('Yakin ingin mengarsipkan periode ini?')) return;
    try {
      await api.patch(`/periods/${id}/archive`, {});
      fetchPeriods();
    } catch (error) {
      console.error('Failed to archive period:', error);
    }
  };

  const handleDeletePeriod = async (id: string) => {
    if (!confirm('Yakin ingin menghapus periode ini? Aksi ini tidak dapat dibatalkan.')) return;
    try {
      await api.delete(`/periods/${id}`);
      fetchPeriods();
    } catch (error) {
      console.error('Failed to delete period:', error);
    }
  };

  const filteredPeriods = Array.isArray(periods) ? periods.filter((period) => {
    const matchesSearch = 
      period.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      period.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  return (
    <PageWrapper className="space-y-6 pb-10">
      
      {/* 1. Header Section */}
      <AnimatedSection className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Periode</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isAdmin 
              ? 'Kelola periode rekrutmen dan kegiatan laboratorium' 
              : 'Daftar periode aktif dan arsip laboratorium'}
          </p>
        </div>
        
        {/* BUTTON BUAT PERIODE (Hanya muncul jika ADMIN) */}
        {isAdmin && (
          <Button 
            onClick={() => setShowModal(true)}
            className="shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Buat Periode
          </Button>
        )}
      </AnimatedSection>

      {/* 2. Search & Filter Section */}
      <AnimatedSection>
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari kode atau nama periode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-input border border-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg border border-border">
              <Calendar className="w-4 h-4" />
              <span>Total: {periods.length} periode</span>
            </div>
          </div>
        </Card>
      </AnimatedSection>

      {/* 3. Grid Section */}
      <AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg"></div>
              </Card>
            ))
          ) : filteredPeriods.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Tidak ada periode
                  </h3>
                  <p className="text-muted-foreground">
                    {isAdmin ? 'Mulai dengan membuat periode pertama Anda' : 'Belum ada data periode yang tersedia.'}
                  </p>
                </div>
              </Card>
            </div>
          ) : (
            filteredPeriods.map((period) => (
              <Card key={period.id} hover className="relative overflow-hidden group border-l-4 border-l-transparent hover:border-l-primary transition-all flex flex-col justify-between h-full">
                
                <div>
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {period.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Aktif
                      </span>
                    ) : period.isArchived ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-500/10 text-slate-700 dark:text-slate-400 text-xs font-bold rounded-full border border-slate-500/20">
                        <Archive className="w-3 h-3" />
                        Arsip
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/20">
                        <XCircle className="w-3 h-3" />
                        Nonaktif
                      </span>
                    )}
                  </div>

                  {/* Period Info */}
                  <div className="pr-4 mb-4">
                    <p className="text-xs font-mono text-primary/80 mb-1 bg-primary/5 inline-block px-1.5 py-0.5 rounded">{period.code}</p>
                    <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-1">{period.name}</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-lg">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-medium">
                          {new Date(period.startDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })} - {new Date(period.endDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions (ONLY VIEW MODE FOR NON-ADMIN) */}
                <div className="pt-4 border-t border-border mt-4">
                  {isAdmin ? (
                    // ADMIN VIEW: Full Actions
                    <div className="flex items-center gap-2">
                      {!period.isActive && !period.isArchived && (
                        <button
                          onClick={() => handleActivatePeriod(period.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-bold transition-all"
                        >
                          <Power className="w-3.5 h-3.5" />
                          Aktifkan
                        </button>
                      )}
                      
                      {period.isActive && (
                        <button
                          onClick={() => handleArchivePeriod(period.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-500/10 text-slate-700 dark:text-slate-400 hover:bg-slate-500/20 rounded-lg text-xs font-bold transition-all"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Arsipkan
                        </button>
                      )}
                      
                      <button
                        onClick={() => setEditingPeriod(period)}
                        className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeletePeriod(period.id)}
                        className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    // ASSISTANT/MEMBER VIEW: Read Only
                    <div className="flex items-center justify-center text-xs text-muted-foreground/60 italic bg-muted/20 py-2 rounded-lg">
                      <Eye className="w-3 h-3 mr-1.5" /> View Only Access
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </AnimatedSection>

      {/* Create/Edit Modal (Hanya Dirender jika Admin) */}
      {isAdmin && showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="w-full max-w-lg shadow-2xl border border-primary/20">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {editingPeriod ? 'Edit Periode' : 'Buat Periode Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPeriod(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <Input label="Kode Periode" placeholder="Contoh: P2024-1" />
              <Input label="Nama Periode" placeholder="Contoh: Periode Rekrutmen 2024/2025" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Tanggal Mulai" type="date" />
                <Input label="Tanggal Selesai" type="date" />
              </div>
              
              <div className="flex gap-3 pt-6">
                <Button className="flex-1">
                  {editingPeriod ? 'Simpan Perubahan' : 'Buat Periode'}
                </Button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingPeriod(null);
                  }}
                  className="flex-1 px-4 py-2 border border-input rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
                >
                  Batal
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}