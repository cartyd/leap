import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  applicantSchema,
  medicalCoverageSchema,
  incomeSchema,
} from '../schemas/application.schema';

export async function validationRoutes(app: FastifyInstance) {
  // Validate applicant section
  app.post('/applications/:id/validate/applicant', async (request, reply) => {
    const body = request.body as any;

    try {
      applicantSchema.partial().parse(body);
      return reply.send('');
    } catch (error: any) {
      return reply.view('partials/errors.njk', {
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
  });

  // Validate medical coverage section
  app.post('/applications/:id/validate/medicalCoverage', async (request, reply) => {
    const body = request.body as any;

    try {
      medicalCoverageSchema.parse(body);
      return reply.send('');
    } catch (error: any) {
      return reply.view('partials/errors.njk', {
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
  });

  // Validate income section
  app.post('/applications/:id/validate/income', async (request, reply) => {
    const body = request.body as any;

    try {
      incomeSchema.parse(body);
      return reply.send('');
    } catch (error: any) {
      return reply.view('partials/errors.njk', {
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
  });
}
