import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, Pill, TrendingUp, Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: clinics, isLoading: clinicsLoading } = trpc.clinic.listByOwner.useQuery();

  if (clinicsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const clinic = clinics?.[0];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name || "User"}!</h1>
        <p className="text-slate-600 mt-2">
          {clinic ? `Managing ${clinic.name}` : "Set up your clinic to get started"}
        </p>
      </div>

      {/* Quick Stats */}
      {clinic && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-slate-500 mt-1">Active patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-slate-500 mt-1">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-slate-500 mt-1">In stock</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Set up your clinic and start managing operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!clinic ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Create your first clinic to get started with the system.
                  </p>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Clinic
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Medical Cases
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Vaccinations
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Pill className="w-4 h-4 mr-2" />
                    AI Consultation
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>
                Manage your clinic appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No appointments scheduled yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
              <CardDescription>
                View and manage patient records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No patients registered yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>
                Manage medicines and supplies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No inventory items yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
