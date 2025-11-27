// app/login/page.tsx
'use client';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl mb-6">Sign in to <span className="font-bold">InfraVision</span></h1>
      <button
        onClick={() => signIn('google')}
        className="bg-blue-600 p-3 text-white rounded-xl mb-2 w-56"
      >
        Sign in with Google
      </button>
      <button
        onClick={() => signIn('email')}
        className="bg-gray-800 p-3 text-white rounded-xl mb-2 w-56"
      >
        Sign in with Email
      </button>
    </div>
  );
}











