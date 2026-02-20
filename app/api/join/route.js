import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MemberRequest from "@/lib/models/MemberRequest";

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Quick validation
    if (!data.fullName || !data.phone || !data.address) {
      return NextResponse.json(
        { success: false, message: "Required fields missing" },
        { status: 400 },
      );
    }

    const memberRequest = await MemberRequest.create(data);
    return NextResponse.json(
      {
        success: true,
        message: "Join request submitted successfully!",
        data: memberRequest,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit request",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const requests = await MemberRequest.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch requests",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
