import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true }, // e.g., "Event", "Salary", "Maintenance", "Others"
    description: { type: String },
    year: { type: Number },
    month: { type: Number },
    numberGiven: { type: Number }, // Total number of people/items
    amountPerPerson: { type: Number }, // Expense per person
    location: { type: String }, // Where the expense happened
  },
  { timestamps: true },
);

// Pre-save hook to set year and month from date
ExpenseSchema.pre("save", function () {
  if (this.date) {
    const d = new Date(this.date);
    if (!isNaN(d.getTime())) {
      this.year = d.getFullYear();
      this.month = d.getMonth() + 1; // 1-12
    }
  }
});

export default mongoose.models.Expense ||
  mongoose.model("Expense", ExpenseSchema);
