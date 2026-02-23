import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/lib/models/Expense";
import { isAuthenticated, hasPermission, ROLES } from "@/lib/auth";

// GET single expense (for invoice)
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const expense = await Expense.findById(id).lean();

    if (!expense) {
      return NextResponse.json({ error: "খরচ পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    return NextResponse.json(
      { error: "খরচের ডাটা লোড করা যায়নি" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(user, ROLES.PAYMENT_ADMIN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    await dbConnect();
    const { id } = await params;
    body = await request.json();

    // Normalize numeric fields
    const numericFields = ["amount", "numberGiven", "amountPerPerson"];
    numericFields.forEach((field) => {
      const val = parseFloat(body[field]);
      if (!isNaN(val)) {
        body[field] = val;
      }
    });

    if (body.date) {
      const d = new Date(body.date);
      if (!isNaN(d.getTime())) {
        body.year = d.getFullYear();
        body.month = d.getMonth() + 1;
      } else {
        delete body.date;
      }
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
    console.error("Expense update error:", error);
    return NextResponse.json(
      {
        error: "আপডেট এরর: " + error.message,
        details: error.message,
        receivedData: body,
      },
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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;
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
