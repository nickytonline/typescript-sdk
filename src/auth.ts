export function getAuthorizationUrl(options: {
  client_id: string;
  redirect_uri: string;
  state: string;
  scope: string;
  code_challenge?: string;
}): string {
  const { client_id, redirect_uri, state, scope, code_challenge } = options;
  const baseUrl = 'https://auth.example.com/authorize';
  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    state,
    scope,
    response_type: 'code',
  });
  if (code_challenge) {
    params.append('code_challenge', code_challenge);
    params.append('code_challenge_method', 'S256');
  }
  return `${baseUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(params: {
  code: string;
  client_id: string;
  redirect_uri: string;
  code_verifier: string;
}): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  const { code, client_id, redirect_uri, code_verifier } = params;
  const tokenUrl = 'https://auth.example.com/token';
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id,
      redirect_uri,
      code_verifier,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return await response.json();
}