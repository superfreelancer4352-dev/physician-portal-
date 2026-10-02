"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  FileCheck2,
  FileText,
  FlaskConical,
  HelpCircle,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  Package,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Stethoscope,
  Users,
  UserRound,
  Upload,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import Papa from "papaparse";
import QRCode from "qrcode";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

type Section = "home" | "how" | "faq" | "legal" | "contact";
type Status = "Prescribed" | "Shipped" | "Rebilled" | "Refunded";
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  tag: string;
  image?: string;
};
type Application = {
  id: string;
  practice: string;
  npi: string;
  state: string;
  specialty: string;
  contact: string;
  email: string;
  volume: string;
  status: "Pending" | "Approved" | "Declined";
  date: string;
  invited?: boolean;
};
type Order = {
  id: string;
  practice: string;
  affiliate: string;
  items: string;
  quantity: number;
  total: number;
  date: string;
  status: Status;
  kind: "Wholesale" | "Referral";
};
type Store = {
  practice: string;
  contact: string;
  email: string;
  state: string;
  specialty: string;
  role: "Referring" | "Prescribing";
  intakeUrl: string;
  affiliate: string;
  commission: number;
  active: boolean;
  msaSigned: boolean;
  idVerification: boolean;
  verificationStatus: "Not started" | "Verified";
  verificationToken: string;
  featured: string[];
  priceList: string;
  wholesalePrices: Record<string, number>;
  applications: Application[];
  products: Product[];
  orders: Order[];
};

const initial: Store = {
  practice: "Northstar Integrative Medicine",
  contact: "Dr. Maya Yazzie",
  email: "maya@northstar.example",
  state: "Colorado",
  specialty: "Integrative Medicine",
  role: "Prescribing",
  intakeUrl: "https://intake.example.com/northstar",
  affiliate: "NORTHSTAR24",
  commission: 15,
  active: true,
  msaSigned: true,
  idVerification: false,
  verificationStatus: "Not started",
  verificationToken: "",
  featured: ["NAD+ Support", "Metabolic Reset", "Recovery Blend"],
  priceList: "Standard clinic",
  wholesalePrices: { "PR-01": 118, "PR-02": 142, "PR-03": 96, "PR-04": 84 },
  applications: [
    {
      id: "APP-1048",
      practice: "Juniper Health Studio",
      npi: "1841657230",
      state: "Oregon",
      specialty: "Functional Medicine",
      contact: "Dr. Elena Ruiz",
      email: "elena@juniper.example",
      volume: "50–100 / month",
      status: "Pending",
      date: "Oct 01, 2026",
    },
    {
      id: "APP-1047",
      practice: "Harbor Men's Health",
      npi: "1275983416",
      state: "Florida",
      specialty: "Men's Health",
      contact: "Dr. Marcus Lee",
      email: "marcus@harbor.example",
      volume: "100–250 / month",
      status: "Approved",
      date: "Sep 30, 2026",
      invited: true,
    },
  ],
  products: [
    {
      id: "PR-01",
      name: "NAD+ Support",
      description: "Wellness support program",
      price: 118,
      tag: "CORE",
    },
    {
      id: "PR-02",
      name: "Metabolic Reset",
      description: "Clinician-guided metabolic program",
      price: 142,
      tag: "FEATURED",
    },
    {
      id: "PR-03",
      name: "Recovery Blend",
      description: "Recovery and vitality program",
      price: 96,
      tag: "CORE",
    },
    {
      id: "PR-04",
      name: "Sleep Balance",
      description: "Sleep wellness program",
      price: 84,
      tag: "NEW",
    },
  ],
  orders: [
    {
      id: "ORD-8034",
      practice: "Northstar Integrative Medicine",
      affiliate: "NORTHSTAR24",
      items: "NAD+ Support",
      quantity: 12,
      total: 1416,
      date: "Sep 28, 2026",
      status: "Shipped",
      kind: "Referral",
    },
    {
      id: "ORD-8031",
      practice: "Northstar Integrative Medicine",
      affiliate: "NORTHSTAR24",
      items: "Metabolic Reset",
      quantity: 8,
      total: 1136,
      date: "Sep 24, 2026",
      status: "Prescribed",
      kind: "Referral",
    },
    {
      id: "ORD-8028",
      practice: "Northstar Integrative Medicine",
      affiliate: "NORTHSTAR24",
      items: "Recovery Blend",
      quantity: 6,
      total: 576,
      date: "Sep 21, 2026",
      status: "Rebilled",
      kind: "Referral",
    },
    {
      id: "WH-1182",
      practice: "Northstar Integrative Medicine",
      affiliate: "NORTHSTAR24",
      items: "NAD+ Support, Recovery Blend",
      quantity: 6,
      total: 642,
      date: "Sep 19, 2026",
      status: "Shipped",
      kind: "Wholesale",
    },
  ],
};
const storageKey = "northstar-portal-demo-v1";
let demoSnapshot = initial;
let hasReadDemoSnapshot = false;
const demoListeners = new Set<() => void>();
function getDemoSnapshot() {
  if (typeof window === "undefined") return initial;
  if (!hasReadDemoSnapshot) {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved)
        demoSnapshot = { ...initial, ...(JSON.parse(saved) as Partial<Store>) };
    } catch {
      localStorage.removeItem(storageKey);
    }
    hasReadDemoSnapshot = true;
  }
  return demoSnapshot;
}
function subscribeDemoStore(listener: () => void) {
  demoListeners.add(listener);
  return () => demoListeners.delete(listener);
}
function updateDemoStore(next: Store | ((current: Store) => Store)) {
  const current = getDemoSnapshot();
  demoSnapshot = typeof next === "function" ? next(current) : next;
  hasReadDemoSnapshot = true;
  localStorage.setItem(storageKey, JSON.stringify(demoSnapshot));
  demoListeners.forEach((listener) => listener());
}
function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}
const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
const csv = (rows: string[][]) =>
  rows
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
function download(name: string, content: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Brand({ onClick }: { onClick: () => void }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Northstar home">
      <span className="brand-mark">
        <Stethoscope size={18} />
      </span>
      <span>
        NORTHSTAR<span className="brand-sub">CLINICIAN NETWORK</span>
      </span>
    </button>
  );
}

type PortalView = "public" | "portal" | "admin" | "register";

