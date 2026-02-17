"use client";

import React, { useState, useMemo, useEffect } from "react";
// import membersData from "../data/members.json"; // REMOVED
import {
  Search,
  Globe,
  MessageCircle,
  Phone,
  Mail,
  Users,
  Facebook,
  Shield,
} from "lucide-react";
import Image from "next/image";

// Committee role order for sorting
const ROLE_ORDER = [
  "সভাপতি",
  "সহ-সভাপতি",
  "সাধারণ সম্পাদক",
  "যুগ্ম সম্পাদক",
  "কোষাধ্যক্ষ",
  "সাংগঠনিক সম্পাদক",
  "তথ্য ও প্রচার সম্পাদক",
];

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [activeTab, setActiveTab] = useState("all"); // "all" or "committee"

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/members", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setMembers(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  // Get unique countries for filter dropdown
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(members.map((m) => m.country))];
    return ["All", ...uniqueCountries.sort()];
  }, [members]);

  // Committee members
  const committeeMembers = useMemo(() => {
    return members
      .filter((m) => m.role)
      .sort((a, b) => {
        const aIdx = ROLE_ORDER.indexOf(a.role);
        const bIdx = ROLE_ORDER.indexOf(b.role);
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
      });
  }, [members]);

  // Filter logic
  const filteredMembers = useMemo(() => {
    const baseList = activeTab === "committee" ? committeeMembers : members;
    return baseList.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.mobile && member.mobile.includes(searchTerm)) ||
        (member.memberId && member.memberId.includes(searchTerm)) ||
        (member.country &&
          member.country.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCountry =
        selectedCountry === "All" || member.country === selectedCountry;

      return matchesSearch && matchesCountry;
    });
  }, [searchTerm, selectedCountry, activeTab, committeeMembers, members]);

  // Generate avatar background color based on member name
  const getAvatarGradient = (name) => {
    if (!name) return "from-gray-400 to-gray-500";
    const gradients = [
      "from-sky-400 to-blue-500",
      "from-emerald-400 to-teal-500",
      "from-violet-400 to-purple-500",
      "from-amber-400 to-orange-500",
      "from-rose-400 to-pink-500",
      "from-cyan-400 to-teal-500",
      "from-indigo-400 to-blue-500",
      "from-lime-400 to-green-500",
      "from-fuchsia-400 to-pink-500",
      "from-orange-400 to-red-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 font-sans bg-[#f8fafb]">
      {/* Header Section */}
      <div className="bg-[#051C14] text-white py-16 mb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">
            আমাদের সদস্যবৃন্দ
          </h1>
          <p className="text-emerald-100/80 max-w-2xl mx-auto">
            মধ্য আলীয়ারা যুব কল্যাণ সংগঠন ও প্রবাসী ঐক্য পরিষদের সম্মানিত
            সদস্যদের তালিকা।
          </p>
        </div>
      </div>

      <div className="mx-auto px-4 md:px-0 max-w-7xl">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab("all");
              setSelectedCountry("All");
              setSearchTerm("");
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === "all"
                ? "bg-[#051C14] text-white shadow-lg shadow-emerald-900/20"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Users size={16} />
            সকল সদস্য
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "all" ? "bg-emerald-500/30 text-emerald-200" : "bg-gray-100 text-gray-500"}`}
            >
              {members.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("committee");
              setSelectedCountry("All");
              setSearchTerm("");
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === "committee"
                ? "bg-[#051C14] text-white shadow-lg shadow-emerald-900/20"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Shield size={16} />
            কমিটি
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "committee" ? "bg-emerald-500/30 text-emerald-200" : "bg-gray-100 text-gray-500"}`}
            >
              {committeeMembers.length}
            </span>
          </button>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="নাম, মোবাইল নাম্বার অথবা আইডি দিয়ে খুঁজুন..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Country Filter */}
            <div className="flex items-center justify-between gap-10">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-emerald-500" />
                <span className="text-emerald-500 font-medium">
                  {activeTab === "committee" ? "কমিটি সদস্য" : "মোট সদস্য"}:{" "}
                  {filteredMembers.length} জন
                </span>
              </div>
              {activeTab === "all" && (
                <div className="w-full md:w-64">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none transition-all duration-200"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                      <option value="All">সকল দেশ</option>
                      {countries.slice(1).map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Members Grid */}
        {filteredMembers.length > 0 ? (
          <div
            className={`grid gap-6 lg:gap-8 ${
              activeTab === "committee"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                className={`group bg-white rounded-2xl overflow-hidden border hover:shadow-xl hover:-translate-y-1 transition-all duration-400 ease-out ${
                  member.role && activeTab === "committee"
                    ? "border-emerald-100"
                    : "border-gray-100"
                }`}
              >
                {/* Image / Avatar Area */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {member.image ? (
                    <>
                      {/* Try real image */}
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        onError={(e) => {
                          // Hide img and show fallback
                          e.target.style.display = "none";
                          e.target.parentElement.querySelector(
                            ".avatar-fallback",
                          ).style.display = "flex";
                        }}
                      />
                      {/* Fallback avatar (hidden by default when image exists) */}
                      <div
                        className="avatar-fallback absolute inset-0 items-center justify-center"
                        style={{ display: "none" }}
                      >
                        <div
                          className={`w-[75%] h-[75%] rounded-2xl bg-gradient-to-br ${getAvatarGradient(member.name)} flex items-center justify-center shadow-lg group-hover:scale-[1.03] transition-transform duration-500`}
                        >
                          <span className="text-white font-bold text-6xl sm:text-5xl md:text-6xl select-none drop-shadow-md">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`w-[75%] h-[75%] rounded-2xl bg-gradient-to-br ${getAvatarGradient(member.name)} flex items-center justify-center shadow-lg group-hover:scale-[1.03] transition-transform duration-500`}
                      >
                        <span className="text-white font-bold text-6xl sm:text-5xl md:text-6xl select-none drop-shadow-md">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Subtle pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, #000 0.5px, transparent 0.5px)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                </div>

                {/* Info Section */}
                <div className="px-5 pt-4 pb-5 text-center">
                  {/* Name */}
                  <h3 className="text-base font-bold text-gray-800 leading-snug mb-0.5 group-hover:text-emerald-600 transition-colors duration-300">
                    {member.name}
                  </h3>

                  {/* Father name */}
                  {member.father && (
                    <p className="text-[11px] text-gray-400 mb-0.5">
                      পিতা: {member.father}
                    </p>
                  )}

                  {/* Country badge */}
                  <span className="inline-block text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-0.5 rounded-full mb-1">
                    {member.country}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    {member.social?.facebook && (
                      <a
                        href={member.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center w-8 h-8 text-blue-500 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                        title="Facebook"
                      >
                        <Facebook size={16} />
                      </a>
                    )}
                    {member.social?.whatsapp && (
                      <a
                        href={member.social.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center py-2 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 transition-colors duration-200"
                        title="WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </a>
                    )}
                    {member.social?.email && (
                      <a
                        href={`mailto:${member.social.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center py-2 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 transition-colors duration-200"
                        title="Email"
                      >
                        <Mail size={16} />
                      </a>
                    )}
                    <a
                      href={`tel:${member.mobile}`}
                      className="flex-1 flex items-center justify-center py-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
                      title="Call"
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              কোন সদস্য পাওয়া যায়নি
            </h3>
            <p className="text-gray-500">
              অনুগ্রহ করে অন্য নাম বা আইডি দিয়ে চেষ্টা করুন
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 mb-4">
          <div
            className="relative overflow-hidden rounded-3xl px-6 py-14 md:py-20 text-center"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(5,28,20,0.88) 20%, rgba(10,61,42,0.85) 70%, rgba(6,78,46,0.88) 100%), url('/10007.svg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Decorative circles */}
            <div
              className="absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-10"
              style={{
                background:
                  "radial-gradient(circle, #10b981 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-10"
              style={{
                background:
                  "radial-gradient(circle, #10b981 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]"
              style={{
                background: "radial-gradient(circle, #fff 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white font-serif mb-4 leading-snug">
                আপনি কি আমাদের সদস্য হতে চান?
              </h2>
              <p className="text-emerald-100/80 text-base md:text-lg mb-8 leading-relaxed">
                মধ্য আলীয়ারা গ্রামের প্রবাসীদের জন্য আমাদের দ্বার সর্বদা
                উন্মুক্ত। ঐক্যবদ্ধ সমাজের অংশ হতে আজই যোগাযোগ করুন।
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-white text-[#051C14] font-bold px-8 py-3.5 rounded-full text-base hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-900/20 transition-all duration-300 group"
              >
                <span>সদস্য হওয়ার আবেদন করুন</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
