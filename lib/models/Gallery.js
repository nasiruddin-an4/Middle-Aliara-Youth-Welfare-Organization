import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "events" },
    src: { type: String, required: true },
    date: { type: String, default: "" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Gallery ||
  mongoose.model("Gallery", GallerySchema);
