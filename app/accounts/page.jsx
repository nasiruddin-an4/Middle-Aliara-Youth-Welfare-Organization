"use client";

import React, { useState, useMemo } from "react";
import membersData from "../data/members.json";
import accountsData from "../data/accounts.json";
import {
  Search,
  Shield,
  TrendingUp,
  Calendar,
  Wallet,
  CheckCircle2,
  Download,
  Filter,
  ChevronDown,
  Globe,
  Phone,
  MessageCircle,
} from "lucide-react";

/* ─── Constants ─── */
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

const PAYMENT_SOURCES = ["বিকাশ", "ব্যাংক", "নগদ", "রকেট"];

const SOURCE_STYLES = {
  বিকাশ: { bg: "bg-pink-50", text: "text-pink-600", dot: "bg-pink-500" },
  ব্যাংক: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  নগদ: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" },
  রকেট: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" },
  বকেয়া: { bg: "bg-red-50", text: "text-red-400", dot: "bg-red-400" },
};

const AVAILABLE_YEARS = [2026];

/* ─── All members from members.json ─── */
const allMembers = membersData.members;

/* ─── All payments from accounts.json ─── */
const allPayments = accountsData.payments;

/* ─── Helpers ─── */
const fmt = (n) => "৳" + n.toLocaleString("bn-BD");

