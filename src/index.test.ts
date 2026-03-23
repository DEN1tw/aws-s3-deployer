import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "path";
import os from "os";
import fs from "fs";

// ---------------------------------------------------------------------------
// Mock AWS SDK clients before importing the module under test
// ---------------------------------------------------------------------------
const mockS3Send = vi.fn().mockResolvedValue({});
const mockCfSend = vi.fn().mockResolvedValue({});

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(function () {
    return { send: mockS3Send };
  }),
  PutObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/client-cloudfront", () => ({
  CloudFrontClient: vi.fn(function () {
    return { send: mockCfSend };
  }),
  CreateInvalidationCommand: vi.fn(),
}));

vi.mock("@aws-sdk/credential-providers", () => ({
  fromNodeProviderChain: vi.fn(() => "mock-credentials"),
}));

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { deployToAWS } from "./index";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeTmpDir(...files: Array<{ name: string; content: string }>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aws-s3-deployer-test-"));
  for (const { name, content } of files) {
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("deployToAWS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads each file in the folder to S3", async () => {
    const dir = makeTmpDir(
      { name: "index.html", content: "<h1>Hello</h1>" },
      { name: "app.js", content: "console.log('hi')" },
    );

    await deployToAWS({ folder: dir, bucket: "my-bucket", region: "us-east-1" });

    expect(mockS3Send).toHaveBeenCalledTimes(2);
    expect(PutObjectCommand).toHaveBeenCalledWith(expect.objectContaining({ Key: "app.js" }));
    expect(PutObjectCommand).toHaveBeenCalledWith(expect.objectContaining({ Key: "index.html" }));
  });

  it("sets correct Content-Type for known MIME types", async () => {
    const dir = makeTmpDir({ name: "style.css", content: "body{}" });

    await deployToAWS({ folder: dir, bucket: "my-bucket", region: "us-east-1" });

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({ ContentType: "text/css" }),
    );
  });

  it("falls back to application/octet-stream for unknown extensions", async () => {
    const dir = makeTmpDir({ name: "data.bin2", content: "binary" });

    await deployToAWS({ folder: dir, bucket: "my-bucket", region: "us-east-1" });

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({ ContentType: "application/octet-stream" }),
    );
  });

  it("throws when the folder is empty", async () => {
    const dir = makeTmpDir(); // no files

    await expect(
      deployToAWS({ folder: dir, bucket: "my-bucket", region: "us-east-1" }),
    ).rejects.toThrow(`No files found in ${dir}`);
  });

  it("triggers CloudFront invalidation when cloudfrontId is provided", async () => {
    const dir = makeTmpDir({ name: "index.html", content: "<h1>Hi</h1>" });

    await deployToAWS({
      folder: dir,
      bucket: "my-bucket",
      region: "us-east-1",
      cloudfrontId: "DISTRIBUTION123",
    });

    expect(mockCfSend).toHaveBeenCalledTimes(1);
    expect(CreateInvalidationCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        DistributionId: "DISTRIBUTION123",
        InvalidationBatch: expect.objectContaining({
          Paths: expect.objectContaining({ Items: ["/*"] }),
        }),
      }),
    );
  });

  it("uses environment variables when flags are omitted", async () => {
    const dir = makeTmpDir({ name: "index.html", content: "<h1>Hi</h1>" });

    // set env vars to be used as fallbacks
    process.env.AWS_S3_DEPLOY_BUCKET = "env-bucket";
    process.env.AWS_S3_DEPLOY_REGION = "env-region-1";
    process.env.AWS_S3_DEPLOY_CF_DISTRIBUTION_ID = "ENV-DIST-1";

    await deployToAWS({ folder: dir });

    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(CreateInvalidationCommand).toHaveBeenCalledWith(
      expect.objectContaining({ DistributionId: "ENV-DIST-1" }),
    );

    // cleanup env
    delete process.env.AWS_S3_DEPLOY_BUCKET;
    delete process.env.AWS_S3_DEPLOY_REGION;
    delete process.env.AWS_S3_DEPLOY_CF_DISTRIBUTION_ID;
  });

  it("does NOT call CloudFront when cloudfrontId is omitted", async () => {
    const dir = makeTmpDir({ name: "index.html", content: "<h1>Hi</h1>" });

    await deployToAWS({ folder: dir, bucket: "my-bucket", region: "us-east-1" });

    expect(mockCfSend).not.toHaveBeenCalled();
  });
});
