'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home,
  ListChecks,
  FileSearch,
  FileText,
  Search as SearchIcon,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

// Supabase-Style Sidebar with icon-only collapsed state
export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const taskType = searchParams.get('type');
  
  const isActive = (href, matchType = null) => {
    if (matchType) {
      const isJobsPage = pathname === '/jobs' || pathname.startsWith('/jobs/');
      return isJobsPage && (taskType === matchType || (!taskType && matchType === 'all'));
    }
    return pathname === href || pathname.startsWith(href + '/');
  };
  
  const navItems = [
    {
      icon: Home,
      label: 'ダッシュボード',
      href: '/dashboard',
      matchType: null
    },
    {
      icon: ListChecks,
      label: 'ジョブ一覧',
      href: '/jobs',
      matchType: 'all'
    },
    {
      icon: FileSearch,
      label: '検図',
      href: '/jobs?type=INSPECTION',
      matchType: 'INSPECTION'
    },
    {
      icon: FileText,
      label: 'BOM生成',
      href: '/jobs?type=BOM',
      matchType: 'BOM'
    },
    {
      icon: SearchIcon,
      label: '図面検索',
      href: '/jobs?type=SEARCH',
      matchType: 'SEARCH'
    },
  ];
  
  const adminItems = (user?.role === 'tenant_admin' || user?.role === 'system_admin') ? [
    {
      icon: Users,
      label: 'ユーザー管理',
      href: '/admin/users',
      matchType: null
    },
    {
      icon: Settings,
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Icon-only on desktop, full on mobile or when expanded */}
      <aside 
        className={`
          fixed left-0 top-0 h-full bg-background border-r border-border z-50
          transition-all duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isExpanded ? 'w-[208px]' : 'w-[208px] lg:w-[52px]'}
          flex flex-col
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo/Brand */}
        <div className="h-[49px] flex items-center justify-between px-4 border-b border-border shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              BP
            </div>
            <span className={`font-semibold text-sm text-foreground transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-0'} ${isOpen ? 'opacity-100' : ''}`}>
              Blueprint AI
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-foreground-light hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.matchType);
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md text-sm
                      transition-colors
                      ${active 
                        ? 'bg-surface-accent text-foreground' 
                        : 'text-foreground-light hover:bg-surface-accent/50 hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className={`transition-opacity whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-0'} ${isOpen ? 'opacity-100' : ''}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Admin section */}
          {adminItems.length > 0 && (
            <>
              <div className="my-4 border-t border-border" />
              <ul className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-md text-sm
                          transition-colors
                          ${active 
                            ? 'bg-surface-accent text-foreground' 
                            : 'text-foreground-light hover:bg-surface-accent/50 hover:text-foreground'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className={`transition-opacity whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-0'} ${isOpen ? 'opacity-100' : ''}`}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </nav>
        
        {/* User section */}
        {user && (
          <div className="border-t border-border p-2">
            <div className={`flex items-center gap-3 px-3 py-2 text-sm text-foreground-light`}>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-xs shrink-0">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className={`flex-1 min-w-0 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-0'} ${isOpen ? 'opacity-100' : ''}`}>
                <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
                <div className="text-xs text-foreground-lighter truncate">{user.email}</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

// Supabase-Style Header
export function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  return (
    <header className="h-[49px] bg-background border-b border-border flex items-center justify-between px-4 shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-foreground-light hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search button (placeholder) */}
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-surface-accent text-foreground-lighter text-sm transition-colors">
          <SearchIcon className="w-4 h-4" />
          <span>検索...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-foreground-lighter">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>
      
      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* User menu */}
        {user && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-foreground-light">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-foreground-light hover:bg-surface-accent hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// Main Layout Wrapper
export function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-[52px] w-full">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto p-4 lg:p-6 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
