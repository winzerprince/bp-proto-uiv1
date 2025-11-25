'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Building2, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Modal, LoadingSpinner } from '@/components/ui';

// Mock tenant data
const mockTenants = [
  {
    id: 'tenant-1',
    name: '大成建設株式会社',
    slug: 'taisei',
    contactEmail: 'admin@taisei-construction.co.jp',
    contactPhone: '03-1234-5678',
    status: 'active',
    userCount: 45,
    jobCount: 234,
    createdAt: '2024-01-15T09:00:00Z',
    plan: 'enterprise',
    maxUsers: 100,
  },
  {
    id: 'tenant-2',
    name: '鹿島建設株式会社',
    slug: 'kajima',
    contactEmail: 'admin@kajima.co.jp',
    contactPhone: '03-2345-6789',
    status: 'active',
    userCount: 32,
    jobCount: 178,
    createdAt: '2024-02-01T10:30:00Z',
    plan: 'professional',
    maxUsers: 50,
  },
  {
    id: 'tenant-3',
    name: '清水建設株式会社',
    slug: 'shimizu',
    contactEmail: 'admin@shimizu.co.jp',
    contactPhone: '03-3456-7890',
    status: 'active',
    userCount: 28,
    jobCount: 156,
    createdAt: '2024-02-20T14:15:00Z',
    plan: 'professional',
    maxUsers: 50,
  },
  {
    id: 'tenant-4',
    name: 'テストカンパニー株式会社',
    slug: 'test-company',
    contactEmail: 'test@example.com',
    contactPhone: '03-9999-9999',
    status: 'suspended',
    userCount: 5,
    jobCount: 12,
    createdAt: '2024-11-01T16:00:00Z',
    plan: 'basic',
    maxUsers: 10,
  },
];

export default function TenantsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [tenants, setTenants] = useState(mockTenants);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user?.role !== 'system_admin') {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated || user?.role !== 'system_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tenant.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tenant.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTenant = () => {
    // Mock creation logic
    alert('テナント作成機能（モック）');
    setShowCreateModal(false);
  };

  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowEditModal(true);
  };

  const handleUpdateTenant = () => {
    // Mock update logic
    alert(`テナント更新: ${selectedTenant?.name}`);
    setShowEditModal(false);
  };

  const handleDeleteTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setTenants(tenants.filter(t => t.id !== selectedTenant?.id));
    setShowDeleteModal(false);
    setSelectedTenant(null);
  };

  const toggleTenantStatus = (tenant) => {
    setTenants(tenants.map(t => 
      t.id === tenant.id 
        ? { ...t, status: t.status === 'active' ? 'suspended' : 'active' }
        : t
    ));
  };

  const getPlanLabel = (plan) => {
    const plans = {
      basic: { label: 'ベーシック', color: 'bg-gray-100 text-gray-700' },
      professional: { label: 'プロフェッショナル', color: 'bg-blue-100 text-blue-700' },
      enterprise: { label: 'エンタープライズ', color: 'bg-purple-100 text-purple-700' },
    };
    return plans[plan] || plans.basic;
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">テナント管理</h1>
          <p className="text-foreground-light">システム内のすべてのテナント（企業）を管理します</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-light">総テナント数</span>
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">{tenants.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-light">アクティブ</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {tenants.filter(t => t.status === 'active').length}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-light">停止中</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {tenants.filter(t => t.status === 'suspended').length}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-light">総ユーザー数</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {tenants.reduce((sum, t) => sum + t.userCount, 0)}
            </p>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <Input
                placeholder="テナント名、スラッグ、メールで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">すべてのステータス</option>
                <option value="active">アクティブ</option>
                <option value="suspended">停止中</option>
              </select>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="gap-2 w-full md:w-auto"
            >
              <Plus className="w-5 h-5" />
              新規テナント追加
            </Button>
          </div>
        </Card>

        {/* Tenants Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-foreground-light">
                    テナント名
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-foreground-light">
                    スラッグ
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-foreground-light">
                    プラン
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-foreground-light">
                    ユーザー数
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-foreground-light">
                    ジョブ数
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-foreground-light">
                    ステータス
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-foreground-light">
                    作成日
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-foreground-light">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => {
                    const planInfo = getPlanLabel(tenant.plan);
                    return (
                      <tr key={tenant.id} className="hover:bg-accent transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{tenant.name}</p>
                              <p className="text-xs text-foreground-light">{tenant.contactEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded text-foreground">
                            {tenant.slug}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${planInfo.color}`}>
                            {planInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground">
                            {tenant.userCount} / {tenant.maxUsers}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground">{tenant.jobCount}</p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleTenantStatus(tenant)}
                            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                              tenant.status === 'active'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {tenant.status === 'active' ? 'アクティブ' : '停止中'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground-light">
                            {new Date(tenant.createdAt).toLocaleDateString('ja-JP')}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTenant(tenant)}
                              className="gap-1"
                            >
                              <Pencil className="w-4 h-4" />
                              編集
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTenant(tenant)}
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              削除
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <Building2 className="w-12 h-12 text-foreground-lighter mx-auto mb-3" />
                      <p className="text-foreground-light">テナントが見つかりません</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Modal */}
        {showCreateModal && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title="新規テナント追加"
          >
            <div className="space-y-4">
              <Input label="テナント名" placeholder="例: 大成建設株式会社" required />
              <Input label="スラッグ" placeholder="例: taisei" required />
              <Input label="連絡先メールアドレス" type="email" placeholder="admin@example.com" required />
              <Input label="連絡先電話番号" placeholder="03-1234-5678" />
              <div>
                <label className="block text-sm font-medium text-foreground-light mb-2">
                  プラン
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="basic">ベーシック (最大10ユーザー)</option>
                  <option value="professional">プロフェッショナル (最大50ユーザー)</option>
                  <option value="enterprise">エンタープライズ (最大100ユーザー)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  キャンセル
                </Button>
                <Button variant="primary" onClick={handleCreateTenant}>
                  作成
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedTenant && (
          <Modal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            title="テナント編集"
          >
            <div className="space-y-4">
              <Input label="テナント名" defaultValue={selectedTenant.name} required />
              <Input label="スラッグ" defaultValue={selectedTenant.slug} required disabled />
              <Input label="連絡先メールアドレス" type="email" defaultValue={selectedTenant.contactEmail} required />
              <Input label="連絡先電話番号" defaultValue={selectedTenant.contactPhone} />
              <div>
                <label className="block text-sm font-medium text-foreground-light mb-2">
                  プラン
                </label>
                <select 
                  defaultValue={selectedTenant.plan}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="basic">ベーシック (最大10ユーザー)</option>
                  <option value="professional">プロフェッショナル (最大50ユーザー)</option>
                  <option value="enterprise">エンタープライズ (最大100ユーザー)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                  キャンセル
                </Button>
                <Button variant="primary" onClick={handleUpdateTenant}>
                  更新
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedTenant && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="テナント削除の確認"
          >
            <div className="space-y-4">
              <p className="text-foreground">
                本当に <strong>{selectedTenant.name}</strong> を削除しますか？
              </p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  警告: この操作は元に戻せません。テナントに関連するすべてのユーザー、ジョブ、データが削除されます。
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                  キャンセル
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  削除する
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
}
