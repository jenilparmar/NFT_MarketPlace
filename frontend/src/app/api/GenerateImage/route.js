import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing required prompt" },
        { status: 400 }
      );
    }

    const res = await fetch(`http://192.168.1.19:8000/generate/${prompt}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body:{}
    });

    if (!res.ok) {
      throw new Error("Failed to generate image");
    }

    const data = await res.json();
       
        
    return NextResponse.json(
      { base64Image: data.image }, // Ensure correct JSON field
      { status: 201 }
    );
  } catch (error) {
    console.error("Error Generating:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
