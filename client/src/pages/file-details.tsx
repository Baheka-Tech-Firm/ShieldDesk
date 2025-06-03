import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Share, 
  Edit,
  Trash2, 
  FileText, 
  Lock, 
  Shield, 
  Users, 
  Clock, 
  MessageCircle,
  History,
  Tag,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  User,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { GlassCard } from "@/components/ui/glass-card";
import { Link } from "wouter";

export default function FileDetails() {
  const [, params] = useRoute("/file/:id");
  const fileId = params?.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("details");
  const [newComment, setNewComment] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // Fetch file details
  const { data: file, isLoading: fileLoading } = useQuery({
    queryKey: ['/api/vault/file', fileId],
    enabled: !!fileId,
  });

  // Fetch file permissions
  const { data: permissions } = useQuery({
    queryKey: ['/api/vault/file', fileId, 'permissions'],
    enabled: !!fileId,
  });

  // Fetch file access logs
  const { data: accessLogs } = useQuery({
    queryKey: ['/api/vault/file', fileId, 'access-logs'],
    enabled: !!fileId,
  });

  // Fetch file comments
  const { data: comments } = useQuery({
    queryKey: ['/api/vault/file', fileId, 'comments'],
    enabled: !!fileId,
  });

  // Fetch file versions
  const { data: versions } = useQuery({
    queryKey: ['/api/vault/file', fileId, 'versions'],
    enabled: !!fileId,
  });

  // Mutations
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest(`/api/vault/file/${fileId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vault/file', fileId, 'comments'] });
      setNewComment("");
    },
  });

  const shareFileMutation = useMutation({
    mutationFn: async (shareData: any) => {
      return await apiRequest(`/api/vault/file/${fileId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vault/file', fileId] });
      setIsSharing(false);
    },
  });

  if (fileLoading) {
    return (
      <div className="min-h-screen bg-black flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-black flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">File Not Found</h2>
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
      case 'pdf': return <FileText className="w-8 h-8 text-red-400" />;
      case 'doc':
      case 'docx': return <FileText className="w-8 h-8 text-blue-400" />;
      case 'xls':
      case 'xlsx': return <FileText className="w-8 h-8 text-green-400" />;
      default: return <FileText className="w-8 h-8 text-gray-400" />;
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
    return <Badge variant="outline" className="border-gray-500/50 text-gray-400"><CheckCircle className="w-3 h-3 mr-1" />Clean</Badge>;
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
                {getFileIcon(file.type)}
                <div>
                  <h1 className="text-2xl font-bold text-white">{file.originalName}</h1>
                  <p className="text-gray-400">{formatFileSize(file.size)} • {file.type.toUpperCase()}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(file.status, file.virusScanStatus)}
              <Button variant="outline" className="border-red-500/30 text-white hover:bg-red-600/20">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                className="border-red-500/30 text-white hover:bg-red-600/20"
                onClick={() => setIsSharing(true)}
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border border-red-500/30">
              <TabsTrigger value="details" className="text-white data-[state=active]:bg-red-600/80">Details</TabsTrigger>
              <TabsTrigger value="permissions" className="text-white data-[state=active]:bg-red-600/80">Permissions</TabsTrigger>
              <TabsTrigger value="activity" className="text-white data-[state=active]:bg-red-600/80">Activity</TabsTrigger>
              <TabsTrigger value="versions" className="text-white data-[state=active]:bg-red-600/80">Versions</TabsTrigger>
              <TabsTrigger value="comments" className="text-white data-[state=active]:bg-red-600/80">Comments</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard variant="security" className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-red-400" />
                      File Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-white">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-400">Original Name</Label>
                        <p className="font-medium">{file.originalName}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">File Type</Label>
                        <p className="font-medium">{file.type.toUpperCase()}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Size</Label>
                        <p className="font-medium">{formatFileSize(file.size)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Version</Label>
                        <p className="font-medium">v{file.version}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Uploaded</Label>
                        <p className="font-medium">
                          {file.uploadedAt && !isNaN(new Date(file.uploadedAt).getTime()) 
                            ? formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })
                            : 'Recently'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Downloads</Label>
                        <p className="font-medium">{file.downloadCount || 0}</p>
                      </div>
                    </div>
                    
                    {file.description && (
                      <div>
                        <Label className="text-gray-400">Description</Label>
                        <p className="font-medium">{file.description}</p>
                      </div>
                    )}

                    {file.tags && file.tags.length > 0 && (
                      <div>
                        <Label className="text-gray-400">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {file.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="border-gray-500/50 text-gray-300">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </GlassCard>

                <GlassCard variant="security" className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-red-400" />
                      Security Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-white">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-gray-400">Status</Label>
                        <div className="mt-1">
                          {getStatusBadge(file.status, file.virusScanStatus)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-400">Encryption</Label>
                        <p className="font-medium flex items-center">
                          <Lock className="w-4 h-4 mr-2 text-red-400" />
                          AES-256 Encrypted
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Checksum</Label>
                        <p className="font-mono text-sm break-all">{file.checksum}</p>
                      </div>
                      {file.retentionPolicy && (
                        <div>
                          <Label className="text-gray-400">Retention Policy</Label>
                          <p className="font-medium">{file.retentionPolicy}</p>
                        </div>
                      )}
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
                    File Permissions
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

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <GlassCard variant="security" className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <History className="w-5 h-5 mr-2 text-red-400" />
                    Access Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Action</TableHead>
                        <TableHead className="text-gray-300">IP Address</TableHead>
                        <TableHead className="text-gray-300">Time</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessLogs && accessLogs.length > 0 ? (
                        accessLogs.map((log: any) => (
                          <TableRow key={log.id} className="border-gray-700">
                            <TableCell className="text-white">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>{log.user?.name || 'Unknown'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-white font-medium">
                              {log.action}
                            </TableCell>
                            <TableCell className="text-gray-400 font-mono">
                              {log.ipAddress || 'N/A'}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {log.accessedAt && !isNaN(new Date(log.accessedAt).getTime()) 
                                ? formatDistanceToNow(new Date(log.accessedAt), { addSuffix: true })
                                : 'Recently'
                              }
                            </TableCell>
                            <TableCell>
                              {log.success ? (
                                <Badge variant="outline" className="border-gray-500/50 text-gray-400">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Success
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="bg-red-600/80">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Failed
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                            No access logs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </GlassCard>
            </TabsContent>

            {/* Versions Tab */}
            <TabsContent value="versions" className="space-y-6">
              <GlassCard variant="security" className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <History className="w-5 h-5 mr-2 text-red-400" />
                    File Versions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Version</TableHead>
                        <TableHead className="text-gray-300">Size</TableHead>
                        <TableHead className="text-gray-300">Uploaded By</TableHead>
                        <TableHead className="text-gray-300">Uploaded At</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versions && versions.length > 0 ? (
                        versions.map((version: any) => (
                          <TableRow key={version.id} className="border-gray-700">
                            <TableCell className="text-white font-medium">
                              v{version.version}
                              {version.isLatestVersion && (
                                <Badge variant="outline" className="border-green-500/50 text-green-400 ml-2">
                                  Current
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {formatFileSize(version.size)}
                            </TableCell>
                            <TableCell className="text-white">
                              {version.uploadedByUser?.name || 'Unknown'}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {version.uploadedAt && !isNaN(new Date(version.uploadedAt).getTime()) 
                                ? formatDistanceToNow(new Date(version.uploadedAt), { addSuffix: true })
                                : 'Recently'
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                            No versions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </GlassCard>
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-6">
              <GlassCard variant="security" className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-red-400" />
                    Comments & Collaboration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Comment */}
                  <div className="space-y-3">
                    <Label htmlFor="comment" className="text-gray-300">Add Comment</Label>
                    <Textarea
                      id="comment"
                      placeholder="Enter your comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white"
                      rows={3}
                    />
                    <Button 
                      onClick={() => addCommentMutation.mutate(newComment)}
                      disabled={!newComment.trim() || addCommentMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
                    </Button>
                  </div>

                  <Separator className="bg-gray-700" />

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments && comments.length > 0 ? (
                      comments.map((comment: any) => (
                        <div key={comment.id} className="border border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-white font-medium">
                                {comment.user?.name || 'Unknown User'}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {comment.createdAt && !isNaN(new Date(comment.createdAt).getTime()) 
                                  ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                                  : 'Recently'
                                }
                              </span>
                            </div>
                            {comment.isInternal && (
                              <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                                Internal
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-300">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        No comments yet. Be the first to add one!
                      </div>
                    )}
                  </div>
                </CardContent>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Share Dialog */}
      <Dialog open={isSharing} onOpenChange={setIsSharing}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Share className="w-5 h-5 mr-2 text-red-400" />
              Share File
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Share Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Public Link
                </Button>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                  <Users className="w-4 h-4 mr-2" />
                  Specific Users
                </Button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => shareFileMutation.mutate({ type: 'link' })}
                disabled={shareFileMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                {shareFileMutation.isPending ? 'Creating...' : 'Create Share Link'}
              </Button>
              <Button variant="outline" onClick={() => setIsSharing(false)} className="border-gray-600 text-white">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}