/**
 * ডাটা রিস্টোর স্ক্রিপ্ট — মধ্য আলীয়ারা যুব কল্যাণ সংগঠন
 * This script restores all data from the PDF backup into the new MongoDB cluster.
 */

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
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env");
  process.exit(1);
}

// ─── Schema Definitions (inline to avoid ESM import issues) ────────────────

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
  { timestamps: true }
);
PaymentSchema.index({ memberId: 1, month: 1, year: 1 }, { unique: true });

const ExpenseItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    qty: { type: Number, default: 1 },
    description: { type: String, default: "" },
    unitPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const ExpenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    description: { type: String },
    year: { type: Number },
    month: { type: Number },
    numberGiven: { type: Number },
    amountPerPerson: { type: Number },
    location: { type: String },
    items: [ExpenseItemSchema],
  },
  { timestamps: true }
);

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
  { timestamps: true }
);

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
      enum: ["welfare", "education", "health", "environment", "sports", "cultural", "other"],
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
  { timestamps: true }
);

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);
const Expense = mongoose.model("Expense", ExpenseSchema);
const Member = mongoose.model("Member", MemberSchema);
const Activity = mongoose.model("Activity", ActivitySchema);
const Settings = mongoose.model("Settings", SettingsSchema);

// ─── DATA ──────────────────────────────────────────────────────────────────

// Members extracted from payment reports (name → memberId mapping)
const members = [
  { memberId: "001", name: "নাছির উদ্দিন" },
  { memberId: "002", name: "রাকিব মিয়া" },
  { memberId: "003", name: "সজীব সেন" },
  { memberId: "004", name: "শাকিল আহমেদ" },
  { memberId: "005", name: "ইব্রাহিম মিয়া" },
  { memberId: "006", name: "মিজানুর মিয়া" },
  { memberId: "007", name: "শাহিন মিয়া" },
  { memberId: "008", name: "ইমরান খান" },
  { memberId: "009", name: "আল আমিন" },
  { memberId: "010", name: "রায়হান ইবনে নাসিম" },
  { memberId: "011", name: "জুয়েল রানা" },
  { memberId: "012", name: "শফিকুল ইসলাম" },
  { memberId: "013", name: "রুবেল মিয়া" },
  { memberId: "014", name: "শাওন আহমেদ" },
  { memberId: "015", name: "শাহাবুদ্দিন" },
  { memberId: "016", name: "ছাত্তার আলম" },
  { memberId: "017", name: "নাসির উদ্দিন" },
  { memberId: "018", name: "সাইমন ইসলাম" },
  { memberId: "019", name: "শাকিল প্রধান" },
  { memberId: "020", name: "শাহাগ" },
  { memberId: "021", name: "মহসিন আহম্মেদ" },
  { memberId: "022", name: "শাহেল রানা" },
  { memberId: "023", name: "মিরাজ হাসান" },
  { memberId: "024", name: "সবুজ মিয়া" },
  { memberId: "025", name: "মেহেদী হাসান" },
  { memberId: "026", name: "কাজল মিয়া" },
  { memberId: "027", name: "শাহীন মিয়া" },
  { memberId: "028", name: "আল আমিন সেন" },
  { memberId: "029", name: "আলমগীর" },
  { memberId: "030", name: "Roman Miah" },
  { memberId: "031", name: "মিরাজ সেন" },
  { memberId: "032", name: "হানিফ মজুমদার" },
  { memberId: "033", name: "রাকিব সেন" },
  { memberId: "044", name: "সদস্য #44" },
];

// Build name → memberId lookup
const nameToId = {};
members.forEach((m) => {
  nameToId[m.name] = m.memberId;
});

