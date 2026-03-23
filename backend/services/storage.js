/**
 * api/services/storage.js
 * ─────────────────────────────────────────────────────────────
 * Generates presigned upload URLs for S3-compatible storage.
 * Works with AWS S3, Cloudflare R2, Supabase Storage, MinIO.
 *
 * To use:
 *   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *
 * Flow:
 *   1. Frontend asks for presigned URL:  POST /api/gallery/presign
 *   2. Backend returns { uploadUrl, publicUrl, key }
 *   3. Frontend PUTs file directly to uploadUrl (no server roundtrip)
 *   4. Frontend saves metadata: POST /api/gallery { url: publicUrl, ... }
 * ─────────────────────────────────────────────────────────────
 */

// Uncomment once @aws-sdk packages are installed:
//
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
//
// const s3 = new S3Client({
//   region:   process.env.STORAGE_REGION || 'auto',
//   endpoint: process.env.STORAGE_ENDPOINT,         // For R2: https://<account>.r2.cloudflarestorage.com
//   credentials: {
//     accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });
//
// const BUCKET  = process.env.STORAGE_BUCKET;
// const CDN_URL = process.env.STORAGE_CDN_URL;      // e.g. https://cdn.rangeenpixels.club

/**
 * Generate a presigned PUT URL for a photo upload.
 * @param {string} filename   — original filename
 * @param {string} mimeType   — e.g. 'image/jpeg'
 * @param {string} memberId   — uploader's member UUID
 * @returns {{ key, uploadUrl, publicUrl }}
 */
export async function getPresignedUploadUrl(filename, mimeType, memberId) {
  // Stub — replace with real implementation once AWS SDK is installed
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error(
      'Storage not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, ' +
      'STORAGE_BUCKET, and STORAGE_ENDPOINT in .env'
    );
  }

  // --- Real implementation (uncomment after installing @aws-sdk) ---
  // const ext  = filename.split('.').pop().toLowerCase();
  // const key  = `photos/${memberId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  // const cmd  = new PutObjectCommand({
  //   Bucket:      BUCKET,
  //   Key:         key,
  //   ContentType: mimeType,
  //   ACL:         'public-read',
  // });
  // const uploadUrl  = await getSignedUrl(s3, cmd, { expiresIn: 300 }); // 5 min
  // const publicUrl  = `${CDN_URL}/${key}`;
  // return { key, uploadUrl, publicUrl };
}

/**
 * Delete a photo from storage.
 * @param {string} key — storage key from getPresignedUploadUrl
 */
export async function deletePhoto(key) {
  if (!process.env.AWS_ACCESS_KEY_ID) return;
  // const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  // await s3.send(cmd);
}

/**
 * Validate that an uploaded file is an allowed image type and within size limits.
 * Use this on the presign request before issuing a URL.
 */
export function validatePhotoUpload(mimeType, sizeBytes) {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
  const MAX_SIZE_MB   = 20;

  if (!ALLOWED_TYPES.includes(mimeType)) {
    return { valid: false, error: `File type ${mimeType} not allowed. Use JPEG, PNG, WebP or TIFF.` };
  }
  if (sizeBytes > MAX_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_SIZE_MB}MB.` };
  }
  return { valid: true };
}
