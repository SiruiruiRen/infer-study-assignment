# Deployment Guide for INFER Assignment Website

## Option 1: Deploy to Render (Recommended)

### Step 1: Create GitHub Repository

1. Go to GitHub and create a new repository named `infer-study-assignment`
2. Don't initialize with README (we already have files)
3. Copy the repository URL

### Step 2: Push to GitHub

```bash
cd infer-study-assignment
git remote add origin https://github.com/YOUR_USERNAME/infer-study-assignment.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Static Site**
3. Connect your GitHub account and select `infer-study-assignment` repository
4. Configure:
   - **Name**: `infer-study-assignment` (or your preferred name)
   - **Branch**: `main`
   - **Build Command**: (leave empty - it's a static site)
   - **Publish Directory**: `/` (root directory)
5. Click **Create Static Site**
6. Render will provide a URL like: `https://infer-study-assignment.onrender.com`

### Step 4: Update Study Group URLs

After deployment, update `app.js` with the actual Render URLs:

```javascript
const STUDY_GROUP_URLS = {
    'treatment_1': 'https://infer-study-alpha.onrender.com',
    'treatment_2': 'https://infer-study-beta.onrender.com',
    'control': 'https://infer-study-gamma.onrender.com'
};
```

Then commit and push:
```bash
git add app.js
git commit -m "Update study group URLs"
git push
```

## Option 2: Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. In the assignment directory: `vercel`
3. Follow the prompts
4. Update URLs in `app.js` and redeploy

## Option 3: Deploy to Netlify

1. Drag and drop the `infer-study-assignment` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect GitHub repository in Netlify dashboard
3. Update URLs in `app.js`

## Important Notes

- Make sure PDF files and images are accessible:
  - Copy `04_general_participant_information_and_information_on_data_protection_participants.pdf`
  - Copy `05_consent_form_participants.pdf`
  - Copy `University-of-Tubingen-01.png`
  - Copy `UNC_logo.avif`
  
  OR update the paths in `index.html` to point to the correct locations.

- The assignment website needs access to the same Supabase database as the study sites
- Make sure you've run the Supabase migrations before deploying
