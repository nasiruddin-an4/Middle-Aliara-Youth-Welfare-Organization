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
  Download,
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
  MessageSquare,
  FileText,
  CheckCircle,
  Mail,
  Clock,
  Filter,
  XCircle as XCircleIcon,
} from "lucide-react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ─── Sidebar Nav Items ───
const navItems = [
  { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { id: "members", label: "সদস্য ব্যবস্থাপনা", icon: Users },
  { id: "payments", label: "পেমেন্ট ব্যবস্থাপনা", icon: CreditCard },
  { id: "accounting", label: "হিসাব নিকাশ", icon: Banknote },
  { id: "gallery", label: "গ্যালারি ব্যবস্থাপনা", icon: ImageIcon },
  { id: "activities", label: "চলমান কার্যক্রমসমূহ", icon: Activity },
  { id: "messages", label: "যোগাযোগ বার্তা", icon: MessageSquare },
  { id: "join_requests", label: "সদস্য আবেদন", icon: UserPlus },
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
function Modal({ title, onClose, children, maxWidth = "max-w-2xl" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
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
  const [messages, setMessages] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);

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
      const [mRes, pRes, eRes, gRes, aRes, msgRes, jrRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/payments"),
        fetch("/api/expenses"),
        fetch("/api/gallery"),
        fetch("/api/activities"),
        fetch("/api/contact"),
        fetch("/api/join"),
      ]);
      const [mData, pData, eData, gData, aData, msgData, jrData] =
        await Promise.all([
          mRes.json(),
          pRes.json(),
          eRes.json(),
          gRes.json(),
          aRes.json(),
          msgRes.json(),
          jrRes.json(),
        ]);
      if (mData.success) setMembers(mData.data);
      if (pData.success) setPayments(pData.data);
      if (eData.success) setExpenses(eData.data);
      if (gData.success) setGallery(gData.data);
      if (aData.success) setActivities(aData.data);
      if (msgData.success) setMessages(msgData.data);
      if (jrData.success) setJoinRequests(jrData.data);
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
              messages={messages}
              joinRequests={joinRequests}
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
          {activeTab === "messages" && (
            <MessagesTab
              messages={messages}
              onRefresh={fetchAll}
              showToast={showToast}
            />
          )}
          {activeTab === "join_requests" && (
            <JoinRequestsTab
              requests={joinRequests}
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
function DashboardTab({
  members,
  payments,
  gallery,
  activities,
  messages,
  joinRequests,
  onNavigate,
}) {
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
    // Generate Unique ID
    const maxId = members.reduce((max, m) => {
      const id = parseInt(m.memberId) || 0;
      return Math.max(max, id);
    }, 0);
    const nextId = String(maxId + 1);

    setEditing(null);
    setForm({
      memberId: nextId,
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
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    month: "all",
    year: "all",
  });
  const [downloadFilters, setDownloadFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [downloadPreview, setDownloadPreview] = useState(null); // Preview data state

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
      receivedBy: "",
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
      receivedBy: payment.receivedBy || "",
    });
    setShowViewModal(false);
    setShowModal(true);
  };

  const openView = (payment) => {
    setViewing(payment);
    setShowViewModal(true);
  };

  const downloadReceipt = (paymentToPrint) => {
    try {
      const mem = members.find(
        (m) =>
          m.memberId === paymentToPrint.memberId ||
          m.id === paymentToPrint.memberId,
      );
      const mName = mem ? mem.name : paymentToPrint.memberId;
      const monthNameStr = monthNames[parseInt(paymentToPrint.month) - 1];
      const canvas = document.createElement("canvas");
      const scale = 2; // Retina quality
      const w = 500;
      const h = 750;
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
      ctx.fillText(fmt(paymentToPrint.amount), w / 2, 232);

      // Details section
      ctx.textAlign = "left";
      const detailsStartY = 280;
      const lineHeight = 50;

      // Format report date
      let reportDateStr = paymentToPrint.date;
      if (reportDateStr) {
        const d = new Date(reportDateStr);
        reportDateStr = `${d.getDate()} ${monthNames[d.getMonth()]}, ${d.getFullYear()}`;
      } else {
        reportDateStr = "—";
      }

      const details = [
        { label: "সদস্যের নাম", value: mName },
        { label: "সদস্য আইডি", value: paymentToPrint.memberId || "—" },
        { label: "মাস", value: `${monthNameStr}, ${paymentToPrint.year}` },
        { label: "পেমেন্ট মাধ্যম", value: paymentToPrint.source },
        { label: "পেমেন্ট তারিখ", value: reportDateStr },
        {
          label: "ট্রানজেকশন আইডি",
          value: paymentToPrint.transactionId || "N/A",
        },
        { label: "গ্রহীতা", value: paymentToPrint.receivedBy || "N/A" }, // NEW
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
      const statusY = detailsStartY + details.length * lineHeight + 15;
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
        a.download = `Rcp_${mName.replace(/\s+/g, "_")}_${monthNameStr}_${paymentToPrint.year}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (err) {
      console.error(err);
    }
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

        // Auto-download receipt if it's a new payment
        if (!editing) {
          downloadReceipt(payload);
        }

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

  const handleDownloadRequest = () => {
    setDownloadPreview(null);
    setShowDownloadModal(true);
  };

  // Helper to format date string for report (e.g. "2026-02-17" -> "2026/02/17")
  const formatReportDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const generatePreview = () => {
    const targetMonth = parseInt(downloadFilters.month);
    const targetYear = parseInt(downloadFilters.year);

    const downloadData = payments.filter(
      (p) => p.month === targetMonth && p.year === targetYear,
    );

    if (downloadData.length === 0) {
      showToast("এই মাসের কোনো পেমেন্ট রেকর্ড নেই", "warning");
      return;
    }

    setDownloadPreview({
      data: downloadData,
      month: targetMonth,
      year: targetYear,
      total: downloadData.reduce((s, p) => s + p.amount, 0),
    });
  };

  const downloadPDF = () => {
    if (!downloadPreview) return;

    showToast("PDF তৈরি হচ্ছে...", "info");

    // Build table rows
    const tableRows = downloadPreview.data
      .map((p) => {
        const mem = members.find((m) => m.memberId === p.memberId);
        const dateStr = formatReportDate(p.date);
        return `
          <tr>
            <td style="border:1px solid #e5e7eb;padding:8px;">
              <div style="font-weight:600;">${mem?.name || p.memberId}</div>
            </td>
            <td style="border:1px solid #e5e7eb;padding:8px;">${p.source || ""}</td>
            <td style="border:1px solid #e5e7eb;padding:8px;">${dateStr}</td>
            <td style="border:1px solid #e5e7eb;padding:8px;text-align:right;font-weight:500;">${fmt(p.amount)}</td>
          </tr>
        `;
      })
      .join("");

    // Current date for footer
    const now = new Date();
    const footerDate = `${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <title>Payment Report - ${monthNames[downloadPreview.month - 1]} ${downloadPreview.year}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Noto Sans Bengali', 'Kalpurush', 'SolaimanLipi', 'Arial Unicode MS', sans-serif;
            color: #1f2937;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .report-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            padding: 24px;
          }
          .header {
            text-align: center;
            margin-bottom: 16px;
            border-bottom: 2px solid #059669;
            padding-bottom: 8px;
          }
          .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #065f46;
            line-height: 1.3;
            margin-bottom: 4px;
          }
          .header .subtitle {
            font-size: 14px;
            color: #4b5563;
          }
          .meta-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 12px;
            font-size: 14px;
          }
          table {
            width: 100%;
            font-size: 13px;
            border-collapse: collapse;
            margin-top: 8px;
          }
          thead tr {
            background-color: #ecfdf5;
          }
          th {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
            font-weight: 600;
          }
          th:last-child {
            text-align: right;
          }
          td {
            border: 1px solid #e5e7eb;
            padding: 8px;
          }
          .total-row {
            background-color: #f9fafb;
            font-weight: bold;
          }
          .total-row td:first-child {
            text-align: right;
          }
          .total-row td:last-child {
            color: #047857;
          }
          .footer {
            margin-top: 48px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            padding-top: 32px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
          }
          @media print {
            body { background: #ffffff; }
            .report-container { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <h1>
              মধ্য আলীয়ারা যুব কল্যাণ সংগঠন ও প্রবাসী ঐক্য পরিষদ
            </h1>
            <p class="subtitle">স্থাপিত: ২০২৪ | রেজিঃ নং- ১২৩৪৫</p>
            <div class="meta-row">
              <p><strong>রিপোর্ট:&nbsp;</strong> মাসিক পেমেন্ট তালিকা</p>
              <p><strong>সময়কাল:&nbsp;</strong> ${monthNames[downloadPreview.month - 1]} ${downloadPreview.year}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>সদস্য</th>
                <th>মাধ্যম</th>
                <th>তারিখ</th>
                <th style="text-align:right;">পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td colspan="3" style="border:1px solid #e5e7eb;padding:8px;text-align:right;">সর্বমোট</td>
                <td style="border:1px solid #e5e7eb;padding:8px;text-align:right;color:#047857;">${fmt(downloadPreview.total)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>রিপোর্ট জেনারেট: ${footerDate}</p>
            <p>কর্তৃপক্ষ কর্তৃক অনুমোদিত</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        <\/script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      showToast(
        "পপ-আপ ব্লক করা হয়েছে। অনুগ্রহ করে পপ-আপ অনুমতি দিন।",
        "error",
      );
    }
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

          <div className="flex gap-2">
            <button
              onClick={handleDownloadRequest}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <FileText size={16} />
              রিপোর্ট (ইমেজ)
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              <PlusCircle size={16} />
              নতুন পেমেন্ট
            </button>
          </div>
        </div>

        {/* Total Summary Card */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 font-medium mb-1">
                মোট পেমেন্ট (টাকা)
              </p>
              <h3 className="text-2xl font-bold text-emerald-700">
                {fmt(totalAmount)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Banknote size={20} />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">
                মোট পেমেন্ট সংখ্যা
              </p>
              <h3 className="text-2xl font-bold text-blue-700">
                {filtered.length} জন
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Users size={20} />
            </div>
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
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                  গ্রহীতা
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
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {p.receivedBy || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {p.date || "—"}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button
                        onClick={() => downloadReceipt(p)}
                        className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                        title="রশিদ ডাউনলোড করুন"
                      >
                        <Download size={14} />
                      </button>
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

            <FormInput
              label="গ্রহীতা"
              value={form.receivedBy}
              onChange={(e) => setForm({ ...form, receivedBy: e.target.value })}
              placeholder="যিনি টাকা গ্রহণ করেছেন"
              required
            />
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
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">গ্রহীতা</p>
                <p className="font-medium text-gray-800">
                  {viewing.receivedBy || "—"}
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

      {/* Download Modal with Preview */}
      {showDownloadModal && (
        <Modal
          title={
            downloadPreview
              ? "রিপোর্ট প্রিভিউ (PDF)"
              : "পেমেন্ট রিপোর্ট ডাউনলোড"
          }
          onClose={() => {
            setShowDownloadModal(false);
            setDownloadPreview(null);
          }}
          maxWidth={downloadPreview ? "max-w-3xl" : "max-w-2xl"}
        >
          {!downloadPreview ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                কোন মাসের রিপোর্ট ডাউনলোড করতে চান তা নির্বাচন করুন।
              </p>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="মাস"
                  value={downloadFilters.month}
                  onChange={(e) =>
                    setDownloadFilters({
                      ...downloadFilters,
                      month: e.target.value,
                    })
                  }
                  required
                  options={monthNames.map((n, i) => ({
                    value: i + 1,
                    label: n,
                  }))}
                />
                <FormSelect
                  label="বছর"
                  value={downloadFilters.year}
                  onChange={(e) =>
                    setDownloadFilters({
                      ...downloadFilters,
                      year: e.target.value,
                    })
                  }
                  required
                  options={availableYears.map((y) => ({
                    value: y,
                    label: y.toString(),
                  }))}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={generatePreview}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: "#059669", color: "#ffffff" }}
                >
                  <FileText size={16} />
                  রিপোর্ট তৈরি করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview Container */}
              {/* Preview Container */}
              <div className="bg-gray-100/50 p-4 rounded-xl overflow-y-auto overflow-x-hidden flex justify-center border border-gray-200 relative mb-4 h-[600px]">
                {/* Visual Scale Wrapper - Only for Preview UI */}
                <div
                  className="scale-50 sm:scale-75 origin-top transition-transform duration-200"
                  style={{ height: "600px" }} // Approximate height for Preview Window
                >
                  <div
                    id="report-preview"
                    // Removed shadow-xl and p-12 class, using inline style for padding and shadow to avoid Tailwind variables
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#1f2937",
                      padding: "48px",
                      width: "210mm",
                      minHeight: "297mm",
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: "16px", // Reduced margin
                        borderBottom: "2px solid #059669",
                        paddingBottom: "8px", // Reduced padding
                      }}
                    >
                      <h1
                        style={{
                          fontSize: "30px",
                          fontWeight: "bold",
                          marginBottom: "4px",
                          color: "#065f46",
                          lineHeight: "1.2",
                        }}
                      >
                        মধ্য আলীয়ারা যুব কল্যাণ সংগঠন ও প্রবাসী ঐক্য পরিষদ
                      </h1>
                      <p style={{ fontSize: "14px", color: "#4b5563" }}>
                        স্থাপিত: ২০২৪ | রেজিঃ নং- ১২৩৪৫
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: "12px", // Reduced margin
                          fontSize: "14px",
                        }}
                      >
                        <p>
                          <strong>রিপোর্ট:&nbsp;</strong> মাসিক পেমেন্ট তালিকা
                        </p>
                        <p>
                          <strong>সময়কাল:&nbsp;</strong>
                          <span
                            style={{
                              display: "inline-block",
                              marginRight: "6px",
                            }}
                          >
                            {monthNames[downloadPreview.month - 1]}
                          </span>
                          <span
                            style={{
                              display: "inline-block",
                              unicodeBidi: "isolate",
                            }}
                          >
                            {String(downloadPreview.year)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Table */}
                    <table
                      style={{
                        width: "100%",
                        fontSize: "12px",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#ecfdf5" }}>
                          {/* Removed Serial No Column */}
                          <th
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "8px",
                              textAlign: "left",
                            }}
                          >
                            সদস্য
                          </th>
                          <th
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "8px",
                              textAlign: "left",
                            }}
                          >
                            মাধ্যম
                          </th>
                          <th
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "8px",
                              textAlign: "left",
                            }}
                          >
                            তারিখ
                          </th>
                          <th
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "8px",
                              textAlign: "right",
                            }}
                          >
                            পরিমাণ
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {downloadPreview.data.map((p, i) => {
                          const mem = members.find(
                            (m) => m.memberId === p.memberId,
                          );
                          const cellStyle = {
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          };
                          return (
                            <tr key={i}>
                              <td style={cellStyle}>
                                <div style={{ fontWeight: "600" }}>
                                  {mem?.name}
                                </div>
                              </td>
                              <td style={cellStyle}>{p.source}</td>
                              <td style={cellStyle}>
                                {formatReportDate(p.date)}
                              </td>
                              <td
                                style={{
                                  ...cellStyle,
                                  textAlign: "right",
                                  fontWeight: "500",
                                }}
                              >
                                {fmt(p.amount)}
                              </td>
                            </tr>
                          );
                        })}
                        {/* Total Row */}
                        <tr
                          style={{
                            backgroundColor: "#f9fafb",
                            fontWeight: "bold",
                          }}
                        >
                          <td
                            colSpan={3}
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "8px",
                              textAlign: "right",
                            }}
                          >
                            সর্বমোট
                          </td>
                          <td
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "8px",
                              textAlign: "right",
                              color: "#047857",
                            }}
                          >
                            {fmt(downloadPreview.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Footer */}
                    <div
                      style={{
                        marginTop: "48px",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        paddingTop: "32px",
                        borderTop: "1px solid #e5e7eb",
                        color: "#6b7280",
                      }}
                    >
                      <p>
                        <span>রিপোর্ট জেনারেট: </span>
                        {(() => {
                          const now = new Date();
                          const d = now.getDate();
                          const m = now.getMonth();
                          const y = now.getFullYear();
                          const bnMonths = [
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
                          return (
                            <>
                              <span
                                style={{
                                  display: "inline-block",
                                  marginRight: "4px",
                                }}
                              >
                                {d}
                              </span>
                              <span
                                style={{
                                  display: "inline-block",
                                  marginRight: "4px",
                                }}
                              >
                                {bnMonths[m]}
                              </span>
                              <span
                                style={{
                                  display: "inline-block",
                                  unicodeBidi: "isolate",
                                }}
                              >
                                {y}
                              </span>
                            </>
                          );
                        })()}
                      </p>
                      <p>কর্তৃপক্ষ কর্তৃক অনুমোদিত</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDownloadPreview(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  পেছনে যান
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  PDF ডাউনলোড করুন
                </button>
              </div>
            </div>
          )}
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
              <div className="aspect-video bg-linear-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
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
    location: "",
    items: [{ itemName: "", qty: 1, description: "", unitPrice: "" }],
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

  const handleDownloadInvoice = async (expense) => {
    const invoiceSlug = `Invoice-${expense._id.substring(0, 8)}`;

    // Create hidden div for invoice
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.left = "-9999px";
    div.style.top = "0";
    div.style.width = "800px";
    div.style.padding = "40px";
    div.style.backgroundColor = "white";
    div.style.color = "black";
    div.style.fontFamily = "inherit";

    div.innerHTML = `
      <div style="border: 2px solid #059669; padding: 30px; border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0; font-size: 28px; font-weight: bold;">মধ্য আলীয়ারা যুব কল্যান সংগঠন ও প্রবাসী ঐক্য পরিষদ</h1>
          <p style="margin: 2px 0; font-size: 14px;">স্থাপিত: ২০২৬ | রেজি নং: XXXXXX</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
          <div>
            <h3 style="margin: 0 0 10px 0; color: #333;">ভাউচার / ইনভয়েস</h3>
            <p style="margin: 2px 0; font-size: 14px;">আইডি: ${expense._id}</p>
            <p style="margin: 2px 0; font-size: 14px;">তারিখ: ${new Date(expense.date).toLocaleDateString("bn-BD")}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 2px 0; font-size: 14px;"><strong>ক্যাটাগরি:</strong> ${expense.category}</p>
            <p style="margin: 2px 0; font-size: 14px;"><strong>স্থান:</strong> ${expense.location || "N/A"}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <thead>
            <tr style="background-color: #f0fdf4; color: #065f46;">
              <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left;">#</th>
              <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left;">বিবরণ</th>
              <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: center;">পরিমাণ (জন/টি)</th>
              <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: right;">দর</th>
              <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: right;">মোট টাকা</th>
            </tr>
          </thead>
          <tbody>
            ${
              expense.items && expense.items.length > 0
                ? expense.items
                    .map(
                      (it, i) => `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 12px;">${i + 1}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px;">
                    <strong>${it.itemName}</strong>
                    ${it.description ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${it.description}</p>` : ""}
                  </td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: center;">${it.qty}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right;">${fmt(it.unitPrice)}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; font-weight: bold;">${fmt(it.qty * it.unitPrice)}</td>
                </tr>
              `,
                    )
                    .join("")
                : `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 12px;">1</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px;">
                    <strong>${expense.title}</strong>
                    ${expense.description ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${expense.description}</p>` : ""}
                  </td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: center;">${expense.numberGiven || "-"}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right;">${expense.amountPerPerson ? fmt(expense.amountPerPerson) : "-"}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; font-weight: bold;">${fmt(expense.amount)}</td>
                </tr>
              `
            }
          </tbody>
          <tfoot>
            <tr style="background-color: #f9fafb;">
              <td colspan="4" style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; font-weight: bold;">সর্বমোট</td>
              <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #dc2626;">${fmt(expense.amount)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 60px; display: flex; justify-content: space-between;">
          <div style="text-align: center; width: 200px;">
            <div style="border-top: 1px solid #333; padding-top: 5px;">কোষাধ্যক্ষের স্বাক্ষর</div>
          </div>
          <div style="text-align: center; width: 200px;">
            <div style="border-top: 1px solid #333; padding-top: 5px;">সভাপতির স্বাক্ষর</div>
          </div>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
          Generated on ${new Date().toLocaleString("bn-BD")} | Middle Aliara Youth Welfare Organization
        </div>
      </div>
    `;

    document.body.appendChild(div);

    try {
      const canvas = await html2canvas(div, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceSlug}.pdf`);
      showToast("ইনভয়েস ডাউনলোড সফল হয়েছে");
    } catch (error) {
      console.error("PDF Error:", error);
      showToast("ইনভয়েস তৈরি করতে সমস্যা হয়েছে", "error");
    } finally {
      document.body.removeChild(div);
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                খরচের তালিকা
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {filteredExpenses.length}টি রেকর্ড পাওয়া গেছে
              </p>
            </div>
            <button
              onClick={() => {
                setEditing(null);
                setExpenseForm({
                  title: "",
                  amount: "",
                  category: "",
                  date: new Date().toISOString().split("T")[0],
                  description: "",
                  location: "",
                  items: [
                    { itemName: "", qty: 1, description: "", unitPrice: "" },
                  ],
                });
                setShowModal(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-200"
            >
              <PlusCircle size={16} />
              নতুন খরচ
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="text"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                placeholder="খরচ খুঁজুন (টাইটেল/বিবরণ)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm"
              />
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm"
            >
              <option value="">সকল ক্যাটাগরি</option>
              {[...new Set(expenses.map((e) => e.category))].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* ─── Desktop Table ─── */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gradient-to-r from-gray-50 to-gray-100/50 uppercase tracking-wide">
                  <tr>
                    <th className="px-5 py-3.5">তারিখ</th>
                    <th className="px-5 py-3.5">বিবরণ</th>
                    <th className="px-5 py-3.5">ক্যাটাগরি</th>
                    <th className="px-5 py-3.5 text-right">পরিমাণ</th>
                    <th className="px-5 py-3.5 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense._id}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center flex-shrink-0">
                            <Calendar size={13} className="text-gray-400" />
                          </div>
                          <span className="text-xs font-medium">
                            {new Date(expense.date).toLocaleDateString("bn-BD")}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {expense.title}
                        </p>
                        {expense.description && (
                          <p className="text-xs text-gray-400 font-normal mt-0.5 line-clamp-1">
                            {expense.description}
                          </p>
                        )}
                        {expense.location && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                            <MapPin size={10} />
                            {expense.location}
                          </div>
                        )}
                        {expense.items && expense.items.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {expense.items.slice(0, 3).map((it, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] text-emerald-700 font-medium border border-emerald-100"
                              >
                                {it.qty}× {it.itemName}
                              </span>
                            ))}
                            {expense.items.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[10px] text-gray-500 font-medium">
                                +{expense.items.length - 3} আরও
                              </span>
                            )}
                          </div>
                        ) : expense.numberGiven && expense.amountPerPerson ? (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {expense.numberGiven} জন ×{" "}
                            {fmt(expense.amountPerPerson)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 font-medium border border-gray-200/60">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-red-500 text-base">
                          {fmt(expense.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleDownloadInvoice(expense)}
                            title="ইনভয়েস ডাউনলোড"
                            className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-all cursor-pointer"
                          >
                            <Download size={15} />
                          </button>
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
                                location: expense.location || "",
                                items:
                                  expense.items && expense.items.length > 0
                                    ? expense.items.map((it) => ({
                                        itemName: it.itemName || "",
                                        qty: it.qty || 1,
                                        description: it.description || "",
                                        unitPrice: it.unitPrice || "",
                                      }))
                                    : expense.numberGiven &&
                                        expense.amountPerPerson
                                      ? [
                                          {
                                            itemName: expense.title,
                                            qty: expense.numberGiven,
                                            description: "",
                                            unitPrice: expense.amountPerPerson,
                                          },
                                        ]
                                      : [
                                          {
                                            itemName: "",
                                            qty: 1,
                                            description: "",
                                            unitPrice: expense.amount || "",
                                          },
                                        ],
                              });
                              setShowModal(true);
                            }}
                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all cursor-pointer"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FileText size={32} className="text-gray-300" />
                          <p>কোনো খরচের রেকর্ড নেই</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── Mobile Cards ─── */}
          <div className="md:hidden space-y-3">
            {filteredExpenses.map((expense) => (
              <div
                key={expense._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Card Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm truncate">
                        {expense.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] text-emerald-700 font-medium border border-emerald-100">
                          <Calendar size={10} />
                          {new Date(expense.date).toLocaleDateString("bn-BD")}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[10px] text-gray-600 font-medium">
                          {expense.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-red-500 text-lg leading-tight">
                        {fmt(expense.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-4 py-3 space-y-2">
                  {expense.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {expense.description}
                    </p>
                  )}
                  {expense.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={12} />
                      {expense.location}
                    </div>
                  )}
                  {expense.items && expense.items.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {expense.items.map((it, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50/80 text-[11px] text-emerald-700 font-medium border border-emerald-100/60"
                        >
                          <span className="font-bold text-emerald-800">
                            {it.qty}×
                          </span>{" "}
                          {it.itemName}
                        </span>
                      ))}
                    </div>
                  ) : expense.numberGiven && expense.amountPerPerson ? (
                    <p className="text-xs text-gray-500">
                      {expense.numberGiven} জন × {fmt(expense.amountPerPerson)}
                    </p>
                  ) : null}
                </div>

                {/* Card Actions */}
                <div className="px-4 py-2.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleDownloadInvoice(expense)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                  >
                    <Download size={13} /> ইনভয়েস
                  </button>
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
                        location: expense.location || "",
                        items:
                          expense.items && expense.items.length > 0
                            ? expense.items.map((it) => ({
                                itemName: it.itemName || "",
                                qty: it.qty || 1,
                                description: it.description || "",
                                unitPrice: it.unitPrice || "",
                              }))
                            : expense.numberGiven && expense.amountPerPerson
                              ? [
                                  {
                                    itemName: expense.title,
                                    qty: expense.numberGiven,
                                    description: "",
                                    unitPrice: expense.amountPerPerson,
                                  },
                                ]
                              : [
                                  {
                                    itemName: "",
                                    qty: 1,
                                    description: "",
                                    unitPrice: expense.amount || "",
                                  },
                                ],
                      });
                      setShowModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                  >
                    <Pencil size={13} /> এডিট
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 size={13} /> মুছুন
                  </button>
                </div>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <FileText size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">কোনো খরচের রেকর্ড নেই</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showModal && (
        <Modal
          title={editing ? "খরচ এডিট করুন" : "নতুন খরচ যোগ করুন"}
          onClose={() => setShowModal(false)}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            {/* Title & basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="খরচের নাম/টাইটেল"
                required
                value={expenseForm.title}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, title: e.target.value })
                }
                placeholder="যেমন: ইফতার বিতরণ"
              />
              <FormInput
                label="ক্যাটাগরি"
                required
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, category: e.target.value })
                }
                placeholder="যেমন: ইফতার বিতরণ, শীতবস্ত্র, ইত্যাদি"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="তারিখ"
                type="date"
                required
                value={expenseForm.date}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, date: e.target.value })
                }
              />
              <FormInput
                label="স্থান/লোকেশন"
                value={expenseForm.location}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, location: e.target.value })
                }
                placeholder="স্থান"
              />
            </div>

            {/* Invoice Items Section */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              {/* Section Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FileText size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-700">
                      আইটেম সমূহ
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1.5">
                      ({expenseForm.items.length}টি আইটেম)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExpenseForm((prev) => ({
                      ...prev,
                      items: [
                        ...prev.items,
                        {
                          itemName: "",
                          qty: 1,
                          description: "",
                          unitPrice: "",
                        },
                      ],
                    }));
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  <PlusCircle size={14} />
                  আইটেম যোগ করুন
                </button>
              </div>

              {/* ─── Desktop Table (hidden on mobile) ─── */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100/80 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
                      <th className="px-3 py-2.5 text-left w-[5%]">#</th>
                      <th className="px-3 py-2.5 text-left w-[28%]">
                        আইটেমের নাম
                      </th>
                      <th className="px-3 py-2.5 text-center w-[10%]">
                        পরিমাণ
                      </th>
                      <th className="px-3 py-2.5 text-left w-[27%]">বিবরণ</th>
                      <th className="px-3 py-2.5 text-right w-[15%]">
                        একক মূল্য (৳)
                      </th>
                      <th className="px-3 py-2.5 text-right w-[10%]">মোট</th>
                      <th className="px-3 py-2.5 text-center w-[5%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expenseForm.items.map((item, idx) => {
                      const lineTotal =
                        (parseFloat(item.qty) || 0) *
                        (parseFloat(item.unitPrice) || 0);
                      return (
                        <tr
                          key={idx}
                          className="bg-white hover:bg-emerald-50/30 transition-colors group"
                        >
                          <td className="px-3 py-2 text-gray-400 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              required
                              value={item.itemName}
                              onChange={(e) => {
                                const newItems = [...expenseForm.items];
                                newItems[idx] = {
                                  ...newItems[idx],
                                  itemName: e.target.value,
                                };
                                const total = newItems.reduce(
                                  (s, it) =>
                                    s +
                                    (parseFloat(it.qty) || 0) *
                                      (parseFloat(it.unitPrice) || 0),
                                  0,
                                );
                                setExpenseForm((prev) => ({
                                  ...prev,
                                  items: newItems,
                                  amount: total,
                                }));
                              }}
                              placeholder="আইটেমের নাম"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="number"
                              min="1"
                              required
                              value={item.qty}
                              onChange={(e) => {
                                const newItems = [...expenseForm.items];
                                newItems[idx] = {
                                  ...newItems[idx],
                                  qty: e.target.value,
                                };
                                const total = newItems.reduce(
                                  (s, it) =>
                                    s +
                                    (parseFloat(it.qty) || 0) *
                                      (parseFloat(it.unitPrice) || 0),
                                  0,
                                );
                                setExpenseForm((prev) => ({
                                  ...prev,
                                  items: newItems,
                                  amount: total,
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-center focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const newItems = [...expenseForm.items];
                                newItems[idx] = {
                                  ...newItems[idx],
                                  description: e.target.value,
                                };
                                setExpenseForm((prev) => ({
                                  ...prev,
                                  items: newItems,
                                }));
                              }}
                              placeholder="বিবরণ (অপশনাল)"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              required
                              value={item.unitPrice}
                              onChange={(e) => {
                                const newItems = [...expenseForm.items];
                                newItems[idx] = {
                                  ...newItems[idx],
                                  unitPrice: e.target.value,
                                };
                                const total = newItems.reduce(
                                  (s, it) =>
                                    s +
                                    (parseFloat(it.qty) || 0) *
                                      (parseFloat(it.unitPrice) || 0),
                                  0,
                                );
                                setExpenseForm((prev) => ({
                                  ...prev,
                                  items: newItems,
                                  amount: total,
                                }));
                              }}
                              placeholder="0.00"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-right focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-right font-semibold text-gray-700 text-sm whitespace-nowrap">
                            {fmt(lineTotal)}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            {expenseForm.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = expenseForm.items.filter(
                                    (_, i) => i !== idx,
                                  );
                                  const total = newItems.reduce(
                                    (s, it) =>
                                      s +
                                      (parseFloat(it.qty) || 0) *
                                        (parseFloat(it.unitPrice) || 0),
                                    0,
                                  );
                                  setExpenseForm((prev) => ({
                                    ...prev,
                                    items: newItems,
                                    amount: total,
                                  }));
                                }}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ─── Mobile Cards (hidden on desktop) ─── */}
              <div className="sm:hidden divide-y divide-gray-100">
                {expenseForm.items.map((item, idx) => {
                  const lineTotal =
                    (parseFloat(item.qty) || 0) *
                    (parseFloat(item.unitPrice) || 0);
                  return (
                    <div key={idx} className="bg-white p-4 space-y-3">
                      {/* Card top row: index + delete */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            আইটেম #{idx + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-emerald-600">
                            {fmt(lineTotal)}
                          </span>
                          {expenseForm.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = expenseForm.items.filter(
                                  (_, i) => i !== idx,
                                );
                                const total = newItems.reduce(
                                  (s, it) =>
                                    s +
                                    (parseFloat(it.qty) || 0) *
                                      (parseFloat(it.unitPrice) || 0),
                                  0,
                                );
                                setExpenseForm((prev) => ({
                                  ...prev,
                                  items: newItems,
                                  amount: total,
                                }));
                              }}
                              className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Item name */}
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">
                          আইটেমের নাম
                        </label>
                        <input
                          type="text"
                          required
                          value={item.itemName}
                          onChange={(e) => {
                            const newItems = [...expenseForm.items];
                            newItems[idx] = {
                              ...newItems[idx],
                              itemName: e.target.value,
                            };
                            const total = newItems.reduce(
                              (s, it) =>
                                s +
                                (parseFloat(it.qty) || 0) *
                                  (parseFloat(it.unitPrice) || 0),
                              0,
                            );
                            setExpenseForm((prev) => ({
                              ...prev,
                              items: newItems,
                              amount: total,
                            }));
                          }}
                          placeholder="আইটেমের নাম লিখুন"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
                        />
                      </div>
                      {/* Qty + Unit Price row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">
                            পরিমাণ
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.qty}
                            onChange={(e) => {
                              const newItems = [...expenseForm.items];
                              newItems[idx] = {
                                ...newItems[idx],
                                qty: e.target.value,
                              };
                              const total = newItems.reduce(
                                (s, it) =>
                                  s +
                                  (parseFloat(it.qty) || 0) *
                                    (parseFloat(it.unitPrice) || 0),
                                0,
                              );
                              setExpenseForm((prev) => ({
                                ...prev,
                                items: newItems,
                                amount: total,
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-center focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">
                            একক মূল্য (৳)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            required
                            value={item.unitPrice}
                            onChange={(e) => {
                              const newItems = [...expenseForm.items];
                              newItems[idx] = {
                                ...newItems[idx],
                                unitPrice: e.target.value,
                              };
                              const total = newItems.reduce(
                                (s, it) =>
                                  s +
                                  (parseFloat(it.qty) || 0) *
                                    (parseFloat(it.unitPrice) || 0),
                                0,
                              );
                              setExpenseForm((prev) => ({
                                ...prev,
                                items: newItems,
                                amount: total,
                              }));
                            }}
                            placeholder="0.00"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-right focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
                          />
                        </div>
                      </div>
                      {/* Description */}
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">
                          বিবরণ
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...expenseForm.items];
                            newItems[idx] = {
                              ...newItems[idx],
                              description: e.target.value,
                            };
                            setExpenseForm((prev) => ({
                              ...prev,
                              items: newItems,
                            }));
                          }}
                          placeholder="বিবরণ (অপশনাল)"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grand Total */}
              <div className="px-4 py-3 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-between">
                <span className="text-white font-bold text-sm">সর্বমোট</span>
                <span className="text-white font-bold text-lg sm:text-xl tracking-wide">
                  {fmt(
                    expenseForm.items.reduce(
                      (s, it) =>
                        s +
                        (parseFloat(it.qty) || 0) *
                          (parseFloat(it.unitPrice) || 0),
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>
            {/* Description */}
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all h-20 resize-none"
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
// ════════════════════════════
// ═══ MESSAGES TAB ═══════════
// ════════════════════════════
function MessagesTab({ messages, onRefresh, showToast }) {
  return (
    <div className="space-y-6 animate-slide-in">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">
            যোগাযোগ বার্তা ({messages?.length || 0})
          </h3>
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-50 rounded-lg"
          >
            <Activity size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">তারিখ</th>
                <th className="px-6 py-3">নাম</th>
                <th className="px-6 py-3">ফোন/ইমেইল</th>
                <th className="px-6 py-3">বার্তা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {messages?.map((msg) => (
                <tr
                  key={msg._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString("bn-BD")}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {msg.name}
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-mono">
                    {msg.contact}
                  </td>
                  <td
                    className="px-6 py-4 text-gray-600 max-w-md truncate"
                    title={msg.message}
                  >
                    {msg.message}
                  </td>
                </tr>
              ))}
              {(!messages || messages.length === 0) && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    কোনো বার্তা নেই
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════
// ═══ JOIN REQUESTS TAB ══════
// ════════════════════════════
function JoinRequestsTab({ requests, onRefresh, showToast }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(null);

  // State for status update modal
  const [statusUpdateModal, setStatusUpdateModal] = useState(null);
  const [emailMessage, setEmailMessage] = useState("");

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    if (statusFilter === "all") return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const counts = useMemo(() => {
    if (!requests) return { all: 0, pending: 0, approved: 0, rejected: 0 };
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    };
  }, [requests]);

  // Open modal for status change
  const handleStatusChange = (request, status) => {
    // If setting back to pending, no email needed usually, or simple confirm
    if (status === "pending") {
      updateStatus(request._id, status);
      return;
    }

    // Set default message based on status
    const isApproved = status === "approved";
    const defaultMessage = isApproved
      ? "অভিনন্দন! আপনার সদস্যপদ আবেদন অনুমোদিত হয়েছে। আমাদের পরিবারে আপনাকে স্বাগতম।"
      : "দুঃখিত, আপনার সদস্যপদ আবেদনটি এই মুহূর্তে গৃহীত হয়নি। অনুগ্রহ করে পরবর্তীতে আবার চেষ্টা করুন।";

    setEmailMessage(defaultMessage);
    setStatusUpdateModal({ request, status });
  };

  // Execute the update
  const handleConfirmStatusUpdate = async () => {
    if (!statusUpdateModal) return;
    const { request, status } = statusUpdateModal;

    setProcessing(request._id);
    try {
      const res = await fetch(`/api/join/${request._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, message: emailMessage }),
      });
      const data = await res.json();

      if (data.success) {
        let toastMsg = `আবেদন ${status === "approved" ? "অনুমোদিত" : "বাতিল"} করা হয়েছে`;
        if (data.emailSent) {
          toastMsg += " ও ইমেইল পাঠানো হয়েছে";
        } else if (data.emailError) {
          toastMsg += " কিন্তু ইমেইল পাঠানো যায়নি";
          console.error("Email error:", data.emailError);
        }
        showToast(toastMsg, data.emailError ? "warning" : "success");

        onRefresh();
        if (selectedRequest?._id === request._id) {
          setSelectedRequest({ ...selectedRequest, status });
        }
        setStatusUpdateModal(null);
      } else {
        showToast(data.message || "সমস্যা হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার এরর", "error");
    } finally {
      setProcessing(null);
    }
  };

  const updateStatus = async (id, status) => {
    const confirmed = await confirmAction({
      title: "নিশ্চিত করুন",
      text: "আপনি কি এই আবেদনের স্ট্যাটাস পরিবর্তন করতে চান?",
      confirmButtonText: "হ্যাঁ",
    });
    if (!confirmed) return;

    setProcessing(id);
    try {
      const res = await fetch(`/api/join/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("স্ট্যাটাস আপডেট হয়েছে");
        onRefresh();
        if (selectedRequest?._id === id) {
          setSelectedRequest({ ...selectedRequest, status });
        }
      } else {
        showToast(data.message || "সমস্যা হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার এরর", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "আবেদন মুছে ফেলতে চান?",
      text: "এটি ফিরিয়ে আনা যাবে না!",
      confirmButtonText: "হ্যাঁ, মুছুন",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/join/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("আবেদন মুছে ফেলা হয়েছে");
        onRefresh();
        if (selectedRequest?._id === id) setSelectedRequest(null);
      } else {
        showToast(data.message || "মুছতে সমস্যা হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার এরর", "error");
    }
  };

  const statusTabs = [
    { key: "all", label: "সকল", color: "text-gray-700 bg-gray-100" },
    { key: "pending", label: "অপেক্ষমান", color: "text-amber-700 bg-amber-50" },
    {
      key: "approved",
      label: "অনুমোদিত",
      color: "text-emerald-700 bg-emerald-50",
    },
    { key: "rejected", label: "বাতিল", color: "text-red-700 bg-red-50" },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-gray-400" />
            <p className="text-gray-400 text-xs">মোট আবেদন</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">{counts.all}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-amber-400" />
            <p className="text-amber-500 text-xs">অপেক্ষমান</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-emerald-400" />
            <p className="text-emerald-500 text-xs">অনুমোদিত</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {counts.approved}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <XCircleIcon size={16} className="text-red-400" />
            <p className="text-red-500 text-xs">বাতিল</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <h3 className="font-bold text-gray-800">সদস্য হওয়ার আবেদন</h3>
          <div className="flex items-center gap-2">
            {/* Status Filter Tabs */}
            <div className="bg-gray-50 p-1 rounded-xl inline-flex gap-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? `${tab.color} shadow-sm`
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1 opacity-70">({counts[tab.key]})</span>
                </button>
              ))}
            </div>
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              title="রিফ্রেশ"
            >
              <Activity size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">তারিখ</th>
                <th className="px-6 py-3">নাম</th>
                <th className="px-6 py-3">ফোন</th>
                <th className="px-6 py-3">ইমেইল</th>
                <th className="px-6 py-3">স্ট্যাটাস</th>
                <th className="px-6 py-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredRequests.map((req) => (
                <tr
                  key={req._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString("bn-BD")}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{req.fullName}</p>
                    {req.fatherName && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        পিতা: {req.fatherName}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-mono">
                    {req.phone}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {req.email ? (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-gray-400" />
                        <span className="text-xs">{req.email}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        req.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : req.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status === "pending"
                        ? "⏳ অপেক্ষমান"
                        : req.status === "approved"
                          ? "✅ অনুমোদিত"
                          : "❌ বাতিল"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1.5">
                      {/* View Details */}
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors cursor-pointer"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye size={16} />
                      </button>
                      {/* Approve */}
                      {req.status !== "approved" && (
                        <button
                          onClick={() => handleStatusChange(req, "approved")}
                          disabled={processing === req._id}
                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="অনুমোদন করুন"
                        >
                          {processing === req._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                      )}
                      {/* Reject */}
                      {req.status !== "rejected" && (
                        <button
                          onClick={() => handleStatusChange(req, "rejected")}
                          disabled={processing === req._id}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="বাতিল করুন"
                        >
                          {processing === req._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <XCircleIcon size={16} />
                          )}
                        </button>
                      )}
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(req._id)}
                        className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <UserPlus size={32} className="text-gray-200" />
                      <p>কোনো আবেদন নেই</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <Modal
          title="আবেদনের বিস্তারিত"
          onClose={() => setSelectedRequest(null)}
        >
          <div className="space-y-5">
            {/* Status Badge */}
            <div className="text-center">
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${
                  selectedRequest.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : selectedRequest.status === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {selectedRequest.status === "pending" && <Clock size={16} />}
                {selectedRequest.status === "approved" && (
                  <CheckCircle size={16} />
                )}
                {selectedRequest.status === "rejected" && (
                  <XCircleIcon size={16} />
                )}
                {selectedRequest.status === "pending"
                  ? "অপেক্ষমান"
                  : selectedRequest.status === "approved"
                    ? "অনুমোদিত"
                    : "বাতিল"}
              </span>
            </div>

            {/* Applicant Details */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-medium mb-0.5">
                    পূর্ণ নাম
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedRequest.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-medium mb-0.5">
                    ফোন নম্বর
                  </p>
                  <p className="text-sm font-mono text-emerald-600">
                    {selectedRequest.phone}
                  </p>
                </div>
                {selectedRequest.fatherName && (
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-medium mb-0.5">
                      পিতার নাম
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedRequest.fatherName}
                    </p>
                  </div>
                )}
                {selectedRequest.motherName && (
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-medium mb-0.5">
                      মাতার নাম
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedRequest.motherName}
                    </p>
                  </div>
                )}
                {selectedRequest.email && (
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-medium mb-0.5">
                      ইমেইল
                    </p>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <Mail size={13} className="text-gray-400" />
                      {selectedRequest.email}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-medium mb-0.5">
                    ঠিকানা
                  </p>
                  <p className="text-sm text-gray-700">
                    {selectedRequest.address}
                  </p>
                </div>
                {selectedRequest.profession && (
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-medium mb-0.5">
                      পেশা
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedRequest.profession}
                    </p>
                  </div>
                )}
                {selectedRequest.bloodGroup && (
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-medium mb-0.5">
                      রক্তের গ্রুপ
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedRequest.bloodGroup}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-medium mb-0.5">
                    আবেদনের তারিখ
                  </p>
                  <p className="text-sm text-gray-700">
                    {new Date(selectedRequest.createdAt).toLocaleDateString(
                      "bn-BD",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Email Notification Note */}
            {selectedRequest.email && (
              <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Mail size={14} className="mt-0.5 shrink-0" />
                <p>
                  স্ট্যাটাস পরিবর্তন করলে{" "}
                  <strong>{selectedRequest.email}</strong>-তে স্বয়ংক্রিয় ইমেইল
                  পাঠানো হবে।
                </p>
              </div>
            )}
            {!selectedRequest.email && (
              <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <Mail size={14} className="mt-0.5 shrink-0" />
                <p>
                  আবেদনকারী ইমেইল প্রদান করেননি। স্ট্যাটাস পরিবর্তন হলে ইমেইল
                  পাঠানো সম্ভব হবে না।
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedRequest.status !== "approved" && (
                <button
                  onClick={() =>
                    handleStatusChange(selectedRequest, "approved")
                  }
                  disabled={processing === selectedRequest._id}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {processing === selectedRequest._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  অনুমোদন করুন
                </button>
              )}
              {selectedRequest.status !== "rejected" && (
                <button
                  onClick={() =>
                    handleStatusChange(selectedRequest, "rejected")
                  }
                  disabled={processing === selectedRequest._id}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {processing === selectedRequest._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <XCircleIcon size={16} />
                  )}
                  বাতিল করুন
                </button>
              )}
              {selectedRequest.status !== "pending" && (
                <button
                  onClick={() => handleStatusChange(selectedRequest, "pending")}
                  disabled={processing === selectedRequest._id}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {processing === selectedRequest._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Clock size={16} />
                  )}
                  অপেক্ষমানে ফেরান
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedRequest._id)}
                className="py-2.5 px-4 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={16} />
                মুছুন
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* Email Confirmation Modal */}
      {statusUpdateModal && (
        <Modal
          title={`নিশ্চিতকরণ: ${statusUpdateModal.status === "approved" ? "আবেদন অনুমোদন" : "আবেদন বাতিল"}`}
          onClose={() => setStatusUpdateModal(null)}
        >
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl border ${statusUpdateModal.status === "approved" ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {statusUpdateModal.status === "approved" ? (
                  <CheckCircle className="text-emerald-600" size={24} />
                ) : (
                  <XCircleIcon className="text-red-600" size={24} />
                )}
                <div>
                  <p
                    className={`font-bold ${statusUpdateModal.status === "approved" ? "text-emerald-800" : "text-red-800"}`}
                  >
                    আপনি কি নিশ্চিত?
                  </p>
                  <p className="text-xs text-gray-500">
                    আবেদনকারীর স্ট্যাটাস পরিবর্তন করা হবে এবং নিচের ইমেইলটি
                    পাঠানো হবে।
                  </p>
                </div>
              </div>
            </div>

            {statusUpdateModal.request.email ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  ইমেইল বার্তা (সম্পাদনাযোগ্য)
                  <span className="text-xs font-normal text-gray-400">
                    প্রাপক: {statusUpdateModal.request.email}
                  </span>
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all h-32 resize-none leading-relaxed"
                />
                <p className="text-xs text-gray-400 text-right">
                  এই বার্তাটি ইমেইলের মূল অংশে যুক্ত করা হবে।
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-2 text-amber-700 text-sm">
                <Clock size={18} className="shrink-0" />
                <p>
                  সতর্কতা: আবেদনকারীর কোনো ইমেইল ঠিকানা নেই। তাই কোনো ইমেইল
                  পাঠানো হবে না, শুধুমাত্র স্ট্যাটাস আপডেট হবে।
                </p>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setStatusUpdateModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                disabled={processing === statusUpdateModal.request._id}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${statusUpdateModal.status === "approved" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"}`}
              >
                {processing === statusUpdateModal.request._id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Mail size={18} />
                )}
                Confirm & Send
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
