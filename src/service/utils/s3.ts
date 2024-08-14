import { S3Client } from "@aws-sdk/client-s3";

const bucketRegion = process.env.S3_BUCKET_REGION || "";
const accessKey = process.env.IAM_ACCESS_KEY || "";
const secret = process.env.IAM_SECRET || "";

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secret,
  },
  region: bucketRegion,
});

export { s3 };