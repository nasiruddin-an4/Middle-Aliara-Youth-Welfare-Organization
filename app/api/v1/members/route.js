import dbConnect from "@/lib/mongodb";
import Member from "@/lib/models/Member";
import {
  successResponse,
  errorResponse,
  handleOptions,
  getPagination,
} from "@/lib/apiHelpers";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    const search = searchParams.get("search");

    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { memberId: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    const [members, total] = await Promise.all([
      Member.find(filter)
        .select("-social.whatsapp -mobile -email") // hide private contact details
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Member.countDocuments(filter),
    ]);

    return successResponse(members, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
