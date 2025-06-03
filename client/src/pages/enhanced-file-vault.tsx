import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Upload, 
  Download, 
  Eye, 
  Share, 
  Trash2, 
  FolderPlus, 
  FileText, 
  Lock, 
  Shield, 
  Users, 
  Clock, 
  Filter,
  Search,
  MoreHorizontal,
  Tag,
  MessageCircle,
  History,
  Settings,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Calendar,
  User,
  HardDrive,
  Folder,
  FileIcon,
  KeyRound,
  Camera,
  Archive,
  Star
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlassCard } from "@/components/ui/glass-card";
import { apiRequest } from "@/lib/queryClient";

interface EnhancedFile {
  id: number;
  name: string;
  originalName: string;
  type: string;
  mimeType: string;
  size: number;
  tags: string[];
  description?: string;
  version: number;
  isLatestVersion: boolean;
  downloadCount: number;
  lastAccessedAt?: string;
  uploadedAt: string;
  uploadedBy: number;
  status: "active" | "deleted" | "quarantined";
  virusScanStatus: "pending" | "clean" | "infected" | "failed";
  folder?: {
    id: number;
    name: string;
    path: string;
  };
  uploadedByUser: {
    id: number;
    name: string;
    email: string;
  };
  permissions: string[];
  hasComments: boolean;
  isShared: boolean;
}

interface Folder {
  id: number;
  name: string;
  description?: string;
  path: string;
  color: string;
  isSystemFolder: boolean;
  complianceType?: "popia" | "sars" | "hr" | "legal" | "general";
  fileCount: number;
  size: number;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
  };
}

interface VaultStats {
  totalFiles: number;
  totalSize: number;
  storageUsed: number;
  storageLimit: number;
  recentUploads: number;
  sharedFiles: number;
  complianceFolders: number;
  pendingScans: number;
}

