import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Log error (without PII)
  request.log.error({
    err: error,
    path: request.url,
    method: request.method,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    reply.code(400).send({
      error: 'Validation error',
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
    return;
  }

  // Handle known errors
  if (error.statusCode) {
    reply.code(error.statusCode).send({
      error: error.message,
    });
    return;
  }

  // Generic error
  reply.code(500).send({
    error: 'Internal server error',
  });
}

// Utility to mask PII in logs
export function maskPII(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const masked = { ...data };
  const piiFields = ['email', 'phoneHome', 'phoneCell', 'ssn', 'dob'];

  for (const field of piiFields) {
    if (masked[field]) {
      masked[field] = '***REDACTED***';
    }
  }

  return masked;
}
