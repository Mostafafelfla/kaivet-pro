import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, FileText, Clock, CheckCircle, AlertTriangle, Pill, Stethoscope, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function MedicalCases() {
  const { user } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const { data: clinics } = trpc.clinic.listByOwner.useQuery();
  const clinicId = selectedClinic || clinics?.[0]?.id;

  const { data: cases, isLoading } = trpc.case.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const { data: patients } = trpc.patient.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="w-4 h-4" />;
      case "in_progress": return <Clock className="w-4 h-4" />;
      case "closed": return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Cases</h1>
          <p className="text-slate-600 mt-2">Manage patient medical cases and treatment plans</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Case
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Medical Case</DialogTitle>
              <DialogDescription>
                Register a new medical case for a patient
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
                <label className="text-sm font-medium">Case Title</label>
                <Input placeholder="e.g., Skin Infection, Fracture" />
              </div>
              <div>
                <label className="text-sm font-medium">Symptoms</label>
                <Textarea placeholder="Describe the symptoms..." rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Severity</label>
                <select className="w-full border rounded-md p-2 mt-1">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button>Create Case</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cases Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Open Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {cases?.filter((c: any) => c.status === "open").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Awaiting treatment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {cases?.filter((c: any) => c.status === "in_progress").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Under treatment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Closed Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {cases?.filter((c: any) => c.status === "closed").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Cases Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Cases</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading cases...</div>
          ) : cases && cases.length > 0 ? (
            <div className="space-y-3">
              {cases.map((caseItem: any) => (
                <Card key={caseItem.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCase(caseItem)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{caseItem.title}</h3>
                          <Badge className={getSeverityColor(caseItem.severity)}>
                            {caseItem.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{caseItem.symptoms}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            {getStatusIcon(caseItem.status)}
                            {caseItem.status}
                          </span>
                          <span>Case #{caseItem.caseNumber}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {new Date(caseItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-slate-500">No medical cases yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="open">
          {cases?.filter((c: any) => c.status === "open").length ? (
            <div className="space-y-3">
              {cases.filter((c: any) => c.status === "open").map((caseItem: any) => (
                <Card key={caseItem.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-slate-900 mb-2">{caseItem.title}</h3>
                    <p className="text-sm text-slate-600">{caseItem.symptoms}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">No open cases</div>
          )}
        </TabsContent>

        <TabsContent value="in_progress">
          {cases?.filter((c: any) => c.status === "in_progress").length ? (
            <div className="space-y-3">
              {cases.filter((c: any) => c.status === "in_progress").map((caseItem: any) => (
                <Card key={caseItem.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-slate-900 mb-2">{caseItem.title}</h3>
                    <p className="text-sm text-slate-600">{caseItem.treatment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">No cases in progress</div>
          )}
        </TabsContent>

        <TabsContent value="closed">
          {cases?.filter((c: any) => c.status === "closed").length ? (
            <div className="space-y-3">
              {cases.filter((c: any) => c.status === "closed").map((caseItem: any) => (
                <Card key={caseItem.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-slate-900 mb-2">{caseItem.title}</h3>
                    <p className="text-sm text-slate-600">{caseItem.prognosis}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">No closed cases</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Case Details Modal */}
      {selectedCase && (
        <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCase.title}</DialogTitle>
              <DialogDescription>
                Case #{selectedCase.caseNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <p className="text-slate-900 mt-1 capitalize">{selectedCase.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Severity</label>
                  <p className="text-slate-900 mt-1 capitalize">{selectedCase.severity}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Symptoms</label>
                <p className="text-slate-900 mt-1">{selectedCase.symptoms}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Diagnosis</label>
                <p className="text-slate-900 mt-1">{selectedCase.diagnosis || "Not yet diagnosed"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Treatment Plan</label>
                <p className="text-slate-900 mt-1">{selectedCase.treatment || "No treatment plan yet"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Prognosis</label>
                <p className="text-slate-900 mt-1">{selectedCase.prognosis || "To be determined"}</p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedCase(null)}>Close</Button>
                <Button>Edit Case</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
