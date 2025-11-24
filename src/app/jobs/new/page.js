'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, FileText, CircleCheckBig, Search, X, AlertCircle, Plus, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Textarea, Select, LoadingSpinner } from '@/components/ui';
import { taskTypes } from '@/lib/mock-data';

const INSPECTION_WORKFLOWS = [
  { value: 'design_manufacturing_check', label: '設計-製造図面照合' },
  { value: 'revision_comparison', label: '改版前後比較検図' },
  { value: 'standard_compliance', label: '規格準拠チェック' },
  { value: 'tolerance_verification', label: '公差検証' },
  { value: 'material_spec_check', label: '材質・仕様確認' },
];

const BOM_WORKFLOWS = [
  { value: 'assy_bom_auto', label: '組立図BOM自動生成' },
  { value: 'part_bom_auto', label: '部品図BOM自動生成' },
  { value: 'electrical_bom_auto', label: '電気部品表自動生成' },
  { value: 'pcb_bom_auto', label: '基板部品表自動生成' },
  { value: 'multi_level_bom', label: '階層BOM自動生成' },
];

const SEARCH_TAGS = [
  { id: 'bom', label: 'BOM', type: 'table' },
  { id: 'title_block', label: 'title_block', type: 'text' },
  { id: 'dimension', label: 'dimension', type: 'text' },
  { id: 'section_view', label: 'section_view', type: 'figure' },
];

function JobCreationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedTaskType, setSelectedTaskType] = useState(searchParams?.get('type') || '');
  const [jobName, setJobName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [workflow, setWorkflow] = useState('');
  const [tags, setTags] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [useSampleFiles, setUseSampleFiles] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Reset workflow/tags when task type changes
  // useEffect(() => {
  //   setWorkflow('');
  //   setTags([]);
  //   setErrors({});
  // }, [selectedTaskType]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const taskTypeOptions = Object.values(taskTypes);

  const getTaskIcon = (type) => {
    switch (type) {
      case 'INSPECTION':
        return CircleCheckBig;
      case 'BOM':
        return FileText;
      case 'SEARCH':
        return Search;
      default:
        return FileText;
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
    }));
    setFiles([...files, ...newFiles]);
  };

  const handleRemoveFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!selectedTaskType) {
      newErrors.taskType = 'タスク種別を選択してください';
    }
    if (!jobName.trim()) {
      newErrors.jobName = selectedTaskType === 'SEARCH' ? 'データセットタイトルを入力してください' : 'ジョブ名を入力してください';
    }
    
    if (selectedTaskType === 'INSPECTION' && !workflow) {
      newErrors.workflow = 'ワークフローを選択してください';
    }
    if (selectedTaskType === 'BOM' && !workflow) {
      newErrors.workflow = 'ワークフローを選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0 && !useSampleFiles) {
      setErrors({ files: 'ファイルをアップロードするか、サンプルファイルを選択してください' });
      return;
    }

    setUploading(true);

    // Simulate file upload
    for (const file of files) {
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(prev => ({ ...prev, [file.id]: progress }));
      }
    }

    // Simulate job creation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create mock job ID and redirect
    const jobId = 'job-' + Math.random().toString(36).substr(2, 9);
    router.push(`/jobs/${jobId}`);
  };

  const toggleTag = (tagId) => {
    if (tags.includes(tagId)) {
      setTags(tags.filter(t => t !== tagId));
    } else {
      setTags([...tags, tagId]);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-foreground-light hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {selectedTaskType === 'SEARCH' ? '新しいデータセットを作成' : '新しいジョブを作成'}
          </h1>
          <p className="text-foreground-light">
            ステップ {step} / 2
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground-light'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground-light'}`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-foreground-light">タスク設定</span>
            <span className="text-sm text-foreground-light">ファイルアップロード</span>
          </div>
        </div>

        {/* Step 1: Task Selection & Configuration */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              タスク種別を選択
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {taskTypeOptions.map((task) => {
                const Icon = getTaskIcon(task.id);
                const isSelected = selectedTaskType === task.id;
                return (
                  <button
                    key={task.id}
                    onClick={() => {
                      if (selectedTaskType !== task.id) {
                        setSelectedTaskType(task.id);
                        setWorkflow('');
                        setTags([]);
                        setErrors({});
                      }
                    }}
                    className={`p-6 border-2 rounded-lg transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-primary bg-blue-50 dark:bg-blue-900/20 shadow-md scale-105'
                        : 'border-border hover:border-primary hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-200 ${
                      task.id === 'INSPECTION' ? 'bg-green-100 dark:bg-green-900/30' :
                      task.id === 'BOM' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                    } ${isSelected ? 'scale-110' : ''}`}>
                      <Icon className={`w-6 h-6 ${
                        task.id === 'INSPECTION' ? 'text-green-600 dark:text-green-400' :
                        task.id === 'BOM' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{task.name}</h3>
                    <p className="text-sm text-foreground-light">{task.description}</p>
                  </button>
                );
              })}
            </div>
            {errors.taskType && (
              <p className="text-sm text-red-600 mb-4">{errors.taskType}</p>
            )}

            <div className="space-y-6 border-t border-border pt-6">
              <Input
                label={selectedTaskType === 'SEARCH' ? "データセットタイトル" : "ジョブ名"}
                value={jobName}
                onChange={(e) => {
                  setJobName(e.target.value);
                  setErrors({ ...errors, jobName: '' });
                }}
                placeholder={selectedTaskType === 'SEARCH' ? "例: Q4 2025 技術図面解析" : "例: 製品A - 検図"}
                error={errors.jobName}
                required
              />

              {/* Workflow Selection for INSPECTION */}
              {selectedTaskType === 'INSPECTION' && (
                <div>
                  <label className="block text-sm font-medium text-foreground-light mb-2">
                    ワークフロー <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={workflow}
                    onChange={(e) => {
                      setWorkflow(e.target.value);
                      setErrors({ ...errors, workflow: '' });
                    }}
                    error={errors.workflow}
                  >
                    <option value="">選択してください</option>
                    {INSPECTION_WORKFLOWS.map(wf => (
                      <option key={wf.value} value={wf.value}>{wf.label}</option>
                    ))}
                  </Select>
                  <p className="text-xs text-foreground-lighter mt-1">検図の目的に応じたワークフローを選択してください</p>
                </div>
              )}

              {/* Workflow Selection for BOM */}
              {selectedTaskType === 'BOM' && (
                <div>
                  <label className="block text-sm font-medium text-foreground-light mb-2">
                    ワークフロー <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={workflow}
                    onChange={(e) => {
                      setWorkflow(e.target.value);
                      setErrors({ ...errors, workflow: '' });
                    }}
                    error={errors.workflow}
                  >
                    <option value="">選択してください</option>
                    {BOM_WORKFLOWS.map(wf => (
                      <option key={wf.value} value={wf.value}>{wf.label}</option>
                    ))}
                  </Select>
                  <p className="text-xs text-foreground-lighter mt-1">図面の種類や構成に応じたワークフローを選択してください</p>
                </div>
              )}

              {/* Element Tags for SEARCH */}
              {selectedTaskType === 'SEARCH' && (
                <div>
                  <label className="block text-sm font-medium text-foreground-light mb-2">
                    要素タグ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SEARCH_TAGS.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-all duration-200 ${
                          tags.includes(tag.id)
                            ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 shadow-sm scale-105'
                            : 'border-border text-foreground-light hover:bg-accent hover:border-primary'
                        }`}
                      >
                        <span>{tags.includes(tag.id) ? '✓ ' : '+ '}{tag.label}</span>
                        <span className="text-xs opacity-60">({tag.type})</span>
                      </button>
                    ))}
                    <button className="px-3 py-1.5 text-sm border border-dashed border-border text-foreground-lighter rounded-lg hover:bg-accent hover:text-foreground transition-colors">
                      + 新規タグ
                    </button>
                  </div>
                </div>
              )}

              {selectedTaskType !== 'SEARCH' && (
                <>
                  <Textarea
                    label="説明（任意）"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="ジョブの詳細を入力してください"
                    rows={3}
                  />

                  <Select
                    label="優先度"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </Select>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={handleBack}>
                キャンセル
              </Button>
              <Button variant="primary" onClick={handleNext}>
                次へ
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: File Upload */}
        {step === 2 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              ファイルをアップロード
            </h2>

            {/* Sample Files Option */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <h3 className="text-sm font-medium text-foreground-light mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                サンプルファイルを使用（デモ用）
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-card rounded border border-border cursor-pointer hover:bg-accent transition-colors">
                  <input
                    type="checkbox"
                    checked={useSampleFiles}
                    onChange={(e) => setUseSampleFiles(e.target.checked)}
                    className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground-light flex-1">デモ用サンプルセット (3ファイル)</span>
                </label>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div className="mb-6">
              <label className="block w-full">
                <input
                  type="file"
                  multiple
                  accept={selectedTaskType === 'SEARCH' ? "image/*,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp" : ".pdf,.png,.jpg,.jpeg,.tiff,.bmp,.xlsx,.xls"}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer">
                  <Upload className="w-12 h-12 text-foreground-lighter mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    ファイルをドラッグ&ドロップ
                  </p>
                  <p className="text-sm text-foreground-light mb-4">
                    またはクリックしてファイルを選択
                  </p>
                  <p className="text-xs text-foreground-lighter">
                    {selectedTaskType === 'SEARCH' 
                      ? '対応形式: JPG, PNG, GIF, BMP, TIFF, WebP (最大1000ファイル)'
                      : '対応形式: PDF, PNG, JPEG, TIFF, BMP, Excel (最大10ファイル)'}
                  </p>
                </div>
              </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  アップロードファイル ({files.length}件)
                </h3>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-accent transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-foreground-lighter shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-foreground-light">
                            {formatFileSize(file.size)}
                          </p>
                          {uploadProgress[file.id] !== undefined && (
                            <div className="w-full h-1 bg-surface-200 rounded-full mt-2 overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${uploadProgress[file.id]}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                        disabled={uploading}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.files && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.files}</span>
              </div>
            )}

            {/* Custom Fields / Items */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground-light mb-2">
                {selectedTaskType === 'INSPECTION' ? 'カスタム検図項目（任意）' : 'カスタムフィールド（任意）'}
              </label>
              <button className="text-sm text-primary hover:text-blue-700 dark:hover:text-blue-400 font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" />
                {selectedTaskType === 'INSPECTION' ? 'カスタム検図項目を追加' : 'カスタムフィールドを追加'}
              </button>
              <p className="text-xs text-foreground-lighter mt-1">
                {selectedTaskType === 'INSPECTION' 
                  ? '標準検図項目に追加のチェック項目を定義できます' 
                  : '追加のデータフィールドを定義できます'}
              </p>
            </div>

            {/* PNG Conversion Option */}
            {selectedTaskType !== 'SEARCH' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      AI処理用にPNGに自動変換
                    </p>
                    <p className="text-xs text-foreground-light mt-1">
                      PDFファイルは処理前に自動的にPNG形式に変換されます
                    </p>
                  </div>
                </label>
              </div>
            )}

            <div className="flex justify-between gap-3">
              <Button variant="secondary" onClick={handleBack} disabled={uploading}>
                戻る
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={uploading}
              >
                {uploading ? 'アップロード中...' : 'ジョブを作成して実行'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default function JobCreationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <JobCreationForm />
    </Suspense>
  );
}
