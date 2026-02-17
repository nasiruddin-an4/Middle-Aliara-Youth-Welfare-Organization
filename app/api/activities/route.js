import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Activity from "@/lib/models/Activity";
import { isAuthenticated, hasPermission, ROLES } from "@/lib/auth";

// GET — public list of activities
export async function GET() {
  try {
    await connectDB();
    const activities = await Activity.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST — admin only, create activity
export async function POST(request) {
  /* 22 */ const auth = isAuthenticated(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(auth, ROLES.SUPER_ADMIN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const activity = await Activity.create(body);
    return NextResponse.json(
      { success: true, data: activity },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
