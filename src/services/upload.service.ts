import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import config from '@config/index';

const prisma = new PrismaClient();

export type UploadCategory = 'PAYSTUB_W2' | 'ID' | 'OTHER';

export interface UploadData {
  id: string;
  applicationId: string;
  filename: string;
  mimeType: string;
  size: number;
  category: UploadCategory;
  storagePath: string;
  uploadedAt: Date;
}

export async function saveUpload(
  applicationId: string,
  filename: string,
  mimeType: string,
  size: number,
  category: UploadCategory,
  fileData: NodeJS.ReadableStream
): Promise<UploadData> {
  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(config.uploads.dir, applicationId);
  await fs.mkdir(uploadDir, { recursive: true });

  // Generate safe filename
  const timestamp = Date.now();
  const safeFilename = `${timestamp}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storagePath = path.join(uploadDir, safeFilename);

  // Write file
  const writeStream = (await import('fs')).createWriteStream(storagePath);
  await pipeline(fileData, writeStream);

  // Save metadata to database
  const upload = await prisma.upload.create({
    data: {
      applicationId,
      filename,
      mimeType,
      size,
      category,
      storagePath,
    },
  });

  return upload as UploadData;
}

export async function getUploadsByApplication(applicationId: string): Promise<UploadData[]> {
  const uploads = await prisma.upload.findMany({
    where: { applicationId },
    orderBy: { uploadedAt: 'desc' },
  });
  return uploads as UploadData[];
}

export async function deleteUpload(id: string): Promise<void> {
  const upload = await prisma.upload.findUnique({ where: { id } });
  if (!upload) {
    throw new Error('Upload not found');
  }

  // Delete file from filesystem
  try {
    await fs.unlink(upload.storagePath);
  } catch (error) {
    // File may not exist, continue
  }

  // Delete from database
  await prisma.upload.delete({ where: { id } });
}
