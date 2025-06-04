import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface MFASetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface LoginAttempt {
  success: boolean;
  userId?: string;
  reason?: string;
  requiresMFA?: boolean;
  mfaToken?: string;
  token?: string;
}

interface ZeroTrustContext {
  userId: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  deviceFingerprint?: string;
  riskScore: number;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
  private readonly MFA_WINDOW = 2; // Allow 2 time windows for TOTP
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure backup codes for MFA
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Calculate risk score for Zero Trust evaluation
   */
  private calculateRiskScore(context: Partial<ZeroTrustContext>): number {
    let riskScore = 0;

    // Base risk factors for simple heuristics
    const factors = {
      unknownDevice: 30,
      newLocation: 25,
      offHours: 15,
      multipleFailedAttempts: 40,
      suspiciousUserAgent: 20
    };

    // Basic contextual checks. These can later be replaced with
    // integrations for threat intelligence and behavioral analytics.

    // Missing device fingerprint suggests an unknown device
    if (!context.deviceFingerprint) {
      riskScore += factors.unknownDevice;
    }

    // If location is provided and flagged as new, increase risk
    if (context.location && context.location !== 'known') {
      riskScore += factors.newLocation;
    }

    // Logins outside typical business hours are slightly riskier
    const currentHour = new Date().getUTCHours();
    if (currentHour < 6 || currentHour > 20) {
      riskScore += factors.offHours;
    }

    // Previous high risk (e.g., multiple failed attempts) boosts score
    if (context.riskScore && context.riskScore >= this.MAX_FAILED_ATTEMPTS) {
      riskScore += factors.multipleFailedAttempts;
    }

    // Obvious bot or script user agents are suspicious
    if (context.userAgent && /bot|crawl|spider|curl|wget/i.test(context.userAgent)) {
      riskScore += factors.suspiciousUserAgent;
    }

    // Ensure score does not exceed 100
    return Math.min(riskScore, 100);
  }

