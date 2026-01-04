import { FastifyRequest, FastifyReply } from 'fastify';
import config from '../config';

export async function basicAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    reply
      .code(401)
      .header('WWW-Authenticate', 'Basic realm="Admin Area"')
      .send({ error: 'Authentication required' });
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  if (username !== config.admin.username || password !== config.admin.password) {
    reply
      .code(401)
      .header('WWW-Authenticate', 'Basic realm="Admin Area"')
      .send({ error: 'Invalid credentials' });
    return;
  }
}
