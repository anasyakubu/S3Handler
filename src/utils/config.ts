import * as dotenv from 'dotenv';

dotenv.config();

export interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export const s3Config: S3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET_KEY'
};

export const PORT = process.env.PORT || 3000;