"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/staff/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciales incorrectas');
      }

      const staff = await response.json();
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', staff.email);
        localStorage.setItem('userName', staff.full_name);
        localStorage.setItem('userId', staff.id.toString());
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #EFF6FF, #C7D2FE)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '1rem', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              background: 'linear-gradient(to bottom right, #2563EB, #4F46E5)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>YT</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
              Yari Taft CRM
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
              Sistema de Gestión Académica
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
              <div style={{ 
                backgroundColor: '#FEF2F2', 
                border: '1px solid #FECACA', 
                borderRadius: '0.5rem', 
                padding: '0.75rem' 
              }}>
                <p style={{ fontSize: '0.875rem', color: '#991B1B' }}>{error}</p>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yaritaft.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: loading ? '#93C5FD' : '#2563EB',
                color: 'white',
                borderRadius: '0.5rem',
                fontWeight: '500',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            backgroundColor: '#F9FAFB', 
            borderRadius: '0.5rem' 
          }}>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', textAlign: 'center' }}>
              <strong>Credenciales de prueba:</strong><br />
              Email: admin@yaritaft.com<br />
              Contraseña: admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}