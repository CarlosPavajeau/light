import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { env } from "@light/env/server"

const client = new S3Client({
  region: env.AWS_REGION,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: env.AWS_REGION },
    identityPoolId: env.AWS_IDENTITY_POOL_ID ?? "",
  }),
})
export const S3 = client

export type PresignedUrlInput = {
  bucket: string
  key: string
}

export function createUploadPresignedUrl(input: PresignedUrlInput) {
  const { bucket, key } = input
  const command = new PutObjectCommand({ Bucket: bucket, Key: key })

  return getSignedUrl(client, command, { expiresIn: 3600 })
}

export function createDownloadPresignedUrl(input: PresignedUrlInput) {
  const { bucket, key } = input
  const command = new GetObjectCommand({ Bucket: bucket, Key: key })

  return getSignedUrl(client, command, { expiresIn: 3600 })
}
