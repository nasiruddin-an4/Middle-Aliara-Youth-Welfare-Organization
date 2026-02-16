"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import membersData from "../data/members.json";
import accountsData from "../data/accounts.json";
import {
  Search, Shield, TrendingUp, Calendar, Wallet, CheckCircle2,
  Download, ChevronDown, X, Globe,
  Users, BarChart3, Eye, ChevronRight,
  Award, MapPin, CreditCard, Phone,
} from "lucide-react";

const MONTH_NAMES = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
const MONTH_SHORT = ["জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
const PAYMENT_SOURCES = ["বিকাশ", "ব্যাংক", "নগদ", "রকেট"];
const SOURCE_STYLES = {
  বিকাশ: { bg: "bg-pink-50", text: "text-pink-600", dot: "bg-pink-500", border: "border-pink-200" },
  ব্যাংক: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500", border: "border-blue-200" },
  নগদ: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500", border: "border-orange-200" },
  রকেট: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500", border: "border-purple-200" },
  বকেয়া: { bg: "bg-red-50", text: "text-red-400", dot: "bg-red-400", border: "border-red-200" },
};
const AVAILABLE_YEARS = [2026];
const MONTHLY_DUE = accountsData.monthlyDue || 2000;

const allMembers = membersData.members;
const allPayments = accountsData.payments;

const fmt = (n) => "৳" + n.toLocaleString("bn-BD");
const avatarColor = (name) => {
  const c = [
    "from-sky-400 to-blue-600", "from-emerald-400 to-teal-600",
    "from-violet-400 to-purple-600", "from-amber-400 to-orange-600",
    "from-rose-400 to-pink-600", "from-cyan-400 to-teal-600",
    "from-indigo-400 to-blue-600", "from-fuchsia-400 to-pink-600",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return c[Math.abs(h) % c.length];
};

/* ═══ Member Detail Modal (Desktop only) ═══ */
function MemberModal({ member, onClose }) {
  if (!member) return null;
  const memberPayments = allPayments.filter((p) => p.memberId === member.id);
  const totalPaid = memberPayments.reduce((s, p) => s + p.amount, 0);
  const paidMonths = memberPayments.length;
  const byYear = {};
  memberPayments.forEach((p) => {
    if (!byYear[p.year]) byYear[p.year] = { total: 0, months: {} };
    byYear[p.year].total += p.amount;
    byYear[p.year].months[p.month] = p;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-[#051C14] rounded-t-3xl p-6 pb-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"><X size={22} /></button>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${avatarColor(member.name)} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>{member.name.charAt(0)}</div>
            <div>
              <h3 className="text-xl font-bold text-white">{member.name}</h3>
              <p className="text-emerald-300/80 text-sm flex items-center gap-1.5 mt-1"><MapPin size={13} /> {member.country}</p>
              <p className="text-emerald-300/60 text-xs flex items-center gap-1.5 mt-0.5"><Phone size={12} /> {member.mobile}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 p-5 -mt-4">
          {[
            { label: "সর্বমোট প্রদান", value: fmt(totalPaid), color: "bg-emerald-50 text-emerald-700" },
            { label: "পরিশোধিত মাস", value: paidMonths, color: "bg-blue-50 text-blue-700" },
            { label: "মাসিক চাঁদা", value: fmt(MONTHLY_DUE), color: "bg-amber-50 text-amber-700" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] font-medium opacity-70 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="px-5 pb-6">
          {Object.keys(byYear).sort((a, b) => b - a).map((year) => (
            <div key={year} className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-800">{year} সালের বিবরণ</h4>
                <span className="text-sm font-bold text-emerald-600">{fmt(byYear[year].total)}</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {MONTH_NAMES.map((m, i) => {
                  const p = byYear[year].months[i + 1];
                  const paid = !!p;
                  return (
                    <div key={i} className={`rounded-xl p-2 text-center border transition-all ${paid ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-100"}`}>
                      <p className="text-[10px] font-medium text-gray-500 mb-1">{MONTH_SHORT[i]}</p>
                      {paid ? (
                        <>
                          <CheckCircle2 size={16} className="text-emerald-500 mx-auto mb-0.5" />
                          <p className="text-[10px] font-bold text-emerald-700">{fmt(p.amount)}</p>
                          <p className="text-[8px] text-gray-400">{p.source}</p>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full bg-gray-200 mx-auto mb-0.5" />
                          <p className="text-[10px] text-gray-300">বকেয়া</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ Section Header ═══ */
function SectionHeader({ icon: Icon, title, subtitle, color = "text-emerald-500" }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2.5 mb-1">
        <div className={`w-8 h-8 rounded-lg ${color === "text-emerald-500" ? "bg-emerald-100" : color === "text-blue-500" ? "bg-blue-100" : color === "text-violet-500" ? "bg-violet-100" : color === "text-amber-500" ? "bg-amber-100" : "bg-gray-100"} flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {subtitle && <p className="text-xs text-gray-400 pl-[42px]">{subtitle}</p>}
    </div>
  );
}

/* ═══ Main Page ═══ */
export default function AccountsPage() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(2);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("সব");
  const [selectedMember, setSelectedMember] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [isMobile, setIsMobile] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentMonthName = MONTH_NAMES[selectedMonth - 1];

  const paymentMap = useMemo(() => {
    const map = {};
    allPayments.filter((p) => p.year === selectedYear).forEach((p) => {
      if (!map[p.memberId]) map[p.memberId] = {};
      map[p.memberId][p.month] = { amount: p.amount, source: p.source };
    });
    return map;
  }, [selectedYear]);

  const totalFund = useMemo(() => allPayments.reduce((s, p) => s + p.amount, 0), []);
  const yearTotal = useMemo(() => allPayments.filter((p) => p.year === selectedYear).reduce((s, p) => s + p.amount, 0), [selectedYear]);
  const monthTotal = useMemo(() => allPayments.filter((p) => p.year === selectedYear && p.month === selectedMonth).reduce((s, p) => s + p.amount, 0), [selectedYear, selectedMonth]);

  const paidMembersThisMonth = useMemo(() => allMembers.filter((m) => paymentMap[m.id]?.[selectedMonth]).length, [paymentMap, selectedMonth]);
  const unpaidMembersThisMonth = allMembers.length - paidMembersThisMonth;
  const collectionRate = Math.round((paidMembersThisMonth / allMembers.length) * 100);

  const memberTotals = useMemo(() => {
    const map = {};
    allPayments.forEach((p) => { map[p.memberId] = (map[p.memberId] || 0) + p.amount; });
    return map;
  }, []);

  const topContributors = useMemo(() => {
    return [...allMembers].map((m) => ({ ...m, total: memberTotals[m.id] || 0 })).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [memberTotals]);

  const countryStats = useMemo(() => {
    const map = {};
    allMembers.forEach((m) => {
      if (!map[m.country]) map[m.country] = { count: 0, total: 0 };
      map[m.country].count++;
      map[m.country].total += memberTotals[m.id] || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [memberTotals]);

  const filteredMembers = useMemo(() => {
    let list = allMembers.filter((member) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !searchTerm || member.name.toLowerCase().includes(q) || member.country.toLowerCase().includes(q) || member.id.includes(searchTerm);
      const matchSource = selectedSource === "সব" || Object.values(paymentMap[member.id] || {}).some((p) => p.source === selectedSource);
      return matchSearch && matchSource;
    });
    if (sortBy === "total") list = [...list].sort((a, b) => (memberTotals[b.id] || 0) - (memberTotals[a.id] || 0));
    else if (sortBy === "status") list = [...list].sort((a, b) => {
      const aP = paymentMap[a.id]?.[selectedMonth] ? 1 : 0;
      const bP = paymentMap[b.id]?.[selectedMonth] ? 1 : 0;
      return bP - aP;
    });
    return list;
  }, [searchTerm, selectedSource, paymentMap, sortBy, selectedMonth, memberTotals]);

  const monthContributions = useMemo(() => {
    return allMembers.map((member) => {
      const p = paymentMap[member.id]?.[selectedMonth];
      return { ...member, amount: p ? p.amount : 0, source: p ? p.source : "বকেয়া" };
    });
  }, [paymentMap, selectedMonth]);

  const handleMemberClick = useCallback((member) => {
    if (isMobile) {
      router.push(`/accounts/${member.id}`);
    } else {
      setSelectedMember(member);
    }
  }, [isMobile, router]);

  const visibleMembers = showAllMembers ? filteredMembers : filteredMembers.slice(0, 12);

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafb]">
      {/* Modal (Desktop only) */}
      {selectedMember && <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}

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
            প্রতিটি অবদান নথিভুক্ত এবং দৃশ্যমান। সদস্যভিত্তিক, মাসিক ও বার্ষিক সকল আর্থিক তথ্য এখানে উপস্থাপিত।
          </p>
        </div>
      </div>

      <div className="mx-auto px-4 md:px-8 max-w-7xl">

        {/* ══════ 1. Summary Stats ══════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 -mt-8 relative z-10 mb-10">
          {[
            { icon: Wallet, label: "সর্বমোট তহবিল", value: fmt(totalFund), accent: "bg-emerald-500", sub: `${allMembers.length} জন সদস্য` },
            { icon: TrendingUp, label: `${selectedYear} সালের মোট`, value: fmt(yearTotal), accent: "bg-blue-500" },
            { icon: Calendar, label: `${currentMonthName} সংগ্রহ`, value: fmt(monthTotal), accent: "bg-amber-500", sub: `${paidMembersThisMonth}/${allMembers.length} জন` },
            { icon: BarChart3, label: "সংগ্রহের হার", value: `${collectionRate}%`, accent: "bg-violet-500", sub: `${unpaidMembersThisMonth} জন বকেয়া` },
          ].map((card) => (
            <div key={card.label} className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-4 md:p-5 group hover:shadow-lg transition-all duration-300">
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${card.accent} opacity-20 group-hover:scale-125 transition-transform duration-500`} />
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-9 h-9 rounded-xl ${card.accent} flex items-center justify-center`}>
                    <card.icon size={18} className="text-white" />
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wide leading-tight">{card.label}</span>
                </div>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{card.value}</p>
                {card.sub && <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{card.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* ══════ 2. Year / Month Selectors ══════ */}
        <div className="flex flex-wrap items-end gap-3 mb-10">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 pl-1">বছর</label>
            <div className="relative">
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer shadow-sm">
                {AVAILABLE_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 pl-1">মাস</label>
            <div className="relative">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer shadow-sm">
                {MONTH_NAMES.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ══════ 3. Monthly Collection Chart ══════ */}
        <div className="mb-10">
          <SectionHeader icon={BarChart3} title={`${selectedYear} — মাসভিত্তিক সংগ্রহ`} subtitle="প্রতিটি মাসের সংগ্রহের অগ্রগতি" color="text-violet-500" />
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 md:gap-3">
              {MONTH_NAMES.map((m, i) => {
                const mTotal = allPayments.filter((p) => p.year === selectedYear && p.month === i + 1).reduce((s, p) => s + p.amount, 0);
                const expected = allMembers.length * MONTHLY_DUE;
                const pct = expected > 0 ? Math.round((mTotal / expected) * 100) : 0;
                const isSelected = i + 1 === selectedMonth;
                return (
                  <button key={i} onClick={() => setSelectedMonth(i + 1)} className={`rounded-xl p-2.5 md:p-3 text-center border transition-all duration-200 ${isSelected ? "bg-emerald-50 border-emerald-300 shadow-sm ring-2 ring-emerald-500/20" : "bg-gray-50/70 border-gray-100 hover:border-gray-200 hover:bg-white"}`}>
                    <p className={`text-[9px] md:text-[10px] font-bold mb-1.5 ${isSelected ? "text-emerald-600" : "text-gray-400"}`}>{MONTH_SHORT[i]}</p>
                    <div className="w-full bg-gray-200 rounded-full h-10 md:h-12 relative overflow-hidden mb-1">
                      <div className={`absolute bottom-0 w-full rounded-full transition-all duration-500 ${isSelected ? "bg-emerald-500" : pct > 0 ? "bg-gray-400" : "bg-gray-200"}`} style={{ height: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <p className={`text-[9px] md:text-[10px] font-bold ${isSelected ? "text-emerald-700" : "text-gray-500"}`}>{pct}%</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══════ 4. This Month's Payment Status ══════ */}
        <div className="mb-10">
          <SectionHeader icon={Calendar} title={`${currentMonthName}, ${selectedYear} — সদস্যভিত্তিক অবদান`} subtitle={`মোট ৳${monthTotal.toLocaleString("bn-BD")} সংগ্রহ হয়েছে`} color="text-amber-500" />

          {/* Payment / Unpaid / Total mini-stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-3 md:p-4 text-center">
              <CheckCircle2 size={22} className="mx-auto text-emerald-500 mb-1" />
              <p className="text-xl md:text-2xl font-bold text-emerald-700">{paidMembersThisMonth}</p>
              <p className="text-[10px] text-emerald-600/70 font-semibold">পরিশোধিত</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-100 p-3 md:p-4 text-center">
              <X size={22} className="mx-auto text-red-400 mb-1" />
              <p className="text-xl md:text-2xl font-bold text-red-500">{unpaidMembersThisMonth}</p>
              <p className="text-[10px] text-red-400/70 font-semibold">বকেয়া</p>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 md:p-4 text-center">
              <CreditCard size={22} className="mx-auto text-blue-500 mb-1" />
              <p className="text-xl md:text-2xl font-bold text-blue-700">{fmt(monthTotal)}</p>
              <p className="text-[10px] text-blue-600/70 font-semibold">মোট সংগ্রহ</p>
            </div>
          </div>

          {/* Member cards for this month */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {monthContributions.map((item) => {
              const st = SOURCE_STYLES[item.source] || SOURCE_STYLES["বকেয়া"];
              const paid = item.amount > 0;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-3.5 md:p-4 transition-all duration-300 group hover:shadow-lg ${paid ? "border-emerald-100" : "border-gray-100"
                    }`}
                >
                  {/* Avatar + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl bg-linear-to-br ${avatarColor(item.name)} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md`}>
                      {item.name.charAt(0)}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-lg ${paid ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-400"
                      }`}>
                      {paid ? "✓" : "✗"} {paid ? "পরিশোধিত" : "বকেয়া"}
                    </span>
                  </div>

                  {/* Name */}
                  <h4 className="text-sm font-bold text-gray-800 truncate mb-0.5">{item.name}</h4>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-3">
                    <MapPin size={9} />{item.country}
                  </p>

                  {/* Amount + Source + View Details */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-base md:text-lg font-bold ${paid ? "text-emerald-600" : "text-gray-300"}`}>
                      {paid ? fmt(item.amount) : "৳০"}
                    </span>
                    {paid && (
                      <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                        <span className={`w-1 h-1 rounded-full ${st.dot}`} />
                        {item.source}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleMemberClick(item)}
                      className="cursor-pointer px-3 py-1 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200"
                    >
                      বিস্তারিত দেখুন
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════ 6. All Members Directory ══════ */}
        <div className="mb-10">
          <SectionHeader icon={Users} title="সদস্য তালিকা" subtitle={`মোট ${allMembers.length} জন সদস্য`} color="text-emerald-500" />

          {/* Search + Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input type="text" placeholder="সদস্য বা দেশ খুঁজুন..." className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {PAYMENT_SOURCES.map((source) => {
                  const active = selectedSource === source;
                  const st = SOURCE_STYLES[source];
                  return (
                    <button key={source} onClick={() => setSelectedSource(active ? "সব" : source)} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${active ? `${st.bg} ${st.text} ${st.border}` : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? st.dot : "bg-gray-300"}`} />
                      {source}
                    </button>
                  );
                })}
                <div className="h-5 w-px bg-gray-200 hidden sm:block" />
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-2.5 pr-7 py-1.5 text-[11px] font-medium text-gray-600 focus:outline-none cursor-pointer">
                    <option value="name">নাম</option>
                    <option value="total">মোট</option>
                    <option value="status">স্ট্যাটাস</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {visibleMembers.map((member) => {
              const mTotal = memberTotals[member.id] || 0;
              const yearPayments = paymentMap[member.id] || {};
              const yearPaid = Object.values(yearPayments).reduce((s, p) => s + p.amount, 0);
              const monthsPaid = Object.keys(yearPayments).length;
              const thisMonthPaid = !!yearPayments[selectedMonth];

              return (
                <div key={member.id} className="bg-white rounded-2xl border border-gray-100 p-3.5 md:p-4 hover:shadow-lg transition-all duration-300 group">
                  {/* Avatar + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl bg-linear-to-br ${avatarColor(member.name)} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md`}>
                      {member.name.charAt(0)}
                    </div>
                    <div className={`px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-bold ${thisMonthPaid ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-400"}`}>
                      {thisMonthPaid ? "✓ পরিশোধিত" : "বকেয়া"}
                    </div>
                  </div>

                  {/* Name + Country */}
                  <h4 className="text-sm font-bold text-gray-800 truncate mb-0.5">{member.name}</h4>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-3">
                    <MapPin size={9} />{member.country}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    <div className="bg-gray-50 rounded-lg p-1.5 md:p-2 text-center">
                      <p className="text-[11px] md:text-xs font-bold text-gray-800">{fmt(mTotal)}</p>
                      <p className="text-[8px] md:text-[9px] text-gray-400">সর্বমোট</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-1.5 md:p-2 text-center">
                      <p className="text-[11px] md:text-xs font-bold text-blue-600">{fmt(yearPaid)}</p>
                      <p className="text-[8px] md:text-[9px] text-gray-400">{selectedYear}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-1.5 md:p-2 text-center">
                      <p className="text-[11px] md:text-xs font-bold text-violet-600">{monthsPaid}/১২</p>
                      <p className="text-[8px] md:text-[9px] text-gray-400">মাস</p>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => handleMemberClick(member)}
                    className="w-full cursor-pointer py-1.5 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200"
                  >
                    বিস্তারিত দেখুন
                  </button>
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
              <button onClick={() => setShowAllMembers(!showAllMembers)} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md transition-all duration-200">
                {showAllMembers ? "কম দেখুন" : `সব ${filteredMembers.length} জন দেখুন`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${showAllMembers ? "rotate-180" : ""}`} />
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
                এই খতিয়ানটি আমাদের মাল্টি-সিগনেচার ওয়ালেট এবং ব্যাংক স্টেটমেন্ট থেকে স্বয়ংক্রিয়ভাবে তৈরি। প্রতিটি এন্ট্রি ক্রস-রেফারেন্স করা হয়েছে।
              </p>
              <a href="#" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#051C14] text-white text-sm font-semibold hover:bg-[#0a3d2a] transition-all duration-200 shadow-md hover:shadow-lg">
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
