import { FastifyInstance } from 'fastify';

export async function partialRoutes(app: FastifyInstance) {
  // Return a new resource row (for resources contacted section)
  app.get('/partials/resource-row', async (request, reply) => {
    const { index } = request.query as { index?: string };
    const rowIndex = parseInt(index || '0', 10);

    if (rowIndex >= 4) {
      return reply.code(400).send({ error: 'Maximum 4 resources allowed' });
    }

    return reply.view('partials/resource-row.njk', {
      index: rowIndex,
    });
  });
}
