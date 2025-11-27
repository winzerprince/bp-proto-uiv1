'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, FileText, CircleCheckBig, ScanLine, X, AlertCircle, Plus, Tag, Eye, EyeOff } from 'lucide-react';
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

const SCAN_TAGS = [
  { id: 'bom', label: 'BOM', type: 'table' },
  { id: 'title_block', label: 'title_block', type: 'text' },
  { id: 'dimension', label: 'dimension', type: 'text' },
  { id: 'section_view', label: 'section_view', type: 'figure' },
];

function JobCreationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated } = useAuth();
  
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
  const [showFilePreview, setShowFilePreview] = useState(true);
  const [autoConvertPng, setAutoConvertPng] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

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
      case 'SCAN':
        return ScanLine;
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

  const validateForm = () => {
    const newErrors = {};
    if (!selectedTaskType) {
      newErrors.taskType = 'タスク種別を選択してください';
    }
    if (!jobName.trim()) {
      newErrors.jobName = selectedTaskType === 'SCAN' ? 'スキャンタイトルを入力してください' : 'トレイ名を入力してください';
    }
    
    if (selectedTaskType === 'INSPECTION' && !workflow) {
      newErrors.workflow = 'ワークフローを選択してください';
    }
    if (selectedTaskType === 'BOM' && !workflow) {
      newErrors.workflow = 'ワークフローを選択してください';
    }
    
    if (files.length === 0 && !useSampleFiles) {
      newErrors.files = 'ファイルをアップロードするか、サンプルファイルを選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
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
      <div className="max-w-7xl mx-auto">
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
            {selectedTaskType === 'SCAN' ? '新しいBP Scanを作成' : '新しいトレイを作成'}
          </h1>
          <p className="text-foreground-light">
            タスクの詳細を設定し、ファイルをアップロードしてください
          </p>
        </div>

        {/* Single Page Layout: Left (Form) + Right (Upload) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Task Configuration (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                タスク設定
              </h2>

              {/* Task Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground-light mb-3">
                  タスク種別 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            setErrors({ ...errors, taskType: '' });
                          }
                        }}
                        className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-primary bg-blue-50 dark:bg-blue-900/20 shadow-md'
                            : 'border-border hover:border-primary hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-200 ${
                          task.id === 'INSPECTION' ? 'bg-green-100 dark:bg-green-900/30' :
                          task.id === 'BOM' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            task.id === 'INSPECTION' ? 'text-green-600 dark:text-green-400' :
                            task.id === 'BOM' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
                          }`} />
                        </div>
                        <h3 className="font-semibold text-sm text-foreground mb-1">{task.name}</h3>
                        <p className="text-xs text-foreground-light leading-tight">{task.description}</p>
                      </button>
                    );
                  })}
                </div>
                {errors.taskType && (
                  <p className="text-sm text-red-600 mt-2">{errors.taskType}</p>
                )}
              </div>

              {/* Job Name */}
              <div className="mb-6">
                <Input
                  label={selectedTaskType === 'SCAN' ? "スキャンタイトル" : "トレイ名"}
                  value={jobName}
                  onChange={(e) => {
                    setJobName(e.target.value);
                    setErrors({ ...errors, jobName: '' });
                  }}
                  placeholder={selectedTaskType === 'SCAN' ? "例: Q4 2025 図面スキャン" : "例: 製品A - 検図"}
                  error={errors.jobName}
                  required
                />
              </div>

              {/* Workflow Selection for INSPECTION */}
              {selectedTaskType === 'INSPECTION' && (
                <div className="mb-6">
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
                <div className="mb-6">
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

              {/* Element Tags for SCAN */}
              {selectedTaskType === 'SCAN' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground-light mb-2">
                    要素タグ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SCAN_TAGS.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-all duration-200 ${
                          tags.includes(tag.id)
                            ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 shadow-sm'
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

              {/* Description and Priority for non-SCAN tasks */}
              {selectedTaskType !== 'SCAN' && (
                <>
                  <div className="mb-6">
                    <Textarea
                      label="説明（任意）"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="ジョブの詳細を入力してください"
                      rows={3}
                    />
                  </div>

                  <div className="mb-6">
                    <Select
                      label="優先度"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </Select>
                  </div>
                </>
              )}

              {/* PNG Conversion Option */}
              {selectedTaskType !== 'SCAN' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoConvertPng}
                      onChange={(e) => setAutoConvertPng(e.target.checked)}
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
            </Card>

            {/* Custom Fields Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {selectedTaskType === 'INSPECTION' ? 'カスタム検図項目（任意）' : 'カスタムフィールド（任意）'}
              </h2>
              <button className="text-sm text-primary hover:text-blue-700 dark:hover:text-blue-400 font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" />
                {selectedTaskType === 'INSPECTION' ? 'カスタム検図項目を追加' : 'カスタムフィールドを追加'}
              </button>
              <p className="text-xs text-foreground-lighter mt-2">
                {selectedTaskType === 'INSPECTION' 
                  ? '標準検図項目に追加のチェック項目を定義できます' 
                  : '追加のデータフィールドを定義できます'}
              </p>
            </Card>
          </div>

          {/* Right Side: File Upload Section (1/3 width) */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedTaskType === 'INSPECTION' ? 'ファイルアップロード' : 'ファイル'}
                </h2>
                <button
                  onClick={() => setShowFilePreview(!showFilePreview)}
                  className="p-2 text-foreground-light hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  title={showFilePreview ? 'プレビューを隠す' : 'プレビューを表示'}
                >
                  {showFilePreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Sample Files Option */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSampleFiles}
                    onChange={(e) => setUseSampleFiles(e.target.checked)}
                    className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-xs text-foreground-light">デモ用サンプルセット (3ファイル)</span>
                </label>
              </div>

              {/* Drag and Drop Zone - Single multi-file upload for all task types */}
              {(
                <div className="mb-4">
                  <label className="block w-full">
                    <input
                      type="file"
                      multiple
                      accept={selectedTaskType === 'SCAN' ? "image/*,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp" : ".pdf,.png,.jpg,.jpeg,.tiff,.bmp,.xlsx,.xls"}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer">
                      <Upload className="w-8 h-8 text-foreground-lighter mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        ファイルを選択
                      </p>
                      <p className="text-xs text-foreground-light">
                        またはドラッグ&ドロップ
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {errors.files && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.files}</span>
                </div>
              )}

              {/* File List with Preview */}
              {files.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-medium text-foreground-light mb-2">
                    アップロード ({files.length}件)
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-2 bg-muted rounded-lg hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-foreground-lighter shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-foreground-light">
                              {formatFileSize(file.size)}
                            </p>
                            {uploadProgress[file.id] !== undefined && (
                              <div className="w-full h-1 bg-surface-200 rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all duration-300"
                                  style={{ width: `${uploadProgress[file.id]}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            className="p-1 text-foreground-lighter hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                            disabled={uploading}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {/* File Preview (if enabled) */}
                        {showFilePreview && file.file.type.startsWith('image/') && (
                          <div className="mt-2 rounded overflow-hidden border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={URL.createObjectURL(file.file)} 
                              alt={file.name}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-foreground-lighter mb-4">
                {selectedTaskType === 'SCAN' 
                  ? '対応形式: JPG, PNG, GIF, BMP, TIFF, WebP'
                  : '対応形式: PDF, PNG, JPEG, TIFF, BMP, Excel'}
              </p>

              {/* Submit Button */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? 'アップロード中...' : 'トレイを作成して実行'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  disabled={uploading}
                  className="w-full"
                >
                  キャンセル
                </Button>
              </div>
            </Card>
          </div>
        </div>
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
