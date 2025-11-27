import RedirectTo from '@/components/RedirectTo';

// BP Scan - Blueprint scanning and tagging task
export default function ScanPage() {
  return <RedirectTo to="/jobs?type=SCAN" />;
}
