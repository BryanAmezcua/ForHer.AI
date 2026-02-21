import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export default clientPromise;
