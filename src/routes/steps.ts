import { FastifyInstance } from 'fastify';
import * as applicationService from '@services/application.service';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
} from '@schemas/application.schema';

const stepSchemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, step6Schema];
const stepTemplates = ['step1.njk', 'step2.njk', 'step3.njk', 'step4.njk', 'step5.njk', 'step6.njk'];

export async function stepRoutes(app: FastifyInstance) {
  // GET step
  app.get('/applications/:id/step/:stepNum', async (request, reply) => {
    const { id, stepNum } = request.params as { id: string; stepNum: string };
    const step = parseInt(stepNum, 10);

    if (step < 1 || step > 6) {
      return reply.code(400).send({ error: 'Invalid step number' });
    }

    const application = await applicationService.getApplication(id);
    if (!application) {
      return reply.code(404).send({ error: 'Application not found' });
    }

    return reply.view(stepTemplates[step - 1], {
      application,
      step,
      csrfToken: request.csrfToken,
      errors: {},
    });
  });

  // POST step (save and continue)
  app.post('/applications/:id/step/:stepNum', async (request, reply) => {
    const { id, stepNum } = request.params as { id: string; stepNum: string };
    const step = parseInt(stepNum, 10);
    const body = request.body as any;
    console.log('Step', step, 'RAW body keys:', Object.keys(body));
    console.log('Step', step, 'RAW body:', JSON.stringify(body, null, 2));

    if (step < 1 || step > 6) {
      return reply.code(400).send({ error: 'Invalid step number' });
    }

    const application = await applicationService.getApplication(id);
    if (!application) {
      return reply.code(404).send({ error: 'Application not found' });
    }

    // Validate step data (lenient)
    let validatedData;
    try {
      validatedData = stepSchemas[step - 1].parse(body);
    } catch (error: any) {
      // Re-render with errors
      return reply.view(stepTemplates[step - 1], {
        application: { ...application, data: { ...application.data, ...body } },
        step,
        csrfToken: request.csrfToken,
        errors: error.errors.reduce((acc: any, err: any) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {}),
      });
    }

    // Save data (use validated data which includes transformations)
    console.log('Step', step, 'validated data:', JSON.stringify(validatedData, null, 2));
    await applicationService.updateApplication(id, validatedData);
    const updated = await applicationService.getApplication(id);
    console.log('After update, data:', JSON.stringify(updated?.data, null, 2));

    // Redirect to next step or review
    if (step < 6) {
      return reply.redirect(`/applications/${id}/step/${step + 1}`);
    } else {
      return reply.redirect(`/applications/${id}/review`);
    }
  });
}
