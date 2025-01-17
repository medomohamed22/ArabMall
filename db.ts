import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class Database {
private static instance: Database;
private client: MongoClient;
private db: Db | null = null;

private constructor() {
const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGO_HOST, MONGODB_DATABASE_NAME } = process.env;
const uri = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGO_HOST}/${MONGODB_DATABASE_NAME}`;
this.client = new MongoClient(uri);
}

public static getInstance(): Database {
if (!Database.instance) {
Database.instance = new Database();
}
return Database.instance;
}

public async connect(): Promise<void> {
  try {
  await this.client.connect();
  this.db = this.client.db(process.env.MONGODB_DATABASE_NAME);
  console.log('Successfully connected to MongoDB.');
  } catch (error) {
  console.error('Error connecting to MongoDB:', error);
  throw error;
  }
  }

  public getDb(): Db {
  if (!this.db) {
  throw new Error('Database not initialized. Call connect() first.');
  }
  return this.db;
  }
  }

  export default Database;
