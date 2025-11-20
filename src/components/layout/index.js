'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  MdDashboard,
  MdDescription,
  MdCheckCircle,
  MdSearch,
  MdSettings,
  MdPeople,
  MdMenu,
  MdClose,
  MdLogout,
  MdExpandMore,
  MdNotifications,
  MdInventory,
  MdDarkMode,
  MdLightMode,
} from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getTenantById } from '@/lib/mock-data';

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const tenant = user?.tenantId ? getTenantById(user.tenantId) : null;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-[0_2px_20px_rgba(0,0,0,0.08)] z-40">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-linear-to-br from-[#004080] via-[#0055AA] to-[#004080] rounded flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,64,128,0.5)] group-hover:scale-105">
              <MdDescription className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">図面解析AI</h1>
              {tenant && (
                <p className="text-xs text-gray-500">{tenant.name}</p>
              )}
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-300 hover:shadow-[0_0_10px_rgba(0,0,0,0.1)]"
            title={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          >
            {theme === 'dark' ? (
              <MdLightMode className="w-6 h-6" />
            ) : (
              <MdDarkMode className="w-6 h-6" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-300 relative hover:shadow-[0_0_10px_rgba(0,0,0,0.1)]">
            <MdNotifications className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100/80 rounded-lg transition-all duration-300 hover:shadow-[0_0_10px_rgba(0,0,0,0.05)]"
            >
              <div className="w-8 h-8 bg-linear-to-br from-[#004080] via-[#0055AA] to-[#004080] rounded-full flex items-center justify-center text-white text-sm font-medium shadow-[0_2px_8px_rgba(0,64,128,0.3)] transition-all duration-300 hover:shadow-[0_2px_12px_rgba(0,64,128,0.5)]">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'system_admin' && 'システム管理者'}
                  {user?.role === 'tenant_admin' && 'テナント管理者'}
                  {user?.role === 'general' && '一般ユーザー'}
                </p>
              </div>
              <MdExpandMore className="w-5 h-5 text-gray-500" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-gray-200/50 py-1 z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <MdSettings className="w-5 h-5" />
                    設定
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      window.location.href = '/login';
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <MdLogout className="w-5 h-5" />
                    ログアウト
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAdmin, isSystemAdmin } = useAuth();
  
  const taskTypeParam = searchParams?.get('type');

  const navItems = [
    { href: '/dashboard', label: 'ダッシュボード', icon: MdDashboard },
    { href: '/jobs', label: 'ジョブ一覧', icon: MdDescription, matchType: 'all' },
    { href: '/inspection', label: '検図', icon: MdCheckCircle, matchType: 'INSPECTION' },
    { href: '/bom', label: 'BOM生成', icon: MdInventory, matchType: 'BOM' },
    { href: '/search', label: '図面検索', icon: MdSearch, matchType: 'SEARCH' },
  ];

  const adminItems = [
    { href: '/admin/users', label: 'ユーザー管理', icon: MdPeople },
    { href: '/admin/settings', label: 'テナント設定', icon: MdSettings },
  ];

  const isActive = (item) => {
    // Exact match for non-job pages
    if (!item.matchType) {
      return pathname === item.href || pathname.startsWith(item.href + '/');
    }
    
    // For job-related pages, check both pathname and query param
    const isJobsPage = pathname === '/jobs' || pathname.startsWith('/jobs/');
    
    if (item.matchType === 'all') {
      // Job List is active when on /jobs without a type filter or with type=all
      return isJobsPage && (!taskTypeParam || taskTypeParam === 'all');
    }
    
    // Task-specific tabs (Inspection, BOM, Search) are active when:
    // 1. On /jobs with matching type parameter, OR
    // 2. On the specific task route (which redirects to /jobs?type=X)
    return (isJobsPage && taskTypeParam === item.matchType) || pathname === item.href;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-[2px_0_20px_rgba(0,0,0,0.08)] z-30 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="h-full flex flex-col overflow-y-auto py-4">
          <div className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                    active
                      ? 'bg-linear-to-r from-[#004080] to-[#0055AA] text-white shadow-[0_4px_12px_rgba(0,64,128,0.3),0_0_15px_rgba(0,64,128,0.2)]'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {isAdmin && (
            <div className="px-3 pt-4 mt-4 border-t border-gray-200 space-y-1">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                管理
              </p>
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                      active
                        ? 'bg-linear-to-r from-[#004080] to-[#0055AA] text-white shadow-[0_4px_12px_rgba(0,64,128,0.3),0_0_15px_rgba(0,64,128,0.2)]'
                        : 'text-gray-700 hover:bg-gray-100/80 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="px-6 pt-4 mt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2025 DATAGRID Inc.
            </p>
          </div>
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => !isOpen && onClose()}
        className="fixed top-20 left-4 z-40 lg:hidden p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isOpen ? <MdClose className="w-6 h-6" /> : <MdMenu className="w-6 h-6" />}
      </button>
    </>
  );
}

export function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <Header />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(!sidebarOpen)} />
      <main className="pt-16 lg:pl-64 min-h-screen transition-all duration-300">
        <div className="p-4 lg:p-8 max-w-full w-full">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
