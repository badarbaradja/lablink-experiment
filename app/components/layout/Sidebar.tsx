'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/app/context/SidebarContext';
import { useAuth } from '@/app/context/AuthContext';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Calendar,
  Mail,
  Archive,
  ClipboardCheck,
  CalendarRange, // Icon baru untuk Periode
  Activity,      // Icon baru untuk Activity Log
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Proyek', href: '/dashboard/projects', icon: FolderOpen },
  { label: 'Anggota', href: '/dashboard/members', icon: Users, adminOnly: true },
  { label: 'Kegiatan', href: '/dashboard/events', icon: Calendar },
  { label: 'Surat', href: '/dashboard/letters', icon: Mail },
  { label: 'Arsip', href: '/dashboard/archives', icon: Archive },
  { label: 'Presensi', href: '/dashboard/presence', icon: ClipboardCheck },
  // UPDATE: Periode dibuka untuk semua (View Only diatur di halaman)
  { label: 'Periode', href: '/dashboard/periods', icon: CalendarRange }, 
  // UPDATE: Activity Log dibuka untuk semua
  { label: 'Activity Log', href: '/dashboard/activity-logs', icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { isAdmin, user } = useAuth();

  // Filter menu: Tampilkan jika TIDAK adminOnly ATAU user adalah Admin
  const filteredMenu = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl transition-all duration-300 z-50 ${
        isCollapsed ? 'w-24' : 'w-72'
      }`}
    >
      {/* Logo Section */}
      <div className={`flex items-center justify-center border-b border-white/10 transition-all duration-300 ${
        isCollapsed ? 'p-4' : 'p-6'
      }`}>
        <Link href="/dashboard" className="flex items-center gap-3 group">
          {/* Logo Container */}
          <div className={`bg-white rounded-xl p-2 shadow-lg transition-all duration-300 ${
            isCollapsed ? 'w-12 h-12' : 'w-20 h-20'
          }`}>
            <img
              src="/Logo-mbc lab.png"
              alt="MBC Lab"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <ul className="space-y-2">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? 'bg-white/20 text-white font-semibold shadow-lg backdrop-blur-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Active Indicator Strip */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}
                  
                  <Icon className={`shrink-0 transition-transform duration-200 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`} />
                  
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate tracking-wide">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile Section (Bottom) */}
      <div className="p-3 border-t border-white/10 bg-black/10">
        <Link
          href="/dashboard/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            pathname === '/dashboard/profile'
              ? 'bg-white/20 text-white font-semibold'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
          title={isCollapsed ? 'Profile' : undefined}
        >
          <div className={`rounded-full bg-white/10 flex items-center justify-center shrink-0 ${isCollapsed ? 'w-10 h-10' : 'w-9 h-9'}`}>
             <User className="w-5 h-5" />
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName || 'Profile'}</p>
              <p className="text-[10px] text-white/50 truncate uppercase tracking-wider font-bold">
                {user?.role || 'VIEWER'}
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-sidebar border border-white/20 rounded-full flex items-center justify-center hover:bg-red-600 hover:border-red-500 hover:scale-110 transition-all duration-200 shadow-xl text-white z-50"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}