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
  week_date?: string;
  submitted_at?: string;
  created_at: string;
  answers?: any;
  procesos_activos?: number;
  entrevistas_rrhh?: number;
  entrevistas_tecnicas?: number;
  challenges?: number;
  rechazos?: number;
  ghosting?: number;
  propuestas?: number;
  resumen?: string;
  bloqueos?: string;
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [totalLinksSent, setTotalLinksSent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [notes, setNotes] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ full_name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      const [studentRes, reportsRes, auditRes] = await Promise.all([
        axios.get(`http://localhost:3000/students/${studentId}`),
        axios.get(`http://localhost:3000/weekly-reports/student/${studentId}`),
        axios.get('http://localhost:3000/audit')
      ]);
      setStudent(studentRes.data);
      setReports(reportsRes.data);
      
      // Contar links enviados a este estudiante
      const linksForStudent = auditRes.data.links?.filter((link: any) => 
        link.student_id === parseInt(studentId)
      ) || [];
      setTotalLinksSent(linksForStudent.length);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const calculateSubmissionRate = () => {
    if (totalLinksSent === 0) return { percentage: 0, text: '0/0 (0%)' };
    const submitted = reports.length;
    const percentage = Math.round((submitted / totalLinksSent) * 100);
    return { percentage, text: `${submitted}/${totalLinksSent} (${percentage}%)` };
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

  const handleEdit = () => {
    if (!student) return;
    setEditData({
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editData.full_name || !editData.email) {
      alert('Por favor completa nombre y email');
      return;
    }

    setSaving(true);
    try {
      await axios.patch(`http://localhost:3000/students/${studentId}`, {
        full_name: editData.full_name,
        email: editData.email,
        phone: editData.phone || undefined,
      });
      setShowEditModal(false);
      fetchData();
      alert('Alumno actualizado correctamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al actualizar alumno');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!student) return;
    if (!confirm(`¿Estás seguro de eliminar a ${student.full_name}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/students/${studentId}`);
      alert('Alumno eliminado correctamente');
      router.push('/dashboard/gestion/alumnos');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar alumno');
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
    return reports.reduce((acc, report) => {
      const procesos = report.procesos_activos || report.answers?.procesos_activos || 0;
      const ofertas = report.propuestas || report.answers?.propuestas || 0;
      const rechazos = report.rechazos || report.answers?.rechazos || 0;
      const sinRespuesta = report.ghosting || report.answers?.ghosting || 0;
      
      return {
        procesos: acc.procesos + procesos,
        ofertas: acc.ofertas + ofertas,
        rechazos: acc.rechazos + rechazos,
        sinRespuesta: acc.sinRespuesta + sinRespuesta,
      };
    }, { procesos: 0, ofertas: 0, rechazos: 0, sinRespuesta: 0 });
  };

  const getReportData = (report: Report) => {
    return {
      procesos_activos: report.procesos_activos || report.answers?.procesos_activos || 0,
      entrevistas_rrhh: report.entrevistas_rrhh || report.answers?.entrevistas_rrhh || 0,
      entrevistas_tecnicas: report.entrevistas_tecnicas || report.answers?.entrevistas_tecnicas || 0,
      challenges: report.challenges || report.answers?.challenges || 0,
      rechazos: report.rechazos || report.answers?.rechazos || 0,
      ghosting: report.ghosting || report.answers?.ghosting || 0,
      propuestas: report.propuestas || report.answers?.propuestas || 0,
      resumen: report.resumen || report.answers?.resumen || '',
      bloqueos: report.bloqueos || report.answers?.bloqueos || '',
    };
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

  const tabs = [
    { id: 'info', label: 'Información Básica' },
    { id: 'bitacora', label: 'Bitácora' },
    { id: 'metricas', label: 'Métricas y Reportes' },
    { id: 'auditoria', label: 'Auditoría' },
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
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
                  {(() => {
                    const submissionRate = calculateSubmissionRate();
                    const color = submissionRate.percentage >= 75 ? '#10B981' : submissionRate.percentage >= 50 ? '#F59E0B' : '#EF4444';
                    return (
                      <span style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        backgroundColor: `${color}20`,
                        color: color
                      }}>
                        Formularios: {submissionRate.text}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
                Enviar Formulario
              </button>
              <button
                onClick={handleEdit}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#9CA3AF';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              >
                Editar
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#DC2626',
                  border: '1px solid #FCA5A5',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEE2E2';
                  e.currentTarget.style.borderColor = '#DC2626';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#FCA5A5';
                }}
              >
                Eliminar
              </button>
            </div>
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
              {tab.label}
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
            {/* Resumen General con Gráfico */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1.5rem' }}>
                Resumen General de Actividad
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

            {/* Reportes Semanales Individuales */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1.5rem' }}>
                Reportes Semanales ({reports.length})
              </h2>
              {reports.length === 0 ? (
                <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>
                  No hay reportes registrados
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {reports.map((report, index) => {
                    const reportData = getReportData(report);
                    const reportDate = report.week_date || report.submitted_at || report.created_at;
                    return (
                      <div key={report.id} style={{
                        backgroundColor: '#F9FAFB',
                        borderRadius: '0.5rem',
                        border: '1px solid #E5E7EB',
                        padding: '1.5rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.borderColor = '#D1D5DB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                      }}
                      >
                        {/* Header del Reporte */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E5E7EB' }}>
                          <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                              Reporte Semanal #{reports.length - index}
                            </h3>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '4px 0 0 0' }}>
                              {new Date(reportDate).toLocaleDateString('es-AR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <span style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: '#D1FAE5',
                            color: '#065F46',
                            border: '1px solid #A7F3D0'
                          }}>
                            Completado
                          </span>
                        </div>

                        {/* Métricas del Reporte */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: '0 0 1rem 0' }}>
                            Métricas de la Semana
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                            {[
                              { label: 'Procesos Activos', value: reportData.procesos_activos, color: '#3B82F6' },
                              { label: 'Entrevistas RRHH', value: reportData.entrevistas_rrhh, color: '#8B5CF6' },
                              { label: 'Entrevistas Técnicas', value: reportData.entrevistas_tecnicas, color: '#10B981' },
                              { label: 'Challenges', value: reportData.challenges, color: '#F59E0B' },
                              { label: 'Rechazos', value: reportData.rechazos, color: '#EF4444' },
                              { label: 'Ghosting', value: reportData.ghosting, color: '#6B7280' },
                              { label: 'Propuestas/Ofertas', value: reportData.propuestas, color: '#10B981' },
                            ].map((metric, idx) => (
                              <div key={idx} style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '1.25rem',
                                textAlign: 'center',
                                border: `1px solid ${metric.color}30`,
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = metric.color;
                                e.currentTarget.style.boxShadow = `0 4px 6px -1px ${metric.color}20`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = `${metric.color}30`;
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                              >
                                <div style={{ 
                                  fontSize: '2rem', 
                                  fontWeight: '700', 
                                  color: metric.color, 
                                  marginBottom: '0.5rem',
                                  lineHeight: '1'
                                }}>
                                  {metric.value}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {metric.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Resumen y Bloqueos */}
                        {(reportData.resumen || reportData.bloqueos) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {reportData.resumen && (
                              <div style={{
                                backgroundColor: 'white',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                border: '1px solid #E5E7EB'
                              }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Resumen de la Semana
                                </p>
                                <p style={{ fontSize: '0.875rem', color: '#111827', margin: 0, lineHeight: '1.6' }}>
                                  {reportData.resumen}
                                </p>
                              </div>
                            )}
                            {reportData.bloqueos && (
                              <div style={{
                                backgroundColor: '#FEF3C7',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                border: '1px solid #FCD34D'
                              }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#92400E', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Bloqueos / Necesidades de Ayuda
                                </p>
                                <p style={{ fontSize: '0.875rem', color: '#92400E', margin: 0, lineHeight: '1.6' }}>
                                  {reportData.bloqueos}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

      {/* Modal Editar Alumno */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => {
          setShowEditModal(false);
          setEditData({ full_name: '', email: '', phone: '' });
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 24px 0' }}>
              Editar Alumno
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handleUpdate}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: saving ? '#93C5FD' : '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditData({ full_name: '', email: '', phone: '' });
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}