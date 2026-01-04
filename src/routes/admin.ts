import { FastifyInstance } from 'fastify';
import { basicAuth } from '../middleware/auth';
import * as applicationService from '../services/application.service';
import * as uploadService from '../services/upload.service';
import type { Status } from '../services/application.service';

export async function adminRoutes(app: FastifyInstance) {
  // Protect all admin routes
  app.addHook('onRequest', basicAuth);

  // List applications
  app.get('/applications', async (request, reply) => {
    const { status } = request.query as { status?: Status };
    const applications = await applicationService.listApplications(status);

    return reply.view('admin/list.njk', {
      applications,
      filterStatus: status,
    });
  });

  // View single application
  app.get('/applications/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const application = await applicationService.getApplication(id);

    if (!application) {
      return reply.code(404).send({ error: 'Application not found' });
    }

    const uploads = await uploadService.getUploadsByApplication(id);

    return reply.view('admin/detail.njk', {
      application,
      uploads,
      csrfToken: request.csrfToken,
    });
  });

  // Reset application to draft
  app.post('/applications/:id/reset', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await applicationService.resetApplication(id);
      return reply.redirect(`/admin/applications/${id}`);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });
}
