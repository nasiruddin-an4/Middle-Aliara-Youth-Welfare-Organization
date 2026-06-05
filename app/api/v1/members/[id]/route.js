import dbConnect from "@/lib/mongodb";
import Member from "@/lib/models/Member";
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

    // Support lookup by memberId string OR MongoDB _id
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const member = isObjectId
      ? await Member.findById(id).select("-mobile -email -social.whatsapp").lean()
      : await Member.findOne({ memberId: id }).select("-mobile -email -social.whatsapp").lean();

    if (!member) {
      return errorResponse("Member not found", 404);
    }

    return successResponse(member);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
