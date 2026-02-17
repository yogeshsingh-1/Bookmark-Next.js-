"use client";

import { useEffect, useState, Suspense } from "react";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkList from "@/components/BookmarkList";
interface User {
  id: string;
  email: string;
}

// Lazy load Supabase to avoid build-time issues with env vars
const createSupabaseClient = async () => {
  const { createClient } = await import("@/lib/supabase-browser");
  return createClient();
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[OAuth] Initializing Supabase client...");
        const client = await createSupabaseClient();
        setSupabase(client);
        console.log("[OAuth] Supabase client initialized");

        const {
          data: { session },
        } = await client.auth.getSession();
        console.log(
          "[OAuth] Session retrieved:",
          session ? `User: ${session.user.email}` : "No session",
        );
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
          });
          console.log("[OAuth] User logged in:", session.user.email);
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
            });
          } else {
            setUser(null);
          }
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      } catch (err) {
        setError(
          "Failed to initialize authentication. Please check your Supabase configuration.",
        );
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Check for OAuth errors in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      if (error) {
        console.error("[OAuth] Error in URL:", error);
        const errorMessages: Record<string, string> = {
          exchange_failed:
            "Failed to exchange authentication code. Please try again.",
          unexpected:
            "An unexpected error occurred during login. Please try again.",
          access_denied: "You denied access to your Google account.",
        };
        setError(errorMessages[error] || `Authentication error: ${error}`);
        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    }
  }, []);

  const handleSignIn = async () => {
    console.log(supabase);
    if (!supabase) return;
    else {
      console.log(`suprabase does not handle`);
    }
    try {
      console.log("[OAuth] Initiating Google sign-in...");
      console.log(
        "[OAuth] Redirect URL:",
        `${window.location.origin}/auth/callback`,
      );
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      console.log("[OAuth] Sign-in initiated successfully");
    } catch (err: any) {
      console.error("[OAuth] Sign-in error:", err);
      setError("Failed to sign in. Please try again.");
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    try {
      console.log("[OAuth] Signing out...");
      await supabase.auth.signOut();
      setUser(null);
      console.log("[OAuth] Sign-out successful");
    } catch (err: any) {
      console.error("[OAuth] Sign-out error:", err);
      setError("Failed to sign out.");
    }
  };

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <p className="text-gray-600">
              Please make sure your Supabase URL and Anon Key are set in
              .env.local
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Smart Bookmarks</h1>
          {user && (
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          )}
        </div>

        {!user ? (
          // Login View
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Welcome to Smart Bookmarks
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in with Google to manage your bookmarks
            </p>
            <button
              onClick={handleSignIn}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Sign In with Google
            </button>
          </div>
        ) : (
          // App View
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-gray-700 mb-4">
                Welcome, <span className="font-semibold">{user.email}</span>
              </p>
              <BookmarkForm userId={user.id} />
            </div>
            <BookmarkList userId={user.id} />
          </div>
        )}
      </div>
    </main>
  );
}
