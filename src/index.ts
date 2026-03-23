import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import * as fs from "fs";
import * as path from "path";
import fg from "fast-glob";
import mime from "mime-types";

export type DeployOptions = {
  folder: string;
  bucket?: string;
  region?: string;
  profile?: string;
  cloudfrontId?: string;
};

export async function deployToAWS({
  folder,
  bucket,
  region,
  profile,
  cloudfrontId,
}: DeployOptions) {
  const effectiveBucket = bucket || process.env.AWS_S3_DEPLOY_BUCKET;
  const effectiveRegion = region || process.env.AWS_S3_DEPLOY_REGION;
  const effectiveCloudfrontId = cloudfrontId || process.env.AWS_S3_DEPLOY_CF_DISTRIBUTION_ID;

  if (!effectiveBucket) {
    throw new Error(
      "Missing S3 bucket. Provide --bucket or set AWS_S3_DEPLOY_BUCKET environment variable.",
    );
  }
  if (!effectiveRegion) {
    throw new Error(
      "Missing AWS region. Provide --region or set AWS_S3_DEPLOY_REGION environment variable.",
    );
  }

  console.log(`🚀 Starting deployment to Bucket: ${effectiveBucket} in ${effectiveRegion}`);

  const credentials = fromNodeProviderChain({ profile });
  const s3 = new S3Client({ region: effectiveRegion, credentials });

  const files = await fg("**/*", { cwd: folder, absolute: true, dot: true, onlyFiles: true });

  if (files.length === 0) {
    throw new Error(`No files found in ${folder}`);
  }

  for (const file of files) {
    const fileContent = fs.readFileSync(file);
    const objectKey = path.relative(folder, file).split(path.sep).join("/");
    const mimeType = (mime.lookup(file) as string) || "application/octet-stream";
    console.log(`📤 Uploading: ${objectKey}`);
    await s3.send(
      new PutObjectCommand({
        Bucket: effectiveBucket,
        Key: objectKey,
        Body: fileContent,
        ContentType: mimeType,
      }),
    );
  }

  console.log("✅ S3 Upload Complete!");

  if (effectiveCloudfrontId) {
    console.log(`🔄 Invalidating CloudFront distribution: ${effectiveCloudfrontId}`);
    const cf = new CloudFrontClient({ region: effectiveRegion, credentials });
    const callerReference = `deploy-${Date.now()}`;
    await cf.send(
      new CreateInvalidationCommand({
        DistributionId: effectiveCloudfrontId,
        InvalidationBatch: {
          CallerReference: callerReference,
          Paths: {
            Quantity: 1,
            Items: ["/*"],
          },
        },
      }),
    );
    console.log("✅ CloudFront Invalidation Triggered!");
  }
}
