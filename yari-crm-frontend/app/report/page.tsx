"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function ReportPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [studentName, setStudentName] = useState('');

  const [formData, setFormData] = useState({
    procesos_activos: 0,
    entrevistas_rrhh: 0,
    entrevistas_tecnicas: 0,
    challenges: 0,
    rechazos: 0,
    ghosting: 0,
    propuestas: 0,
    resumen: '',
    bloqueos: '',
  });

  useEffect(() => {
    if (!token) {
      setError('Token no válido');
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/magic-links/validate?token=${token}`);
      if (response.data.valid && response.data.student) {
        setStudentName(response.data.student.full_name);
        setLoading(false);
      } else {
        setError(response.data.message || 'El link ha expirado o no es válido');
        setLoading(false);
      }
    } catch (err: any) {
      setError('El link ha expirado o no es válido');
      setLoading(false);
    }
  };

  const handleIncrement = (field: string) => {
    setFormData({ ...formData, [field]: (formData[field as keyof typeof formData] as number) + 1 });
  };

  const handleDecrement = (field: string) => {
    const currentValue = formData[field as keyof typeof formData];
    if (typeof currentValue === 'number' && currentValue > 0) {
      setFormData({ ...formData, [field]: currentValue - 1 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('http://localhost:3000/weekly-reports', {
        token,
        answers: formData,
      });
      setSuccess(true);
    } catch (err: any) {
      setError('Error al enviar el reporte. Por favor, intenta nuevamente.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #F9FAFB, #F3F4F6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E7EB',
            borderTopColor: '#2563EB',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#4B5563' }}>Validando acceso...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #F9FAFB, #F3F4F6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{
          maxWidth: '448px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#FEE2E2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg style={{ width: '32px', height: '32px', color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', marginTop: 0 }}>
            Error
          </h1>
          <p style={{ color: '#4B5563', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #F9FAFB, #F3F4F6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{
          maxWidth: '448px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#D1FAE5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg style={{ width: '32px', height: '32px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', marginTop: 0 }}>
            ¡Reporte Enviado!
          </h1>
          <p style={{ color: '#4B5563', margin: 0 }}>
            Gracias por completar tu reporte semanal. Tu información ha sido registrada correctamente.
          </p>
        </div>
      </div>
    );
  }

  const metrics = [
    { key: 'procesos_activos', label: 'Procesos Activos', icon: 'target' },
    { key: 'entrevistas_rrhh', label: 'Entrevistas RRHH', icon: 'users' },
    { key: 'entrevistas_tecnicas', label: 'Entrevistas Técnicas', icon: 'laptop' },
    { key: 'challenges', label: 'Challenges', icon: 'puzzle' },
    { key: 'rechazos', label: 'Rechazos', icon: 'x' },
    { key: 'ghosting', label: 'Ghosting', icon: 'clock' },
    { key: 'propuestas', label: 'Propuestas/Ofertas', icon: 'check' },
  ];

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactElement } = {
      target: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
      users: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      laptop: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="14" rx="2" ry="2" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      ),
      puzzle: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19.439 7.85c-.15.28-.33.54-.51.78l-1.5 1.5a2 2 0 0 1-2.83 0l-1.5-1.5a2 2 0 0 1 0-2.83l1.5-1.5c.24-.18.5-.36.78-.51.28-.15.58-.27.89-.35.31-.08.63-.12.95-.12.32 0 .64.04.95.12.31.08.61.2.89.35.28.15.54.33.78.51l1.5 1.5a2 2 0 0 1 0 2.83l-1.5 1.5c-.18.24-.36.5-.51.78-.15.28-.27.58-.35.89-.08.31-.12.63-.12.95 0 .32.04.64.12.95.08.31.2.61.35.89.15.28.33.54.51.78l1.5 1.5a2 2 0 0 1 0 2.83l-1.5 1.5a2 2 0 0 1-2.83 0l-1.5-1.5c-.24.18-.5.36-.78.51-.28.15-.58.27-.89.35-.31.08-.63.12-.95.12-.32 0-.64-.04-.95-.12-.31-.08-.61-.2-.89-.35-.28-.15-.54-.33-.78-.51l-1.5-1.5a2 2 0 0 1 0-2.83l1.5-1.5c.18-.24.36-.5.51-.78.15-.28.27-.58.35-.89.08-.31.12-.63.12-.95 0-.32-.04-.64-.12-.95-.08-.31-.2-.61-.35-.89z" />
        </svg>
      ),
      x: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
      clock: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      check: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    };
    return icons[iconName] || icons.target;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #F9FAFB, #F3F4F6)',
      padding: '48px 16px'
    }}>
      <div style={{ maxWidth: '768px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(to right, #2563EB, #4F46E5)',
            padding: '32px',
            color: 'white'
          }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px', marginTop: 0 }}>
              Reporte Semanal
            </h1>
            <p style={{ color: '#BFDBFE', margin: 0 }}>
              Hola {studentName}, completa tu reporte de la semana
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
            {/* Métricas numéricas */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px', marginTop: 0 }}>
                Actividad de la Semana
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {metrics.map((metric) => (
                  <div key={metric.key} style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB',
                        flexShrink: 0
                      }}>
                        {getIcon(metric.icon)}
                      </div>
                      <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {metric.label}
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => handleDecrement(metric.key)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          border: '2px solid #E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4B5563',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#2563EB';
                          e.currentTarget.style.backgroundColor = '#EFF6FF';
                          e.currentTarget.style.color = '#2563EB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E5E7EB';
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#4B5563';
                        }}
                      >
                        −
                      </button>
                      <div style={{ 
                        flex: 1, 
                        textAlign: 'center',
                        padding: '8px 16px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                      }}>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827', lineHeight: '1' }}>
                          {formData[metric.key as keyof typeof formData]}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleIncrement(metric.key)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          border: '2px solid #E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4B5563',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#2563EB';
                          e.currentTarget.style.backgroundColor = '#EFF6FF';
                          e.currentTarget.style.color = '#2563EB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E5E7EB';
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#4B5563';
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen cualitativo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '12px'
                }}>
                  Resumen de la semana
                </label>
                <textarea
                  value={formData.resumen}
                  onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
                  rows={4}
                  placeholder="Cuéntanos cómo fue tu semana, logros, aprendizajes..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '10px',
                    resize: 'none',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    color: '#111827',
                    backgroundColor: '#FFFFFF',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '12px'
                }}>
                  Bloqueos / ¿Necesitas ayuda?
                </label>
                <textarea
                  value={formData.bloqueos}
                  onChange={(e) => setFormData({ ...formData, bloqueos: e.target.value })}
                  rows={4}
                  placeholder="¿Hay algo en lo que necesites ayuda? Cuéntanos..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '10px',
                    resize: 'none',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    color: '#111827',
                    backgroundColor: '#FFFFFF',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Submit button */}
            <div style={{ marginTop: '32px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: submitting 
                    ? 'linear-gradient(to right, #93C5FD, #A5B4FC)' 
                    : 'linear-gradient(to right, #2563EB, #4F46E5)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #1D4ED8, #4338CA)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #2563EB, #4F46E5)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {submitting ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
