import { NextResponse } from "next/server";
import { signToken, ROLES } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const admins = [
      {
        email: process.env.ADMIN_SUPER_EMAIL,
        password: process.env.ADMIN_SUPER_PASSWORD,
        role: ROLES.SUPER_ADMIN,
      },
      {
        email: process.env.ADMIN_MEMBER_EMAIL,
        password: process.env.ADMIN_MEMBER_PASSWORD,
        role: ROLES.MEMBER_ADMIN,
      },
      {
        email: process.env.ADMIN_PAYMENT_EMAIL,
        password: process.env.ADMIN_PAYMENT_PASSWORD,
        role: ROLES.PAYMENT_ADMIN,
      },
      {
        email: process.env.ADMIN_VIEWER_EMAIL,
        password: process.env.ADMIN_VIEWER_PASSWORD,
        role: ROLES.VIEWER,
      },
    ];

    const admin = admins.find(
      (a) => a.email === email && a.password === password,
    );

    if (!admin) {
      return NextResponse.json(
        { error: "ভুল ইমেইল বা পাসওয়ার্ড" },
        { status: 401 },
      );
    }

    const token = signToken({ email: admin.email, role: admin.role });

    const response = NextResponse.json({
      success: true,
      message: "লগইন সফল হয়েছে",
      role: admin.role,
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
