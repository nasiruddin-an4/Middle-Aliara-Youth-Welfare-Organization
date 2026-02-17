import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Member from "@/lib/models/Member";
import { isAuthenticated } from "@/lib/auth";

// POST — seed members from hardcoded data (admin only, one-time use)
export async function POST(request) {
  const user = isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const members = body.members;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: "No members data provided" },
        { status: 400 },
      );
    }

    let inserted = 0;
    let skipped = 0;
    const errors = [];

    for (const m of members) {
      try {
        // Check if member already exists by memberId
        const exists = await Member.findOne({ memberId: m.id });
        if (exists) {
          skipped++;
          continue;
        }

        await Member.create({
          memberId: m.id,
          name: m.name,
          mobile: m.mobile || "",
          country: m.country || "",
          role: m.role || "",
          image: m.image || "",
          fatherName: m.father || "",
          bloodGroup: m.bloodGroup || "",
          email: m.social?.email || "",
          social: {
            facebook: m.social?.facebook || "",
            whatsapp: m.social?.whatsapp || "",
            email: m.social?.email || "",
          },
          isActive: true,
        });
        inserted++;
      } catch (err) {
        errors.push({ id: m.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seed complete: ${inserted} inserted, ${skipped} skipped (already exist)`,
      inserted,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
