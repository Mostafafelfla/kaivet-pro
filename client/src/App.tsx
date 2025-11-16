import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MedicalCases from "./pages/MedicalCases";
import Vaccinations from "./pages/Vaccinations";
import AIMedicalConsultation from "./pages/AIMedicalConsultation";
import Patients from "./pages/Patients";
import Analytics from "./pages/Analytics";
import Appointments from "./pages/Appointments";
import DashboardLayout from "./components/DashboardLayout";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Home />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"}>
        {() => (
          <AuthGuard>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </AuthGuard>
        )}
      </Route>
      <Route path={"/medical-cases"}>
        {() => (
          <AuthGuard>
            <DashboardLayout>
              <MedicalCases />
            </DashboardLayout>
          </AuthGuard>
        )}
      </Route>
      <Route path={"/vaccinations"}>
        {() => (
          <AuthGuard>
            <DashboardLayout>
              <Vaccinations />
            </DashboardLayout>
          </AuthGuard>
        )}
      </Route>
      <Route path={"/ai-consultation"}>
        {() => (
          <AuthGuard>
            <DashboardLayout>
              <AIMedicalConsultation />
            </DashboardLayout>
          </AuthGuard>
        )}
      </Route>
      <Route path={"/patients"}>
        {() => (
          <AuthGuard>
            <DashboardLayout>
              <Patients />
            </DashboardLayout>
          </AuthGuard>
        )}
      </Route>
      <Route path={"/analytics"}>
        {() => (
          <AuthGuard>
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </AuthGuard>
        )}
      </Route>
      <Route path={"/appointments"}>
        {() => (
          <AuthGuard>
            <DashboardLayout>
              <Appointments />
            </DashboardLayout>
          </AuthGuard>
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
