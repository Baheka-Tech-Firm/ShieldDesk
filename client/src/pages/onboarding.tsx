import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    } else if (!loading && user && user.companyId) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  const handleOnboardingComplete = () => {
    setLocation("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to ShieldDesk</h1>
          <p className="text-gray-600 mt-2">Let's set up your cybersecurity compliance platform</p>
        </div>
        
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </div>
    </div>
  );
}
