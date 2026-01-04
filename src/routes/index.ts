import { FastifyInstance } from 'fastify';

export async function indexRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return reply.view('index.njk', {
      csrfToken: request.csrfToken,
    });
  });
}
