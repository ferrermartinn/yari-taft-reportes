"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Student {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  last_interaction_at?: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  atRisk: number;
  withoutReport: number;
}

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats>({ 
    total: 0, 
    active: 0, 
    inactive: 0, 
    atRisk: 0,
    withoutReport: 0 
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchDashboardData = async () => {
    try {
      const studentsResponse = await axios.get(`${API_URL}/students`);
      const studentsData = studentsResponse.data;
      setStudents(studentsData);
      calculateStats(studentsData);

      const reportsResponse = await axios.get(`${API_URL}/weekly-reports`);
      setRecentReports(reportsResponse.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Student[]) => {
    const now = Date.now();
    const total = data.length;
    const active = data.filter(s => s.status === 'active').length;
    const inactive = data.filter(s => s.status === 'inactive').length;
    
    const atRisk = data.filter(s => {
      if (!s.last_interaction_at || s.status !== 'active') return false;
      const days = Math.floor((now - new Date(s.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 14 && days < 21;
    }).length;

    const withoutReport = data.filter(s => {
      if (!s.last_interaction_at) return true;
      const days = Math.floor((now - new Date(s.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 7;
    }).length;

    setStats({ total, active, inactive, atRisk, withoutReport });
  };

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <p style={{ fontSize: '14px', color: '#4B5563' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ padding: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Panel Principal
          </h1>
          <p style={{ fontSize: '14px', color: '#4B5563', marginTop: '4px', marginBottom: 0 }}>
            Resumen general del sistema de reportes
          </p>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px', 
          marginBottom: '32px' 
        }}>
          <Link
            href="/dashboard/gestion/alumnos"
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3B82F6';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Gestión de Alumnos
                </h3>
                <p style={{ fontSize: '14px', color: '#4B5563', margin: '4px 0 0 0' }}>
                  Base de datos completa
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/gestion/auditoria"
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#10B981';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Auditoría de Envíos
                </h3>
                <p style={{ fontSize: '14px', color: '#4B5563', margin: '4px 0 0 0' }}>
                  Historial completo
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/gestion/configuracion"
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8B5CF6';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: '#EDE9FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Configuración
                </h3>
                <p style={{ fontSize: '14px', color: '#4B5563', margin: '4px 0 0 0' }}>
                  Envío automático
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          <StatCard
            title="Total Alumnos"
            value={stats.total.toString()}
            subtitle="Registrados"
            color="blue"
          />
          <StatCard
            title="Activos"
            value={stats.active.toString()}
            subtitle={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% del total`}
            color="green"
          />
          <StatCard
            title="En Riesgo"
            value={stats.atRisk.toString()}
            subtitle="14-21 días sin reporte"
            color="yellow"
          />
          <StatCard
            title="Inactivos"
            value={stats.inactive.toString()}
            subtitle="+21 días sin actividad"
            color="gray"
          />
          <StatCard
            title="Sin Reporte"
            value={stats.withoutReport.toString()}
            subtitle="Esta semana"
            color="red"
          />
        </div>

        {/* Recent Activity */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '24px' 
        }}>
          {/* Recent Reports */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Últimos Reportes Recibidos
              </h2>
            </div>
            <div>
              {recentReports.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
                  No hay reportes recientes
                </div>
              ) : (
                recentReports.map((report, index) => (
                  <div 
                    key={report.id} 
                    style={{ 
                      padding: '16px 24px', 
                      borderBottom: index < recentReports.length - 1 ? '1px solid #E5E7EB' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                          {report.student?.full_name || 'Alumno desconocido'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
                          {new Date(report.created_at).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        padding: '4px 10px',
                        backgroundColor: '#D1FAE5',
                        color: '#065F46',
                        borderRadius: '9999px',
                        fontWeight: '500'
                      }}>
                        Recibido
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentReports.length > 0 && (
              <div style={{ padding: '12px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
                <Link
                  href="/dashboard/gestion/auditoria"
                  style={{ fontSize: '14px', fontWeight: '500', color: '#2563EB', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1D4ED8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
                >
                  Ver historial completo →
                </Link>
              </div>
            )}
          </div>

          {/* Students by Status */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Alumnos por Estado
              </h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { key: 'active', label: 'Activos', count: stats.active },
                  { key: 'atRisk', label: 'En Riesgo', count: stats.atRisk },
                  { key: 'inactive', label: 'Inactivos', count: stats.inactive },
                ].map((status) => (
                  <button
                    key={status.key}
                    onClick={() => {
                      const statusMap: { [key: string]: string } = {
                        active: 'active',
                        atRisk: 'en-riesgo',
                        inactive: 'inactive'
                      };
                      window.location.href = `/dashboard/gestion/alumnos?filter=${statusMap[status.key]}`;
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: status.key === 'active' ? '#D1FAE5' : status.key === 'atRisk' ? '#FEF3C7' : '#F3F4F6',
                      color: status.key === 'active' ? '#065F46' : status.key === 'atRisk' ? '#92400E' : '#374151',
                      border: '1px solid',
                      borderColor: status.key === 'active' ? '#A7F3D0' : status.key === 'atRisk' ? '#FCD34D' : '#D1D5DB',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {status.label} ({status.count})
                  </button>
                ))}
              </div>
            </div>
            <div>
              {students.filter(s => {
                if (stats.active > 0 && stats.atRisk === 0 && stats.inactive === 0) {
                  return s.status === 'active';
                }
                const now = Date.now();
                if (!s.last_interaction_at) return false;
                const days = Math.floor((now - new Date(s.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24));
                if (days >= 14 && days < 21) return s.status === 'active';
                if (days >= 21) return s.status === 'inactive';
                return s.status === 'active' && days < 14;
              }).slice(0, 5).map((student, index, arr) => (
                <Link
                  key={student.id}
                  href={`/dashboard/gestion/alumnos/${student.id}`}
                  style={{
                    padding: '16px 24px',
                    borderBottom: index < arr.length - 1 ? '1px solid #E5E7EB' : 'none',
                    display: 'block',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(to bottom right, #3B82F6, #2563EB)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#111827', 
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {student.full_name}
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#6B7280', 
                        margin: '2px 0 0 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {student.email}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {students.length > 5 && (
              <div style={{ padding: '12px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
                <Link
                  href="/dashboard/gestion/alumnos"
                  style={{ fontSize: '14px', fontWeight: '500', color: '#2563EB', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1D4ED8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
                >
                  Ver todos los alumnos →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: any) {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      border: '1px solid #E5E7EB', 
      padding: '20px' 
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '12px', 
            fontWeight: '500', 
            color: '#4B5563', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            margin: '0 0 4px 0' 
          }}>
            {title}
          </p>
          <p style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
            {value}
          </p>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
