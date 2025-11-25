// Mock data for the Blueprint Analysis Application

export const tenants = [
  {
    id: 'tenant-1',
    name: '大手建設株式会社',
    logo: '/logos/tenant1.png',
    settings: {
      notifications: {
        email: true,
        slack: false,
      },
      customFields: [],
    },
  },
  {
    id: 'tenant-2',
    name: '中堅建設工業',
    logo: '/logos/tenant2.png',
    settings: {
      notifications: {
        email: true,
        slack: true,
      },
      customFields: [],
    },
  },
];

export const users = [
  {
    id: 'user-1',
    tenantId: 'tenant-1',
    name: '山田太郎',
    email: 'yamada@example.com',
    role: 'general', // general, tenant_admin, system_admin
    avatar: '/avatars/user1.png',
  },
  {
    id: 'user-2',
    tenantId: 'tenant-1',
    name: '佐藤花子',
    email: 'sato@example.com',
    role: 'tenant_admin',
    avatar: '/avatars/user2.png',
  },
  {
    id: 'user-3',
    tenantId: 'tenant-2',
    name: '鈴木一郎',
    email: 'suzuki@example.com',
    role: 'general',
    avatar: '/avatars/user3.png',
  },
  {
    id: 'system-admin',
    tenantId: null,
    name: 'システム管理者',
    email: 'admin@datagrid.com',
    role: 'system_admin',
    avatar: '/avatars/admin.png',
  },
];

export const jobStatuses = {
  created: { label: '作成済み', color: 'gray' },
  file_uploading: { label: 'アップロード中', color: 'blue' },
  ready: { label: '準備完了', color: 'cyan' },
  processing: { label: '処理中', color: 'amber' },
  completed: { label: '完了', color: 'green' },
  failed: { label: '失敗', color: 'red' },
};

export const jobStatusOptions = Object.entries(jobStatuses).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export const taskTypes = {
  INSPECTION: {
    id: 'INSPECTION',
    name: '自動検図',
    description: '構造図と施工図の整合性チェックを行います',
    icon: 'CircleCheckBig',
    color: 'green',
  },
  BOM: {
    id: 'BOM',
    name: '自動BOM生成',
    description: '図面から部品表を自動抽出します',
    icon: 'FileText',
    color: 'blue',
  },
  SEARCH: {
    id: 'SEARCH',
    name: '図面検索',
    description: 'AI解析による図面検索を行います',
    icon: 'Search',
    color: 'purple',
  },
};

export const taskTypeOptions = Object.values(taskTypes).map((type) => ({
  value: type.id,
  label: type.name,
}));

