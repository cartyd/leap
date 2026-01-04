import { FastifyInstance } from 'fastify';
import * as uploadService from '../services/upload.service';
import type { UploadCategory } from '../services/upload.service';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/applications/:id/uploads', async (request, reply) => {
    const { id } = request.params as { id: string };

    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
      return reply.code(400).send({ error: 'Invalid file type' });
    }

    // Get category from form fields
    const category = (data.fields.category as any)?.value || 'OTHER';

    try {
      const upload = await uploadService.saveUpload(
        id,
        data.filename,
        data.mimetype,
        0, // Size will be calculated during stream
        category as UploadCategory,
        data.file
      );

      return reply.send({
        success: true,
        upload: {
          id: upload.id,
          filename: upload.filename,
          size: upload.size,
        },
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to upload file' });
    }
  });

  app.delete('/uploads/:uploadId', async (request, reply) => {
    const { uploadId } = request.params as { uploadId: string };

    try {
      await uploadService.deleteUpload(uploadId);
      return reply.send({ success: true });
    } catch (error: any) {
      return reply.code(404).send({ error: 'Upload not found' });
    }
  });
}
