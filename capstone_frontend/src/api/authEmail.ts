// Authentication Email API Utilities
// These functions handle all authentication-related email operations

const API_BASE_URL = "http://127.0.0.1:8000/api";

interface ApiResponse {
  success: boolean;
  message: string;
  [key: string]: any;
}

/**
 * Send verification email after registration
 * @param userId - The user's ID
 */
export async function sendVerificationEmail(userId: number): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/email/send-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return {
      success: false,
      message: "Network error: Could not send verification email",
    };
  }
}

/**
 * Resend verification email
 * @param email - The user's email address
 */
export async function resendVerificationEmail(email: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/email/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to resend verification email:", error);
    return {
      success: false,
      message: "Network error: Could not resend verification email",
    };
  }
}

/**
 * Request password reset email
 * @param email - The user's email address
 */
export async function requestPasswordReset(email: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/email/password-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return {
      success: false,
      message: "Network error: Could not send password reset email",
    };
  }
}

/**
 * Reset password using token
 * @param token - Reset token from email
 * @param email - User's email
 * @param password - New password
 * @param passwordConfirmation - Password confirmation
 */
export async function resetPassword(
  token: string,
  email: string,
  password: string,
  passwordConfirmation: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to reset password:", error);
    return {
      success: false,
      message: "Network error: Could not reset password",
    };
  }
}

/**
 * Request donor account reactivation
 * @param userId - The user's ID
 * @param token - Auth token
 */
export async function requestDonorReactivation(
  userId: number,
  token: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/email/donor-reactivation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to send donor reactivation email:", error);
    return {
      success: false,
      message: "Network error: Could not send reactivation email",
    };
  }
}

/**
 * Request charity account reactivation
 * @param userId - The user's ID
 * @param token - Auth token
 */
export async function requestCharityReactivation(
  userId: number,
  token: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/email/charity-reactivation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to send charity reactivation email:", error);
    return {
      success: false,
      message: "Network error: Could not send reactivation email",
    };
  }
}

/**
 * Request email address change
 * @param userId - The user's ID
 * @param newEmail - New email address
 * @param token - Auth token
 */
export async function requestEmailChange(
  userId: number,
  newEmail: string,
  token: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/email/change-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        new_email: newEmail,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to send email change confirmation:", error);
    return {
      success: false,
      message: "Network error: Could not send email change confirmation",
    };
  }
}

/**
 * Send 2FA setup confirmation with backup codes
 * @param userId - The user's ID
 * @param backupCodes - Array of backup codes
 * @param token - Auth token
 */
export async function send2FASetupEmail(
  userId: number,
  backupCodes: string[],
  token: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/email/2fa-setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        backup_codes: backupCodes,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to send 2FA setup email:", error);
    return {
      success: false,
      message: "Network error: Could not send 2FA setup email",
    };
  }
}

/**
 * Send account status change notification
 * @param userId - The user's ID
 * @param status - Account status (deactivated, reactivated, suspended)
 * @param reason - Optional reason for status change
 * @param token - Auth token
 */
export async function sendAccountStatusEmail(
  userId: number,
  status: "deactivated" | "reactivated" | "suspended",
  token: string,
  reason?: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/email/account-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        status,
        reason,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to send account status email:", error);
    return {
      success: false,
      message: "Network error: Could not send account status notification",
    };
  }
}

// Export all functions as a single object for convenience
export const authEmailAPI = {
  sendVerification: sendVerificationEmail,
  resendVerification: resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  requestDonorReactivation,
  requestCharityReactivation,
  requestEmailChange,
  send2FASetup: send2FASetupEmail,
  sendAccountStatus: sendAccountStatusEmail,
};

export default authEmailAPI;
