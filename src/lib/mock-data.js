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
    name: 'オフィスビル新築 - 基礎伏図検図',
    description: '基礎伏図の構造図と施工図の整合性確認（通り芯・柱・梁・配筋）',
    status: 'completed',
    progress: 100,
    files: [
      { id: 'file-1', name: '基礎伏図_構造.pdf', size: 2048000, uploadedAt: '2025-11-20T10:00:00Z', preview: '/samples/blueprints/blueprint-05.jpg' },
      { id: 'file-2', name: '基礎伏図_施工.pdf', size: 3072000, uploadedAt: '2025-11-20T10:01:00Z', preview: '/samples/blueprints/blueprint-09.jpg' },
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
    name: 'マンション新築 - 配筋リスト生成',
    description: '配筋図から鉄筋リストを自動抽出',
    status: 'completed',
    progress: 100,
    files: [
      { id: 'file-3', name: '配筋詳細図.pdf', size: 4096000, uploadedAt: '2025-11-20T09:30:00Z', preview: '/samples/blueprints/blueprint-11.jpg' },
    ],
    createdAt: '2025-11-20T09:00:00Z',
    updatedAt: '2025-11-20T09:35:00Z',
    completedAt: '2025-11-20T09:40:00Z',
    results: {
      totalParts: 45,
      extractedParts: 45,
      categories: ['主筋', 'あばら筋', 'スタラップ', 'フープ筋', '帯筋'],
    },
  },
  {
    id: 'job-003',
    tenantId: 'tenant-1',
    userId: 'user-2',
    taskType: 'INSPECTION',
    name: '商業施設増築 - 杭配置図検図',
    description: '杭伏図の構造図整合性確認',
    status: 'ready',
    progress: 0,
    files: [
      { id: 'file-4', name: '杭伏図_構造.pdf', size: 1024000, uploadedAt: '2025-11-20T07:00:00Z', preview: '/samples/blueprints/blueprint-09.jpg' },
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
    name: '過去図面検索 - 基礎配筋詳細',
    description: '類似する基礎配筋図の検索',
    status: 'completed',
    progress: 100,
    files: [
      { id: 'file-6', name: 'dataset_foundation_drawings.zip', size: 50000000, uploadedAt: '2025-11-19T15:00:00Z' },
    ],
    createdAt: '2025-11-19T15:00:00Z',
    updatedAt: '2025-11-19T15:10:00Z',
    completedAt: '2025-11-19T15:10:00Z',
    results: {
      totalImages: 120,
      totalElements: 1523,
      matchCount: 24,
      searchQuery: 'D19 主筋配置 基礎梁',
    },
  },
  {
    id: 'job-005',
    tenantId: 'tenant-2',
    userId: 'user-3',
    taskType: 'BOM',
    name: '工場新築 - 鉄骨部材リスト生成',
    description: '鉄骨詳細図から部材リストを自動抽出',
    status: 'failed',
    progress: 0,
    files: [
      { id: 'file-5', name: '鉄骨詳細図_破損.pdf', size: 512000, uploadedAt: '2025-11-19T14:00:00Z', preview: null },
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
    partNumber: 'D19-001',
    partName: 'D19 異形棒鋼（主筋）',
    specification: 'D19 SD345 L=6000',
    quantity: 48,
    unit: '本',
    category: '主筋',
    confidence: 0.95,
    extractedFrom: 'file-3',
    page: 1,
  },
  {
    id: 'bom-2',
    jobId: 'job-002',
    partNumber: 'D13-002',
    partName: 'D13 異形棒鋼（あばら筋）',
    specification: 'D13 SD295A @200',
    quantity: 120,
    unit: '本',
    category: 'あばら筋',
    confidence: 0.93,
    extractedFrom: 'file-3',
    page: 1,
  },
  {
    id: 'bom-3',
    jobId: 'job-002',
    partNumber: 'D10-003',
    partName: 'D10 異形棒鋼（スタラップ）',
    specification: 'D10 SD295A @150',
    quantity: 80,
    unit: '本',
    category: 'スタラップ',
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
    drawingId: 'DWG-2023-F05',
    drawingName: 'A棟_基礎伏図',
    matchedElement: 'D19 主筋配置 基礎梁',
    elementType: 'text',
    confidence: 0.92,
    snippet: '基礎梁 G1: 上筋 4-D19, 下筋 3-D19, あばら筋 D10@150',
    preview: '/samples/blueprints/blueprint-05.jpg',
    page: 1,
  },
  {
    id: 'search-2',
    jobId: 'job-004',
    drawingId: 'DWG-2023-P12',
    drawingName: 'B棟_杭伏図',
    matchedElement: '既製杭配置',
    elementType: 'figure',
    confidence: 0.88,
    snippet: 'PHC杭 φ400 L=12.0m 配置図',
    preview: '/samples/blueprints/blueprint-09.jpg',
    page: 2,
  },
  {
    id: 'search-3',
    jobId: 'job-004',
    drawingId: 'DWG-2023-R08',
    drawingName: 'C棟_配筋詳細図',
    matchedElement: '柱配筋スケジュール',
    elementType: 'table',
    confidence: 0.85,
    snippet: 'C1柱 16-D25 + D10@100, C2柱 12-D22 + D10@150',
    preview: '/samples/blueprints/blueprint-11.jpg',
    page: 1,
  },
];

export const mockInspectionResults = [
  {
    id: 'finding-1',
    jobId: 'job-001',
    type: '通り芯整合性',
    aiJudgment: 'OK',
    confidence: 0.95,
    aiComment: 'X1-Y1交点の通り芯位置が構造図と施工図で一致しています',
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
    aiComment: 'X3-Y2交点で通り芯の位置が5mm相違しています（構造: 3000, 施工: 2995）',
    userAction: 'needs_fix',
    userComment: '要修正。構造図の通り芯X3を確認',
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
    aiComment: 'C1柱（X2-Y3交点）の主筋本数が異なる可能性があります（構造: 12-D25, 施工: 不明瞭）',
    userAction: 'pending',
    userComment: '',
    evidenceFile: 'file-2',
    evidencePage: 1,
    boundingBox: { x: 150, y: 250, width: 280, height: 180 },
  },
  {
    id: 'finding-4',
    jobId: 'job-001',
    type: '柱寸法整合性',
    aiJudgment: 'OK',
    confidence: 0.92,
    aiComment: 'C2柱（X4-Y1交点）の断面寸法が一致しています（600×600）',
    userAction: 'confirmed',
    userComment: '',
    evidenceFile: 'file-1',
    evidencePage: 3,
    boundingBox: { x: 120, y: 180, width: 200, height: 140 },
  },
  {
    id: 'finding-5',
    jobId: 'job-001',
    type: '通り芯間隔',
    aiJudgment: 'OK',
    confidence: 0.96,
    aiComment: 'X1-X2間の通り芯間隔が正確です（4800mm）',
    userAction: 'pending',
    userComment: '',
    evidenceFile: 'file-1',
    evidencePage: 1,
    boundingBox: { x: 180, y: 220, width: 260, height: 160 },
  },
  {
    id: 'finding-6',
    jobId: 'job-001',
    type: '基礎梁配筋',
    aiJudgment: 'NG',
    confidence: 0.71,
    aiComment: 'F1基礎梁（X2-Y1からX3-Y1）の主筋配置が不明確です。要確認',
    userAction: 'pending',
    userComment: '',
    evidenceFile: 'file-2',
    evidencePage: 2,
    boundingBox: { x: 140, y: 260, width: 220, height: 170 },
  },
  {
    id: 'finding-7',
    jobId: 'job-001',
    type: '梁断面整合性',
    aiJudgment: 'OK',
    confidence: 0.94,
    aiComment: 'G1梁（X1-Y2からX3-Y2スパン）の断面寸法が一致しています（400×800）',
    userAction: 'confirmed',
    userComment: '',
    evidenceFile: 'file-1',
    evidencePage: 4,
    boundingBox: { x: 160, y: 240, width: 240, height: 150 },
  },
  {
    id: 'finding-8',
    jobId: 'job-001',
    type: '柱配筋整合性',
    aiJudgment: 'OK',
    confidence: 0.89,
    aiComment: 'C1柱（X1-Y1交点）の配筋パターンが一致しています（16-D25 + D10@100）',
    userAction: 'confirmed',
    userComment: '',
    evidenceFile: 'file-2',
    evidencePage: 3,
    boundingBox: { x: 130, y: 270, width: 270, height: 190 },
  },
  {
    id: 'finding-9',
    jobId: 'job-001',
    type: '通り芯間隔',
    aiJudgment: 'OK',
    confidence: 0.97,
    aiComment: 'Y軸方向の通り芯間隔が正確です（Y1-Y2: 6000mm, Y2-Y3: 6000mm）',
    userAction: 'pending',
    userComment: '',
    evidenceFile: 'file-1',
    evidencePage: 2,
    boundingBox: { x: 170, y: 230, width: 250, height: 165 },
  },
  {
    id: 'finding-10',
    jobId: 'job-001',
    type: '基礎レベル整合性',
    aiJudgment: 'NG',
    confidence: 0.81,
    aiComment: 'F1基礎（X2-Y2交点）の天端レベル表記が10mm異なります（構造: FL-500, 施工: FL-490）',
    userAction: 'pending',
    userComment: '',
    evidenceFile: 'file-1',
    evidencePage: 1,
    boundingBox: { x: 190, y: 210, width: 230, height: 155 },
  },
  {
    id: 'finding-11',
    jobId: 'job-001',
    type: 'スラブ厚整合性',
    aiJudgment: 'OK',
    confidence: 0.93,
    aiComment: '基礎スラブ厚が一致しています（150mm）',
    userAction: 'confirmed',
    userComment: '',
    evidenceFile: 'file-2',
    evidencePage: 4,
    boundingBox: { x: 145, y: 255, width: 265, height: 175 },
  },
  {
    id: 'finding-12',
    jobId: 'job-001',
    type: '梁主筋配筋',
    aiJudgment: 'OK',
    confidence: 0.91,
    aiComment: 'G2梁（X4-Y3からX5-Y3）の主筋配置が正確です（上筋: 4-D22, 下筋: 3-D22）',
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
