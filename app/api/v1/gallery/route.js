import dbConnect from "@/lib/mongodb";
import Gallery from "@/lib/models/Gallery";
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

    const filter = {};
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    if (category && category !== "all") filter.category = category;
    if (featured === "true") filter.featured = true;

    const [items, total] = await Promise.all([
      Gallery.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Gallery.countDocuments(filter),
    ]);

    return successResponse(items, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data.title || !data.src) {
      return errorResponse("Title and image source are required", 400);
    }

    const newGalleryItem = await Gallery.create(data);

    return successResponse(newGalleryItem, null, 201);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