export const mockJobs = [
  {
    id: 'job-001',
    tenantId: 'tenant-1',
    userId: 'user-1',
    taskType: 'INSPECTION',
    name: '製品A - 検図',
    description: '製品A の構造図と施工図の整合性確認',
    status: 'completed',
    progress: 100,
    files: [
      { id: 'file-1', name: '構造図_A.pdf', size: 2048000, uploadedAt: '2025-11-20T10:00:00Z', preview: '/samples/blueprints/blueprint-01.png' },
      { id: 'file-2', name: '施工図_A.pdf', size: 3072000, uploadedAt: '2025-11-20T10:01:00Z', preview: '/samples/blueprints/blueprint-02.jpg' },
    ],
    createdAt: '2025-11-20T08:00:00Z',
    updatedAt: '2025-11-20T08:45:00Z',
    completedAt: '2025-11-20T08:45:00Z',
    results: {
      totalFindings: 12,
      okCount: 8,
      ngCount: 3,
      warningCount: 1,
      confirmedCount: 5,
      needsFixCount: 2,
    },
  },
  {
    id: 'job-002',
    tenantId: 'tenant-1',
    userId: 'user-1',
    taskType: 'BOM',
    name: '製品B - BOM抽出',
    description: '製品B の部品表生成',
    status: 'completed',
    progress: 100,
    files: [
      { id: 'file-3', name: '組立図_B.pdf', size: 4096000, uploadedAt: '2025-11-20T09:30:00Z', preview: '/samples/blueprints/blueprint-03.jpg' },
    ],
    createdAt: '2025-11-20T09:00:00Z',
    updatedAt: '2025-11-20T09:35:00Z',
    completedAt: '2025-11-20T09:40:00Z',
    results: {
      totalParts: 45,
      extractedParts: 45,
      categories: ['ボルト', 'ナット', 'ワッシャー', '部品A', '部品B'],
    },
  },
  {
    id: 'job-003',
    tenantId: 'tenant-1',
    userId: 'user-2',
    taskType: 'INSPECTION',
    name: '製品C - 検図',
    description: '製品C の整合性確認',
    status: 'ready',
    progress: 0,
    files: [
      { id: 'file-4', name: '構造図_C.pdf', size: 1024000, uploadedAt: '2025-11-20T07:00:00Z', preview: '/samples/blueprints/blueprint-04.png' },
    ],
    createdAt: '2025-11-20T07:00:00Z',
    updatedAt: '2025-11-20T07:05:00Z',
    completedAt: null,
    results: null,
  },
  {
    id: 'job-004',
    tenantId: 'tenant-1',
    userId: 'user-1',
    taskType: 'SEARCH',
    name: '過去図面検索 - プロジェクトX',
    description: 'プロジェクトX関連図面の検索',
    status: 'completed',
    progress: 100,
    files: [
      { id: 'file-6', name: 'dataset_project_x.zip', size: 50000000, uploadedAt: '2025-11-19T15:00:00Z' },
    ],
    createdAt: '2025-11-19T15:00:00Z',
    updatedAt: '2025-11-19T15:10:00Z',
    completedAt: '2025-11-19T15:10:00Z',
    results: {
      totalImages: 120,
      totalElements: 1523,
      matchCount: 24,
      searchQuery: 'M8 ボルト 寸法',
    },
  },
  {
    id: 'job-005',
    tenantId: 'tenant-2',
    userId: 'user-3',
    taskType: 'BOM',
    name: '製品D - BOM抽出',
    description: '製品D の部品表生成',
    status: 'failed',
    progress: 0,
    files: [
      { id: 'file-5', name: '組立図_D_破損.pdf', size: 512000, uploadedAt: '2025-11-19T14:00:00Z', preview: null },
    ],
    createdAt: '2025-11-19T14:00:00Z',
    updatedAt: '2025-11-19T14:02:00Z',
    completedAt: null,
    error: 'ファイル形式が不正です。PDFが破損している可能性があります。',
    results: null,
  },
];

// Mock BOM results data
export const mockBOMResults = [
  {
    id: 'bom-1',
    jobId: 'job-002',
    partNumber: 'M8-B-001',
    partName: 'M8 六角ボルト',
    specification: 'M8×20 SS400',
    quantity: 12,
    unit: '本',
    category: 'ボルト',
    confidence: 0.95,
    extractedFrom: 'file-3',
    page: 1,
  },
  {
    id: 'bom-2',
    jobId: 'job-002',
    partNumber: 'M8-N-001',
    partName: 'M8 六角ナット',
    specification: 'M8 SS400',
    quantity: 12,
    unit: '個',
    category: 'ナット',
    confidence: 0.93,
    extractedFrom: 'file-3',
    page: 1,
  },
  {
    id: 'bom-3',
    jobId: 'job-002',
    partNumber: 'W8-001',
    partName: 'M8 平ワッシャー',
    specification: 'M8 SS400',
    quantity: 12,
    unit: '個',
    category: 'ワッシャー',
    confidence: 0.91,
    extractedFrom: 'file-3',
    page: 1,
  },
  {
    id: 'bom-4',
    jobId: 'job-002',
    partNumber: 'P-A-001',
    partName: 'ベースプレート',
    specification: '200×200×10 SS400',
    quantity: 2,
    unit: '枚',
    category: '部品A',
    confidence: 0.89,
    extractedFrom: 'file-3',
    page: 2,
  },
  {
    id: 'bom-5',
    jobId: 'job-002',
    partNumber: 'P-B-001',
    partName: 'サポートブラケット',
    specification: '150×100×8 SS400',
    quantity: 4,
    unit: '個',
    category: '部品B',
    confidence: 0.87,
    extractedFrom: 'file-3',
    page: 2,
  },
];

