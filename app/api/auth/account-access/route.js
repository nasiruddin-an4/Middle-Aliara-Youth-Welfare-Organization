import { NextResponse } from "next/server";
import { signToken, verifyToken } from "@/lib/auth";

const ACCESS_PASSWORD =
  process.env.ACCOUNT_ACCESS_PASSWORD || "aliara@2026!";

export async function GET(request) {
  const token = request.cookies.get("account_access_token")?.value;
  if (!token) return NextResponse.json({ accessed: false });

  const payload = verifyToken(token);
  if (payload && payload.type === "account_access") {
    return NextResponse.json({ accessed: true });
  }
  return NextResponse.json({ accessed: false });
}

export async function POST(request) {
  try {
    const { password } = await request.json();
    if (password === ACCESS_PASSWORD) {
      const token = signToken({ type: "account_access" });
      const response = NextResponse.json({ success: true });
      response.cookies.set("account_access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
      return response;
    }
    return NextResponse.json({ error: "ভুল পাসওয়ার্ড" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
