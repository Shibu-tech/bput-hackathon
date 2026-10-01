require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { uploadBufferToSupabase } = require('../services/supabase.service');

async function migrateLegacy() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const collections = await mongoose.connection.db.listCollections().toArray();
  const hasGridFS = collections.some(c => c.name === 'offerLetters.files');
  if (!hasGridFS) {
    console.log('No legacy GridFS files collection found.');
    process.exit(0);
  }

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'offerLetters' });
  const files = await mongoose.connection.db.collection('offerLetters.files').find({}).toArray();
  console.log(`Found ${files.length} legacy files in GridFS`);

  for (const f of files) {
    try {
      console.log(`Processing ${f.filename} (${f._id})...`);
      const downloadStream = bucket.openDownloadStream(f._id);
      const chunks = [];
      for await (const chunk of downloadStream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const contentType = f.contentType || f.metadata?.contentType || 'application/pdf';

      const uploaded = await uploadBufferToSupabase(f.filename, buffer, contentType);
      console.log(`Uploaded to Supabase: ${uploaded.publicUrl}`);

      const updateResult = await User.updateMany(
        {
          $or: [
            { offerLetterFileId: f._id },
            { offerLetter: `/api/files/${f._id.toString()}` }
          ]
        },
        {
          $set: {
            offerLetter: uploaded.publicUrl,
            offerLetterPath: uploaded.path,
            offerLetterContentType: contentType,
            offerLetterSize: buffer.length,
          }
        }
      );
      console.log(`Updated ${updateResult.modifiedCount} user record(s).`);
    } catch (err) {
      console.error(`Failed to migrate ${f.filename}:`, err.message);
    }
  }

  console.log('Migration completed successfully.');
  process.exit(0);
}

migrateLegacy().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
