import { NextRequest, NextResponse } from 'next/server';

async function handleRequest(req: NextRequest) {
  try {
    // Check for ID token in cookies
    const idToken = req.cookies.get('id_token')?.value;
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get access token from cookies (if available)
    const accessToken = req.cookies.get('access_token')?.value;
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/api/proxy/')[1];
    
    if (!pathSegments) {
      return NextResponse.json({ error: 'Invalid API path' }, { status: 400 });
    }

    const externalApiUrl = `${process.env.EXTERNAL_API_BASE_URL}/${pathSegments}${url.search}`;
    
    const response = await fetch(externalApiUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Next.js BFF Proxy',
      },
      body: req.method !== 'GET' ? await req.text() : undefined,
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

export async function PUT(req: NextRequest) {
  return handleRequest(req);
}

export async function DELETE(req: NextRequest) {
  return handleRequest(req);
}

export async function PATCH(req: NextRequest) {
  return handleRequest(req);
}