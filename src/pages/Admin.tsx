import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import type { Session } from "@supabase/supabase-js";

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  monthly_revenue: string | null;
  years_in_operation: string | null;
  business_problems: string[] | null;
  biggest_challenge: string | null;
  tools_software: string | null;
  kpi_tracking: string | null;
  interest_in_paid: string | null;
  preferred_time: string | null;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  New: "bg-accent text-accent-foreground",
  Contacted: "bg-primary/10 text-primary",
  Qualified: "bg-primary text-primary-foreground",
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [filterInterest, setFilterInterest] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (!session) navigate("/admin-login");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate("/admin-login");
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    const fetchLeads = async () => {
      const { data } = await supabase
        .from("business_analysis_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setLeads(data as Lead[]);
    };
    fetchLeads();
  }, [session]);

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("business_analysis_leads").update({ status }).eq("id", id);
    if (!error) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const exportCSV = () => {
    const headers = ["Full Name", "Email", "Phone", "Company", "Industry", "Size", "Revenue", "Years", "Problems", "Challenge", "Tools", "KPI", "Interest", "Status", "Date"];
    const rows = filtered.map((l) => [
      l.full_name, l.email, l.phone || "", l.company_name, l.industry || "", l.company_size || "",
      l.monthly_revenue || "", l.years_in_operation || "", (l.business_problems || []).join("; "),
      l.biggest_challenge || "", l.tools_software || "", l.kpi_tracking || "", l.interest_in_paid || "",
      l.status, new Date(l.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = leads.filter((l) => {
    if (search && !`${l.full_name} ${l.email} ${l.company_name}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterIndustry !== "all" && l.industry !== filterIndustry) return false;
    if (filterInterest !== "all" && l.interest_in_paid !== filterInterest) return false;
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    return true;
  });

  const industries = [...new Set(leads.map((l) => l.industry).filter(Boolean))] as string[];

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Aishnar Digital" className="h-8 w-8" />
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: leads.length },
            { label: "New", value: leads.filter((l) => l.status === "New").length },
            { label: "Contacted", value: leads.filter((l) => l.status === "Contacted").length },
            { label: "Qualified", value: leads.filter((l) => l.status === "Qualified").length },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl p-4 card-shadow text-center">
              <p className="text-2xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterIndustry} onValueChange={setFilterIndustry}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Industry" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterInterest} onValueChange={setFilterInterest}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Interest" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Interest</SelectItem>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="Maybe">Maybe</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl card-shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="hidden md:table-cell">Industry</TableHead>
                <TableHead className="hidden lg:table-cell">Problems</TableHead>
                <TableHead className="hidden sm:table-cell">Interest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">No leads found</TableCell>
                </TableRow>
              ) : (
                filtered.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.full_name}</p>
                        <p className="text-xs text-muted-foreground">{lead.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{lead.company_name}</TableCell>
                    <TableCell className="hidden md:table-cell">{lead.industry || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(lead.business_problems || []).slice(0, 2).map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                        ))}
                        {(lead.business_problems || []).length > 2 && (
                          <Badge variant="secondary" className="text-xs">+{(lead.business_problems || []).length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{lead.interest_in_paid || "—"}</TableCell>
                    <TableCell>
                      <Select value={lead.status} onValueChange={(v) => handleStatusChange(lead.id, v)}>
                        <SelectTrigger className="w-[120px] h-8 border-0 p-0">
                          <Badge className={STATUS_COLORS[lead.status] || ""}>{lead.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Contacted">Contacted</SelectItem>
                          <SelectItem value="Qualified">Qualified</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Admin;
