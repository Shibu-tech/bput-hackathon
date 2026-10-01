const { createClient } = require('@supabase/supabase-js');

let supabaseClient = null;
let bucketInitialized = false;

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';
  const bucket = process.env.SUPABASE_BUCKET || 'documents';

  const isConfigured = Boolean(
    url &&
    key &&
    !url.includes('your-project-id') &&
    !key.includes('your-supabase-')
  );

  return { url, key, bucket, isConfigured };
};

/**
 * Get or initialize the Supabase client
 */
const getSupabaseClient = () => {
  const { url, key, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
};

/**
 * Ensure storage bucket exists and is public
 */
const ensureBucketExists = async (bucketName) => {
  if (bucketInitialized) return true;
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { data: buckets, error: listError } = await client.storage.listBuckets();
    if (listError) {
      console.warn('Supabase listBuckets notice:', listError.message);
      return false;
    }

    const exists = buckets && buckets.some((b) => b.name === bucketName);
    if (!exists) {
      const { error: createError } = await client.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });
      if (createError) {
        console.warn(`Supabase createBucket (${bucketName}) notice:`, createError.message);
      } else {
        console.log(`Supabase Storage bucket "${bucketName}" created successfully.`);
      }
    }
    bucketInitialized = true;
    return true;
  } catch (err) {
    console.warn('Supabase bucket check warning:', err.message);
    return false;
  }
};

/**
 * Upload a binary Buffer to Supabase Storage
 * @param {string} filename - Original or preferred filename
 * @param {Buffer} buffer - File buffer
 * @param {string} contentType - MIME type (e.g. application/pdf, image/png)
 * @param {string} folder - Folder inside bucket
 * @returns {Promise<{ url: string, publicUrl: string, path: string, filename: string, size: number, contentType: string }>}
 */
const uploadBufferToSupabase = async (
  filename,
  buffer,
  contentType = 'application/pdf',
  folder = 'offer-letters'
) => {
  const { bucket, isConfigured } = getSupabaseConfig();
  const client = getSupabaseClient();

  if (!isConfigured || !client) {
    throw new Error(
      'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY) in server/.env'
    );
  }

  await ensureBucketExists(bucket);

  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniquePrefix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const filePath = `${folder}/${uniquePrefix}_${cleanName}`;

  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    throw new Error(`Failed to upload file to Supabase: ${uploadError.message}`);
  }

  const { data: publicUrlData } = client.storage
    .from(bucket)
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl || '';

  return {
    url: publicUrl,
    publicUrl,
    path: filePath,
    filename: cleanName,
    size: buffer.length,
    contentType,
  };
};

/**
 * Upload Base64 encoded string to Supabase Storage
 * @param {string} filename
 * @param {string} base64String
 * @param {object} metadata
 * @param {string} folder
 * @returns {Promise<{ url: string, publicUrl: string, path: string, filename: string, size: number, contentType: string }>}
 */
const uploadBase64ToSupabase = async (filename, base64String, metadata = {}, folder = 'offer-letters') => {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('Invalid or empty base64 string provided for upload.');
  }

  let contentType = 'application/pdf';
  let rawBase64 = base64String;

  // Extract content-type if data URI format (e.g. data:application/pdf;base64,...)
  const matches = base64String.match(/^data:([a-zA-Z0-9-+/.]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    contentType = matches[1];
    rawBase64 = matches[2];
  } else if (base64String.startsWith('data:image/')) {
    const commaIndex = base64String.indexOf(',');
    if (commaIndex !== -1) {
      contentType = base64String.substring(5, commaIndex.split(';')[0]);
      rawBase64 = base64String.substring(commaIndex + 1);
    }
  }

  const buffer = Buffer.from(rawBase64, 'base64');
  return uploadBufferToSupabase(filename, buffer, contentType, folder);
};

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - Path within bucket
 */
const deleteFileFromSupabase = async (filePath) => {
  const { bucket, isConfigured } = getSupabaseConfig();
  const client = getSupabaseClient();
  if (!isConfigured || !client || !filePath) return;

  try {
    await client.storage.from(bucket).remove([filePath]);
  } catch (err) {
    console.warn(`Supabase delete error for ${filePath}:`, err.message);
  }
};

module.exports = {
  getSupabaseConfig,
  getSupabaseClient,
  uploadBufferToSupabase,
  uploadBase64ToSupabase,
  deleteFileFromSupabase,
};
