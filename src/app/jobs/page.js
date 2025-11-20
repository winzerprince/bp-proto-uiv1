'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Select, StatusBadge, TaskTypeBadge, LoadingSpinner } from '@/components/ui';
import { mockJobs, getJobsByTenant, jobStatuses, taskTypes } from '@/lib/mock-data';

export default function JobsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

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

  // Apply filters
  const filteredJobs = userJobs
    .filter(job => {
      if (searchQuery && !job.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && job.status !== statusFilter) {
        return false;
      }
      if (taskTypeFilter !== 'all' && job.taskType !== taskTypeFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (sortBy === 'created') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ジョブ一覧
            </h1>
            <p className="text-gray-600">
              {filteredJobs.length}件のジョブ
            </p>
          </div>
          <Link href="/jobs/new">
            <Button variant="primary" className="gap-2">
              <Plus className="w-5 h-5" />
              新しいジョブを作成
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Input
                placeholder="ジョブ名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">すべてのステータス</option>
              {Object.entries(jobStatuses).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </Select>
            <Select
              value={taskTypeFilter}
              onChange={(e) => setTaskTypeFilter(e.target.value)}
            >
              <option value="all">すべてのタスク</option>
              {Object.entries(taskTypes).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </Select>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updated">更新日時順</option>
              <option value="created">作成日時順</option>
              <option value="name">名前順</option>
            </Select>
          </div>
        </Card>

        {/* Jobs Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ジョブ名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タスク種別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進捗
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成日時
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      ジョブが見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <Link 
                            href={`/jobs/${job.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-[#004080]"
                          >
                            {job.name}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">{job.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TaskTypeBadge taskType={job.taskType} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge 
                          status={job.status} 
                          showProgress={job.status === 'processing'}
                          progress={job.progress}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#004080] transition-all duration-500"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{job.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/jobs/${job.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Eye className="w-4 h-4" />
                              詳細
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1">
                            <Trash2 className="w-4 h-4" />
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
