import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContactMessage from "@/lib/models/ContactMessage";

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const message = await ContactMessage.create(data);
    return NextResponse.json(
      { success: true, message: "Message sent successfully!", data: message },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch messages",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
