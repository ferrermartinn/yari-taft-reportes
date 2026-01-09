"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Staff {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  last_login_at?: string;
}

interface SystemConfig {
  sendDay: string;
  sendTime: string;
  frequency: string;
  expirationDays: number;
  reminderEnabled: boolean;
  reminderDays: number;
  inactiveDays: number;
  riskDays: number;
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<SystemConfig>({
    sendDay: 'monday',
    sendTime: '09:00',
    frequency: 'weekly',
    expirationDays: 7,
    reminderEnabled: true,
    reminderDays: 3,
    inactiveDays: 21,
    riskDays: 14,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [newStaff, setNewStaff] = useState({ email: '', password: '', full_name: '' });
  const [editStaff, setEditStaff] = useState({ full_name: '', password: '' });

  useEffect(() => {
    fetchConfig();
    fetchStaff();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/config`);
      setConfig(response.data);
    } catch (error) {
      console.error('Error obteniendo configuración', error);
      setMessage({ type: 'error', text: 'Error cargando configuración' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${API_URL}/staff`);
      setStaff(response.data);
    } catch (error) {
      console.error('Error obteniendo staff', error);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.email || !newStaff.password || !newStaff.full_name) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await axios.post(`${API_URL}/staff`, newStaff);
      setMessage({ type: 'success', text: 'Staff agregado correctamente' });
      setShowAddStaffModal(false);
      setNewStaff({ email: '', password: '', full_name: '' });
      fetchStaff();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al agregar staff' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setEditStaff({ full_name: staffMember.full_name, password: '' });
    setShowEditStaffModal(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;
    if (!editStaff.full_name) {
      setMessage({ type: 'error', text: 'El nombre es requerido' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const updateData: any = { full_name: editStaff.full_name };
      if (editStaff.password) {
        updateData.password = editStaff.password;
      }
      await axios.patch(`${API_URL}/staff/${editingStaff.id}`, updateData);
      setMessage({ type: 'success', text: 'Staff actualizado correctamente' });
      setShowEditStaffModal(false);
      setEditingStaff(null);
      setEditStaff({ full_name: '', password: '' });
      fetchStaff();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al actualizar staff' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (staffId: number, staffName: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${staffName}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/staff/${staffId}`);
      setMessage({ type: 'success', text: 'Staff eliminado correctamente' });
      fetchStaff();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar staff' });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      await axios.post(`${API_URL}/config`, config);
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error guardando configuración', error);
      setMessage({ type: 'error', text: 'Error al guardar configuración' });
    } finally {
      setSaving(false);
    }
  };

  const weekDays = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' },
  ];

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
          <p style={{ fontSize: '14px', color: '#4B5563' }}>Cargando configuración...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ padding: '32px 32px 24px' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button
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
              ← Volver al Dashboard
            </button>
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Configuración de Formularios
          </h1>
          <p style={{ fontSize: '14px', color: '#4B5563', marginTop: '4px', marginBottom: 0 }}>
            Ajusta el envío automático de reportes semanales
          </p>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {message && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '24px',
            borderRadius: '8px',
            backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
            color: message.type === 'success' ? '#065F46' : '#991B1B',
            fontSize: '14px'
          }}>
            {message.text}
          </div>
        )}

