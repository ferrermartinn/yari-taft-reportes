"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Link {
  id: number;
  token: string;
  status: string;
  created_at: string;
  expires_at: string;
  student: {
    full_name: string;
    email: string;
  };
}

interface Report {
  id: number;
  created_at: string;
  answers: any;
  student: {
    full_name: string;
    email: string;
  };
}

interface AuditData {
  links: Link[];
  reports: Report[];
  failedReports: Link[];
  students: any[];
  stats: {
    totalLinks: number;
    totalReports: number;
    totalStudents: number;
    pendingLinks: number;
    completedLinks: number;
    expiredLinks: number;
    failedReports: number;
  };
}

export default function AuditoriaPage() {
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'links' | 'reports' | 'failed' | 'students'>('links');

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    try {
      const response = await axios.get(`${API_URL}/audit`);
      setAuditData(response.data);
    } catch (error) {
      console.error('Error obteniendo auditoría', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: any } = {
      pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pendiente' },
      completed: { bg: '#D1FAE5', color: '#065F46', label: 'Completado' },
      expired: { bg: '#FEE2E2', color: '#991B1B', label: 'Expirado' },
    };
    const style = styles[status] || { bg: '#F3F4F6', color: '#374151', label: status };
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: style.bg,
        color: style.color
      }}>
        {style.label}
      </span>
    );
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
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
          <p style={{ fontSize: '14px', color: '#4B5563' }}>Cargando auditoría...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#DC2626' }}>Error cargando auditoría</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ padding: '32px 32px 24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Auditoría de Envíos
          </h1>
          <p style={{ fontSize: '14px', color: '#4B5563', marginTop: '4px', marginBottom: 0 }}>
            Historial completo de envíos, links y reportes
          </p>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '32px' 
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', margin: '0 0 8px 0' }}>Total Links</p>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>{auditData.stats.totalLinks}</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', margin: '0 0 8px 0' }}>Pendientes</p>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#D97706', margin: 0 }}>{auditData.stats.pendingLinks}</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', margin: '0 0 8px 0' }}>Completados</p>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#059669', margin: 0 }}>{auditData.stats.completedLinks}</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', margin: '0 0 8px 0' }}>Expirados</p>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#DC2626', margin: 0 }}>{auditData.stats.expiredLinks}</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', margin: '0 0 8px 0' }}>Total Reportes</p>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>{auditData.stats.totalReports}</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', margin: '0 0 8px 0' }}>Reportes Fallidos</p>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#DC2626', margin: 0 }}>{auditData.stats.failedReports}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          {[
            { key: 'links', label: `Links Enviados (${auditData.links.length})` },
            { key: 'reports', label: `Reportes (${auditData.reports.length})` },
            { key: 'failed', label: `Reportes Fallidos (${auditData.stats.failedReports})` },
            { key: 'students', label: `Alumnos (${auditData.students.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #2563EB' : '2px solid transparent',
                color: activeTab === tab.key ? '#2563EB' : '#6B7280',
                fontWeight: activeTab === tab.key ? '600' : '500',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {activeTab === 'links' && (
            <div>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Historial de Links Enviados
                </h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Estudiante</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Email</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Estado</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Enviado</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Expira</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditData.links.map((link, index) => (
                      <tr key={link.id} style={{ borderBottom: index < auditData.links.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                          {link.student?.full_name || 'N/A'}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280' }}>
                          {link.student?.email || 'N/A'}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {getStatusBadge(isExpired(link.expires_at) ? 'expired' : link.status)}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280' }}>
                          {new Date(link.created_at).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: isExpired(link.expires_at) ? '#DC2626' : '#6B7280' }}>
                          {new Date(link.expires_at).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Historial de Reportes
                </h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Estudiante</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Email</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Fecha</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Procesos Activos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditData.reports.map((report, index) => (
                      <tr key={report.id} style={{ borderBottom: index < auditData.reports.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                          {report.student?.full_name || 'N/A'}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280' }}>
                          {report.student?.email || 'N/A'}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280' }}>
                          {new Date(report.created_at).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                          {report.answers?.procesos_activos || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'failed' && (
            <div>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Reportes Fallidos (No Enviados)
                </h2>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                  Links enviados que expiraron o no fueron completados a tiempo
                </p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Estudiante</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Email</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Estado</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Enviado</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Expiró</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditData.failedReports && auditData.failedReports.length > 0 ? (
                      auditData.failedReports.map((link, index) => (
                        <tr key={link.id} style={{ borderBottom: index < auditData.failedReports.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                            {link.student?.full_name || 'N/A'}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280' }}>
                            {link.student?.email || 'N/A'}
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            {getStatusBadge(isExpired(link.expires_at) ? 'expired' : 'pending')}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280' }}>
                            {new Date(link.created_at).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#DC2626' }}>
                            {new Date(link.expires_at).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
                          No hay reportes fallidos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Lista de Alumnos
                </h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Nombre</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Email</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Estado</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Última Interacción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditData.students.map((student, index) => (
                      <tr key={student.id} style={{ borderBottom: index < auditData.students.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                          {student.full_name}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280' }}>
                          {student.email}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {getStatusBadge(student.status)}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6B7280' }}>
                          {student.last_interaction_at 
                            ? new Date(student.last_interaction_at).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'Nunca'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
