import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "@configs/env.config.js";
import { AppError } from "@utils/general.util.js";

const s3Client = new S3Client({
  region: env.AWS_S3_REGION,
  credentials: {
    accessKeyId: env.AWS_S3_KEY,
    secretAccessKey: env.AWS_S3_SECRET_KEY,
  },
});

interface UploadFileInput {
  buffer: Buffer;
  key: string;
  contentType: string;
}

interface UploadFileResult {
  key: string;
}

const uploadFile = async ({
  buffer,
  key,
  contentType,
}: UploadFileInput): Promise<UploadFileResult> => {
  try {
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    return {
      key,
    };
  } catch (error) {
    console.error("S3 upload error:", error);

    throw new AppError(
      "Failed to upload file to storage.",
      502,
      error instanceof Error ? error : undefined,
    );
  }
};

const getSignedUrlForFile = async (key: string): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    return await getSignedUrl(s3Client, command);
  } catch (error) {
    console.error("S3 signed URL error:", error);

    throw new AppError(
      "Failed to generate file download URL.",
      502,
      error instanceof Error ? error : undefined,
    );
  }
};

const deleteFile = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("S3 delete error:", error);

    throw new AppError(
      "Failed to delete file from storage.",
      502,
      error instanceof Error ? error : undefined,
    );
  }
};

const s3Service = {
  uploadFile,
  getSignedUrlForFile,
  deleteFile,
};

export default s3Service;
