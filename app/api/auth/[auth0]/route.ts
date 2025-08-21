import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const route = pathname.split('/').pop();

  const domain = process.env.AUTH0_ISSUER_BASE_URL;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const baseUrl = process.env.AUTH0_BASE_URL;

  try {
    switch (route) {
      case 'login':
        const loginUrl = new URL(`${domain}/authorize`);
        loginUrl.searchParams.set('response_type', 'code');
        loginUrl.searchParams.set('client_id', clientId!);
        loginUrl.searchParams.set('redirect_uri', `${baseUrl}/api/auth/callback`);
        loginUrl.searchParams.set('scope', 'openid profile email read:current_user');
        loginUrl.searchParams.set('state', crypto.randomUUID());
        
        return NextResponse.redirect(loginUrl.toString());

      case 'logout':
        console.log('Logout initiated - clearing local session');
        
        // Create logout URL for Auth0
        const logoutUrl = new URL(`${domain}/v2/logout`);
        logoutUrl.searchParams.set('client_id', clientId!);
        logoutUrl.searchParams.set('returnTo', baseUrl!);
        
        // Create response and clear all authentication cookies
        const logoutResponse = NextResponse.redirect(logoutUrl.toString());
        
        // Clear ID token cookie
        logoutResponse.cookies.set('id_token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/',
        });
        
        // Also clear any remaining access token cookie (for backwards compatibility)
        logoutResponse.cookies.set('access_token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/',
        });
        
        console.log('Local cookies cleared, redirecting to Auth0 logout');
        return logoutResponse;

      case 'callback':
        const code = request.nextUrl.searchParams.get('code');
        if (!code) {
          return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
        }

        // Exchange code for tokens
        const tokenResponse = await fetch(`${domain}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            code,
            redirect_uri: `${baseUrl}/api/auth/callback`,
          }),
        });

        if (!tokenResponse.ok) {
          return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 });
        }

        const tokens = await tokenResponse.json();
        
        // Set cookies and redirect to dashboard
        const response = NextResponse.redirect(`${baseUrl}/dashboard`);
        console.log("TOKENS", tokens)
        
        // Only set ID token cookie (contains user info and custom claims)
        if (tokens.id_token) {
          response.cookies.set('id_token', tokens.id_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: tokens.expires_in,
          });
        } else {
          console.error('No ID token received from Auth0');
          return NextResponse.json({ error: 'Authentication failed - no ID token' }, { status: 500 });
        }

        return response;

      case 'me':
        const idToken = request.cookies.get('id_token')?.value;
        if (!idToken) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Extract user information directly from ID token instead of calling userinfo endpoint
        try {
          const decoded = jwt.decode(idToken) as any;
          if (!decoded || typeof decoded !== 'object') {
            return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
          }

          // Return user information from ID token
          const user = {
            sub: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
            email_verified: decoded.email_verified,
            // Include any custom claims with namespace
            ...Object.keys(decoded).reduce((acc, key) => {
              if (key.startsWith(process.env.AUTH0_ISSUER_BASE_URL || '')) {
                const claimName = key.replace(process.env.AUTH0_ISSUER_BASE_URL || '', '').replace(/^\//, '');
                acc[claimName] = decoded[key];
              }
              return acc;
            }, {} as any)
          };

          return NextResponse.json(user);
        } catch (error) {
          console.error('Error decoding ID token:', error);
          return NextResponse.json({ error: 'Failed to get user info' }, { status: 500 });
        }

      default:
        return NextResponse.json({ error: 'Invalid route' }, { status: 404 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}