// Mock search results data
export const mockSearchResults = [
  {
    id: 'search-1',
    jobId: 'job-004',
    drawingId: 'DWG-2024-001',
    drawingName: '製品X_組立図',
    matchedElement: 'M8 ボルト寸法',
    elementType: 'text',
    confidence: 0.92,
    snippet: 'M8×20 六角ボルト 12本使用',
    preview: '/samples/blueprints/blueprint-01.png',
    page: 1,
  },
  {
    id: 'search-2',
    jobId: 'job-004',
    drawingId: 'DWG-2024-002',
    drawingName: '製品Y_詳細図',
    matchedElement: 'M8 ボルト配置',
    elementType: 'figure',
    confidence: 0.88,
    snippet: 'ボルト配置図',
    preview: '/samples/blueprints/blueprint-02.jpg',
    page: 2,
  },
  {
    id: 'search-3',
    jobId: 'job-004',
    drawingId: 'DWG-2024-003',
    drawingName: '製品Z_部品表',
    matchedElement: 'ボルト仕様',
    elementType: 'table',
    confidence: 0.85,
    snippet: 'M8ボルト一覧',
    preview: '/samples/blueprints/blueprint-03.jpg',
    page: 1,
  },
];

export const mockInspectionResults = [
  {
    id: 'finding-1',
    jobId: 'job-001',
    type: '寸法整合性',
    aiJudgment: 'OK',
    confidence: 0.95,
    aiComment: '構造図と施工図の寸法が一致しています',
    userAction: 'confirmed',
    userComment: '確認済み',
    evidenceFile: 'file-1',
    evidencePage: 1,
    boundingBox: { x: 100, y: 200, width: 300, height: 150 },
  },
  {
    id: 'finding-2',
    jobId: 'job-001',
    type: '通り芯整合性',
    aiJudgment: 'NG',
    confidence: 0.88,
    aiComment: '通り芯の位置が5mm相違しています',
    userAction: 'needs_fix',
    userComment: '要修正。構造図の通り芯を確認',
    evidenceFile: 'file-1',
    evidencePage: 2,
    boundingBox: { x: 200, y: 300, width: 250, height: 200 },
  },
  {
    id: 'finding-3',
    jobId: 'job-001',
    type: '配筋整合性',
    aiJudgment: 'WARNING',
    confidence: 0.72,
    aiComment: '配筋の本数が異なる可能性があります（要確認）',
    userAction: 'pending',
    userComment: '',
    evidenceFile: 'file-2',
    evidencePage: 1,
    boundingBox: { x: 150, y: 250, width: 280, height: 180 },
  },
  {
    id: 'finding-4',
    jobId: 'job-001',
    type: '寸法整合性',
    aiJudgment: 'OK',
    confidence: 0.92,
    aiComment: '柱の寸法が一致しています',
    userAction: 'confirmed',
    userComment: '',
    evidenceFile: 'file-1',
    evidencePage: 3,
    boundingBox: { x: 120, y: 180, width: 200, height: 140 },
  },
  {
    id: 'finding-5',
    jobId: 'job-001',
    type: '通り芯整合性',
    aiJudgment: 'OK',
    confidence: 0.96,
    aiComment: '通り芯の位置が正確に一致しています',
    userAction: 'pending',
    userComment: '',
    evidenceFile: 'file-1',
    evidencePage: 1,
    boundingBox: { x: 180, y: 220, width: 260, height: 160 },
  },
  {
    id: 'finding-6',
    jobId: 'job-001',
    type: '配筋整合性',
    aiJudgment: 'NG',
    confidence: 0.71,
    aiComment: '配筋の位置が不明確です',
    userAction: 'pending',
    userComment: '',
    evidenceFile: 'file-2',
    evidencePage: 2,
    boundingBox: { x: 140, y: 260, width: 220, height: 170 },
  },
  {
    id: 'finding-7',
    jobId: 'job-001',
    type: '寸法整合性',
    aiJudgment: 'OK',
    confidence: 0.94,
    aiComment: '梁の寸法が一致しています',
    userAction: 'confirmed',
    userComment: '',
    evidenceFile: 'file-1',
    evidencePage: 4,
    boundingBox: { x: 160, y: 240, width: 240, height: 150 },
  },
  {
    id: 'finding-8',
    jobId: 'job-001',
    type: '配筋整合性',
    aiJudgment: 'OK',
    confidence: 0.89,
    aiComment: '配筋パターンが一致しています',
    userAction: 'confirmed',
    userComment: '',
    evidenceFile: 'file-2',
    evidencePage: 3,
    boundingBox: { x: 130, y: 270, width: 270, height: 190 },
  },
  {
    id: 'finding-9',
    jobId: 'job-001',
    type: '通り芯整合性',
    aiJudgment: 'OK',
    confidence: 0.97,
    aiComment: '通り芯の間隔が正確です',
    userAction: 'pending',
    userComment: '',
    evidenceFile: 'file-1',
    evidencePage: 2,
    boundingBox: { x: 170, y: 230, width: 250, height: 165 },
  },
  {
    id: 'finding-10',
    jobId: 'job-001',
    type: 'レベル整合性',
    aiJudgment: 'NG',
    confidence: 0.81,
    aiComment: 'レベル表記が10mm異なります',
    userAction: 'pending',
    userComment: '',
    evidenceFile: 'file-1',
    evidencePage: 1,
    boundingBox: { x: 190, y: 210, width: 230, height: 155 },
  },
  {
    id: 'finding-11',
    jobId: 'job-001',
    type: '寸法整合性',
    aiJudgment: 'OK',
    confidence: 0.93,
    aiComment: 'スラブ厚が一致しています',
    userAction: 'confirmed',
    userComment: '',
    evidenceFile: 'file-2',
    evidencePage: 4,
    boundingBox: { x: 145, y: 255, width: 265, height: 175 },
  },
  {
    id: 'finding-12',
    jobId: 'job-001',
    type: '配筋整合性',
    aiJudgment: 'OK',
    confidence: 0.91,
    aiComment: '主筋の配置が正確です',
    userAction: 'pending',
    userComment: '',
    evidenceFile: 'file-2',
    evidencePage: 5,
    boundingBox: { x: 155, y: 245, width: 255, height: 185 },
  },
];

// Simulated async processing
export const simulateJobProcessing = (jobId, onProgress) => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        onProgress(100);
        resolve();
      } else {
        onProgress(Math.floor(progress));
      }
    }, 1000);
  });
};

// Helper functions
export const getUserById = (userId) => users.find(u => u.id === userId);
export const getTenantById = (tenantId) => tenants.find(t => t.id === tenantId);
export const getJobById = (jobId) => mockJobs.find(j => j.id === jobId);
export const getJobsByTenant = (tenantId) => mockJobs.filter(j => j.tenantId === tenantId);
export const getJobsByUser = (userId) => mockJobs.filter(j => j.userId === userId);
export const getInspectionResults = (jobId) => mockInspectionResults.filter(r => r.jobId === jobId);
export const getBOMResults = (jobId) => mockBOMResults.filter(r => r.jobId === jobId);
export const getSearchResults = (jobId) => mockSearchResults.filter(r => r.jobId === jobId);
