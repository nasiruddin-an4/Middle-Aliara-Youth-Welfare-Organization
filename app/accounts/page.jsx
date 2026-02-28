"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
// import membersData from "../data/members.json";
// import accountsData from "../data/accounts.json";
import {
  Search,
  Shield,
  TrendingUp,
  Calendar,
  Wallet,
  CheckCircle2,
  Download,
  ChevronDown,
  X,
  Globe,
  Users,
  BarChart3,
  Eye,
  ChevronRight,
  Award,
  MapPin,
  CreditCard,
  Phone,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  PieChart,
  Loader2,
} from "lucide-react";
import { toPng } from "html-to-image";

const MONTH_NAMES = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];
const MONTH_SHORT = [
  "জানু",
  "ফেব",
  "মার্চ",
  "এপ্রি",
  "মে",
  "জুন",
  "জুলা",
  "আগ",
  "সেপ্টে",
  "অক্টো",
  "নভে",
  "ডিসে",
];
const PAYMENT_SOURCES = ["বিকাশ", "ব্যাংক", "নগদ", "রকেট"];
const SOURCE_STYLES = {
  বিকাশ: {
    bg: "bg-pink-50",
    text: "text-pink-600",
    dot: "bg-pink-500",
    border: "border-pink-200",
  },
  ব্যাংক: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
    border: "border-blue-200",
  },
  নগদ: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    dot: "bg-orange-500",
    border: "border-orange-200",
  },
  রকেট: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-500",
    border: "border-purple-200",
  },
  বকেয়া: {
    bg: "bg-red-50",
    text: "text-red-400",
    dot: "bg-red-400",
    border: "border-red-200",
  },
};
const AVAILABLE_YEARS = [2026];
const MONTHLY_DUE = 2000;
// const allMembers = membersData.members;
// const allPayments = accountsData.payments;