export function PortalClient({
  initialView = "public",
}: {
  initialView?: PortalView;
}) {
  const router = useRouter();
  const data = useSyncExternalStore(
    subscribeDemoStore,
    getDemoSnapshot,
    () => initial,
  );
  const setData = updateDemoStore;
  const [view, setView] = useState<PortalView>(initialView);
  const [section, setSection] = useState<Section>("home");
  const [portalTab, setPortalTab] = useState("Overview");
  const [adminTab, setAdminTab] = useState("Applications");
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [qr, setQr] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statementMonth, setStatementMonth] = useState("2026-09");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    let live = true;
    QRCode.toDataURL(data.intakeUrl, {
      width: 360,
      margin: 1,
      color: { dark: "#122523", light: "#ffffff" },
    })
      .then((value) => {
        if (live) setQr(value);
      })
      .catch(() => {
        if (live) setQr("");
      });
    return () => {
      live = false;
    };
  }, [data.intakeUrl]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const referrals = data.orders.filter((order) => order.kind === "Referral");
  const revenue = referrals.reduce((sum, order) => sum + order.total, 0);
  const pendingCount = data.applications.filter(
    (app) => app.status === "Pending",
  ).length;
  const cartCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const cartTotal = data.products.reduce(
    (sum, product) =>
      sum +
      (data.wholesalePrices[product.id] ?? product.price) *
        (cart[product.id] || 0),
    0,
  );
  const filteredProducts = useMemo(
    () =>
      data.products.filter((product) =>
        `${product.name} ${product.description} ${product.tag}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    [data.products, searchTerm],
  );
  function setField<K extends keyof Store>(key: K, value: Store[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }
  function navigate(next: Section) {
    setSection(next);
    setView("public");
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const app: Application = {
      id: createId("APP"),
      practice: String(form.get("practice")),
      npi: String(form.get("npi")),
      state: String(form.get("state")),
      specialty: String(form.get("specialty")),
      contact: String(form.get("contact")),
      email: String(form.get("email")),
      volume: String(form.get("volume")),
      status: "Pending",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };
    setData((current) => ({
      ...current,
      applications: [app, ...current.applications],
    }));
    setApplicationOpen(false);
    setToast("Application received. Our team will review your credentials.");
  }
  function reviewApplication(id: string, approve: boolean) {
    setData((current) => ({
      ...current,
      applications: current.applications.map((app) =>
        app.id === id
          ? {
              ...app,
              status: approve ? "Approved" : "Declined",
              invited: approve,
            }
          : app,
      ),
    }));
    setToast(
      approve
        ? "Approved. An invitation is ready to send."
        : "Application declined.",
    );
  }
  function openInvite(app: Application) {
    setData((current) => ({
      ...current,
      practice: app.practice,
      contact: app.contact,
      email: app.email,
      state: app.state,
      specialty: app.specialty,
      role: "Referring",
      affiliate: app.id.replace("APP-", "CLINIC"),
      active: true,
      msaSigned: false,
      verificationStatus: "Not started",
      verificationToken: "",
    }));
    router.push("/register");
  }
  function simulateVouchedVerification() {
    setData((current) => ({
      ...current,
      verificationStatus: "Verified",
      verificationToken: createId("VOUCHED-DEMO"),
    }));
    setToast("Demo verification recorded. No identity images were stored.");
  }
  function registerAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirmPassword"))) {
      setToast("Passwords do not match.");
      return;
    }
    if (data.idVerification && data.verificationStatus !== "Verified") {
      setToast("Complete identity verification before creating your account.");
      return;
    }
    setData((current) => ({
      ...current,
      contact: String(form.get("contact")),
      email: String(form.get("email")),
      active: true,
      msaSigned: false,
    }));
    setView("portal");
    setPortalTab("Overview");
    setToast("Account created. Review and sign your services agreement next.");
  }
  async function makePdf(card: boolean) {
    if (!qr) return;
    const pdf = card
      ? new jsPDF({
          orientation: "landscape",
          unit: "in",
          format: [3.75, 2.25],
        })
      : new jsPDF({ orientation: "portrait", unit: "in", format: "letter" });
    const width = card ? 3.75 : 8.5;
    const height = card ? 2.25 : 11;
    pdf.setFillColor(16, 34, 32);
    pdf.rect(0, 0, width, height, "F");
    if (card) {
      pdf.setTextColor(226, 239, 229);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("NORTHSTAR", 0.36, 0.48);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(158, 184, 169);
      pdf.text("CLINICIAN NETWORK", 0.36, 0.61);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text("A better way to begin.", 0.36, 1.15);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.setTextColor(194, 211, 199);
      pdf.text("Scan to explore clinician-guided care", 0.36, 1.32);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(2.56, 0.27, 0.93, 0.93, 0.06, 0.06, "F");
      pdf.addImage(qr, "PNG", 2.62, 0.33, 0.81, 0.81);
      pdf.setDrawColor(111, 149, 130);
      pdf.setLineWidth(0.006);
      pdf.rect(0.125, 0.125, 3.5, 2, "S");
      pdf.addPage([3.75, 2.25], "landscape");
      pdf.setFillColor(226, 239, 229);
      pdf.rect(0, 0, 3.75, 2.25, "F");
      pdf.setTextColor(16, 34, 32);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(data.practice, 0.3, 0.56, { maxWidth: 3.1 });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(data.contact, 0.3, 0.86);
      pdf.setTextColor(75, 103, 86);
      pdf.text("Your care journey starts with a conversation.", 0.3, 1.3, {
        maxWidth: 3.1,
      });
      pdf.setDrawColor(111, 149, 130);
      pdf.rect(0.125, 0.125, 3.5, 2, "S");
      pdf.save("northstar-business-card-bleed.pdf");
    } else {
      pdf.setTextColor(223, 237, 226);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text("NORTHSTAR", 0.65, 0.72);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(164, 190, 172);
      pdf.text(
        "CLINICIAN NETWORK  /  A provider-guided path to feeling better.",
        0.65,
        0.96,
      );
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text(data.practice, 0.65, 2.04, { maxWidth: 6.8 });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(200, 216, 204);
      pdf.text("Scan to explore clinician-guided care", 0.65, 2.42);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(2.36, 3.05, 3.78, 3.78, 0.12, 0.12, "F");
      pdf.addImage(qr, "PNG", 2.52, 3.21, 3.46, 3.46);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(236, 244, 237);
      pdf.text("A thoughtful next step starts here.", 4.25, 7.42, {
        align: "center",
      });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(164, 190, 172);
      pdf.text(data.featured.slice(0, 3).join("     /     "), 4.25, 7.72, {
        align: "center",
        maxWidth: 7.1,
      });
      pdf.text(
        "Scan the code to continue to your practice's secure intake.",
        4.25,
        9.78,
        { align: "center" },
      );
      pdf.setDrawColor(83, 125, 103);
      pdf.line(0.65, 10.14, 7.85, 10.14);
      pdf.setFontSize(8);
      pdf.text(`${data.contact}  ·  ${data.practice}`, 4.25, 10.45, {
        align: "center",
      });
      pdf.save("northstar-practice-qr-sheet.pdf");
    }
    setToast(
      card
        ? "Two-sided, bleed-ready business card downloaded."
        : "Letter-size QR sheet downloaded.",
    );
  }
  function signAgreement() {
    setField("msaSigned", true);
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Managed Services Agreement", 20, 24);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(
      "Signed electronically in the Northstar demonstration portal.",
      20,
      38,
    );
    pdf.text(`Practice: ${data.practice}`, 20, 53);
    pdf.text(`Authorized representative: ${data.contact}`, 20, 63);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 73);
    pdf.text("This demonstration document is not a legal agreement.", 20, 90);
    pdf.save("managed-services-agreement-demo.pdf");
    setToast("Demo agreement signed and saved to your downloads.");
  }
  function submitWholesale() {
    if (!cartCount) return;
    const order: Order = {
      id: createId("WH"),
      practice: data.practice,
      affiliate: data.affiliate,
      items: data.products
        .filter((p) => cart[p.id])
        .map((p) => `${p.name} × ${cart[p.id]}`)
        .join(", "),
      quantity: cartCount,
      total: cartTotal,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      status: "Prescribed",
      kind: "Wholesale",
    };
    setData((current) => ({ ...current, orders: [order, ...current.orders] }));
    setCart({});
    setToast(
      "Wholesale order submitted. Complete any prescriptions in your pharmacy system.",
    );
  }
  function addWebhook(status: Status) {
    const order: Order = {
      id: createId("EVT"),
      practice: data.practice,
      affiliate: data.affiliate,
      items: "Metabolic Reset",
      quantity: 1,
      total: 142,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      status,
      kind: "Referral",
    };
    setData((current) => ({ ...current, orders: [order, ...current.orders] }));
    setToast(
      `Demo ${status.toLowerCase()} webhook recorded for ${data.affiliate}.`,
    );
  }
  function exportOrders() {
    download(
      "northstar-orders.csv",
      csv([
        [
          "Order ID",
          "Practice",
          "Affiliate code",
          "Type",
          "Items",
          "Quantity",
          "Total",
          "Date",
          "Status",
        ],
        ...data.orders.map((o) => [
          o.id,
          o.practice,
          o.affiliate,
          o.kind,
          o.items,
          String(o.quantity),
          String(o.total),
          o.date,
          o.status,
        ]),
      ]),
    );
  }
  function exportProducts() {
    download(
      "northstar-products.csv",
      csv([
        ["name", "description", "image", "price", "tag"],
        ...data.products.map((product) => [
          product.name,
          product.description,
          product.image || "",
          String(product.price),
          product.tag,
        ]),
      ]),
    );
    setToast("Product catalog exported as CSV.");
  }
  function updateProduct(id: string, field: keyof Product, value: string) {
    setData((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === id
          ? { ...product, [field]: field === "price" ? Number(value) : value }
          : product,
      ),
    }));
  }
  function importProducts(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = Papa.parse<Record<string, string>>(String(reader.result), {
        header: true,
        skipEmptyLines: true,
      });
      const products = parsed.data
        .map((row, index) => ({
          id: `IM-${Date.now()}-${index}`,
          name: row.name?.trim() || "",
          description: row.description?.trim() || "",
          image: row.image?.trim() || "",
          price: Number(row.price),
          tag: row.tag?.trim() || "CORE",
        }))
        .filter(
          (product) =>
            product.name &&
            Number.isFinite(product.price) &&
            product.price >= 0,
        );
      setData((current) => ({
        ...current,
        products: [...current.products, ...products],
      }));
      setToast(
        `${products.length} products imported${parsed.errors.length ? ` · ${parsed.errors.length} rows skipped` : ""}.`,
      );
    };
    reader.readAsText(file);
  }
  function statementOrders() {
    return data.orders.filter((order) => {
      const date = new Date(order.date);
      return (
        order.kind === "Wholesale" &&
        !Number.isNaN(date.valueOf()) &&
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` ===
          statementMonth
      );
    });
  }
  function exportStatementCsv() {
    const orders = statementOrders();
    download(
      "northstar-practice-statement.csv",
      csv([
        [
          "Practice",
          "Order ID",
          "Items",
          "Quantity",
          "Wholesale total",
          "Date",
          "Status",
        ],
        ...orders.map((order) => [
          order.practice,
          order.id,
          order.items,
          String(order.quantity),
          String(order.total),
          order.date,
          order.status,
        ]),
      ]),
    );
    setToast("Practice statement exported as CSV.");
  }
  function exportStatementPdf() {
    const orders = statementOrders();
    const pdf = new jsPDF({ orientation: "landscape" });
    const monthName = new Date(
      `${statementMonth}-01T12:00:00`,
    ).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Northstar wholesale statement", 16, 20);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(data.practice, 16, 28);
    pdf.text(monthName, 16, 34);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("ORDER", 16, 47);
    pdf.text("ITEMS", 48, 47);
    pdf.text("QTY", 163, 47);
    pdf.text("DATE", 185, 47);
    pdf.text("STATUS", 225, 47);
    pdf.text("TOTAL", 265, 47);
    pdf.setFont("helvetica", "normal");
    orders.slice(0, 25).forEach((order, index) => {
      const y = 55 + index * 8;
      pdf.text(order.id, 16, y);
      pdf.text(order.items.slice(0, 64), 48, y);
      pdf.text(String(order.quantity), 163, y);
      pdf.text(order.date, 185, y);
      pdf.text(order.status, 225, y);
      pdf.text(money(order.total), 265, y);
    });
    const total = orders.reduce((sum, order) => sum + order.total, 0);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      `Wholesale total: ${money(total)}`,
      265,
      Math.min(270, 62 + Math.min(orders.length, 25) * 8),
    );
    pdf.save("northstar-practice-statement.pdf");
    setToast("Practice statement exported as PDF.");
  }

  const nav: { label: string; value: Section }[] = [
    { label: "Home", value: "home" },
    { label: "How it works", value: "how" },
    { label: "FAQ", value: "faq" },
    { label: "Legal", value: "legal" },
    { label: "Contact", value: "contact" },
  ];
  return (
    <main className="app-shell">
      {view === "public" && (
        <>
          <header className="topbar">
            <div className="topbar-inner">
              <Brand onClick={() => navigate("home")} />
              <button
                className="mobile-menu-button"
                aria-label="Toggle navigation"
                onClick={() => setMobileMenu(!mobileMenu)}
              >
                {mobileMenu ? <X size={19} /> : <Menu size={19} />}
              </button>
              <nav className={`public-nav ${mobileMenu ? "is-open" : ""}`}>
                {nav.map((item) => (
                  <button
                    key={item.value}
                    className={
                      section === item.value ? "nav-link active" : "nav-link"
                    }
                    onClick={() => navigate(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="header-actions">
                <button
                  className="text-button"
                  onClick={() => {
                    setView("portal");
                    setPortalTab("Overview");
                  }}
                >
                  Physician login <ArrowRight size={14} />
                </button>
                <button
                  className="button button-lime button-small"
                  onClick={() => setApplicationOpen(true)}
                >
                  Request access <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </header>
          {section === "home" && (
            <>
              <section className="hero">
                <div
                  className="hero-backdrop"
                  role="img"
                  aria-label="Physician in a modern clinical practice"
                />
                <div className="hero-content page-width">
                  <div className="eyebrow">
                    <span className="eyebrow-line" /> A PRIVATE NETWORK FOR
                    LICENSED PROVIDERS
                  </div>
                  <h1>
                    More possibility.
                    <br />
                    <em>In your practice.</em>
                  </h1>
                  <p className="hero-copy">
                    A clinician-led wellness program, thoughtfully built around
                    the people who know their patients best.
                  </p>
                  <div className="hero-buttons">
                    <button
                      className="button button-lime"
                      onClick={() => setApplicationOpen(true)}
                    >
                      Request physician access <ArrowRight size={16} />
                    </button>
                    <button
                      className="button button-outline"
                      onClick={() => navigate("how")}
                    >
                      Explore the program <ArrowRight size={15} />
                    </button>
                  </div>
                  <div className="hero-footnote">
                    <ShieldCheck size={16} /> Physician-only network <span /> No
                    patient health records touch this site
                  </div>
                </div>
                <div className="hero-caption">
                  <span>01 / 04</span>
                  <span>CARE, WITH A CLEARER POINT OF VIEW</span>
                </div>
              </section>
              <section className="trust-strip">
                <div className="page-width trust-inner">
                  <span>BUILT FOR INDEPENDENT PRACTICES</span>
                  <div>
                    <span>
                      <BadgeCheck size={15} /> Provider-led
                    </span>
                    <span>
                      <LockKeyhole size={14} /> Privacy conscious
                    </span>
                    <span>
                      <Activity size={15} /> Clinically considered
                    </span>
                  </div>
                </div>
              </section>
              <section className="intro-section page-width">
                <div className="section-kicker">
                  A BETTER WAY TO EXTEND YOUR PRACTICE
                </div>
                <div className="intro-grid">
                  <h2>
                    Clinical care,
                    <br />
                    <em>with more room.</em>
                  </h2>
                  <div>
                    <p className="body-lead">
                      We give licensed providers a simple way to connect
                      patients with a trusted, cash-pay telehealth experience,
                      without adding another layer to the day.
                    </p>
                    <button
                      className="inline-link"
                      onClick={() => navigate("how")}
                    >
                      See how it works <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
                <div className="value-grid">
                  <Value
                    icon={<Users size={19} />}
                    index="01 / CONNECT"
                    title="Stay at the center."
                    copy="Share a practice-specific intake link. Your patient continues with the independent telehealth partner you choose."
                  />
                  <Value
                    icon={<QrCode size={19} />}
                    index="02 / MAKE IT YOURS"
                    title="Carry your identity."
                    copy="Branded QR materials make it easy for your community to find the next step, online or in-office."
                  />
                  <Value
                    icon={<BarChart3 size={19} />}
                    index="03 / STAY INFORMED"
                    title="Keep a clear view."
                    copy="See referral activity and practice materials in one quiet, purpose-built clinician workspace."
                  />
                </div>
              </section>
              <section className="dark-band">
                <div className="page-width dark-band-inner">
                  <div>
                    <div className="section-kicker">
                      FOR THE WAY YOU PRACTICE
                    </div>
                    <h2>
                      A considered program.
                      <br />
                      <em>Your practice, always.</em>
                    </h2>
                  </div>
                  <div>
                    <p>
                      Every practice is different. Your access, referral link,
                      and materials are organized around your practice, with the
                      flexibility to grow at your pace.
                    </p>
                    <button
                      className="button button-lime"
                      onClick={() => setApplicationOpen(true)}
                    >
                      Start your application <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </section>
              <section className="closing-cta page-width">
                <div>
                  <div className="section-kicker">
                    A NETWORK BUILT FOR PROVIDERS
                  </div>
                  <h2>
                    Let’s build something
                    <br />
                    <em>better together.</em>
                  </h2>
                </div>
                <button
                  className="button button-dark"
                  onClick={() => setApplicationOpen(true)}
                >
                  Request access <ArrowRight size={16} />
                </button>
              </section>
            </>
          )}
          {section === "how" && (
            <PublicPage
              title="A simpler connection."
              eyebrow="HOW IT WORKS"
              intro="A thoughtful extension to your practice, with clear steps from first conversation to ongoing visibility."
            >
              <div className="steps-grid">
                {[
                  [
                    "01",
                    "Apply for access",
                    "Share your practice details and professional credentials. Our team reviews every application.",
                  ],
                  [
                    "02",
                    "Get set up",
                    "After approval, review and sign the services agreement. Your workspace is ready once onboarding is complete.",
                  ],
                  [
                    "03",
                    "Share your link",
                    "Your practice gets a unique QR code and print materials. Patients continue to the third-party intake you configure.",
                  ],
                  [
                    "04",
                    "Follow activity",
                    "Referral events from your partner appear in your dashboard. Your practice stays in control of care.",
                  ],
                ].map(([n, title, copy]) => (
                  <article className="step-card" key={n}>
                    <span>{n}</span>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </article>
                ))}
              </div>
              <div className="notice-box">
                <ShieldCheck size={19} />
                <p>
                  <strong>Patient care stays with your chosen partner.</strong>
                  <br />
                  This provider workspace does not collect patient health
                  information.
                </p>
              </div>
              <button
                className="button button-dark"
                onClick={() => setApplicationOpen(true)}
              >
                Request physician access <ArrowRight size={15} />
              </button>
            </PublicPage>
          )}
          {section === "faq" && (
            <PublicPage title="Good questions." eyebrow="FREQUENTLY ASKED">
              <div className="faq-list">
                {[
                  [
                    "Who can apply?",
                    "Licensed physicians and qualified providers practicing in the United States may request access. Applications are reviewed by our team.",
                  ],
                  [
                    "Will patients create accounts here?",
                    "No. Patients scan your practice QR code and continue to the third-party telehealth intake destination you configure.",
                  ],
                  [
                    "Does this site store patient health information?",
                    "The portal is designed not to collect patient medical information. Referral reporting uses practice and order-event data supplied by your partner.",
                  ],
                  [
                    "How do I get my practice QR materials?",
                    "Once active, download your letter-size QR sheet or two-sided business card PDF from your portal.",
                  ],
                  [
                    "Can I order products for my office?",
                    "Eligible practices can browse their negotiated wholesale catalog, place practice orders, and export monthly statements.",
                  ],
                  [
                    "What do I need to complete onboarding?",
                    "After approval, create your account and review the Managed Services Agreement. Portal access begins after signing.",
                  ],
                  [
                    "How do referral and wholesale purchases differ?",
                    "Referral activity arrives from your partner. Wholesale orders are placed by the practice and recorded separately for billing.",
                  ],
                ].map(([q, a]) => (
                  <details className="faq-item" key={q}>
                    <summary>
                      {q}
                      <ChevronDown size={17} />
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </PublicPage>
          )}
          {section === "legal" && (
            <PublicPage
              title="The important details."
              eyebrow="LEGAL & POLICIES"
              intro="Final legal documents will be published here before launch. This language is placeholder copy for the working demo."
            >
              <div className="legal-list">
                {[
                  "Privacy notice",
                  "Terms of use",
                  "Managed Services Agreement",
                  "Provider program disclosures",
                ].map((name) => (
                  <div className="legal-row" key={name}>
                    <FileText size={18} />
                    <span>
                      <strong>{name}</strong>
                      <small>
                        Final copy supplied before production launch.
                      </small>
                    </span>
                    <span className="status-tag status-neutral">Draft</span>
                  </div>
                ))}
              </div>
            </PublicPage>
          )}
          {section === "contact" && (
            <PublicPage title="Here when you need us." eyebrow="CONTACT">
              <div className="contact-panel">
                <ContactCard
                  icon={<Mail size={19} />}
                  title="Provider support"
                  copy="Questions about applications, onboarding, or your workspace? Our team can help you find the next step."
                  link="providers@northstar.example"
                />
                <div>
                  <span className="value-icon">
                    <HelpCircle size={19} />
                  </span>
                  <h3>Already in the network?</h3>
                  <p>
                    Sign in to find your QR materials, review activity, or
                    contact your account administrator.
                  </p>
                  <button
                    className="inline-link"
                    onClick={() => setView("portal")}
                  >
                    Open physician login <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </PublicPage>
          )}
          <footer className="footer">
            <div className="page-width footer-inner">
              <Brand onClick={() => navigate("home")} />
              <span>© 2026 Northstar Clinician Network</span>
              <span>For licensed providers only</span>
            </div>
          </footer>
        </>
      )}

      {view === "register" && (
        <div className="workspace-shell register-shell">
          <WorkspaceHeader
            label="ACCOUNT REGISTRATION"
            onExit={() => router.push("/")}
            data={data}
          />
          <div className="register-layout page-width">
            <div className="register-intro">
              <div className="section-kicker">INVITED PROVIDER</div>
              <h1>
                Welcome to
                <br />
                <em>your next chapter.</em>
              </h1>
              <p>
                Set up your secure clinician account. Your practice workspace
                will open after you review and sign the Managed Services
                Agreement.
              </p>
              <div className="register-practice">
                <span className="practice-avatar">
                  <Stethoscope size={18} />
                </span>
                <span>
                  <small>INVITATION FOR</small>
                  <strong>{data.practice}</strong>
                  <small>{data.state} · {data.specialty}</small>
                </span>
                <BadgeCheck size={17} />
              </div>
              <div className="register-assurance">
                <ShieldCheck size={16} />
                <span>No patient information is collected during registration.</span>
              </div>
            </div>

            <section className="register-panel">
              <div className="section-kicker">01 / CREATE YOUR ACCOUNT</div>
              <h2>Account details</h2>
              <p className="register-panel-copy">
                Your password is used for this demo form only and is never saved.
              </p>
              <form className="register-form" onSubmit={registerAccount}>
                <label>
                  Authorized representative
                  <input
                    name="contact"
                    autoComplete="name"
                    defaultValue={data.contact}
                    required
                  />
                </label>
                <label>
                  Work email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={data.email}
                    required
                  />
                </label>
                <label>
                  Create password
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    required
                    placeholder="At least 12 characters"
                  />
                </label>
                <label>
                  Confirm password
                  <input
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    required
                    placeholder="Enter it again"
                  />
                </label>

                {data.idVerification && (
                  <div className="verification-panel">
                    <div className="verification-heading">
                      <span className="verification-icon">
                        <ShieldCheck size={17} />
                      </span>
                      <span>
                        <strong>Identity verification</strong>
                        <small>Required by this program</small>
                      </span>
                      <span
                        className={`status-tag ${data.verificationStatus === "Verified" ? "status-approved" : "status-pending"}`}
                      >
                        {data.verificationStatus}
                      </span>
                    </div>
                    {data.verificationStatus === "Verified" ? (
                      <p className="verification-result">
                        <CheckCircle2 size={14} /> Verification result and token
                        recorded. No ID images are stored.
                      </p>
                    ) : (
                      <button
                        className="button button-outline-light button-small"
                        type="button"
                        onClick={simulateVouchedVerification}
                      >
                        Simulate Vouched result <ArrowRight size={13} />
                      </button>
                    )}
                    <p className="verification-disclaimer">
                      Demo only. Live Vouched JS and signed webhook credentials
                      are not connected.
                    </p>
                  </div>
                )}

                <label className="register-consent">
                  <input type="checkbox" name="terms" required />
                  <span>
                    I confirm I am authorized to create this practice account
                    and accept the portal terms.
                  </span>
                </label>
                <button className="button button-lime register-submit" type="submit">
                  Create account <ArrowRight size={15} />
                </button>
              </form>
              <div className="register-next-step">
                <span>UP NEXT</span>
                <span><FileCheck2 size={14} /> Managed Services Agreement</span>
              </div>
            </section>
          </div>
          <WorkspaceFooter onExit={() => router.push("/")} />
        </div>
      )}

      {view === "portal" && (
        <div className="workspace-shell">
          <WorkspaceHeader
            label="PHYSICIAN WORKSPACE"
            onExit={() => setView("public")}
            data={data}
          />
          {!data.msaSigned ? (
            <div className="agreement-gate">
              <div className="gate-icon">
                <FileCheck2 size={23} />
              </div>
              <div className="section-kicker">ONE LAST STEP</div>
              <h1>
                Review your
                <br />
                <em>services agreement.</em>
              </h1>
              <p>
                Read and sign your Managed Services Agreement to activate your
                physician workspace. A copy will be saved when you sign.
              </p>
              <div className="agreement-preview">
                <div>
                  <FileText size={17} />
                  <span>
                    <strong>Managed Services Agreement</strong>
                    <small>
                      Northstar clinician services · Review before signing
                    </small>
                  </span>
                  <button
                    className="inline-link"
                    onClick={() => {
                      const pdf = new jsPDF();
                      pdf.text("Managed Services Agreement", 20, 25);
                      pdf.text(
                        "Review copy for demonstration purposes.",
                        20,
                        40,
                      );
                      pdf.save("msa-review-demo.pdf");
                    }}
                  >
                    Preview <ArrowDownToLine size={13} />
                  </button>
                </div>
                <p>
                  This demo agreement is not legal copy or a live electronic
                  signature.
                </p>
              </div>
              <button className="button button-lime" onClick={signAgreement}>
                I agree and sign <FileCheck2 size={15} />
              </button>
              <button className="back-link" onClick={() => setView("public")}>
                <ArrowLeft size={14} /> Back to site
              </button>
            </div>
          ) : (
            <>
              <div className="workspace-heading page-width">
                <div>
                  <div className="section-kicker">
                    {data.practice.toUpperCase()}{" "}
                    <span className="dot-separator">·</span>{" "}
                    {data.role.toUpperCase()} PARTNER
                  </div>
                  <h1>
                    Your practice,
                    <br />
                    <em>in good hands.</em>
                  </h1>
                </div>
                <div className="workspace-heading-actions">
                  <span className="live-tag">
                    <span /> Account active
                  </span>
                  <button
                    className="button button-outline-light button-small"
                    onClick={() => setView("admin")}
                  >
                    <Settings2 size={14} /> Admin demo
                  </button>
                </div>
              </div>
              <div className="portal-layout page-width">
                <aside className="portal-sidebar">
                  <div className="sidebar-label">WORKSPACE</div>
                  {[
                    ["Overview", LayoutDashboard],
                    ["Wholesale store", ShoppingBag],
                    ["Print materials", QrCode],
                    ["Order history", ClipboardList],
                    ["Practice profile", UserRound],
                  ].map(([label, Icon]) => (
                    <button
                      key={label as string}
                      className={`sidebar-item ${portalTab === label ? "selected" : ""}`}
                      onClick={() => setPortalTab(label as string)}
                    >
                      <Icon size={16} />
                      {label as string}
                      {label === "Wholesale store" && cartCount > 0 && (
                        <span className="sidebar-count">{cartCount}</span>
                      )}
                    </button>
                  ))}
                  <div className="sidebar-help">
                    <ShieldCheck size={16} />
                    <span>Provider support</span>
                    <a href="mailto:providers@northstar.example">
                      Contact our team
                    </a>
                  </div>
                </aside>
                <div className="portal-content">
                  {portalTab === "Overview" && (
                    <>
                      <div className="content-head">
                        <div>
                          <div className="section-kicker">
                            PRACTICE SNAPSHOT
                          </div>
                          <h2>
                            Good morning, {data.contact.split(" ").at(-1)}.
                          </h2>
                        </div>
                        <span className="date-label">
                          {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="stats-grid">
                        <Stat
                          label="Referral orders"
                          value={String(referrals.length)}
                          detail="All time"
                          icon={<ClipboardList size={17} />}
                        />
                        <Stat
                          label="Referral revenue"
                          value={money(revenue)}
                          detail="Reported by partner"
                          icon={<BarChart3 size={17} />}
                        />
                        <Stat
                          label="Refill rate"
                          value="28%"
                          detail="Across eligible orders"
                          icon={<RefreshCw size={17} />}
                        />
                      </div>
                      <div className="overview-grid">
                        <section className="panel qr-panel">
                          <div className="panel-heading">
                            <div>
                              <div className="section-kicker">
                                YOUR PRACTICE LINK
                              </div>
                              <h3>Share your QR code</h3>
                            </div>
                            <QrCode size={17} />
                          </div>
                          <div className="qr-preview">
                            {qr ? (
                              <Image
                                src={qr}
                                alt="Practice intake QR code"
                                width={105}
                                height={105}
                                unoptimized
                              />
                            ) : (
                              <span>Preparing QR code…</span>
                            )}
                          </div>
                          <div className="intake-link">
                            <span>{data.intakeUrl}</span>
                            <button
                              className="icon-button"
                              title="Copy intake link"
                              onClick={() => {
                                navigator.clipboard?.writeText(data.intakeUrl);
                                setToast("Intake link copied.");
                              }}
                            >
                              <ClipboardList size={15} />
                            </button>
                          </div>
                          <p className="fine-print">
                            Patients continue to the third-party intake
                            configured for your practice.
                          </p>
                          <button
                            className="button button-dark button-full"
                            onClick={() => setPortalTab("Print materials")}
                          >
                            Open print materials <ArrowRight size={14} />
                          </button>
                        </section>
                        <section className="panel activity-panel">
                          <div className="panel-heading">
                            <div>
                              <div className="section-kicker">
                                LATEST ACTIVITY
                              </div>
                              <h3>Referral activity</h3>
                            </div>
                            <button
                              className="inline-link"
                              onClick={() => setPortalTab("Order history")}
                            >
                              View all <ArrowRight size={13} />
                            </button>
                          </div>
                          <div className="activity-list">
                            {referrals.slice(0, 4).map((o) => (
                              <div className="activity-row" key={o.id}>
                                <span
                                  className={`activity-status status-${o.status.toLowerCase()}`}
                                >
                                  <Activity size={13} />
                                </span>
                                <div>
                                  <strong>{o.status}</strong>
                                  <small>
                                    {o.items} · {o.date}
                                  </small>
                                </div>
                                <span className="activity-amount">
                                  {money(o.total)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                      <section className="panel quick-links">
                        <div className="panel-heading">
                          <div>
                            <div className="section-kicker">QUICK ACCESS</div>
                            <h3>Your practice toolkit</h3>
                          </div>
                        </div>
                        <div className="quick-link-grid">
                          <Quick
                            label="QR sheet"
                            detail="Letter size · PDF"
                            icon={<Download size={17} />}
                            onClick={() => makePdf(false)}
                          />
                          <Quick
                            label="Business card"
                            detail="Two-sided · PDF"
                            icon={<QrCode size={17} />}
                            onClick={() => makePdf(true)}
                          />
                          <Quick
                            label="Wholesale store"
                            detail="Practice pricing"
                            icon={<ShoppingBag size={17} />}
                            onClick={() => setPortalTab("Wholesale store")}
                          />
                        </div>
                      </section>
                    </>
                  )}
                  {portalTab === "Wholesale store" && (
                    <>
                      <div className="content-head">
                        <div>
                          <div className="section-kicker">
                            PRACTICE ORDERING
                          </div>
                          <h2>Wholesale store</h2>
                          <p className="subhead">
                            Your negotiated practice pricing, in one place.
                          </p>
                        </div>
                        <div className="cart-summary">
                          <ShoppingCart size={16} />
                          <span>{cartCount} items</span>
                          <strong>{money(cartTotal)}</strong>
                        </div>
                      </div>
                      <div className="store-toolbar">
                        <label className="search-field">
                          <Search size={15} />
                          <input
                            placeholder="Search products"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </label>
                        <span className="price-note">
                          <LockKeyhole size={13} /> Practice pricing
                        </span>
                      </div>
                      <div className="product-grid">
                        {filteredProducts.map((p) => (
                          <article className="product-card" key={p.id}>
                            <div className="product-art">
                              {p.image ? (
                                <Image
                                  src={p.image}
                                  alt=""
                                  width={400}
                                  height={260}
                                  unoptimized
                                />
                              ) : (
                                <FlaskConical size={25} />
                              )}
                              <span>{p.tag}</span>
                            </div>
                            <div className="product-copy">
                              <h3>{p.name}</h3>
                              <p>{p.description}</p>
                              <div className="product-buy">
                                <strong>
                                  {money(data.wholesalePrices[p.id] ?? p.price)}{" "}
                                  <small>/ unit</small>
                                </strong>
                                <button
                                  className="add-button"
                                  onClick={() =>
                                    setCart((current) => ({
                                      ...current,
                                      [p.id]: (current[p.id] || 0) + 1,
                                    }))
                                  }
                                >
                                  <Plus size={15} /> Add
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                      <div className="order-disclaimer">
                        <ShieldCheck size={16} />
                        <span>
                          Wholesale orders contain no patient information.
                          Complete all prescriptions in your pharmacy’s own
                          system.
                        </span>
                      </div>
                      {cartCount > 0 && (
                        <div className="checkout-bar">
                          <div>
                            <strong>{cartCount} items in your order</strong>
                            <small>Wholesale total · {money(cartTotal)}</small>
                          </div>
                          <button
                            className="button button-lime"
                            onClick={submitWholesale}
                          >
                            Submit order <ArrowRight size={15} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {portalTab === "Print materials" && (
                    <>
                      <div className="content-head">
                        <div>
                          <div className="section-kicker">
                            BRANDED PRACTICE MATERIALS
                          </div>
                          <h2>Ready to share.</h2>
                          <p className="subhead">
                            Your QR code links directly to your practice intake.
                          </p>
                        </div>
                      </div>
                      <div className="materials-grid">
                        <article className="material-card">
                          <div className="material-preview qr-sheet-mock">
                            <div className="mock-brand">
                              NORTHSTAR <small>CLINICIAN NETWORK</small>
                            </div>
                            <strong>{data.practice}</strong>
                            <span>Scan to explore clinician-guided care</span>
                            {qr && (
                              <Image
                                src={qr}
                                alt="QR preview"
                                width={98}
                                height={98}
                                unoptimized
                              />
                            )}
                            <small>
                              {data.featured.slice(0, 3).join(" · ")}
                            </small>
                          </div>
                          <div className="material-details">
                            <div>
                              <span className="section-kicker">
                                LETTER SIZE · 8.5 × 11 IN
                              </span>
                              <h3>Practice QR sheet</h3>
                              <p>
                                Includes practice name, QR code, featured
                                programs, and instructions.
                              </p>
                            </div>
                            <button
                              className="button button-dark"
                              onClick={() => makePdf(false)}
                            >
                              <Download size={15} /> Download PDF
                            </button>
                          </div>
                        </article>
                        <article className="material-card">
                          <div className="material-preview card-material-mock">
                            <div className="card-mock-front">
                              <strong>NORTHSTAR</strong>
                              <small>CLINICIAN NETWORK</small>
                              <b>
                                A better way
                                <br />
                                to begin.
                              </b>
                              {qr && (
                                <Image
                                  src={qr}
                                  alt="QR preview"
                                  width={44}
                                  height={44}
                                  unoptimized
                                />
                              )}
                            </div>
                            <div className="card-mock-back">
                              <strong>{data.practice}</strong>
                              <small>{data.contact}</small>
                              <span>
                                Your care journey starts with a conversation.
                              </span>
                            </div>
                          </div>
                          <div className="material-details">
                            <div>
                              <span className="section-kicker">
                                3.5 × 2 IN · FRONT & BACK
                              </span>
                              <h3>Practice business card</h3>
                              <p>
                                Two-sided card layout with 0.125 in bleed on
                                every edge.
                              </p>
                            </div>
                            <button
                              className="button button-dark"
                              onClick={() => makePdf(true)}
                            >
                              <Download size={15} /> Download PDF
                            </button>
                          </div>
                        </article>
                      </div>
                      <div className="notice-box">
                        <QrCode size={18} />
                        <p>
                          <strong>Your unique intake destination</strong>
                          <br />
                          {data.intakeUrl}
                        </p>
                        <button
                          className="inline-link"
                          onClick={() => setPortalTab("Practice profile")}
                        >
                          Edit link <ArrowRight size={13} />
                        </button>
                      </div>
                    </>
                  )}
                  {portalTab === "Order history" && (
                    <>
                      <div className="content-head">
                        <div>
                          <div className="section-kicker">PRACTICE RECORDS</div>
                          <h2>Order history</h2>
                          <p className="subhead">
                            Referral events and wholesale purchases, clearly
                            separated.
                          </p>
                        </div>
                        <button
                          className="button button-outline-light button-small"
                          onClick={exportOrders}
                        >
                          <Download size={14} /> Export CSV
                        </button>
                      </div>
                      <OrderTable
                        orders={data.orders.filter(
                          (o) => o.practice === data.practice,
                        )}
                      />
                    </>
                  )}
                  {portalTab === "Practice profile" && (
                    <>
                      <div className="content-head">
                        <div>
                          <div className="section-kicker">ACCOUNT SETTINGS</div>
                          <h2>Practice profile</h2>
                          <p className="subhead">
                            Keep your contact and referral details current.
                          </p>
                        </div>
                      </div>
                      <form
                        className="profile-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          setToast("Practice profile saved.");
                        }}
                      >
                        <label>
                          Practice name
                          <input
                            value={data.practice}
                            onChange={(e) =>
                              setField("practice", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Primary contact
                          <input
                            value={data.contact}
                            onChange={(e) =>
                              setField("contact", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Contact email
                          <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setField("email", e.target.value)}
                          />
                        </label>
                        <label>
                          License state
                          <input
                            value={data.state}
                            onChange={(e) => setField("state", e.target.value)}
                          />
                        </label>
                        <label>
                          Specialty
                          <input
                            value={data.specialty}
                            onChange={(e) =>
                              setField("specialty", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Account role
                          <select
                            value={data.role}
                            onChange={(e) =>
                              setField("role", e.target.value as Store["role"])
                            }
                          >
                            <option>Referring</option>
                            <option>Prescribing</option>
                          </select>
                          <small>Role is informational in this version.</small>
                        </label>
                        <label className="form-wide">
                          Third-party intake URL
                          <input
                            type="url"
                            value={data.intakeUrl}
                            onChange={(e) =>
                              setField("intakeUrl", e.target.value)
                            }
                          />
                          <small>
                            Your QR code and print materials update
                            automatically.
                          </small>
                        </label>
                        <div className="form-wide profile-footer">
                          <span className="status-tag status-approved">
                            <CheckCircle2 size={12} />{" "}
                            {data.active
                              ? "Account active"
                              : "Account inactive"}
                          </span>
                          <button className="button button-dark" type="submit">
                            Save changes <Check size={14} />
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          <WorkspaceFooter onExit={() => setView("public")} />
        </div>
      )}

      {view === "admin" && (
        <div className="workspace-shell admin-shell">
          <WorkspaceHeader
            label="ADMINISTRATION"
            onExit={() => setView("public")}
            data={data}
          />
          <div className="admin-heading page-width">
            <div>
              <div className="section-kicker">NORTHSTAR OPERATIONS</div>
              <h1>
                Admin <em>console.</em>
              </h1>
            </div>
            <span className="admin-users">
              <Users size={15} /> 2 administrator accounts
            </span>
          </div>
          <div className="admin-layout page-width">
            <aside className="portal-sidebar">
              <div className="sidebar-label">MANAGE</div>
              {[
                ["Applications", ClipboardList],
                ["Practices", Users],
                ["Products", Package],
                ["Webhooks", Activity],
                ["Reports", BarChart3],
                ["Settings", Settings2],
              ].map(([label, Icon]) => (
                <button
                  key={label as string}
                  className={`sidebar-item ${adminTab === label ? "selected" : ""}`}
                  onClick={() => setAdminTab(label as string)}
                >
                  <Icon size={16} />
                  {label as string}
                  {label === "Applications" && pendingCount > 0 && (
                    <span className="sidebar-count">{pendingCount}</span>
                  )}
                </button>
              ))}
            </aside>
            <div className="portal-content admin-content">
              {adminTab === "Applications" && (
                <>
                  <div className="content-head">
                    <div>
                      <div className="section-kicker">PROVIDER INTAKE</div>
                      <h2>Applications</h2>
                      <p className="subhead">
                        Review credentials and manage invitations.
                      </p>
                    </div>
                    <span className="status-tag status-pending">
                      {pendingCount} awaiting review
                    </span>
                  </div>
                  <div className="application-list">
                    {data.applications.map((app) => (
                      <article className="application-card" key={app.id}>
                        <div className="application-top">
                          <div>
                            <span className="application-id">
                              {app.id} <span>·</span> {app.date}
                            </span>
                            <h3>{app.practice}</h3>
                            <span className="application-subtitle">
                              {app.specialty} · {app.state}
                            </span>
                          </div>
                          <span
                            className={`status-tag status-${app.status.toLowerCase()}`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <div className="application-facts">
                          <span>
                            <strong>Applicant</strong>
                            {app.contact}
                          </span>
                          <span>
                            <strong>NPI</strong>
                            {app.npi}
                          </span>
                          <span>
                            <strong>Est. volume</strong>
                            {app.volume}
                          </span>
                          <span>
                            <strong>Email</strong>
                            {app.email}
                          </span>
                        </div>
                        <div className="application-actions">
                          {app.status === "Pending" ? (
                            <>
                              <button
                                className="button button-dark button-small"
                                onClick={() => reviewApplication(app.id, true)}
                              >
                                <Check size={14} /> Approve & invite
                              </button>
                              <button
                                className="button button-danger button-small"
                                onClick={() => reviewApplication(app.id, false)}
                              >
                                Decline
                              </button>
                            </>
                          ) : app.status === "Approved" ? (
                            <>
                              <span className="invite-status">
                                <Mail size={14} /> Invitation queued · email
                                service required
                              </span>
                              <button
                                className="inline-link"
                                onClick={() => openInvite(app)}
                              >
                                Open invite <ArrowRight size={13} />
                              </button>
                            </>
                          ) : (
                            <span className="fine-print">
                              Application closed
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
              {adminTab === "Practices" && (
                <>
                  <div className="content-head">
                    <div>
                      <div className="section-kicker">ACCOUNT MANAGEMENT</div>
                      <h2>Practice directory</h2>
                      <p className="subhead">
                        Manage program access, referral terms, and practice
                        details.
                      </p>
                    </div>
                  </div>
                  <div className="practice-admin-card">
                    <div className="practice-card-head">
                      <span className="practice-avatar">
                        <Stethoscope size={18} />
                      </span>
                      <div>
                        <h3>{data.practice}</h3>
                        <span>
                          {data.affiliate} · {data.state}
                        </span>
                      </div>
                      <Toggle
                        value={data.active}
                        onChange={(value) => setField("active", value)}
                      />
                    </div>
                    <div className="practice-admin-fields">
                      <label>
                        Practice name
                        <input
                          value={data.practice}
                          onChange={(e) => setField("practice", e.target.value)}
                        />
                      </label>
                      <label>
                        Primary contact
                        <input
                          value={data.contact}
                          onChange={(e) => setField("contact", e.target.value)}
                        />
                      </label>
                      <label>
                        Contact email
                        <input
                          type="email"
                          value={data.email}
                          onChange={(e) => setField("email", e.target.value)}
                        />
                      </label>
                      <label>
                        License state
                        <input
                          value={data.state}
                          onChange={(e) => setField("state", e.target.value)}
                        />
                      </label>
                      <label>
                        Practice role
                        <select
                          value={data.role}
                          onChange={(e) =>
                            setField("role", e.target.value as Store["role"])
                          }
                        >
                          <option>Referring</option>
                          <option>Prescribing</option>
                        </select>
                      </label>
                      <label>
                        Affiliate code
                        <input
                          value={data.affiliate}
                          onChange={(e) =>
                            setField("affiliate", e.target.value.toUpperCase())
                          }
                        />
                      </label>
                      <label>
                        Commission %
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={data.commission}
                          onChange={(e) =>
                            setField("commission", Number(e.target.value))
                          }
                        />
                      </label>
                      <label>
                        Intake URL
                        <input
                          value={data.intakeUrl}
                          onChange={(e) =>
                            setField("intakeUrl", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Wholesale price list
                        <input
                          value={data.priceList}
                          onChange={(e) => setField("priceList", e.target.value)}
                        />
                      </label>
                      <label className="admin-wide">
                        Featured products
                        <input
                          value={data.featured.join(", ")}
                          onChange={(e) =>
                            setField(
                              "featured",
                              e.target.value
                                .split(",")
                                .map((v) => v.trim())
                                .filter(Boolean),
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="practice-card-footer">
                      <span>
                        <FileCheck2 size={14} /> MSA{" "}
                        {data.msaSigned ? "signed" : "pending"}
                      </span>
                      <span>
                        <b>WHOLESALE LIST</b> {data.priceList} · negotiated pricing
                      </span>
                    </div>
                    <div className="practice-price-list">
                      <div>
                        <strong>Negotiated unit prices</strong>
                        <span>Shown only to this practice in the wholesale store.</span>
                      </div>
                      <div className="practice-price-grid">
                        {data.products.map((product) => (
                          <label key={product.id}>
                            {product.name}
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={data.wholesalePrices[product.id] ?? product.price}
                              onChange={(e) =>
                                setField("wholesalePrices", {
                                  ...data.wholesalePrices,
                                  [product.id]: Number(e.target.value),
                                })
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="section-divider" />
                  <div className="content-head">
                    <div>
                      <div className="section-kicker">ONBOARDING QUEUE</div>
                      <h3>Applicant practices</h3>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Practice</th>
                          <th>Specialty</th>
                          <th>State</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.applications.map((app) => (
                          <tr key={app.id}>
                            <td>
                              <strong>{app.practice}</strong>
                              <small>{app.id}</small>
                            </td>
                            <td>{app.specialty}</td>
                            <td>{app.state}</td>
                            <td>Referring</td>
                            <td>
                              <span
                                className={`status-tag status-${app.status.toLowerCase()}`}
                              >
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {adminTab === "Products" && (
                <>
                  <div className="content-head">
                    <div>
                      <div className="section-kicker">CATALOG MANAGEMENT</div>
                      <h2>Product catalog</h2>
                      <p className="subhead">
                        Internal pharmacy tags are never shown to physicians.
                      </p>
                    </div>
                    <div className="export-actions">
                      <button
                        className="button button-outline-light button-small"
                        onClick={exportProducts}
                      >
                        <Download size={14} /> Export CSV
                      </button>
                      <button
                        className="button button-outline-light button-small"
                        onClick={() =>
                          download(
                            "northstar-product-template.csv",
                            'name,description,image,price,tag\n"New program","Short description","https://example.com/image.jpg",100,CORE',
                          )
                        }
                      >
                        <Download size={14} /> Template
                      </button>
                      <label className="button button-dark button-small upload-button">
                        <Upload size={14} /> Import CSV
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={(e) => importProducts(e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Description</th>
                          <th>Image URL</th>
                          <th>Default wholesale</th>
                          <th>Pharmacy tag · internal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.products.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <input
                                className="table-input"
                                aria-label={`${p.name} product name`}
                                value={p.name}
                                onChange={(e) => updateProduct(p.id, "name", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                className="table-input"
                                aria-label={`${p.name} description`}
                                value={p.description}
                                onChange={(e) => updateProduct(p.id, "description", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                className="table-input"
                                aria-label={`${p.name} image URL`}
                                value={p.image || ""}
                                placeholder="Optional image URL"
                                onChange={(e) => updateProduct(p.id, "image", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                className="table-input table-price-input"
                                aria-label={`${p.name} default wholesale price`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={p.price}
                                onChange={(e) => updateProduct(p.id, "price", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                className="table-input table-tag-input"
                                aria-label={`${p.name} internal pharmacy tag`}
                                value={p.tag}
                                onChange={(e) => updateProduct(p.id, "tag", e.target.value)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {adminTab === "Webhooks" && (
                <>
                  <div className="content-head">
                    <div>
                      <div className="section-kicker">PARTNER EVENTS</div>
                      <h2>Webhook activity</h2>
                      <p className="subhead">
                        Demo simulator. A live receiver requires a signed server
                        endpoint.
                      </p>
                    </div>
                    <span className="status-tag status-neutral">Demo mode</span>
                  </div>
                  <div className="webhook-banner">
                    <div className="webhook-symbol">
                      <Activity size={20} />
                    </div>
                    <div>
                      <strong>Practice affiliate code</strong>
                      <p>
                        Events match <b>{data.affiliate}</b> without patient
                        data.
                      </p>
                    </div>
                    <span className="event-key">practice_affiliate_code</span>
                  </div>
                  <div className="event-buttons">
                    <span>SIMULATE AN EVENT</span>
                    {(
                      [
                        "Prescribed",
                        "Shipped",
                        "Rebilled",
                        "Refunded",
                      ] as Status[]
                    ).map((s) => (
                      <button
                        className="event-button"
                        key={s}
                        onClick={() => addWebhook(s)}
                      >
                        <Plus size={14} />
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="content-head compact-head">
                    <div>
                      <div className="section-kicker">LATEST EVENTS</div>
                      <h3>Event ledger</h3>
                    </div>
                    <button
                      className="button button-outline-light button-small"
                      onClick={exportOrders}
                    >
                      <Download size={14} /> Export CSV
                    </button>
                  </div>
                  <OrderTable orders={data.orders.slice(0, 8)} />
                </>
              )}
              {adminTab === "Reports" && (
                <>
                  <div className="content-head">
                    <div>
                      <div className="section-kicker">PROGRAM PERFORMANCE</div>
                      <h2>Reports & statements</h2>
                      <p className="subhead">
                        Practice activity for the current reporting period.
                      </p>
                    </div>
                    <button
                      className="button button-dark button-small"
                      onClick={exportOrders}
                    >
                      <Download size={14} /> Export all orders
                    </button>
                  </div>
                  <div className="stats-grid admin-stats">
                    <Stat
                      label="Referral volume"
                      value={String(referrals.length)}
                      detail="Reported partner events"
                      icon={<Activity size={17} />}
                    />
                    <Stat
                      label="Tracked revenue"
                      value={money(revenue)}
                      detail="Referral events only"
                      icon={<BarChart3 size={17} />}
                    />
                    <Stat
                      label="Commission owed"
                      value={money(
                        referrals
                          .filter((o) => o.status !== "Refunded")
                          .reduce(
                            (sum, o) => sum + (o.total * data.commission) / 100,
                            0,
                          ),
                      )}
                      detail={`${data.commission}% · ${data.practice}`}
                      icon={<Users size={17} />}
                    />
                    <Stat
                      label="Wholesale orders"
                      value={String(
                        data.orders.filter((o) => o.kind === "Wholesale")
                          .length,
                      )}
                      detail="Practice purchases"
                      icon={<ShoppingBag size={17} />}
                    />
                  </div>
                  <div className="panel statement-panel">
                    <div>
                      <div className="section-kicker">PRACTICE STATEMENT</div>
                      <h3>{data.practice}</h3>
                      <p>
                        Monthly order detail for reconciliation and billing.
                      </p>
                    </div>
                    <div className="statement-controls">
                      <label>
                        Statement month
                        <select
                          value={statementMonth}
                          onChange={(e) => setStatementMonth(e.target.value)}
                        >
                          <option value="2026-09">September 2026</option>
                          <option value="2026-10">October 2026</option>
                          <option value="2026-08">August 2026</option>
                        </select>
                      </label>
                      <button
                        className="button button-dark"
                        onClick={exportStatementCsv}
                      >
                        <Download size={14} /> Export CSV
                      </button>
                      <button
                        className="button button-outline-light"
                        onClick={exportStatementPdf}
                      >
                        <FileText size={14} /> Export PDF
                      </button>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Practice</th>
                          <th>Affiliate code</th>
                          <th>Referral orders</th>
                          <th>Revenue</th>
                          <th>Commission</th>
                          <th>Wholesale</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <strong>{data.practice}</strong>
                          </td>
                          <td>{data.affiliate}</td>
                          <td>{referrals.length}</td>
                          <td>{money(revenue)}</td>
                          <td>
                            {money(
                              referrals
                                .filter((o) => o.status !== "Refunded")
                                .reduce(
                                  (sum, o) =>
                                    sum + (o.total * data.commission) / 100,
                                  0,
                                ),
                            )}
                          </td>
                          <td>
                            {money(
                              data.orders
                                .filter((o) => o.kind === "Wholesale")
                                .reduce((sum, o) => sum + o.total, 0),
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {adminTab === "Settings" && (
                <>
                  <div className="content-head">
                    <div>
                      <div className="section-kicker">
                        PLATFORM CONFIGURATION
                      </div>
                      <h2>Settings</h2>
                      <p className="subhead">
                        Feature controls and integration readiness.
                      </p>
                    </div>
                  </div>
                  <section className="setting-row">
                    <div className="setting-icon">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <strong>Provider identity verification</strong>
                      <p>
                        Require identity verification as part of provider
                        onboarding.
                      </p>
                      <span className="integration-note">
                        Feature-flagged · vendor integration required for
                        production
                      </span>
                    </div>
                    <Toggle
                      value={data.idVerification}
                      onChange={(value) => setField("idVerification", value)}
                    />
                  </section>
                  <div className="settings-integrations">
                    <div className="section-kicker">INTEGRATION STATUS</div>
                    {[
                      [
                        "Electronic signature",
                        "Dropbox Sign / DocuSign API",
                        "Not connected",
                      ],
                      [
                        "Email delivery",
                        "Transactional provider",
                        "Demo notifications",
                      ],
                      [
                        "Partner webhooks",
                        "Signed event endpoint",
                        "Simulator only",
                      ],
                      [
                        "File storage",
                        "Private document storage",
                        "Browser demo only",
                      ],
                    ].map(([a, b, c]) => (
                      <div className="integration-row" key={a}>
                        <span>
                          <strong>{a}</strong>
                          <small>{b}</small>
                        </span>
                        <span className="status-tag status-neutral">{c}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="button button-outline-light button-small reset-button"
                    onClick={() => {
                      localStorage.removeItem("northstar-portal-demo-v1");
                      setData(initial);
                      setCart({});
                      setToast("Demo workspace reset to sample data.");
                    }}
                  >
                    Reset demo data <RefreshCw size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
          <WorkspaceFooter onExit={() => setView("public")} />
        </div>
      )}

      {applicationOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setApplicationOpen(false);
          }}
        >
          <section
            className="application-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-title"
          >
            <div className="modal-top">
              <div>
                <div className="section-kicker">PHYSICIAN ACCESS</div>
                <h2 id="application-title">
                  Tell us about
                  <br />
                  <em>your practice.</em>
                </h2>
              </div>
              <button
                className="icon-button close-button"
                aria-label="Close application"
                onClick={() => setApplicationOpen(false)}
              >
                <X size={19} />
              </button>
            </div>
            <p className="modal-copy">
              Our team reviews every application. Have your professional details
              ready.
            </p>
            <form className="application-form" onSubmit={submitApplication}>
              <label>
                Practice name
                <input name="practice" required placeholder="Your practice" />
              </label>
              <label>
                NPI number
                <input
                  name="npi"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                  placeholder="10-digit NPI"
                />
              </label>
              <label>
                License state
                <select name="state" required defaultValue="">
                  <option value="" disabled>
                    Select state
                  </option>
                  {[
                    "Alabama",
                    "Alaska",
                    "Arizona",
                    "California",
                    "Colorado",
                    "Connecticut",
                    "Florida",
                    "Georgia",
                    "Illinois",
                    "Massachusetts",
                    "New York",
                    "Oregon",
                    "Texas",
                    "Washington",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Specialty
                <input
                  name="specialty"
                  required
                  placeholder="e.g. Internal medicine"
                />
              </label>
              <label>
                Primary contact
                <input name="contact" required placeholder="Full name" />
              </label>
              <label>
                Work email
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@practice.com"
                />
              </label>
              <label className="form-wide">
                Estimated patient volume
                <select name="volume" required defaultValue="">
                  <option value="" disabled>
                    Select monthly estimate
                  </option>
                  <option>Under 50 / month</option>
                  <option>50–100 / month</option>
                  <option>100–250 / month</option>
                  <option>250+ / month</option>
                </select>
              </label>
              <div className="form-wide modal-submit-row">
                <span>
                  <LockKeyhole size={13} /> No patient information requested
                </span>
                <button className="button button-lime" type="submit">
                  Submit application <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      <button
        className="admin-shortcut"
        onClick={() => {
          setView(view === "admin" ? "public" : "admin");
          setAdminTab("Applications");
        }}
        title="Open demo admin console"
      >
        {view === "admin" ? (
          <ArrowLeft size={14} />
        ) : (
          <SlidersHorizontal size={14} />
        )}
        <span>{view === "admin" ? "Exit admin" : "Admin demo"}</span>
      </button>
    </main>
  );
}

function PublicPage({
  title,
  eyebrow,
  intro,
  children,
}: {
  title: string;
  eyebrow: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="public-page page-width">
      <div className="section-kicker">{eyebrow}</div>
      <h1>{title}</h1>
      {intro && <p className="public-page-intro">{intro}</p>}
      <div className="public-page-body">{children}</div>
    </section>
  );
}
function Value({
  icon,
  index,
  title,
  copy,
}: {
  icon: ReactNode;
  index: string;
  title: string;
  copy: string;
}) {
  return (
    <article>
      <span className="value-icon">{icon}</span>
      <span className="value-index">{index}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </article>
  );
}
function ContactCard({
  icon,
  title,
  copy,
  link,
}: {
  icon: ReactNode;
  title: string;
  copy: string;
  link: string;
}) {
  return (
    <div>
      <span className="value-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
      <a className="inline-link" href={`mailto:${link}`}>
        {link} <ArrowRight size={15} />
      </a>
    </div>
  );
}
function WorkspaceHeader({
  label,
  onExit,
  data,
}: {
  label: string;
  onExit: () => void;
  data: Store;
}) {
  return (
    <header className="workspace-topbar">
      <div className="workspace-topbar-inner">
        <Brand onClick={onExit} />
        <span className="workspace-label">{label}</span>
        <div className="workspace-user">
          <span className="user-avatar">
            {data.contact
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </span>
          <span>
            {data.contact}
            <small>{data.practice}</small>
          </span>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}
function WorkspaceFooter({ onExit }: { onExit: () => void }) {
  return (
    <footer className="workspace-footer">
      <button onClick={onExit}>Northstar Clinician Network</button>
      <span>Provider workspace · Demo environment</span>
      <a href="mailto:providers@northstar.example">Provider support</a>
    </footer>
  );
}
function Stat({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <article className="stat-card">
      <div className="stat-label">
        {label}
        <span>{icon}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
function Quick({
  label,
  detail,
  icon,
  onClick,
}: {
  label: string;
  detail: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick}>
      <span>{icon}</span>
      <strong>{label}</strong>
      <small>{detail}</small>
    </button>
  );
}
function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="toggle-control">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span />
      {value ? "Enabled" : "Disabled"}
    </label>
  );
}
function OrderTable({ orders }: { orders: Order[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Type</th>
            <th>Items</th>
            <th>Date</th>
            <th>Status</th>
            <th className="align-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <strong>{o.id}</strong>
              </td>
              <td>
                <span
                  className={`type-pill ${o.kind === "Referral" ? "type-referral" : "type-wholesale"}`}
                >
                  {o.kind}
                </span>
              </td>
              <td>{o.items}</td>
              <td>{o.date}</td>
              <td>
                <span className={`status-tag status-${o.status.toLowerCase()}`}>
                  {o.status}
                </span>
              </td>
              <td className="align-right">{money(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
