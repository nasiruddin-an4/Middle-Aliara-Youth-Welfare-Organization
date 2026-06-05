import dbConnect from "@/lib/mongodb";
import Expense from "@/lib/models/Expense";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  handleOptions,
  verifyApiKey,
  getPagination,
} from "@/lib/apiHelpers";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  // 🔒 Requires API key
  if (!verifyApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);

    const filter = {};
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const category = searchParams.get("category");

    if (year) filter.year = parseInt(year, 10);
    if (month) filter.month = parseInt(month, 10);
    if (category) filter.category = { $regex: category, $options: "i" };

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Expense.countDocuments(filter),
    ]);

    // Aggregate total amount for the current filter
    const totalAmountResult = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalAmount =
      totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    // Category breakdown
    const categoryBreakdown = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    return successResponse(expenses, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalAmount,
      categoryBreakdown,
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
