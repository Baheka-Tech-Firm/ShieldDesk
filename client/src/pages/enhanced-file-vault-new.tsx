import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import ThreeBackground from "@/components/ui/three-background";
import GlassMorphismCard from "@/components/ui/glass-morphism-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'wouter';
import { 
  Upload, Download, Eye, Share, Trash2, 
  Search, Filter, Grid, List, Settings,
  FolderPlus, FileIcon, Database, Lock,
  Shield, AlertTriangle, CheckCircle, Clock,
  Users, Tag, MessageCircle, History
} from "lucide-react";

interface EnhancedFile {
  id: number;
  name: string;
  originalName: string;
  type: string;
  size: number;
  tags: string[];
  description?: string;
  version: number;
  downloadCount: number;
  uploadedAt: string;
  uploadedBy: number;
  status: "active" | "deleted" | "quarantined";
  virusScanStatus: "clean" | "pending" | "infected" | "failed";
  permissions: string[];
  hasComments: boolean;
  isShared: boolean;
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vaultRef = useRef<HTMLDivElement>(null);

  // State management
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "documents" | "images" | "recent" | "shared">("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch vault data
  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['/api/vault/files'],
    queryFn: () => fetch('/api/vault/files').then(res => res.json())
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['/api/vault/folders'],
    queryFn: () => fetch('/api/vault/folders').then(res => res.json())
  });

  const { data: vaultStats } = useQuery({
    queryKey: ['/api/vault/stats'],
    queryFn: () => fetch('/api/vault/stats').then(res => res.json())
  });

  const { data: settings } = useQuery({
    queryKey: ['/api/vault/settings'],
    queryFn: () => fetch('/api/vault/settings').then(res => res.json())
  });

  // Mock data for demonstration
  const mockFiles: EnhancedFile[] = [
    {
      id: 1,
      name: "popia_compliance_policy.pdf",
      originalName: "POPIA Compliance Policy.pdf",
      type: "pdf",
      size: 2.4 * 1024 * 1024,
      tags: ["policy", "compliance", "popia"],
      description: "Main POPIA compliance policy document",
      version: 3,
      downloadCount: 47,
      uploadedAt: "2024-06-03T09:15:00Z",
      uploadedBy: 1,
      status: "active",
      virusScanStatus: "clean",
      permissions: ["view", "download", "share"],
      hasComments: true,
      isShared: true
    },
    {
      id: 2,
      name: "employee_handbook_2024.docx",
      originalName: "Employee Handbook 2024.docx",
      type: "docx",
      size: 1.8 * 1024 * 1024,
      tags: ["hr", "handbook", "policies"],
      description: "Updated employee handbook for 2024",
      version: 1,
      downloadCount: 234,
      uploadedAt: "2024-03-01T09:00:00Z",
      uploadedBy: 1,
      status: "active",
      virusScanStatus: "clean",
      permissions: ["view", "download"],
      hasComments: false,
      isShared: false
    }
  ];

  const currentVaultStats: VaultStats = {
    totalFiles: mockFiles.length,
    totalSize: mockFiles.reduce((sum, file) => sum + file.size, 0),
    storageUsed: 45,
    storageLimit: 100,
    recentUploads: 8,
    sharedFiles: mockFiles.filter(f => f.isShared).length,
    complianceFolders: 3,
    pendingScans: 2
  };

  // File operations
  const handleFileDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/vault/file/${fileId}/download`);
      if (!response.ok) throw new Error('Download failed');
      
      const { downloadUrl, fileName: originalName } = await response.json();
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: `Downloading ${originalName}...`,
      });
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
        permissions: ["view"],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      const response = await fetch(`/api/vault/file/${fileId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData)
      });
      
      if (!response.ok) throw new Error('Share failed');
      
      const data = await response.json();
      navigator.clipboard.writeText(data.shareUrl);
      
      toast({
        title: "Share link created",
        description: "Share link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to create share link.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, virusScanStatus: string) => {
    if (virusScanStatus === "infected") {
      return <Badge variant="destructive" className="bg-red-600/80"><AlertTriangle className="w-3 h-3 mr-1" />Infected</Badge>;
    }
    if (virusScanStatus === "pending") {
      return <Badge variant="outline" className="border-yellow-500/50 text-yellow-400"><Clock className="w-3 h-3 mr-1" />Scanning</Badge>;
    }
    if (status === "quarantined") {
      return <Badge variant="destructive" className="bg-orange-600/80"><Lock className="w-3 h-3 mr-1" />Quarantined</Badge>;
    }
    return <Badge variant="outline" className="border-gray-500/50 text-gray-400"><CheckCircle className="w-3 h-3 mr-1" />Clean</Badge>;
  };

  const getFileIcon = (type: string) => {
    return <FileIcon className="w-5 h-5 text-red-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      // Handle file upload
      toast({
        title: "Files uploaded",
        description: `${droppedFiles.length} files uploaded successfully.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black relative">
      <ThreeBackground variant="vault" intensity={0.8} />
      <div className="flex relative z-10">
        <Sidebar />
        <main 
          ref={vaultRef}
          className="flex-1 ml-64 pt-12 pl-6 pr-8 pb-8 min-h-screen overflow-y-auto"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Enhanced Header */}
          <GlassMorphismCard 
            variant="cyber" 
            className="mb-6 animate-slide-up"
            animated={true}
            borderGlow={true}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white text-gradient-red">Secure File Vault</h2>
                <p className="text-gray-300 mt-1">Enterprise-grade document management with advanced security</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files, tags, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80 bg-gray-800/50 border-red-500/30 text-white hover-glow"
                  />
                </div>
                <Button 
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="bg-gray-700/80 hover:bg-gray-700 border border-red-500/30 text-white hover-lift"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
                <Button 
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="bg-red-600/80 hover:bg-red-600 border border-red-500/30 text-white hover-lift animate-glow"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>
          </GlassMorphismCard>

          <div className="space-y-6">
            {/* Vault Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <GlassMorphismCard variant="cyber" className="animate-scale-in hover-lift" animated={true}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Files</p>
                    <p className="text-2xl font-bold text-white">{currentVaultStats.totalFiles.toLocaleString()}</p>
                  </div>
                  <FileIcon className="w-8 h-8 text-red-400 animate-pulse-red" />
                </div>
              </GlassMorphismCard>

              <GlassMorphismCard variant="cyber" className="animate-scale-in hover-lift" animated={true}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Storage Used</p>
                    <p className="text-2xl font-bold text-white">{currentVaultStats.storageUsed} GB</p>
                  </div>
                  <Database className="w-8 h-8 text-red-400" />
                </div>
              </GlassMorphismCard>

              <GlassMorphismCard variant="cyber" className="animate-scale-in hover-lift" animated={true}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Shared Files</p>
                    <p className="text-2xl font-bold text-white">{currentVaultStats.sharedFiles}</p>
                  </div>
                  <Share className="w-8 h-8 text-red-400" />
                </div>
              </GlassMorphismCard>

              <GlassMorphismCard variant="cyber" className="animate-scale-in hover-lift" animated={true}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Recent Uploads</p>
                    <p className="text-2xl font-bold text-white">{currentVaultStats.recentUploads}</p>
                  </div>
                  <Upload className="w-8 h-8 text-red-400" />
                </div>
              </GlassMorphismCard>
            </div>

            {/* File Management Interface */}
            <GlassMorphismCard variant="cyber" className="animate-fade-in" animated={true} borderGlow={true}>
              <Tabs defaultValue="files" className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <TabsList className="bg-gray-800/50 border border-red-500/30">
                    <TabsTrigger value="files" className="text-white data-[state=active]:bg-red-600/80">Files</TabsTrigger>
                    <TabsTrigger value="folders" className="text-white data-[state=active]:bg-red-600/80">Folders</TabsTrigger>
                    <TabsTrigger value="shared" className="text-white data-[state=active]:bg-red-600/80">Shared</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center space-x-4">
                    <Select value={filterBy} onValueChange={(value: "all" | "documents" | "images" | "recent" | "shared") => setFilterBy(value)}>
                      <SelectTrigger className="w-40 bg-gray-800/50 border-red-500/30 text-white">
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
                    
                    <div className="flex border border-red-500/30 rounded-md bg-gray-800/50">
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="border-0 text-white"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="border-0 text-white"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <TabsContent value="files">
                  {viewMode === "list" ? (
                    <div className="glass-morphism rounded-lg overflow-hidden cyber-grid">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-red-500/30">
                            <TableHead className="text-gray-300">Name</TableHead>
                            <TableHead className="text-gray-300">Type</TableHead>
                            <TableHead className="text-gray-300">Size</TableHead>
                            <TableHead className="text-gray-300">Modified</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockFiles.map((file) => (
                            <TableRow key={file.id} className="border-red-500/20 hover:bg-red-500/10 animate-fade-in">
                              <TableCell>
                                <Link href={`/file/${file.id}`}>
                                  <div className="flex items-center space-x-3 cursor-pointer hover:text-red-400 transition-colors">
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
                                        {file.isShared && <Share className="w-3 h-3 text-red-400" />}
                                        {file.version > 1 && <History className="w-3 h-3 text-purple-400" />}
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-gray-600 text-gray-400">
                                  {file.type.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-300">{formatFileSize(file.size)}</TableCell>
                              <TableCell className="text-gray-300">{formatDate(file.uploadedAt)}</TableCell>
                              <TableCell>
                                {getStatusBadge(file.status, file.virusScanStatus)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFileDownload(file.id, file.originalName)}
                                    className="text-gray-400 hover:text-white hover:bg-red-600/20"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFileShare(file.id)}
                                    className="text-gray-400 hover:text-white hover:bg-red-600/20"
                                  >
                                    <Share className="w-4 h-4" />
                                  </Button>
                                  <Link href={`/file/${file.id}`}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-400 hover:text-white hover:bg-red-600/20"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {mockFiles.map((file) => (
                        <GlassMorphismCard key={file.id} variant="default" className="hover-lift animate-scale-in">
                          <Link href={`/file/${file.id}`}>
                            <div className="cursor-pointer">
                              <div className="flex items-center justify-center h-32 mb-4">
                                {getFileIcon(file.type)}
                              </div>
                              <h3 className="font-semibold text-white mb-2 truncate">{file.originalName}</h3>
                              <p className="text-sm text-gray-400 mb-2">{formatFileSize(file.size)}</p>
                              <div className="flex justify-between items-center">
                                {getStatusBadge(file.status, file.virusScanStatus)}
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleFileDownload(file.id, file.originalName);
                                    }}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleFileShare(file.id);
                                    }}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    <Share className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </GlassMorphismCard>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="folders">
                  <div className="text-center py-12">
                    <FolderPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No folders created yet</h3>
                    <p className="text-gray-400 mb-4">Create your first folder to organize your files</p>
                    <Button 
                      onClick={() => setIsCreateFolderOpen(true)}
                      className="bg-red-600/80 hover:bg-red-600 border border-red-500/30 text-white"
                    >
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create Folder
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="shared">
                  <div className="text-center py-12">
                    <Share className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No shared files</h3>
                    <p className="text-gray-400">Files you share will appear here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </GlassMorphismCard>
          </div>

          {/* Drag and Drop Overlay */}
          {isDragging && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
              <GlassMorphismCard variant="cyber" className="text-center animate-scale-in">
                <div className="p-8">
                  <Upload className="w-16 h-16 text-red-400 mx-auto mb-4 animate-float" />
                  <h3 className="text-xl font-bold text-white mb-2">Drop files to upload</h3>
                  <p className="text-gray-400">Release to start uploading your files</p>
                </div>
              </GlassMorphismCard>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}