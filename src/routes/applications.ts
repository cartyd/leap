import { FastifyInstance } from 'fastify';
import * as applicationService from '@services/application.service';
import * as uploadService from '@services/upload.service';
import { submitApplicationSchema } from '@schemas/application.schema';

export async function applicationRoutes(app: FastifyInstance) {
  // Create new application
  app.post('/applications', async (request, reply) => {
    const application = await applicationService.createApplication();
    return reply.redirect(`/applications/${application.id}/step/1`);
  });

  // Review page
  app.get('/applications/:id/review', async (request, reply) => {
    const { id } = request.params as { id: string };
    const application = await applicationService.getApplication(id);

    if (!application) {
      return reply.code(404).send({ error: 'Application not found' });
    }

    const uploads = await uploadService.getUploadsByApplication(id);

    return reply.view('review.njk', {
      application,
      uploads,
      csrfToken: request.csrfToken,
    });
  });

  // Submit application
  app.post('/applications/:id/submit', async (request, reply) => {
    const { id } = request.params as { id: string };
    const application = await applicationService.getApplication(id);

    if (!application) {
      return reply.code(404).send({ error: 'Application not found' });
    }

    // Validate complete application
    try {
      submitApplicationSchema.parse(application.data);
    } catch (error: any) {
      return reply.code(400).send({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    // Submit
    const submitted = await applicationService.submitApplication(id);

    return reply.view('confirmation.njk', {
      application: submitted,
    });
  });

  // Auto-save endpoint
  app.post('/applications/:id/autosave', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    try {
      await applicationService.updateApplication(id, body);
      const now = new Date().toLocaleTimeString();
      return reply.view('partials/autosave.njk', { savedAt: now });
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });
}
