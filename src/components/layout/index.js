"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
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
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Moon,
  Sun,
} from "lucide-react";

// Supabase-Style Sidebar with icon-only collapsed state
function SidebarContent({ isOpen, onClose }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  // Initialize state from localStorage to avoid cascading renders
  const [sidebarMode, setSidebarMode] = useState(() => {
    if (typeof window === 'undefined') return 'hover';
    const saved = localStorage.getItem('sidebarMode');
    return (saved === 'always-open' || saved === 'hover') ? saved : 'hover';
  });
  
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebarMode') === 'always-open';
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [jobsExpanded, setJobsExpanded] = useState(true);

  // Persist sidebarMode to localStorage
  const updateSidebarMode = (mode) => {
    setSidebarMode(mode);
    localStorage.setItem('sidebarMode', mode);
  };

  const taskType = searchParams.get("type");

  // Update isExpanded based on sidebar mode
  const shouldBeExpanded = sidebarMode === 'always-open' || (sidebarMode === 'hover' && isExpanded);

  const handleMouseEnter = () => {
    if (sidebarMode === 'hover') {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (sidebarMode === 'hover') {
      setIsExpanded(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href, matchType = null) => {
    if (matchType) {
      const isJobsPage = pathname === "/jobs" || pathname.startsWith("/jobs/");
      return (
        isJobsPage &&
        (taskType === matchType || (!taskType && matchType === "all"))
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navItems = [
    {
      icon: Home,
      label: "ダッシュボード",
      href: "/dashboard",
      matchType: null,
    },
    {
      icon: ListChecks,
      label: "ジョブ",
      href: "/jobs",
      matchType: "all",
      isParent: true,
      hasDropdown: true,
      children: [
        {
          icon: FileSearch,
          label: "検図",
          href: "/jobs?type=INSPECTION",
          matchType: "INSPECTION",
        },
        {
          icon: FileText,
          label: "BOM生成",
          href: "/jobs?type=BOM",
          matchType: "BOM",
        },
        {
          icon: SearchIcon,
          label: "BPスキャン",
          href: "/jobs?type=SCAN",
          matchType: "SCAN",
        },
      ],
    },
  ];

  const adminItems =
    user?.role === "tenant_admin" || user?.role === "system_admin"
      ? [
          {
            icon: Users,
            label: "ユーザー管理",
            href: "/admin/users",
            matchType: null,
          },
          ...(user?.role === "system_admin" ? [{
            icon: SlidersHorizontal,
            label: "テナント管理",
            href: "/admin/tenants",
            matchType: null,
          }] : []),
          {
            icon: Settings,
            label: "設定",
            href: "/admin/settings",
            matchType: null,
          },
        ]
      : [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Fixed icon column with expandable content panel */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-background border-r border-border z-50
          transition-[width,transform] duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${shouldBeExpanded || isOpen ? "w-[208px]" : "w-[208px] lg:w-[52px]"}
          flex flex-col overflow-hidden
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo/Brand */}
        <div className="h-[49px] flex items-center border-b border-border shrink-0 px-1.5 lg:px-0">
          <Link href="/welcome" className="flex items-center gap-2 w-full lg:pl-1.5">
            <Image 
              src="/icon.svg" 
              alt="BP Toolkit" 
              width={32}
              height={32}
              className="shrink-0 rounded-lg lg:ml-2"
              priority
            />
            <Image
              src="/logo-dark.svg"
              alt="BP Toolkit"
              width={120}
              height={24}
              className={`whitespace-nowrap transition-[opacity,width] duration-100 ${
                shouldBeExpanded || isOpen ? "opacity-100 w-auto" : "w-0 opacity-0 lg:w-0 lg:opacity-0"
              }`}
              priority
            />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-foreground-light hover:text-foreground ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 lg:px-0">
          <ul className="space-y-1 lg:pl-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.matchType);

              return (
                <li key={item.href}>
                  {item.isParent ? (
                    <>
                      <div className="flex items-center gap-0">
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`
                            flex items-center flex-1 gap-2 rounded-sm text-sm py-2 px-2
                            transition-[background-color,color] duration-200
                            ${
                              active
                                ? "bg-surface-accent text-foreground"
                                : "text-foreground-light hover:bg-surface-accent/50 hover:text-foreground"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          <span
                            className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-[opacity,width] duration-100 ${
                              shouldBeExpanded || isOpen ? "opacity-100 w-auto" : "w-0 opacity-0 lg:w-0 lg:opacity-0"
                            }`}
                          >
                            {item.label}
                          </span>
                        </Link>
                        {item.hasDropdown && (
                          <button
                            onClick={() => setJobsExpanded(!jobsExpanded)}
                            className={`p-2 rounded-sm transition-[background-color,color,opacity] duration-100 ${
                              shouldBeExpanded || isOpen ? "opacity-100" : "opacity-0 lg:opacity-0"
                            } text-foreground-light hover:bg-surface-accent/50 hover:text-foreground`}
                          >
                            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                              jobsExpanded ? "" : "-rotate-90"
                            }`} />
                          </button>
                        )}
                      </div>
                      {jobsExpanded && (shouldBeExpanded || isOpen) && (
                        <ul className="mt-1 space-y-1 ml-7">
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = isActive(child.href, child.matchType);
                            
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className={`
                                    flex items-center gap-2 px-2 py-2 rounded-sm text-sm
                                    transition-colors
                                    ${
                                      childActive
                                        ? "bg-surface-accent text-foreground"
                                        : "text-foreground-light hover:bg-surface-accent/50 hover:text-foreground"
                                    }
                                  `}
                                >
                                  <ChildIcon className="w-4 h-4 shrink-0" />
                                  <span className="overflow-hidden whitespace-nowrap transition-opacity duration-100">
                                    {child.label}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-2 rounded-sm text-sm py-2 px-2
                        transition-[background-color,color] duration-200
                        ${
                          active
                            ? "bg-surface-accent text-foreground"
                            : "text-foreground-light hover:bg-surface-accent/50 hover:text-foreground"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span
                        className={`whitespace-nowrap overflow-hidden transition-[opacity,width] duration-100 ${
                          shouldBeExpanded || isOpen ? "opacity-100 w-auto" : "w-0 opacity-0 lg:w-0 lg:opacity-0"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  )}
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
                          flex items-center gap-2 rounded-sm text-sm py-2 px-2
                          transition-[background-color,color] duration-200
                          ${
                            active
                              ? "bg-surface-accent text-foreground"
                              : "text-foreground-light hover:bg-surface-accent/50 hover:text-foreground"
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span
                          className={`whitespace-nowrap overflow-hidden transition-[opacity,width] duration-100 ${
                            shouldBeExpanded || isOpen ? "opacity-100 w-auto" : "w-0 opacity-0 lg:w-0 lg:opacity-0"
                          }`}
                        >
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

        {/* User section with logout and settings */}
        {user && (
          <div className="border-t border-border p-2">
            {/* User info */}
            <div className="flex items-center gap-2 py-2 rounded-sm px-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-xs shrink-0">
                {user.name?.charAt(0) || "U"}
              </div>
              <div
                className={`flex-1 min-w-0 overflow-hidden transition-[opacity,width] duration-100 ${
                  shouldBeExpanded || isOpen ? "opacity-100 w-auto" : "w-0 opacity-0 lg:w-0 lg:opacity-0"
                }`}
              >
                <div className="text-xs font-medium text-foreground truncate">
                  {user.name}
                </div>
                <div className="text-xs text-foreground-lighter truncate">
                  {user.email}
                </div>
              </div>
            </div>

            {/* Settings menu */}
            <div className="space-y-1 mt-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 rounded-sm text-sm text-foreground-light hover:bg-surface-accent/50 hover:text-foreground transition-[background-color,color] duration-200 w-full py-2 px-2"
                title="設定"
              >
                <SlidersHorizontal className="w-5 h-5 shrink-0" />
                <span
                  className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-[opacity,width] duration-100 ${
                    shouldBeExpanded || isOpen ? "opacity-100 w-auto" : "w-0 opacity-0 lg:w-0 lg:opacity-0"
                  }`}
                >
                  設定
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-[opacity,transform] duration-100 ${
                  shouldBeExpanded || isOpen ? "opacity-100" : "opacity-0 lg:opacity-0"
                } ${showSettings ? "" : "rotate-180"}`} />
              </button>

              {showSettings && (shouldBeExpanded || isOpen) && (
                <div className="ml-7 space-y-1">
                  <button
                    onClick={() => updateSidebarMode('hover')}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs w-full transition-colors ${
                      sidebarMode === 'hover' 
                        ? 'bg-surface-accent text-foreground' 
                        : 'text-foreground-light hover:bg-surface-accent/50 hover:text-foreground'
                    }`}
                  >
                    ホバーで表示
                  </button>
                  <button
                    onClick={() => {
                      updateSidebarMode('always-open');
                      setIsExpanded(true);
                    }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs w-full transition-colors ${
                      sidebarMode === 'always-open' 
                        ? 'bg-surface-accent text-foreground' 
                        : 'text-foreground-light hover:bg-surface-accent/50 hover:text-foreground'
                    }`}
                  >
                    常に開く
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs w-full transition-colors text-foreground-light hover:bg-surface-accent/50 hover:text-foreground"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-3.5 h-3.5 shrink-0" />
                        <span>ライトモード</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5 shrink-0" />
                        <span>ダークモード</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-sm text-sm text-foreground-light hover:bg-destructive/10 hover:text-destructive transition-[background-color,color] duration-200 w-full py-2 px-2"
                title="ログアウト"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-[opacity,width] duration-100 ${
                    shouldBeExpanded || isOpen ? "opacity-100 w-auto" : "w-0 opacity-0 lg:w-0 lg:opacity-0"
                  }`}
                >
                  ログアウト
                </span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

// Sidebar wrapper with Suspense boundary
export function Sidebar({ isOpen, onClose }) {
  return (
    <Suspense fallback={
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-[52px] bg-sidebar-background border-r border-border z-50">
        <div className="flex items-center justify-center h-[64px] border-b border-border">
          <div className="w-8 h-8 bg-primary/20 rounded animate-pulse" />
        </div>
      </aside>
    }>
      <SidebarContent isOpen={isOpen} onClose={onClose} />
    </Suspense>
  );
}

// Supabase-Style Header
export function Header({ onMenuClick }) {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    const roleMap = {
      general: { label: "一般ユーザー", variant: "secondary" },
      tenant_admin: { label: "テナント管理者", variant: "default" },
      system_admin: { label: "システム管理者", variant: "destructive" },
    };
    return roleMap[role] || roleMap["general"];
  };

  const roleInfo = user ? getRoleLabel(user.role) : null;

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
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* User menu */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-foreground-light">{user.name}</span>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors bg-primary/10 text-primary border-primary/20">
                {roleInfo.label}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// Main Layout Wrapper
export function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Initialize sidebarMode from localStorage
  const [sidebarMode, setSidebarMode] = useState(() => {
    if (typeof window === 'undefined') return 'hover';
    return localStorage.getItem('sidebarMode') || 'hover';
  });

  // Listen for changes in localStorage from sidebar updates
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'sidebarMode' && e.newValue) {
        setSidebarMode(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorage);
    
    // Poll for same-tab updates (since storage events don't fire in same tab)
    const interval = setInterval(() => {
      const current = localStorage.getItem('sidebarMode');
      if (current && current !== sidebarMode) {
        setSidebarMode(current);
      }
    }, 500); // Reduced from 100ms to 500ms for better performance
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [sidebarMode]);

  const contentMargin = sidebarMode === 'always-open' ? 'lg:ml-[208px]' : 'lg:ml-[52px]';

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 flex flex-col ${contentMargin} w-full transition-[margin] duration-200`}>
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
