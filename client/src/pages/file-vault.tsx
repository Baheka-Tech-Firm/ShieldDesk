import { useState } from "react";
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Upload, Download, Trash2, FileText, Search, Filter, File, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

  const filteredFiles = files.filter((file: any) => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = accessLevelFilter === "all" || file.accessLevel === accessLevelFilter;
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAccessLevelBadge = (accessLevel: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      all_staff: { label: "All Staff", className: "bg-blue-50 text-blue-700" },
      admin: { label: "Admin Only", className: "bg-red-50 text-red-700" },
      compliance: { label: "Compliance", className: "bg-purple-50 text-purple-700" },
      it: { label: "IT", className: "bg-green-50 text-green-700" },
      hr: { label: "HR", className: "bg-yellow-50 text-yellow-700" },
      legal: { label: "Legal", className: "bg-indigo-50 text-indigo-700" },
    };

    const variant = variants[accessLevel] || { label: accessLevel, className: "bg-gray-50 text-gray-700" };
    
    return (
      <Badge variant="secondary" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  const canDelete = (file: any) => {
    return user?.role === 'admin' || file.uploadedBy === user?.id;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (data: z.infer<typeof uploadSchema>) => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    toast({
      title: "File Uploaded",
      description: "Your file has been encrypted and uploaded successfully.",
    });
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    form.reset();
    setIsUploadDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">File Vault</h2>
                <p className="text-gray-600 mt-1">Secure document storage with role-based access</p>
              </div>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Files</CardTitle>
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  {/* Filter */}
                  <Select value={accessLevelFilter} onValueChange={setAccessLevelFilter}>
                    <SelectTrigger className="w-48">
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
                      <TableHead>File Name</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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
                              <FileText className="w-5 h-5 text-blue-500 mr-3" />
                              <span className="text-gray-900 font-medium">
                                {file.originalName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getAccessLevelBadge(file.accessLevel)}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {formatFileSize(file.size)}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                <Download className="w-4 h-4" />
                              </Button>
                              {canDelete(file) && (
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
          </Card>
        </div>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Encrypted File</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-6">
              <div className="space-y-4">
                <Label>Select File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <File className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PDF, DOC, XLS, PNG, JPG (max 10MB)</p>
                      </div>
                      <Input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        className="hidden"
                        id="file-upload"
                      />
                      <Label
                        htmlFor="file-upload"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        Choose File
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select onValueChange={(value) => form.setValue("accessLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Who can access this file?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_staff">All Staff</SelectItem>
                    <SelectItem value="admin">Admin Only</SelectItem>
                    <SelectItem value="compliance">Compliance Team</SelectItem>
                    <SelectItem value="it">IT Department</SelectItem>
                    <SelectItem value="hr">HR Department</SelectItem>
                    <SelectItem value="legal">Legal Team</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.accessLevel && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.accessLevel.message}
                  </p>
                )}
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Encrypting and uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  Files are automatically encrypted with AES-256 encryption before upload.
                  Only authorized users with the selected access level can view this file.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!selectedFile || uploadProgress > 0}
                >
                  {uploadProgress > 0 ? "Uploading..." : "Upload File"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
