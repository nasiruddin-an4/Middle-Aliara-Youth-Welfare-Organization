import dbConnect from "@/lib/mongodb";
import Gallery from "@/lib/models/Gallery";
import {
  successResponse,
  errorResponse,
  handleOptions,
} from "@/lib/apiHelpers";
import mongoose from "mongoose";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid ID", 400);
    }

    const item = await Gallery.findById(id).lean();
    if (!item) return errorResponse("Gallery item not found", 404);

    return successResponse(item);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
