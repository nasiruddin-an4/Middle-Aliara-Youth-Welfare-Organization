"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Banknote,
  PlusCircle,
  Upload,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Calendar,
  TrendingUp,
  Loader2,
  ExternalLink,
  Activity,
  MapPin,
  Film,
  Star,
  XCircle,
} from "lucide-react";

// ─── Sidebar Nav Items ───
const navItems = [
  { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { id: "members", label: "সদস্য ব্যবস্থাপনা", icon: Users },
  { id: "payments", label: "পেমেন্ট ব্যবস্থাপনা", icon: CreditCard },
  { id: "accounting", label: "হিসাব নিকাশ", icon: Banknote },
  { id: "gallery", label: "গ্যালারি ব্যবস্থাপনা", icon: ImageIcon },
  { id: "activities", label: "চলমান কার্যক্রমসমূহ", icon: Activity },
];

// ─── SweetAlert2 Toast helper ───
const SwalToast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

function showToast(message, type = "success") {
  SwalToast.fire({
    icon: type,
    title: message,
  });
}

async function confirmAction({
  title = "আপনি কি নিশ্চিত?",
  text = "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না!",
  confirmButtonText = "হ্যাঁ, নিশ্চিত!",
  cancelButtonText = "বাতিল",
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#059669",
    cancelButtonColor: "#d33",
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
  });
  return result.isConfirmed;
}

// ─── Upload helper ───
async function uploadFile(file, type = "image") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  return res.json();
}

// ─── Reusable Modal ───
function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Input ───
function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 font-medium mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options, required }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 font-medium mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ════════════════════════════════════════
// ═══ MAIN DASHBOARD COMPONENT ═════════
// ════════════════════════════════════════

