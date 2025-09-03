import { NextResponse } from "next/server";
import OpenAI from "openai";


// Response generation using OpenAI API had to be moved to server side due to CORS issues.

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generate_response(messages: any) {
  return await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const completion = await generate_response(messages);
  return NextResponse.json(completion);
}