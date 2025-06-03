import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface RiskAssessment {
  id: number;
  physicalSecurityScore: number;
  dataProtectionScore: number;
  accessControlScore: number;
  networkSecurityScore: number;
  overallScore: number;
  createdAt: string;
}

interface RiskScoreCardProps {
  riskAssessment?: RiskAssessment;
}

export function RiskScoreCard({ riskAssessment }: RiskScoreCardProps) {
  if (!riskAssessment) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Risk Assessment</h3>
            <p className="text-gray-600 mb-4">Complete your security assessment to see your risk score</p>
            <Button>Start Assessment</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const categories = [
    { label: "Physical Security", score: riskAssessment.physicalSecurityScore },
    { label: "Data Protection", score: riskAssessment.dataProtectionScore },
    { label: "Access Controls", score: riskAssessment.accessControlScore },
    { label: "Network Security", score: riskAssessment.networkSecurityScore },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cyber Risk Score</CardTitle>
          <span className="text-xs text-gray-500">
            Last updated {new Date(riskAssessment.createdAt).toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-6">
          {/* Risk Score Circle */}
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              <path 
                className="text-gray-200" 
                stroke="currentColor" 
                strokeWidth="3" 
                fill="none" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path 
                className={getScoreColor(riskAssessment.overallScore)} 
                stroke="currentColor" 
                strokeWidth="3" 
                fill="none" 
                strokeDasharray={`${riskAssessment.overallScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(riskAssessment.overallScore)}`}>
                {riskAssessment.overallScore}
              </span>
            </div>
          </div>
          
          {/* Risk Breakdown */}
          <div className="flex-1">
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category.label}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(category.score)}`}
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-10">
                      {category.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" className="mt-4 p-0 text-primary">
              View Detailed Assessment →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
