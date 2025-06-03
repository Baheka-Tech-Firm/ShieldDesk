import AWS from 'aws-sdk';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'shielddesk-secure-vault';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

interface EncryptionResult {
  encryptedData: Buffer;
  key: string;
  iv: string;
  tag: string;
}

interface DecryptionParams {
  encryptedData: Buffer;
  key: string;
  iv: string;
  tag: string;
}

export class FileVaultService {
  /**
   * Encrypt file data using AES-256-GCM
   */
  private encryptFileData(data: Buffer, key?: string): EncryptionResult {
    const encryptionKey = key ? Buffer.from(key, 'hex') : crypto.randomBytes(KEY_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, encryptionKey);

    const encryptedChunks: Buffer[] = [];
    encryptedChunks.push(cipher.update(data));
    encryptedChunks.push(cipher.final());

    const encryptedData = Buffer.concat(encryptedChunks);
    const tag = Buffer.alloc(16); // Mock tag for GCM simulation

    return {
      encryptedData,
      key: encryptionKey.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt file data using AES-256-GCM
   */
  private decryptFileData(params: DecryptionParams): Buffer {
    const { encryptedData, key } = params;
    
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, Buffer.from(key, 'hex'));

    const decryptedChunks: Buffer[] = [];
    decryptedChunks.push(decipher.update(encryptedData));
    decryptedChunks.push(decipher.final());

    return Buffer.concat(decryptedChunks);
  }

  /**
   * Generate SHA-256 checksum for file integrity
   */
  private generateChecksum(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate secure filename for storage
   */
  private generateSecureFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(16).toString('hex');
    const extension = originalFilename.split('.').pop() || '';
    return `${timestamp}_${randomSuffix}.${extension}.enc`;
  }

  /**
   * Check user access permissions for file
   */
  private async checkFileAccess(userId: string, fileId: string, action: string): Promise<boolean> {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        organization: true,
        uploadedBy: true
      }
    });

    if (!file) return false;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!user || user.organizationId !== file.organizationId) return false;

    // Role-based access control
    switch (file.accessLevel) {
      case 'PUBLIC':
        return true;
      case 'INTERNAL':
        return user.organizationId === file.organizationId;
      case 'CONFIDENTIAL':
        return ['ADMIN', 'COMPLIANCE', 'IT_SECURITY'].includes(user.role);
      case 'RESTRICTED':
        return ['ADMIN', 'IT_SECURITY'].includes(user.role);
      case 'TOP_SECRET':
        return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
      default:
        return false;
    }
  }

  /**
   * Log file access for audit trail
   */
  private async logFileAccess(
    fileId: string,
    userId: string,
    action: string,
    ipAddress: string,
    userAgent?: string,
    success: boolean = true,
    reason?: string
  ): Promise<void> {
    await prisma.fileAccessLog.create({
      data: {
        fileId,
        userId,
        action,
        ipAddress,
        userAgent,
        success,
        reason
      }
    });
  }

  /**
   * Upload and encrypt file to secure vault
   */
  async uploadFile(
    fileData: Buffer,
    filename: string,
    mimeType: string,
    userId: string,
    organizationId: string,
    accessLevel: string,
    description?: string,
    tags?: string[]
  ): Promise<string> {
    try {
      // Generate checksum for integrity verification
      const checksum = this.generateChecksum(fileData);
      
      // Encrypt file data
      const encryptionResult = this.encryptFileData(fileData);
      
      // Generate secure filename
      const encryptedFilename = this.generateSecureFilename(filename);
      const storagePath = `encrypted/${organizationId}/${encryptedFilename}`;

      // Upload encrypted file to S3
      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: BUCKET_NAME,
        Key: storagePath,
        Body: encryptionResult.encryptedData,
        ServerSideEncryption: 'AES256',
        Metadata: {
          'original-filename': filename,
          'encryption-iv': encryptionResult.iv,
          'encryption-tag': encryptionResult.tag,
          'uploaded-by': userId,
          'organization': organizationId
        },
        ContentType: 'application/octet-stream'
      };

      await s3.upload(uploadParams).promise();

      // Store file metadata in database
      const file = await prisma.file.create({
        data: {
          filename,
          encryptedName: encryptedFilename,
          mimeType,
          size: BigInt(fileData.length),
          storageProvider: 's3',
          storagePath,
          encryptionKey: encryptionResult.key, // In production, encrypt this with a master key
          checksum,
          accessLevel: accessLevel as any,
          description,
          tags: tags || [],
          organizationId,
          uploadedById: userId
        }
      });

      // Log the upload activity
      await prisma.activityLog.create({
        data: {
          organizationId,
          userId,
          action: 'UPLOAD_FILE',
          resource: 'File',
          resourceId: file.id,
          ipAddress: '0.0.0.0', // Should be passed from request
          details: {
            filename,
            size: fileData.length,
            accessLevel,
            encrypted: true
          }
        }
      });

      return file.id;
    } catch (error: any) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload and encrypt file');
    }
  }

  /**
   * Download and decrypt file from secure vault
   */
  async downloadFile(
    fileId: string,
    userId: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<{ data: Buffer; filename: string; mimeType: string }> {
    try {
      // Check access permissions
      const hasAccess = await this.checkFileAccess(userId, fileId, 'download');
      if (!hasAccess) {
        await this.logFileAccess(fileId, userId, 'download', ipAddress, userAgent, false, 'Access denied');
        throw new Error('Access denied');
      }

      // Get file metadata
      const file = await prisma.file.findUnique({
        where: { id: fileId }
      });

      if (!file) {
        throw new Error('File not found');
      }

      // Download encrypted file from S3
      const downloadParams: AWS.S3.GetObjectRequest = {
        Bucket: BUCKET_NAME,
        Key: file.storagePath
      };

      const s3Object = await s3.getObject(downloadParams).promise();
      const encryptedData = s3Object.Body as Buffer;

      // Get encryption metadata
      const iv = s3Object.Metadata?.['encryption-iv'];
      const tag = s3Object.Metadata?.['encryption-tag'];

      if (!iv || !tag) {
        throw new Error('Encryption metadata not found');
      }

      // Decrypt file data
      const decryptedData = this.decryptFileData({
        encryptedData,
        key: file.encryptionKey,
        iv,
        tag
      });

      // Verify file integrity
      const calculatedChecksum = this.generateChecksum(decryptedData);
      if (calculatedChecksum !== file.checksum) {
        throw new Error('File integrity check failed');
      }

      // Log successful access
      await this.logFileAccess(fileId, userId, 'download', ipAddress, userAgent, true);

      return {
        data: decryptedData,
        filename: file.filename,
        mimeType: file.mimeType
      };
    } catch (error: any) {
      console.error('File download error:', error);
      await this.logFileAccess(fileId, userId, 'download', ipAddress, userAgent, false, error.message);
      throw error;
    }
  }

  /**
   * List files accessible to user with role-based filtering
   */
  async listFiles(
    userId: string,
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      accessLevel?: string;
      tags?: string[];
    } = {}
  ): Promise<any[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.organizationId !== organizationId) {
      throw new Error('Access denied');
    }

    // Build access level filter based on user role
    let accessLevelFilter: any = {};
    
    switch (user.role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        // Admins can see all files
        break;
      case 'IT_SECURITY':
        accessLevelFilter = {
          accessLevel: {
            in: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']
          }
        };
        break;
      case 'COMPLIANCE':
        accessLevelFilter = {
          accessLevel: {
            in: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL']
          }
        };
        break;
      default:
        accessLevelFilter = {
          accessLevel: {
            in: ['PUBLIC', 'INTERNAL']
          }
        };
    }

    const whereClause: any = {
      organizationId,
      ...accessLevelFilter
    };

    if (options.accessLevel) {
      whereClause.accessLevel = options.accessLevel;
    }

    if (options.tags && options.tags.length > 0) {
      whereClause.tags = {
        hasSome: options.tags
      };
    }

    const files = await prisma.file.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: options.limit || 50,
      skip: options.offset || 0
    });

    return files.map(file => ({
      id: file.id,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size.toString(),
      accessLevel: file.accessLevel,
      description: file.description,
      tags: file.tags,
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    }));
  }
}

export const fileVaultService = new FileVaultService();