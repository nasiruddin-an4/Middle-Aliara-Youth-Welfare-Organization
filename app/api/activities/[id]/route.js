import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Activity from "@/lib/models/Activity";
import { isAuthenticated } from "@/lib/auth";

// GET — single activity
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const activity = await Activity.findById(id);
    if (!activity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// PUT — update activity (admin only)
export async function PUT(request, { params }) {
  const auth = isAuthenticated(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const activity = await Activity.findByIdAndUpdate(id, body, { new: true });
    if (!activity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// DELETE — delete activity (admin only)
export async function DELETE(request, { params }) {
  const auth = isAuthenticated(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const activity = await Activity.findByIdAndDelete(id);
    if (!activity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