// ─── Payments: February 2026 ──────────────────────────────────────────────
const febPayments = [
  { name: "নাছির উদ্দিন", source: "বিকাশ", date: "2026-02-18", amount: 2055 },
  { name: "রাকিব মিয়া", source: "বিকাশ", date: "2026-02-25", amount: 2187 },
  { name: "সজীব সেন", source: "বিকাশ", date: "2026-02-23", amount: 1020 },
  { name: "শাকিল আহমেদ", source: "বিকাশ", date: "2026-02-21", amount: 1295 },
  { name: "ইব্রাহিম মিয়া", source: "বিকাশ", date: "2026-02-20", amount: 1020 },
  { name: "মিজানুর মিয়া", source: "বিকাশ", date: "2026-02-20", amount: 1020 },
  { name: "শাহিন মিয়া", source: "বিকাশ", date: "2026-02-20", amount: 1020 },
  { name: "ইমরান খান", source: "বিকাশ", date: "2026-02-20", amount: 1020 },
  { name: "আল আমিন", source: "বিকাশ", date: "2026-02-18", amount: 1530 },
  { name: "রায়হান ইবনে নাসিম", source: "বিকাশ", date: "2026-02-18", amount: 1020 },
  { name: "জুয়েল রানা", source: "বিকাশ", date: "2026-02-18", amount: 1020 },
  { name: "শফিকুল ইসলাম", source: "নগদ (ক্যাশ)", date: "2026-02-20", amount: 1020 },
  { name: "রুবেল মিয়া", source: "বিকাশ", date: "2026-02-17", amount: 1630 },
  { name: "শাওন আহমেদ", source: "বিকাশ", date: "2026-02-19", amount: 2137 },
  { name: "শাহাবুদ্দিন", source: "বিকাশ", date: "2026-02-19", amount: 1020 },
  { name: "ছাত্তার আলম", source: "বিকাশ", date: "2026-02-18", amount: 503 },
  { name: "নাসির উদ্দিন", source: "নগদ (ক্যাশ)", date: "2026-02-16", amount: 1000 },
  { name: "সাইমন ইসলাম", source: "বিকাশ", date: "2026-02-18", amount: 2000 },
  { name: "শাকিল প্রধান", source: "বিকাশ", date: "2026-02-17", amount: 1030 },
  { name: "শাহাগ", source: "বিকাশ", date: "2026-02-17", amount: 1020 },
  { name: "মহসিন আহম্মেদ", source: "বিকাশ", date: "2026-02-17", amount: 3045 },
  { name: "শাহেল রানা", source: "বিকাশ", date: "2026-02-16", amount: 1020 },
  { name: "মিরাজ হাসান", source: "বিকাশ", date: "2026-02-17", amount: 1020 },
  { name: "সবুজ মিয়া", source: "বিকাশ", date: "2026-02-16", amount: 1020 },
  { name: "মেহেদী হাসান", source: "বিকাশ", date: "2026-02-15", amount: 5100 },
  { name: "কাজল মিয়া", source: "বিকাশ", date: "2026-02-17", amount: 2206 },
  { name: "শাহীন মিয়া", source: "বিকাশ", date: "2026-02-15", amount: 1000 },
  { name: "আল আমিন সেন", source: "বিকাশ", date: "2026-02-15", amount: 1020 },
  { name: "আলমগীর", source: "বিকাশ", date: "2026-02-15", amount: 1020 },
  { name: "Roman Miah", source: "বিকাশ", date: "2026-02-17", amount: 10224 },
  { name: "মিরাজ সেন", source: "বিকাশ", date: "2026-02-17", amount: 1020 },
];

// ─── Payments: March 2026 ─────────────────────────────────────────────────
const marPayments = [
  { name: "জুয়েল রানা", source: "বিকাশ", date: "2026-03-07", amount: 1015 },
  { name: "হানিফ মজুমদার", source: "নগদ", date: "2026-03-07", amount: 1020 },
  { name: "মিরাজ সেন", source: "বিকাশ", date: "2026-03-04", amount: 1020 },
  { name: "শাহীন মিয়া", source: "বিকাশ", date: "2026-03-04", amount: 1000 },
  { name: "রাকিব সেন", source: "বিকাশ", date: "2026-03-03", amount: 2040 },
  { name: "Roman Miah", source: "বিকাশ", date: "2026-03-20", amount: 3046 },
];

// ─── Payments: Dashboard extra entries (April 2026) ───────────────────────
const dashboardExtraPayments = [
  { name: "সদস্য #44", source: "বিকাশ", date: "2026-04-01", amount: 20800, month: 4, year: 2026 },
  { name: "সদস্য #32", source: "বিকাশ", date: "2026-04-01", amount: 1020, month: 4, year: 2026 },
  { name: "রাকিব মিয়া", source: "বিকাশ", date: "2026-03-01", amount: 2024, month: 3, year: 2026 },
];

