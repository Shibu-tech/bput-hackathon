const mongoose = require('mongoose');
const { Readable } = require('stream');

let bucket = null;

/**
 * Get or initialize GridFS Bucket for offer letters and uploaded documents
 */
const getGridFSBucket = () => {
  if (!bucket) {
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error('MongoDB database connection is not active.');
    }
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'offerLetters',
    });
  }
  return bucket;
};

/**
 * Upload Buffer to GridFS
 * @param {string} filename
 * @param {Buffer} buffer
 * @param {string} contentType
 * @param {object} metadata
 * @returns {Promise<{ fileId: string, filename: string, length: number, contentType: string }>}
 */
const uploadBufferToGridFS = (filename, buffer, contentType = 'application/pdf', metadata = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const gridfs = getGridFSBucket();
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      const uploadStream = gridfs.openUploadStream(filename, {
        contentType,
        metadata: {
          ...metadata,
          contentType,
          uploadedAt: new Date(),
        },
      });

      readableStream
        .pipe(uploadStream)
        .on('error', (err) => {
          console.error('GridFS upload stream error:', err);
          reject(err);
        })
        .on('finish', () => {
          resolve({
            fileId: uploadStream.id.toString(),
            filename: uploadStream.filename,
            length: uploadStream.length,
            contentType,
          });
        });
    } catch (err) {
      console.error('Error in uploadBufferToGridFS:', err);
      reject(err);
    }
  });
};

/**
 * Upload Base64 encoded string to GridFS
 * @param {string} filename
 * @param {string} base64String
 * @param {object} metadata
 * @returns {Promise<{ fileId: string, filename: string, length: number, contentType: string }>}
 */
const uploadBase64ToGridFS = async (filename, base64String, metadata = {}) => {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('Invalid or empty base64 string provided for GridFS upload.');
  }

  let contentType = 'application/pdf';
  let rawBase64 = base64String;

  // Extract content-type if data URI format (e.g. data:application/pdf;base64,...)
  const matches = base64String.match(/^data:([a-zA-Z0-9-+/]+);base64,(.+)$/);
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
  return uploadBufferToGridFS(filename, buffer, contentType, metadata);
};

/**
 * Open download/read stream for file stored in GridFS
 * @param {string} fileId
 */
const openDownloadStream = (fileId) => {
  const gridfs = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  return gridfs.openDownloadStream(objectId);
};

/**
 * Retrieve metadata of a file stored in GridFS
 * @param {string} fileId
 * @returns {Promise<object|null>}
 */
const getFileMetadata = async (fileId) => {
  const gridfs = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  const files = await gridfs.find({ _id: objectId }).toArray();
  return files.length > 0 ? files[0] : null;
};

/**
 * Delete a file from GridFS
 * @param {string} fileId
 */
const deleteFileFromGridFS = async (fileId) => {
  const gridfs = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  return gridfs.delete(objectId);
};

module.exports = {
  getGridFSBucket,
  uploadBufferToGridFS,
  uploadBase64ToGridFS,
  openDownloadStream,
  getFileMetadata,
  deleteFileFromGridFS,
};
