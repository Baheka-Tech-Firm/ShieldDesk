import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center">
      <div className="text-center text-white max-w-md mx-auto px-6">
        <div className="mb-8">
          <Shield className="w-24 h-24 mx-auto text-red-500 mb-4" />
          <h1 className="text-6xl font-bold text-red-500 mb-2">404</h1>
          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            The security page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Link href="/enhanced-dashboard">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}