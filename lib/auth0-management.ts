export interface PasswordChangeTicket {
  ticket: string;
  expires_at: string;
}

/**
 * Creates a password change ticket using Auth0 Management API
 * Uses direct fetch calls with the exact format that works in Postman
 */
export async function createPasswordChangeTicket(userId: string): Promise<PasswordChangeTicket> {
  const domain = process.env.AUTH0_ISSUER_BASE_URL;
  const clientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
  const clientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;
  const audience = process.env.AUTH0_MANAGEMENT_AUDIENCE;
  const baseUrl = process.env.AUTH0_BASE_URL;

  // Validate environment variables
  if (!domain || !clientId || !clientSecret || !audience || !baseUrl) {
    throw new Error('Missing required Auth0 environment variables for Management API');
  }

  console.log('Creating password change ticket for user:', userId);

  try {
    // Step 1: Get Management API access token
    console.log('Obtaining Management API access token...');
    const tokenResponse = await fetch(`${domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to get access token: HTTP ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('No access token received from Auth0');
    }

    console.log('Access token obtained successfully');

    // Step 2: Create password change ticket with exact Postman format
    console.log('Creating password change ticket with simplified payload...');
    const ticketPayload = {
      result_url: baseUrl,
      user_id: userId,
      ttl_sec: 3600,
      mark_email_as_verified: true,
    };

    console.log('Ticket payload:', ticketPayload);

    const ticketResponse = await fetch(`${domain}/api/v2/tickets/password-change`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketPayload),
    });

    if (!ticketResponse.ok) {
      const errorText = await ticketResponse.text();
      let errorMessage = `HTTP ${ticketResponse.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage += `: ${errorData.message}`;
        }
        if (errorData.errorCode) {
          errorMessage += ` (${errorData.errorCode})`;
        }
      } catch {
        errorMessage += `: ${errorText}`;
      }
      
      throw new Error(`Failed to create password change ticket: ${errorMessage}`);
    }

    const ticket: PasswordChangeTicket = await ticketResponse.json();

    if (!ticket.ticket) {
      throw new Error('No ticket URL received from Auth0');
    }

    console.log('Password change ticket created successfully:', {
      user_id: userId,
      expires_at: ticket.expires_at,
    });

    return ticket;

  } catch (error) {
    console.error('Error creating password change ticket:', error);
    throw error;
  }
}