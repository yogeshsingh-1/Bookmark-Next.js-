# Smart Bookmark App - Setup Guide

A modern bookmark manager built with Next.js, Supabase, and Tailwind CSS. Save, organize, and sync your bookmarks in real-time with Google OAuth authentication.

## Features

✅ **Google OAuth Authentication** - Sign in securely with your Google account  
✅ **Add & Delete Bookmarks** - Manage your bookmark collection easily  
✅ **Real-time Sync** - Bookmarks update instantly across all tabs (WebSocket)  
✅ **Private by Default** - Your bookmarks are only visible to you  
✅ **Responsive Design** - Beautiful UI powered by Tailwind CSS  
✅ **Vercel Ready** - Deploy with zero configuration  

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Supabase (Google OAuth)
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Get your **Project URL** and **Anon Key** from Settings → API

### Step 2: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create an OAuth 2.0 credential (OAuth 2.0 Client IDs)
3. Add authorized redirect URIs:
   - For local: `http://localhost:3000/auth/callback`
   - For production: `https://your-vercel-domain.com/auth/callback`
4. Copy the Client ID and Client Secret
5. In Supabase, go to Authentication → Providers → Google
6. Enable Google provider and paste your credentials

### Step 3: Create Database Schema

1. In Supabase, go to SQL Editor
2. Copy and run the entire SQL from `supabase-schema.sql` file
3. This creates the bookmarks table with Row-Level Security (RLS) policies

### Step 4: Local Development

```bash
# Install dependencies
npm install

# Create .env.local with your Supabase credentials
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EOF

# Run development server
npm run dev
```

Visit `http://localhost:3000` and sign in with Google!

### Step 5: Deploy to Vercel

```bash
# Push to GitHub first
git add .
git commit -m "Initial commit"
git push origin main

# Deploy on Vercel
npm i -g vercel
vercel
```

In Vercel project settings, add your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Project Structure

```
.
├── app/
│   ├── auth/callback/route.ts    # OAuth callback handler
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main app page
├── components/
│   ├── BookmarkForm.tsx          # Add bookmark form
│   └── BookmarkList.tsx          # Bookmark list with real-time
├── lib/
│   ├── supabase-browser.ts       # Client-side Supabase
│   └── supabase-server.ts        # Server-side Supabase
├── middleware.ts                 # Next.js middleware
├── supabase-schema.sql          # Database schema & RLS
└── SETUP.md
```

## How It Works

1. **Authentication**: Users sign in via Google OAuth through Supabase
2. **Adding Bookmarks**: Bookmarks are stored in PostgreSQL with user_id
3. **Real-time Updates**: Supabase Realtime listens for DB changes and updates UI instantly
4. **Privacy**: Row-Level Security (RLS) policies ensure users only see their own bookmarks
5. **Deletion**: Users can delete their bookmarks with instant sync

## Features Explained

### Real-time Sync
The `BookmarkList` component subscribes to database changes using Supabase Realtime:
- New bookmarks appear instantly without page refresh
- Deletions are reflected immediately in all open tabs
- Uses WebSocket connections for optimal performance

### Row-Level Security (RLS)
Database policies ensure:
- Users can only SELECT, INSERT, DELETE their own bookmarks
- User_id is validated at the database level
- Even if auth is compromised, data remains secure

### OAuth Flow
1. User clicks "Sign In with Google"
2. Redirected to Google login
3. Google redirects back to `/auth/callback`
4. Callback exchanges code for session
5. Session is stored in Supabase cookies

## Troubleshooting

**Issue**: "Provider not found" error
- Solution: Check that Google OAuth is enabled in Supabase Authentication settings

**Issue**: Bookmarks not syncing in real-time
- Solution: Ensure Realtime is enabled for the `bookmarks` table in Supabase

**Issue**: Getting 401 Unauthorized errors
- Solution: Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct

**Issue**: OAuth redirect failing
- Solution: Add your Vercel domain to Google OAuth authorized redirect URIs

## Future Enhancements

- 🏷️ Add tag/category support
- 🔍 Search functionality  
- 📤 Import/export bookmarks
- 🌙 Dark mode toggle
- 📱 Mobile app
