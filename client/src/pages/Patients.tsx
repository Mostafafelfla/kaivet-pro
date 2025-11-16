import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Heart, AlertCircle, Pill, FileText, Syringe } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Patients() {
  const { user } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const { data: clinics } = trpc.clinic.listByOwner.useQuery();
  const clinicId = selectedClinic || clinics?.[0]?.id;

  const { data: patients, isLoading } = trpc.patient.listByClinic.useQuery(
    { clinicId: clinicId! },
    { enabled: !!clinicId }
  );

  const filteredPatients = patients?.filter((p: any) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-600 mt-2">Manage all patient records and medical history</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>Register a new patient in the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Patient Name</label>
                <Input placeholder="e.g., Max, Bella, Whiskers" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Species</label>
                  <select className="w-full border rounded-md p-2 mt-1">
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Bird</option>
                    <option>Rabbit</option>
                    <option>Hamster</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Breed</label>
                  <Input placeholder="e.g., Golden Retriever" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Age</label>
                  <Input type="number" placeholder="Age in years" />
                </div>
                <div>
                  <label className="text-sm font-medium">Weight</label>
                  <Input placeholder="kg" />
                </div>
                <div>
                  <label className="text-sm font-medium">Color/Markings</label>
                  <Input placeholder="e.g., Brown, Black & White" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Microchip ID</label>
                  <Input placeholder="Optional" />
                </div>
                <div>
                  <label className="text-sm font-medium">Blood Type</label>
                  <Input placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Allergies</label>
                <Input placeholder="List any known allergies" />
              </div>
              <div>
                <label className="text-sm font-medium">Medical History</label>
                <textarea className="w-full border rounded-md p-2 mt-1" rows={3} placeholder="Previous conditions, surgeries, etc." />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button>Add Patient</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search patients by name, species, or breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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

      {/* Patients Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading patients...</div>
      ) : filteredPatients && filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient: any) => (
            <Card
              key={patient.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPatient(patient)}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{patient.name}</h3>
                    <p className="text-sm text-slate-600">
                      {patient.species} • {patient.breed}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-slate-500">Age</p>
                      <p className="font-medium">{patient.age || "N/A"} years</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Weight</p>
                      <p className="font-medium">{patient.weight || "N/A"} kg</p>
                    </div>
                  </div>

                  {patient.allergies && (
                    <div className="p-2 bg-red-50 rounded-md border border-red-200">
                      <p className="text-xs font-medium text-red-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Allergies: {patient.allergies}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="w-3 h-3 mr-1" />
                      History
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Syringe className="w-3 h-3 mr-1" />
                      Vaccines
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-slate-500">No patients found</p>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPatient.name}</DialogTitle>
              <DialogDescription>
                {selectedPatient.species} • {selectedPatient.breed}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
                <TabsTrigger value="cases">Cases</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Age</label>
                    <p className="text-slate-900 mt-1">{selectedPatient.age || "N/A"} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Weight</label>
                    <p className="text-slate-900 mt-1">{selectedPatient.weight || "N/A"} kg</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Color/Markings</label>
                    <p className="text-slate-900 mt-1">{selectedPatient.color || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Microchip ID</label>
                    <p className="text-slate-900 mt-1">{selectedPatient.microchipId || "N/A"}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Blood Type</label>
                  <p className="text-slate-900 mt-1">{selectedPatient.bloodType || "Not recorded"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Allergies</label>
                  <p className="text-slate-900 mt-1">{selectedPatient.allergies || "None recorded"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Medical History</label>
                  <p className="text-slate-900 mt-1 whitespace-pre-wrap">{selectedPatient.medicalHistory || "No history recorded"}</p>
                </div>
              </TabsContent>

              <TabsContent value="vaccinations">
                <p className="text-slate-500">Vaccination records will appear here</p>
              </TabsContent>

              <TabsContent value="cases">
                <p className="text-slate-500">Medical cases will appear here</p>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
