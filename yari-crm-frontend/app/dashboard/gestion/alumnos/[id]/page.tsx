"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

interface Student {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  last_interaction_date: string | null;
  created_at: string;
  country?: string;
  city?: string;
}

interface Report {
  id: number;
  week_date: string;
  submitted_at: string;
  procesos_activos: number;
  entrevistas_rrhh: number;
  entrevistas_tecnicas: number;
  challenges: number;
  rechazos: number;
  ghosting: number;
  propuestas: number;
  resumen?: string;
  bloqueos?: string;
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      const [studentRes, reportsRes] = await Promise.all([
        axios.get(`http://localhost:3000/students/${studentId}`),
        axios.get(`http://localhost:3000/weekly-reports/student/${studentId}`)
      ]);
      setStudent(studentRes.data);
      setReports(reportsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSendForm = async () => {
    if (!student) return;
    if (!confirm(`¿Enviar formulario manual a ${student.full_name}?`)) return;

    try {
      await axios.post(`http://localhost:3000/magic-links/send-one/${studentId}`);
      alert('Formulario enviado correctamente');
    } catch (error) {
      alert('Error al enviar formulario');
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

  const calculateTotalMetrics = () => {
    return reports.reduce((acc, report) => ({
      procesos: acc.procesos + report.procesos_activos,
      ofertas: acc.ofertas + report.propuestas,
      rechazos: acc.rechazos + report.rechazos,
      sinRespuesta: acc.sinRespuesta + report.ghosting,
    }), { procesos: 0, ofertas: 0, rechazos: 0, sinRespuesta: 0 });
  };

  const totalMetrics = calculateTotalMetrics();
  const total = totalMetrics.procesos + totalMetrics.ofertas + totalMetrics.rechazos + totalMetrics.sinRespuesta;

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B7280' }}>Cargando...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B7280' }}>Alumno no encontrado</p>
      </div>
    );
  }

  const status = getStatusInfo(student.last_interaction_date);
  const lastReport = reports[0];

  const tabs = [
    { id: 'info', label: 'Información Básica', icon: '📋' },
    { id: 'bitacora', label: 'Bitácora', icon: '📝' },
    { id: 'metricas', label: 'Métricas y Reportes', icon: '📊' },
    { id: 'auditoria', label: 'Auditoría', icon: '🔍' },
  ];

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ padding: '2rem' }}>
          <button
            onClick={() => router.push('/dashboard/gestion/alumnos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6B7280',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '1rem',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#111827'}
            onMouseOut={(e) => e.currentTarget.style.color = '#6B7280'}
          >
            ← Volver a Base de Datos
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                borderRadius: '9999px',
                background: 'linear-gradient(to bottom right, #3B82F6, #2563EB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: '600',
                flexShrink: 0
              }}>
                {student.full_name.charAt(0)}
              </div>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {student.full_name}
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                  {student.email}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                  {student.phone || 'Sin teléfono'}
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backgroundColor: status.bgColor,
                    color: status.color
                  }}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSendForm}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            >
              📧 Enviar Formulario Manualmente
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
                color: activeTab === tab.id ? '#2563EB' : '#6B7280',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '2rem' }}>
        {/* TAB 1: Información Básica */}
        {activeTab === 'info' && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1.5rem' }}>
              Información del Alumno
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {[
                { label: 'Nombre Completo', value: student.full_name },
                { label: 'Email', value: student.email },
                { label: 'Teléfono', value: student.phone || 'No registrado' },
                { label: 'Estado', value: status.label, color: status.color },
                { label: 'Fecha de Registro', value: new Date(student.created_at).toLocaleDateString('es-AR') },
                { label: 'Última Interacción', value: student.last_interaction_date ? new Date(student.last_interaction_date).toLocaleDateString('es-AR') : 'Nunca' },
                { label: 'País', value: student.country || 'No especificado' },
                { label: 'Ciudad', value: student.city || 'No especificada' },
              ].map((field, idx) => (
                <div key={idx}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6B7280', margin: 0, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    {field.label}
                  </p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: field.color || '#111827', margin: 0 }}>
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Bitácora */}
        {activeTab === 'bitacora' && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1.5rem' }}>
              Notas Internas
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe observaciones sobre el alumno..."
              rows={10}
              style={{
                width: '100%',
                padding: '1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={() => alert('Funcionalidad de guardar notas en desarrollo')}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            >
              💾 Guardar Notas
            </button>
          </div>
        )}

        {/* TAB 3: Métricas y Reportes */}
        {activeTab === 'metricas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Donut Chart */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1.5rem' }}>
                Distribución de Actividad
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#3B82F6" strokeWidth="40" strokeDasharray={`${total > 0 ? (totalMetrics.procesos / total) * 502 : 0} 502`} transform="rotate(-90 100 100)" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#10B981" strokeWidth="40" strokeDasharray={`${total > 0 ? (totalMetrics.ofertas / total) * 502 : 0} 502`} strokeDashoffset={`${total > 0 ? -(totalMetrics.procesos / total) * 502 : 0}`} transform="rotate(-90 100 100)" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#EF4444" strokeWidth="40" strokeDasharray={`${total > 0 ? (totalMetrics.rechazos / total) * 502 : 0} 502`} strokeDashoffset={`${total > 0 ? -((totalMetrics.procesos + totalMetrics.ofertas) / total) * 502 : 0}`} transform="rotate(-90 100 100)" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#F59E0B" strokeWidth="40" strokeDasharray={`${total > 0 ? (totalMetrics.sinRespuesta / total) * 502 : 0} 502`} strokeDashoffset={`${total > 0 ? -((totalMetrics.procesos + totalMetrics.ofertas + totalMetrics.rechazos) / total) * 502 : 0}`} transform="rotate(-90 100 100)" />
                  <text x="100" y="100" textAnchor="middle" dy="0.3em" fontSize="24" fontWeight="bold" fill="#111827">{total}</text>
                  <text x="100" y="120" textAnchor="middle" dy="0.3em" fontSize="12" fill="#6B7280">Total</text>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'En Proceso', value: totalMetrics.procesos, color: '#3B82F6' },
                    { label: 'Ofertas', value: totalMetrics.ofertas, color: '#10B981' },
                    { label: 'Rechazos', value: totalMetrics.rechazos, color: '#EF4444' },
                    { label: 'Sin Respuesta', value: totalMetrics.sinRespuesta, color: '#F59E0B' },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', backgroundColor: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>{item.label}:</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Último Reporte */}
            {lastReport && (
              <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1.5rem' }}>
                  Último Reporte Recibido
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Procesos Activos', value: lastReport.procesos_activos, icon: '🎯' },
                    { label: 'Entrevistas RRHH', value: lastReport.entrevistas_rrhh, icon: '👥' },
                    { label: 'Entrevistas Técnicas', value: lastReport.entrevistas_tecnicas, icon: '💻' },
                    { label: 'Challenges', value: lastReport.challenges, icon: '🧩' },
                    { label: 'Rechazos', value: lastReport.rechazos, icon: '❌' },
                    { label: 'Ghosting', value: lastReport.ghosting, icon: '👻' },
                    { label: 'Propuestas', value: lastReport.propuestas, icon: '🎉' },
                  ].map((metric, idx) => (
                    <div key={idx} style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{metric.icon}</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                        {metric.value}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
                {lastReport.resumen && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: 0, marginBottom: '0.5rem' }}>
                      📝 Resumen:
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                      {lastReport.resumen}
                    </p>
                  </div>
                )}
                {lastReport.bloqueos && (
                  <div style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400E', margin: 0, marginBottom: '0.5rem' }}>
                      🚧 Bloqueos:
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#92400E', margin: 0 }}>
                      {lastReport.bloqueos}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Historial */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1.5rem' }}>
                Historial de Reportes
              </h2>
              {reports.length === 0 ? (
                <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>
                  No hay reportes registrados
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reports.map((report) => (
                    <details key={report.id} style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: '0.5rem',
                      border: '1px solid #E5E7EB',
                      padding: '1rem'
                    }}>
                      <summary style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', cursor: 'pointer' }}>
                        📅 Semana {new Date(report.week_date).toLocaleDateString('es-AR')} - Enviado {new Date(report.submitted_at).toLocaleString('es-AR')}
                      </summary>
                      <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                        {[
                          { label: 'Procesos', value: report.procesos_activos, icon: '🎯' },
                          { label: 'RRHH', value: report.entrevistas_rrhh, icon: '👥' },
                          { label: 'Técnicas', value: report.entrevistas_tecnicas, icon: '💻' },
                          { label: 'Challenges', value: report.challenges, icon: '🧩' },
                          { label: 'Rechazos', value: report.rechazos, icon: '❌' },
                          { label: 'Ghosting', value: report.ghosting, icon: '👻' },
                          { label: 'Ofertas', value: report.propuestas, icon: '🎉' },
                        ].map((m, i) => (
                          <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.25rem' }}>{m.icon}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>{m.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                      {report.resumen && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.375rem' }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6B7280', margin: 0, marginBottom: '0.25rem' }}>Resumen:</p>
                          <p style={{ fontSize: '0.875rem', color: '#111827', margin: 0 }}>{report.resumen}</p>
                        </div>
                      )}
                      {report.bloqueos && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#FEF3C7', borderRadius: '0.375rem' }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#92400E', margin: 0, marginBottom: '0.25rem' }}>Bloqueos:</p>
                          <p style={{ fontSize: '0.875rem', color: '#92400E', margin: 0 }}>{report.bloqueos}</p>
                        </div>
                      )}
                    </details>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Auditoría */}
        {activeTab === 'auditoria' && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1.5rem' }}>
              Historial de Envíos
            </h2>
            {reports.length === 0 ? (
              <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>
                No hay registros de auditoría
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reports.map((report) => (
                  <div key={report.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '0.5rem',
                    border: '1px solid #E5E7EB'
                  }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: 0 }}>
                        Semana {new Date(report.week_date).toLocaleDateString('es-AR')}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0, marginTop: '0.25rem' }}>
                        Enviado: {new Date(report.submitted_at).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <span style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: '#D1FAE5',
                      color: '#059669'
                    }}>
                      ✓ Recibido
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}