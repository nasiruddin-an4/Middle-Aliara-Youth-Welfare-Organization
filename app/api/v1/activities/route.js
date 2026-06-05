import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Activity from "@/lib/models/Activity";
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

    // Build filter
    const filter = {};
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (featured === "true") filter.featured = true;

    const [activities, total] = await Promise.all([
      Activity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Activity.countDocuments(filter),
    ]);

    return successResponse(activities, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
