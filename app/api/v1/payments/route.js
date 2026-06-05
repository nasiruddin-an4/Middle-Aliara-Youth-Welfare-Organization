import dbConnect from "@/lib/mongodb";
import Payment from "@/lib/models/Payment";
import Member from "@/lib/models/Member";
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
    const memberId = searchParams.get("memberId");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (memberId) filter.memberId = memberId;
    if (year) filter.year = parseInt(year, 10);
    if (month) filter.month = parseInt(month, 10);

    const [payments, total] = await Promise.all([
      Payment.find(filter).sort({ year: -1, month: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Payment.countDocuments(filter),
    ]);

    // Attach member names for convenience
    const memberIds = [...new Set(payments.map((p) => p.memberId))];
    const members = await Member.find({ memberId: { $in: memberIds } })
      .select("memberId name")
      .lean();
    const memberMap = Object.fromEntries(members.map((m) => [m.memberId, m.name]));

    const enriched = payments.map((p) => ({
      ...p,
      memberName: memberMap[p.memberId] || "Unknown",
    }));

    // Year summary if year filter applied
    let yearSummary = null;
    if (year) {
      const agg = await Payment.aggregate([
        { $match: { year: parseInt(year, 10), ...( memberId ? { memberId } : {}) } },
        { $group: { _id: "$month", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
      yearSummary = agg;
    }

    return successResponse(enriched, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      ...(yearSummary ? { monthlyBreakdown: yearSummary } : {}),
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
