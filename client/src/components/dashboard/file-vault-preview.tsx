import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Upload, Download, Trash2, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface File {
  id: number;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  accessLevel: string;
  uploadedBy: number;
  createdAt: string;
}

interface FileVaultPreviewProps {
  files: File[];
}

export function FileVaultPreview({ files }: FileVaultPreviewProps) {
  const { user } = useAuth();

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

  const canDelete = (file: File) => {
    return user?.role === 'admin' || file.uploadedBy === user?.id;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>File Vault</CardTitle>
          <div className="flex items-center space-x-2">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <Link href="/files">
              <Button variant="link" className="p-0 text-primary">
                View All Files
              </Button>
            </Link>
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
                <TableHead>Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No files uploaded yet
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
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
                      {file.createdAt && !isNaN(new Date(file.createdAt).getTime()) 
                        ? formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })
                        : 'Recently'
                      }
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
  );
}
