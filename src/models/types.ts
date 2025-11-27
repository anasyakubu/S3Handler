import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UploadRequest {
  bucketName: string;
  key: string;
  file: Express.Multer.File;
}

export interface DownloadRequest {
  bucketName: string;
  key: string;
}

export interface DeleteObjectsRequest {
  bucketName: string;
  keys: string[];
}

export interface PresignedUrlRequest {
  bucketName: string;
  key: string;
  expiresIn?: number;
}

export interface ListObjectsRequest {
  bucketName: string;
  prefix?: string;
}

export interface BucketRequest {
  bucketName: string;
  force?: boolean;
}

// Custom response type for better TypeScript support
export type CustomResponse = Response<ApiResponse>;