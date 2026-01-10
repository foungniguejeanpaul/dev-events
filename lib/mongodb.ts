import mongoose, { Mongoose } from "mongoose";

/**
 * Shape of the cached connection object that we store on `globalThis`.
 * This avoids creating multiple Mongoose connections in development
 * when Next.js hot-reloads the server.
 */
interface MongooseGlobalCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Augment the global scope type so TypeScript knows about `global.mongoose`.
 * In a server-only context, this is safe and keeps the cache strongly typed.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseGlobalCache | undefined;
}

// Reuse the existing cache if it exists, otherwise create a new one.
const globalCache: MongooseGlobalCache = global.mongoose ?? {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = globalCache;
}

/**
 * MongoDB connection URI.
 *
 * Keep secrets out of the source code. Configure `MONGODB_URI` in your
 * environment (e.g. `.env.local` for Next.js).
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in your environment (e.g. .env.local)."
  );
}

/**
 * Establishes (or reuses) a Mongoose connection.
 *
 * This function can safely be called in any server-side code (API routes,
 * route handlers, server components, etc.). It will:
 * - Use a cached connection in development to prevent connection storms.
 * - Create a new connection only if needed.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // If we already have an active connection, reuse it.
  if (globalCache.conn) {
    return globalCache.conn;
  }

  // If a connection is already being established, wait for it.
  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    globalCache.conn = await globalCache.promise;
  } catch (error) {
    // Reset the cache on error so future calls can retry.
    globalCache.promise = null;
    throw error;
  }

  return globalCache.conn;
}
