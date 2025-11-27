import express from 'express';
import s3Routes from './routes/s3Routes';
import { PORT } from './utils/config.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', s3Routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'S3 Operations API',
    version: '1.0.0',
    endpoints: {
      'GET /api/health': 'Health check',
      'POST /api/buckets/create': 'Create bucket',
      'GET /api/buckets/list': 'List all buckets',
      'POST /api/upload': 'Upload file',
      'GET /api/download': 'Download file',
      'GET /api/presigned-url': 'Get presigned URL',
      'GET /api/objects/list': 'List objects in bucket',
      'DELETE /api/objects/delete': 'Delete single object',
      'DELETE /api/objects/delete-multiple': 'Delete multiple objects',
      'DELETE /api/buckets/empty': 'Empty bucket',
      'DELETE /api/buckets/delete': 'Delete bucket'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`S3 Operations API running on port ${PORT}`);
  console.log(`Base URL: http://localhost:${PORT}/api`);
});

export default app;