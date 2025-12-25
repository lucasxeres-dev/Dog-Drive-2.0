<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   ## Deploy to Vercel

The easiest way to deploy your app is to use the [Vercel Platform](https://vercel.com/new).

### Deployment Steps

1.  Push your code to GitHub (Done! ✅).
2.  Import your repository into Vercel.
3.  Configure the following **Environment Variables** in the Vercel project settings:
    *   `VITE_SUPABASE_URL`: Your Supabase URL.
    *   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
    *   `GEMINI_API_KEY`: Your Gemini API key.
4.  Click **Deploy**.

The project includes a `vercel.json` file which automatically handles Client-Side Routing for this Single Page Application (SPA).

