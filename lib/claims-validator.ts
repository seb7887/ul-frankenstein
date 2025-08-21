import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { getAccessToken } from '@auth0/nextjs-auth0';

export interface CustomClaims {
  [key: string]: any;
  prp?: boolean; // Password reset required
}

export interface TokenPayload {
  sub: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

export class ClaimsValidator {
  private namespace: string;

  constructor() {
    this.namespace = process.env.AUTH0_CUSTOM_NAMESPACE || process.env.AUTH0_ISSUER_BASE_URL || '';
    
    if (!this.namespace) {
      throw new Error('AUTH0_CUSTOM_NAMESPACE or AUTH0_ISSUER_BASE_URL must be set');
    }
    
    // Ensure namespace ends with '/'
    if (!this.namespace.endsWith('/')) {
      this.namespace += '/';
    }
  }

  /**
   * Extract custom claims from ID token
   */
  extractCustomClaims(idToken: string): CustomClaims {
    try {
      // Decode JWT without verification (we trust Auth0's signature)
      const decoded = jwt.decode(idToken) as TokenPayload;
      
      if (!decoded || typeof decoded !== 'object') {
        throw new Error('Invalid token payload');
      }

      const customClaims: CustomClaims = {};
      
      // Extract all claims that match our namespace
      Object.keys(decoded).forEach(key => {
        if (key.startsWith(this.namespace)) {
          const claimName = key.replace(this.namespace, '');
          customClaims[claimName] = decoded[key];
        } else if (key === 'prp') {
          // Extract 'prp' claim directly (without namespace)
          customClaims[key] = decoded[key];
        }
      });

      return customClaims;
    } catch (error) {
      console.error('Error extracting custom claims:', error);
      return {};
    }
  }

  /**
   * Check if password reset is required for a user
   */
  async isPasswordResetRequired(req: NextRequest): Promise<boolean> {
    try {
      // Get ID token from request cookies
      const idToken = req.cookies.get('id_token')?.value;
      
      if (!idToken) {
        return false;
      }

      const claims = this.extractCustomClaims(idToken);
      
      // Check the 'prp' (password reset required) claim
      return claims.prp === true;
    } catch (error) {
      console.error('Error checking password reset requirement:', error);
      return false;
    }
  }

  /**
   * Get specific custom claim value
   */
  getCustomClaim(idToken: string, claimName: string): any {
    const claims = this.extractCustomClaims(idToken);
    return claims[claimName];
  }

  /**
   * Validate that user has required claims for accessing protected resources
   */
  validateRequiredClaims(idToken: string, requiredClaims: string[]): boolean {
    const claims = this.extractCustomClaims(idToken);
    
    return requiredClaims.every(claimName => {
      const claimValue = claims[claimName];
      // Consider undefined, null, false, or empty string as not having the claim
      return claimValue !== undefined && claimValue !== null && claimValue !== false && claimValue !== '';
    });
  }

  /**
   * Extract user information from token payload
   */
  extractUserInfo(idToken: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(idToken) as TokenPayload;
      
      if (!decoded || typeof decoded !== 'object') {
        return null;
      }

      return {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        // Include any other standard claims you need
      };
    } catch (error) {
      console.error('Error extracting user info:', error);
      return null;
    }
  }

  /**
   * Debug helper to log all claims (development only)
   */
  debugClaims(idToken: string): void {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    try {
      const decoded = jwt.decode(idToken);
      console.log('=== TOKEN CLAIMS DEBUG ===');
      console.log('Full payload:', decoded);
      console.log('Custom claims:', this.extractCustomClaims(idToken));
      console.log('========================');
    } catch (error) {
      console.error('Error debugging claims:', error);
    }
  }
}

// Singleton instance
export const claimsValidator = new ClaimsValidator();