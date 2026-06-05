import dbConnect from "@/lib/mongodb";
import Activity from "@/lib/models/Activity";
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

    // Support lookup by MongoDB _id
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const activity = isObjectId
      ? await Activity.findById(id).lean()
      : null;

    if (!activity) {
      return errorResponse("Activity not found", 404);
    }

    return successResponse(activity);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
