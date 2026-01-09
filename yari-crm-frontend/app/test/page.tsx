"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Student {
  id: number;
  full_name: string;
  email: string;
  last_interaction_date: string | null;
}

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/students');
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const getStatusInfo = (lastInteractionDate: string | null) => {
    if (!lastInteractionDate) return { label: 'Sin Reporte', color: '#6B7280', bgColor: '#F3F4F6' };
    
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(lastInteractionDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince < 14) return { label: 'Activo', color: '#059669', bgColor: '#D1FAE5' };
    if (daysSince < 21) return { label: 'En Riesgo', color: '#D97706', bgColor: '#FEF3C7' };
    return { label: 'Inactivo', color: '#DC2626', bgColor: '#FEE2E2' };
  };

  const metrics = {
    total: students.length,
    activos: students.filter(s => {
      if (!s.last_interaction_date) return false;
      const days = Math.floor((new Date().getTime() - new Date(s.last_interaction_date).getTime()) / (1000 * 60 * 60 * 24));
      return days < 14;
    }).length,
    enRiesgo: students.filter(s => {
      if (!s.last_interaction_date) return false;
      const days = Math.floor((new Date().getTime() - new Date(s.last_interaction_date).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 14 && days < 21;
    }).length,
    inactivos: students.filter(s => {
      if (!s.last_interaction_date) return false;
      const days = Math.floor((new Date().getTime() - new Date(s.last_interaction_date).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 21;
    }).length,
    sinReporte: students.filter(s => !s.last_interaction_date).length,
  };

  const activeStudents = students
    .filter(s => {
      if (!s.last_interaction_date) return false;
      const days = Math.floor((new Date().getTime() - new Date(s.last_interaction_date).getTime()) / (1000 * 60 * 60 * 24));
      return days < 14;
    })
    .slice(0, 5);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '600', color: '#111827', margin: 0 }}>
            Panel Principal
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: 0 }}>
            Resumen general del sistema de reportes
          </p>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Quick Access Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <Link href="/dashboard/gestion/alumnos" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #E5E7EB',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(to bottom right, #3B82F6, #2563EB)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  👥
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Gestión de Alumnos
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0, marginTop: '0.25rem' }}>
                    Base de datos completa
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/gestion/auditoria" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #E5E7EB',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(to bottom right, #10B981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  ✓
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Auditoría
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0, marginTop: '0.25rem' }}>
                    Historial completo
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/gestion/configuracion" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #E5E7EB',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(to bottom right, #8B5CF6, #7C3AED)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  ⚙️
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Configuración
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0, marginTop: '0.25rem' }}>
                    Envío automático
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Alumnos', value: metrics.total, sub: 'Registrados', color: '#3B82F6' },
            { label: 'Activos', value: metrics.activos, sub: `${metrics.total > 0 ? Math.round((metrics.activos / metrics.total) * 100) : 0}% del total`, color: '#10B981' },
            { label: 'En Riesgo', value: metrics.enRiesgo, sub: '14-21 días sin reporte', color: '#F59E0B' },
            { label: 'Inactivos', value: metrics.inactivos, sub: '+21 días sin actividad', color: '#EF4444' },
            { label: 'Sin Reporte', value: metrics.sinReporte, sub: 'Esta semana', color: '#6B7280' },
          ].map((metric, idx) => (
            <div key={idx} style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #E5E7EB',
              padding: '1.5rem'
            }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280', margin: 0, marginBottom: '0.5rem' }}>
                {metric.label}
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: metric.color, margin: 0, marginBottom: '0.25rem' }}>
                {metric.value}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                {metric.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Active Students */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1rem' }}>
            Alumnos Activos
          </h2>
          {loading ? (
            <p style={{ color: '#6B7280' }}>Cargando...</p>
          ) : activeStudents.length === 0 ? (
            <p style={{ color: '#6B7280' }}>No hay alumnos activos</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeStudents.map((student) => {
                const status = getStatusInfo(student.last_interaction_date);
                return (
                  <div key={student.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#F9FAFB'
                  }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '9999px',
                      background: 'linear-gradient(to bottom right, #3B82F6, #2563EB)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {student.full_name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {student.full_name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {student.email}
                      </p>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: status.bgColor,
                      color: status.color
                    }}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}