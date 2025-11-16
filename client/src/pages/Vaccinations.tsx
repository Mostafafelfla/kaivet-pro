import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Plus, Syringe, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Vaccinations() {
  const { user } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: clinics } = trpc.clinic.listByOwner.useQuery();
  const clinicId = selectedClinic || clinics?.[0]?.id;

  const { data: vaccinations, isLoading } = trpc.vaccination.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const { data: overdueVaccinations } = trpc.vaccination.getOverdue.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const { data: patients } = trpc.patient.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "overdue": return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vaccinations</h1>
          <p className="text-slate-600 mt-2">Track and manage patient vaccinations</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Vaccination
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record New Vaccination</DialogTitle>
              <DialogDescription>
                Add a new vaccination record for a patient
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
              <div>
                <label className="text-sm font-medium">Vaccine Name</label>
                <Input placeholder="e.g., Rabies, DHPP, Bordetella" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Administration Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium">Next Due Date</label>
                  <Input type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Batch Number</label>
                  <Input placeholder="Batch #" />
                </div>
                <div>
                  <label className="text-sm font-medium">Manufacturer</label>
                  <Input placeholder="Manufacturer name" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Route</label>
                <select className="w-full border rounded-md p-2 mt-1">
                  <option>Intramuscular</option>
                  <option>Subcutaneous</option>
                  <option>Oral</option>
                  <option>Intranasal</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button>Record Vaccination</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overdue Alert */}
      {overdueVaccinations && overdueVaccinations.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{overdueVaccinations.length} vaccination(s) overdue!</strong> Please schedule these vaccinations as soon as possible.
          </AlertDescription>
        </Alert>
      )}

      {/* Vaccination Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Vaccinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vaccinations?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">All records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vaccinations?.filter((v: any) => v.status === "completed").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Up to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {vaccinations?.filter((v: any) => v.status === "pending").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {vaccinations?.filter((v: any) => v.status === "overdue").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Action needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Vaccination Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading vaccinations...</div>
          ) : vaccinations && vaccinations.length > 0 ? (
            <div className="space-y-3">
              {vaccinations.map((vac: any) => (
                <Card key={vac.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Syringe className="w-4 h-4 text-blue-600" />
                          <h3 className="font-semibold text-slate-900">{vac.vaccineName}</h3>
                          <Badge className={getStatusColor(vac.status)}>
                            {vac.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 mt-3">
                          <div>
                            <p className="text-xs text-slate-500">Type</p>
                            <p className="font-medium">{vac.vaccineType || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Route</p>
                            <p className="font-medium">{vac.route || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Manufacturer</p>
                            <p className="font-medium">{vac.manufacturer || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Administered</p>
                        <p className="font-medium">
                          {new Date(vac.administrationDate).toLocaleDateString()}
                        </p>
                        {vac.nextDueDate && (
                          <>
                            <p className="text-xs text-slate-500 mt-2">Next Due</p>
                            <p className="font-medium">
                              {new Date(vac.nextDueDate).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Syringe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-slate-500">No vaccination records yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {vaccinations?.filter((v: any) => v.status === "completed").length ? (
            <div className="space-y-3">
              {vaccinations.filter((v: any) => v.status === "completed").map((vac: any) => (
                <Card key={vac.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{vac.vaccineName}</h3>
                        <p className="text-sm text-slate-600 mt-1">Batch: {vac.batchNumber}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">No completed vaccinations</div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {vaccinations?.filter((v: any) => v.status === "pending").length ? (
            <div className="space-y-3">
              {vaccinations.filter((v: any) => v.status === "pending").map((vac: any) => (
                <Card key={vac.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{vac.vaccineName}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Due: {new Date(vac.nextDueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">No pending vaccinations</div>
          )}
        </TabsContent>

        <TabsContent value="overdue">
          {vaccinations?.filter((v: any) => v.status === "overdue").length ? (
            <div className="space-y-3">
              {vaccinations.filter((v: any) => v.status === "overdue").map((vac: any) => (
                <Card key={vac.id} className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{vac.vaccineName}</h3>
                        <p className="text-sm text-red-600 mt-1">
                          Was due: {new Date(vac.nextDueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">No overdue vaccinations</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
