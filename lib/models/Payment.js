import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    date: { type: String, default: "" },
    transactionId: { type: String, default: "" },
    receivedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

PaymentSchema.index({ memberId: 1, month: 1, year: 1 }, { unique: true });

delete mongoose.models.Payment;
export default mongoose.model("Payment", PaymentSchema);
