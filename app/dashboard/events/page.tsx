'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { Event } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext';
// UI Components
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Table from '@/app/components/ui/Table';
import Select from '@/app/components/ui/Select';
import { 
  Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, 
  MapPin, Clock, User, Plus, Search 
} from 'lucide-react';
// Modals
import EventDetailModal from '@/app/components/events/EventDetailModal';
import CreateArchiveModal from '@/app/components/archives/CreateArchiveModal';
import Modal from '@/app/components/ui/Modal';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
// Animasi
import { PageWrapper, AnimatedSection } from '@/app/components/ui/PageAnimation';

export default function EventsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- VIEW STATE (Calendar vs Table) ---
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date()); // Bulan yang dilihat di kalender
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Tanggal yang diklik di kalender

  // --- MODAL STATES ---
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    event: Event | null;
  }>({ isOpen: false, event: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [archiveModal, setArchiveModal] = useState<{
    isOpen: boolean;
    event: Event | null;
  }>({ isOpen: false, event: null });
  
  // --- FILTER & SORT STATES (Table Mode) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortConfig, setSortConfig] = useState('newest');

  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Event[]>('/events');
      setEvents(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    return { days, firstDay };
  };

  const { days: totalDays, firstDay: startDayIndex } = getDaysInMonth(currentDate);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  // Filter Events untuk Bulan yang Dipilih (Sidebar Agenda)
  const currentMonthEvents = events.filter(e => {
    const eventDate = new Date(e.startDate);
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // --- TABLE LOGIC (Existing) ---
  const handleDeleteClick = (event: Event) => {
    setDeleteModal({ isOpen: true, event });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.event) return;
    try {
      setIsDeleting(true);
      await api.delete(`/events/${deleteModal.event.id}`);
      setEvents(events.filter((e) => e.id !== deleteModal.event!.id));
      success(`Event ${deleteModal.event.eventCode} berhasil dihapus`);
      setDeleteModal({ isOpen: false, event: null });
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Gagal menghapus event');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEventsTable = events
    .filter(event => {
      const matchSearch = 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        event.eventCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || event.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      switch (sortConfig) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'oldest': return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'newest': default: return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
    });

  // --- RENDER HELPERS ---
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PLANNED: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
      ONGOING: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      COMPLETED: 'bg-green-500/10 text-green-700 dark:text-green-400',
      CANCELLED: 'bg-red-500/10 text-red-700 dark:text-red-400',
    };
    return colors[status] || 'bg-slate-500/10';
  };

  const tableColumns = [
    { key: 'eventCode', header: 'Kode' },
    { key: 'name', header: 'Nama Event' },
    { 
      key: 'startDate', 
      header: 'Tanggal',
      render: (item: Event) => (
        <span className="text-sm text-foreground">
             {new Date(item.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    { 
      key: 'pic', 
      header: 'PIC',
      render: (item: Event) => (
        <span className="font-medium text-blue-600 dark:text-blue-400 text-sm">{item.pic?.fullName || '-'}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Event) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
          {item.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Event) => (
        <div className="flex gap-2">
           <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedEvent(item); }}>
             Detail
           </Button>
           {isAdmin && item.status === 'COMPLETED' && (
             <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setArchiveModal({ isOpen: true, event: item }); }}>
               📁
             </Button>
           )}
           {isAdmin && (
             <>
               <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/events/${item.id}`); }}>
                 Edit
               </Button>
               <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}>
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
      <PageWrapper>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="space-y-6 pb-10">
      
      {/* 1. Header Section & View Switcher */}
      <AnimatedSection className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events / Kegiatan</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manajemen jadwal dan agenda laboratorium
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switcher */}
          <div className="flex bg-muted p-1 rounded-lg border border-border">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${viewMode === 'calendar' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <CalendarIcon size={16} /> <span className="hidden sm:inline">Kalender</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List size={16} /> <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>

          {isAdmin && (
            <Button onClick={() => router.push('/dashboard/events/new')}>
              <Plus className="w-4 h-4 mr-2" /> Buat Event
            </Button>
          )}
        </div>
      </AnimatedSection>

      {/* 2. MODE KALENDER */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Grid Kalender */}
           <Card className="lg:col-span-2 min-h-125">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-foreground capitalize">
                 {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
               </h2>
               <div className="flex gap-1">
                 <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronLeft size={20} /></button>
                 <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronRight size={20} /></button>
               </div>
             </div>

             <div className="grid grid-cols-7 gap-2 mb-2">
               {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                 <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">{day}</div>
               ))}
             </div>

             <div className="grid grid-cols-7 gap-2">
               {Array.from({ length: startDayIndex }).map((_, i) => (
                 <div key={`empty-${i}`} className="h-24 bg-muted/20 rounded-xl" />
               ))}
               
               {Array.from({ length: totalDays }).map((_, i) => {
                 const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
                 const isToday = isSameDay(dayDate, new Date());
                 const isSelected = isSameDay(dayDate, selectedDate);
                 const dayEvents = events.filter(e => isSameDay(new Date(e.startDate), dayDate));

                 return (
                   <div 
                     key={i}
                     onClick={() => setSelectedDate(dayDate)}
                     className={`
                       relative h-24 p-2 rounded-xl border cursor-pointer transition-all duration-200 group flex flex-col items-start justify-between
                       ${isSelected ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-card border-border hover:border-primary/50'}
                     `}
                   >
                     <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : isSelected ? 'text-blue-700' : 'text-muted-foreground'}`}>
                       {i + 1}
                     </span>
                     <div className="w-full space-y-1 overflow-hidden">
                       {dayEvents.map((ev, idx) => (
                         <div key={idx} className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block mr-1" title={ev.name}></div>
                       ))}
                       {dayEvents.length > 0 && <div className="text-[10px] text-muted-foreground font-medium truncate">{dayEvents.length} Kegiatan</div>}
                     </div>
                   </div>
                 );
               })}
             </div>
           </Card>

           {/* Agenda Sidebar */}
           <Card className="h-full flex flex-col bg-muted/20 border-l-4 border-l-primary/20">
             <div className="mb-6">
               <h3 className="text-lg font-bold text-foreground">Agenda Bulan Ini</h3>
               <p className="text-sm text-primary font-medium mt-1">
                 {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
               </p>
               <p className="text-xs text-muted-foreground mt-1">
                 {currentMonthEvents.length} kegiatan terjadwal
               </p>
             </div>

             <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
               {currentMonthEvents.length === 0 ? (
                 <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-center p-4 border-2 border-dashed border-border rounded-xl">
                   <CalendarIcon className="w-8 h-8 mb-2 opacity-20" />
                   <p className="text-sm">Tidak ada kegiatan bulan ini.</p>
                 </div>
               ) : (
                 currentMonthEvents.map(event => {
                   const eventDate = new Date(event.startDate);
                   const isToday = isSameDay(eventDate, new Date());
                   
                   return (
                     <div 
                       key={event.id} 
                       onClick={() => setSelectedEvent(event)}
                       className={`bg-card p-4 rounded-xl shadow-sm border cursor-pointer transition-all group ${
                         isToday ? 'border-primary/70 ring-1 ring-primary/20' : 'border-border hover:border-primary/50'
                       }`}
                     >
                       <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                           <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusColor(event.status)}`}>
                             {event.status}
                           </span>
                           {isToday && (
                             <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-primary/10 text-primary border border-primary/30">
                               Hari Ini
                             </span>
                           )}
                         </div>
                       </div>
                       
                       <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                         {event.name}
                       </h4>
                       
                       <div className="space-y-2 mt-3">
                         {/* Tanggal Lengkap */}
                         <div className="flex items-center gap-2 text-xs font-medium text-primary">
                           <CalendarIcon className="w-3.5 h-3.5" />
                           <span>
                             {eventDate.toLocaleDateString('id-ID', { 
                               weekday: 'long',
                               day: 'numeric', 
                               month: 'long', 
                               year: 'numeric' 
                             })}
                           </span>
                         </div>
                         
                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           <Clock className="w-3.5 h-3.5" />
                           <span>{eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                         
                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           <MapPin className="w-3.5 h-3.5" />
                           <span className="line-clamp-1">{event.location}</span>
                         </div>
                         
                         {/* PIC INFO */}
                         <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border mt-2">
                           <User className="w-3.5 h-3.5" />
                           <span>PIC: <span className="font-semibold text-foreground">{event.pic?.fullName || 'Admin'}</span></span>
                         </div>
                       </div>
                     </div>
                   );
                 })
               )}
             </div>
           </Card>
        </div>
      )}

      {/* 3. MODE TABLE */}
      {viewMode === 'table' && (
        <div>
          <Card>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                   <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                   <input
                    type="text"
                    placeholder="Cari event / kode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-input border border-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select
                  label=""
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'Semua Status' },
                    { value: 'PLANNED', label: 'Planned' },
                    { value: 'ONGOING', label: 'Ongoing' },
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
                  ]}
                />
              </div>
            </div>

            <Table
              columns={tableColumns}
              data={filteredEventsTable}
              keyField="id"
              isLoading={isLoading}
              emptyMessage="Belum ada event"
            />
          </Card>
        </div>
      )}

      {/* MODALS & TOASTS */}
      <EventDetailModal
         isOpen={!!selectedEvent}
         onClose={() => setSelectedEvent(null)}
         event={selectedEvent}
      />

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, event: null })}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus"
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      >
        <p className="text-foreground">
          Apakah Anda yakin ingin menghapus event <strong>{deleteModal.event?.name}</strong>?
        </p>
      </Modal>

      <CreateArchiveModal
        isOpen={archiveModal.isOpen}
        onClose={() => setArchiveModal({ isOpen: false, event: null })}
        onSuccess={() => { fetchEvents(); setArchiveModal({ isOpen: false, event: null }); }}
        sourceType="EVENT"
        sourceId={archiveModal.event?.id || ''}
        sourceName={archiveModal.event?.name || ''}
      />

      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </PageWrapper>
  );
}