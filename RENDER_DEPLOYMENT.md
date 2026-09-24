# Deployment Guide: INTEL Dashboard (Render + Supabase)

This guide explains how to deploy the INTEL Dashboard using a ₹0 budget architecture.

## 1. Database Setup (Supabase Free Tier)

1. Go to [Supabase](https://supabase.com) and create a new project.
2. Under **Database > SQL Editor**, run the SQL schema provided in `architecture_proposal.md`.
3. Go to **Project Settings > API** and copy:
   - `Project URL` (This is your `NEXT_PUBLIC_SUPABASE_URL`)
   - `service_role secret` (This is your `SUPABASE_SERVICE_ROLE_KEY`)
   - **CRITICAL**: Never expose the `service_role secret` to the frontend.

## 2. AI Setup (Google Gemini)

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create a new API Key. (This is your `AI_API_KEY`).
3. The Gemini 1.5/2.0 Flash models have a generous free tier suitable for this workload.

## 3. Web Hosting Setup (Render Free Tier)

1. Push your code to a GitHub repository.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables**: Add all variables from your `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_API_KEY`
   - `CRON_SECRET_TOKEN` (Generate a random secure string for this)

## 4. Setting up the Ingestion CRON

To trigger the automated intelligence pipeline without paying for compute:

1. In Render, create a new **Cron Job** (if within free tier) OR use GitHub Actions.
2. **GitHub Actions Approach** (Always Free):
   Create `.github/workflows/ingest.yml`:
   ```yaml
   name: INTEL Ingestion Pipeline
   on:
     schedule:
       - cron: '0 * * * *' # Runs every hour
   jobs:
     ingest:
       runs-on: ubuntu-latest
       steps:
         - name: Trigger Ingest API
           run: curl -X POST -H "Authorization: Bearer \${{ secrets.CRON_SECRET_TOKEN }}" https://your-render-app.onrender.com/api/ingest
         - name: Trigger AI Processing API
           run: curl -X POST -H "Authorization: Bearer \${{ secrets.CRON_SECRET_TOKEN }}" https://your-render-app.onrender.com/api/process
   ```
3. Add `CRON_SECRET_TOKEN` to your GitHub repository secrets.

## Security Audit Checklist Before Launch
- [ ] Ensure `.env.local` is in `.gitignore` (it is by default in Next.js).
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is not prefixed with `NEXT_PUBLIC_`.
- [ ] Verify Supabase Row Level Security (RLS) is enabled if any client-side queries are ever added.
