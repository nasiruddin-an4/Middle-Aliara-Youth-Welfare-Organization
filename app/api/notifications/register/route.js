import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PushToken from "@/lib/models/PushToken";

export async function POST(request) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== "maywopudb_jwt_secret_2026_secure_key_xk9q") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { token, userId } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Upsert token
    const pushToken = await PushToken.findOneAndUpdate(
      { token },
      { token, userId, isActive: true },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: pushToken }, { status: 200 });
  } catch (error) {
    console.error("Error registering push token:", error);
    return NextResponse.json(
      { error: "Failed to register push token", details: error.message },
      { status: 500 }
    );
  }
}
