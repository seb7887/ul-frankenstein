import { NextApiRequest } from 'next';

// Helper to get ID token from cookies server-side
export function getServerIdToken(req: NextApiRequest): string | null {
  try {
    // In App Router, we use cookies directly
    const cookies = req.headers.cookie;
    if (!cookies) return null;
    
    const idTokenMatch = cookies.match(/id_token=([^;]+)/);
    return idTokenMatch ? decodeURIComponent(idTokenMatch[1]) : null;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}