export interface Presence {
  id: string;
  memberName: string;
  type: 'MEETING' | 'ON_CALL' | 'OTHER';
  date: string; // ISO Date string YYYY-MM-DD
  title: string;
  imageUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePresenceRequest {
  type: string;
  date: string;
  title: string;
  notes: string;
  file: File;
}

export interface PresenceFilter {
  type?: string;
  startDate?: string;
  endDate?: string;
}
