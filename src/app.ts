import Fastify from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyCookie from '@fastify/cookie';
import fastifyFormbody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import nunjucks from 'nunjucks';
import path from 'path';
import qs from 'qs';
import config from '@config/index';
import { errorHandler } from '@middleware/error-handler';
import { csrfProtection } from '@middleware/csrf';

// Import routes
import { indexRoutes } from '@routes/index';
import { applicationRoutes } from '@routes/applications';
import { stepRoutes } from '@routes/steps';
import { validationRoutes } from '@routes/validation';
import { uploadRoutes } from '@routes/uploads';
import { adminRoutes } from '@routes/admin';
import { partialRoutes } from '@routes/partials';

export const app = Fastify({
  logger: {
    level: config.isDevelopment ? 'debug' : 'info',
    transport: config.isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
});

// Security
app.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
});

// Rate limiting (only in production)
if (!config.isDevelopment) {
  app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '15 minutes',
  });
}

// Cookie support
app.register(fastifyCookie, {
  secret: config.security.sessionSecret,
});

// Body parsing
app.register(fastifyFormbody, {
  parser: (str) => qs.parse(str)
});
app.register(fastifyMultipart, {
  limits: {
    fileSize: config.uploads.maxFileSize,
  },
});

// Static files
// In dev: __dirname is src/, public is ../public
// In prod: __dirname is dist/, public is dist/public (copied by build)
const publicPath = config.isDevelopment 
  ? path.join(__dirname, '../public')
  : path.join(__dirname, 'public');

app.register(fastifyStatic, {
  root: publicPath,
  prefix: '/public/',
});

// View engine (Nunjucks)
// In dev: __dirname is src/, views is src/views
// In prod: __dirname is dist/, views is dist/views (copied by build)
const viewsPath = config.isDevelopment
  ? path.join(__dirname, 'views')
  : path.join(__dirname, 'views');

app.register(fastifyView, {
  engine: {
    nunjucks,
  },
  root: viewsPath,
  options: {
    autoescape: true,
    noCache: config.isDevelopment,
    onConfigure: (env: any) => {
      // Add custom filters
      env.addFilter('currency', (value: any) => {
        if (value === null || value === undefined || value === '') return '';
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(Number(value));
      });

      env.addFilter('date', (value: any) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('en-US');
      });

      env.addFilter('phone', (value: any) => {
        if (!value) return '';
        // Remove all non-digits
        const digits = value.toString().replace(/\D/g, '');
        // Format as (999) 999-9999
        if (digits.length === 10) {
          return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
        return value; // Return as-is if not 10 digits
      });
    },
  },
});

// CSRF protection
app.addHook('preHandler', csrfProtection);

// Error handler
app.setErrorHandler(errorHandler);

// Routes
app.register(indexRoutes);
app.register(applicationRoutes);
app.register(stepRoutes);
app.register(validationRoutes);
app.register(uploadRoutes);
app.register(partialRoutes);
app.register(adminRoutes, { prefix: '/admin' });

export default app;
