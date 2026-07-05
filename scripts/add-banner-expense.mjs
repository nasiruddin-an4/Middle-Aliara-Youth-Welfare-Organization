import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const envContent = readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) return;
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  if (!process.env[key]) process.env[key] = value;
});

const MONGODB_URI = process.env.MONGODB_URI;

const ExpenseItemSchema = new mongoose.Schema(
  { itemName: String, qty: Number, description: String, unitPrice: Number },
  { _id: false }
);
const ExpenseSchema = new mongoose.Schema(
  {
    title: String, amount: Number, date: Date, category: String,
    description: String, year: Number, month: Number,
    numberGiven: Number, amountPerPerson: Number, location: String,
    items: [ExpenseItemSchema],
  },
  { timestamps: true }
);
const Expense = mongoose.model("Expense", ExpenseSchema);

async function run() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("✅ Connected!");

  const bannerExpense = {
    title: "ব্যানার প্রিন্ট",
    amount: 7000,
    date: new Date("2026-02-22"),
    category: "কল্যাণমূলক",
    description: "ইফতার সামগ্রী বিতরণ কর্মসূচির ব্যানার প্রিন্ট খরচ",
    year: 2026,
    month: 2,
    location: "মধ্য আলীয়ারা",
    items: [
      { itemName: "ব্যানার প্রিন্ট", qty: 1, unitPrice: 7000, description: "" },
    ],
  };

  const existing = await Expense.findOne({ title: bannerExpense.title, date: bannerExpense.date });
  if (!existing) {
    await Expense.create(bannerExpense);
    console.log("✅ Banner print expense (৳7,000) added!");
  } else {
    console.log("ℹ️  Already exists, skipped.");
  }

  const total = await Expense.countDocuments();
  console.log(`📝 Total expenses now: ${total}`);

  await mongoose.disconnect();
}

run().catch((e) => { console.error("❌", e); process.exit(1); });
