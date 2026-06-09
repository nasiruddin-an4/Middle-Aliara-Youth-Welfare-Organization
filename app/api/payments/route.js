import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/lib/models/Payment";
import Member from "@/lib/models/Member";
import { isAuthenticated, hasPermission, ROLES } from "@/lib/auth";
import { sendReceiptEmail } from "@/lib/emailService";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const memberId = searchParams.get("memberId");

    const filter = {};
    if (year) filter.year = parseInt(year);
    if (month) filter.month = parseInt(month);
    if (memberId) filter.memberId = memberId;

    const payments = await Payment.find(filter)
      .sort({ year: -1, month: -1 })
      .lean();

    const memberIds = [...new Set(payments.map((p) => p.memberId))];
    const members = await Member.find({ memberId: { $in: memberIds } })
      .select("memberId name image")
      .lean();

    const memberMap = {};
    members.forEach((m) => {
      memberMap[m.memberId] = {
        name: m.name,
        image: m.image || "",
      };
    });

    const enrichedPayments = payments.map((p) => ({
      ...p,
      memberName: memberMap[p.memberId]?.name || "Unknown",
      memberImage: memberMap[p.memberId]?.image || "",
    }));

    return NextResponse.json({ success: true, data: enrichedPayments });
  } catch (error) {
    return NextResponse.json(
      { error: "পেমেন্ট ডাটা লোড করা যায়নি" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  /* 34 */ const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(user, ROLES.PAYMENT_ADMIN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const payment = await Payment.create(body);

    // Send email receipt asynchronously
    try {
      const member =
        (await Member.findOne({ memberId: body.memberId })) ||
        (await Member.findById(body.memberId));
      if (member) {
        await sendReceiptEmail(member, payment);
      }
    } catch (emailError) {
      console.error("Failed to send receipt email:", emailError);
      // We don't fail the request if email fails, just log it
    }

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "এই মাসে এই সদস্যের পেমেন্ট ইতোমধ্যে রেকর্ড করা হয়েছে" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "পেমেন্ট যোগ করা যায়নি" },
      { status: 500 },
    );
  }
}
