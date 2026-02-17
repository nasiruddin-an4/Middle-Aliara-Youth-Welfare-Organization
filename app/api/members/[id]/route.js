import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Member from "@/lib/models/Member";
import { isAuthenticated, hasPermission, ROLES } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const member = await Member.findById(id).lean();
    if (!member) {
      return NextResponse.json(
        { error: "সদস্য পাওয়া যায়নি" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  /* 23 */ const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(user, ROLES.MEMBER_ADMIN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const member = await Member.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!member) {
      return NextResponse.json(
        { error: "সদস্য পাওয়া যায়নি" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    return NextResponse.json({ error: "আপডেট করা যায়নি" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  /* 49 */ const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(user, ROLES.MEMBER_ADMIN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      return NextResponse.json(
        { error: "সদস্য পাওয়া যায়নি" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      message: "সদস্য মুছে ফেলা হয়েছে",
    });
  } catch (error) {
    return NextResponse.json({ error: "মুছে ফেলা যায়নি" }, { status: 500 });
  }
}
