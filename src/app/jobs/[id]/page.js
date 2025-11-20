'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Trash2,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, StatusBadge, TaskTypeBadge, LoadingSpinner } from '@/components/ui';
import { getJobById, getUserById, simulateJobProcessing } from '@/lib/mock-data';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [liveProgress, setLiveProgress] = useState(0);

  const jobId = params?.id;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (jobId) {
      const jobData = getJobById(jobId);
      if (jobData) {
        setJob(jobData);
        setLiveProgress(jobData.progress);

        // Simulate real-time progress updates for processing jobs
        if (jobData.status === 'processing') {
          const interval = setInterval(() => {
            setLiveProgress(prev => {
              const newProgress = prev + Math.random() * 5;
              if (newProgress >= 100) {
                clearInterval(interval);
                return 100;
              }
              return newProgress;
            });
          }, 2000);
          return () => clearInterval(interval);
        }
      }
    }
  }, [jobId]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ジョブが見つかりません
          </h2>
          <p className="text-gray-600 mb-6">
            指定されたジョブは存在しないか、削除された可能性があります。
          </p>
          <Link href="/jobs">
            <Button variant="primary">ジョブ一覧に戻る</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const creator = getUserById(job.userId);
  const canViewResults = ['completed', 'failed'].includes(job.status);

  const statusTimeline = [
    { 
      status: 'created', 
      label: '作成済み', 
      time: job.createdAt,
      icon: CheckCircle,
      completed: true,
    },
    { 
      status: 'file_uploading', 
      label: 'ファイルアップロード',
      time: job.files.length > 0 ? job.files[0].uploadedAt : null,
      icon: Upload,
      completed: job.files.length > 0,
    },
    { 
      status: 'ready', 
      label: '準備完了',
      time: job.status !== 'created' ? job.updatedAt : null,
      icon: CheckCircle,
      completed: !['created'].includes(job.status),
    },
    { 
      status: 'processing', 
      label: 'AI処理中',
      time: job.status === 'processing' ? job.updatedAt : job.completedAt,
      icon: Clock,
      completed: ['completed', 'failed'].includes(job.status),
      active: job.status === 'processing',
    },
    { 
      status: 'completed', 
      label: job.status === 'failed' ? '失敗' : '完了',
      time: job.completedAt,
      icon: job.status === 'failed' ? AlertCircle : CheckCircle,
      completed: job.status === 'completed',
      failed: job.status === 'failed',
    },
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            ジョブ一覧に戻る
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {job.name}
                </h1>
                <StatusBadge status={job.status} />
                <TaskTypeBadge taskType={job.taskType} />
              </div>
              <p className="text-gray-600">{job.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {canViewResults && job.status === 'completed' && (
                <Link href={`/jobs/${job.id}/results`}>
                  <Button variant="primary" className="gap-2">
                    <Eye className="w-5 h-5" />
                    結果を表示
                  </Button>
                </Link>
              )}
              <Button variant="ghost" className="gap-2">
                <RefreshCw className="w-5 h-5" />
              </Button>
              <Button variant="ghost" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Job Info and Status */}
          <div className="space-y-6">
            {/* Job Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                ジョブ情報
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">ジョブID</dt>
                  <dd className="text-sm font-medium text-gray-900">{job.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">作成者</dt>
                  <dd className="text-sm font-medium text-gray-900">{creator?.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">作成日時</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(job.createdAt).toLocaleString('ja-JP')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">更新日時</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(job.updatedAt).toLocaleString('ja-JP')}
                  </dd>
                </div>
                {job.completedAt && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">完了日時</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Date(job.completedAt).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Progress */}
            {job.status === 'processing' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  処理進捗
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">進捗率</span>
                    <span className="text-lg font-bold text-[#004080]">
                      {Math.floor(liveProgress)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#004080] transition-all duration-500"
                      style={{ width: `${liveProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    AI解析処理中...
                  </p>
                </div>
              </Card>
            )}

            {/* Error Message */}
            {job.status === 'failed' && job.error && (
              <Card className="p-6 bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-900 mb-1">
                      エラーが発生しました
                    </h3>
                    <p className="text-sm text-red-700">{job.error}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Results Summary */}
            {job.status === 'completed' && job.results && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  結果サマリー
                </h2>
                {job.taskType === 'INSPECTION' && (
                  <dl className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <dt className="text-xs text-gray-600 mb-1">総検出数</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {job.results.totalFindings}
                      </dd>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <dt className="text-xs text-green-600 mb-1">OK</dt>
                      <dd className="text-2xl font-bold text-green-700">
                        {job.results.okCount}
                      </dd>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <dt className="text-xs text-red-600 mb-1">NG</dt>
                      <dd className="text-2xl font-bold text-red-700">
                        {job.results.ngCount}
                      </dd>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <dt className="text-xs text-amber-600 mb-1">警告</dt>
                      <dd className="text-2xl font-bold text-amber-700">
                        {job.results.warningCount}
                      </dd>
                    </div>
                  </dl>
                )}
                {job.taskType === 'SEARCH' && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <dt className="text-xs text-purple-600 mb-1">マッチ数</dt>
                    <dd className="text-2xl font-bold text-purple-700">
                      {job.results.matchCount}件
                    </dd>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right Column: Timeline and Files */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                ステータス履歴
              </h2>
              <div className="relative">
                {statusTimeline.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.status} className="relative flex gap-4 pb-8 last:pb-0">
                      {index < statusTimeline.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        item.completed 
                          ? 'bg-green-100 border-green-500' 
                          : item.active 
                          ? 'bg-amber-100 border-amber-500 animate-pulse' 
                          : item.failed
                          ? 'bg-red-100 border-red-500'
                          : 'bg-gray-100 border-gray-300'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          item.completed 
                            ? 'text-green-600' 
                            : item.active 
                            ? 'text-amber-600' 
                            : item.failed
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`text-sm font-medium ${
                          item.completed || item.active ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {item.label}
                        </p>
                        {item.time && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.time).toLocaleString('ja-JP', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Files */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                アップロードファイル ({job.files.length}件)
              </h2>
              {job.files.length > 0 ? (
                <div className="space-y-2">
                  {job.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 shrink-0">
                        <Download className="w-4 h-4" />
                        ダウンロード
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  ファイルがアップロードされていません
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
