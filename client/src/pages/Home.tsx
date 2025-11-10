import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Stethoscope, Users, BarChart3, Zap, Shield, Clock } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg text-slate-900">{APP_TITLE}</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Professional Veterinary Clinic Management
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Streamline your clinic operations with our comprehensive management system. From appointments to inventory, handle everything in one place.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg h-96 flex items-center justify-center text-white">
            <Stethoscope className="w-32 h-32 opacity-50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Powerful Features for Modern Clinics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Patient Management",
                description: "Complete patient records, medical history, and appointment scheduling in one place."
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                description: "Real-time insights into clinic performance, revenue, and patient statistics."
              },
              {
                icon: Zap,
                title: "Inventory Tracking",
                description: "Monitor medicines and supplies with automatic alerts for low stock levels."
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Enterprise-grade security with encrypted data and regular backups."
              },
              {
                icon: Clock,
                title: "Appointment Scheduling",
                description: "Intuitive scheduling system with automated reminders and conflict prevention."
              },
              {
                icon: Stethoscope,
                title: "Medical Records",
                description: "Comprehensive case management with treatment plans and prescriptions."
              }
            ].map((feature, idx) => (
              <Card key={idx} className="border-slate-200">
                <CardHeader>
                  <feature.icon className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Clinic?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Join hundreds of veterinary clinics using {APP_TITLE} to manage their operations efficiently.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href={getLoginUrl()}>Start Your Free Trial</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">{APP_TITLE}</h3>
              <p className="text-sm">Professional veterinary clinic management system.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2024 {APP_TITLE}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
