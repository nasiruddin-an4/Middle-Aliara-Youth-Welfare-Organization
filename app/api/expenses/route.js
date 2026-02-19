import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/lib/models/Expense";
import { isAuthenticated, hasPermission, ROLES } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    const filter = {};
    if (year) filter.year = parseInt(year);
    if (month) filter.month = parseInt(month);

    const expenses = await Expense.find(filter).sort({ date: -1 }).lean();
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    return NextResponse.json(
      { error: "খরচের ডাটা লোড করা যায়নি" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Assuming admins or payment admins can manage expenses
  if (!hasPermission(user, ROLES.PAYMENT_ADMIN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();
    const body = await request.json();

    // Ensure date is present (schema will handle year/month)
    if (!body.date) {
      body.date = new Date();
    }

    const expense = await Expense.create(body);
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "খরচ যোগ করা যায়নি" }, { status: 500 });
  }
}
