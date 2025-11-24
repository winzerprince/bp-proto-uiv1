'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MdCheckCircle, 
  MdSpeed, 
  MdSecurity, 
  MdCloud,
  MdTrendingUp,
  MdGroups,
  MdArrowForward,
} from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#004080] rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">図面解析AI</span>
            </div>
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <button className="px-6 py-2.5 bg-[#004080] text-white rounded-lg font-medium hover:bg-[#003060] transition-colors">
                {isAuthenticated ? "ダッシュボード" : "ログイン"}
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                建設業界の
                <br />
                <span className="text-[#004080]">図面検査を自動化</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                AIを活用した図面解析で、手動検査作業を720時間から50%削減。
                <br />
                正確性と効率性を両立した次世代の図面管理システム。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                  <button className="px-8 py-4 bg-[#004080] text-white rounded-lg font-medium text-lg hover:bg-[#003060] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                    {isAuthenticated ? "ダッシュボードへ" : "今すぐ始める"}
                    <MdArrowForward className="w-5 h-5" />
                  </button>
                </Link>
                <button className="px-8 py-4 bg-white text-[#004080] border-2 border-[#004080] rounded-lg font-medium text-lg hover:bg-gray-50 transition-colors">
                  デモを見る
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                ✓ 14日間無料トライアル　✓ クレジットカード不要
              </p>
            </div>
            <div className="relative">
              <div className="aspect-4/3 bg-linear-to-br from-blue-50 to-gray-100 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-white/50 backdrop-blur-sm p-8">
                    {/* Mock Dashboard Preview */}
                    <div className="space-y-4">
                      <div className="h-12 bg-linear-to-r from-[#004080] to-[#0066CC] rounded-lg opacity-80" />
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-white rounded-lg shadow" />
                        <div className="h-24 bg-white rounded-lg shadow" />
                        <div className="h-24 bg-white rounded-lg shadow" />
                      </div>
                      <div className="h-48 bg-white rounded-lg shadow p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              主要機能
            </h2>
            <p className="text-xl text-gray-600">
              建設プロフェッショナルのための包括的なソリューション
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MdCheckCircle className="w-8 h-8" />,
                title: '自動検図',
                description: '構造図と施工図の整合性を自動チェック。不整合箇所を瞬時に検出し、視覚的に表示。',
                color: 'text-green-600 bg-green-50',
              },
              {
                icon: <MdSpeed className="w-8 h-8" />,
                title: '高速処理',
                description: '大量の図面を短時間で処理。従来の手動作業と比較して50%の時間削減を実現。',
                color: 'text-blue-600 bg-blue-50',
              },
              {
                icon: <MdSecurity className="w-8 h-8" />,
                title: 'セキュアな環境',
                description: 'エンタープライズグレードのセキュリティ。テナント別のデータ完全分離を保証。',
                color: 'text-purple-600 bg-purple-50',
              },
              {
                icon: <MdCloud className="w-8 h-8" />,
                title: 'クラウドベース',
                description: 'どこからでもアクセス可能。複数拠点でのリアルタイムコラボレーション。',
                color: 'text-cyan-600 bg-cyan-50',
              },
              {
                icon: <MdTrendingUp className="w-8 h-8" />,
                title: 'AI分析',
                description: '機械学習による精度向上。使用するほど賢くなる検査システム。',
                color: 'text-orange-600 bg-orange-50',
              },
              {
                icon: <MdGroups className="w-8 h-8" />,
                title: 'チーム管理',
                description: 'ロールベースのアクセス制御。プロジェクトメンバーの効率的な管理。',
                color: 'text-indigo-600 bg-indigo-50',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#004080]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { number: '50%', label: '作業時間削減' },
              { number: '99.8%', label: 'AI精度' },
              { number: '24/7', label: 'サポート体制' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-xl text-blue-200">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              シンプルなワークフロー
            </h2>
            <p className="text-xl text-gray-600">
              3ステップで始められる簡単操作
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'アップロード',
                description: '図面ファイルをドラッグ&ドロップで簡単アップロード。PDF、PNG、JPEG対応。',
              },
              {
                step: '02',
                title: 'AI処理',
                description: '自動で図面を解析。リアルタイムで進捗を確認できます。',
              },
              {
                step: '03',
                title: 'レビュー',
                description: '検出結果を確認し、コメント追加。エクスポートも簡単。',
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-gray-100 mb-4">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-[#004080] to-[#0066CC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            今すぐ始めて、作業時間を半減させましょう
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            14日間の無料トライアルで、すべての機能をお試しいただけます
          </p>
          <Link href={isAuthenticated ? "/dashboard" : "/login"}>
            <button className="px-10 py-4 bg-white text-[#004080] rounded-lg font-bold text-lg hover:bg-gray-50 transition-all shadow-xl inline-flex items-center gap-2">
              {isAuthenticated ? "ダッシュボードへ" : "無料で始める"}
              <MdArrowForward className="w-6 h-6" />
            </button>
          </Link>
          <p className="text-blue-100 mt-6">
            クレジットカード不要・即日利用可能
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#004080] rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"/>
                  </svg>
                </div>
                <span className="text-white font-bold">図面解析AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                建設業界のDXを推進する
                <br />
                AIソリューション
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">製品</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">機能</a></li>
                <li><a href="#" className="hover:text-white transition-colors">料金</a></li>
                <li><a href="#" className="hover:text-white transition-colors">セキュリティ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">ヘルプセンター</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API ドキュメント</a></li>
                <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">会社情報</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">会社概要</a></li>
                <li><a href="#" className="hover:text-white transition-colors">採用情報</a></li>
                <li><a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2025 DATAGRID Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
