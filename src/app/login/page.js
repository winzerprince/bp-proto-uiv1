'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MdLock,
  MdMail,
  MdAdminPanelSettings,
  MdPerson,
  MdArrowForward,
} from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleMode, setRoleMode] = useState('user');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      login({
        email,
        name: email.split('@')[0] || 'ゲストユーザー',
        role: roleMode === 'admin' ? 'system_admin' : 'general',
      });
      router.push('/dashboard');
    } catch (err) {
      setError('ログインに失敗しました。時間をおいて再度お試しください。');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-lg p-8 shadow-2xl border-0">
          <div className="mb-8">
            <p className="text-sm font-semibold text-[#004080] tracking-wide">ようこそ</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
              図面解析AIにログイン
            </h1>
            <p className="text-gray-600 mt-3 text-sm">
              任意のメールアドレスとパスワードでログインできます。開発用にロールを切り替えて挙動を確認してください。
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block" htmlFor="email">
                メールアドレス
              </label>
              <div className="relative">
                <MdMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                  placeholder="example@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block" htmlFor="password">
                パスワード
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">開発者向けロール切替</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRoleMode('user')}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    roleMode === 'user'
                      ? 'border-[#004080] bg-blue-50 text-[#004080]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <MdPerson className="w-5 h-5" />
                  一般ユーザー
                </button>
                <button
                  type="button"
                  onClick={() => setRoleMode('admin')}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    roleMode === 'admin'
                      ? 'border-[#004080] bg-blue-50 text-[#004080]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <MdAdminPanelSettings className="w-5 h-5" />
                  管理者
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                管理者モードではシステム管理者ロールでログインします。
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </Button>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <Link href="#" className="hover:text-[#004080] font-medium">
                パスワードをお忘れですか？
              </Link>
              <Link href="/signup" className="hover:text-[#004080] font-medium">
                新規登録
              </Link>
            </div>
          </form>

          <div className="mt-10 rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#004080] text-white flex items-center justify-center">
              <MdArrowForward className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">シングルサインオン対応予定</p>
              <p className="text-sm text-gray-600 mt-1">
                現在はモック認証です。将来的にはAzure ADやGoogle Workspace等のSSOと連携予定です。
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#004080] via-[#0059B2] to-[#003366] text白 p-12 items-center">
        <div className="max-w-md ml-auto space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-100 mb-3">
              Blueprint Automation
            </p>
            <h2 className="text-4xl font-bold leading-tight">
              図面検査とBOM作成を
              <br />
              もっと速く、もっと確実に。
            </h2>
          </div>
          <div className="space-y-6">
            {[
              { title: '720時間 → 360時間', description: 'サイトあたりの検図作業時間を半減', accent: '50%時間削減' },
              { title: 'エンタープライズ対応', description: 'マルチテナント・ロールベースアクセス制御', accent: 'RBAC/SSO' },
              { title: 'AI自動判定', description: '整合性チェックをリアルタイムで可視化', accent: 'AIパイプライン' },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 rounded-xl border border-white/20 p-4">
                <p className="text-xs font-semibold text-blue-100">{item.accent}</p>
                <p className="text-2xl font-bold">{item.title}</p>
                <p className="text-sm text-blue-100 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
