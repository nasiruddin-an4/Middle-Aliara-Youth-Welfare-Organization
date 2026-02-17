import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import supabase from "@/lib/supabase";
import { isAuthenticated, hasPermission, ROLES } from "@/lib/auth";

export async function POST(request) {
  /* 7 */ const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(user, [ROLES.MEMBER_ADMIN, ROLES.PAYMENT_ADMIN])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type") || "image"; // image, video, pdf

    if (!file) {
      return NextResponse.json(
        { error: "ফাইল পাওয়া যায়নি" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // PDF → Supabase Storage
    if (type === "pdf" || file.type === "application/pdf") {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        return NextResponse.json(
          { error: "PDF আপলোড ব্যর্থ: " + error.message },
          { status: 500 },
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(fileName);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        provider: "supabase",
        fileName,
      });
    }

    // Image/Video → Cloudinary
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    const resourceType = type === "video" ? "video" : "image";
    const folder = type === "video" ? "maywopudb/videos" : "maywopudb/images";

    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: resourceType,
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      provider: "cloudinary",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "আপলোড ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
