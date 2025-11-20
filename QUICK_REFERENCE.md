# Quick Reference Guide

## 🚀 Common Tasks

### Start Development
```bash
npm run dev
# Open http://localhost:3000
```

### Add New Page
```bash
# Create page
mkdir -p src/app/my-page
cat > src/app/my-page/page.js << 'EOF'
'use client';

import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';

export default function MyPage() {
  return (
    <MainLayout>
      <Card>
        <Card.Header>My Page Title</Card.Header>
        <Card.Content>
          <p>Page content here</p>
          <Button variant="primary">Action</Button>
        </Card.Content>
      </Card>
    </MainLayout>
  );
}
EOF
```

### Add Navigation Link
Edit `src/components/layout/index.js`:
```js
const navItems = [
  // ... existing items
  {
    icon: MdNewIcon,
    label: 'New Feature',
    href: '/my-page',
    matchType: null // or 'MY_TYPE' for filtered job list
  },
];
```

## 🎨 Component Usage

### Button Variants
```jsx
import { Button } from '@/components/ui';

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="metallic">Metallic</Button>

<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
```

### Card Variants
```jsx
import { Card } from '@/components/ui';

// Default card
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>Footer</Card.Footer>
</Card>

// Glassmorphic card
<Card variant="glass" hover>
  <Card.Content>Glass effect with hover</Card.Content>
</Card>

// Neumorphic card
<Card variant="neumorphic">
  <Card.Content>Neumorphic effect</Card.Content>
</Card>

// Elevated card
<Card variant="elevated" hover>
  <Card.Content>Elevated with shadow</Card.Content>
</Card>
```

### Form Components
```jsx
import { Input, Select, Textarea } from '@/components/ui';

// Input
<Input
  label="ジョブ名"
  placeholder="ジョブ名を入力"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  required
  error="エラーメッセージ" // shows red glow
/>

// Select
<Select
  label="タスクタイプ"
  value={type}
  onChange={(e) => setType(e.target.value)}
  required
>
  <option value="">選択してください</option>
  <option value="INSPECTION">検図</option>
  <option value="BOM">BOM生成</option>
  <option value="SEARCH">図面検索</option>
</Select>

// Textarea
<Textarea
  label="説明"
  placeholder="説明を入力"
  value={desc}
  onChange={(e) => setDesc(e.target.value)}
  rows={4}
/>
```

### Modal
```jsx
import { Modal } from '@/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Modal Title"
      >
        <p>Modal content here</p>
        
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            確認
          </Button>
        </div>
      </Modal>
    </>
  );
}
```

### Status Badges
```jsx
import { StatusBadge } from '@/components/ui';

<StatusBadge status="created">作成済み</StatusBadge>
<StatusBadge status="file_uploading">アップロード中</StatusBadge>
<StatusBadge status="ready">準備完了</StatusBadge>
<StatusBadge status="processing">処理中</StatusBadge>
<StatusBadge status="completed">完了</StatusBadge>
<StatusBadge status="failed">失敗</StatusBadge>
```

### Progress Bar
```jsx
import { ProgressBar } from '@/components/ui';

<ProgressBar value={45} max={100} variant="primary" />
<ProgressBar value={75} max={100} variant="success" />
<ProgressBar value={30} max={100} variant="warning" />
```

### Loading Spinner
```jsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />

// Centered in container
<div className="flex justify-center items-center h-64">
  <LoadingSpinner />
</div>
```

## 🌙 Dark Mode

### Use Theme in Component
```jsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <Button onClick={toggleTheme}>
        Toggle Theme
      </Button>
    </div>
  );
}
```

### Dark Mode Styles
```jsx
// Use dark: prefix for dark mode styles
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content adapts to theme
</div>
```

## 🔐 Authentication

### Use Auth Context
```jsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Check if user is logged in
  if (!user) {
    router.push('/');
    return null;
  }
  
  // Check user role
  const isAdmin = user.role === 'tenant_admin' || user.role === 'system_admin';
  
  return (
    <div>
      <p>Welcome, {user.name}</p>
      {isAdmin && <AdminPanel />}
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
```

## 🎯 Navigation

### Programmatic Navigation
```jsx
'use client';

import { useRouter } from 'next/navigation';

export default function MyComponent() {
  const router = useRouter();
  
  const handleClick = () => {
    // Navigate to route
    router.push('/jobs');
    
    // Navigate with query params
    router.push('/jobs?type=INSPECTION');
    
    // Navigate back
    router.back();
  };
  
  return <Button onClick={handleClick}>Go to Jobs</Button>;
}
```

### Get Query Parameters
```jsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function MyComponent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'INSPECTION', 'BOM', 'SEARCH'
  
  return <p>Current type: {type}</p>;
}
```

## 🎨 Custom Styles

### Tailwind Classes
```jsx
// Metallic gradient
<div className="bg-linear-to-r from-gray-300 via-gray-100 to-gray-300">
  Metallic effect
</div>

// Glassmorphic
<div className="bg-white/70 backdrop-blur-md border border-white/30">
  Glass effect
</div>

// Neumorphic
<div className="neumorphic">
  Neumorphic effect
</div>

// Glow
<div className="glow-primary">
  Primary glow
</div>

// Animations
<div className="animate-shimmer">Shimmer</div>
<div className="animate-glow-pulse">Glow pulse</div>
<div className="animate-float">Float</div>
```

