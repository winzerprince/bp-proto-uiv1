'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  MdDashboard, 
  MdSearch, 
  MdAssignment, 
  MdViewList, 
  MdPeople,
  MdSettings,
  MdMenu,
  MdClose,
  MdLightMode,
  MdDarkMode
} from 'react-icons/md';

// Supabase-Style Sidebar
export function Sidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const taskType = searchParams.get('type');
  
  const isActive = (href, matchType = null) => {
    if (matchType) {
      return pathname === '/jobs' && taskType === matchType;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };
  
  const navItems = [
    {
      icon: MdDashboard,
      label: 'ダッシュボード',
      href: '/dashboard',
      matchType: null
    },
    {
      icon: MdViewList,
      label: 'ジョブ一覧',
      href: '/jobs',
      matchType: 'all'
    },
    {
      icon: MdAssignment,
      label: '検図',
      href: '/jobs?type=INSPECTION',
      matchType: 'INSPECTION'
    },
    {
      icon: MdAssignment,
      label: 'BOM生成',
      href: '/jobs?type=BOM',
      matchType: 'BOM'
    },
    {
      icon: MdSearch,
      label: '図面検索',
      href: '/jobs?type=SEARCH',
      matchType: 'SEARCH'
    },
  ];
  
  const adminItems = user?.role === 'tenant_admin' || user?.role === 'system_admin' ? [
    {
      icon: MdPeople,
      label: 'ユーザー管理',
      href: '/admin/users',
      matchType: null
    },
    {
      icon: MdSettings,
      label: '設定',
      href: '/admin/settings',
      matchType: null
    },
  ] : [];
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          fixed left-0 top-0 h-full w-[208px] bg-sidebar border-r border-sidebar-border z-50
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-12 md:group-hover:w-[208px]
          flex flex-col
        `}
        data-sidebar="sidebar"
      >
        {/* Logo */}
        <div className="h-12 flex items-center px-3 border-b border-sidebar-border flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-sm font-bold">B</span>
            </div>
            <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap opacity-0 md:group-hover:opacity-100 transition-opacity">
              Blueprint AI
            </span>
          </Link>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.matchType);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-1.5 py-2 rounded-md text-sm
                  transition-all outline-none
                  focus-visible:ring-2 focus-visible:ring-sidebar-ring
                  ${active 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                    : 'text-foreground-lighter hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                `}
                data-active={active}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate opacity-0 md:group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {adminItems.length > 0 && (
            <>
              <div className="h-px bg-sidebar-border my-2" />
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-1.5 py-2 rounded-md text-sm
                      transition-all outline-none
                      focus-visible:ring-2 focus-visible:ring-sidebar-ring
                      ${active 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                        : 'text-foreground-lighter hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    `}
                    data-active={active}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// Supabase-Style Header
export function Header({ toggleSidebar }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  return (
    <header className="h-12 border-b border-border bg-background flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-foreground-lighter hover:text-foreground p-1"
          >
            <MdMenu className="w-5 h-5" />
          </button>
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="h-8 w-8 rounded-full border border-border text-foreground-light hover:text-foreground hover:border-border-strong transition-colors flex items-center justify-center"
            title={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          >
            {theme === 'dark' ? (
              <MdLightMode className="w-4 h-4" />
            ) : (
              <MdDarkMode className="w-4 h-4" />
            )}
          </button>
          
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {user?.name?.[0] || 'U'}
            </button>
            
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-foreground-light mt-0.5">{user?.email}</p>
                    <p className="text-xs text-foreground-lighter mt-1">
                      役割: {user?.role === 'tenant_admin' ? 'テナント管理者' : user?.role === 'system_admin' ? 'システム管理者' : '一般ユーザー'}
                    </p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent rounded-sm"
                    >
                      ログアウト
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Main Layout - Supabase Style
export function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="group min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col md:pl-12">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] px-4 lg:px-6 xl:px-10 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
