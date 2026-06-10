import mongoose from "mongoose";

const PushTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    userId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.PushToken || mongoose.model("PushToken", PushTokenSchema);
