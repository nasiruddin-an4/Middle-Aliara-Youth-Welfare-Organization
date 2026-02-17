import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    mobile: { type: String },
    country: { type: String },
    role: { type: String, default: "" },
    image: { type: String, default: "" },
    fatherName: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    email: { type: String, default: "" },
    social: {
      facebook: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.Member || mongoose.model("Member", MemberSchema);
