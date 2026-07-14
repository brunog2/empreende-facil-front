import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionMetrics } from "../types/subscription";

const colors = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#64748b", "#8b5cf6"];

export function AdminSubscriptionCharts({ metrics }: { metrics: SubscriptionMetrics }) {
  const statusData = [
    { name: "Teste", value: metrics.trialing },
    { name: "Ativas", value: metrics.active },
    { name: "Inadimplentes", value: metrics.pastDue },
    { name: "Suspensas", value: metrics.suspended },
    { name: "Canceladas", value: metrics.canceled },
    { name: "Expiradas", value: metrics.expired },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card><CardHeader><CardTitle className="text-base">Assinaturas por status</CardTitle></CardHeader><CardContent className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82}>{statusData.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Assinaturas por plano</CardTitle></CardHeader><CardContent className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={metrics.byPlan}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" name="Assinaturas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Entradas e cancelamentos</CardTitle></CardHeader><CardContent className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={metrics.timeline}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Line type="monotone" dataKey="newSubscriptions" name="Novas" stroke="#10b981" strokeWidth={2} /><Line type="monotone" dataKey="cancellations" name="Cancelamentos" stroke="#ef4444" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card>
    </div>
  );
}