        <div style={{ maxWidth: '768px' }}>
          {/* Envío Automático */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: '1px solid #E5E7EB', 
            padding: '24px', 
            marginBottom: '24px' 
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '24px', marginTop: 0 }}>
              Envío Automático
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Día de envío */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Día de envío
                </label>
                <select
                  value={config.sendDay}
                  onChange={(e) => setConfig({ ...config, sendDay: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  {weekDays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', marginBottom: 0 }}>
                  Los formularios se enviarán automáticamente cada {weekDays.find(d => d.value === config.sendDay)?.label}
                </p>
              </div>

              {/* Hora de envío */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Hora de envío
                </label>
                <input
                  type="time"
                  value={config.sendTime}
                  onChange={(e) => setConfig({ ...config, sendTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', marginBottom: 0 }}>
                  Los emails se enviarán a las {config.sendTime} (hora de Argentina)
                </p>
              </div>

              {/* Frecuencia */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Frecuencia
                </label>
                <select
                  value={config.frequency}
                  onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuración de Expiración */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: '1px solid #E5E7EB', 
            padding: '24px', 
            marginBottom: '24px' 
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '24px', marginTop: 0 }}>
              Expiración de Links
            </h2>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Días de validez del link
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={config.expirationDays}
                onChange={(e) => setConfig({ ...config, expirationDays: parseInt(e.target.value) || 7 })}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', marginBottom: 0 }}>
                Los links expirarán después de {config.expirationDays} días
              </p>
            </div>
          </div>

          {/* Estado Automático */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: '1px solid #E5E7EB', 
            padding: '24px', 
            marginBottom: '24px' 
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '24px', marginTop: 0 }}>
              Cambio de Estado Automático
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Días para En Riesgo */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Días para marcar como "En Riesgo"
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={config.riskDays}
                  onChange={(e) => setConfig({ ...config, riskDays: parseInt(e.target.value) || 14 })}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', marginBottom: 0 }}>
                  Después de {config.riskDays} días sin reporte, el estudiante será marcado como "En Riesgo"
                </p>
              </div>

              {/* Días para Inactivo */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Días para marcar como "Inactivo"
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config.inactiveDays}
                  onChange={(e) => setConfig({ ...config, inactiveDays: parseInt(e.target.value) || 21 })}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', marginBottom: 0 }}>
                  Después de {config.inactiveDays} días sin reporte, el estudiante será marcado como "Inactivo" automáticamente
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: saving ? '#93C5FD' : '#2563EB',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
            <button
              onClick={fetchConfig}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                border: '1px solid #D1D5DB',
                color: '#374151',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Cancelar
            </button>
          </div>

          {/* Gestión de Staff */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: '1px solid #E5E7EB', 
            padding: '24px', 
            marginTop: '24px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Gestión de Staff
              </h2>
              <button
                onClick={() => setShowAddStaffModal(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
              >
                + Agregar Staff
              </button>
            </div>
            
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 16px 0' }}>
              Administra las cuentas de personal autorizado para acceder al sistema.
            </p>

            {staff.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>
                <p style={{ margin: 0 }}>No hay miembros de staff registrados</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Nombre</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Último Login</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((staffMember, index) => (
                      <tr key={staffMember.id} style={{ borderBottom: index < staff.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                        <td style={{ padding: '16px 12px', fontSize: '14px', color: '#111827' }}>
                          {staffMember.full_name}
                        </td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', color: '#6B7280' }}>
                          {staffMember.email}
                        </td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', color: '#6B7280' }}>
                          {staffMember.last_login_at 
                            ? new Date(staffMember.last_login_at).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Nunca'}
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleEditStaff(staffMember)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: 'white',
                                color: '#374151',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                                e.currentTarget.style.borderColor = '#9CA3AF';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#D1D5DB';
                              }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(staffMember.id, staffMember.full_name)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: 'white',
                                color: '#DC2626',
                                border: '1px solid #FCA5A5',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FEE2E2';
                                e.currentTarget.style.borderColor = '#DC2626';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#FCA5A5';
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Agregar Staff */}
          {showAddStaffModal && (
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
              setShowAddStaffModal(false);
              setNewStaff({ email: '', password: '', full_name: '' });
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
                  Agregar Miembro de Staff
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={newStaff.full_name}
                      onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                      placeholder="Juan Pérez"
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
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      placeholder="juan@example.com"
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
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
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
                    onClick={handleAddStaff}
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
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddStaffModal(false);
                      setNewStaff({ email: '', password: '', full_name: '' });
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'white',
                      border: '1px solid #D1D5DB',
                      color: '#374151',
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

          {/* Modal Editar Staff */}
          {showEditStaffModal && editingStaff && (
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
              setShowEditStaffModal(false);
              setEditingStaff(null);
              setEditStaff({ full_name: '', password: '' });
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
                  Editar Staff
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={editStaff.full_name}
                      onChange={(e) => setEditStaff({ ...editStaff, full_name: e.target.value })}
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
                      Nueva Contraseña (dejar vacío para no cambiar)
                    </label>
                    <input
                      type="password"
                      value={editStaff.password}
                      onChange={(e) => setEditStaff({ ...editStaff, password: e.target.value })}
                      placeholder="Dejar vacío para mantener la actual"
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
                    onClick={handleUpdateStaff}
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
                      setShowEditStaffModal(false);
                      setEditingStaff(null);
                      setEditStaff({ full_name: '', password: '' });
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'white',
                      border: '1px solid #D1D5DB',
                      color: '#374151',
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
      </div>
    </div>
  );
}
