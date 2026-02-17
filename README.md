# WATTS — AI Cycling Coach

Your personal cycling dashboard powered by real Intervals.icu data.

## What this does

- Pulls your training history, wellness and calendar from Intervals.icu
- Calculates CTL / ATL / TSB accurately from raw TSS data (no estimation)
- Shows your fitness curve with Calpe camp + race day projections
- Full training calendar with planned vs actual overlay
- Workout builder with interval designer — posts directly to Intervals.icu
- Adherence tracking

## Step-by-step deployment

### 1. Create a GitHub account
Go to https://github.com and sign up (free).

### 2. Create a new repository
- Click the green "New" button
- Name it `watts-cycling-coach`
- Leave it Public
- Click "Create repository"

### 3. Upload these files
- On your new empty repo page, click "uploading an existing file"
- Drag and drop ALL the files and folders from this zip
- Scroll down and click "Commit changes"

### 4. Create a Vercel account
Go to https://vercel.com and sign up with your GitHub account (free).

### 5. Deploy
- Click "Add New Project"
- Import your `watts-cycling-coach` repository
- Vercel will auto-detect Next.js — just click "Deploy"
- Wait ~60 seconds

### 6. Set environment variables
In your Vercel project → Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| INTERVALS_ATHLETE_ID | i98700 |
| INTERVALS_API_KEY | 3p6nu8zruicyer3lgvkufvpti |

Then go to Deployments → click the 3 dots → Redeploy.

### 7. You're live!
Your app is at `https://watts-cycling-coach.vercel.app`

## Athlete Profile

- **CP**: 240w (lab tested Feb 2026)
- **FTP**: 250w
- **VO₂max**: 57 ml/kg/min (lab tested Feb 2026)
- **Age**: 53

## Key dates

- Calpe camp: Feb 21 – Mar 2 (10 training days)
- Return: Mar 4
- First crit: Mar 8

## Phase 2 — AI Coach (coming next)

Once deployed, we add Claude API to power the coach chat.
You'll need a Claude API key from https://console.anthropic.com
