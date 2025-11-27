import {
  S3Client,
  CreateBucketCommand,
  ListBucketsCommand,
  DeleteBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  HeadBucketCommand
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { s3Config } from '../utils/config.js';

export class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey
      }
    });
  }

  async createBucket(bucketName: string): Promise<any> {
    try {
      const command = new CreateBucketCommand({ Bucket: bucketName });
      const response = await this.client.send(command);
      return { success: true, message: `Bucket ${bucketName} created`, response };
    } catch (error: any) {
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }

  async listBuckets(): Promise<any> {
    try {
      const command = new ListBucketsCommand({});
      const response = await this.client.send(command);
      return { success: true, buckets: response.Buckets };
    } catch (error: any) {
      throw new Error(`Failed to list buckets: ${error.message}`);
    }
  }

  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucketName }));
      return true;
    } catch {
      return false;
    }
  }

  async uploadFile(
    bucketName: string,
    key: string,
    body: Buffer | Readable,
    contentType?: string
  ): Promise<any> {
    try {
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: bucketName,
          Key: key,
          Body: body,
          ContentType: contentType || 'application/octet-stream'
        }
      });

      const response = await upload.done();
      return {
        success: true,
        message: 'File uploaded successfully',
        bucket: bucketName,
        key: key,
        location: `https://${bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`
      };
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async getFile(bucketName: string, key: string): Promise<any> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      const response = await this.client.send(command);

      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return {
        success: true,
        data: Buffer.concat(chunks),
        contentType: response.ContentType,
        metadata: response.Metadata
      };
    } catch (error: any) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  async getPresignedUrl(bucketName: string, key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error: any) {
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  async listObjects(bucketName: string, prefix?: string): Promise<any> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix
      });
      const response = await this.client.send(command);
      return {
        success: true,
        objects: response.Contents || [],
        count: response.KeyCount
      };
    } catch (error: any) {
      throw new Error(`Failed to list objects: ${error.message}`);
    }
  }

  async deleteObject(bucketName: string, key: string): Promise<any> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      await this.client.send(command);
      return { success: true, message: `Object ${key} deleted` };
    } catch (error: any) {
      throw new Error(`Failed to delete object: ${error.message}`);
    }
  }

  async deleteObjects(bucketName: string, keys: string[]): Promise<any> {
    try {
      const command = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: keys.map(key => ({ Key: key }))
        }
      });
      const response = await this.client.send(command);
      return {
        success: true,
        deleted: response.Deleted,
        errors: response.Errors
      };
    } catch (error: any) {
      throw new Error(`Failed to delete objects: ${error.message}`);
    }
  }

  async emptyBucket(bucketName: string): Promise<any> {
    try {
      const listResponse = await this.listObjects(bucketName);
      const keys = listResponse.objects.map((obj: any) => obj.Key);

      if (keys.length === 0) {
        return { success: true, message: 'Bucket is already empty' };
      }

      await this.deleteObjects(bucketName, keys);
      return { success: true, message: `Deleted ${keys.length} objects` };
    } catch (error: any) {
      throw new Error(`Failed to empty bucket: ${error.message}`);
    }
  }

  async deleteBucket(bucketName: string, force: boolean = false): Promise<any> {
    try {
      if (force) {
        await this.emptyBucket(bucketName);
      }

      const command = new DeleteBucketCommand({ Bucket: bucketName });
      await this.client.send(command);
      return { success: true, message: `Bucket ${bucketName} deleted` };
    } catch (error: any) {
      throw new Error(`Failed to delete bucket: ${error.message}`);
    }
  }
}