import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Analytics() {
  const { user } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState("month");

  const { data: clinics } = trpc.clinic.listByOwner.useQuery();
  const clinicId = selectedClinic || clinics?.[0]?.id;

  const { data: transactions } = trpc.transaction.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const { data: appointments } = trpc.appointment.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const { data: medicalCases } = trpc.case.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const { data: vaccinations } = trpc.vaccination.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  // Calculate statistics
  const totalRevenue = transactions?.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0) || 0;
  const completedAppointments = appointments?.filter((a: any) => a.status === "completed").length || 0;
  const totalPatients = medicalCases?.length || 0;
  const vaccinationRate = vaccinations?.length ? (vaccinations.filter((v: any) => v.status === "completed").length / vaccinations.length * 100).toFixed(1) : 0;

  const handleExportPDF = () => {
    // Placeholder for PDF export functionality
    alert("PDF export feature coming soon!");
  };

  const handleExportCSV = () => {
    // Placeholder for CSV export functionality
    alert("CSV export feature coming soon!");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-600 mt-2">Comprehensive clinic performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Clinic</label>
              <select
                value={selectedClinic || ""}
                onChange={(e) => setSelectedClinic(e.target.value ? Number(e.target.value) : null)}
                className="w-full border rounded-md p-2 mt-1"
              >
                <option value="">All Clinics</option>
                {clinics?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border rounded-md p-2 mt-1"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-green-600 mt-2">↑ 12% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{completedAppointments}</div>
            <p className="text-xs text-slate-500 mt-2">Completed this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalPatients}</div>
            <p className="text-xs text-slate-500 mt-2">Medical cases managed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Vaccination Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{vaccinationRate}%</div>
            <p className="text-xs text-slate-500 mt-2">Compliance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="cases">Medical Cases</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>Income breakdown by service type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions && transactions.length > 0 ? (
                  <>
                    {["service", "product", "consultation"].map((type) => {
                      const typeTransactions = transactions.filter((t: any) => t.type === type);
                      const typeTotal = typeTransactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);
                      const percentage = totalRevenue > 0 ? (typeTotal / totalRevenue * 100).toFixed(1) : 0;

                      return (
                        <div key={type}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium capitalize">{type}</span>
                            <span className="text-sm font-bold">${typeTotal.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{percentage}% of total</p>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-slate-500">No revenue data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Status</CardTitle>
              <CardDescription>Breakdown of appointment statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["scheduled", "completed", "cancelled", "no_show"].map((status) => {
                  const statusAppointments = appointments?.filter((a: any) => a.status === status) || [];
                  const percentage = appointments?.length ? (statusAppointments.length / appointments.length * 100).toFixed(1) : 0;

                  return (
                    <div key={status}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{status}</span>
                        <span className="text-sm font-bold">{statusAppointments.length}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Cases Status</CardTitle>
              <CardDescription>Current status of all medical cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["open", "in_progress", "closed"].map((status) => {
                  const statusCases = medicalCases?.filter((c: any) => c.status === status) || [];
                  const percentage = medicalCases?.length ? (statusCases.length / medicalCases.length * 100).toFixed(1) : 0;

                  return (
                    <div key={status}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{status}</span>
                        <span className="text-sm font-bold">{statusCases.length}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vaccination Status</CardTitle>
              <CardDescription>Vaccination compliance and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["completed", "pending", "overdue"].map((status) => {
                  const statusVaccinations = vaccinations?.filter((v: any) => v.status === status) || [];
                  const percentage = vaccinations?.length ? (statusVaccinations.length / vaccinations.length * 100).toFixed(1) : 0;

                  return (
                    <div key={status}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{status}</span>
                        <span className="text-sm font-bold">{statusVaccinations.length}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.slice(0, 5).map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium capitalize">{transaction.type}</p>
                    <p className="text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${parseFloat(transaction.amount).toFixed(2)}</p>
                    <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No transactions yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
