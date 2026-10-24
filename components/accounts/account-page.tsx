"use client";

import { useMemo, useState } from "react";
import {
    Search,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    MoreHorizontal,
    Download,
    SlidersHorizontal,
    Building2,
    QrCode,
    MessageSquareText,
    Users,
    CheckCircle2,
    Clock3,
    XCircle,
    ExternalLink,
    Mail,
    Phone,
    Globe,
    MapPin,
    CalendarDays,
    CreditCard,
    Copy,
    Eye,
    Pencil,
    Trash2,
    ShieldCheck,
    TrendingUp,
    ArrowRight,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type AccountStatus = "active" | "trial" | "suspended";
type Plan = "Starter" | "Growth" | "Business";

type Account = {
    id: string;
    business: string;
    initials: string;
    category: string;
    owner: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    status: AccountStatus;
    plan: Plan;
    qrCodes: number;
    scans: number;
    reviews: number;
    rating: number;
    conversion: number;
    joined: string;
    renewal: string;
    color: string;
};

const INITIAL_ACCOUNTS: Account[] = [
    {
        id: "ACC-1001",
        business: "The Coffee House",
        initials: "CH",
        category: "Cafe & Restaurant",
        owner: "Rahul Sharma",
        email: "rahul@coffeehouse.in",
        phone: "+91 98765 43210",
        location: "Connaught Place, New Delhi",
        website: "coffeehouse.in",
        status: "active",
        plan: "Business",
        qrCodes: 12,
        scans: 8240,
        reviews: 1248,
        rating: 4.8,
        conversion: 15.1,
        joined: "2026-01-12",
        renewal: "2026-11-12",
        color: "bg-amber-100 text-amber-800",
    },
    {
        id: "ACC-1002",
        business: "Urban Cuts Studio",
        initials: "UC",
        category: "Salon & Beauty",
        owner: "Priya Kapoor",
        email: "priya@urbancuts.in",
        phone: "+91 98111 22334",
        location: "Sector 18, Noida",
        website: "urbancuts.in",
        status: "active",
        plan: "Growth",
        qrCodes: 6,
        scans: 4120,
        reviews: 687,
        rating: 4.9,
        conversion: 16.7,
        joined: "2026-02-08",
        renewal: "2026-11-08",
        color: "bg-rose-100 text-rose-800",
    },
    {
        id: "ACC-1003",
        business: "FitCore Gym",
        initials: "FG",
        category: "Fitness & Wellness",
        owner: "Amit Verma",
        email: "amit@fitcore.in",
        phone: "+91 98222 33445",
        location: "Greater Noida, UP",
        website: "fitcore.in",
        status: "trial",
        plan: "Starter",
        qrCodes: 2,
        scans: 680,
        reviews: 92,
        rating: 4.6,
        conversion: 13.5,
        joined: "2026-10-10",
        renewal: "2026-10-24",
        color: "bg-blue-100 text-blue-800",
    },
    {
        id: "ACC-1004",
        business: "Bloom Dental Care",
        initials: "BD",
        category: "Healthcare",
        owner: "Neha Gupta",
        email: "neha@bloomdental.in",
        phone: "+91 98333 44556",
        location: "South Extension, Delhi",
        website: "bloomdental.in",
        status: "active",
        plan: "Business",
        qrCodes: 8,
        scans: 5920,
        reviews: 934,
        rating: 4.9,
        conversion: 15.8,
        joined: "2026-03-19",
        renewal: "2026-12-19",
        color: "bg-emerald-100 text-emerald-800",
    },
    {
        id: "ACC-1005",
        business: "Horizon Hotels",
        initials: "HH",
        category: "Hospitality",
        owner: "Karan Mehta",
        email: "karan@horizon.in",
        phone: "+91 98444 55667",
        location: "Aerocity, New Delhi",
        website: "horizonhotels.in",
        status: "suspended",
        plan: "Growth",
        qrCodes: 4,
        scans: 2340,
        reviews: 310,
        rating: 4.3,
        conversion: 13.2,
        joined: "2026-04-05",
        renewal: "2026-10-05",
        color: "bg-violet-100 text-violet-800",
    },
    {
        id: "ACC-1006",
        business: "The Green Table",
        initials: "GT",
        category: "Restaurant",
        owner: "Sneha Arora",
        email: "sneha@greentable.in",
        phone: "+91 98555 66778",
        location: "Hauz Khas, New Delhi",
        website: "greentable.in",
        status: "active",
        plan: "Growth",
        qrCodes: 5,
        scans: 3650,
        reviews: 540,
        rating: 4.7,
        conversion: 14.8,
        joined: "2026-05-22",
        renewal: "2026-11-22",
        color: "bg-lime-100 text-lime-800",
    },
    {
        id: "ACC-1007",
        business: "Pixel Print Studio",
        initials: "PP",
        category: "Retail & Services",
        owner: "Rohan Singh",
        email: "rohan@pixelprint.in",
        phone: "+91 98666 77889",
        location: "Sector 62, Noida",
        website: "pixelprint.in",
        status: "trial",
        plan: "Starter",
        qrCodes: 1,
        scans: 320,
        reviews: 41,
        rating: 4.5,
        conversion: 12.8,
        joined: "2026-10-13",
        renewal: "2026-10-27",
        color: "bg-orange-100 text-orange-800",
    },
    {
        id: "ACC-1008",
        business: "Aura Skin Clinic",
        initials: "AS",
        category: "Healthcare & Beauty",
        owner: "Simran Malhotra",
        email: "simran@auraskin.in",
        phone: "+91 98777 88990",
        location: "GK II, New Delhi",
        website: "auraskin.in",
        status: "active",
        plan: "Business",
        qrCodes: 9,
        scans: 7100,
        reviews: 1080,
        rating: 4.9,
        conversion: 15.2,
        joined: "2026-02-14",
        renewal: "2027-02-14",
        color: "bg-pink-100 text-pink-800",
    },
];

const numberFormat = new Intl.NumberFormat("en-IN");

function formatNumber(value: number) {
    return numberFormat.format(value);
}

function formatDate(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
}

function StatusBadge({
    status,
}: {
    status: AccountStatus;
}) {
    const styles = {
        active: "bg-emerald-50 text-emerald-700 border-emerald-200",
        trial: "bg-amber-50 text-amber-700 border-amber-200",
        suspended: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <Badge
            variant="outline"
            className={`rounded-sm gap-1.5 px-2 py-1 font-medium capitalize shadow-none ${styles[status]}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${status === "active"
                        ? "bg-emerald-600"
                        : status === "trial"
                            ? "bg-amber-500"
                            : "bg-red-500"
                    }`}
            />
            {status}
        </Badge>
    );
}

function PlanBadge({ plan }: { plan: Plan }) {
    return (
        <span
            className={`inline-flex items-center border px-2 py-1 text-xs font-medium rounded-sm ${plan === "Business"
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : plan === "Growth"
                        ? "bg-neutral-100 text-neutral-700 border-neutral-200"
                        : "bg-white text-neutral-500 border-neutral-200"
                }`}
        >
            {plan}
        </span>
    );
}

function MetricCard({
    label,
    value,
    change,
    icon: Icon,
    positive = true,
}: {
    label: string;
    value: string;
    change: string;
    icon: React.ElementType;
    positive?: boolean;
}) {
    return (
        <div className="border border-neutral-200 bg-white p-5 min-w-0">
            <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">
                    {label}
                </span>
                <Icon
                    size={18}
                    strokeWidth={1.7}
                    className="text-neutral-400"
                />
            </div>

            <div className="mt-5 flex items-end justify-between gap-2">
                <div className="text-3xl font-semibold tracking-tight text-neutral-950 tabular-nums">
                    {value}
                </div>

                <span
                    className={`flex items-center gap-0.5 text-xs font-medium whitespace-nowrap ${positive ? "text-emerald-700" : "text-neutral-500"
                        }`}
                >
                    {positive ? (
                        <ArrowUpRight size={14} />
                    ) : (
                        <ArrowDownRight size={14} />
                    )}
                    {change}
                </span>
            </div>
        </div>
    );
}

function DetailItem({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
}) {
    return (
        <div className="flex gap-3 py-3">
            <Icon
                size={17}
                className="text-neutral-400 mt-0.5 shrink-0"
            />
            <div className="min-w-0">
                <p className="text-xs text-neutral-500 mb-1">
                    {label}
                </p>
                <p className="text-sm text-neutral-900 break-words">
                    {value}
                </p>
            </div>
        </div>
    );
}

export default function AccountsPage() {
    const [accounts, setAccounts] =
        useState<Account[]>(INITIAL_ACCOUNTS);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [planFilter, setPlanFilter] = useState("all");
    const [selected, setSelected] = useState<Account | null>(
        null
    );
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [showCreate, setShowCreate] = useState(false);
    const [newBusiness, setNewBusiness] = useState("");
    const [newOwner, setNewOwner] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPlan, setNewPlan] = useState<Plan>("Starter");

    const PAGE_SIZE = 5;

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return accounts
            .filter((account) => {
                const matchesSearch = [
                    account.business,
                    account.owner,
                    account.email,
                    account.id,
                    account.category,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(query);

                return (
                    matchesSearch &&
                    (statusFilter === "all" ||
                        account.status === statusFilter) &&
                    (planFilter === "all" ||
                        account.plan === planFilter)
                );
            })
            .sort((a, b) => {
                if (sortBy === "name")
                    return a.business.localeCompare(b.business);
                if (sortBy === "reviews")
                    return b.reviews - a.reviews;
                if (sortBy === "scans")
                    return b.scans - a.scans;
                return b.joined.localeCompare(a.joined);
            });
    }, [accounts, search, statusFilter, planFilter, sortBy]);

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / PAGE_SIZE)
    );
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const visible = filtered.slice(start, start + PAGE_SIZE);

    const activeCount = accounts.filter(
        (a) => a.status === "active"
    ).length;
    const trialCount = accounts.filter(
        (a) => a.status === "trial"
    ).length;
    const totalQR = accounts.reduce(
        (sum, a) => sum + a.qrCodes,
        0
    );
    const totalReviews = accounts.reduce(
        (sum, a) => sum + a.reviews,
        0
    );

    function changeStatus(
        id: string,
        status: AccountStatus
    ) {
        setAccounts((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
        setSelected((prev) =>
            prev?.id === id ? { ...prev, status } : prev
        );
    }

    function exportCSV() {
        const columns: (keyof Account)[] = [
            "id",
            "business",
            "owner",
            "email",
            "status",
            "plan",
            "qrCodes",
            "scans",
            "reviews",
            "rating",
            "joined",
        ];

        const escapeCSV = (value: unknown) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
        };

        const csv = [
            columns.map(escapeCSV).join(","),
            ...filtered.map((a) =>
                columns.map((key) => escapeCSV(a[key])).join(",")
            ),
        ].join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "flexed-accounts.csv";
        link.click();
        URL.revokeObjectURL(url);
    }

    function createAccount(e: React.FormEvent) {
        e.preventDefault();
        if (
            !newBusiness.trim() ||
            !newOwner.trim() ||
            !newEmail.trim()
        )
            return;

        const id = `ACC-${Date.now()}`;
        const today = new Date().toISOString().slice(0, 10);

        const account: Account = {
            id,
            business: newBusiness.trim(),
            initials: newBusiness
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((word) => word[0].toUpperCase())
                .join(""),
            category: "Uncategorized",
            owner: newOwner.trim(),
            email: newEmail.trim(),
            phone: "Not provided",
            location: "Not provided",
            website: "Not provided",
            status: "trial",
            plan: newPlan,
            qrCodes: 0,
            scans: 0,
            reviews: 0,
            rating: 0,
            conversion: 0,
            joined: today,
            renewal: today,
            color: "bg-neutral-100 text-neutral-700",
        };

        setAccounts((prev) => [account, ...prev]);
        setShowCreate(false);
        setNewBusiness("");
        setNewOwner("");
        setNewEmail("");
        setNewPlan("Starter");
        setSearch("");
        setStatusFilter("all");
        setPlanFilter("all");
        setSortBy("newest");
        setPage(1);
    }

    return (
        <div className="min-h-screen bg-[#fafafa] text-neutral-900">
            <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
                {/* Breadcrumb */}
                <div className="mb-7 flex items-center gap-2 text-xs text-neutral-500">
                    <span>Workspace</span>
                    <ChevronRight size={13} />
                    <span className="font-medium text-neutral-900">
                        Accounts
                    </span>
                </div>

                {/* Heading */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-neutral-950">
                                Accounts
                            </h1>
                            <Badge
                                variant="secondary"
                                className="rounded-sm font-medium bg-neutral-100 text-neutral-600"
                            >
                                {accounts.length}
                            </Badge>
                        </div>
                        <p className="mt-1.5 text-sm text-neutral-500">
                            Manage businesses, subscriptions, and review
                            activity across your platform.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={exportCSV}
                            className="rounded-sm bg-white shadow-none"
                        >
                            <Download size={16} className="mr-2" />
                            Export
                        </Button>
                        <Button
                            onClick={() => setShowCreate(true)}
                            className="rounded-sm bg-neutral-950 text-white hover:bg-neutral-800 shadow-none"
                        >
                            <Plus size={16} className="mr-2" />
                            Add account
                        </Button>
                    </div>
                </div>

                {/* Overview */}
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Total accounts"
                        value={formatNumber(accounts.length)}
                        change="All time"
                        icon={Building2}
                        positive={false}
                    />
                    <MetricCard
                        label="Active accounts"
                        value={formatNumber(activeCount)}
                        change={`${Math.round(
                            (activeCount / Math.max(accounts.length, 1)) *
                            100
                        )}% of total`}
                        icon={CheckCircle2}
                    />
                    <MetricCard
                        label="QR codes deployed"
                        value={formatNumber(totalQR)}
                        change="Across all accounts"
                        icon={QrCode}
                        positive={false}
                    />
                    <MetricCard
                        label="Reviews collected"
                        value={formatNumber(totalReviews)}
                        change="All time"
                        icon={MessageSquareText}
                        positive={false}
                    />
                </div>

                {/* Main content */}
                <div className="mt-8 border border-neutral-200 bg-white">
                    {/* Section heading */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 px-5 py-5">
                        <div>
                            <h2 className="text-base font-semibold tracking-tight">
                                All accounts
                            </h2>
                            <p className="mt-1 text-xs text-neutral-500">
                                {activeCount} active · {trialCount} on trial ·{" "}
                                {accounts.length - activeCount - trialCount}{" "}
                                suspended
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Account directory
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-[340px]">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <Input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search businesses, owners, email..."
                                className="h-9 rounded-sm border-neutral-200 bg-white pl-9 text-sm shadow-none focus-visible:ring-1"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="h-9 w-[125px] rounded-sm border-neutral-200 shadow-none">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="trial">
                                        Trial
                                    </SelectItem>
                                    <SelectItem value="suspended">
                                        Suspended
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={planFilter}
                                onValueChange={(value) => {
                                    setPlanFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="h-9 w-[120px] rounded-sm border-neutral-200 shadow-none">
                                    <SelectValue placeholder="Plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All plans
                                    </SelectItem>
                                    <SelectItem value="Starter">
                                        Starter
                                    </SelectItem>
                                    <SelectItem value="Growth">
                                        Growth
                                    </SelectItem>
                                    <SelectItem value="Business">
                                        Business
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={sortBy}
                                onValueChange={setSortBy}
                            >
                                <SelectTrigger className="h-9 w-[140px] rounded-sm border-neutral-200 shadow-none">
                                    <SlidersHorizontal
                                        size={14}
                                        className="mr-1 text-neutral-500"
                                    />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">
                                        Newest first
                                    </SelectItem>
                                    <SelectItem value="name">
                                        Business name
                                    </SelectItem>
                                    <SelectItem value="reviews">
                                        Most reviews
                                    </SelectItem>
                                    <SelectItem value="scans">
                                        Most scans
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1080px] text-left">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50/70">
                                    {[
                                        "Business",
                                        "Status",
                                        "Plan",
                                        "QR codes",
                                        "Total scans",
                                        "Reviews",
                                        "Rating",
                                        "Joined",
                                        "",
                                    ].map((heading, index) => (
                                        <th
                                            key={index}
                                            className="px-5 py-3.5 text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-500 whitespace-nowrap"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-neutral-100">
                                {visible.map((account) => (
                                    <tr
                                        key={account.id}
                                        onClick={() => setSelected(account)}
                                        className="group cursor-pointer transition-colors hover:bg-neutral-50/80"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 rounded-sm">
                                                    <AvatarFallback
                                                        className={`rounded-sm text-xs font-semibold ${account.color}`}
                                                    >
                                                        {account.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900 group-hover:text-black">
                                                        {account.business}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-neutral-500">
                                                        {account.owner} · {account.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusBadge status={account.status} />
                                        </td>

                                        <td className="px-5 py-4">
                                            <PlanBadge plan={account.plan} />
                                        </td>

                                        <td className="px-5 py-4 text-sm tabular-nums">
                                            {account.qrCodes}
                                        </td>

                                        <td className="px-5 py-4 text-sm tabular-nums">
                                            {formatNumber(account.scans)}
                                        </td>

                                        <td className="px-5 py-4 text-sm tabular-nums">
                                            {formatNumber(account.reviews)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <span className="text-amber-500">★</span>
                                                <span className="font-medium tabular-nums">
                                                    {account.rating
                                                        ? account.rating.toFixed(1)
                                                        : "—"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-xs text-neutral-500 whitespace-nowrap">
                                            {formatDate(account.joined)}
                                        </td>

                                        <td
                                            className="px-5 py-4 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Actions for ${account.business}`}
                                                        className="h-8 w-8 rounded-sm"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-44 rounded-sm"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={() => setSelected(account)}
                                                    >
                                                        <Eye size={15} className="mr-2" />
                                                        View details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            navigator.clipboard?.writeText(
                                                                account.id
                                                            )
                                                        }
                                                    >
                                                        <Copy size={15} className="mr-2" />
                                                        Copy account ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {account.status === "suspended" ? (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                changeStatus(account.id, "active")
                                                            }
                                                        >
                                                            <CheckCircle2
                                                                size={15}
                                                                className="mr-2"
                                                            />
                                                            Reactivate
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                changeStatus(
                                                                    account.id,
                                                                    "suspended"
                                                                )
                                                            }
                                                            className="text-red-600"
                                                        >
                                                            <XCircle
                                                                size={15}
                                                                className="mr-2"
                                                            />
                                                            Suspend account
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {visible.length === 0 && (
                            <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center border border-neutral-200 bg-neutral-50">
                                    <Search
                                        size={20}
                                        className="text-neutral-400"
                                    />
                                </div>
                                <h3 className="text-sm font-semibold">
                                    No accounts found
                                </h3>
                                <p className="mt-1 text-sm text-neutral-500">
                                    Try adjusting your search or filters.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-5 rounded-sm"
                                    onClick={() => {
                                        setSearch("");
                                        setStatusFilter("all");
                                        setPlanFilter("all");
                                        setPage(1);
                                    }}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col gap-3 border-t border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-neutral-500">
                            Showing{" "}
                            <span className="font-medium text-neutral-800">
                                {filtered.length === 0 ? 0 : start + 1}–
                                {Math.min(start + PAGE_SIZE, filtered.length)}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-neutral-800">
                                {filtered.length}
                            </span>{" "}
                            accounts
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                className="h-8 rounded-sm shadow-none"
                            >
                                <ChevronLeft size={15} />
                                Previous
                            </Button>
                            <span className="px-2 text-xs text-neutral-500">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                className="h-8 rounded-sm shadow-none"
                            >
                                Next
                                <ChevronRight size={15} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
                    <span>Flexed / Platform administration</span>
                    <span>Account data · Demo environment</span>
                </div>
            </div>

            {/* Account detail drawer */}
            <Sheet
                open={!!selected}
                onOpenChange={(open) => {
                    if (!open) setSelected(null);
                }}
            >
                <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-[480px]">
                    {selected && (
                        <>
                            <SheetHeader className="border-b border-neutral-200 p-6 text-left">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 rounded-sm">
                                        <AvatarFallback
                                            className={`rounded-sm font-semibold ${selected.color}`}
                                        >
                                            {selected.initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <SheetTitle className="text-lg tracking-tight">
                                            {selected.business}
                                        </SheetTitle>
                                        <SheetDescription className="mt-1 text-xs">
                                            {selected.id} · {selected.category}
                                        </SheetDescription>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <StatusBadge status={selected.status} />
                                    <PlanBadge plan={selected.plan} />
                                </div>
                            </SheetHeader>

                            <div className="space-y-7 p-6">
                                <div>
                                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        Performance overview
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            {
                                                label: "QR codes",
                                                value: selected.qrCodes,
                                                icon: QrCode,
                                            },
                                            {
                                                label: "Total scans",
                                                value: formatNumber(selected.scans),
                                                icon: Eye,
                                            },
                                            {
                                                label: "Reviews",
                                                value: formatNumber(selected.reviews),
                                                icon: MessageSquareText,
                                            },
                                            {
                                                label: "Conversion",
                                                value: `${selected.conversion}%`,
                                                icon: TrendingUp,
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="border border-neutral-200 p-4"
                                            >
                                                <div className="flex items-center justify-between text-neutral-500">
                                                    <span className="text-xs">
                                                        {item.label}
                                                    </span>
                                                    <item.icon size={15} />
                                                </div>
                                                <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        Business information
                                    </h3>
                                    <DetailItem
                                        label="Account owner"
                                        value={selected.owner}
                                        icon={Users}
                                    />
                                    <DetailItem
                                        label="Email address"
                                        value={selected.email}
                                        icon={Mail}
                                    />
                                    <DetailItem
                                        label="Phone number"
                                        value={selected.phone}
                                        icon={Phone}
                                    />
                                    <DetailItem
                                        label="Business location"
                                        value={selected.location}
                                        icon={MapPin}
                                    />
                                    <DetailItem
                                        label="Website"
                                        value={selected.website}
                                        icon={Globe}
                                    />
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        Subscription details
                                    </h3>
                                    <DetailItem
                                        label="Current plan"
                                        value={`${selected.plan} plan`}
                                        icon={CreditCard}
                                    />
                                    <DetailItem
                                        label="Joined on"
                                        value={formatDate(selected.joined)}
                                        icon={CalendarDays}
                                    />
                                    <DetailItem
                                        label="Next renewal / trial end"
                                        value={formatDate(selected.renewal)}
                                        icon={Clock3}
                                    />
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        Account controls
                                    </h3>

                                    {selected.status === "suspended" ? (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                changeStatus(selected.id, "active")
                                            }
                                            className="w-full justify-start rounded-sm"
                                        >
                                            <CheckCircle2
                                                size={16}
                                                className="mr-2"
                                            />
                                            Reactivate account
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                changeStatus(
                                                    selected.id,
                                                    "suspended"
                                                )
                                            }
                                            className="w-full justify-start rounded-sm text-red-600 hover:text-red-700"
                                        >
                                            <XCircle
                                                size={16}
                                                className="mr-2"
                                            />
                                            Suspend account
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="sticky bottom-0 border-t border-neutral-200 bg-white p-5">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelected(null)}
                                    className="w-full rounded-sm shadow-none"
                                >
                                    Close details
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Create account drawer */}
            <Sheet open={showCreate} onOpenChange={setShowCreate}>
                <SheetContent className="w-full p-0 sm:max-w-[440px]">
                    <SheetHeader className="border-b border-neutral-200 p-6 text-left">
                        <SheetTitle className="text-lg">
                            Create new account
                        </SheetTitle>
                        <SheetDescription>
                            Add a business to the Flexed platform.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={createAccount} className="p-6">
                        <div className="space-y-5">
                            <div>
                                <label
                                    htmlFor="business-name"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Business name
                                </label>
                                <Input
                                    id="business-name"
                                    required
                                    value={newBusiness}
                                    onChange={(e) =>
                                        setNewBusiness(e.target.value)
                                    }
                                    placeholder="e.g. The Coffee House"
                                    className="rounded-sm shadow-none"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="owner-name"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Owner name
                                </label>
                                <Input
                                    id="owner-name"
                                    required
                                    value={newOwner}
                                    onChange={(e) =>
                                        setNewOwner(e.target.value)
                                    }
                                    placeholder="Full name"
                                    className="rounded-sm shadow-none"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="owner-email"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Email address
                                </label>
                                <Input
                                    id="owner-email"
                                    required
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) =>
                                        setNewEmail(e.target.value)
                                    }
                                    placeholder="owner@business.com"
                                    className="rounded-sm shadow-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Subscription plan
                                </label>
                                <Select
                                    value={newPlan}
                                    onValueChange={(value) =>
                                        setNewPlan(value as Plan)
                                    }
                                >
                                    <SelectTrigger className="w-full rounded-sm shadow-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Starter">
                                            Starter
                                        </SelectItem>
                                        <SelectItem value="Growth">
                                            Growth
                                        </SelectItem>
                                        <SelectItem value="Business">
                                            Business
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="border border-neutral-200 bg-neutral-50 p-4">
                                <div className="flex gap-3">
                                    <ShieldCheck
                                        size={18}
                                        className="shrink-0 text-neutral-600"
                                    />
                                    <p className="text-xs leading-relaxed text-neutral-600">
                                        This demo creates an account locally.
                                        No invitation email or backend request
                                        will be sent.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreate(false)}
                                className="flex-1 rounded-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 rounded-sm bg-neutral-950 text-white"
                            >
                                Create account
                                <ArrowRight size={15} className="ml-2" />
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}