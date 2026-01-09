"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GestionPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/gestion/alumnos');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600 mb-3 mx-auto"></div>
        <p className="text-sm text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}