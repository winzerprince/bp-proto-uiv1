'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { users, tenants } from '@/lib/mock-data';
import { Button, Input, Select, Card } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const availableUsers = selectedTenant
    ? users.filter(u => u.tenantId === selectedTenant || u.role === 'system_admin')
    : users;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('ユーザーを選択してください');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const success = login(selectedUser);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('ログインに失敗しました');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004080] to-[#0066CC] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#004080] rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            図面解析自動化システム
          </h1>
          <p className="text-sm text-gray-600">
            ログインしてご利用ください
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Select
            label="テナント"
            value={selectedTenant}
            onChange={(e) => {
              setSelectedTenant(e.target.value);
              setSelectedUser('');
              setError('');
            }}
          >
            <option value="">テナントを選択</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
            <option value="system">システム管理者</option>
          </Select>

          <Select
            label="ユーザー"
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setError('');
            }}
            disabled={!selectedTenant}
          >
            <option value="">ユーザーを選択</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
                {user.role === 'tenant_admin' && ' - 管理者'}
                {user.role === 'system_admin' && ' - システム管理者'}
              </option>
            ))}
          </Select>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            デモ用のログイン画面です。本番環境では適切な認証システムを使用します。
          </p>
        </div>
      </Card>
    </div>
  );
}