function FormCombobox({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) return;
    const selected = options.find((o) => o.value === value);
    if (selected) setSearch(selected.label);
    else setSearch("");
  }, [value, options, isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-xs text-gray-500 font-medium mb-1.5">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={search}
          onClick={() => {
            setIsOpen(true);
            if (!value) setSearch("");
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (e.target.value === "") onChange({ target: { value: "" } });
          }}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown size={16} />
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-lg animate-dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((o) => (
              <div
                key={o.value}
                onClick={() => {
                  onChange({ target: { value: o.value } });
                  setSearch(o.label);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${
                  value === o.value
                    ? "bg-emerald-50 text-emerald-700 font-medium"
                    : "text-gray-700"
                }`}
              >
                {o.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              কোনো ফলাফল পাওয়া যায়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Data states
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [activities, setActivities] = useState([]);

  // Auth check
  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => {
        if (!r.ok) router.push("/admin");
        else setLoading(false);
      })
      .catch(() => router.push("/admin"));
  }, [router]);

  // Fetch data
  const fetchAll = useCallback(async () => {
    try {
      const [mRes, pRes, eRes, gRes, aRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/payments"),
        fetch("/api/expenses"),
        fetch("/api/gallery"),
        fetch("/api/activities"),
      ]);
      const [mData, pData, eData, gData, aData] = await Promise.all([
        mRes.json(),
        pRes.json(),
        eRes.json(),
        gRes.json(),
        aRes.json(),
      ]);
      if (mData.success) setMembers(mData.data);
      if (pData.success) setPayments(pData.data);
      if (eData.success) setExpenses(eData.data);
      if (gData.success) setGallery(gData.data);
      if (aData.success) setActivities(aData.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!loading) fetchAll();
  }, [loading, fetchAll]);

  // Logout
  const handleLogout = async () => {
    const confirmed = await confirmAction({
      title: "লগআউট করতে চান?",
      text: "আপনি অ্যাডমিন প্যানেল থেকে লগআউট হবেন।",
      confirmButtonText: "হ্যাঁ, লগআউট",
    });
    if (!confirmed) return;
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      {/* ═══ Mobile Overlay ═══ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══ Sidebar ═══ */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-[#051C14] text-white flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Shield size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">অ্যাডমিন প্যানেল</p>
            <p className="text-[10px] text-gray-400">মধ্য আলীয়ারা সংগঠন</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1 hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
                {active && (
                  <ChevronRight size={14} className="ml-auto opacity-60" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-800">
              {navItems.find((n) => n.id === activeTab)?.label || "ড্যাশবোর্ড"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Visit Site Button */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
            >
              <ExternalLink size={13} />
              সাইট দেখুন
            </a>
            {/* Mobile Visit Site */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
              title="সাইট দেখুন"
            >
              <ExternalLink size={18} />
            </a>

            {/* Admin Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Shield size={14} className="text-emerald-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium hidden sm:block">
                  অ্যাডমিন
                </span>
                <ChevronRight
                  size={12}
                  className={`text-gray-400 transition-transform duration-200 ${
                    profileOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-dropdown">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">অ্যাডমিন</p>
                    <p className="text-[11px] text-gray-400">
                      মধ্য আলীয়ারা সংগঠন
                    </p>
                  </div>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <ExternalLink size={15} className="text-gray-400" />
                    সাইট দেখুন
                  </a>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    লগআউট
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 lg:p-6">
          {activeTab === "dashboard" && (
            <DashboardTab
              members={members}
              payments={payments}
              gallery={gallery}
              activities={activities}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === "members" && (
            <MembersTab
              members={members}
              onRefresh={fetchAll}
              showToast={showToast}
            />
          )}
          {activeTab === "payments" && (
            <PaymentsTab
              payments={payments}
              members={members}
              onRefresh={fetchAll}
              showToast={showToast}
            />
          )}
          {activeTab === "accounting" && (
            <AccountingTab
              payments={payments}
              expenses={expenses}
              members={members}
              onRefresh={fetchAll}
              showToast={showToast}
            />
          )}
          {activeTab === "gallery" && (
            <GalleryTab
              gallery={gallery}
              onRefresh={fetchAll}
              showToast={showToast}
            />
          )}
          {activeTab === "activities" && (
            <ActivitiesTab
              activities={activities}
              onRefresh={fetchAll}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* ═══ Slide-in Animation ═══ */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @keyframes dropdown-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-dropdown {
          animation: dropdown-in 0.2s ease-out;
          transform-origin: top right;
        }
      `}</style>
    </div>
  );
}

// ════════════════════════════
// ═══ DASHBOARD TAB ═════════
// ════════════════════════════
function DashboardTab({ members, payments, gallery, activities, onNavigate }) {
  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);
  const fmt = (n) =>
    new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
    }).format(n);

  const stats = [
    {
      label: "মোট সদস্য",
      value: members.length,
      icon: Users,
      color: "emerald",
      tab: "members",
    },
    {
      label: "মোট পেমেন্ট",
      value: fmt(totalPayments),
      icon: Banknote,
      color: "blue",
      tab: "payments",
    },
    {
      label: "গ্যালারি ফটো",
      value: gallery.length,
      icon: ImageIcon,
      color: "purple",
      tab: "gallery",
    },
    {
      label: "মোট পেমেন্ট রেকর্ড",
      value: payments.length,
      icon: TrendingUp,
      color: "amber",
      tab: "payments",
    },
  ];

  const colorMap = {
    emerald: {
      bg: "bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-600",
      text: "text-emerald-700",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-700",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "bg-purple-100 text-purple-600",
      text: "text-purple-700",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "bg-amber-100 text-amber-600",
      text: "text-amber-700",
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const c = colorMap[s.color];
          return (
            <div
              key={s.label}
              onClick={() => onNavigate(s.tab)}
              className={`${c.bg} rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-gray-200`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">সাম্প্রতিক পেমেন্ট</h3>
          <button
            onClick={() => onNavigate("payments")}
            className="text-xs text-emerald-600 font-medium hover:underline cursor-pointer"
          >
            সব দেখুন →
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {payments.slice(0, 5).map((p) => (
            <div
              key={p._id}
              className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">
                  সদস্য #{p.memberId}
                </p>
                <p className="text-xs text-gray-400">
                  {p.month}/{p.year} • {p.source}
                </p>
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {fmt(p.amount)}
              </span>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              কোনো পেমেন্ট রেকর্ড নেই
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════
// ═══ MEMBERS TAB ════════════
// ════════════════════════════
function MembersTab({ members, onRefresh, showToast }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    memberId: "",
    name: "",
    mobile: "",
    country: "",
    role: "",
    email: "",
    fatherName: "",
    bloodGroup: "",
    facebook: "",
    whatsapp: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = members
    .filter(
      (m) =>
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.memberId?.toLowerCase().includes(search.toLowerCase()) ||
        m.country?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const idA = parseInt(a.memberId) || 0;
      const idB = parseInt(b.memberId) || 0;
      return idA - idB;
    });

  const openCreate = () => {
    setEditing(null);
    setForm({
      memberId: "",
      name: "",
      mobile: "",
      country: "",
      role: "",
      email: "",
      fatherName: "",
      bloodGroup: "",
      facebook: "",
      whatsapp: "",
    });
    setImageFile(null);
    setPreview("");
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setForm({
      memberId: member.memberId || "",
      name: member.name || "",
      mobile: member.mobile || "",
      country: member.country || "",
      role: member.role || "",
      email: member.email || member.social?.email || "",
      fatherName: member.fatherName || "",
      bloodGroup: member.bloodGroup || "",
      facebook: member.social?.facebook || "",
      whatsapp: member.social?.whatsapp || "",
    });
    setImageFile(null);
    setPreview(member.image || "");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = editing?.image || "";

      if (imageFile) {
        const upRes = await uploadFile(imageFile, "image");
        if (upRes.success) imageUrl = upRes.url;
      }

      const payload = {
        ...form,
        image: imageUrl,
        social: {
          email: form.email,
          whatsapp:
            form.whatsapp ||
            (form.mobile ? `https://wa.me/${form.mobile}` : ""),
          facebook: form.facebook || "",
        },
      };

      let res;
      if (editing) {
        res = await fetch(`/api/members/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        showToast(editing ? "সদস্য আপডেট হয়েছে" : "নতুন সদস্য যোগ হয়েছে");
        setShowModal(false);
        onRefresh();
      } else {
        showToast(
          data.error + (data.details ? `: ${data.details}` : "") ||
            "ত্রুটি হয়েছে",
          "error",
        );
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "সদস্য মুছে ফেলতে চান?",
      text: "এই সদস্যের সকল তথ্য মুছে যাবে!",
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন",
    });
    if (!confirmed) return;
    const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("সদস্য মুছে ফেলা হয়েছে");
      onRefresh();
    } else {
      showToast("মুছে ফেলা যায়নি", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="সদস্য খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
          />
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all shadow-md cursor-pointer"
        >
          <UserPlus size={16} />
          নতুন সদস্য
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  ক্রমিক নং
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  আইডি
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  নাম
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                  মোবাইল
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                  দেশ
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                  পদবী
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((m, index) => (
                <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-gray-600">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {m.memberId}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {m.image ? (
                        <img
                          src={m.image}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                          {m.name?.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-gray-800">
                        {m.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {m.mobile}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {m.country}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {m.role ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        {m.role}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(m)}
                        className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors cursor-pointer"
                        title="এডিট"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="মুছুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    কোনো সদস্য পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          title={editing ? "সদস্য এডিট করুন" : "নতুন সদস্য যোগ করুন"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="সদস্য আইডি"
                value={form.memberId}
                onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                placeholder="001"
                required
              />
              <FormInput
                label="নাম"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="সদস্যের নাম"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="মোবাইল"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="01XXXXXXXXX"
              />
              <FormInput
                label="দেশ"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="সৌদি আরব"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="পদবী"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="সদস্য"
              />
              <FormInput
                label="ইমেইল"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                placeholder="email@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="পিতার নাম"
                value={form.fatherName}
                onChange={(e) =>
                  setForm({ ...form, fatherName: e.target.value })
                }
              />
              <FormInput
                label="রক্তের গ্রুপ"
                value={form.bloodGroup}
                onChange={(e) =>
                  setForm({ ...form, bloodGroup: e.target.value })
                }
                placeholder="A+"
              />
            </div>
            {/* Social Media URLs */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="ফেসবুক লিংক"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="https://facebook.com/username"
              />
              <FormInput
                label="হোয়াটসঅ্যাপ লিংক"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="https://wa.me/88017XXXXXXXX"
              />
            </div>
            {/* Image Upload */}
            <div>
              <label className="block text-xs text-gray-500 font-medium mb-1.5">
                ছবি
              </label>
              {preview && (
                <div className="mb-3 relative w-32 h-32">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full rounded-xl object-cover border border-gray-200"
                  />
                  {imageFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setPreview(editing?.image || "");
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImageFile(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {editing ? "আপডেট করুন" : "সদস্য যোগ করুন"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════
// ═══ PAYMENTS TAB ═══════════
// ════════════════════════════
function PaymentsTab({ payments, members, onRefresh, showToast }) {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    month: "all",
    year: "all",
  });

  const [form, setForm] = useState({
    memberId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: "",
    source: "বিকাশ",
    date: new Date().toISOString().split("T")[0],
    transactionId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const memberOptions = useMemo(() => {
    return members.map((m) => ({
      value: m.memberId,
      label: `${m.name} (${m.memberId})`,
    }));
  }, [members]);

  // Extract unique years from payments
  const availableYears = useMemo(() => {
    const years = new Set(payments.map((p) => p.year));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [payments]);

  const fmt = (n) =>
    new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
    }).format(n);

  const monthNames = [
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

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.memberId?.includes(search) ||
      p.source?.toLowerCase().includes(search.toLowerCase());
    const matchMonth =
      filters.month === "all" || p.month === parseInt(filters.month);
    const matchYear =
      filters.year === "all" || p.year === parseInt(filters.year);
    return matchSearch && matchMonth && matchYear;
  });

  const totalAmount = filtered.reduce((sum, p) => sum + p.amount, 0);

  const openCreate = () => {
    setEditing(null);
    setForm({
      memberId: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: "",
      source: "বিকাশ",
      date: new Date().toISOString().split("T")[0],
      transactionId: "",
    });
    setShowModal(true);
  };

  const openEdit = (payment) => {
    setEditing(payment);
    setForm({
      memberId: payment.memberId,
      month: payment.month,
      year: payment.year,
      amount: payment.amount,
      source: payment.source,
      date: payment.date || new Date().toISOString().split("T")[0],
      transactionId: payment.transactionId || "",
    });
    setShowViewModal(false);
    setShowModal(true);
  };

  const openView = (payment) => {
    setViewing(payment);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        month: parseInt(form.month),
        year: parseInt(form.year),
      };

      let res;
      if (editing) {
        res = await fetch(`/api/payments/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        showToast(editing ? "পেমেন্ট আপডেট হয়েছে" : "পেমেন্ট যোগ হয়েছে");
        setShowModal(false);
        onRefresh();
      } else {
        showToast(data.error || "ত্রুটি", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "পেমেন্ট মুছে ফেলতে চান?",
      text: "এই পেমেন্ট রেকর্ড মুছে যাবে!",
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন",
    });
    if (!confirmed) return;
    const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("পেমেন্ট মুছে ফেলা হয়েছে");
      onRefresh();
    } else showToast("মুছে ফেলা যায়নি", "error");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search & Filters */}
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="পেমেন্ট খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
              />
            </div>
            <div className="w-[180px]">
              <FormCombobox
                value={filters.month.toString()}
                onChange={(e) =>
                  setFilters({ ...filters, month: e.target.value })
                }
                options={[
                  { value: "all", label: "সব মাস" },
                  ...monthNames.map((m, i) => ({
                    value: (i + 1).toString(),
                    label: m,
                  })),
                ]}
                placeholder="মাস নির্বাচন করুন"
              />
            </div>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-emerald-400"
            >
              <option value="all">সব বছর</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            <PlusCircle size={16} />
            নতুন পেমেন্ট
          </button>
        </div>

        {/* Total Summary Card */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-medium mb-1">
              মোট পেমেন্ট (ফিল্টার অনুযায়ী)
            </p>
            <h3 className="text-2xl font-bold text-emerald-700">
              {fmt(totalAmount)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Banknote size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  সদস্য
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  মাস/বছর
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  পরিমাণ
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                  মাধ্যম
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                  তারিখ
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const mem = members.find((m) => m.memberId === p.memberId);
                return (
                  <tr
                    key={p._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-700">
                        {mem?.name || `#${p.memberId}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {monthNames[p.month - 1]}, {p.year}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600">
                      {fmt(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {p.source}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {p.date || "—"}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button
                        onClick={() => openView(p)}
                        className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors cursor-pointer"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    কোনো পেমেন্ট পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Payment Modal */}
      {showModal && (
        <Modal
          title={editing ? "পেমেন্ট আপডেট করুন" : "নতুন পেমেন্ট যোগ করুন"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormCombobox
              label="সদস্য"
              value={form.memberId}
              onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              required
              placeholder="নাম বা আইডি লিখুন..."
              options={memberOptions}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="মাস"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                required
                options={monthNames.map((n, i) => ({
                  value: i + 1,
                  label: n,
                }))}
              />
              <FormInput
                label="বছর"
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="পরিমাণ (টাকা)"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="1000"
                required
              />
              <FormSelect
                label="মাধ্যম"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                options={[
                  { value: "বিকাশ", label: "বিকাশ" },
                  { value: "নগদ", label: "নগদ" },
                  { value: "রকেট", label: "রকেট" },
                  { value: "ব্যাংক", label: "ব্যাংক" },
                  { value: "নগদ (ক্যাশ)", label: "নগদ (ক্যাশ)" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="তারিখ"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <FormInput
                label="ট্রানজেকশন আইডি"
                value={form.transactionId}
                onChange={(e) =>
                  setForm({ ...form, transactionId: e.target.value })
                }
                placeholder="TXN..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {editing ? "আপডেট করুন" : "পেমেন্ট যোগ করুন"}
            </button>
          </form>
        </Modal>
      )}

      {/* View Details Modal */}
      {showViewModal && viewing && (
        <Modal
          title="পেমেন্ট বিস্তারিত"
          onClose={() => setShowViewModal(false)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">সদস্য</p>
                <p className="font-medium text-gray-800">
                  {members.find((m) => m.memberId === viewing.memberId)?.name ||
                    viewing.memberId}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">পরিমাণ</p>
                <p className="font-bold text-emerald-600">
                  {fmt(viewing.amount)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">মাস/বছর</p>
                <p className="font-medium text-gray-800">
                  {monthNames[viewing.month - 1]}, {viewing.year}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">মাধ্যম</p>
                <p className="font-medium text-gray-800">{viewing.source}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">তারিখ</p>
                <p className="font-medium text-gray-800">
                  {viewing.date || "—"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">ট্রানজেকশন আইডি</p>
                <p className="font-medium text-gray-800">
                  {viewing.transactionId || "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => openEdit(viewing)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Pencil size={16} />
                তথ্য পরিবর্তন করুন
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════
// ═══ GALLERY TAB ════════════
// ════════════════════════════
function GalleryTab({ gallery, onRefresh, showToast }) {
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "events",
    date: new Date().toISOString().split("T")[0],
    featured: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const categoryLabels = {
    events: "ইভেন্ট",
    welfare: "কল্যাণমূলক",
    education: "শিক্ষা",
    environment: "পরিবেশ",
    celebrations: "উৎসব",
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      showToast("ছবি নির্বাচন করুন", "warning");
      return;
    }
    setSubmitting(true);

    try {
      const upRes = await uploadFile(imageFile, "image");
      if (!upRes.success) {
        showToast("আপলোড ব্যর্থ", "error");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, src: upRes.url }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("ছবি যোগ হয়েছে");
        setShowModal(false);
        setPreview("");
        setImageFile(null);
        setForm({
          title: "",
          description: "",
          category: "events",
          date: new Date().toISOString().split("T")[0],
          featured: false,
        });
        onRefresh();
      } else {
        showToast(data.error || "ত্রুটি", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "ছবি মুছে ফেলতে চান?",
      text: "এই ছবি গ্যালারি থেকে মুছে যাবে!",
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন",
    });
    if (!confirmed) return;
    const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("ছবি মুছে ফেলা হয়েছে");
      onRefresh();
    } else showToast("মুছে ফেলা যায়নি", "error");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          মোট <span className="font-bold text-gray-700">{gallery.length}</span>{" "}
          টি ছবি
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all shadow-md cursor-pointer"
        >
          <Upload size={16} />
          নতুন ছবি আপলোড
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((photo) => (
          <div
            key={photo._id}
            className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <button
                  onClick={() => handleDelete(photo._id)}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all cursor-pointer transform scale-75 group-hover:scale-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <h4 className="text-xs font-bold text-gray-800 mb-0.5 truncate">
                {photo.title}
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  {categoryLabels[photo.category] || photo.category}
                </span>
                {photo.featured && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-full">
                    ★
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {gallery.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <ImageIcon size={40} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">গ্যালারিতে কোনো ছবি নেই</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <Modal
          title="নতুন ছবি আপলোড করুন"
          onClose={() => {
            setShowModal(false);
            setPreview("");
            setImageFile(null);
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preview */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl mb-2"
                />
              ) : (
                <div className="py-8">
                  <Upload size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">ছবি নির্বাচন করুন</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>

            <FormInput
              label="শিরোনাম"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="ছবির শিরোনাম"
              required
            />
            <FormInput
              label="বিবরণ"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="ছবির বিবরণ"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="ক্যাটাগরি"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                options={Object.entries(categoryLabels).map(([v, l]) => ({
                  value: v,
                  label: l,
                }))}
              />
              <FormInput
                label="তারিখ"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 text-emerald-600"
              />
              <label htmlFor="featured" className="text-sm text-gray-600">
                বিশেষ ছবি হিসেবে চিহ্নিত করুন
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "আপলোড হচ্ছে..." : "আপলোড করুন"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════
// ═══ ACTIVITIES TAB ══════════════════
// ════════════════════════════════════
function ActivitiesTab({ activities, onRefresh, showToast }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    date: new Date().toISOString().split("T")[0],
    location: "",
    status: "ongoing",
    featured: false,
  });

  const categoryLabels = {
    welfare: "কল্যাণমূলক",
    education: "শিক্ষা",
    health: "স্বাস্থ্য",
    environment: "পরিবেশ",
    sports: "খেলাধুলা",
    cultural: "সাংস্কৃতিক",
    other: "অন্যান্য",
  };

  const statusLabels = {
    ongoing: "চলমান",
    completed: "সম্পন্ন",
    upcoming: "আসন্ন",
  };

  const statusColors = {
    ongoing: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    upcoming: "bg-amber-100 text-amber-700",
  };

  const filtered = activities.filter((a) => {
    const matchSearch =
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase()) ||
      a.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "other",
      date: new Date().toISOString().split("T")[0],
      location: "",
      status: "ongoing",
      featured: false,
    });
    setMediaFiles([]);
    setMediaPreviews([]);
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (activity) => {
    setEditing(activity);
    setForm({
      title: activity.title || "",
      description: activity.description || "",
      category: activity.category || "other",
      date: activity.date || new Date().toISOString().split("T")[0],
      location: activity.location || "",
      status: activity.status || "ongoing",
      featured: activity.featured || false,
    });
    setMediaFiles([]);
    setMediaPreviews(
      (activity.media || []).map((m) => ({
        url: m.url,
        type: m.type,
        existing: true,
      })),
    );
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...mediaFiles, ...files];
    setMediaFiles(newFiles);

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
      existing: false,
      file,
    }));
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    const preview = mediaPreviews[index];
    if (!preview.existing) {
      // remove from files list too
      const fileIndex = mediaFiles.indexOf(preview.file);
      if (fileIndex > -1) {
        setMediaFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      }
    }
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Upload new files to Cloudinary
      const existingMedia = mediaPreviews
        .filter((p) => p.existing)
        .map((p) => ({ url: p.url, type: p.type }));

      const newMediaPromises = mediaPreviews
        .filter((p) => !p.existing && p.file)
        .map(async (p) => {
          const formData = new FormData();
          formData.append("file", p.file);
          formData.append("type", p.type === "video" ? "video" : "image");
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.success) {
            return {
              url: data.url,
              type: p.type,
              publicId: data.publicId || "",
            };
          }
          return null;
        });

      const uploadedMedia = (await Promise.all(newMediaPromises)).filter(
        Boolean,
      );
      const allMedia = [...existingMedia, ...uploadedMedia];

      const payload = {
        ...form,
        media: allMedia,
      };

      let res;
      if (editing) {
        res = await fetch(`/api/activities/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        showToast(
          editing ? "কার্যক্রম আপডেট হয়েছে" : "নতুন কার্যক্রম যোগ হয়েছে",
        );
        setShowModal(false);
        resetForm();
        onRefresh();
      } else {
        showToast(data.error || "ত্রুটি হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি", "error");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "কার্যক্রম মুছে ফেলতে চান?",
      text: "এই কার্যক্রমের সকল তথ্য ও মিডিয়া মুছে যাবে!",
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন",
    });
    if (!confirmed) return;
    const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("কার্যক্রম মুছে ফেলা হয়েছে");
      onRefresh();
    } else {
      showToast("মুছে ফেলা যায়নি", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header / Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-1 gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="কার্যক্রম খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
          >
            <option value="all">সব স্ট্যাটাস</option>
            {Object.entries(statusLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all shadow-md cursor-pointer"
        >
          <PlusCircle size={16} />
          নতুন কার্যক্রম
        </button>
      </div>

      {/* Activities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((activity) => (
          <div
            key={activity._id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group"
          >
            {/* Media Preview */}
            {activity.media && activity.media.length > 0 && (
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {activity.media[0].type === "video" ? (
                  <video
                    src={activity.media[0].url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={activity.media[0].url}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {activity.media.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <Film size={10} />+{activity.media.length - 1}
                  </div>
                )}
                {activity.featured && (
                  <div className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star size={10} /> বিশেষ
                  </div>
                )}
              </div>
            )}

            {/* If no media */}
            {(!activity.media || activity.media.length === 0) && (
              <div className="aspect-video bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                <Activity size={40} className="text-emerald-300" />
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">
                  {activity.title}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    statusColors[activity.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {statusLabels[activity.status] || activity.status}
                </span>
              </div>

              {activity.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {activity.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 text-[11px] text-gray-400 mb-3">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={11} />
                  {activity.date}
                </span>
                {activity.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} />
                    {activity.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-500 font-medium">
                  {categoryLabels[activity.category] || activity.category}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => openEdit(activity)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Pencil size={13} />
                  এডিট
                </button>
                <button
                  onClick={() => handleDelete(activity._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  মুছুন
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Activity size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">কোনো কার্যক্রম পাওয়া যায়নি</p>
            <p className="text-xs mt-1">
              নতুন কার্যক্রম যোগ করতে উপরে বাটনে ক্লিক করুন
            </p>
          </div>
        )}
      </div>

      {/* ═══ Create / Edit Modal ═══ */}
      {showModal && (
        <Modal
          title={editing ? "কার্যক্রম এডিট করুন" : "নতুন কার্যক্রম যোগ করুন"}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="শিরোনাম"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="কার্যক্রমের শিরোনাম"
              required
            />

            <div>
              <label className="block text-xs text-gray-500 font-medium mb-1.5">
                বিবরণ
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="কার্যক্রমের বিস্তারিত বিবরণ..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="ক্যাটাগরি"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                options={Object.entries(categoryLabels).map(([v, l]) => ({
                  value: v,
                  label: l,
                }))}
              />
              <FormSelect
                label="স্ট্যাটাস"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={Object.entries(statusLabels).map(([v, l]) => ({
                  value: v,
                  label: l,
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="তারিখ"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <FormInput
                label="স্থান"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="অবস্থান"
              />
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-xs text-gray-500 font-medium mb-1.5">
                ছবি / ভিডিও আপলোড
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4">
                {/* Previews Grid */}
                {mediaPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {mediaPreviews.map((preview, idx) => (
                      <div
                        key={idx}
                        className="relative group/media aspect-square rounded-xl overflow-hidden bg-gray-100"
                      >
                        {preview.type === "video" ? (
                          <video
                            src={preview.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={preview.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removePreview(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity cursor-pointer"
                        >
                          <XCircle size={12} />
                        </button>
                        {preview.type === "video" && (
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded">
                            ভিডিও
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                <p className="text-[10px] text-gray-400 mt-1.5">
                  একাধিক ছবি ও ভিডিও নির্বাচন করা যাবে
                </p>
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activityFeatured"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 text-emerald-600"
              />
              <label
                htmlFor="activityFeatured"
                className="text-sm text-gray-600"
              >
                বিশেষ কার্যক্রম হিসেবে চিহ্নিত করুন
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting
                ? "প্রক্রিয়াকরণ হচ্ছে..."
                : editing
                  ? "আপডেট করুন"
                  : "কার্যক্রম যোগ করুন"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════
// ═══ ACCOUNTING TAB ═════════
// ════════════════════════════
function AccountingTab({ payments, expenses, members, onRefresh, showToast }) {
  const [view, setView] = useState("summary"); // summary | expenses
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Expense Modal State
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    numberGiven: "",
    amountPerPerson: "",
    location: "",
  });

  // Filters State

  const [memberSearch, setMemberSearch] = useState("");
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [selectedMemberStats, setSelectedMemberStats] = useState(null);

  // Calculate Stats
  const years = useMemo(() => {
    const pYears = payments.map((p) => p.year);
    const eYears = expenses.map(
      (e) => e.year || new Date(e.date).getFullYear(),
    );
    const allYears = [...new Set([...pYears, ...eYears])].sort((a, b) => b - a);
    return allYears.length > 0 ? allYears : [new Date().getFullYear()];
  }, [payments, expenses]);

  const totalCollection = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const currentBalance = totalCollection - totalExpense;

  const getMonthName = (m) => {
    const months = [
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
    return months[m - 1] || "";
  };

  const monthlyStats = useMemo(() => {
    const stats = Array(12)
      .fill(0)
      .map((_, i) => ({
        month: i + 1,
        monthName: getMonthName(i + 1),
        collection: 0,
        expense: 0,
      }));

    payments.forEach((p) => {
      if (p.year === selectedYear) {
        stats[p.month - 1].collection += p.amount;
      }
    });

    expenses.forEach((e) => {
      const eYear = e.year || new Date(e.date).getFullYear();
      const eMonth = e.month || new Date(e.date).getMonth() + 1;
      if (eYear === selectedYear) {
        stats[eMonth - 1].expense += e.amount;
      }
    });

    return stats;
  }, [payments, expenses, selectedYear]);

  const memberStats = useMemo(() => {
    const stats = {};
    payments.forEach((p) => {
      if (p.year === selectedYear) {
        if (!stats[p.memberId]) {
          const member = members.find((m) => m.memberId === p.memberId);
          stats[p.memberId] = {
            memberId: p.memberId,
            name: member?.name || "দ্বারা অজানা",
            total: 0,
          };
        }
        stats[p.memberId].total += p.amount;
      }
    });
    return Object.values(stats)
      .filter(
        (m) =>
          m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
          m.memberId.includes(memberSearch),
      )
      .sort((a, b) => b.total - a.total);
  }, [payments, members, selectedYear, memberSearch]);

  const yearlyStats = useMemo(() => {
    const stats = {};
    years.forEach((y) => {
      stats[y] = { year: y, collection: 0, expense: 0 };
    });

    payments.forEach((p) => {
      if (stats[p.year]) stats[p.year].collection += p.amount;
    });

    expenses.forEach((e) => {
      const y = e.year || new Date(e.date).getFullYear();
      if (stats[y]) stats[y].expense += e.amount;
    });

    return Object.values(stats).sort((a, b) => b.year - a.year);
  }, [payments, expenses, years]);

  const fmt = (n) =>
    new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      currency: "BDT",
    }).format(n);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      validationSearch(e.title, expenseSearch) ||
      validationSearch(e.description, expenseSearch);
    const matchesCategory = expenseCategory
      ? e.category === expenseCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  function validationSearch(text, search) {
    if (!text) return false;
    return text.toLowerCase().includes(search.toLowerCase());
  }

  // Expense Handlers
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/expenses/${editing._id}` : "/api/expenses";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseForm),
      });
      const data = await res.json();

      if (data.success) {
        showToast(editing ? "খরচ আপডেট হয়েছে" : "খরচ যোগ হয়েছে");
        setShowModal(false);
        onRefresh();
      } else {
        showToast(data.error || "সমস্যা হয়েছে", "error");
      }
    } catch (err) {
      showToast("সার্ভার এরর", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    const confirmed = await confirmAction({
      title: "খরচ মুছতে চান?",
      text: "এটি ফিরিয়ে আনা যাবে না!",
      confirmButtonText: "হ্যাঁ, মুছুন",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("খরচ মুছে ফেলা হয়েছে");
        onRefresh();
      } else {
        showToast(data.error || "মুছতে সমস্যা হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার এরর", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="bg-white p-2 rounded-xl border border-gray-100 inline-flex gap-1">
        <button
          onClick={() => setView("summary")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === "summary"
              ? "bg-emerald-50 text-emerald-700 shadow-sm"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          সামারি রিপোর্ট
        </button>
        <button
          onClick={() => setView("expenses")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === "expenses"
              ? "bg-emerald-50 text-emerald-700 shadow-sm"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          খরচ ব্যবস্থাপনা
        </button>
      </div>

      {view === "summary" && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">মোট কালেকশন</p>
              <p className="text-2xl font-bold text-emerald-600">
                {fmt(totalCollection)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">মোট খরচ</p>
              <p className="text-2xl font-bold text-red-500">
                {fmt(totalExpense)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">বর্তমান ব্যালেন্স</p>
              <p
                className={`text-2xl font-bold ${currentBalance >= 0 ? "text-blue-600" : "text-amber-500"}`}
              >
                {fmt(currentBalance)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Yearly Overview Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-800">
                বাৎসরিক হিসাব
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 bg-gray-50 uppercase">
                    <tr>
                      <th className="px-6 py-3">বছর</th>
                      <th className="px-6 py-3 text-emerald-600">আয়</th>
                      <th className="px-6 py-3 text-red-500">ব্যয়</th>
                      <th className="px-6 py-3 text-blue-600">স্থিতি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {yearlyStats.map((y) => (
                      <tr key={y.year} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium">{y.year}</td>
                        <td className="px-6 py-3">{fmt(y.collection)}</td>
                        <td className="px-6 py-3 text-red-500">
                          {fmt(y.expense)}
                        </td>
                        <td className="px-6 py-3 font-bold">
                          {fmt(y.collection - y.expense)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Overview Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-800">মাসিক হিসাব</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none focus:border-emerald-500"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 bg-gray-50 uppercase sticky top-0">
                    <tr>
                      <th className="px-6 py-3">মাস</th>
                      <th className="px-6 py-3 text-emerald-600">আয়</th>
                      <th className="px-6 py-3 text-red-500">ব্যয়</th>
                      <th className="px-6 py-3 text-blue-600">স্থিতি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {monthlyStats.map((m) => (
                      <tr key={m.month} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium">{m.monthName}</td>
                        <td className="px-6 py-3">{fmt(m.collection)}</td>
                        <td className="px-6 py-3 text-red-500">
                          {fmt(m.expense)}
                        </td>
                        <td className="px-6 py-3 font-bold">
                          {fmt(m.collection - m.expense)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td className="px-6 py-3">মোট</td>
                      <td className="px-6 py-3 text-emerald-600">
                        {fmt(
                          monthlyStats.reduce((s, m) => s + m.collection, 0),
                        )}
                      </td>
                      <td className="px-6 py-3 text-red-500">
                        {fmt(monthlyStats.reduce((s, m) => s + m.expense, 0))}
                      </td>
                      <td className="px-6 py-3 text-blue-600">
                        {fmt(
                          monthlyStats.reduce(
                            (s, m) => s + m.collection - m.expense,
                            0,
                          ),
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Member Yearly Contribution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-800">
                  সদস্যদের বাৎসরিক অবদান ({selectedYear})
                </div>
                <p className="text-xs text-gray-400">
                  এই বছরে কে কত টাকা দিয়েছে (বিস্তারিত দেখতে ক্লিক করুন)
                </p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="সদস্য খুঁজুন..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-40 sm:w-56"
                />
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 bg-gray-50 uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-3">সদস্য</th>
                    <th className="px-6 py-3 text-right">পরিমাণ</th>
                    <th className="px-6 py-3 text-right">বিস্তারিত</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {memberStats.map((m) => (
                    <tr
                      key={m.memberId}
                      className="hover:bg-gray-50"
                      onClick={() => setSelectedMemberStats(m)}
                    >
                      <td className="px-6 py-3">
                        <p className="font-medium text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-400">
                          ID: {m.memberId}
                        </p>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-gray-700">
                        {fmt(m.total)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMemberStats(m);
                          }}
                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors inline-flex cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {memberStats.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        কোনো ডাটা পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {view === "expenses" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800">খরচের তালিকা</h3>
            <button
              onClick={() => {
                setEditing(null);
                setExpenseForm({
                  title: "",
                  amount: "",
                  category: "",
                  date: new Date().toISOString().split("T")[0],
                  description: "",
                  numberGiven: "",
                  amountPerPerson: "",
                  location: "",
                });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle size={16} />
            </button>
          </div>

          {/* Filters for Expenses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                placeholder="খরচ খুঁজুন (টাইটেল/বিবরণ)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            >
              <option value="">সকল ক্যাটাগরি</option>
              {[...new Set(expenses.map((e) => e.category))].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 bg-gray-50 uppercase">
                  <tr>
                    <th className="px-6 py-3">তারিখ</th>
                    <th className="px-6 py-3">বিবরণ</th>
                    <th className="px-6 py-3">ক্যাটাগরি</th>
                    <th className="px-6 py-3 text-right">পরিমাণ</th>
                    <th className="px-6 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500">
                        {new Date(expense.date).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-800">
                        {expense.title}
                        {expense.description && (
                          <p className="text-xs text-gray-400 font-normal mt-0.5">
                            {expense.description}
                          </p>
                        )}
                        {expense.location && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                            <MapPin size={10} />
                            {expense.location}
                          </div>
                        )}
                        {expense.numberGiven && expense.amountPerPerson && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {expense.numberGiven} জন ×{" "}
                            {fmt(expense.amountPerPerson)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-red-500">
                        {fmt(expense.amount)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditing(expense);
                              setExpenseForm({
                                title: expense.title,
                                amount: expense.amount,
                                category: expense.category,
                                date: new Date(expense.date)
                                  .toISOString()
                                  .split("T")[0],
                                description: expense.description || "",
                                numberGiven: expense.numberGiven || "",
                                amountPerPerson: expense.amountPerPerson || "",
                                location: expense.location || "",
                              });
                              setShowModal(true);
                            }}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        কোনো খরচের রেকর্ড নেই
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showModal && (
        <Modal
          title={editing ? "খরচ এডিট করুন" : "নতুন খরচ যোগ করুন"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <FormInput
              label="খরচের নাম/টাইটেল"
              required
              value={expenseForm.title}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, title: e.target.value })
              }
              placeholder="যেমন: ইফতার বিতরণ"
            />
            <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200">
              <div className="col-span-3 text-xs font-semibold text-gray-500 mb-1">
                বিতরণ বিস্তারিত
              </div>
              <FormInput
                label="মোট সংখ্যা (জন/টি)"
                type="number"
                required
                value={expenseForm.numberGiven}
                onChange={(e) => {
                  const num = parseFloat(e.target.value) || 0;
                  const rate = parseFloat(expenseForm.amountPerPerson) || 0;
                  setExpenseForm((prev) => ({
                    ...prev,
                    numberGiven: e.target.value,
                    amount: num * rate,
                  }));
                }}
                placeholder="যেমন: ৫০"
              />
              <FormInput
                label="জন প্রতি খরচ"
                type="number"
                required
                value={expenseForm.amountPerPerson}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value) || 0;
                  const num = parseFloat(expenseForm.numberGiven) || 0;
                  setExpenseForm((prev) => ({
                    ...prev,
                    amountPerPerson: e.target.value,
                    amount: num * rate,
                  }));
                }}
                placeholder="0.00"
              />
              <FormInput
                label="স্থান/লোকেশন"
                required
                value={expenseForm.location}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, location: e.target.value })
                }
                placeholder="স্থান"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="পরিমাণ (টাকা)"
                type="number"
                required
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, amount: e.target.value })
                }
                placeholder="0.00"
              />
              <FormInput
                label="তারিখ"
                type="date"
                required
                value={expenseForm.date}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, date: e.target.value })
                }
              />
            </div>

            <FormInput
              label="ক্যাটাগরি"
              required
              value={expenseForm.category}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, category: e.target.value })
              }
              placeholder="যেমন: ইফতার বিতরণ, সবার জন্য কুরবানী, শীতবস্ত্র বিতরণ, ইত্যাদি"
            />
            <div className="space-y-1.5">
              <label className="block text-xs text-gray-500 font-medium">
                বিস্তারিত বিবরণ (অপশনাল)
              </label>
              <textarea
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all h-24 resize-none"
                placeholder="খরচের বিস্তারিত..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {editing ? "আপডেট করুন" : "সেভ করুন"}
            </button>
          </form>
        </Modal>
      )}
      {/* Member Details Modal */}
      {selectedMemberStats && (
        <Modal
          title={`${selectedMemberStats.name} - বিস্তারিত`}
          onClose={() => setSelectedMemberStats(null)}
        >
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
              <p className="text-sm text-emerald-800">
                মোট অবদান ({selectedYear})
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {fmt(selectedMemberStats.total)}
              </p>
            </div>

            <div className="border rounded-xl overflow-hidden text-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                  <tr>
                    <th className="px-4 py-2">তারিখ</th>
                    <th className="px-4 py-2">মাস</th>
                    <th className="px-4 py-2 text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments
                    .filter(
                      (p) =>
                        p.memberId === selectedMemberStats.memberId &&
                        p.year === selectedYear,
                    )
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((p) => (
                      <tr key={p._id}>
                        <td className="px-4 py-2 text-gray-500">
                          {new Date(p.date).toLocaleDateString("bn-BD")}
                        </td>
                        <td className="px-4 py-2 text-gray-800">
                          {getMonthName(p.month)}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {fmt(p.amount)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
