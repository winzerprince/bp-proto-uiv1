'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Mail, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Select, Modal, LoadingSpinner } from '@/components/ui';
import { users as initialUsers, getTenantById } from '@/lib/mock-data';

export default function UserManagementPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, isAdmin, isSystemAdmin } = useAuth();
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'general',
    tenantId: '',
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    // System admin sees all users, tenant admin sees only their tenant
    if (!isSystemAdmin && u.tenantId !== user.tenantId && u.role !== 'system_admin') {
      return false;
    }

    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !u.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (roleFilter !== 'all' && u.role !== roleFilter) {
      return false;
    }

    return true;
  });

  const handleOpenModal = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        tenantId: userToEdit.tenantId || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'general',
        tenantId: user.tenantId || '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'general', tenantId: '' });
  };

  const handleSubmit = () => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
    } else {
      // Add new user
      const newUser = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        ...formData,
        avatar: '/avatars/default.png',
      };
      setUsers([...users, newUser]);
    }
    handleCloseModal();
  };

  const handleDelete = (userId) => {
    if (confirm('このユーザーを削除してもよろしいですか?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      system_admin: { label: 'システム管理者', color: 'bg-purple-100 text-purple-700' },
      tenant_admin: { label: 'テナント管理者', color: 'bg-blue-100 text-blue-700' },
      general: { label: '一般ユーザー', color: 'bg-gray-100 text-gray-700' },
    };
    const badge = badges[role] || badges.general;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ユーザー管理
            </h1>
            <p className="text-gray-600">
              {filteredUsers.length}人のユーザー
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            ユーザーを追加
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="ユーザー名またはメールアドレスで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">すべてのロール</option>
              <option value="general">一般ユーザー</option>
              <option value="tenant_admin">テナント管理者</option>
              {isSystemAdmin && <option value="system_admin">システム管理者</option>}
            </Select>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    テナント
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ロール
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => {
                  const tenant = u.tenantId ? getTenantById(u.tenantId) : null;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-linear-to-br from-[#004080] to-[#0066CC] rounded-full flex items-center justify-center text-white font-medium">
                            {u.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {u.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {u.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tenant ? tenant.name : 'システム'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(u)}
                            className="gap-1"
                          >
                            <Pencil className="w-4 h-4" />
                            編集
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(u.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingUser ? 'ユーザーを編集' : 'ユーザーを追加'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleCloseModal}>
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingUser ? '更新' : '追加'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="名前"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="山田太郎"
            required
          />
          <Input
            label="メールアドレス"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="yamada@example.com"
            required
          />
          <Select
            label="ロール"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="general">一般ユーザー</option>
            <option value="tenant_admin">テナント管理者</option>
            {isSystemAdmin && <option value="system_admin">システム管理者</option>}
          </Select>
          {isSystemAdmin && formData.role !== 'system_admin' && (
            <Select
              label="テナント"
              value={formData.tenantId}
              onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
              required
            >
              <option value="">テナントを選択</option>
              {/* This would be populated from tenants data */}
              <option value="tenant-1">大手建設株式会社</option>
              <option value="tenant-2">中堅建設工業</option>
            </Select>
          )}
        </div>
      </Modal>
    </MainLayout>
  );
}
