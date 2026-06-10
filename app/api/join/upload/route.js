import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    // Quick validation to ensure it is an image
    if (!file.type || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to Data URI format for Cloudinary upload
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary under the member requests folder
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "maywopudb/member_requests",
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      provider: "cloudinary",
    });
  } catch (error) {
    console.error("Public upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image", details: error.message },
      { status: 500 },
    );
  }
}
