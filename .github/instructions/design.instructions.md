---
applyTo: "**"
---

### Overall Design Approach

The UI/UX design for this blueprint analysis application adopts a modern, professional dashboard-style interface inspired by proven enterprise tools like Asana, Jira, or Autodesk's construction management software (e.g., BIM 360). These patterns emphasize task-oriented workflows, hierarchical navigation, and data-dense views optimized for desktop users (>1024px width). The design prioritizes minimalism with a clean, neutral color palette (primary: deep blue #004080 for accents; secondary: gray #6B7280 for text; success: green #10B981; warning: yellow #F59E0B; error: red #EF4444; backgrounds: white/off-white #F9FAFB) to evoke trust and focus in the construction industry. Typography uses sans-serif fonts (e.g., Noto Sans JP for Japanese support) with clear hierarchy (headings: bold 18-24px; body: 14px).

The app is fully responsive but desktop-optimized, using split-pane layouts for efficiency (e.g., left: lists/tables; right: viewers/details). Navigation follows a sidebar pattern for quick access, with top headers for global actions (e.g., user profile, logout). All labels and text are in Japanese, with English equivalents noted here for clarity. Multi-tenancy ensures data isolation via tenant-specific dashboards; role-based access hides irrelevant features (e.g., System Admins see all tenants). Asynchronous processing uses real-time updates via WebSockets (simulated in mockups with progress bars). Modern patterns include:

- **Material Design-inspired components**: Cards for jobs, tables with sorting/filtering, modals for confirmations.
- **Progressive disclosure**: Hide advanced options until needed (e.g., expand job details).
- **Accessibility**: High contrast, keyboard navigation, ARIA labels.
- **Error handling**: Inline notifications with undo options.

The "homepage" post-login is the Job List screen, acting as a central dashboard. I'll describe layouts using a top-down approach: header, sidebar, main content, footers (if any). Each screen includes key components, their locations, and how they support user stories (flows).

### Global Layout Structure

- **Header (Top Bar)**: Fixed at the top (height: 64px). Left: App logo and tenant name (e.g., "Company X Blueprint AI"). Center: Search bar for quick job lookup. Right: User avatar dropdown (profile, settings, logout), notifications bell (for job updates), and role indicator (e.g., "Tenant Admin").
- **Sidebar (Left Navigation)**: Collapsible (width: 240px expanded, 64px collapsed). Top: Main sections (Jobs, Tasks, Admin if applicable). Icons with labels (e.g., Home icon for Job List). Bottom: Help/Feedback link.
- **Main Content Area**: Flexible width (fills remaining space). Uses grid or flexbox for responsive panels.
- **Footer**: Minimal, with version info and copyright (bottom-fixed if needed).
- **Modals/Overlays**: Used for creations, confirmations (e.g., centered, with backdrop).

### Screen Descriptions

#### 1. Login Screen

**Layout**: Full-screen centered form (max-width: 400px) on a subtle gradient background (blue to white) for a professional welcome. No sidebar/header yet.

- **Top**: App logo and title ("Blueprint Analysis App" in Japanese).
- **Center**: Form fields – Email/Username (text input), Password (secure input), "Remember Me" checkbox. Below: Login button (primary blue). Links for "Forgot Password?" and "Contact Support".
- **Bottom**: Tenant selector dropdown (for multi-tenant login, pre-filled if detected).
  **User Story Support**: Simple entry point for Flow 1. Validates credentials securely; on success, redirects to Job List. Error messages inline (red text).

#### 2. Job List Screen (Homepage/Dashboard)

**Layout**: Sidebar visible. Main content: Top section for quick stats (cards); bottom: data table.

- **Top (Hero Section)**: Three metric cards (e.g., "Active Jobs: 15" in green, "Completed This Week: 42" in blue, "Average Processing Time: 45min" in gray). Right: "Create New Job" button (prominent blue).
- **Center (Main Table)**: Responsive table with columns: Job ID, Task Type (INSPECTION/BOM/SEARCH with icons), Status (color-coded badge, e.g., green "完了"), Date Created, Progress (bar for processing jobs), Actions (view/edit/delete icons).
  - Filters: Above table – Dropdowns for status, task type, date range; search input for keywords.
  - Sorting: Clickable headers (e.g., sort by date descending by default).
  - Pagination: Bottom, with 10/25/50 rows per page.
- **Alternative Approach (if split by task type)**: Tabs above table ("Inspection Jobs", "BOM Jobs", "Search Jobs"). Filters adapt (e.g., in Inspection: filter by finding type).
  **User Story Support**: Central hub for Flow 1 (view all jobs → create new). Supports repetitive tasks with quick filters; real-time updates refresh table without reload. For admins, add tenant filter.

#### 3. Job Creation Screen

**Layout**: Modal or full-page (accessed via "Create New Job" button). Split into steps if complex (wizard pattern with progress stepper: Step 1: Task Select, Step 2: Details, Step 3: Upload).

- **Left (Form Section, 60% width)**: Task Type selector (radio cards: INSPECTION with description "Compare drawings...", BOM "Extract parts...", SEARCH "Analyze blueprints..."). Below: Custom fields (e.g., Job Name input, Description textarea, Priority dropdown).
- **Right (Preview/Summary, 40% width)**: Live preview of selected task (e.g., sample output mockup).
- **Bottom**: "Next" or "Create & Upload" button.
  **User Story Support**: Part of Flow 1. Guides users through selection; validates inputs (e.g., required fields highlighted). On submit, creates job in "created" status and transitions to File Upload.

