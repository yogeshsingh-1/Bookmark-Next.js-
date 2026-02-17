"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

interface BookmarkListProps {
  userId: string;
}

export default function BookmarkList({ userId }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBookmarks(data);
      }
      setLoading(false);
    };

    fetchBookmarks();

    // Real-time subscription
    const channel = supabase
      .channel(`bookmarks-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, supabase]);



  const handleDelete = async (id: string) => {
    setDeleting(id);

    // Optimistic UI: turant remove karo
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    try {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id);
      if (error) {
        console.error("Delete failed:", error);
        // Revert in case of error
        const { data } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        setBookmarks(data || []);
      }
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading bookmarks...</p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 text-lg">
          No bookmarks yet. Add one above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold text-gray-900 px-2">
        Your Bookmarks ({bookmarks.length})
      </h3>
      <div className="grid gap-3">
        {bookmarks.map((bookmark) => (
          <a
            key={bookmark.id}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 group"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-blue-600 group-hover:text-blue-800 truncate">
                  {bookmark.title}
                </h4>
                <p className="text-sm text-gray-500 truncate">{bookmark.url}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(bookmark.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(bookmark.id);
                }}
                disabled={deleting === bookmark.id}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 transition text-sm font-medium whitespace-nowrap"
              >
                {deleting === bookmark.id ? "..." : "Delete"}
              </button>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}