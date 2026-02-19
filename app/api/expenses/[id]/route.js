import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/lib/models/Expense";
import { isAuthenticated, hasPermission, ROLES } from "@/lib/auth";

export async function PUT(request, { params }) {
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(user, ROLES.PAYMENT_ADMIN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();

    // If date is changed, update year/month logic might be needed if not handled by pre-save on update?
    // Mongoose pre-save validates only on save(). Update middleware is needed or manual update.
    // Let's manually update year/month if date is provided.
    if (body.date) {
      const d = new Date(body.date);
      body.year = d.getFullYear();
      body.month = d.getMonth() + 1;
    }

    const expense = await Expense.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      return NextResponse.json({ error: "খরচ পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    return NextResponse.json(
      { error: "খরচ আপডেট করা যায়নি" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(user, ROLES.PAYMENT_ADMIN)) {
    // Only full admins can delete? Or same as create? Let's say same.
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = params;
    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return NextResponse.json({ error: "খরচ পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "খরচ মুছে ফেলা হয়েছে",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "খরচ ডিলিট করা যায়নি" },
      { status: 500 },
    );
  }
}
