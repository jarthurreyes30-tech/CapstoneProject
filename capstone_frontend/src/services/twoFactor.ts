/**
 * Two-Factor Authentication Service
 * 
 * Shared service for both donor and charity 2FA operations.
 * Uses different API base paths depending on the role.
 */
import api from '@/lib/axios';

export interface TwoFactorStatus {
  enabled: boolean;
  enabled_at: string | null;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  secret: string;
  qr_code: string;
  recovery_codes: string[];
  is_pending: boolean;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message: string;
  recovery_codes: string[];
}

export interface TwoFactorDisableResponse {
  success: boolean;
  message: string;
}

class TwoFactorService {
  /**
   * Get 2FA status for the current user
   */
  async getStatus(role: 'donor' | 'charity_admin'): Promise<TwoFactorStatus> {
    const basePath = role === 'charity_admin' ? '/charity/2fa' : '/me/2fa';
    const response = await api.get(`${basePath}/status`);
    return response.data;
  }

  /**
   * Enable 2FA (get QR code and setup)
   * Returns existing pending setup if available (no regeneration)
   */
  async enable(role: 'donor' | 'charity_admin'): Promise<TwoFactorSetupResponse> {
    const basePath = role === 'charity_admin' ? '/charity/2fa' : '/me/2fa';
    const response = await api.post(`${basePath}/enable`);
    return response.data;
  }

  /**
   * Verify 2FA code and activate
   */
  async verify(code: string, role: 'donor' | 'charity_admin'): Promise<TwoFactorVerifyResponse> {
    const basePath = role === 'charity_admin' ? '/charity/2fa' : '/me/2fa';
    const response = await api.post(`${basePath}/verify`, { code });
    return response.data;
  }

  /**
   * Disable 2FA
   */
  async disable(password: string, role: 'donor' | 'charity_admin'): Promise<TwoFactorDisableResponse> {
    const basePath = role === 'charity_admin' ? '/charity/2fa' : '/me/2fa';
    const response = await api.post(`${basePath}/disable`, { password });
    return response.data;
  }

  /**
   * Download recovery codes as text file
   */
  downloadRecoveryCodes(codes: string[], filename?: string): void {
    const text = codes.join('\n');
    const blob = new Blob([
      `CharityHub 2FA Recovery Codes\n\n`,
      `Generated: ${new Date().toLocaleString()}\n\n`,
      text,
      `\n\n⚠️ Keep these codes safe! You'll need them if you lose access to your authenticator app.\n`,
      `Each code can only be used once.`
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `charityhub-recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const twoFactorService = new TwoFactorService();
