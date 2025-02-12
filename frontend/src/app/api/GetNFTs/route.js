import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";

export async function GET() {
  try {
    const db = await connectDB();
    const nftCollection = db.collection("nfts");

    // Fetch all NFTs from the database
    const nfts = await nftCollection.find().toArray();

    return NextResponse.json({ nfts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
