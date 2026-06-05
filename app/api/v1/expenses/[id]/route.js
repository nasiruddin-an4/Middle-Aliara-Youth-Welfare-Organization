import dbConnect from "@/lib/mongodb";
import Expense from "@/lib/models/Expense";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  handleOptions,
  verifyApiKey,
} from "@/lib/apiHelpers";
import mongoose from "mongoose";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request, { params }) {
  // 🔒 Requires API key
  if (!verifyApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid ID", 400);
    }

    const expense = await Expense.findById(id).lean();
    if (!expense) return errorResponse("Expense not found", 404);

    return successResponse(expense);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
