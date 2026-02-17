import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], default: "image" },
        publicId: { type: String, default: "" },
      },
    ],
    category: {
      type: String,
      enum: [
        "welfare",
        "education",
        "health",
        "environment",
        "sports",
        "cultural",
        "other",
      ],
      default: "other",
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    location: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ongoing", "completed", "upcoming"],
      default: "ongoing",
    },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Activity ||
  mongoose.model("Activity", ActivitySchema);
