// app/api/upload/signed-url/route.ts
import { createSignedUploadUrl } from '@/lib/s3';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { filename, contentType } = await req.json();
  if (!filename || !contentType) {
    return new Response(JSON.stringify({ error: 'filename and contentType required' }), { status: 400 });
  }
  const key = `datasets/${filename}`;
  const url = await createSignedUploadUrl(key, contentType);
  return new Response(JSON.stringify({ url, key }), { status: 200 });
}