### Custom CSS
```css
/* In your component or globals.css */

.my-custom-class {
  /* Use CSS variables for theme support */
  background: var(--background);
  color: var(--foreground);
  
  /* Use transform for animations (GPU-accelerated) */
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.my-custom-class:hover {
  transform: translateY(-2px);
}
```

## 📊 Mock Data

### Job List Mock
```jsx
const mockJobs = [
  {
    id: 'job-001',
    name: 'Project A - Phase 1',
    taskType: 'INSPECTION',
    status: 'completed',
    progress: 100,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'job-002',
    name: 'Project B - BOM Generation',
    taskType: 'BOM',
    status: 'processing',
    progress: 65,
    createdAt: '2024-01-16T14:20:00Z',
  },
  // ... more jobs
];
```

### Async Mock API
```jsx
// Simulate async operation
const fetchJobs = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
  return mockJobs;
};

// Usage
const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchJobs().then(data => {
    setJobs(data);
    setLoading(false);
  });
}, []);
```

## 🐛 Debugging

### Check Props
```jsx
// Add console.log
console.log('Component rendered:', { props, state });

// Use JSON.stringify for objects
console.log('Job data:', JSON.stringify(job, null, 2));
```

### React DevTools
```bash
# Install React DevTools extension in Chrome/Firefox
# Open DevTools → Components/Profiler tabs
```

### Network Requests
```bash
# Open DevTools → Network tab
# Filter by Fetch/XHR to see API calls
```

### Performance
```bash
# Open DevTools → Performance tab
# Record timeline while interacting
# Check for long tasks (>50ms)
```

## 📝 Code Snippets

### Responsive Table
```jsx
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Column 1
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Column 2
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {data.map((row) => (
        <tr key={row.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">{row.col1}</td>
          <td className="px-6 py-4 whitespace-nowrap">{row.col2}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Split Pane Layout
```jsx
<div className="flex h-screen">
  {/* Left pane */}
  <div className="w-1/2 overflow-auto border-r border-gray-200 p-6">
    <h2>Left Content</h2>
    {/* Table, list, etc. */}
  </div>
  
  {/* Right pane */}
  <div className="w-1/2 overflow-auto p-6">
    <h2>Right Content</h2>
    {/* Viewer, details, etc. */}
  </div>
</div>
```

### File Upload
```jsx
const [files, setFiles] = useState([]);

const handleDrop = (e) => {
  e.preventDefault();
  const droppedFiles = Array.from(e.dataTransfer.files);
  setFiles(prev => [...prev, ...droppedFiles]);
};

const handleSelect = (e) => {
  const selectedFiles = Array.from(e.target.files);
  setFiles(prev => [...prev, ...selectedFiles]);
};

return (
  <div
    onDrop={handleDrop}
    onDragOver={(e) => e.preventDefault()}
    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors"
  >
    <input
      type="file"
      id="file-upload"
      className="hidden"
      onChange={handleSelect}
      multiple
    />
    <label htmlFor="file-upload" className="cursor-pointer">
      <p>ファイルをドロップまたはクリックして選択</p>
    </label>
    
    {files.length > 0 && (
      <ul className="mt-4">
        {files.map((file, i) => (
          <li key={i}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
        ))}
      </ul>
    )}
  </div>
);
```

### Confirmation Dialog
```jsx
const [showConfirm, setShowConfirm] = useState(false);

const handleDelete = async () => {
  // Perform delete
  await deleteJob(jobId);
  setShowConfirm(false);
  router.push('/jobs');
};

return (
  <>
    <Button variant="danger" onClick={() => setShowConfirm(true)}>
      削除
    </Button>
    
    <Modal
      isOpen={showConfirm}
      onClose={() => setShowConfirm(false)}
      title="確認"
    >
      <p>このジョブを削除してもよろしいですか？</p>
      <p className="text-sm text-gray-500 mt-2">
        この操作は取り消せません。
      </p>
      
      <div className="flex gap-3 justify-end mt-6">
        <Button variant="ghost" onClick={() => setShowConfirm(false)}>
          キャンセル
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          削除
        </Button>
      </div>
    </Modal>
  </>
);
```

## 🔗 Useful Links

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Icons**: https://react-icons.github.io/react-icons/
- **Date-fns**: https://date-fns.org/ (for date formatting)

## 💡 Tips

### Performance
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to children
- Lazy load heavy components with `dynamic()`
- Optimize images with `next/image`

### Accessibility
- Add `aria-label` to icon-only buttons
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Ensure keyboard navigation works (Tab, Enter, Esc)
- Test with screen reader (macOS: VoiceOver, Cmd+F5)

### Japanese Language
- Always use Japanese for user-facing text
- Format dates with Japanese format: `YYYY年MM月DD日`
- Use proper Japanese punctuation (、。)
- Test with Japanese input methods

---

**Last Updated**: 2025-01-20
