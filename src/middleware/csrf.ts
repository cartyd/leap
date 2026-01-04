import { FastifyRequest, FastifyReply } from 'fastify';
import { randomBytes, createHmac } from 'crypto';
import config from '@config/index';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_FORM_FIELD = '_csrf';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function createCsrfSignature(token: string): string {
  return createHmac('sha256', config.security.csrfSecret)
    .update(token)
    .digest('hex');
}

export function verifyCsrfToken(token: string, signature: string): boolean {
  const expectedSignature = createCsrfSignature(token);
  return signature === expectedSignature;
}

export async function csrfProtection(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Generate token for all requests if not present
  let cookieValue = request.cookies[CSRF_COOKIE_NAME];
  if (!cookieValue) {
    const csrfToken = generateCsrfToken();
    const signature = createCsrfSignature(csrfToken);
    cookieValue = `${csrfToken}.${signature}`;
    reply.setCookie(CSRF_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: !config.isDevelopment,
      sameSite: 'lax',
      path: '/',
    });
  }

  // Extract token and add to request object
  const [token] = cookieValue.split('.');
  request.csrfToken = token;

  // Skip CSRF verification for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return;
  }

  // Verify CSRF for state-changing methods
  const submittedToken = 
    (request.headers[CSRF_HEADER_NAME] as string) ||
    (request.body as any)?.[CSRF_FORM_FIELD];

  if (!submittedToken) {
    reply.code(403).send({ error: 'CSRF token missing' });
    return;
  }

  const [, signature] = cookieValue.split('.');
  if (!token || !signature || token !== submittedToken || !verifyCsrfToken(token, signature)) {
    reply.code(403).send({ error: 'Invalid CSRF token' });
    return;
  }
}

// Decorator to add CSRF token to request
declare module 'fastify' {
  interface FastifyRequest {
    csrfToken?: string;
  }
}

export function addCsrfToken(request: FastifyRequest, reply?: FastifyReply): void {
  let cookieValue = request.cookies[CSRF_COOKIE_NAME];
  
  // If cookie was just set in this request, try to get it from the reply
  if (!cookieValue && reply) {
    // Cookie might have just been set, read it from cookies again
    cookieValue = request.cookies[CSRF_COOKIE_NAME];
  }
  
  if (cookieValue) {
    const [token] = cookieValue.split('.');
    request.csrfToken = token;
  }
}
