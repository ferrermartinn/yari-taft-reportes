"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Student {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  last_interaction_date: string | null;
}

export default function AlumnosPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, activeFilter]);

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
    if (!lastInteractionDate) return { label: 'Sin Reporte', color: '#6B7280', bgColor: '#F3F4F6', status: 'sin-reporte' };
    
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(lastInteractionDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince < 14) return { label: 'Activo', color: '#059669', bgColor: '#D1FAE5', status: 'activo' };
    if (daysSince < 21) return { label: 'En Riesgo', color: '#D97706', bgColor: '#FEF3C7', status: 'en-riesgo' };
    return { label: 'Inactivo', color: '#DC2626', bgColor: '#FEE2E2', status: 'inactivo' };
  };

  const getDaysSinceLastInteraction = (lastInteractionDate: string | null) => {
    if (!lastInteractionDate) return 'Nunca';
    const days = Math.floor(
      (new Date().getTime() - new Date(lastInteractionDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return `Hace ${days} días`;
  };

  const filterStudents = () => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (activeFilter !== 'todos') {
      filtered = filtered.filter(s => {
        const status = getStatusInfo(s.last_interaction_date).status;
        return status === activeFilter;
      });
    }

    setFilteredStudents(filtered);
  };

  const handleSendForm = async (studentId: number, studentName: string) => {
    if (!confirm(`¿Enviar formulario manual a ${studentName}?`)) return;

    try {
      await axios.post(`http://localhost:3000/magic-links/send-one/${studentId}`);
      alert('Formulario enviado correctamente');
    } catch (error) {
      alert('Error al enviar formulario');
      console.error(error);
    }
  };

  const counts = {
    todos: students.length,
    activos: students.filter(s => getStatusInfo(s.last_interaction_date).status === 'activo').length,
    enRiesgo: students.filter(s => getStatusInfo(s.last_interaction_date).status === 'en-riesgo').length,
    inactivos: students.filter(s => getStatusInfo(s.last_interaction_date).status === 'inactivo').length,
  };

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                Base de Datos
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: 0 }}>
                Gestión completa de alumnos
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/dashboard/gestion/configuracion">
                <button style={{
                  padding: '0.625rem 1rem',
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                  ⚙️ Configuración de Formularios
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Search and Filters */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="🔍 Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { key: 'todos', label: 'Todos', count: counts.todos },
              { key: 'activo', label: 'Activos', count: counts.activos },
              { key: 'en-riesgo', label: 'En Riesgo', count: counts.enRiesgo },
              { key: 'inactivo', label: 'Inactivos', count: counts.inactivos },
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: activeFilter === filter.key ? '#2563EB' : 'white',
                  color: activeFilter === filter.key ? 'white' : '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
              Cargando...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
              No se encontraron alumnos
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                        Alumno
                      </th>
                      <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                        Email
                      </th>
                      <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                        Teléfono
                      </th>
                      <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                        Estado
                      </th>
                      <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                        Última Interacción
                      </th>
                      <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => {
                      const status = getStatusInfo(student.last_interaction_date);
                      return (
                        <tr key={student.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                                {student.full_name}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
                            {student.email}
                          </td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
                            {student.phone || '-'}
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
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
                          </td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
                            {getDaysSinceLastInteraction(student.last_interaction_date)}
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleSendForm(student.id, student.full_name)}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  backgroundColor: '#2563EB',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                              >
                                📧 Enviar Formulario
                              </button>
                              <Link href={`/dashboard/gestion/alumnos/${student.id}`}>
                                <button style={{
                                  padding: '0.5rem 0.75rem',
                                  backgroundColor: 'white',
                                  color: '#374151',
                                  border: '1px solid #D1D5DB',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                  👁️ Ver Ficha
                                </button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                  Mostrando {filteredStudents.length} de {students.length} alumnos
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}