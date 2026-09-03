import { MongoClient, ServerApiVersion } from "mongodb";

const uri: string = process.env.MONGODB_URI as string;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const clientPromise = client.connect();

export default clientPromise;
