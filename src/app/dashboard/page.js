'use client';

import { useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, StatusBadge, TaskTypeBadge, LoadingSpinner } from '@/components/ui';
import { mockJobs, getJobsByTenant, taskTypes } from '@/lib/mock-data';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const userJobs = user.role === 'system_admin' 
    ? mockJobs 
    : getJobsByTenant(user.tenantId);

  const stats = {
    total: userJobs.length,
    active: userJobs.filter(j => ['processing', 'ready', 'file_uploading'].includes(j.status)).length,
    completed: userJobs.filter(j => j.status === 'completed').length,
    avgTime: '45分',
  };

  const recentJobs = userJobs
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ダッシュボード
          </h1>
          <p className="text-gray-600">
            {user.name}さん、おかえりなさい
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">総ジョブ数</span>
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">アクティブなジョブ</span>
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.active}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">完了したジョブ</span>
              <div className="p-2 rounded-lg bg-green-100">
                <CircleCheckBig className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">平均処理時間</span>
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.avgTime}</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            クイックアクション
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/jobs/new?type=INSPECTION">
              <Button variant="success" className="w-full justify-center gap-2">
                <CircleCheckBig className="w-5 h-5" />
                検図ジョブを作成
              </Button>
            </Link>
            <Link href="/jobs/new?type=BOM">
              <Button variant="primary" className="w-full justify-center gap-2">
                <FileText className="w-5 h-5" />
                BOMジョブを作成
              </Button>
            </Link>
            <Link href="/jobs/new?type=SEARCH">
              <Button 
                variant="secondary" 
                className="w-full justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
              >
                <Plus className="w-5 h-5" />
                検索ジョブを作成
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Jobs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              最近のジョブ
            </h2>
            <Link href="/jobs" className="text-sm text-[#004080] hover:underline">
              すべて表示
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#004080] hover:shadow-sm transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {job.name}
                      </h3>
                      <StatusBadge status={job.status} />
                      <TaskTypeBadge taskType={job.taskType} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(job.updatedAt).toLocaleString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      に更新
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