  /**
   * Register new user with secure password
   */
  async registerUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    organizationId: string,
    role: string = 'USER'
  ): Promise<string> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          organizationId,
          role: role as any,
          emailVerified: new Date() // In production, require email verification
        }
      });

      // Log registration activity
      await prisma.activityLog.create({
        data: {
          organizationId,
          userId: user.id,
          action: 'USER_REGISTRATION',
          resource: 'User',
          resourceId: user.id,
          ipAddress: '0.0.0.0', // Should be passed from request
          details: {
            email,
            role
          }
        }
      });

      return user.id;
    } catch (error) {
      console.error('User registration error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with email and password
   */
  async authenticateUser(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ): Promise<LoginAttempt> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { organization: true }
      });

      if (!user) {
        return { success: false, reason: 'Invalid credentials' };
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return { 
          success: false, 
          reason: `Account locked until ${user.lockedUntil.toISOString()}` 
        };
      }

      // Verify password
      const passwordValid = await this.verifyPassword(password, user.password || '');
      
      if (!passwordValid) {
        // Increment failed attempts
        const failedAttempts = user.failedLoginAttempts + 1;
        const updateData: any = { failedLoginAttempts: failedAttempts };

        if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
          updateData.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });

        // Log failed attempt
        await prisma.activityLog.create({
          data: {
            organizationId: user.organizationId,
            userId: user.id,
            action: 'FAILED_LOGIN',
            resource: 'Authentication',
            ipAddress,
            userAgent,
            severity: 'WARNING',
            details: {
              reason: 'Invalid password',
              failedAttempts
            }
          }
        });

        return { success: false, reason: 'Invalid credentials' };
      }

      // Reset failed attempts on successful password verification
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null
        }
      });

      // Check if MFA is required
      if (user.mfaEnabled) {
        // Generate temporary MFA token
        const mfaToken = jwt.sign(
          { userId: user.id, step: 'mfa_required' },
          this.JWT_SECRET,
          { expiresIn: '5m' }
        );

        return {
          success: false,
          requiresMFA: true,
          mfaToken,
          userId: user.id
        };
      }

      // Complete login
      return this.completeLogin(user.id, ipAddress, userAgent);
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, reason: 'Authentication failed' };
    }
  }

  /**
   * Setup MFA for user
   */
  async setupMFA(userId: string): Promise<MFASetupResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate MFA secret
      const secret = speakeasy.generateSecret({
        name: `ShieldDesk (${user.email})`,
        issuer: 'ShieldDesk Security Platform',
        length: 32
      });

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Store MFA secret (encrypt in production)
      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaSecret: secret.base32
        }
      });

      // Log MFA setup
      await prisma.activityLog.create({
        data: {
          organizationId: user.organizationId,
          userId,
          action: 'MFA_SETUP_INITIATED',
          resource: 'User',
          resourceId: userId,
          ipAddress: '0.0.0.0',
          details: {
            mfaType: 'TOTP'
          }
        }
      });

      return {
        secret: secret.base32 || '',
        qrCodeUrl,
        backupCodes
      };
    } catch (error) {
      console.error('MFA setup error:', error);
      throw error;
    }
  }

  /**
   * Enable MFA after verification
   */
  async enableMFA(userId: string, token: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.mfaSecret) {
        throw new Error('MFA not set up');
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token,
        window: this.MFA_WINDOW
      });

      if (!verified) {
        return false;
      }

      // Enable MFA
      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: true
        }
      });

      // Log MFA enablement
      await prisma.activityLog.create({
        data: {
          organizationId: user.organizationId,
          userId,
          action: 'MFA_ENABLED',
          resource: 'User',
          resourceId: userId,
          ipAddress: '0.0.0.0',
          details: {
            mfaType: 'TOTP'
          }
        }
      });

      return true;
    } catch (error) {
      console.error('MFA enable error:', error);
      throw error;
    }
  }

  /**
   * Verify MFA token during login
   */
  async verifyMFA(
    mfaToken: string,
    totpToken: string,
    ipAddress: string,
    userAgent: string
  ): Promise<LoginAttempt> {
    try {
      // Verify MFA token
      const decoded = jwt.verify(mfaToken, this.JWT_SECRET) as any;
      
      if (decoded.step !== 'mfa_required') {
        return { success: false, reason: 'Invalid MFA token' };
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.mfaEnabled || !user.mfaSecret) {
        return { success: false, reason: 'MFA not configured' };
      }

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: totpToken,
        window: this.MFA_WINDOW
      });

      if (!verified) {
        // Log failed MFA attempt
        await prisma.activityLog.create({
          data: {
            organizationId: user.organizationId,
            userId: user.id,
            action: 'FAILED_MFA',
            resource: 'Authentication',
            ipAddress,
            userAgent,
            severity: 'WARNING',
            details: {
              reason: 'Invalid TOTP token'
            }
          }
        });

        return { success: false, reason: 'Invalid MFA token' };
      }

      // Complete login
      return this.completeLogin(user.id, ipAddress, userAgent);
    } catch (error) {
      console.error('MFA verification error:', error);
      return { success: false, reason: 'MFA verification failed' };
    }
  }

  /**
   * Complete login process with Zero Trust validation
   */
  private async completeLogin(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<LoginAttempt> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true }
      });

      if (!user) {
        return { success: false, reason: 'User not found' };
      }

      // Zero Trust risk assessment
      const riskContext: Partial<ZeroTrustContext> = {
        userId,
        ipAddress,
        userAgent
      };

      const riskScore = this.calculateRiskScore(riskContext);

      // Update last login
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date()
        }
      });

      // Log successful login
      await prisma.activityLog.create({
        data: {
          organizationId: user.organizationId,
          userId,
          action: 'SUCCESSFUL_LOGIN',
          resource: 'Authentication',
          ipAddress,
          userAgent,
          details: {
            riskScore,
            mfaUsed: user.mfaEnabled
          }
        }
      });

      // Generate session token
      const sessionToken = jwt.sign(
        {
          userId,
          organizationId: user.organizationId,
          role: user.role,
          riskScore
        },
        this.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return {
        success: true,
        userId,
        token: sessionToken
      };
    } catch (error) {
      console.error('Login completion error:', error);
      return { success: false, reason: 'Login failed' };
    }
  }

  /**
   * Validate session token with Zero Trust principles
   */
  async validateSession(
    token: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ valid: boolean; userId?: string; requiresReauth?: boolean }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        return { valid: false };
      }

      // Continuous Zero Trust validation
      const currentRiskScore = this.calculateRiskScore({
        userId: decoded.userId,
        ipAddress,
        userAgent
      });

      // If risk score has increased significantly, require re-authentication
      if (currentRiskScore > decoded.riskScore + 30) {
        return {
          valid: false,
          requiresReauth: true
        };
      }

      return {
        valid: true,
        userId: decoded.userId
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Generate secure password reset token
   */
  async initiatePasswordReset(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if email exists
        return true;
      }

      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token (hash in production)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // Add resetToken and resetExpiry fields to schema
          // resetToken,
          // resetExpiry
        }
      });

      // Log password reset request
      await prisma.activityLog.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
          resource: 'User',
          resourceId: user.id,
          ipAddress: '0.0.0.0',
          details: {
            email
          }
        }
      });

      // Send reset email (implement email service)
      // await emailService.sendPasswordReset(email, resetToken);

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  }

  /**
   * Logout user and invalidate session
   */
  async logout(userId: string, ipAddress: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) return;

      // Log logout activity
      await prisma.activityLog.create({
        data: {
          organizationId: user.organizationId,
          userId,
          action: 'USER_LOGOUT',
          resource: 'Authentication',
          ipAddress,
          details: {
            logoutTime: new Date().toISOString()
          }
        }
      });

      // In production, add token to blacklist or invalidate session
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export const authService = new AuthService();