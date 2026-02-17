import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/lib/models/Payment";
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
    const payment = await Payment.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!payment) {
      return NextResponse.json(
        { error: "পেমেন্ট পাওয়া যায়নি" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: payment });
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
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      return NextResponse.json(
        { error: "পেমেন্ট পাওয়া যায়নি" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      message: "পেমেন্ট মুছে ফেলা হয়েছে",
    });
  } catch (error) {
    return NextResponse.json({ error: "মুছে ফেলা যায়নি" }, { status: 500 });
  }
}
