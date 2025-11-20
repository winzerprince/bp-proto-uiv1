'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, FileText, CircleCheckBig, Search, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Textarea, Select, LoadingSpinner } from '@/components/ui';
import { taskTypes } from '@/lib/mock-data';

function JobCreationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedTaskType, setSelectedTaskType] = useState(searchParams?.get('type') || '');
  const [jobName, setJobName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});

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
      newErrors.jobName = 'ジョブ名を入力してください';
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
    if (files.length === 0 && selectedTaskType !== 'SEARCH') {
      setErrors({ files: 'ファイルをアップロードしてください' });
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

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            新しいジョブを作成
          </h1>
          <p className="text-gray-600">
            ステップ {step} / 2
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-[#004080] text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#004080]' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-[#004080] text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">タスク選択</span>
            <span className="text-sm text-gray-600">ファイルアップロード</span>
          </div>
        </div>

        {/* Step 1: Task Selection */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
                      setSelectedTaskType(task.id);
                      setErrors({ ...errors, taskType: '' });
                    }}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      isSelected
                        ? 'border-[#004080] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      task.id === 'INSPECTION' ? 'bg-green-100' :
                      task.id === 'BOM' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        task.id === 'INSPECTION' ? 'text-green-600' :
                        task.id === 'BOM' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{task.name}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </button>
                );
              })}
            </div>
            {errors.taskType && (
              <p className="text-sm text-red-600 mb-4">{errors.taskType}</p>
            )}

            <div className="space-y-4">
              <Input
                label="ジョブ名"
                value={jobName}
                onChange={(e) => {
                  setJobName(e.target.value);
                  setErrors({ ...errors, jobName: '' });
                }}
                placeholder="例: 製品A - 検図"
                error={errors.jobName}
                required
              />

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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              ファイルをアップロード
            </h2>

            {/* Drag and Drop Zone */}
            <div className="mb-6">
              <label className="block w-full">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#004080] hover:bg-blue-50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    ファイルをドラッグ&ドロップ
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    またはクリックしてファイルを選択
                  </p>
                  <p className="text-xs text-gray-500">
                    対応形式: PDF, PNG, JPEG, TIFF, BMP (複数ページPDF対応)
                  </p>
                </div>
              </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  アップロードファイル ({files.length}件)
                </h3>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                          {uploadProgress[file.id] !== undefined && (
                            <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                              <div
                                className="h-full bg-[#004080] transition-all duration-300"
                                style={{ width: `${uploadProgress[file.id]}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.files}</span>
              </div>
            )}

            {/* PNG Conversion Option */}
            {selectedTaskType !== 'SEARCH' && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      AI処理用にPNGに自動変換
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
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
