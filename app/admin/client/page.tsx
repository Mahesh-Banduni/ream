"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Clapperboard,
  ShieldCheck,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientItem {
  client_id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  totalReels?: number;
}

interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [summary, setSummary] = useState({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Toast / notification banner state
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal states
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Add Client Form State
  const [newClientForm, setNewClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    is_active: true,
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(`/api/admin/clients?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
        setPagination(data.pagination);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      showNotification("Failed to connect to clients database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [searchQuery, statusFilter, sortBy, sortOrder, currentPage, limit]);

  // Toggle active/inactive status
  const handleToggleStatus = async (client: ClientItem) => {
    setTogglingId(client.client_id);
    const newStatus = !client.is_active;

    try {
      const res = await fetch(`/api/admin/clients/${client.client_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (res.ok) {
        setClients((prev) =>
          prev.map((c) =>
            c.client_id === client.client_id ? { ...c, is_active: newStatus } : c
          )
        );
        showNotification(
          `Client "${client.name}" status changed to ${newStatus ? "Active" : "Inactive"}`
        );
        // Refresh summary
        fetchClients();
      } else {
        showNotification("Failed to update client status", "error");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      showNotification("An error occurred while updating status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  // Delete client action
  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      const res = await fetch(`/api/admin/clients/${selectedClient.client_id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showNotification(`Client "${selectedClient.name}" has been deleted.`);
        setDeleteModalOpen(false);
        setSelectedClient(null);
        fetchClients();
      } else {
        showNotification("Failed to delete client", "error");
      }
    } catch (err) {
      console.error("Error deleting client:", err);
      showNotification("An error occurred while deleting client", "error");
    }
  };

  // Add new client action
  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.name.trim()) return;

    setSubmittingAdd(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClientForm),
      });

      if (res.ok) {
        showNotification(`New client "${newClientForm.name}" created successfully!`);
        setAddModalOpen(false);
        setNewClientForm({ name: "", email: "", phone: "", is_active: true });
        fetchClients();
      } else {
        showNotification("Failed to create client record", "error");
      }
    } catch (err) {
      console.error("Error creating client:", err);
      showNotification("An error occurred while creating client", "error");
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Sorting Column Header Click Handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300 ${
            notification.type === "success"
              ? "bg-emerald-900/90 text-emerald-100 border-emerald-500/50 backdrop-blur-md"
              : "bg-rose-900/90 text-rose-100 border-rose-500/50 backdrop-blur-md"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="size-5 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Client Management
            </h1>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-2.5 py-0.5 text-xs font-semibold">
              Admin Controls
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, sort, filter, view details, activate/deactivate, or delete client accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchClients}
            disabled={loading}
            className="gap-2 cursor-pointer border-border hover:bg-accent"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md shadow-primary/20"
          >
            <UserPlus className="size-4" />
            <span>Add New Client</span>
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-border/70 shadow-sm bg-card/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Registered Clients</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{summary.totalClients}</p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Users className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm bg-card/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Clients</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{summary.activeClients}</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm bg-card/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inactive Clients</p>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{summary.inactiveClients}</p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
              <XCircle className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter & Sort Control Toolbar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by client name, email, phone, or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-10 h-10 border-border/80 focus-visible:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    if (val) {
                      setStatusFilter(val);
                      setCurrentPage(1);
                    }
                  }}
                >
                  <SelectTrigger className="w-[140px] h-10 border-border/80 text-xs font-medium">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Field */}
              <div className="flex items-center gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(val) => {
                    if (val) setSortBy(val);
                  }}
                >
                  <SelectTrigger className="w-[140px] h-10 border-border/80 text-xs font-medium">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="created_at">Date Joined</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="totalReels">Total Reels</SelectItem>
                  </SelectContent>
                </Select>

                {/* Asc/Desc toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
                  className="h-10 w-10 border-border/80 cursor-pointer"
                >
                  {sortOrder === "asc" ? (
                    <ArrowUp className="size-4 text-primary" />
                  ) : (
                    <ArrowDown className="size-4 text-primary" />
                  )}
                </Button>
              </div>

              {/* Items Per Page Select */}
              <Select
                value={limit.toString()}
                onValueChange={(val) => {
                  if (val) {
                    setLimit(parseInt(val, 10));
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-[110px] h-10 border-border/80 text-xs font-medium">
                  <SelectValue placeholder="Per Page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card className="border-border/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border/70">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="py-4 px-4 font-bold cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Client Name</span>
                    {sortBy === "name" && (
                      <ArrowUpDown className="size-3.5 text-primary" />
                    )}
                  </div>
                </th>
                <th className="py-4 px-4 font-bold">Contact Info</th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-4 px-4 font-bold cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortBy === "status" && (
                      <ArrowUpDown className="size-3.5 text-primary" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("totalReels")}
                  className="py-4 px-4 font-bold cursor-pointer hover:text-foreground transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Total Reels</span>
                    {sortBy === "totalReels" && (
                      <ArrowUpDown className="size-3.5 text-primary" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("created_at")}
                  className="py-4 px-4 font-bold cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date Joined</span>
                    {sortBy === "created_at" && (
                      <ArrowUpDown className="size-3.5 text-primary" />
                    )}
                  </div>
                </th>
                <th className="py-4 px-4 font-bold text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-card">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="size-6 animate-spin text-primary" />
                      <p className="text-sm font-medium">Loading client directory...</p>
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-10 text-muted-foreground/40" />
                      <p className="text-base font-semibold text-foreground">No clients found</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Try adjusting your search query or status filter to locate client records.
                      </p>
                      {searchQuery && (
                        <Button
                          variant="link"
                          onClick={() => setSearchQuery("")}
                          className="mt-2 text-xs text-primary"
                        >
                          Clear search filter
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.client_id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Client Name & ID */}
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 text-primary font-bold flex items-center justify-center text-sm border border-primary/20 shrink-0">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="leading-tight truncate text-foreground font-semibold">{client.name}</p>
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                            ID: {client.client_id.substring(0, 12)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Mail className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{client.email || "N/A"}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="size-3.5 text-muted-foreground shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full gap-1.5 ${
                          client.is_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            client.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                          }`}
                        />
                        {client.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    {/* Total Reels */}
                    <td className="py-3.5 px-4 text-center font-extrabold text-foreground">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs font-mono border border-border/40">
                        <Clapperboard className="size-3.5 text-violet-500" />
                        <span>{client.totalReels ?? 0}</span>
                      </div>
                    </td>

                    {/* Date Joined */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground font-medium">
                      {new Date(client.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Status Toggle Switch / Button */}
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          disabled={togglingId === client.client_id}
                          onClick={() => handleToggleStatus(client)}
                          title={client.is_active ? "Deactivate Client" : "Activate Client"}
                          className={`h-8 px-2 text-xs gap-1 cursor-pointer transition-colors ${
                            client.is_active
                              ? "text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          {togglingId === client.client_id ? (
                            <RefreshCw className="size-3.5 animate-spin" />
                          ) : client.is_active ? (
                            <>
                              <ToggleRight className="size-4 text-emerald-500" />
                              <span className="hidden xl:inline">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="size-4 text-muted-foreground" />
                              <span className="hidden xl:inline">Inactive</span>
                            </>
                          )}
                        </Button> */}

                        {/* View Details Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedClient(client);
                            setViewModalOpen(true);
                          }}
                          title="View Client Details"
                          className="size-8 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                        >
                          <Eye className="size-4" />
                        </Button>

                        {/* Delete Client Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedClient(client);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete Client"
                          className="size-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground font-medium">
            Showing{" "}
            <span className="font-bold text-foreground">
              {pagination.totalItems > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-bold text-foreground">
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}
            </span>{" "}
            of <span className="font-bold text-foreground">{pagination.totalItems}</span> clients
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 text-xs gap-1 border-border/80 cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
              <span>Previous</span>
            </Button>

            {/* Page number buttons */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.currentPage) <= 1
              )
              .map((p, idx, arr) => (
                <div key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-xs text-muted-foreground">...</span>
                  )}
                  <Button
                    variant={p === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(p)}
                    className={`h-8 w-8 text-xs font-semibold cursor-pointer p-0 ${
                      p === pagination.currentPage ? "bg-primary text-primary-foreground" : "border-border/80"
                    }`}
                  >
                    {p}
                  </Button>
                </div>
              ))}

            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="h-8 px-3 text-xs gap-1 border-border/80 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* VIEW CLIENT DETAILS MODAL */}
      {viewModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-border pb-4">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-primary-foreground font-extrabold flex items-center justify-center text-xl shadow-md">
                {selectedClient.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedClient.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      selectedClient.is_active
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                    }`}
                  >
                    {selectedClient.is_active ? "Active Account" : "Inactive Account"}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    ID: {selectedClient.client_id}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Mail className="size-3.5 text-primary" /> Email Address
                  </p>
                  <p className="mt-1 font-semibold text-foreground truncate">{selectedClient.email || "Not Provided"}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Phone className="size-3.5 text-primary" /> Phone Number
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{selectedClient.phone || "Not Provided"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary" /> Date Registered
                  </p>
                  <p className="mt-1 font-semibold text-foreground">
                    {new Date(selectedClient.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clapperboard className="size-3.5 text-violet-500" /> Total Reels Created
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{selectedClient.totalReels ?? 0} Reels</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewModalOpen(false);
                  handleToggleStatus(selectedClient);
                }}
                className={selectedClient.is_active ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
              >
                {selectedClient.is_active ? "Deactivate Account" : "Activate Account"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CLIENT CONFIRMATION DIALOG */}
      {deleteModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Delete Client Account</h3>
                <p className="text-xs text-muted-foreground">Action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete client{" "}
              <strong className="text-foreground">{selectedClient.name}</strong> (ID: {selectedClient.client_id})?
              All associated reels and user data will be removed.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedClient(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteClient}
                className="bg-rose-600 text-white hover:bg-rose-700 font-semibold"
              >
                Delete Client Permanently
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW CLIENT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <UserPlus className="size-5 text-primary" />
                Register New Client
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Add a new client profile to grant access to the automated reel generator.
              </p>
            </div>

            <form onSubmit={handleAddClientSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Client Name *</label>
                <Input
                  required
                  placeholder="e.g. Apex Media Agency"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  className="h-10 border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <Input
                  type="email"
                  placeholder="contact@clientdomain.com"
                  value={newClientForm.email}
                  onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                  className="h-10 border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={newClientForm.phone}
                  onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                  className="h-10 border-border"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground">Initial Status</p>
                  <p className="text-[11px] text-muted-foreground">Set account as active upon creation</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setNewClientForm({ ...newClientForm, is_active: !newClientForm.is_active })}
                  className="gap-1 cursor-pointer"
                >
                  {newClientForm.is_active ? (
                    <ToggleRight className="size-6 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="size-6 text-muted-foreground" />
                  )}
                  <span className="text-xs font-semibold">{newClientForm.is_active ? "Active" : "Inactive"}</span>
                </Button>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingAdd} className="bg-primary text-primary-foreground font-semibold">
                  {submittingAdd ? "Saving..." : "Create Client Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