// ─── Expense: Invoice #69a25712a50e6e61a1734fb2 ──────────────────────────
const invoiceExpense = {
  title: "ইফতার সামগ্রী বিতরণ কর্মসূচি",
  amount: 32469.01,
  date: new Date("2026-02-22"),
  category: "কল্যাণমূলক",
  description: "Invoice #69a25712a50e6e61a1734fb2 — ২৪ জন প্রাপকের মধ্যে ইফতার সামগ্রী বিতরণ",
  year: 2026,
  month: 2,
  numberGiven: 24,
  amountPerPerson: 1310,
  location: "মধ্য আলীয়ারা",
  items: [
    { itemName: "ছোলা বুট", qty: 24.5, unitPrice: 78.0, description: "" },
    { itemName: "খেসারি ডাল", qty: 24.5, unitPrice: 80.0, description: "" },
    { itemName: "বেসন", qty: 24, unitPrice: 66.34, description: "" },
    { itemName: "সয়াবিন তেল", qty: 24, unitPrice: 192.0, description: "" },
    { itemName: "টাং", qty: 24, unitPrice: 90.0, description: "" },
    { itemName: "চিনি", qty: 24.5, unitPrice: 98.5, description: "" },
    { itemName: "মুড়ি", qty: 49, unitPrice: 79.4, description: "" },
    { itemName: "সেমাই", qty: 48, unitPrice: 31.0, description: "" },
    { itemName: "পেঁয়াজ", qty: 50, unitPrice: 44.0, description: "" },
    { itemName: "খেজুর", qty: 24, unitPrice: 281.25, description: "" },
    { itemName: "ব্যাগ", qty: 25, unitPrice: 23.6, description: "" },
    { itemName: "গাড়ি ভাড়া", qty: 1, unitPrice: 600.0, description: "" },
    { itemName: "ট্যাগ কার্ড + টেপ", qty: 1, unitPrice: 150.0, description: "" },
    { itemName: "কামাল", qty: 1, unitPrice: 1570.0, description: "" },
    { itemName: "Bkash Cash Out Charge", qty: 1, unitPrice: 586.0, description: "" },
  ],
};

// ─── Activity: Iftar Distribution ─────────────────────────────────────────
const iftarActivity = {
  title: "ইফতার সামগ্রী বিতরণ কর্মসূচি ২০২৬",
  description:
    "মধ্য আলীয়ারা যুব কল্যাণ সংগঠন ও প্রবাসী ঐক্য পরিষদ কর্তৃক আয়োজিত ইফতার সামগ্রী বিতরণ কর্মসূচি। " +
    "২৪ জন সুবিধাবঞ্চিত মানুষের মধ্যে ছোলা বুট, ডাল, তেল, চিনি, মুড়ি, সেমাই, খেজুর সহ ইফতার সামগ্রী বিতরণ করা হয়। " +
    "মোট খরচ: ৳৩২,৪৬৯.০১",
  category: "welfare",
  date: "2026-02-22",
  location: "মধ্য আলীয়ারা",
  status: "completed",
  featured: true,
  media: [],
};

