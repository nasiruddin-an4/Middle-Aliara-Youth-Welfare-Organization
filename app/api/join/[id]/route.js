import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MemberRequest from "@/lib/models/MemberRequest";
import Member from "@/lib/models/Member";
import { sendJoinRequestStatusEmail } from "@/lib/emailService";
import { isAuthenticated, hasPermission, ROLES } from "@/lib/auth";

// PATCH - Update status (approve/reject)
export async function PATCH(request, { params }) {
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!hasPermission(user, ROLES.MEMBER_ADMIN)) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

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

    const memberRequest = await MemberRequest.findById(id);

    if (!memberRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 },
      );
    }

    const previousStatus = memberRequest.status;
    memberRequest.status = status;
    await memberRequest.save();

    let memberCreated = false;
    let memberId = null;

    if (status === "approved" && previousStatus !== "approved") {
      const existingMember = await Member.findOne({ mobile: memberRequest.phone });
      if (!existingMember) {
        // Find highest numeric memberId
        const members = await Member.find({}, { memberId: 1 });
        const maxId = members.reduce((max, m) => {
          const parsedId = parseInt(m.memberId) || 0;
          return Math.max(max, parsedId);
        }, 0);
        const nextIdNum = maxId + 1;
        const nextId = nextIdNum < 10 ? `0${nextIdNum}` : String(nextIdNum);
        memberId = nextId;

        // Create Member
        await Member.create({
          memberId: nextId,
          name: memberRequest.fullName,
          mobile: memberRequest.phone,
          country: "বাংলাদেশ",
          role: "সদস্য",
          image: memberRequest.profileImage || "",
          fatherName: memberRequest.fatherName || "",
          bloodGroup: memberRequest.bloodGroup || "",
          email: memberRequest.email || "",
          social: {
            facebook: "",
            whatsapp: memberRequest.phone ? `https://wa.me/${memberRequest.phone}` : "",
            email: memberRequest.email || "",
          },
          isActive: true,
        });
        memberCreated = true;
      } else {
        memberId = existingMember.memberId;
      }
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
      memberCreated,
      memberId,
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
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!hasPermission(user, ROLES.MEMBER_ADMIN)) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

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

