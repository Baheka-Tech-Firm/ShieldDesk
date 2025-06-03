import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlassCard } from "@/components/ui/glass-card";
import { CyberHUD } from "@/components/ui/cyber-hud";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Upload, Download, Trash2, FileText, Search, Filter, File, X, Shield, Lock, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { gsap } from "gsap";

const uploadSchema = z.object({
  accessLevel: z.string().min(1, "Access level is required"),
});

export default function FileVault() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [accessLevelFilter, setAccessLevelFilter] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const vaultRef = useRef<HTMLDivElement>(null);

  const form = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      accessLevel: "",
    },
  });

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['/api/files'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch('/api/files', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch files');
      return response.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!vaultRef.current || isLoading) return;

    gsap.fromTo(vaultRef.current, 
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
    );
  }, [isLoading]);

  const filteredFiles = files.filter((file: any) => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = accessLevelFilter === "all" || file.accessLevel === accessLevelFilter;
    return matchesSearch && matchesFilter;
  });

  const getAccessLevelBadge = (accessLevel: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      all_staff: { label: "All Staff", className: "bg-blue-100 text-blue-800" },
      admin: { label: "Admin Only", className: "bg-red-100 text-red-800" },
      compliance: { label: "Compliance", className: "bg-purple-100 text-purple-800" },
      it: { label: "IT", className: "bg-green-100 text-green-800" },
      hr: { label: "HR", className: "bg-yellow-100 text-yellow-800" },
      legal: { label: "Legal", className: "bg-indigo-100 text-indigo-800" },
    };

    const variant = variants[accessLevel] || { label: accessLevel, className: "bg-gray-100 text-gray-800" };
    
    return (
      <Badge variant="secondary" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  const canDelete = (file: any) => {
    return user?.role === 'admin' || file.uploadedBy === user?.id;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (data: any) => {
    if (!selectedFile) return;

    try {
      setUploadProgress(10);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('accessLevel', data.accessLevel);

      setUploadProgress(50);
      const token = getAuthToken();
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress(90);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadProgress(100);
      toast({
        title: "Success",
        description: "File uploaded and encrypted successfully",
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadProgress(0);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <AnimatedBackground />
        <Sidebar />
        <main className="flex-1 flex items-center justify-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-red-950">
      <AnimatedBackground />
      <Sidebar />
      
      <main 
        ref={vaultRef}
        className="flex-1 overflow-y-auto relative z-10"
      >
        <GlassCard 
          variant="danger" 
          className="m-6 mb-0 glass-effect cyber-border"
          glowIntensity="medium"
          animated
        >
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Database className="w-8 h-8 text-red-400" />
                  Secure File Vault
                </h2>
                <p className="text-red-100/80 text-lg">
                  Enterprise-grade document storage with role-based access controls
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <CyberHUD
                  title="FILES"
                  value={files.length}
                  subtitle="Total Stored"
                  status="success"
                  trend="stable"
                  size="sm"
                />
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload File
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="p-6 space-y-6">
          <GlassCard 
            variant="danger" 
            glowIntensity="low" 
            animated 
            className="overflow-hidden"
          >
            <CardHeader className="text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">All Files</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  
                  <Select value={accessLevelFilter} onValueChange={setAccessLevelFilter}>
                    <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Access Levels</SelectItem>
                      <SelectItem value="all_staff">All Staff</SelectItem>
                      <SelectItem value="admin">Admin Only</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">File Name</TableHead>
                      <TableHead className="text-white">Access Level</TableHead>
                      <TableHead className="text-white">Size</TableHead>
                      <TableHead className="text-white">Uploaded</TableHead>
                      <TableHead className="text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-300">
                          {searchTerm || accessLevelFilter !== "all" 
                            ? "No files match your search criteria" 
                            : "No files uploaded yet"
                          }
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFiles.map((file: any) => (
                        <TableRow key={file.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-red-400 mr-3" />
                              <span className="text-white font-medium">
                                {file.originalName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getAccessLevelBadge(file.accessLevel)}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatFileSize(file.size)}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                <Download className="w-4 h-4" />
                              </Button>
                              {canDelete(file) && (
                                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </main>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-800 border-cyan-400/20">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Encrypted File</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-white">Select File</Label>
              <div className="border-2 border-dashed border-cyan-400/30 rounded-lg p-6 text-center bg-slate-700/50">
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <File className="w-8 h-8 text-cyan-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                        <p className="text-xs text-gray-300">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-cyan-400 mb-4" />
                    <div className="flex text-sm leading-6 text-gray-300">
                      <label className="relative cursor-pointer rounded-md font-semibold text-cyan-400 focus-within:outline-none hover:text-cyan-300">
                        <span>Choose a file</span>
                        <input 
                          type="file" 
                          className="sr-only" 
                          onChange={handleFileSelect}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white">Access Level</Label>
                <Select onValueChange={(value) => form.setValue('accessLevel', value)}>
                  <SelectTrigger className="bg-slate-700 border-cyan-400/20 text-white">
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_staff">All Staff</SelectItem>
                    <SelectItem value="admin">Admin Only</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.accessLevel && (
                  <p className="text-sm text-red-400">{form.formState.errors.accessLevel.message}</p>
                )}
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <Label className="text-white">Upload Progress</Label>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={handleClose} className="text-white border-white/20">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedFile || uploadProgress > 0}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {uploadProgress > 0 ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}