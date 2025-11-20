'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Upload, Bell, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Textarea, LoadingSpinner } from '@/components/ui';
import { getTenantById } from '@/lib/mock-data';

export default function TenantSettingsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    emailNotifications: true,
    slackNotifications: false,
    slackWebhook: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (user?.tenantId) {
      const tenantData = getTenantById(user.tenantId);
      if (tenantData) {
        setTenant(tenantData);
        setFormData({
          name: tenantData.name,
          logo: tenantData.logo,
          emailNotifications: tenantData.settings?.notifications?.email ?? true,
          slackNotifications: tenantData.settings?.notifications?.slack ?? false,
          slackWebhook: '',
        });
      }
    }
  }, [user]);

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            テナント設定
          </h1>
          <p className="text-gray-600">
            テナントの基本情報と通知設定を管理します
          </p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#004080] rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                基本情報
              </h2>
            </div>

            <div className="space-y-4">
              <Input
                label="テナント名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="会社名を入力"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ロゴ
                </label>
                <div className="flex items-center gap-4">
                  {formData.logo && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                      <SettingsIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Button variant="secondary" className="gap-2">
                      <Upload className="w-4 h-4" />
                      ロゴをアップロード
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      推奨サイズ: 200x200px, PNG または JPG
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                通知設定
              </h2>
            </div>

            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-900 cursor-pointer block">
                    メール通知
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    ジョブの完了時やエラー発生時にメールで通知します
                  </p>
                </div>
              </div>

              {/* Slack Notifications */}
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="slackNotifications"
                    checked={formData.slackNotifications}
                    onChange={(e) => setFormData({ ...formData, slackNotifications: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="slackNotifications" className="text-sm font-medium text-gray-900 cursor-pointer block">
                      Slack通知
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Slackチャンネルに通知を送信します
                    </p>
                  </div>
                </div>

                {formData.slackNotifications && (
                  <div className="ml-8 p-4 bg-gray-50 rounded-lg">
                    <Input
                      label="Slack Webhook URL"
                      type="url"
                      value={formData.slackWebhook}
                      onChange={(e) => setFormData({ ...formData, slackWebhook: e.target.value })}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Slackの<a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener noreferrer" className="text-[#004080] hover:underline">Incoming Webhooks</a>から取得できます
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Custom Fields (Future Feature) */}
          <Card className="p-6 bg-gray-50 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                カスタムフィールド
              </h2>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                今後実装予定
              </span>
            </div>
            <p className="text-sm text-gray-600">
              ジョブ作成時にテナント固有のカスタムフィールドを追加できます。
            </p>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4">
            {saved && (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                設定を保存しました
              </div>
            )}
            <div className="flex-1" />
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? '保存中...' : '設定を保存'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