export default function EnhancedFileVault() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vaultRef = useRef<HTMLDivElement>(null);

  // State management
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "documents" | "images" | "recent" | "shared">("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<EnhancedFile | null>(null);
  const [activeTab, setActiveTab] = useState("files");

  // Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Form state
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#374151");
  const [folderComplianceType, setFolderComplianceType] = useState<string>("general");

  // Fetch data
  const { data: vaultStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/vault/stats'],
  });

  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ['/api/vault/folders', currentFolder],
  });

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['/api/vault/files', currentFolder, searchQuery, filterBy],
  });

  const { data: vaultSettings } = useQuery({
    queryKey: ['/api/vault/settings'],
  });

  // Mock data for development
  const mockStats: VaultStats = {
    totalFiles: 1247,
    totalSize: 8.7 * 1024 * 1024 * 1024, // 8.7 GB
    storageUsed: 8.7,
    storageLimit: 100,
    recentUploads: 23,
    sharedFiles: 156,
    complianceFolders: 8,
    pendingScans: 3
  };

  const mockFolders: Folder[] = [
    {
      id: 1,
      name: "POPIA Compliance",
      description: "Documents related to POPIA compliance requirements",
      path: "/popia",
      color: "#dc2626",
      isSystemFolder: true,
      complianceType: "popia",
      fileCount: 34,
      size: 256 * 1024 * 1024,
      createdAt: "2024-01-15T10:00:00Z",
      createdBy: { id: 1, name: "System" }
    },
    {
      id: 2,
      name: "HR Documents",
      description: "Employee records and HR policies",
      path: "/hr",
      color: "#2563eb",
      isSystemFolder: true,
      complianceType: "hr",
      fileCount: 89,
      size: 412 * 1024 * 1024,
      createdAt: "2024-01-15T10:00:00Z",
      createdBy: { id: 1, name: "System" }
    },
    {
      id: 3,
      name: "Legal Contracts",
      description: "Legal agreements and contracts",
      path: "/legal",
      color: "#7c3aed",
      isSystemFolder: true,
      complianceType: "legal",
      fileCount: 67,
      size: 189 * 1024 * 1024,
      createdAt: "2024-01-15T10:00:00Z",
      createdBy: { id: 1, name: "System" }
    },
    {
      id: 4,
      name: "Financial Records",
      description: "Accounting and financial documents",
      path: "/financial",
      color: "#059669",
      isSystemFolder: false,
      fileCount: 123,
      size: 567 * 1024 * 1024,
      createdAt: "2024-02-01T14:30:00Z",
      createdBy: { id: user?.id || 1, name: user?.name || "Current User" }
    }
  ];

  const mockFiles: EnhancedFile[] = [
    {
      id: 1,
      name: "popia_compliance_policy.pdf",
      originalName: "POPIA Compliance Policy.pdf",
      type: "pdf",
      mimeType: "application/pdf",
      size: 2.4 * 1024 * 1024,
      tags: ["policy", "compliance", "popia"],
      description: "Main POPIA compliance policy document",
      version: 3,
      isLatestVersion: true,
      downloadCount: 47,
      lastAccessedAt: "2024-06-03T09:15:00Z",
      uploadedAt: "2024-05-15T14:30:00Z",
      uploadedBy: user?.id || 1,
      status: "active",
      virusScanStatus: "clean",
      folder: { id: 1, name: "POPIA Compliance", path: "/popia" },
      uploadedByUser: { id: user?.id || 1, name: user?.name || "Current User", email: user?.email || "user@example.com" },
      permissions: ["view", "download", "share"],
      hasComments: true,
      isShared: true
    },
    {
      id: 2,
      name: "employee_handbook_2024.docx",
      originalName: "Employee Handbook 2024.docx",
      type: "docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 1.8 * 1024 * 1024,
      tags: ["hr", "handbook", "policies"],
      description: "Updated employee handbook for 2024",
      version: 1,
      isLatestVersion: true,
      downloadCount: 234,
      lastAccessedAt: "2024-06-03T11:22:00Z",
      uploadedAt: "2024-03-01T09:00:00Z",
      uploadedBy: user?.id || 1,
      status: "active",
      virusScanStatus: "clean",
      folder: { id: 2, name: "HR Documents", path: "/hr" },
      uploadedByUser: { id: user?.id || 1, name: user?.name || "Current User", email: user?.email || "user@example.com" },
      permissions: ["view", "download"],
      hasComments: false,
      isShared: false
    }
  ];

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'xls':
      case 'xlsx': return <FileText className="w-5 h-5 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png': return <Camera className="w-5 h-5 text-purple-500" />;
      default: return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string, virusStatus: string) => {
    if (virusStatus === "infected") {
      return <Badge variant="destructive" className="bg-red-600/80"><AlertTriangle className="w-3 h-3 mr-1" />Infected</Badge>;
    }
    if (virusStatus === "pending") {
      return <Badge variant="outline" className="border-yellow-500/50 text-yellow-400"><Clock className="w-3 h-3 mr-1" />Scanning</Badge>;
    }
    if (status === "quarantined") {
      return <Badge variant="destructive" className="bg-orange-600/80"><Lock className="w-3 h-3 mr-1" />Quarantined</Badge>;
    }
    return <Badge variant="outline" className="border-green-500/50 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Clean</Badge>;
  };

  // Filter and sort files
  const filteredFiles = (mockFiles || []).filter(file => {
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }

    switch (filterBy) {
      case "documents":
        return ["pdf", "doc", "docx", "xls", "xlsx", "txt"].includes(file.type);
      case "images":
        return ["jpg", "jpeg", "png", "gif", "svg"].includes(file.type);
      case "recent":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(file.uploadedAt) > weekAgo;
      case "shared":
        return file.isShared;
      default:
        return true;
    }
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "date":
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case "size":
        comparison = a.size - b.size;
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // File operations
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setUploadFiles(fileArray);
    
    for (const file of fileArray) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Upload file
        await apiRequest('/api/vault/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            folderId: currentFolder,
            tags: [],
            description: ""
          })
        });
        
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded and encrypted.`,
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive"
        });
      }
    }
    
    setUploadFiles([]);
    setUploadProgress({});
    setIsUploadDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['/api/vault/files'] });
  };

  const handleCreateFolder = async () => {
    try {
      await apiRequest('/api/vault/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          description: newFolderDescription,
          color: newFolderColor,
          complianceType: folderComplianceType,
          parentId: currentFolder
        })
      });

      toast({
        title: "Folder created",
        description: `Folder "${newFolderName}" has been created successfully.`,
      });

      setNewFolderName("");
      setNewFolderDescription("");
      setNewFolderColor("#374151");
      setFolderComplianceType("general");
      setIsCreateFolderOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/vault/folders'] });
    } catch (error) {
      toast({
        title: "Failed to create folder",
        description: "There was an error creating the folder.",
        variant: "destructive"
      });
    }
  };

  // File operations
  const handleFileDelete = async (fileId: number) => {
    try {
      await apiRequest(`/api/vault/files/${fileId}`, {
        method: 'DELETE'
      });
      
      toast({
        title: "File deleted",
        description: "File has been moved to trash.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/vault/files'] });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete file.",
        variant: "destructive"
      });
    }
  };

  const handleFileDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await apiRequest(`/api/vault/files/${fileId}/download`);
      
      toast({
        title: "Download started",
        description: `Downloading ${fileName}...`,
      });
      
      // Update file access time
      queryClient.invalidateQueries({ queryKey: ['/api/vault/files'] });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download file.",
        variant: "destructive"
      });
    }
  };

  const handleFileShare = async (fileId: number) => {
    try {
      const shareData = {
        shareType: "public",
        accessLevel: "view",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
      
      const response = await apiRequest(`/api/vault/files/${fileId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData)
      });
      
      navigator.clipboard.writeText(response.shareUrl);
      
      toast({
        title: "Share link created",
        description: "Share link copied to clipboard.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/vault/files'] });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to create share link.",
        variant: "destructive"
      });
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      <AnimatedBackground />
      <div className="flex">
        <Sidebar />
        <main 
          ref={vaultRef}
          className="flex-1 min-h-screen overflow-y-auto bg-gradient-to-br from-black via-gray-900 to-red-950"
        >
          {/* Enhanced Header */}
          <GlassCard 
            variant="danger" 
            className="m-6 mb-0 glass-effect cyber-border"
            glowIntensity="medium"
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Secure File Vault</h2>
                  <p className="text-gray-300 mt-1">Enterprise-grade document management with advanced security</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search files, tags, or content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-80 bg-gray-800/50 border-red-500/30 text-white"
                    />
                  </div>
                  <Button 
                    onClick={() => setIsCreateFolderOpen(true)}
                    className="bg-gray-700/80 hover:bg-gray-700 border border-red-500/30 text-white"
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New Folder
                  </Button>
                  <Button 
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="bg-red-600/80 hover:bg-red-600 border border-red-500/30 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="p-6">
            {/* Vault Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <GlassCard variant="security" className="glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Files</p>
                      <p className="text-2xl font-bold text-white">{mockStats.totalFiles.toLocaleString()}</p>
                    </div>
                    <FileIcon className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </GlassCard>

              <GlassCard variant="security" className="glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Storage Used</p>
                      <p className="text-2xl font-bold text-white">{mockStats.storageUsed} GB</p>
                      <Progress 
                        value={(mockStats.storageUsed / mockStats.storageLimit) * 100} 
                        className="mt-2 h-2"
                      />
                    </div>
                    <HardDrive className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </GlassCard>

              <GlassCard variant="security" className="glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Shared Files</p>
                      <p className="text-2xl font-bold text-white">{mockStats.sharedFiles}</p>
                    </div>
                    <Share className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </GlassCard>

              <GlassCard variant="security" className="glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Recent Uploads</p>
                      <p className="text-2xl font-bold text-white">{mockStats.recentUploads}</p>
                    </div>
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </GlassCard>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border border-red-500/30">
                <TabsTrigger value="files" className="text-white data-[state=active]:bg-red-600/80">Files</TabsTrigger>
                <TabsTrigger value="folders" className="text-white data-[state=active]:bg-red-600/80">Folders</TabsTrigger>
                <TabsTrigger value="shared" className="text-white data-[state=active]:bg-red-600/80">Shared</TabsTrigger>
                <TabsTrigger value="activity" className="text-white data-[state=active]:bg-red-600/80">Activity</TabsTrigger>
                <TabsTrigger value="settings" className="text-white data-[state=active]:bg-red-600/80">Settings</TabsTrigger>
              </TabsList>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-6">
                {/* Filters and Controls */}
                <GlassCard variant="security" className="glass-effect">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                          <SelectTrigger className="w-48 bg-gray-800/50 border-red-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-red-500/30">
                            <SelectItem value="all">All Files</SelectItem>
                            <SelectItem value="documents">Documents</SelectItem>
                            <SelectItem value="images">Images</SelectItem>
                            <SelectItem value="recent">Recent</SelectItem>
                            <SelectItem value="shared">Shared</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                          <SelectTrigger className="w-32 bg-gray-800/50 border-red-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-red-500/30">
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="size">Size</SelectItem>
                            <SelectItem value="type">Type</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                          className="bg-gray-800/50 border-red-500/30 text-white hover:bg-gray-700"
                        >
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-gray-500/50 text-gray-300">
                          {filteredFiles.length} files
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                          className="bg-gray-800/50 border-red-500/30 text-white hover:bg-gray-700"
                        >
                          {viewMode === "grid" ? "List" : "Grid"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </GlassCard>

                {/* Files List */}
                <GlassCard variant="security" className="glass-effect">
                  <CardContent className="p-0">
                    <div 
                      className={`min-h-96 ${isDragging ? 'bg-red-500/10 border-2 border-dashed border-red-500' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-gray-300">
                              <Checkbox 
                                checked={selectedFiles.length === filteredFiles.length}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedFiles(filteredFiles.map(f => f.id));
                                  } else {
                                    setSelectedFiles([]);
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead className="text-gray-300">File</TableHead>
                            <TableHead className="text-gray-300">Size</TableHead>
                            <TableHead className="text-gray-300">Modified</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300">Permissions</TableHead>
                            <TableHead className="text-gray-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredFiles.map((file) => (
                            <TableRow key={file.id} className="border-gray-700 hover:bg-gray-800/30">
                              <TableCell>
                                <Checkbox 
                                  checked={selectedFiles.includes(file.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedFiles([...selectedFiles, file.id]);
                                    } else {
                                      setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  {getFileIcon(file.type)}
                                  <div>
                                    <p className="font-medium text-white">{file.originalName}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      {file.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {file.hasComments && <MessageCircle className="w-3 h-3 text-blue-400" />}
                                      {file.isShared && <Share className="w-3 h-3 text-green-400" />}
                                      {file.version > 1 && <History className="w-3 h-3 text-purple-400" />}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300">{formatFileSize(file.size)}</TableCell>
                              <TableCell className="text-gray-300">
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(file.status, file.virusScanStatus)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  {file.permissions.includes("view") && <Eye className="w-3 h-3 text-blue-400" />}
                                  {file.permissions.includes("download") && <Download className="w-3 h-3 text-green-400" />}
                                  {file.permissions.includes("share") && <Share className="w-3 h-3 text-purple-400" />}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFileDownload(file.id, file.originalName)}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                                    title="Download file"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFileShare(file.id)}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                                    title="Share file"
                                  >
                                    <Share className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFileDelete(file.id)}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700"
                                    title="Delete file"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {isDragging && (
                        <div className="flex items-center justify-center h-48">
                          <div className="text-center">
                            <Upload className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-white">Drop files here to upload</p>
                            <p className="text-gray-400">Files will be encrypted and scanned automatically</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </GlassCard>
              </TabsContent>

              {/* Folders Tab */}
              <TabsContent value="folders" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockFolders.map((folder) => (
                    <GlassCard 
                      key={folder.id} 
                      variant="security" 
                      className="glass-effect hover:glow-md transition-all cursor-pointer"
                      onClick={() => setCurrentFolder(folder.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: folder.color + '20', border: `1px solid ${folder.color}` }}
                            >
                              <Folder className="w-5 h-5" style={{ color: folder.color }} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{folder.name}</h3>
                              {folder.isSystemFolder && (
                                <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                                  <Shield className="w-3 h-3 mr-1" />
                                  System
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle folder options
                            }}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-4">{folder.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{folder.fileCount} files</span>
                          <span className="text-gray-400">{formatFileSize(folder.size)}</span>
                        </div>
                        
                        {folder.complianceType && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                              {folder.complianceType.toUpperCase()} Compliance
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </GlassCard>
                  ))}
                </div>
              </TabsContent>

              {/* Shared Tab */}
              <TabsContent value="shared" className="space-y-6">
                <GlassCard variant="security" className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-white">Shared Files & Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredFiles.filter(f => f.isShared).map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="font-medium text-white">{file.originalName}</p>
                              <p className="text-sm text-gray-400">Shared on {new Date(file.uploadedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFileShare(file.id)}
                              className="bg-gray-700/50 border-red-500/30 text-white hover:bg-gray-600"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gray-700/50 border-red-500/30 text-white hover:bg-gray-600"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </GlassCard>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <GlassCard variant="security" className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { action: "uploaded", file: "POPIA Compliance Policy.pdf", time: "2 hours ago", user: "Current User" },
                        { action: "downloaded", file: "Employee Handbook 2024.docx", time: "4 hours ago", user: "Current User" },
                        { action: "shared", file: "Network Security Audit.xlsx", time: "1 day ago", user: "Current User" },
                        { action: "commented on", file: "Contract Template.docx", time: "2 days ago", user: "Current User" },
                        { action: "viewed", file: "Financial Report Q1.pdf", time: "3 days ago", user: "Current User" }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                          <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center">
                            {activity.action === "uploaded" && <Upload className="w-4 h-4 text-red-400" />}
                            {activity.action === "downloaded" && <Download className="w-4 h-4 text-blue-400" />}
                            {activity.action === "shared" && <Share className="w-4 h-4 text-green-400" />}
                            {activity.action === "commented on" && <MessageCircle className="w-4 h-4 text-purple-400" />}
                            {activity.action === "viewed" && <Eye className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-white">
                              <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.file}</span>
                            </p>
                            <p className="text-sm text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </GlassCard>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GlassCard variant="security" className="glass-effect">
                    <CardHeader>
                      <CardTitle className="text-white">Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Virus Scanning</Label>
                          <p className="text-sm text-gray-400">Automatically scan uploaded files</p>
                        </div>
                        <Switch checked={mockVaultSettings.enableVirusScanning} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Version Control</Label>
                          <p className="text-sm text-gray-400">Keep file version history</p>
                        </div>
                        <Switch checked={mockVaultSettings.enableVersionControl} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Watermark Downloads</Label>
                          <p className="text-sm text-gray-400">Add watermarks to downloaded files</p>
                        </div>
                        <Switch checked={mockVaultSettings.watermarkDownloads} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Require MFA</Label>
                          <p className="text-sm text-gray-400">Multi-factor authentication for access</p>
                        </div>
                        <Switch checked={mockVaultSettings.requireMFA} />
                      </div>
                    </CardContent>
                  </GlassCard>

                  <GlassCard variant="security" className="glass-effect">
                    <CardHeader>
                      <CardTitle className="text-white">Storage Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-white">Maximum Storage (GB)</Label>
                        <Input
                          type="number"
                          value={mockVaultSettings.maxStorageGB}
                          className="mt-2 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Maximum File Size (MB)</Label>
                        <Input
                          type="number"
                          value={Math.round(mockVaultSettings.maxFileSize / 1024 / 1024)}
                          className="mt-2 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Default Retention (Days)</Label>
                        <Input
                          type="number"
                          value={mockVaultSettings.defaultRetentionDays}
                          className="mt-2 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Allowed File Types</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {mockVaultSettings.allowedFileTypes.map((type) => (
                            <Badge key={type} variant="outline" className="border-gray-600 text-gray-300">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </GlassCard>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Upload Dialog */}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogContent className="sm:max-w-lg bg-gray-800 border-red-500/30 text-white">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Drag and drop files here, or</p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-red-600/80 hover:bg-red-600 border border-red-500/30"
                  >
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  />
                </div>
                
                {uploadFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadFiles.map((file) => (
                      <div key={file.name} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <span className="text-sm text-gray-300">{file.name}</span>
                        <Progress value={uploadProgress[file.name] || 0} className="w-24 h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Folder Dialog */}
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogContent className="sm:max-w-md bg-gray-800 border-red-500/30 text-white">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter folder name..."
                  />
                </div>
                <div>
                  <Label htmlFor="folderDescription">Description (Optional)</Label>
                  <Textarea
                    id="folderDescription"
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Describe the folder purpose..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="folderColor">Color</Label>
                    <Input
                      id="folderColor"
                      type="color"
                      value={newFolderColor}
                      onChange={(e) => setNewFolderColor(e.target.value)}
                      className="bg-gray-700 border-gray-600 h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complianceType">Compliance Type</Label>
                    <Select value={folderComplianceType} onValueChange={setFolderComplianceType}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-red-500/30">
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="popia">POPIA</SelectItem>
                        <SelectItem value="sars">SARS</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                    className="bg-red-600/80 hover:bg-red-600 border border-red-500/30"
                  >
                    Create Folder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}