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

  if (!hasPermission(user, ROLES.PAYMENT_ADMIN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    await dbConnect();
    body = await request.json();

    // Ensure date is present
    if (!body.date) {
      body.date = new Date();
    }

    // Normalize numeric fields: default to 0 if missing or invalid
    const numericFields = ["amount", "numberGiven", "amountPerPerson"];
    numericFields.forEach((field) => {
      const val = parseFloat(body[field]);
      body[field] = !isNaN(val) ? val : 0;
    });

    // Explicit validation for required fields
    const missing = ["title", "category"].filter((f) => !body[f]?.trim());
    // Note: amount is handled by normalization above (will be at least 0)

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `নিম্নলিখিত ক্ষেত্রগুলো পূরণ করা আবশ্যক: ${missing.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const expense = await Expense.create(body);
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    console.error("Expense creation error:", error);

    // Attempt to log to a file for deeper debugging if possible
    try {
      const fs = require("fs");
      const logMessage = `[${new Date().toISOString()}] Body: ${JSON.stringify(body)} | Error: ${error.stack}\n`;
      fs.appendFileSync("api_debug.log", logMessage);
    } catch (e) {
      // ignore log failure
    }

    return NextResponse.json(
      {
        error: "Submit error: " + error.message,
        details: error.message,
        receivedData: body,
      },
      { status: 500 },
    );
  }
}
