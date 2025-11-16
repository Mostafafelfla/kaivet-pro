import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, Plus, CheckCircle, AlertCircle, X, Edit2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Appointments() {
  const { user } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: clinics } = trpc.clinic.listByOwner.useQuery();
  const clinicId = selectedClinic || clinics?.[0]?.id;

  const { data: appointments, isLoading } = trpc.appointment.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const { data: patients } = trpc.patient.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const { data: veterinarians } = trpc.veterinarian.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const { data: services } = trpc.service.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  // Filter appointments by date
  const appointmentsForDate = appointments?.filter((a: any) => {
    const appDate = new Date(a.appointmentDate).toISOString().split('T')[0];
    return appDate === selectedDate;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "no_show": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return <Clock className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <X className="w-4 h-4" />;
      case "no_show": return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-600 mt-2">Manage and schedule patient appointments</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Create a new appointment for a patient
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Patient</label>
                <select className="w-full border rounded-md p-2 mt-1">
                  <option>Select a patient</option>
                  {patients?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Veterinarian</label>
                <select className="w-full border rounded-md p-2 mt-1">
                  <option>Select veterinarian</option>
                  {veterinarians?.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Service</label>
                <select className="w-full border rounded-md p-2 mt-1">
                  <option>Select service</option>
                  {services?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input type="number" placeholder="30" />
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea className="w-full border rounded-md p-2 mt-1" rows={3} placeholder="Additional notes..." />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button>Schedule Appointment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Select Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <select
              value={selectedClinic || ""}
              onChange={(e) => setSelectedClinic(e.target.value ? Number(e.target.value) : null)}
              className="border rounded-md p-2"
            >
              <option value="">All Clinics</option>
              {clinics?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{appointmentsForDate.length}</div>
            <p className="text-xs text-slate-500 mt-1">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {appointments?.filter((a: any) => a.status === "completed").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {appointments?.filter((a: any) => a.status === "cancelled").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading appointments...</div>
          ) : appointmentsForDate.length > 0 ? (
            <div className="space-y-3">
              {appointmentsForDate.map((appointment: any) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <h3 className="font-semibold text-slate-900">
                            {new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">Patient: {appointment.patientId}</p>
                        <p className="text-sm text-slate-600">Duration: {appointment.duration || "30"} minutes</p>
                        {appointment.notes && (
                          <p className="text-sm text-slate-600 mt-2">Notes: {appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-slate-500">No appointments scheduled for today</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled">
          {appointments?.filter((a: any) => a.status === "scheduled").length ? (
            <div className="space-y-3">
              {appointments.filter((a: any) => a.status === "scheduled").map((appointment: any) => (
                <Card key={appointment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">No scheduled appointments</div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {appointments?.filter((a: any) => a.status === "completed").length ? (
            <div className="space-y-3">
              {appointments.filter((a: any) => a.status === "completed").map((appointment: any) => (
                <Card key={appointment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </h3>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">No completed appointments</div>
          )}
        </TabsContent>

        <TabsContent value="all">
          {appointments && appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((appointment: any) => (
                <Card key={appointment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">No appointments</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
