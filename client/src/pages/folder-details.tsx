import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  ArrowLeft,
  Download, 
  Eye, 
  Upload,
  FolderPlus,
  Folder,
  FileText, 
  Lock, 
  Shield, 
  Users, 
  Clock, 
  Settings,
  Tag,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Camera,
  FileIcon,
  Edit,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { GlassCard } from "@/components/ui/glass-card";
import { Link } from "wouter";

export default function FolderDetails() {
  const [, params] = useRoute("/folder/:id");
  const folderId = params?.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("contents");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Fetch folder details
  const { data: folder, isLoading: folderLoading } = useQuery({
    queryKey: ['/api/vault/folder', folderId],
    enabled: !!folderId,
  });

  // Fetch folder contents (subfolders and files)
  const { data: subfolders } = useQuery({
    queryKey: ['/api/vault/folders', folderId],
    enabled: !!folderId,
  });

  const { data: files } = useQuery({
    queryKey: ['/api/vault/files', folderId],
    enabled: !!folderId,
  });

  // Fetch folder permissions
  const { data: permissions } = useQuery({
    queryKey: ['/api/vault/folder', folderId, 'permissions'],
    enabled: !!folderId,
  });

  // Mutations
  const createFolderMutation = useMutation({
    mutationFn: async (folderData: any) => {
      return await apiRequest('/api/vault/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...folderData, parentId: folderId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vault/folders', folderId] });
      setNewFolderName("");
      setIsCreatingFolder(false);
    },
  });

  if (folderLoading) {
    return (
      <div className="min-h-screen bg-black flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-black flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Folder Not Found</h2>
            <Link href="/enhanced-file-vault">
              <Button variant="outline" className="border-red-500/30 text-white hover:bg-red-600/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Vault
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const getComplianceBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      popia: { label: "POPIA", className: "bg-red-600/80 text-white" },
      sars: { label: "SARS", className: "bg-blue-600/80 text-white" },
      hr: { label: "HR", className: "bg-yellow-600/80 text-white" },
      legal: { label: "Legal", className: "bg-purple-600/80 text-white" },
      general: { label: "General", className: "bg-gray-600/80 text-white" }
    };
    
    const typeInfo = types[type] || types.general;
    return (
      <Badge className={typeInfo.className}>
        <Shield className="w-3 h-3 mr-1" />
        {typeInfo.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/enhanced-file-vault">
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Vault
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: folder.color || '#374151' }}
                >
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{folder.name}</h1>
                  <p className="text-gray-400">{folder.description || 'No description'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {folder.complianceType && getComplianceBadge(folder.complianceType)}
              {folder.isSystemFolder && (
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                  <Lock className="w-3 h-3 mr-1" />
                  System
                </Badge>
              )}
              <Button variant="outline" className="border-red-500/30 text-white hover:bg-red-600/20">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
              <Button 
                variant="outline" 
                className="border-red-500/30 text-white hover:bg-red-600/20"
                onClick={() => setIsCreatingFolder(true)}
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-red-500/30">
              <TabsTrigger value="contents" className="text-white data-[state=active]:bg-red-600/80">Contents</TabsTrigger>
              <TabsTrigger value="details" className="text-white data-[state=active]:bg-red-600/80">Details</TabsTrigger>
              <TabsTrigger value="permissions" className="text-white data-[state=active]:bg-red-600/80">Permissions</TabsTrigger>
              <TabsTrigger value="settings" className="text-white data-[state=active]:bg-red-600/80">Settings</TabsTrigger>
            </TabsList>

            {/* Contents Tab */}
            <TabsContent value="contents" className="space-y-6">
              {/* Subfolders */}
              {subfolders && subfolders.length > 0 && (
                <GlassCard variant="security" className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Folder className="w-5 h-5 mr-2 text-red-400" />
                      Folders ({subfolders.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {subfolders.map((subfolder: any) => (
                        <Link key={subfolder.id} href={`/folder/${subfolder.id}`}>
                          <div className="p-4 border border-gray-700 rounded-lg hover:border-red-500/50 hover:bg-gray-800/50 transition-all cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: subfolder.color || '#374151' }}
                              >
                                <Folder className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate">{subfolder.name}</h3>
                                <p className="text-gray-400 text-sm truncate">{subfolder.description || 'No description'}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  {subfolder.complianceType && getComplianceBadge(subfolder.complianceType)}
                                  <span className="text-gray-500 text-xs">{subfolder.fileCount || 0} files</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </GlassCard>
              )}

              {/* Files */}
              <GlassCard variant="security" className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-red-400" />
                    Files ({files?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {files && files.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Name</TableHead>
                          <TableHead className="text-gray-300">Type</TableHead>
                          <TableHead className="text-gray-300">Size</TableHead>
                          <TableHead className="text-gray-300">Modified</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {files.map((file: any) => (
                          <TableRow key={file.id} className="border-gray-700 hover:bg-gray-800/50">
                            <TableCell>
                              <Link href={`/file/${file.id}`}>
                                <div className="flex items-center space-x-3 cursor-pointer hover:text-red-400 transition-colors">
                                  {getFileIcon(file.type)}
                                  <div>
                                    <p className="text-white font-medium">{file.originalName}</p>
                                    {file.tags && file.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {file.tags.slice(0, 2).map((tag: string) => (
                                          <Badge key={tag} variant="outline" className="border-gray-500/50 text-gray-400 text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                        {file.tags.length > 2 && (
                                          <Badge variant="outline" className="border-gray-500/50 text-gray-400 text-xs">
                                            +{file.tags.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell className="text-gray-400">{file.type.toUpperCase()}</TableCell>
                            <TableCell className="text-gray-400">{formatFileSize(file.size)}</TableCell>
                            <TableCell className="text-gray-400">
                              {file.uploadedAt && !isNaN(new Date(file.uploadedAt).getTime()) 
                                ? formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })
                                : 'Recently'
                              }
                            </TableCell>
                            <TableCell>
                              {file.virusScanStatus === "infected" ? (
                                <Badge variant="destructive" className="bg-red-600/80">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Infected
                                </Badge>
                              ) : file.virusScanStatus === "pending" ? (
                                <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Scanning
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-green-500/50 text-green-400">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Clean
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Link href={`/file/${file.id}`}>
                                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center text-gray-400 py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-lg font-medium mb-2">No files in this folder</p>
                      <p className="text-sm">Upload files to get started</p>
                    </div>
                  )}
                </CardContent>
              </GlassCard>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard variant="security" className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Folder className="w-5 h-5 mr-2 text-red-400" />
                      Folder Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-white">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-gray-400">Name</Label>
                        <p className="font-medium">{folder.name}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Description</Label>
                        <p className="font-medium">{folder.description || 'No description provided'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Path</Label>
                        <p className="font-mono text-sm">{folder.path}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Type</Label>
                        <div className="mt-1">
                          {folder.complianceType ? getComplianceBadge(folder.complianceType) : (
                            <Badge variant="outline" className="border-gray-500/50 text-gray-400">General</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-400">Created</Label>
                        <p className="font-medium">
                          {folder.createdAt && !isNaN(new Date(folder.createdAt).getTime()) 
                            ? formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true })
                            : 'Recently'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Created By</Label>
                        <p className="font-medium">{folder.createdBy?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </CardContent>
                </GlassCard>

                <GlassCard variant="security" className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-red-400" />
                      Folder Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-white">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-400">Total Files</Label>
                        <p className="text-2xl font-bold">{files?.length || 0}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Subfolders</Label>
                        <p className="text-2xl font-bold">{subfolders?.length || 0}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Total Size</Label>
                        <p className="text-2xl font-bold">
                          {files ? formatFileSize(files.reduce((total: number, file: any) => total + (file.size || 0), 0)) : '0 B'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-400">System Folder</Label>
                        <p className="text-2xl font-bold">{folder.isSystemFolder ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </CardContent>
                </GlassCard>
              </div>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-6">
              <GlassCard variant="security" className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-red-400" />
                    Folder Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">User/Role</TableHead>
                        <TableHead className="text-gray-300">Permissions</TableHead>
                        <TableHead className="text-gray-300">Granted By</TableHead>
                        <TableHead className="text-gray-300">Granted At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions && permissions.length > 0 ? (
                        permissions.map((permission: any) => (
                          <TableRow key={permission.id} className="border-gray-700">
                            <TableCell className="text-white">
                              {permission.user?.name || permission.role}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {permission.permissions.map((perm: string) => (
                                  <Badge key={perm} variant="outline" className="border-gray-500/50 text-gray-300">
                                    {perm}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {permission.grantedBy?.name || 'System'}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {permission.grantedAt && !isNaN(new Date(permission.grantedAt).getTime()) 
                                ? formatDistanceToNow(new Date(permission.grantedAt), { addSuffix: true })
                                : 'Recently'
                              }
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                            No permissions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </GlassCard>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <GlassCard variant="security" className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-red-400" />
                    Folder Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="folder-name" className="text-gray-300">Folder Name</Label>
                      <Input
                        id="folder-name"
                        defaultValue={folder.name}
                        className="bg-gray-800/50 border-gray-600 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="folder-color" className="text-gray-300">Folder Color</Label>
                      <Input
                        id="folder-color"
                        type="color"
                        defaultValue={folder.color || '#374151'}
                        className="bg-gray-800/50 border-gray-600 text-white mt-2 h-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="folder-description" className="text-gray-300">Description</Label>
                    <Input
                      id="folder-description"
                      defaultValue={folder.description || ''}
                      placeholder="Enter folder description..."
                      className="bg-gray-800/50 border-gray-600 text-white mt-2"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Save Changes
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                      Cancel
                    </Button>
                    {!folder.isSystemFolder && (
                      <Button variant="destructive" className="ml-auto">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Folder
                      </Button>
                    )}
                  </div>
                </CardContent>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Create Folder Dialog */}
      <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FolderPlus className="w-5 h-5 mr-2 text-red-400" />
              Create New Folder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-folder-name" className="text-gray-300">Folder Name</Label>
              <Input
                id="new-folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
                className="bg-gray-800/50 border-gray-600 text-white mt-2"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => createFolderMutation.mutate({ name: newFolderName })}
                disabled={!newFolderName.trim() || createFolderMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
              </Button>
              <Button variant="outline" onClick={() => setIsCreatingFolder(false)} className="border-gray-600 text-white">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}