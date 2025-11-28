import { Router } from 'express';
import { S3Controller } from '../controllers/s3Controller.js';
import { upload } from '../middleware/upload.js';

const router = Router();
const s3Controller = new S3Controller();

// Health check
router.get('/health', s3Controller.healthCheck);

// Bucket operations
router.post('/buckets/create', s3Controller.createBucket);
router.get('/buckets/list', s3Controller.listBuckets);
router.delete('/buckets/empty', s3Controller.emptyBucket);
router.delete('/buckets/delete', s3Controller.deleteBucket);

// File operations
router.post('/upload', upload.single('file'), s3Controller.uploadFile);
router.get('/download', s3Controller.downloadFile);
router.get('/presigned-url', s3Controller.getPresignedUrl);

// Object operations
router.get('/objects/list', s3Controller.listObjects);
router.delete('/objects/delete', s3Controller.deleteObject);
router.delete('/objects/delete-multiple', s3Controller.deleteMultipleObjects);

export default router;