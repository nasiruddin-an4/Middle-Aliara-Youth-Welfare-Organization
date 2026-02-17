import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gallery from "@/lib/models/Gallery";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(request, { params }) {
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const photo = await Gallery.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!photo) {
      return NextResponse.json({ error: "ছবি পাওয়া যায়নি" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: photo });
  } catch (error) {
    return NextResponse.json({ error: "আপডেট করা যায়নি" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const photo = await Gallery.findByIdAndDelete(id);
    if (!photo) {
      return NextResponse.json({ error: "ছবি পাওয়া যায়নি" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "ছবি মুছে ফেলা হয়েছে",
    });
  } catch (error) {
    return NextResponse.json({ error: "মুছে ফেলা যায়নি" }, { status: 500 });
  }
}
