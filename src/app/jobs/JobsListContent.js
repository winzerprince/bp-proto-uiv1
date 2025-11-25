'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MdAdd, MdSearch, MdFilterAlt, MdVisibility } from 'react-icons/md';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Select, StatusBadge, TaskTypeBadge, LoadingSpinner } from '@/components/ui';
import { mockJobs, getJobsByTenant, jobStatusOptions, taskTypeOptions } from '@/lib/mock-data';

export default function JobsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated } = useAuthGuard();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  
  // Get initial filter from URL - only compute once
  const initialTypeFilter = useMemo(() => {
    const typeParam = searchParams.get('type');
    return (typeParam && ['INSPECTION', 'BOM', 'SEARCH'].includes(typeParam)) ? typeParam : 'all';
  }, [searchParams]);
  
  const [taskTypeFilter, setTaskTypeFilter] = useState(initialTypeFilter);

  // Update filter when URL param changes
  useEffect(() => {
    setTaskTypeFilter(initialTypeFilter);
  }, [initialTypeFilter]);

  // Memoize user jobs to avoid recalculating on every render
  const userJobs = useMemo(() => 
    user?.role === 'system_admin' ? mockJobs : getJobsByTenant(user?.tenantId),
    [user?.role, user?.tenantId]
  );

  // Memoize filtered and sorted jobs to avoid expensive operations on every render
  const filteredJobs = useMemo(() => {
    if (!userJobs) return [];
    return userJobs
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
  }, [userJobs, searchQuery, statusFilter, taskTypeFilter, sortBy]);

  // Memoize row click handler to avoid recreating function on every render
  const handleRowClick = useCallback((jobId) => {
    router.push(`/jobs/${jobId}/results`);
  }, [router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              ジョブ一覧
            </h1>
            <p className="text-foreground-light">
              {filteredJobs.length}件のジョブ
            </p>
          </div>
          <Link href={taskTypeFilter !== 'all' ? `/jobs/new?type=${taskTypeFilter}` : '/jobs/new'}>
            <Button variant="primary" className="gap-2">
              <MdAdd className="w-5 h-5" />
              新しいジョブを作成
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="ジョブ名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<MdSearch className="w-5 h-5" />}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">すべてのステータス</option>
              {jobStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
            <Select
              value={taskTypeFilter}
              onChange={(e) => setTaskTypeFilter(e.target.value)}
            >
              <option value="all">すべてのタスク</option>
              {taskTypeOptions.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
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
        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-foreground-lighter mb-4">
              <MdFilterAlt className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-foreground mb-2 font-medium">
              ジョブが見つかりません
            </p>
            <p className="text-sm text-foreground-light">
              フィルターを変更するか、新しいジョブを作成してください
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <Card className="p-0">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-light uppercase tracking-wider">
                      ジョブ名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-light uppercase tracking-wider">
                      タスクタイプ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-light uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-light uppercase tracking-wider">
                      進捗
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-light uppercase tracking-wider">
                      更新日時
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-foreground-light uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-accent transition-all duration-200 hover:shadow-sm"
                      onClick={() => handleRowClick(job.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <Link href={`/jobs/${job.id}`} className="font-medium text-foreground hover:text-primary">
                            {job.name}
                          </Link>
                          <p className="text-sm text-foreground-light">ID: {job.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <TaskTypeBadge type={job.taskType} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4">
                        {job.status === 'processing' ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all duration-300"
                                  style={{ width: `${job.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-foreground-light font-medium">
                                {job.progress || 0}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-foreground-light">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground-light">
                        {new Date(job.updatedAt).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/jobs/${job.id}/results`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="secondary" size="sm" className="gap-1">
                              <MdVisibility className="w-4 h-4" />
                              詳細
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
