import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email confirmation links land here, swap the code for a session, then continue.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/vehicles`);
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("That confirmation link is invalid or has expired. Try logging in or register again.")}`,
  );
}
