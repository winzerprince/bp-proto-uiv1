'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MdLock,
  MdMail,
  MdAdminPanelSettings,
  MdPerson,
  MdBusiness,
  MdArrowBack,
} from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: 'general',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.company) {
      setError('すべての必須項目を入力してください');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      login({
        email: formData.email,
        name: formData.name,
        role: formData.role,
        company: formData.company,
      });
      router.push('/dashboard');
    } catch (err) {
      setError('登録に失敗しました。時間をおいて再度お試しください。');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="mb-8">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-foreground-light hover:text-foreground mb-4"
          >
            <MdArrowBack className="w-4 h-4" />
            ログインに戻る
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            新規アカウント登録
          </h1>
          <p className="text-foreground-light mt-2 text-sm">
            図面解析AIシステムのアカウントを作成します
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="name">
                氏名 <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-light w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full pl-10 pr-3 py-2.5 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="山田 太郎"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="email">
                メールアドレス <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <MdMail className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-light w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full pl-10 pr-3 py-2.5 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="example@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="company">
              会社名 <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <MdBusiness className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-light w-5 h-5" />
              <input
                id="company"
                name="company"
                type="text"
                className="w-full pl-10 pr-3 py-2.5 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="株式会社サンプル"
                value={formData.company}
                onChange={handleChange}
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="password">
                パスワード <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-light w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full pl-10 pr-3 py-2.5 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="8文字以上"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="confirmPassword">
                パスワード確認 <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-light w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="w-full pl-10 pr-3 py-2.5 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="パスワードを再入力"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">
              ユーザーロール <span className="text-destructive">*</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'general' })}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-medium transition-colors ${
                  formData.role === 'general'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground-light hover:border-border-hover'
                }`}
              >
                <MdPerson className="w-5 h-5" />
                一般ユーザー
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'tenant_admin' })}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-medium transition-colors ${
                  formData.role === 'tenant_admin'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground-light hover:border-border-hover'
                }`}
              >
                <MdAdminPanelSettings className="w-5 h-5" />
                テナント管理者
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'system_admin' })}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-medium transition-colors ${
                  formData.role === 'system_admin'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground-light hover:border-border-hover'
                }`}
              >
                <MdAdminPanelSettings className="w-5 h-5" />
                システム管理者
              </button>
            </div>
            <div className="mt-2 p-3 rounded-md bg-surface border border-border">
              <p className="text-xs text-foreground-light">
                {formData.role === 'general' && (
                  <><strong>一般ユーザー:</strong> 図面検査とBOM生成の基本機能を使用できます</>
                )}
                {formData.role === 'tenant_admin' && (
                  <><strong>テナント管理者:</strong> 会社内のユーザー管理とテナント設定が可能です</>
                )}
                {formData.role === 'system_admin' && (
                  <><strong>システム管理者:</strong> 全テナントを管理できるDATAGRID管理者向けロールです</>
                )}
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? '登録中...' : 'アカウントを作成'}
          </Button>

          <p className="text-center text-sm text-foreground-light">
            すでにアカウントをお持ちですか？{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              ログイン
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
