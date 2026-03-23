#!/usr/bin/env node
import { program } from "commander";
import { deployToAWS } from "./index";

program
  .name("aws-s3-deployer")
  .description("Deploy a folder to S3 and invalidate CloudFront using modern AWS OIDC credentials.")
  .requiredOption("-f, --folder <path>", "Directory to deploy (e.g., dist/playground-1)")
  .option(
    "-b, --bucket <name>",
    "AWS S3 Bucket name (optional - falls back to AWS_S3_DEPLOY_BUCKET environment variable)",
  )
  .option(
    "-r, --region <region>",
    "AWS Region (e.g., eu-central-1) (optional - falls back to AWS_S3_DEPLOY_REGION environment variable)",
  )
  .option(
    "-c, --cloudfront-id <id>",
    "CloudFront Distribution ID to invalidate (optional - falls back to AWS_S3_DEPLOY_CF_DISTRIBUTION_ID environment variable)",
  )
  .option("-p, --profile <profile>", "AWS Profile to use (Great for OIDC CircleCI profiles)");

program.parse();
const options = program.opts();

deployToAWS({
  folder: options.folder,
  bucket: options.bucket,
  region: options.region,
  profile: options.profile,
  cloudfrontId: options.cloudfrontId,
}).catch((err) => {
  console.error("❌ Deployment Failed:", err);
  process.exit(1);
});
