<!-- Smart Bookmark App -->

A simple, real-time bookmark manager built with Next.js (App Router), Supabase, and Tailwind CSS.

<!-- Problems Faced & Solutions -->

1. Google OAuth Integration
   Problem: Setting up Google OAuth with Supabase required configuring credentials and redirect URIs correctly.
   Solution: Followed Supabase docs to set up Google as an Auth provider, ensured the redirect URI matched Vercel/localhost, and tested login/logout flows.

2. Real-time Bookmark Updates
   Problem: Ensuring bookmarks update in real-time across multiple tabs.
   Solution: Used Supabase’s real-time subscriptions to listen for changes in the bookmarks table, updating the UI instantly when bookmarks are added or deleted.

3. Bookmark Privacy
   Problem: Preventing users from seeing others’ bookmarks.
   Solution: Bookmarks are stored with a user ID. All queries filter by the authenticated user’s ID, and Supabase Row Level Security (RLS) policies enforce privacy at the database level.

4. Deleting Only Own Bookmarks
   Problem: Users should only be able to delete their own bookmarks.
   Solution: The delete action checks the user ID before allowing deletion, and RLS policies in Supabase prevent unauthorized deletions.

5. Deployment Issues
   Problem: Environment variables and OAuth redirect URIs differed between local and Vercel deployments.
   Solution: Set up environment variables in Vercel dashboard and updated Google OAuth settings to include the Vercel URL.
