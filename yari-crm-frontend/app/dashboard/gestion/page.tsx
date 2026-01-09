"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GestionPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/gestion/alumnos');
  }, [router]);

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid #D1D5DB',
          borderTopColor: '#2563EB',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 12px'
        }}></div>
        <p style={{ fontSize: '14px', color: '#4B5563' }}>Redirigiendo...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
