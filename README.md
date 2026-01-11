# INFER Study Assignment Website

This website handles the initial assignment of students to study groups (Alpha, Beta, or Gamma) before they access the main study sites.

## Features

1. **Data Protection & Consent Form**: Students must read and agree to data protection and consent forms
2. **ID Collection**: Collects student ID and anonymous ID (participant code)
3. **Group Assignment**: 
   - Checks if student is already assigned (in `student_assignments` table)
   - If not assigned, randomly assigns to one of three groups:
     - `treatment_1` → Alpha site (INFER + Tutorial)
     - `treatment_2` → Beta site (INFER Only)
     - `control` → Gamma site (Simple Feedback)
4. **Automatic Redirect**: Redirects students to their assigned study site

## Setup

### 1. Update Supabase Configuration

Edit `app.js` and update:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key

### 2. Update Study Group URLs

Edit `app.js` and update `STUDY_GROUP_URLS` with your actual deployed URLs:
```javascript
const STUDY_GROUP_URLS = {
    'treatment_1': 'https://your-alpha-site.onrender.com',
    'treatment_2': 'https://your-beta-site.onrender.com',
    'control': 'https://your-gamma-site.onrender.com'
};
```

### 3. Run Supabase Migrations

Before deploying, run these SQL migrations in your Supabase SQL editor:

1. `../SHARED_SUPABASE_MIGRATION_ADD_STUDENT_ID.sql` - Adds student_id and anonymous_id columns
2. `../SHARED_SUPABASE_MIGRATION_ADD_ASSIGNMENT_TABLE.sql` - Creates the student_assignments table

### 4. Copy Required Files

**Option A: Copy files to assignment directory (Recommended for deployment)**

Copy these files from the parent directory into `infer-study-assignment/`:
- `04_general_participant_information_and_information_on_data_protection_participants.pdf`
- `05_consent_form_participants.pdf`
- `University-of-Tubingen-01.png`
- `UNC_logo.avif`

Then update `index.html` to remove the `../` prefix from the file paths.

**Option B: Keep files in parent directory**

If files stay in the parent directory, update paths in `index.html` to point to the correct location (e.g., use absolute URLs or relative paths that work from your deployment).

## Deployment

Deploy as a static site to:
- Render.com
- Vercel
- Netlify
- Or any static hosting service

## Workflow

1. Student visits assignment website
2. Reads data protection document and consent form
3. Enters student ID and anonymous ID
4. System checks `student_assignments` table:
   - If exists: Uses existing assignment
   - If not: Randomly assigns to one of three groups and saves to database
5. Redirects to appropriate study site (alpha/beta/gamma)

## Database Schema

The assignment website uses the `student_assignments` table:

```sql
CREATE TABLE student_assignments (
    id UUID PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,
    anonymous_id TEXT,
    treatment_group TEXT NOT NULL,  -- 'treatment_1', 'treatment_2', or 'control'
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
