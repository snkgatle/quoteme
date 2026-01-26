import fs from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';

// Interface for storage provider
interface StorageProvider {
  uploadFile(file: Express.Multer.File): Promise<string>;
}

// Local storage implementation (for dev/test)
class LocalStorage implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    // Sanitize filename
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitizedOriginalName}`;
    const filepath = path.join(this.uploadDir, filename);

    if (file.buffer) {
        await fs.promises.writeFile(filepath, file.buffer);
    } else if (file.path) {
        await fs.promises.rename(file.path, filepath);
    } else {
        throw new Error('No file content found');
    }

    return `/uploads/${filename}`;
  }
}

// Google Cloud Storage Implementation
class GoogleCloudStorage implements StorageProvider {
    private storage: Storage;
    private bucketName: string;

    constructor() {
        this.storage = new Storage();
        // Fallback or throw error? For now fallback to default name but likely env var is required.
        this.bucketName = process.env.GCS_BUCKET_NAME || 'quoteme-certifications';
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const bucket = this.storage.bucket(this.bucketName);
        const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}-${sanitizedOriginalName}`;
        const blob = bucket.file(filename);

        return new Promise((resolve, reject) => {
            const blobStream = blob.createWriteStream({
                resumable: false,
                metadata: {
                    contentType: file.mimetype,
                },
            });

            blobStream.on('error', (err) => {
                reject(err);
            });

            blobStream.on('finish', () => {
                // Returning the GS URI as it's a private bucket
                resolve(`gs://${this.bucketName}/${filename}`);
            });

            if (file.buffer) {
                blobStream.end(file.buffer);
            } else {
                 reject(new Error('File buffer is missing'));
            }
        });
    }
}

// Select provider based on environment
const storageProvider = process.env.GCS_BUCKET_NAME
    ? new GoogleCloudStorage()
    : new LocalStorage();

export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
    return storageProvider.uploadFile(file);
};
