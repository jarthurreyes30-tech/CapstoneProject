/**
 * useTwoFactor Hook
 * 
 * Shared React hook for Two-Factor Authentication operations.
 * Works for both donors and charity admins.
 */
import { useState, useEffect } from 'react';
import { twoFactorService, TwoFactorStatus } from '@/services/twoFactor';
import { useToast } from '@/hooks/use-toast';

interface UseTwoFactorOptions {
  role: 'donor' | 'charity_admin';
  autoFetch?: boolean;
}

export function useTwoFactor({ role, autoFetch = true }: UseTwoFactorOptions) {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch 2FA status on mount
  useEffect(() => {
    if (autoFetch) {
      fetchStatus();
    }
  }, [autoFetch]);

  /**
   * Fetch current 2FA status
   */
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await twoFactorService.getStatus(role);
      setStatus(data);
    } catch (error: any) {
      console.error('Failed to fetch 2FA status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load 2FA status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enable 2FA (get QR code)
   */
  const enableTwoFactor = async () => {
    try {
      setLoading(true);
      const data = await twoFactorService.enable(role);
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setRecoveryCodes(data.recovery_codes);
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to enable 2FA',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify 2FA code
   */
  const verifyTwoFactor = async (code: string) => {
    try {
      setLoading(true);
      const data = await twoFactorService.verify(code, role);
      
      // Update status
      await fetchStatus();
      
      toast({
        title: 'Success!',
        description: data.message || 'Two-factor authentication enabled successfully',
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.response?.data?.message || 'Invalid code, please try again',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disable 2FA
   */
  const disableTwoFactor = async (password: string) => {
    try {
      setLoading(true);
      const data = await twoFactorService.disable(password, role);
      
      // Update status
      await fetchStatus();
      
      // Clear local state
      setQrCode('');
      setSecret('');
      setRecoveryCodes([]);
      
      toast({
        title: 'Success',
        description: data.message || '2FA has been disabled',
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to disable 2FA',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download recovery codes
   */
  const downloadRecoveryCodes = () => {
    if (recoveryCodes.length === 0) {
      toast({
        title: 'No Recovery Codes',
        description: 'No recovery codes available to download',
        variant: 'destructive',
      });
      return;
    }

    twoFactorService.downloadRecoveryCodes(recoveryCodes);
    toast({
      title: 'Downloaded',
      description: 'Recovery codes saved to your downloads folder',
    });
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: label ? `${label} copied to clipboard` : 'Copied to clipboard',
    });
  };

  return {
    // State
    status,
    loading,
    qrCode,
    secret,
    recoveryCodes,
    isEnabled: status?.enabled || false,
    
    // Actions
    fetchStatus,
    enableTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    downloadRecoveryCodes,
    copyToClipboard,
  };
}