const fmt = (n) => "৳" + n.toLocaleString("bn-BD");
const avatarColor = (name) => {
  const c = [
    "from-sky-400 to-blue-600",
    "from-emerald-400 to-teal-600",
    "from-violet-400 to-purple-600",
    "from-amber-400 to-orange-600",
    "from-rose-400 to-pink-600",
    "from-cyan-400 to-teal-600",
    "from-indigo-400 to-blue-600",
    "from-fuchsia-400 to-pink-600",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return c[Math.abs(h) % c.length];
};

/* ═══ Member Detail Modal (Desktop only) ═══ */
function MemberModal({ member, onClose, allPayments }) {
  if (!member) return null;
  const memberPayments = allPayments.filter(
    (p) => p.memberId == member.memberId || p.memberId == member.id,
  );
  const totalPaid = memberPayments.reduce((s, p) => s + p.amount, 0);
  const paidMonths = memberPayments.length;
  const totalDue = MONTH_NAMES.length * MONTHLY_DUE - totalPaid;
  const byYear = {};
  memberPayments.forEach((p) => {
    if (!byYear[p.year]) byYear[p.year] = { total: 0, months: {} };
    byYear[p.year].total += p.amount;
    byYear[p.year].months[p.month] = p;
  });

  const hasImage = !!member.image;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: "thin" }}
      >
        {/* ── Hero Section with Large Image ── */}
        <div className="relative overflow-hidden rounded-t-3xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#051C14] via-[#0a3d2a] to-[#051C14]" />
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Profile content */}
          <div className="relative z-10 flex flex-col items-center pt-8 pb-6 px-6">
            {/* Large Avatar */}
            <div
              className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatarColor(member.name)} flex items-center justify-center text-white font-bold text-4xl shadow-xl ring-4 ring-white/10 overflow-hidden mb-4`}
            >
              {hasImage ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                style={{ display: hasImage ? "none" : "flex" }}
                className="w-full h-full items-center justify-center"
              >
                {member.name.charAt(0)}
              </span>
            </div>

            {/* Name & Role */}
            <h3 className="text-xl font-bold text-white text-center mb-1">
              {member.name}
            </h3>
            {member.role && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold text-amber-200 bg-amber-500/20 border border-amber-400/20 mb-2">
                <Award size={10} />
                {member.role}
              </span>
            )}

            {/* Info pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-emerald-200 bg-white/5 backdrop-blur-sm">
                <MapPin size={11} /> {member.country}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-emerald-200 bg-white/5 backdrop-blur-sm">
                <Phone size={11} /> {member.mobile}
              </span>
              {member.bloodGroup && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-red-300 bg-red-500/10 backdrop-blur-sm">
                  🩸 {member.bloodGroup}
                </span>
              )}
            </div>

            {/* Father & Email */}
            {(member.father ||
              (member.social?.email &&
                !member.social.email.includes("@example.com"))) && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {member.father && (
                  <span className="text-[10px] text-emerald-300/60">
                    পিতা: {member.father}
                  </span>
                )}
                {member.social?.email &&
                  !member.social.email.includes("@example.com") && (
                    <span className="text-[10px] text-emerald-300/50 truncate max-w-[200px]">
                      ✉️ {member.social.email}
                    </span>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 gap-3 px-5 mt-0 pt-5 pb-4">
          {[
            {
              label: "সর্বমোট প্রদান",
              value: fmt(totalPaid),
              icon: "💰",
              gradient: "from-emerald-50 to-green-50",
              textColor: "text-emerald-700",
              border: "border-emerald-100",
            },
            {
              label: "পরিশোধিত মাস",
              value: paidMonths,
              icon: "📅",
              gradient: "from-blue-50 to-sky-50",
              textColor: "text-blue-700",
              border: "border-blue-100",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-3.5 text-center border ${s.border} hover:shadow-md transition-shadow`}
            >
              <span className="text-lg block mb-1">{s.icon}</span>
              <p className={`text-lg font-bold ${s.textColor}`}>{s.value}</p>
              <p className="text-[9px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Payment Calendar ── */}
        <div className="px-5 pb-6">
          {Object.keys(byYear)
            .sort((a, b) => b - a)
            .map((year) => {
              const yearPaidCount = Object.keys(byYear[year].months).length;
              return (
                <div key={year} className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Calendar size={13} className="text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">
                          {year} সালের বিবরণ
                        </h4>
                        <p className="text-[9px] text-gray-400">
                          {yearPaidCount}/১২ মাস পরিশোধিত
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      {fmt(byYear[year].total)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-gray-100 mb-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                      style={{ width: `${(yearPaidCount / 12) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {MONTH_NAMES.map((m, i) => {
                      const p = byYear[year].months[i + 1];
                      const paid = !!p;
                      return (
                        <div
                          key={i}
                          className={`rounded-xl p-2 text-center border transition-all duration-200 hover:scale-[1.03] ${
                            paid
                              ? "bg-gradient-to-b from-emerald-50 to-green-50 border-emerald-200 shadow-sm"
                              : "bg-gray-50/50 border-gray-100"
                          }`}
                        >
                          <p
                            className={`text-[10px] font-semibold mb-1 ${paid ? "text-emerald-600" : "text-gray-400"}`}
                          >
                            {MONTH_SHORT[i]}
                          </p>
                          {paid ? (
                            <>
                              <CheckCircle2
                                size={16}
                                className="text-emerald-500 mx-auto mb-0.5"
                              />
                              <p className="text-[10px] font-bold text-emerald-700">
                                {fmt(p.amount)}
                              </p>
                              <p className="text-[8px] text-gray-400 mt-0.5">
                                {p.source}
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="w-4 h-4 rounded-full bg-gray-200/80 mx-auto mb-0.5" />
                              <p className="text-[10px] text-gray-300 font-medium">
                                বকেয়া
                              </p>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

/* ═══ Payment Detail Modal (Monthly Contributions) ═══ */
function PaymentDetailModal({ member, monthName, year, onClose }) {
  if (!member) return null;
  const paid = member.amount > 0;
  const st = SOURCE_STYLES[member.source] || SOURCE_STYLES["বকেয়া"];
  const hasImage = !!member.image;

  // Format date in Bengali
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div
            className={`absolute inset-0 ${paid ? "bg-gradient-to-b from-[#051C14] via-[#0a3d2a] to-[#051C14]" : "bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700"}`}
          />
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="relative z-10 flex flex-col items-center pt-8 pb-6 px-6">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColor(member.name)} flex items-center justify-center text-white font-bold text-3xl shadow-xl ring-4 ring-white/10 overflow-hidden mb-3`}
            >
              {hasImage ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                style={{ display: hasImage ? "none" : "flex" }}
                className="w-full h-full items-center justify-center"
              >
                {member.name.charAt(0)}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-1">
              {member.name}
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] text-emerald-200 bg-white/5 backdrop-blur-sm">
              <MapPin size={11} /> {member.country}
            </span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="px-5 pt-5 pb-6">
          {/* Month label */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">
              {monthName}, {year}
            </span>
          </div>

          {paid ? (
            <>
              {/* Amount card */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-5 text-center mb-4">
                <p className="text-[11px] text-emerald-600/60 font-semibold uppercase tracking-wider mb-1">
                  প্রদত্ত পরিমাণ
                </p>
                <p className="text-3xl font-bold text-emerald-700">
                  {fmt(member.amount)}
                </p>
              </div>

              {/* Details grid */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Wallet size={14} className="text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-500">
                      পেমেন্ট মাধ্যম
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-lg ${st.bg} ${st.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {member.source}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Calendar size={14} className="text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-500">পেমেন্ট তারিখ</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {formatDate(member.date)}
                  </span>
                </div>

                {member.transactionId && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <CreditCard size={14} className="text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-500">
                        ট্রানজেকশন আইডি
                      </span>
                    </div>
                    <span className="text-[12px] font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      {member.transactionId}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-sm text-gray-500">স্ট্যাটাস</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                    ✓ পরিশোধিত
                  </span>
                </div>
              </div>

              {/* Download Receipt button */}
              <button
                onClick={() => {
                  // Generate professional receipt as PNG image using Canvas
                  const canvas = document.createElement("canvas");
                  const scale = 2; // Retina quality
                  const w = 500;
                  const h = 700;
                  canvas.width = w * scale;
                  canvas.height = h * scale;
                  const ctx = canvas.getContext("2d");
                  ctx.scale(scale, scale);

                  // Background
                  ctx.fillStyle = "#ffffff";
                  ctx.beginPath();
                  ctx.roundRect(0, 0, w, h, 20);
                  ctx.fill();

                  // Header gradient
                  const headerGrad = ctx.createLinearGradient(0, 0, w, 120);
                  headerGrad.addColorStop(0, "#051C14");
                  headerGrad.addColorStop(1, "#0a3d2a");
                  ctx.fillStyle = headerGrad;
                  ctx.beginPath();
                  ctx.roundRect(0, 0, w, 140, [20, 20, 0, 0]);
                  ctx.fill();

                  // Header text
                  ctx.fillStyle = "#ffffff";
                  ctx.font = "bold 18px sans-serif";
                  ctx.textAlign = "center";
                  ctx.fillText(
                    "মধ্য আলীয়ারা যুব কল্যাণ সংগঠন ও প্রবাসী ঐক্য পরিষদ",
                    w / 2,
                    50,
                  );
                  ctx.font = "13px sans-serif";
                  ctx.fillStyle = "#a7f3d0";
                  ctx.fillText("কচুয়া, চাঁদপুর", w / 2, 75);

                  // Receipt badge
                  ctx.fillStyle = "rgba(255,255,255,0.15)";
                  ctx.beginPath();
                  ctx.roundRect(w / 2 - 60, 95, 120, 28, 14);
                  ctx.fill();
                  ctx.fillStyle = "#d1fae5";
                  ctx.font = "bold 12px sans-serif";
                  ctx.fillText("পেমেন্ট রশিদ", w / 2, 114);

                  // Amount section
                  ctx.fillStyle = "#f0fdf4";
                  ctx.beginPath();
                  ctx.roundRect(30, 160, w - 60, 90, 16);
                  ctx.fill();
                  ctx.strokeStyle = "#bbf7d0";
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.roundRect(30, 160, w - 60, 90, 16);
                  ctx.stroke();

                  ctx.fillStyle = "#6b7280";
                  ctx.font = "11px sans-serif";
                  ctx.fillText("প্রদত্ত পরিমাণ", w / 2, 190);
                  ctx.fillStyle = "#047857";
                  ctx.font = "bold 32px sans-serif";
                  ctx.fillText(fmt(member.amount), w / 2, 232);

                  // Details section
                  ctx.textAlign = "left";
                  const detailsStartY = 280;
                  const lineHeight = 50;
                  const details = [
                    { label: "সদস্যের নাম", value: member.name },
                    {
                      label: "সদস্য আইডি",
                      value: member.memberId || member.id || "—",
                    },
                    { label: "মাস", value: `${monthName}, ${year}` },
                    { label: "পেমেন্ট মাধ্যম", value: member.source },
                    { label: "পেমেন্ট তারিখ", value: formatDate(member.date) },
                    {
                      label: "ট্রানজেকশন আইডি",
                      value: member.transactionId || "N/A",
                    },
                  ];

                  details.forEach((d, i) => {
                    const y = detailsStartY + i * lineHeight;
                    // Row bg
                    if (i % 2 === 0) {
                      ctx.fillStyle = "#f9fafb";
                      ctx.beginPath();
                      ctx.roundRect(30, y - 5, w - 60, 40, 8);
                      ctx.fill();
                    }
                    // Label
                    ctx.fillStyle = "#9ca3af";
                    ctx.font = "12px sans-serif";
                    ctx.fillText(d.label, 50, y + 20);
                    // Value
                    ctx.fillStyle = "#1f2937";
                    ctx.font = "bold 13px sans-serif";
                    ctx.textAlign = "right";
                    ctx.fillText(d.value, w - 50, y + 20);
                    ctx.textAlign = "left";
                  });

                  // Status badge
                  const statusY =
                    detailsStartY + details.length * lineHeight + 15;
                  ctx.fillStyle = "#ecfdf5";
                  ctx.beginPath();
                  ctx.roundRect(30, statusY, w - 60, 40, 10);
                  ctx.fill();
                  ctx.strokeStyle = "#a7f3d0";
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.roundRect(30, statusY, w - 60, 40, 10);
                  ctx.stroke();
                  ctx.fillStyle = "#059669";
                  ctx.font = "bold 14px sans-serif";
                  ctx.textAlign = "center";
                  ctx.fillText("✓ পরিশোধিত", w / 2, statusY + 26);

                  // Footer
                  ctx.fillStyle = "#d1d5db";
                  ctx.font = "10px sans-serif";
                  ctx.fillText(
                    "স্বয়ংক্রিয়ভাবে তৈরি রশিদ • মধ্য আলীয়ারা যুব কল্যাণ সংগঠন",
                    w / 2,
                    h - 20,
                  );

                  // Download
                  canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `রশিদ_${member.name}_${monthName}_${year}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }, "image/png");
                }}
                className="w-full cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-900 transition-all duration-300 hover:shadow-lg"
              >
                <Download size={16} />
                রশিদ ডাউনলোড করুন (PNG)
              </button>
            </>
          ) : (
            /* Unpaid state */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <X size={28} className="text-red-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-1">বকেয়া</h4>
              <p className="text-sm text-gray-400 mb-4">
                এই মাসের চাঁদা এখনো পরিশোধ করা হয়নি।
              </p>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-[11px] text-red-400/70 font-semibold uppercase tracking-wider mb-1">
                  বকেয়া পরিমাণ
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {fmt(MONTHLY_DUE)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ Section Header ═══ */
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color = "text-emerald-500",
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2.5 mb-1">
        <div
          className={`w-8 h-8 rounded-lg ${color === "text-emerald-500" ? "bg-emerald-100" : color === "text-blue-500" ? "bg-blue-100" : color === "text-violet-500" ? "bg-violet-100" : color === "text-amber-500" ? "bg-amber-100" : "bg-gray-100"} flex items-center justify-center`}
        >
          <Icon size={16} className={color} />
        </div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-400 pl-[42px]">{subtitle}</p>
      )}
    </div>
  );
}

/* ═══ Main Page ═══ */
export default function AccountsPage() {
  const router = useRouter();

  // Access Control State
  const [access, setAccess] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/account-access")
      .then((res) => res.json())
      .then((data) => setAccess(data.accessed))
      .catch(() => setAccess(false));
  }, []);

  const handleUnlock = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/account-access", {
        method: "POST",
        body: JSON.stringify({ password: passwordInput }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success || data.accessed) {
        // success from POST or accessed from cookie
        setAccess(true);
        setErrorMsg("");
      } else {
        setErrorMsg("ভুল পাসওয়ার্ড");
      }
    } catch (err) {
      setErrorMsg("সার্ভার ত্রুটি");
    }
  };

  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(2);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("সব");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedPaymentMember, setSelectedPaymentMember] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [isMobile, setIsMobile] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Graphic download state
  const [downloadingId, setDownloadingId] = useState(null);
  const printRef = useRef(null);
  const [printData, setPrintData] = useState(null);

  // Define avatarColor helper correctly before using it
  const avatarColor = useCallback((name) => {
    const colors = [
      "from-teal-400 to-emerald-500",
      "from-emerald-400 to-green-500",
      "from-cyan-400 to-blue-500",
      "from-blue-400 to-indigo-500",
      "from-indigo-400 to-violet-500",
      "from-violet-400 to-purple-500",
      "from-purple-400 to-fuchsia-500",
      "from-fuchsia-400 to-pink-500",
      "from-pink-400 to-rose-500",
      "from-rose-400 to-red-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [mRes, pRes, eRes] = await Promise.all([
          fetch("/api/members", {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          }),
          fetch("/api/payments", {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          }),
          fetch("/api/expenses", {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          }),
        ]);
        const mData = await mRes.json();
        const pData = await pRes.json();
        const eData = await eRes.json();
        if (mData.success) setMembers(mData.data || []);
        if (pData.success) setPayments(pData.data || []);
        if (eData.success) setExpenses(eData.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const allMembers = members;
  const allPayments = payments;

  const availableYears = useMemo(() => {
    const years = new Set(payments.map((p) => p.year));
    if (years.size === 0) return [2026]; // Default if no data
    return Array.from(years).sort((a, b) => b - a);
  }, [payments]);

  // If selectedYear not in availableYears, switch to latest?
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentMonthName = MONTH_NAMES[selectedMonth - 1];

  const paymentMap = useMemo(() => {
    const map = {};
    allPayments
      .filter((p) => p.year === selectedYear)
      .forEach((p) => {
        if (!map[p.memberId]) map[p.memberId] = {};
        map[p.memberId][p.month] = {
          amount: p.amount,
          source: p.source,
          date: p.date,
          transactionId: p.transactionId,
        };
      });
    return map;
  }, [selectedYear, allPayments]);

  const totalFund = useMemo(
    () => allPayments.reduce((s, p) => s + p.amount, 0),
    [allPayments],
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + (e.amount || 0), 0),
    [expenses],
  );
  const remainingBalance = totalFund - totalExpenses;

  const yearTotal = useMemo(
    () =>
      allPayments
        .filter((p) => p.year === selectedYear)
        .reduce((s, p) => s + p.amount, 0),
    [selectedYear, allPayments],
  );
  const yearExpenseTotal = useMemo(
    () =>
      expenses
        .filter((e) => e.year === selectedYear)
        .reduce((s, e) => s + (e.amount || 0), 0),
    [selectedYear, expenses],
  );
  const monthTotal = useMemo(
    () =>
      allPayments
        .filter((p) => p.year === selectedYear && p.month === selectedMonth)
        .reduce((s, p) => s + p.amount, 0),
    [selectedYear, selectedMonth, allPayments],
  );
  const monthExpenseTotal = useMemo(
    () =>
      expenses
        .filter((e) => e.year === selectedYear && e.month === selectedMonth)
        .reduce((s, e) => s + (e.amount || 0), 0),
    [selectedYear, selectedMonth, expenses],
  );

  const expenseCategories = useMemo(() => {
    const map = {};
    expenses
      .filter((e) => e.year === selectedYear)
      .forEach((e) => {
        const cat = e.category || "অন্যান্য";
        map[cat] = (map[cat] || 0) + (e.amount || 0);
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses, selectedYear]);

  const paidMembersThisMonth = useMemo(
    () =>
      allMembers.filter((m) => paymentMap[m.memberId || m.id]?.[selectedMonth])
        .length,
    [paymentMap, selectedMonth, allMembers],
  );
  const unpaidMembersThisMonth = allMembers.length - paidMembersThisMonth;
  const collectionRate = allMembers.length
    ? Math.round((paidMembersThisMonth / allMembers.length) * 100)
    : 0;

  const memberTotals = useMemo(() => {
    const map = {};
    allPayments.forEach((p) => {
      map[p.memberId] = (map[p.memberId] || 0) + p.amount;
    });
    return map;
  }, [allPayments]);

  const topContributors = useMemo(() => {
    return [...allMembers]
      .map((m) => ({ ...m, total: memberTotals[m.memberId || m.id] || 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [memberTotals, allMembers]);

  const countryStats = useMemo(() => {
    const map = {};
    allMembers.forEach((m) => {
      if (!map[m.country]) map[m.country] = { count: 0, total: 0 };
      map[m.country].count++;
      map[m.country].total += memberTotals[m.memberId || m.id] || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [memberTotals, allMembers]);

  const filteredMembers = useMemo(() => {
    let list = allMembers.filter((member) => {
      const memId = member.memberId || member.id;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        member.name.toLowerCase().includes(q) ||
        member.country.toLowerCase().includes(q) ||
        (memId && memId.toString().toLowerCase().includes(q));
      const matchSource =
        selectedSource === "সব" ||
        Object.values(paymentMap[memId] || {}).some(
          (p) => p.source === selectedSource,
        );
      return matchSearch && matchSource;
    });
    if (sortBy === "total")
      list = [...list].sort(
        (a, b) =>
          (memberTotals[b.memberId || b.id] || 0) -
          (memberTotals[a.memberId || a.id] || 0),
      );
    else if (sortBy === "status")
      list = [...list].sort((a, b) => {
        const aP = paymentMap[a.memberId || a.id]?.[selectedMonth] ? 1 : 0;
        const bP = paymentMap[b.memberId || b.id]?.[selectedMonth] ? 1 : 0;
        return bP - aP;
      });
    return list;
  }, [
    searchTerm,
    selectedSource,
    paymentMap,
    sortBy,
    selectedMonth,
    memberTotals,
    allMembers,
  ]);

  const monthContributions = useMemo(() => {
    const contributions = allMembers.map((member) => {
      const p = paymentMap[member.memberId || member.id]?.[selectedMonth];
      return {
        ...member,
        amount: p ? p.amount : 0,
        source: p ? p.source : "বকেয়া",
        date: p ? p.date : null,
        transactionId: p ? p.transactionId : null,
      };
    });
    // Sort: paid (পরিশোধিত) first, then unpaid (বকেয়া)
    contributions.sort((a, b) => {
      const aPaid = a.amount > 0 ? 1 : 0;
      const bPaid = b.amount > 0 ? 1 : 0;
      return bPaid - aPaid;
    });
    return contributions;
  }, [paymentMap, selectedMonth, allMembers]);

  const handleMemberClick = useCallback(
    (member) => {
      if (isMobile) {
        // Prefer database _id for routing, or fallback to memberId if _id is missing
        router.push(`/accounts/${member._id || member.id || member.memberId}`);
      } else {
        setSelectedMember(member);
      }
    },
    [isMobile, router],
  );

  const visibleMembers = showAllMembers
    ? filteredMembers
    : filteredMembers.slice(0, 12);

  if (access === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-emerald-600 font-bold animate-pulse">
        যাচাই করা হচ্ছে...
      </div>
    );
  }

  if (access === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            সুরক্ষিত পাতা
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            অ্যাকাউন্টস পেজটি দেখতে দয়া করে পাসওয়ার্ড দিন।
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-center text-lg tracking-widest"
                autoFocus
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-red-500 font-medium bg-red-50 py-2 rounded-lg">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              প্রবেশ করুন
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-6 md:mt-8">
            শুধুমাত্র অনুমোদিত সদস্যদের জন্য।
          </p>
        </div>
      </div>
    );
  }

  // Define graphic generation function
  const handleGenerateGraphic = async (
    member,
    total,
    yearPaid,
    yearPayments,
  ) => {
    if (downloadingId) return;
    setDownloadingId(member._id || member.id);

    // Set the data for the offscreen printable component
    setPrintData({ member, total, yearPaid, yearPayments, year: selectedYear });

    // Wait for state to apply and DOM to update
    setTimeout(async () => {
      try {
        if (!printRef.current) return;
        const graphicURL = await toPng(printRef.current, {
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          cacheBust: true,
          style: {
            transform: "none",
          },
        });

        // Trigger download
        const link = document.createElement("a");
        link.download = `Account_${member.name.replace(/\s+/g, "_")}_${selectedYear}.png`;
        link.href = graphicURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Error generating graphic:", err);
      } finally {
        setDownloadingId(null);
        setPrintData(null);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafb]">
      {/* Hidden container for graphic generation */}
      {printData && (
        <div className="absolute top-0 left-[-9999px]">
          <div
            ref={printRef}
            className="w-[600px] bg-white rounded-3xl overflow-hidden shadow-2xl relative"
            style={{
              backgroundImage:
                "radial-gradient(circle at top right, #f0fdf4, #ffffff)",
              padding: "40px",
            }}
          >
            {/* Header graphic background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-full inline-block font-bold text-sm shadow-md mb-4">
                <span className="text-center text-xl">
                  মধ্য আলীয়ারা যুব কল্যাণ সংগঠন ও প্রবাসী ঐক্য পরিষদ
                </span>
              </div>
              <div className="flex justify-center items-start mb-6">
                <div className="text-center">
                  <h1 className="text-3xl font-black text-emerald-800 text-center">
                    আর্থিক বিবরণী - {printData.year} সাল
                  </h1>
                </div>
              </div>

              {/* Profile Bar */}
              <div className="bg-white rounded-2xl p-5 shadow-lg shadow-emerald-100 mb-8 border border-emerald-50 flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColor(printData.member.name)} flex items-center justify-center text-white font-black text-3xl shrink-0 shadow-md overflow-hidden relative border-4 border-white`}
                >
                  {printData.member.image ? (
                    <img
                      src={printData.member.image}
                      alt=""
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    printData.member.name.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800 mb-1">
                    {printData.member.name}
                  </h2>
                  <p className="flex items-center gap-1.5 text-gray-500 font-semibold">
                    <MapPin size={16} className="text-emerald-500" />
                    {printData.member.country}
                    <span className="mx-2">•</span>
                    ID:{" "}
                    {printData.member.memberId || printData.member.id || "N/A"}
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100/50">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">
                    {printData.year} সালের জমা
                  </p>
                  <p className="text-4xl font-black text-emerald-700">
                    {fmt(printData.yearPaid)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">
                    সর্বমোট জমা (শুরু থেকে)
                  </p>
                  <p className="text-4xl font-black text-gray-800">
                    {fmt(printData.total)}
                  </p>
                </div>
              </div>

              {/* Monthly Calendar */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
                <h3 className="text-lg font-bold text-gray-800 mb-6">
                  মাসিক পেমেন্ট স্ট্যাটাস ({printData.year})
                </h3>
                <div className="grid grid-cols-4 gap-4 relative z-10">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const monthNum = i + 1;
                    const p = printData.yearPayments[monthNum];
                    const isPaid = !!p;
                    return (
                      <div
                        key={i}
                        className={`rounded-xl p-3 border-2 ${isPaid ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-slate-50/50"} text-center`}
                      >
                        <p
                          className={`text-xs font-bold mb-1 ${isPaid ? "text-emerald-700" : "text-slate-400"}`}
                        >
                          {MONTH_NAMES[i]}
                        </p>
                        {isPaid ? (
                          <p className="text-sm font-black text-emerald-600">
                            {fmt(p.amount)}
                          </p>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-slate-200 mx-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-100">
                <p className="text-xs text-gray-400 font-semibold mb-1">
                  এই রিপোর্টটি সিস্টেম থেকে স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।
                </p>
                <div className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  <Shield size={12} />
                  Verified Record
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal (Desktop only) */}
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          allPayments={allPayments}
        />
      )}
      {/* Payment Detail Modal */}
      {selectedPaymentMember && (
        <PaymentDetailModal
          member={selectedPaymentMember}
          monthName={currentMonthName}
          year={selectedYear}
          onClose={() => setSelectedPaymentMember(null)}
        />
      )}

      {/* ══════ Hero ══════ */}
      <div className="relative bg-[#051C14] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 pt-24 pb-16 md:pt-28 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-300 mb-5">
            <Shield size={14} /> স্বচ্ছ আর্থিক ব্যবস্থাপনা
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif mb-4 leading-tight">
            আর্থিক হিসাব-নিকাশ
          </h1>
          <p className="text-emerald-100/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            প্রতিটি অবদান নথিভুক্ত এবং দৃশ্যমান। সদস্যভিত্তিক, মাসিক ও বার্ষিক
            সকল আর্থিক তথ্য এখানে উপস্থাপিত।
          </p>
        </div>
      </div>

      <div className="mx-auto px-4 md:px-8 max-w-7xl">
        {/* ══════ 1. Financial Overview (3 big cards) ══════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 -mt-8 relative z-10 mb-6">
          {/* Total Income */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-emerald-100 p-5 md:p-6 group hover:shadow-xl transition-all duration-300">
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-emerald-500 opacity-10 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                  <ArrowDownRight size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  আয়
                </span>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                সর্বমোট আয়
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {fmt(totalFund)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {allMembers.length} জন সদস্য থেকে
              </p>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-red-100 p-5 md:p-6 group hover:shadow-xl transition-all duration-300">
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-red-500 opacity-10 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-200">
                  <ArrowUpRight size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  ব্যয়
                </span>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                সর্বমোট খরচ
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {fmt(totalExpenses)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {expenses.length}টি খরচ রেকর্ড
              </p>
            </div>
          </div>

          {/* Remaining Balance */}
          <div
            className={`relative overflow-hidden bg-white rounded-2xl border ${remainingBalance >= 0 ? "border-blue-100" : "border-orange-100"} p-5 md:p-6 group hover:shadow-xl transition-all duration-300`}
          >
            <div
              className={`absolute -top-8 -right-8 w-28 h-28 rounded-full ${remainingBalance >= 0 ? "bg-blue-500" : "bg-orange-500"} opacity-10 group-hover:scale-125 transition-transform duration-500`}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${remainingBalance >= 0 ? "from-blue-500 to-indigo-600 shadow-blue-200" : "from-orange-500 to-red-600 shadow-orange-200"} flex items-center justify-center shadow-lg`}
                >
                  <Wallet size={20} className="text-white" />
                </div>
                <span
                  className={`text-[10px] font-bold ${remainingBalance >= 0 ? "text-blue-600 bg-blue-50" : "text-orange-600 bg-orange-50"} px-2.5 py-1 rounded-full uppercase tracking-wider`}
                >
                  ব্যালেন্স
                </span>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                অবশিষ্ট তহবিল
              </p>
              <p
                className={`text-2xl md:text-3xl font-bold ${remainingBalance >= 0 ? "text-gray-900" : "text-orange-600"}`}
              >
                {fmt(remainingBalance)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {remainingBalance >= 0 ? "সুরক্ষিত তহবিল" : "ঘাটতি রয়েছে"}
              </p>
            </div>
          </div>
        </div>

        {/* ══════ 6. All Members Directory ══════ */}
        <div className="mb-10">
          <SectionHeader
            icon={Users}
            title="সদস্য তালিকা"
            subtitle={`মোট ${allMembers.length} জন সদস্য`}
            color="text-emerald-500"
          />

          {/* Search + Filters + Year/Month */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Box */}
              <div className="relative w-full lg:w-96 shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-emerald-500" />
                </div>
                <input
                  type="text"
                  placeholder="সদস্যের নাম বা দেশ খুঁজুন..."
                  className="block w-full pl-10 pr-3 py-3 border-2 border-slate-100 rounded-xl text-sm bg-slate-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 flex-wrap">
                  {PAYMENT_SOURCES.map((source) => {
                    const active = selectedSource === source;
                    const st = SOURCE_STYLES[source];
                    return (
                      <button
                        key={source}
                        onClick={() =>
                          setSelectedSource(active ? "সব" : source)
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${active ? `${st.bg} ${st.text} shadow-sm` : "text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${active ? st.dot : "bg-gray-300"}`}
                        />
                        {source}
                      </button>
                    );
                  })}
                </div>

                <div className="h-8 w-px bg-gray-200 hidden xl:block" />

                {/* Year / Month / Sort selectors in line */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="appearance-none bg-white border-2 border-slate-100 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      {availableYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="appearance-none bg-white border-2 border-slate-100 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      {MONTH_NAMES.map((name, i) => (
                        <option key={i} value={i + 1}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border-2 border-slate-100 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <option value="name">নাম</option>
                      <option value="total">মোট</option>
                      <option value="status">স্ট্যাটাস</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {visibleMembers.map((member) => {
              const memberId = member.memberId || member.id;
              const mTotal = memberTotals[memberId] || 0;
              const yearPayments = paymentMap[memberId] || {};
              const yearPaid = Object.values(yearPayments).reduce(
                (s, p) => s + p.amount,
                0,
              );
              const monthsPaid = Object.keys(yearPayments).length;
              const thisMonthPaid = !!yearPayments[selectedMonth];

              return (
                <div
                  key={member._id || member.id}
                  className="bg-white rounded-2xl border border-gray-100 p-3.5 md:p-4 hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Avatar + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 md:w-11 md:h-11 rounded-xl bg-linear-to-br ${avatarColor(member.name)} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md overflow-hidden`}
                    >
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        style={{ display: member.image ? "none" : "flex" }}
                        className="w-full h-full items-center justify-center"
                      >
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div
                      className={`px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-bold ${thisMonthPaid ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-400"}`}
                    >
                      {thisMonthPaid ? "✓ পরিশোধিত" : "বকেয়া"}
                    </div>
                  </div>

                  {/* Name + Country */}
                  <h4 className="text-sm font-bold text-gray-900 mb-0.5 truncate">
                    {member.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 flex items-center gap-1 mb-4 font-medium">
                    <MapPin size={10} className="text-emerald-500" />
                    {member.country}
                  </p>

                  {/* Highlighted Stats Block */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
                    <div className="grid grid-cols-3 gap-2 divide-x divide-slate-200">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-semibold mb-0.5 uppercase tracking-wider">
                          সর্বমোট
                        </p>
                        <p className="text-xs sm:text-sm font-black text-gray-800">
                          {fmt(mTotal)}
                        </p>
                      </div>
                      <div className="text-center px-2">
                        <p className="text-[10px] text-gray-400 font-semibold mb-0.5 uppercase tracking-wider">
                          {selectedYear}
                        </p>
                        <p className="text-xs sm:text-sm font-black text-emerald-600">
                          {fmt(yearPaid)}
                        </p>
                      </div>
                      <div className="text-center pl-2">
                        <p className="text-[10px] text-gray-400 font-semibold mb-0.5 uppercase tracking-wider">
                          মাস
                        </p>
                        <p className="text-xs sm:text-sm font-black text-violet-600">
                          {monthsPaid}/<span className="text-xs">১২</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Status Grid */}
                  <div className="mb-5">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      মাসিক পেমেন্ট স্ট্যাটাস ({selectedYear})
                    </p>
                    <div className="flex w-full gap-0.5">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const monthNum = i + 1;
                        const p = yearPayments[monthNum];
                        const isPaid = !!p;
                        return (
                          <div
                            key={i}
                            className={`flex-1 h-2 sm:h-2.5 rounded-full ${isPaid ? "bg-emerald-500 shadow-sm" : "bg-slate-200"}`}
                            title={`${MONTH_SHORT[i]}: ${isPaid ? fmt(p.amount) : "বকেয়া"}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMemberClick(member)}
                      className="flex-1 cursor-pointer py-2 rounded-xl border-2 border-slate-100 text-xs font-bold text-gray-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                    >
                      বিস্তারিত দেখুন
                    </button>
                    <button
                      onClick={() =>
                        handleGenerateGraphic(
                          member,
                          mTotal,
                          yearPaid,
                          yearPayments,
                        )
                      }
                      disabled={downloadingId === (member._id || member.id)}
                      className={`cursor-pointer w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                      title="অ্যাকাউন্টিং রিপোর্ট ডাউনলোড করুন"
                    >
                      {downloadingId === (member._id || member.id) ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <Download size={14} strokeWidth={2.5} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">কোনো সদস্য পাওয়া যায়নি</p>
            </div>
          )}

          {/* Show more / less */}
          {filteredMembers.length > 12 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAllMembers(!showAllMembers)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md transition-all duration-200"
              >
                {showAllMembers
                  ? "কম দেখুন"
                  : `সব ${filteredMembers.length} জন দেখুন`}
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${showAllMembers ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          )}
        </div>

        {/* ══════ 7. Compliance ══════ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
              <Shield size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                যাচাইকৃত খতিয়ান কমপ্লায়েন্স
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                এই খতিয়ানটি আমাদের মাল্টি-সিগনেচার ওয়ালেট এবং ব্যাংক
                স্টেটমেন্ট থেকে স্বয়ংক্রিয়ভাবে তৈরি। প্রতিটি এন্ট্রি
                ক্রস-রেফারেন্স করা হয়েছে।
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#051C14] text-white text-sm font-semibold hover:bg-[#0a3d2a] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download size={16} />
                অডিট রিপোর্ট {selectedYear}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