// ─── Settings: Monthly Due ────────────────────────────────────────────────
const settingsData = [
  { key: "monthlyDue", value: 1000 },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────

async function run() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("✅ Connected!\n");

  // ── 1. Restore Members ───────────────────────────────────────────────
  console.log("👥 Restoring Members...");
  let memberCount = 0;
  for (const m of members) {
    try {
      await Member.updateOne(
        { memberId: m.memberId },
        { $setOnInsert: m },
        { upsert: true }
      );
      memberCount++;
    } catch (err) {
      console.log(`  ⚠️  Member ${m.memberId} (${m.name}): ${err.message}`);
    }
  }
  console.log(`  ✅ ${memberCount} members processed.\n`);

  // ── 2. Restore February 2026 Payments ────────────────────────────────
  console.log("💰 Restoring February 2026 Payments...");
  let febCount = 0;
  for (const p of febPayments) {
    const memberId = nameToId[p.name];
    if (!memberId) {
      console.log(`  ⚠️  No memberId found for: ${p.name}`);
      continue;
    }
    try {
      await Payment.updateOne(
        { memberId, month: 2, year: 2026 },
        {
          $setOnInsert: {
            memberId,
            month: 2,
            year: 2026,
            amount: p.amount,
            source: p.source,
            date: p.date,
            transactionId: "",
            receivedBy: "",
          },
        },
        { upsert: true }
      );
      febCount++;
    } catch (err) {
      console.log(`  ⚠️  ${p.name}: ${err.message}`);
    }
  }
  console.log(`  ✅ ${febCount} February payments processed.\n`);

  // ── 3. Restore March 2026 Payments ───────────────────────────────────
  console.log("💰 Restoring March 2026 Payments...");
  let marCount = 0;
  for (const p of marPayments) {
    const memberId = nameToId[p.name];
    if (!memberId) {
      console.log(`  ⚠️  No memberId found for: ${p.name}`);
      continue;
    }
    try {
      await Payment.updateOne(
        { memberId, month: 3, year: 2026 },
        {
          $setOnInsert: {
            memberId,
            month: 3,
            year: 2026,
            amount: p.amount,
            source: p.source,
            date: p.date,
            transactionId: "",
            receivedBy: "",
          },
        },
        { upsert: true }
      );
      marCount++;
    } catch (err) {
      console.log(`  ⚠️  ${p.name}: ${err.message}`);
    }
  }
  console.log(`  ✅ ${marCount} March payments processed.\n`);

  // ── 4. Restore Dashboard extra payments (April 2026 + extra March) ──
  console.log("💰 Restoring Dashboard extra payments...");
  let dashCount = 0;
  for (const p of dashboardExtraPayments) {
    const memberId = nameToId[p.name];
    if (!memberId) {
      console.log(`  ⚠️  No memberId found for: ${p.name}`);
      continue;
    }
    try {
      await Payment.updateOne(
        { memberId, month: p.month, year: p.year },
        {
          $setOnInsert: {
            memberId,
            month: p.month,
            year: p.year,
            amount: p.amount,
            source: p.source,
            date: p.date,
            transactionId: "",
            receivedBy: "",
          },
        },
        { upsert: true }
      );
      dashCount++;
    } catch (err) {
      console.log(`  ⚠️  ${p.name}: ${err.message}`);
    }
  }
  console.log(`  ✅ ${dashCount} dashboard payments processed.\n`);

  // ── 5. Restore Expense (Invoice) ─────────────────────────────────────
  console.log("📝 Restoring Expense (Invoice)...");
  try {
    const existing = await Expense.findOne({
      title: invoiceExpense.title,
      date: invoiceExpense.date,
    });
    if (!existing) {
      await Expense.create(invoiceExpense);
      console.log("  ✅ Invoice expense created.\n");
    } else {
      console.log("  ℹ️  Invoice expense already exists, skipped.\n");
    }
  } catch (err) {
    console.log(`  ⚠️  Expense error: ${err.message}\n`);
  }

  // ── 6. Restore Activity (Iftar Distribution) ────────────────────────
  console.log("🎯 Restoring Activity (Iftar Distribution)...");
  try {
    const existing = await Activity.findOne({
      title: iftarActivity.title,
    });
    if (!existing) {
      await Activity.create(iftarActivity);
      console.log("  ✅ Iftar activity created.\n");
    } else {
      console.log("  ℹ️  Iftar activity already exists, skipped.\n");
    }
  } catch (err) {
    console.log(`  ⚠️  Activity error: ${err.message}\n`);
  }

  // ── 7. Restore Settings ──────────────────────────────────────────────
  console.log("⚙️  Restoring Settings...");
  for (const s of settingsData) {
    try {
      await Settings.updateOne(
        { key: s.key },
        { $setOnInsert: s },
        { upsert: true }
      );
    } catch (err) {
      console.log(`  ⚠️  Setting ${s.key}: ${err.message}`);
    }
  }
  console.log("  ✅ Settings restored.\n");

  // ── Summary ──────────────────────────────────────────────────────────
  const totalPayments = await Payment.countDocuments();
  const totalMembers = await Member.countDocuments();
  const totalExpenses = await Expense.countDocuments();
  const totalActivities = await Activity.countDocuments();

  console.log("═══════════════════════════════════════════");
  console.log("  📊 RESTORE SUMMARY");
  console.log("═══════════════════════════════════════════");
  console.log(`  👥 Members:    ${totalMembers}`);
  console.log(`  💰 Payments:   ${totalPayments}`);
  console.log(`  📝 Expenses:   ${totalExpenses}`);
  console.log(`  🎯 Activities: ${totalActivities}`);
  console.log("═══════════════════════════════════════════");
  console.log("\n✅ Data restoration complete!");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
