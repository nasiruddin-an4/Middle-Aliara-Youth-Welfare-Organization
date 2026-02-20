import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MemberRequest from "@/lib/models/MemberRequest";
import { sendJoinRequestStatusEmail } from "@/lib/emailService";

// PATCH - Update status (approve/reject)
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { status, message } = await request.json();

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 },
      );
    }

    const memberRequest = await MemberRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!memberRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 },
      );
    }

    let emailSent = false;
    let emailError = null;

    // Send email notification if approved or rejected
    if (status === "approved" || status === "rejected") {
      try {
        await sendJoinRequestStatusEmail(memberRequest, status, message);
        emailSent = true;
      } catch (err) {
        console.error("Email sending failed:", err);
        emailError = err.message || "Email configuration missing or invalid";
      }
    }

    return NextResponse.json({
      success: true,
      message: `Request ${status} successfully`,
      data: memberRequest,
      emailSent,
      emailError,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update request",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE - Remove a join request
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const memberRequest = await MemberRequest.findByIdAndDelete(id);

    if (!memberRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete request",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
