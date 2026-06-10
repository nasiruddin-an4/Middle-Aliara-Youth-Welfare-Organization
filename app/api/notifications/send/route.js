import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PushToken from "@/lib/models/PushToken";
import { isAuthenticated, hasPermission, ROLES } from "@/lib/auth";
import { Expo } from "expo-server-sdk";

export async function POST(request) {
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow super admin or specific roles to send notifications
  if (!hasPermission(user, ROLES.SUPER_ADMIN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { title, message } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    // Fetch all active tokens from DB
    const tokens = await PushToken.find({ isActive: true }).lean();
    if (tokens.length === 0) {
      return NextResponse.json(
        { success: true, message: "No registered devices found" },
        { status: 200 }
      );
    }

    let expo = new Expo();
    let messages = [];

    for (let pushToken of tokens) {
      if (!Expo.isExpoPushToken(pushToken.token)) {
        console.error(`Push token ${pushToken.token} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken.token,
        sound: "default",
        title: title,
        body: message,
        data: { withSome: "data" },
      });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    // Send the chunks to the Expo push notification service
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${tickets.length} notifications successfully`,
      tickets,
    });
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications", details: error.message },
      { status: 500 }
    );
  }
}