const avatarColor = (name) => {
  const c = [
    "from-sky-400 to-blue-500",
    "from-emerald-400 to-teal-500",
    "from-violet-400 to-purple-500",
    "from-amber-400 to-orange-500",
    "from-rose-400 to-pink-500",
    "from-cyan-400 to-teal-500",
    "from-indigo-400 to-blue-500",
    "from-fuchsia-400 to-pink-500",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return c[Math.abs(h) % c.length];
};

/* ─── Page Component ─── */
export default function AccountsPage() {
  /* Filters */
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(2); // 1-indexed, Feb
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("সব");

  /* Current month name */
  const currentMonthName = MONTH_NAMES[selectedMonth - 1];

  /* ── Derive payment lookup: { memberId -> { monthNum -> { amount, source } } } ── */
  const paymentMap = useMemo(() => {
    const map = {};
    allPayments
      .filter((p) => p.year === selectedYear)
      .forEach((p) => {
        if (!map[p.memberId]) map[p.memberId] = {};
        map[p.memberId][p.month] = { amount: p.amount, source: p.source };
      });
    return map;
  }, [selectedYear]);

  /* ── Summary stats ── */
  const totalFund = useMemo(() => {
    return allPayments.reduce((s, p) => s + p.amount, 0);
  }, []);

  const yearTotal = useMemo(() => {
    return allPayments
      .filter((p) => p.year === selectedYear)
      .reduce((s, p) => s + p.amount, 0);
  }, [selectedYear]);

  const monthTotal = useMemo(() => {
    return allPayments
      .filter((p) => p.year === selectedYear && p.month === selectedMonth)
      .reduce((s, p) => s + p.amount, 0);
  }, [selectedYear, selectedMonth]);

  /* ── Filtered members (for table + cards) ── */
  const filteredMembers = useMemo(() => {
    return allMembers.filter((member) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        member.name.toLowerCase().includes(q) ||
        member.country.toLowerCase().includes(q) ||
        member.id.includes(searchTerm);

      const matchSource =
        selectedSource === "সব" ||
        Object.values(paymentMap[member.id] || {}).some(
          (p) => p.source === selectedSource,
        );

      return matchSearch && matchSource;
    });
  }, [searchTerm, selectedSource, paymentMap]);

  /* ── This month's contribution list ── */
  const monthContributions = useMemo(() => {
    return allMembers.map((member) => {
      const p = paymentMap[member.id]?.[selectedMonth];
      return {
        ...member,
        amount: p ? p.amount : 0,
        source: p ? p.source : "বকেয়া",
      };
    });
  }, [paymentMap, selectedMonth]);

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafb]">
      {/* ════════ Hero ════════ */}
      <div className="bg-[#051C14] text-white py-16 mb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">
            আর্থিক স্বচ্ছতা
          </h1>
          <p className="text-emerald-100/80 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            প্রতিটি অবদান নথিভুক্ত এবং দৃশ্যমান। স্বচ্ছতার জন্য মাসিক অবস্থা এবং
            পেমেন্ট সোর্স ফিল্টার করুন।
          </p>
        </div>
      </div>

      <div className="mx-auto px-4 md:px-8 max-w-7xl">
        {/* ════════ Year / Month Selectors ════════ */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Year */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 pl-1">
              বছর
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Month */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 pl-1">
              মাস
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* ════════ Summary Stats ════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {/* Total Fund */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Wallet size={20} className="text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  সর্বমোট তহবিল
                </span>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">
                {fmt(totalFund)}
              </p>
            </div>
          </div>

          {/* Year Total */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <TrendingUp size={20} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {selectedYear} সালের মোট
                </span>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">
                {fmt(yearTotal)}
              </p>
            </div>
          </div>

          {/* Month Total */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Calendar size={20} className="text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {currentMonthName} মাসের সংগ্রহ
                </span>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">
                {fmt(monthTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* ════════ Search & Source Filters ════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="সদস্য বা দেশ খুঁজুন..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Payment source buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500 mr-1">
                পেমেন্ট সোর্স:
              </span>
              {PAYMENT_SOURCES.map((source) => {
                const active = selectedSource === source;
                const st = SOURCE_STYLES[source];
                return (
                  <button
                    key={source}
                    onClick={() => setSelectedSource(active ? "সব" : source)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                      active
                        ? `${st.bg} ${st.text} border-current`
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        active ? st.dot : "bg-gray-300"
                      }`}
                    />
                    {source}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ════════ Yearly Overview Table ════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-14">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide sticky left-0 bg-gray-50/80 z-10 min-w-[200px]">
                    সদস্য
                  </th>
                  {MONTH_NAMES.map((m, i) => (
                    <th
                      key={m}
                      className={`text-center px-3 py-4 text-xs font-semibold tracking-wide min-w-[90px] ${
                        i + 1 === selectedMonth
                          ? "text-emerald-600 bg-emerald-50/50"
                          : "text-gray-500"
                      }`}
                    >
                      {m}
                    </th>
                  ))}
                  <th className="text-center px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wide bg-gray-100/50 min-w-[120px]">
                    বার্ষিক অবদান
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, idx) => {
                  const memberPayments = paymentMap[member.id] || {};
                  const annual = Object.values(memberPayments).reduce(
                    (s, p) => s + p.amount,
                    0,
                  );
                  return (
                    <tr
                      key={member.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      {/* Member — sticky */}
                      <td className="px-5 py-3.5 sticky left-0 bg-inherit z-10">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg bg-gradient-to-br ${avatarColor(
                              member.name,
                            )} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                          >
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {member.name}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {member.country}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Monthly cells */}
                      {MONTH_NAMES.map((_, mi) => {
                        const p = memberPayments[mi + 1];
                        const paid = p && p.amount > 0;
                        return (
                          <td
                            key={mi}
                            className={`text-center px-3 py-3.5 ${
                              mi + 1 === selectedMonth ? "bg-emerald-50/30" : ""
                            }`}
                          >
                            {paid ? (
                              <span className="inline-block text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                {fmt(p.amount)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-200">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Annual */}
                      <td className="text-center px-4 py-3.5 bg-gray-50/40">
                        <span
                          className={`text-sm font-bold ${
                            annual > 0 ? "text-gray-900" : "text-gray-300"
                          }`}
                        >
                          {fmt(annual)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ════════ Selected Month Collection Detail ════════ */}
        <div className="mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            {currentMonthName}, {selectedYear} — এর সদস্যভিত্তিক অবদান
          </h2>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {monthContributions.map((item, index) => {
              const st = SOURCE_STYLES[item.source] || SOURCE_STYLES["বকেয়া"];
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors duration-200 ${
                    index !== monthContributions.length - 1
                      ? "border-b border-gray-50"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarColor(
                      item.name,
                    )} flex items-center justify-center text-white font-bold text-lg shrink-0`}
                  >
                    {item.name.charAt(0)}
                  </div>

                  {/* Name + Country */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-400">{item.country}</p>
                  </div>

                  {/* Amount + source badge */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`text-sm font-bold ${
                        item.amount > 0 ? "text-gray-900" : "text-gray-300"
                      }`}
                    >
                      {item.amount > 0 ? fmt(item.amount) : "৳০.০০"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {item.source}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ════════ Compliance Section ════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Shield size={24} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                যাচাইকৃত খতিয়ান কমপ্লায়েন্স
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                এই খতিয়ানটি আমাদের মাল্টি-সিগনেচার ওয়ালেট এবং ব্যাংক
                স্টেটমেন্ট থেকে স্বয়ংক্রিয়ভাবে তৈরি। বিকাশ, ব্যাংক বা নগদের
                মাধ্যমে প্রতিটি এন্ট্রি মার্চেন্ট ট্রানজেকশন আইডির সাথে
                ক্রস-রেফারেন্স করা হয়েছে। কোনো অসঙ্গতির জন্য দয়াকরে রসিদ সহ
                কোষাধ্যক্ষের সাথে যোগাযোগ করুন।
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#051C14] text-white text-sm font-semibold hover:bg-[#0a3d2a] transition-colors duration-200"
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