#### 4. File Upload Screen

**Layout**: Integrated into Job Creation as a step or separate modal/full-page. Drag-and-drop zone centered.

- **Center**: Large drop zone (dashed border, "Drag files here or click to browse"). Supported formats listed (PDF multi-page, PNG/JPEG/TIFF/BMP). Progress bars for each file (e.g., "Uploading file1.pdf: 45%").
- **Bottom**: File list table (name, size, status). "Convert to PNG" toggle for AI processing. "Start Processing" button (disabled until uploads complete).
- **Notifications**: Inline success/error (e.g., green toast "Upload complete").
  **User Story Support**: Seamless in Flow 1. Handles async uploads; auto-converts files. On completion, job status updates to "file_uploading" → "ready".

#### 5. Job Detail Screen

**Layout**: Split-pane. Left: Overview; Right: Files/Progress.

- **Left (50% width)**: Job metadata card (ID, Type, Status badge with progress bar if "processing"). Below: Timeline of status changes (vertical stepper: created → uploading → etc.).
- **Right (50% width)**: File viewer (thumbnails/list with download links). If completed, "View Results" button.
- **Top Actions**: Edit, Delete, Refresh buttons.
  **User Story Support**: Monitors Flow 1 progress. Real-time polling updates status; errors show detailed messages (e.g., red banner "Failed: Invalid file format").

#### 6. Task Result Review Screen (Focused on INSPECTION; Adaptable for BOM/SEARCH)

**Layout**: Desktop-optimized split-pane for evidence-first design.

- **Left (60% width, Blueprint Viewer)**: Interactive viewer (zoom/pan tools). Overlays bounding boxes on inconsistencies (clickable, color-coded: green OK, red NG, yellow WARNING). Toolbar: Toggle layers, jump to page (for multi-page PDFs).
- **Right (40% width, Results Table)**: Data table with columns: Finding Type, AI Judgment (badge), Confidence (progress bar/percentage), AI Comment, User Action (dropdown: 未確認/確認済み/要修正), User Comment (editable field).
  - Filters/Sorting: Top – Confidence slider, type dropdown, search.
  - Bulk actions: Checkbox selection → "Bulk Confirm" button.
- **Bottom**: Comments section (textarea for overall notes).
  **User Story Support**: Core of Flow 2. Clicking a table row jumps viewer to evidence (smooth scroll/zoom). Supports repetitive reviews with keyboard shortcuts (e.g., arrow keys for navigation). For BOM/SEARCH: Adapt table to parts list or search results (e.g., matched blueprints with snippets).

#### 7. Bulk Confirmation Screen

**Layout**: Modal overlay on Results Review.

- **Top**: Confidence threshold slider (e.g., ">90%") with preview count ("45 items match").
- **Center**: Preview table of selected items (subset of results table).
- **Bottom**: "Confirm All" button (green), "Cancel" (gray). Post-action: Toast notification "45 items confirmed".
  **User Story Support**: Optimizes Flow 3 for efficiency. Filters low-confidence items post-confirmation, reducing manual work.

#### 8. Export Screen

**Layout**: Modal from Results/Job Detail.

- **Center**: Format selector (Excel/CSV), options (e.g., include images? Filter by confirmed only?).
- **Bottom**: "Export" button; progress indicator.
  **User Story Support**: End of Flows 1-3. Downloads file directly; emails link if large.

#### 9. User Management Screen (Admin-Only)

**Layout**: Sidebar link under "Admin". Main: Table of users.

- **Top**: "Add User" button (modal form: Name, Email, Role dropdown – General/Tenant Admin).
- **Center**: Table columns: Name, Email, Role, Status (active/inactive), Actions (edit/delete).
- **Filters**: Role, search.
  **User Story Support**: For Tenant/System Admins. Ensures role-based access; System Admins add tenant selector.

#### 10. Tenant Settings Screen (Admin-Only)

**Layout**: Form-based page.

- **Sections**: Accordion panels – General (name, logo upload), Notifications (email prefs), Custom Fields (add task-specific fields).
- **Bottom**: Save button.
  **User Story Support**: Customizes per tenant; hidden for General Users.

### Key User Flows with Orientation

**Flow 1: Upload and Execute**: Start at Login → Redirect to Job List (homepage orientation: "Welcome, [User]. Here's your dashboard."). Click "Create New Job" → Wizard guides task selection/upload. Auto-processes; monitor in Job Detail (progress bar orients "30% - Analyzing..."). End at Results Review → Export. Total steps: 5-7, with breadcrumbs for back navigation.

**Flow 2: Inspection Result Review**: From Job List/Detail (completed job) → Click "View Results". Split-pane orients "Left: Visualize evidence; Right: Review findings." Click finding → Viewer jumps (visual cue: highlight box). Update actions inline; save auto-saves.

**Flow 3: Bulk Confirmation**: In Results Review → Select items or use threshold → Modal previews/orients "Previewing X items above Y%." Confirm → Table refreshes, focusing remaining items.

This design reduces cognitive load, aligns with construction pros' needs for speed/accuracy, and scales for beta production use. Total screens: 10 core, with modals for efficiency. For prototypes, use Figma with these layouts as frames.
