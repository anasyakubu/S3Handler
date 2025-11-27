import { Request, Response } from 'express';
import { S3Service } from '../services/s3Service.js';
import { ApiResponse, CustomResponse } from '../models/types.js';

const s3Service = new S3Service();

export class S3Controller {
  async healthCheck(req: Request, res: CustomResponse) {
    res.json({
      success: true,
      message: 'S3 API is running',
      data: { status: 'OK' }
    });
  }

  async createBucket(req: Request, res: CustomResponse) {
    try {
      const { bucketName } = req.body;
      if (!bucketName) {
        return res.status(400).json({
          success: false,
          error: 'bucketName is required'
        });
      }
      const result = await s3Service.createBucket(bucketName);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async listBuckets(req: Request, res: CustomResponse) {
    try {
      const result = await s3Service.listBuckets();
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async uploadFile(req: Request, res: CustomResponse) {
    try {
      const { bucketName, key } = req.body;

      if (!bucketName || !key || !req.file) {
        return res.status(400).json({
          success: false,
          error: 'bucketName, key, and file are required'
        });
      }

      const result = await s3Service.uploadFile(
        bucketName,
        key,
        req.file.buffer,
        req.file.mimetype
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async downloadFile(req: Request, res: Response) {
    try {
      const { bucketName, key } = req.query;

      if (!bucketName || !key) {
        return res.status(400).json({
          success: false,
          error: 'bucketName and key are required'
        });
      }

      const result = await s3Service.getFile(bucketName as string, key as string);
      res.setHeader('Content-Type', result.contentType);
      res.send(result.data);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getPresignedUrl(req: Request, res: CustomResponse) {
    try {
      const { bucketName, key, expiresIn } = req.query;

      if (!bucketName || !key) {
        return res.status(400).json({
          success: false,
          error: 'bucketName and key are required'
        });
      }

      const url = await s3Service.getPresignedUrl(
        bucketName as string,
        key as string,
        expiresIn ? parseInt(expiresIn as string) : 3600
      );
      res.json({ success: true, data: { url } });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async listObjects(req: Request, res: CustomResponse) {
    try {
      const { bucketName, prefix } = req.query;

      if (!bucketName) {
        return res.status(400).json({
          success: false,
          error: 'bucketName is required'
        });
      }

      const result = await s3Service.listObjects(
        bucketName as string,
        prefix as string
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteObject(req: Request, res: CustomResponse) {
    try {
      const { bucketName, key } = req.body;

      if (!bucketName || !key) {
        return res.status(400).json({
          success: false,
          error: 'bucketName and key are required'
        });
      }

      const result = await s3Service.deleteObject(bucketName, key);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteMultipleObjects(req: Request, res: CustomResponse) {
    try {
      const { bucketName, keys } = req.body;

      if (!bucketName || !keys || !Array.isArray(keys)) {
        return res.status(400).json({
          success: false,
          error: 'bucketName and keys array are required'
        });
      }

      const result = await s3Service.deleteObjects(bucketName, keys);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async emptyBucket(req: Request, res: CustomResponse) {
    try {
      const { bucketName } = req.body;

      if (!bucketName) {
        return res.status(400).json({
          success: false,
          error: 'bucketName is required'
        });
      }

      const result = await s3Service.emptyBucket(bucketName);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteBucket(req: Request, res: CustomResponse) {
    try {
      const { bucketName, force } = req.body;

      if (!bucketName) {
        return res.status(400).json({
          success: false,
          error: 'bucketName is required'
        });
      }

      const result = await s3Service.deleteBucket(bucketName, force || false);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}