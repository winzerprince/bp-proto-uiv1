---
applyTo: "**"
---

You are an expert UI/UX designer and frontend engineer. Your task is to create a Next.js mock application (frontend only, no backend) for a Blueprint Analysis Automation System used in the construction industry. Strictly follow the detailed UI/UX design instructions provided in the separate "design.instructions.md" file, which outlines layouts, components, user flows, and principles for all screens and features.

To understand existing components and client requirements from the two pilot versions, I used code execution to wget the HTML/docs from the pilot sites into a /samples folder, then analyze them for integration into the beta design, they are important references as they contain the core features, workflow, details and options needed for the beta version.

Implement the app entirely in Japanese language for consistency. Use mock data, fake delays, and placeholder APIs to simulate backend behavior, ensuring multi-tenancy, async processing, and role-based access.

Generate: Next.js folder structure, component definitions + code, page layouts with mock data, simulated backend via local JSON, design rationale, interactions and flows.

The output should be ready to paste into a Next.js 14 project (App Router) and immediately usable as a working mock prototype delployable for user testing on vercel.

Project Overview

We are developing a blueprint analysis application for the construction industry that uses AI to automate:

    Blueprint inspection (checking consistency between construction and structural drawings)
    BOM (Bill of Materials) creation from blueprints
    Blueprint search with AI-powered analysis

Target: Reduce manual inspection work from 720 hours/site to 50% through AI automation

Users: Blueprint inspectors, designers, project managers in construction companies

Platform: Web application (desktop-optimized, >1024px, Japanese language)
Your Task

Create UI/UX design mockups (Figma or prototype site) for the beta version of this application.
Reference: Pilot Versions

We have two pilot versions that you can access to understand the current workflow:

Message from Wakisaka-san (Pilot Version Developer)

    "This pilot version was developed quickly by an engineer who is not a UI/UX specialist, so there are likely many design considerations that were overlooked. Please use it only as a starting point for your UX design, not as a definitive reference. We expect you to create a Figma mockup or prototype site that is significantly better than this starting point."

Pilot Version 1: Mock (node-2)

Applications: Blueprint digitization / Inspection / BOM

Access Steps:

    Connect to VPN: You need VPN access to DATAGRID's on-premise server first
    SSH Port Forwarding: After VPN connection, run:

    ssh -L 8080:localhost:8080 developer@192.168.3.93

    Access:
        Mock GUI: http://localhost:8080
        API specs:
            http://localhost:8080/docs/auto-bom/bbf-api/index.html
            http://localhost:8080/docs/auto-bom/ai-service-api/index.html
            http://localhost:8080/docs/auto-inspection/bbf-api/index.html
            http://localhost:8080/docs/auto-inspection/ai-service-api/index.html
            http://localhost:8080/docs/bp-search/bbf-api/index.html
            http://localhost:8080/docs/bp-search/ai-service-api/index.html

Pilot Version 2: Prototype (node-3)

Application: BP Scan (Blueprint digitization)

Access Steps:

    Connect to VPN
    SSH Port Forwarding: After VPN connection, run:

    ssh -L 3000:localhost:3000 \
        -L 8000:localhost:8000 \
        -L 8080:localhost:8080 \
        -L 9000:localhost:9000 \
        -L 9001:localhost:9001 \
        developer@192.168.3.96

    Access:
        Frontend: http://localhost:3000
        Backend API spec (ReDoc): http://localhost:8080/redoc
        AI API spec (ReDoc): http://localhost:8000/redoc

Important: The pilot versions show the basic workflow, but the beta version needs significant enhancements listed below.
What's New in Beta Version

The beta version must support production use with these critical additions:

1. Multi-Tenancy & Multi-User

   Multiple companies (tenants) can use the same system with complete data isolation
   User management with login/logout
   Role-based access control:
   General User: Regular users from client companies
   Tenant Admin: Administrator users from client companies (can manage users within their company)
   System Admin: DATAGRID personnel who manage the entire system

2. Enhanced File Support

   PDF (multi-page)
   PNG, JPEG, TIFF, BMP
   Automatic PNG conversion for AI processing

3. Async Job Processing

   Job queue system with real-time status tracking
   Progress visualization (0-100%)
   Job status flow: created → file_uploading → ready → processing → completed/failed

4. Task Management

Three main task types:

    INSPECTION (自動検図): Compare drawings and detect inconsistencies - Priority Stream: Apparel Image Generation Service #1
    BOM (自動BOM生成): Extract parts list from blueprints - Priority Stream: Melody Generation Prototype App #2
    SEARCH (図面検索): Search and analyze blueprints - Priority Stream: Background Compositing Workflow #3

Main Screens to Design

Please design mockups for these core screens (approximately 10-15 screens):

Note: The screens listed below are organized by functionality. Feel free to merge or split screens as needed for better UX. For example, you might combine file upload into the job creation screen, or split complex screens into multiple steps.

    Login - User authentication
    Job List - View all jobs with filters (status, task type, date)
        Alternative approach: You may create separate job list screens per task type (Inspection Jobs, BOM Jobs, Search Jobs) if it improves navigation. In that case, the filter would focus on detailed task names within each category instead of task type.
    Job Creation - Create new job with task selection and custom fields
    File Upload - Drag & drop file upload with progress display
    Job Detail - View job status, files, and progress
    Task Result Review (focus on INSPECTION):
        Results table with filtering and sorting
        Blueprint viewer with evidence overlay (bounding boxes)
        Split-pane layout (viewer + results)
    Bulk Confirmation - Confirm multiple high-confidence items at once
    Export - Export results to Excel/CSV
    User Management (admin) - Manage users and roles
    Tenant Settings (admin) - Configure tenant-specific settings

Key User Flows to Design

Focus on these main workflows:
Flow 1: "Upload and Execute" Workflow

Login → Job List → Create Job → Select Task Type → Upload Files
→ Auto Processing Starts → View Progress → Review Results
→ Confirm/Mark for Fix → Export

Flow 2: Inspection Result Review

Job Detail (completed) → Open Results → View Findings Table
→ Click Finding → Jump to Evidence in Blueprint Viewer
→ Confirm or Mark as "Needs Fix" → Add Comments

Flow 3: Bulk Confirmation

Results Table → Set Confidence Threshold (e.g., >90%)
→ Preview Items to Confirm → Execute Bulk Confirmation
→ Review Remaining Low-Confidence Items

Design Guidelines
UI State: Inspection Results

The inspection results table should show:

    Finding type (e.g., dimensional consistency, grid line consistency)
    AI judgment: OK / NG / WARNING (color-coded)
    AI confidence: 0.0-1.0 (percentage display)
    AI comment: Explanation of the judgment
    User action: 未確認 (needs review) / 確認済み (confirmed) / 要修正 (needs fix)
    User comment: Optional notes

UI State: Job Status

Color-coded status badges (feel free to adjust colors as needed):

    作成済み (created): Gray (example)
    アップロード中 (file_uploading): Blue (example)
    準備完了 (ready): Light blue (example)
    処理中 (processing): Orange (example) - show progress bar
    完了 (completed): Green (example)
    失敗 (failed): Red (example) - show error message

Design Principles

    Professional & Clean: Construction industry professionals prefer minimal, focused UI
    Task-Oriented: Optimize for repetitive review tasks
    Evidence-First: Bounding boxes and evidence should be visually prominent
    Desktop-Optimized: Use split-pane layouts (blueprint viewer on one side, results table on the other)

Deliverables
