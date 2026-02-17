import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Member from "@/lib/models/Member";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const members = await Member.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    return NextResponse.json({ error: "ডাটা লোড করা যায়নি" }, { status: 500 });
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
    const member = await Member.create(body);
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "এই সদস্য আইডি ইতোমধ্যে বিদ্যমান" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "সদস্য যোগ করা যায়নি", details: error.message },
      { status: 500 },
    );
  }
}
