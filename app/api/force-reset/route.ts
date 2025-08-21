import { NextRequest, NextResponse } from 'next/server';
import { createPasswordChangeTicket } from '@/lib/auth0-management';
import { claimsValidator } from '@/lib/claims-validator';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  console.log('=== Force Reset Endpoint Called ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('User-Agent:', req.headers.get('user-agent'));
  
  try {
    // Get ID token from cookies (contains user info and custom claims)
    const idToken = req.cookies.get('id_token')?.value;
    if (!idToken) {
      console.log('No ID token found in cookies - user not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized - no ID token' },
        { status: 401 }
      );
    }

    console.log('ID token obtained successfully from cookies');

    // Validate ID token format - ID tokens are always JWTs
    const tokenInfo = validateTokenFormat(idToken);
    console.log('Token validation result:', tokenInfo);
    
    if (!tokenInfo.isValid) {
      console.error('Invalid ID token:', tokenInfo.error);
      return NextResponse.json(
        { error: 'Invalid ID token', details: tokenInfo.error },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(idToken)) {
      console.error('ID token has expired');
      return NextResponse.json(
        { error: 'ID token expired - please log in again' },
        { status: 401 }
      );
    }

    // Extract custom claims from ID token
    const customClaims = claimsValidator.extractCustomClaims(idToken);
    console.log('Custom claims extracted:', customClaims);
    
    // Debug claims in development
    if (process.env.NODE_ENV === 'development') {
      claimsValidator.debugClaims(idToken);
    }
    
    // Check if password reset is required
    if (customClaims.prp !== true) {
      console.log('Password reset not required for user. prp claim:', customClaims.prp);
      return NextResponse.json(
        { error: 'Password reset not required', prp_claim: customClaims.prp },
        { status: 400 }
      );
    }

    // Get user information
    const userInfo = claimsValidator.extractUserInfo(idToken);
    console.log('User info extracted:', { sub: userInfo?.sub, email: userInfo?.email });
    
    if (!userInfo?.sub) {
      console.error('No user sub found in token');
      return NextResponse.json(
        { error: 'Invalid user information - no sub claim' },
        { status: 400 }
      );
    }

    // Create password change ticket using simplified implementation
    console.log('Creating password change ticket for user:', userInfo.sub);
    const ticket = await createPasswordChangeTicket(userInfo.sub);

    // Log the forced reset for audit purposes
    console.log('Forced password reset initiated:', {
      user_id: userInfo.sub,
      email: userInfo.email,
      timestamp: new Date().toISOString(),
      ticket_expires_at: ticket.expires_at,
    });

    return NextResponse.json({
      reset_url: ticket.ticket,
      expires_at: ticket.expires_at,
      user_id: userInfo.sub,
    });

  } catch (error) {
    console.error('Error in force-reset endpoint:', error);
    
    // Return appropriate error message based on error type
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // Auth0 Management API authentication errors
      if (errorMessage.includes('management') || errorMessage.includes('token')) {
        console.error('Auth0 Management API authentication failed');
        return NextResponse.json(
          { error: 'Authentication service temporarily unavailable', details: error.message },
          { status: 503 }
        );
      }
      
      // Auth0 API specific errors
      if (errorMessage.includes('http 40')) {
        console.error('Auth0 API client error:', error.message);
        return NextResponse.json(
          { error: 'Invalid request parameters', details: error.message },
          { status: 400 }
        );
      }
      
      if (errorMessage.includes('http 50')) {
        console.error('Auth0 API server error:', error.message);
        return NextResponse.json(
          { error: 'Authentication service error', details: error.message },
          { status: 502 }
        );
      }
      
      // Network or configuration errors
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        console.error('Network error:', error.message);
        return NextResponse.json(
          { error: 'Network connectivity issue', details: error.message },
          { status: 503 }
        );
      }
      
      // Generic error handling
      console.error('Unhandled error in force-reset:', error.message);
      return NextResponse.json(
        { error: 'Failed to initiate password reset', details: error.message },
        { status: 500 }
      );
    }

    console.error('Unknown error type in force-reset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Allow POST for better client compatibility
  return GET(req);
}

// Helper functions for token validation
interface TokenValidationResult {
  isValid: boolean;
  type: 'JWT' | 'Opaque' | 'Invalid';
  error?: string;
}

function validateTokenFormat(token: string): TokenValidationResult {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return { isValid: false, type: 'Invalid', error: 'Empty or invalid token' };
  }

  const parts = token.split('.');
  
  // ID tokens are always JWTs (3 parts separated by dots)
  if (parts.length === 3) {
    try {
      // Use jsonwebtoken library to decode safely - it handles base64url encoding correctly
      const decoded = jwt.decode(token);
      if (decoded && typeof decoded === 'object') {
        return { isValid: true, type: 'JWT' };
      } else {
        return { isValid: false, type: 'Invalid', error: 'JWT decode returned invalid result' };
      }
    } catch (error) {
      return { isValid: false, type: 'Invalid', error: 'Malformed JWT token' };
    }
  }
  
  return { isValid: false, type: 'Invalid', error: 'ID token must be a valid JWT format' };
}

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    
    // ID tokens are always JWTs (3 parts separated by dots)
    if (parts.length === 3) {
      const decoded = jwt.decode(token) as any;
      
      if (decoded && typeof decoded === 'object') {
        // Check if exp claim exists and if token is expired
        if (decoded.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          return decoded.exp < currentTime;
        }
      }
    }
    
    // If no exp claim found, consider as valid (shouldn't happen with ID tokens)
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    // If we can't parse the token, consider it expired
    return true;
  }
}