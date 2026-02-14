'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';
import Link from 'next/link';
import { Presence } from '@/app/types/presence';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { Camera, Calendar, FileText, Upload, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import Select from '@/app/components/ui/Select';
// Import Animasi
import { PageWrapper, AnimatedSection } from '@/app/components/ui/PageAnimation';

export default function PresencePage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Presence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    type: 'MEETING',
    date: new Date().toISOString().split('T')[0], // Default today
    title: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMyPresenceHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat riwayat presensi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Mohon upload foto bukti kehadiran');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      // Auto-set title based on type if empty
      const title = formData.title || (formData.type === 'MEETING' ? 'Rapat Rutin' : 'On Call Duty');

      await api.uploadPresence({
        ...formData,
        title
      }, selectedFile);

      setSuccessMessage('Presensi berhasil dikirim!');
      
      // Reset form
      setFormData({
        type: 'MEETING',
        date: new Date().toISOString().split('T')[0],
        title: '',
        notes: ''
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Refresh history
      fetchHistory();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim presensi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const PRESENCE_TYPES = [
    { value: 'MEETING', label: 'Rapat 2 Mingguan' },
    { value: 'ON_CALL', label: 'On Call' },
    { value: 'OTHER', label: 'Lainnya' }
  ];

  return (
    <PageWrapper className="space-y-8 pb-10">
      
      {/* 1. Header Section */}
      <AnimatedSection className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Presensi</h1>
          <p className="text-muted-foreground">Input dan riwayat kehadiran Anda</p>
        </div>
        
        {user?.role === 'ADMIN' && (
          <Link 
            href="/dashboard/presence/recap"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Lihat Rekap Presensi</span>
          </Link>
        )}
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Input Form (Kiri/Atas) */}
        <AnimatedSection className="lg:col-span-1">
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Input Kehadiran</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-green-500/10 text-green-600 dark:text-green-400 text-sm rounded-lg border border-green-500/20 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Select
                  label="Tipe Kehadiran"
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  options={PRESENCE_TYPES}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tanggal</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-input text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Catatan (Optional)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-input text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground"
                    placeholder="Contoh: Diskusi progress project..."
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Foto Bukti</label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all ${
                  previewUrl ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
                }`}>
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="relative">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="mx-auto h-48 object-cover rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-lg hover:bg-destructive/90"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div className="flex text-sm text-muted-foreground justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                            <span>Upload a file</span>
                            <input 
                              type="file" 
                              className="sr-only" 
                              accept="image/*"
                              onChange={handleFileChange}
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Kirim Presensi
              </Button>
            </form>
          </Card>
        </AnimatedSection>

        {/* 3. History List (Kanan/Bawah) */}
        <AnimatedSection className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Riwayat Presensi</h2>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-4 p-4 border border-border rounded-xl">
                    <div className="w-24 h-24 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Belum ada data presensi
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-xl hover:shadow-md transition-shadow">
                    <div className="shrink-0">
                      <img 
                        src={item.imageUrl} 
                        alt="Evidence" 
                        className="w-full sm:w-32 h-32 object-cover rounded-lg bg-muted"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 ${
                            item.type === 'MEETING' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' :
                            item.type === 'ON_CALL' ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400' :
                            'bg-slate-500/10 text-slate-700 dark:text-slate-400'
                          }`}>
                            {item.type === 'MEETING' ? 'Rapat 2 Mingguan' : item.type.replace('_', ' ')}
                          </span>
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(item.date).toLocaleDateString('id-ID', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      {item.notes && (
                        <p className="mt-3 text-sm text-foreground/80 bg-muted/50 p-3 rounded-lg border border-border">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </AnimatedSection>

      </div>
    </PageWrapper>
  );
}