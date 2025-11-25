'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  Clock, 
  CircleCheckBig, 
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { MainLayout } from '@/components/layout';
import { Card, Button, StatusBadge, TaskTypeBadge, LoadingSpinner } from '@/components/ui';
import { mockJobs, getJobsByTenant } from '@/lib/mock-data';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthGuard();

  // Memoize user jobs
  const userJobs = useMemo(() => 
    user?.role === 'system_admin' ? mockJobs : getJobsByTenant(user?.tenantId),
    [user?.role, user?.tenantId]
  );

  // Memoize stats calculations
  const stats = useMemo(() => ({
    total: userJobs.length,
    active: userJobs.filter(j => ['processing', 'ready', 'file_uploading'].includes(j.status)).length,
    completed: userJobs.filter(j => j.status === 'completed').length,
    avgTime: '45分',
  }), [userJobs]);

  // Memoize recent jobs sorting
  const recentJobs = useMemo(() => 
    userJobs
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5),
    [userJobs]
  );

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ダッシュボード
          </h1>
          <p className="text-foreground-light">
            {user.name}さん、おかえりなさい
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-light">総ジョブ数</span>
              <div className="p-2 rounded-sm bg-blue-100 dark:bg-blue-900/30">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-light">アクティブなジョブ</span>
              <div className="p-2 rounded-sm bg-amber-100 dark:bg-amber-900/30">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.active}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-light">完了したジョブ</span>
              <div className="p-2 rounded-sm bg-green-100 dark:bg-green-900/30">
                <CircleCheckBig className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.completed}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-light">平均処理時間</span>
              <div className="p-2 rounded-sm bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.avgTime}</div>
          </Card>
        </div>

        {/* Main Content Area - Split Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Quick Actions - 1/3 width */}
          <div className="lg:col-span-1">
            <Card className="p-6 h-full flex flex-col">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                クイックアクション
              </h2>
              <div className="flex flex-col gap-3 flex-1">
                <Link href="/jobs/new" className="block">
                  <Button variant="default" className="w-full justify-center gap-2 h-auto py-4">
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">ジョブを作成</span>
                  </Button>
                </Link>
                <Link href="/jobs" className="block">
                  <Button variant="outline" className="w-full justify-center gap-2 h-auto py-3">
                    <FileText className="w-5 h-5" />
                    <span>ジョブ一覧を表示</span>
                  </Button>
                </Link>
                <Link href="/jobs?type=INSPECTION" className="block">
                  <Button variant="outline" className="w-full justify-center gap-2 h-auto py-3">
                    <CircleCheckBig className="w-5 h-5" />
                    <span>検図ジョブ一覧</span>
                  </Button>
                </Link>
                <Link href="/jobs?type=BOM" className="block">
                  <Button variant="outline" className="w-full justify-center gap-2 h-auto py-3">
                    <FileText className="w-5 h-5" />
                    <span>BOMジョブ一覧</span>
                  </Button>
                </Link>
                <Link href="/jobs?type=SEARCH" className="block">
                  <Button variant="outline" className="w-full justify-center gap-2 h-auto py-3">
                    <Plus className="w-5 h-5" />
                    <span>検索ジョブ一覧</span>
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Recent Jobs - 2/3 width */}
          <div className="lg:col-span-2">
            <Card className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  最近のジョブ
                </h2>
                <Link href="/jobs" className="text-sm text-primary hover:underline">
                  すべて表示
                </Link>
              </div>
              <div className="space-y-3 flex-1 overflow-auto">
                {recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border border-border rounded-sm hover:border-primary hover:shadow-sm transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {job.name}
                          </h3>
                          <StatusBadge status={job.status} />
                          <TaskTypeBadge taskType={job.taskType} />
                        </div>
                        <p className="text-xs text-foreground-lighter">
                          {new Date(job.updatedAt).toLocaleString('ja-JP', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          に更新
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-foreground-lighter ml-4 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
