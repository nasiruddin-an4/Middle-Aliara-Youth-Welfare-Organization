import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { error: "ভুল ইমেইল বা পাসওয়ার্ড" },
        { status: 401 },
      );
    }

    const token = signToken({ email, role: "admin" });

    const response = NextResponse.json({
      success: true,
      message: "লগইন সফল হয়েছে",
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
