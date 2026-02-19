import mongoose from "mongoose";

const MemberRequestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide full name"],
    },
    fatherName: String,
    motherName: String,
    phone: {
      type: String,
      required: [true, "Please provide phone number"],
    },
    email: String,
    address: {
      type: String,
      required: [true, "Please provide address"],
    },
    profession: String,
    bloodGroup: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    profileImage: String, // URL to image if we implement upload, or just store the path
  },
  { timestamps: true },
);

export default mongoose.models.MemberRequest ||
  mongoose.model("MemberRequest", MemberRequestSchema);
