'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';
import Modal from '@/app/components/ui/Modal';
import { Event, EventSchedule } from '@/app/types';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export default function EventDetailModal({
  isOpen,
  onClose,
  event,
}: EventDetailModalProps) {
  if (!event) return null;

  const [schedules, setSchedules] = useState<EventSchedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      fetchSchedules();
    } else {
      setSchedules([]);
    }
  }, [isOpen, event]);

  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      // Fetch specifically for this event
      const response = await api.get<EventSchedule[]>(`/events/${event!.id}/schedules`);
      setSchedules(response || []);
    } catch (err) {
      console.error('Failed to fetch schedules', err);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    PLANNED: 'bg-gray-100 text-gray-700',
    ONGOING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const statusLabel = event.status.replace('_', ' ');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Event: ${event.eventCode}`}
      cancelText="Tutup"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                STATUS_COLORS[event.status] || 'bg-gray-100'
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Tanggal Mulai
            </label>
            <p className="text-sm text-gray-900 mt-1">
              {new Date(event.startDate).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Tanggal Selesai
            </label>
            <p className="text-sm text-gray-900 mt-1">
              {new Date(event.endDate).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* SCHEDULES SECTION */}
        <div>
             <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2 block">
               Jadwal / Agenda
             </label>
             {loadingSchedules ? (
               <div className="text-sm text-gray-400">Memuat jadwal...</div>
             ) : schedules.length > 0 ? (
               <div className="space-y-2 border border-gray-100 rounded-lg p-2 bg-gray-50/50">
                 {schedules.map((sch: EventSchedule, idx: number) => (
                   <div key={idx} className="bg-white p-2 rounded border border-gray-100 text-sm flex gap-3">
                      <div className="flex flex-col items-center justify-center w-12 bg-blue-50 rounded text-blue-700 p-1">
                         <span className="text-[10px] font-bold uppercase">{new Date(sch.activityDate).toLocaleDateString('id-ID', { month: 'short' })}</span>
                         <span className="text-lg font-bold leading-none">{new Date(sch.activityDate).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{sch.title}</div>
                        <div className="text-xs text-gray-500">
                          {sch.startTime.substring(0, 5)} - {sch.endTime.substring(0, 5)} WIB | {sch.location}
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-sm text-gray-400 italic">Tidak ada jadwal spesifik.</div>
             )}
        </div>


        {event.description && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Deskripsi
            </label>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* Committee Section */}
        <div className="border-t border-gray-100 pt-4">
          <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3 block">
            Susunan Panitia
          </label>
          
          <div className="space-y-4">
            {/* PIC */}
            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                {event.pic?.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {event.pic?.fullName} <span className="text-blue-600 text-xs font-normal">(Ketua Pelaksana)</span>
                </p>
                <p className="text-xs text-gray-500">{event.pic?.expertDivision}</p>
              </div>
            </div>

            {/* Committee Members */}
            {event.committee && event.committee.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.committee.map((member) => (
                  <div key={member.memberId} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                      {member.fullName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">{member.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{member.role || 'Anggota'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <p className="text-sm text-gray-400 italic">Belum ada anggota panitia tambahan.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
