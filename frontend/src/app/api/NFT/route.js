import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const db = await connectDB();
    const nftCollection = db.collection("nfts");

    const { userMetaMaskId, name, price, } = await req.json();

    if (!userMetaMaskId || !name || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await nftCollection.updateOne(
      { userMetaMaskId }, // Find by MetaMask ID
      { $push: { nfts: { name, price } } }, // Append new NFT
      { upsert: true } // Insert if user doesn't exist
    );

    return NextResponse.json({ message: "NFT added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error saving NFT:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
