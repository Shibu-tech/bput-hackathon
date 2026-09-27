const mongoose = require('mongoose');

const defaultLocalUri = 'mongodb://127.0.0.1:27017/fretbox';

const getMongoUri = () => {
  const configuredUri = process.env.MONGODB_URI;
  return configuredUri && configuredUri.trim() ? configuredUri.trim() : defaultLocalUri;
};

const connectDB = async () => {
  const primaryUri = getMongoUri();

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const fallbackUri = defaultLocalUri;
    console.warn(`Primary MongoDB connection failed (${primaryUri}): ${error.message}. Retrying with fallback ${fallbackUri}`);

    try {
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });

      console.log(`MongoDB Connected via fallback: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error(`Fallback MongoDB connection failed (${fallbackUri}): ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;