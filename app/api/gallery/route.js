import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gallery from "@/lib/models/Gallery";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const photos = await Gallery.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: photos });
  } catch (error) {
    return NextResponse.json(
      { error: "গ্যালারি লোড করা যায়নি" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const photo = await Gallery.create(body);
    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "ছবি যোগ করা যায়নি" }, { status: 500 });
  }
}
