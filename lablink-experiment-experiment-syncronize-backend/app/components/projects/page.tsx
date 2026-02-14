'use client';

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  return (
    <div className="space-y-6">
      {/* Page Header - High Contrast */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground drop-shadow-sm">Projects</h1>
          <p className="text-muted-foreground mt-1">Kelola proyek riset laboratorium</p>
        </div>
        
        <button className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200">
          + Buat Proyek
        </button>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-card rounded-xl shadow-card p-6 border border-default">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <Input
              type="search"
              placeholder="Cari proyek / kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>

          {/* Division Filter */}
          <Select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            options={[
              { value: '', label: 'Semua Divisi' },
              { value: 'Big Data', label: 'Big Data' },
              { value: 'Cyber Security', label: 'Cyber Security' },
              { value: 'Game Tech', label: 'Game Tech' },
              { value: 'GIS', label: 'GIS' },
            ]}
          />

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'PLANNING', label: 'Planning' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'ON_HOLD', label: 'On Hold' },
            ]}
          />
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex items-center gap-3">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Urutkan:</span>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-48"
            options={[
              { value: 'newest', label: 'Terbaru' },
              { value: 'oldest', label: 'Terlama' },
              { value: 'name_asc', label: 'Nama (A-Z)' },
              { value: 'name_desc', label: 'Nama (Z-A)' },
            ]}
          />
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-card rounded-xl shadow-card p-12 border border-default">
        <div className="text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Belum ada proyek
          </h3>
          <p className="text-muted-foreground">
            Mulai dengan membuat proyek riset pertama Anda
          </p>
        </div>
      </div>
    </div>
  );
}