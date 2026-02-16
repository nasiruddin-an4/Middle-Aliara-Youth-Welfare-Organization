"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import membersData from "../../data/members.json";
import accountsData from "../../data/accounts.json";
import {
  ArrowLeft, CheckCircle2, MapPin, Phone, Calendar,
  Wallet, CreditCard, Shield,
} from "lucide-react";

const MONTH_NAMES = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
const MONTH_SHORT = ["জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
const MONTHLY_DUE = accountsData.monthlyDue || 2000;
const allPayments = accountsData.payments;
const allMembers = membersData.members;

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

const SOURCE_STYLES = {
  বিকাশ: { bg: "bg-pink-50", text: "text-pink-600", dot: "bg-pink-500" },
  ব্যাংক: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  নগদ: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" },
  রকেট: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" },
};

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id;

  const member = allMembers.find((m) => m.id === memberId);

  const { memberPayments, totalPaid, paidMonths, byYear } = useMemo(() => {
    if (!member) return { memberPayments: [], totalPaid: 0, paidMonths: 0, byYear: {} };
    const payments = allPayments.filter((p) => p.memberId === member.id);
    const total = payments.reduce((s, p) => s + p.amount, 0);
    const yearMap = {};
    payments.forEach((p) => {
      if (!yearMap[p.year]) yearMap[p.year] = { total: 0, months: {} };
      yearMap[p.year].total += p.amount;
      yearMap[p.year].months[p.month] = p;
    });
    return { memberPayments: payments, totalPaid: total, paidMonths: payments.length, byYear: yearMap };
  }, [member]);

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">সদস্য পাওয়া যায়নি</p>
          <button onClick={() => router.back()} className="text-emerald-600 font-semibold text-sm hover:underline">
            ← ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="relative bg-[#051C14] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 left-5 w-48 h-48 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative px-4 pt-20 pb-10 md:pt-24 md:pb-14 max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-300/80 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            হিসাবে ফিরুন
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`w-18 h-18 md:w-20 md:h-20 rounded-2xl bg-linear-to-br ${avatarColor(member.name)} flex items-center justify-center text-white font-bold text-3xl md:text-4xl shadow-xl`}
              style={{ width: "4.5rem", height: "4.5rem" }}
            >
              {member.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">{member.name}</h1>
              <p className="text-emerald-300/80 text-sm flex items-center gap-1.5 mt-1.5">
                <MapPin size={14} /> {member.country}
              </p>
              <p className="text-emerald-300/50 text-xs flex items-center gap-1.5 mt-1">
                <Phone size={12} /> {member.mobile}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "সর্বমোট প্রদান", value: fmt(totalPaid), icon: Wallet, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            { label: "পরিশোধিত মাস", value: paidMonths, icon: Calendar, color: "bg-blue-50 text-blue-700 border-blue-100" },
            { label: "মাসিক চাঁদা", value: fmt(MONTHLY_DUE), icon: CreditCard, color: "bg-amber-50 text-amber-700 border-amber-100" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center border shadow-sm`}>
              <s.icon size={22} className="mx-auto mb-2 opacity-60" />
              <p className="text-lg md:text-xl font-bold">{s.value}</p>
              <p className="text-[10px] font-semibold opacity-60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Payment Progress Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">পেমেন্ট অগ্রগতি</span>
            <span className="text-xs font-semibold text-emerald-600">{paidMonths} / ১২ মাস</span>
          </div>
          <div className="flex gap-1.5">
            {MONTH_NAMES.map((_, i) => {
              const hasPaid = Object.values(byYear).some((y) => y.months[i + 1]);
              return (
                <div
                  key={i}
                  className={`flex-1 h-2.5 rounded-full transition-all ${hasPaid ? "bg-emerald-400" : "bg-gray-200"}`}
                  title={MONTH_NAMES[i]}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-gray-300">{MONTH_SHORT[0]}</span>
            <span className="text-[9px] text-gray-300">{MONTH_SHORT[11]}</span>
          </div>
        </div>

        {/* Year-wise Breakdown */}
        {Object.keys(byYear).sort((a, b) => b - a).map((year) => (
          <div key={year} className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Calendar size={16} className="text-violet-500" />
                {year} সালের বিবরণ
              </h2>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                {fmt(byYear[year].total)}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {MONTH_NAMES.map((m, i) => {
                const p = byYear[year].months[i + 1];
                const paid = !!p;
                const st = paid ? SOURCE_STYLES[p.source] : null;
                return (
                  <div
                    key={i}
                    className={`rounded-xl p-3 text-center border transition-all ${paid ? "bg-emerald-50/70 border-emerald-200" : "bg-gray-50 border-gray-100"
                      }`}
                  >
                    <p className="text-[10px] font-bold text-gray-400 mb-1.5">{MONTH_SHORT[i]}</p>
                    {paid ? (
                      <>
                        <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1" />
                        <p className="text-xs font-bold text-emerald-700">{fmt(p.amount)}</p>
                        {st && (
                          <span className={`inline-flex items-center gap-1 text-[8px] font-semibold px-1.5 py-0.5 rounded-full mt-1 ${st.bg} ${st.text}`}>
                            <span className={`w-1 h-1 rounded-full ${st.dot}`} />
                            {p.source}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-full bg-gray-200 mx-auto mb-1" />
                        <p className="text-[10px] text-gray-300 font-medium">বকেয়া</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* If no payments at all */}
        {Object.keys(byYear).length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
            <Shield size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">এখনো কোনো পেমেন্ট রেকর্ড নেই</p>
          </div>
        )}
      </div>
    </div>
  );
}
