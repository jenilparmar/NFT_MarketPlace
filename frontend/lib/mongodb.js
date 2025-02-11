import { MongoClient } from "mongodb";

const MONGO_URI = process.env.NEXT_PUBLIC_MONGO_URI;
const client = new MongoClient(MONGO_URI);

export async function connectDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    console.log("✅ Connected to MongoDB");
  }
  return client.db("nftDB"); // Replace with your database name
}
