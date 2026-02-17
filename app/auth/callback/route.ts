import { createClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  console.log("[OAuth] Callback received");
  console.log("[OAuth] Code present:", !!code);
  console.log("[OAuth] Error:", error || "None");

  if (error) {
    console.error("[OAuth] Error from Google:", error);
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (code) {
    try {
      console.log("[OAuth] Exchanging code for session...");
      const supabase = await createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error("[OAuth] Exchange error:", exchangeError);
        return NextResponse.redirect(new URL(`/?error=exchange_failed`, request.url));
      }
      
      console.log("[OAuth] Session exchanged successfully");
      console.log("[OAuth] User:", data?.user?.email);
    } catch (err: any) {
      console.error("[OAuth] Unexpected error during exchange:", err);
      return NextResponse.redirect(new URL(`/?error=unexpected`, request.url));
    }
  }

  console.log("[OAuth] Redirecting to home...");
  return NextResponse.redirect(new URL("/", request.url));
}
