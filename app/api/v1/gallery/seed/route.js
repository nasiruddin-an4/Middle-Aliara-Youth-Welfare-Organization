import dbConnect from "@/lib/mongodb";
import Gallery from "@/lib/models/Gallery";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    await dbConnect();
    const dataPath = path.join(process.cwd(), "app", "data", "gallery.json");
    const fileContents = fs.readFileSync(dataPath, "utf8");
    const data = JSON.parse(fileContents);

    const insertedPhotos = [];
    const existingPhotos = [];

    for (const photo of data.photos) {
      const exists = await Gallery.findOne({ src: photo.src });
      if (!exists) {
        const newPhoto = await Gallery.create({
          title: photo.title,
          description: photo.description,
          category: photo.category,
          src: photo.src,
          date: photo.date,
          featured: photo.featured,
        });
        insertedPhotos.push(newPhoto);
      } else {
        existingPhotos.push(exists);
      }
    }

    return successResponse(
      { insertedCount: insertedPhotos.length, existingCount: existingPhotos.length },
      null,
      201
    );
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
