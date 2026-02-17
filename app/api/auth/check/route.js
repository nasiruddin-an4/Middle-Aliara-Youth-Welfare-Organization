import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request) {
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user });
}
