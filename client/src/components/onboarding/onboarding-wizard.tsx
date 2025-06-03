import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const step1Schema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  size: z.string().min(1, "Company size is required"),
  country: z.string().min(1, "Country is required"),
});

const step2Schema = z.object({
  departments: z.array(z.string()).min(1, "Select at least one department"),
  staffCount: z.string().min(1, "Staff count is required"),
});

interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  description?: string;
}

const assessmentQuestions: AssessmentQuestion[] = [
  { id: "1", category: "physical", question: "Do you have controlled access to your office premises?", description: "Key cards, security guards, locked doors" },
  { id: "2", category: "physical", question: "Are workstations locked when unattended?", description: "Screen locks, physical locks" },
  { id: "3", category: "physical", question: "Do you have security cameras in key areas?", description: "Monitoring entrances, server rooms" },
  { id: "4", category: "data", question: "Do you encrypt sensitive data at rest?", description: "Database encryption, file encryption" },
  { id: "5", category: "data", question: "Do you have regular data backups?", description: "Automated backups, tested recovery" },
  { id: "6", category: "data", question: "Is personal data classified and labeled?", description: "Data classification policies" },
  { id: "7", category: "access", question: "Do you use multi-factor authentication?", description: "2FA/MFA for all accounts" },
  { id: "8", category: "access", question: "Are user permissions reviewed regularly?", description: "Quarterly access reviews" },
  { id: "9", category: "access", question: "Do you have role-based access controls?", description: "Least privilege principle" },
  { id: "10", category: "network", question: "Do you use a firewall to protect your network?", description: "Hardware or software firewall" },
  { id: "11", category: "network", question: "Is your WiFi network secured with WPA3?", description: "Strong WiFi encryption" },
  { id: "12", category: "network", question: "Do you monitor network traffic for threats?", description: "Intrusion detection systems" },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<any>(null);
  const [step2Data, setStep2Data] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      companyName: "",
      industry: "",
      size: "",
      country: "",
    },
  });

  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      departments: [],
      staffCount: "",
    },
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/assessment', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assessment Complete!",
        description: "Your security assessment has been saved.",
      });
      onComplete();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStep1Submit = (data: any) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: any) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  const handleAssessmentSubmit = () => {
    const responses = Object.entries(assessmentData).map(([questionId, answer]) => {
      const question = assessmentQuestions.find(q => q.id === questionId);
      return {
        questionId,
        question: question?.question || "",
        category: question?.category || "",
        answer,
      };
    });

    submitAssessmentMutation.mutate({
      company: step1Data,
      departments: step2Data,
      responses,
    });
  };

  const handleAssessmentAnswer = (questionId: string, answer: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-500 mt-2">Step {currentStep} of 3</p>
      </div>

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName"
                  {...step1Form.register("companyName")}
                  placeholder="Enter your company name"
                />
                {step1Form.formState.errors.companyName && (
                  <p className="text-sm text-red-600 mt-1">
                    {step1Form.formState.errors.companyName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select onValueChange={(value) => step1Form.setValue("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {step1Form.formState.errors.industry && (
                  <p className="text-sm text-red-600 mt-1">
                    {step1Form.formState.errors.industry.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="size">Company Size</Label>
                <Select onValueChange={(value) => step1Form.setValue("size", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1-50 employees)</SelectItem>
                    <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                    <SelectItem value="large">Large (200+ employees)</SelectItem>
                  </SelectContent>
                </Select>
                {step1Form.formState.errors.size && (
                  <p className="text-sm text-red-600 mt-1">
                    {step1Form.formState.errors.size.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country"
                  {...step1Form.register("country")}
                  placeholder="Enter your country"
                />
                {step1Form.formState.errors.country && (
                  <p className="text-sm text-red-600 mt-1">
                    {step1Form.formState.errors.country.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Next Step
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
              <div>
                <Label>Departments (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {["HR", "IT", "Finance", "Legal", "Operations", "Marketing", "Sales", "Other"].map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <Checkbox 
                        id={dept}
                        onCheckedChange={(checked) => {
                          const current = step2Form.getValues("departments") || [];
                          if (checked) {
                            step2Form.setValue("departments", [...current, dept]);
                          } else {
                            step2Form.setValue("departments", current.filter(d => d !== dept));
                          }
                        }}
                      />
                      <Label htmlFor={dept}>{dept}</Label>
                    </div>
                  ))}
                </div>
                {step2Form.formState.errors.departments && (
                  <p className="text-sm text-red-600 mt-1">
                    {step2Form.formState.errors.departments.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="staffCount">Total Staff Count</Label>
                <Select onValueChange={(value) => step2Form.setValue("staffCount", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff count range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-25">11-25 employees</SelectItem>
                    <SelectItem value="26-50">26-50 employees</SelectItem>
                    <SelectItem value="51-100">51-100 employees</SelectItem>
                    <SelectItem value="101-200">101-200 employees</SelectItem>
                    <SelectItem value="200+">200+ employees</SelectItem>
                  </SelectContent>
                </Select>
                {step2Form.formState.errors.staffCount && (
                  <p className="text-sm text-red-600 mt-1">
                    {step2Form.formState.errors.staffCount.message}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Previous
                </Button>
                <Button type="submit" className="flex-1">
                  Next Step
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Security Assessment</CardTitle>
            <p className="text-sm text-gray-600">
              Answer these questions to assess your current security posture
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assessmentQuestions.map((question) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{question.question}</h4>
                  {question.description && (
                    <p className="text-sm text-gray-500 mb-3">{question.description}</p>
                  )}
                  <RadioGroup
                    value={assessmentData[question.id] || ""}
                    onValueChange={(value) => handleAssessmentAnswer(question.id, value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                      <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id={`${question.id}-no`} />
                      <Label htmlFor={`${question.id}-no`}>No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partial" id={`${question.id}-partial`} />
                      <Label htmlFor={`${question.id}-partial`}>Partially</Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}

              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                  Previous
                </Button>
                <Button 
                  onClick={handleAssessmentSubmit}
                  disabled={Object.keys(assessmentData).length < assessmentQuestions.length}
                  className="flex-1"
                >
                  Complete Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
