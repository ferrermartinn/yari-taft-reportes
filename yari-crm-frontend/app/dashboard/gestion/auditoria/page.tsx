"use client";

import { useState } from 'react';

export default function ConfiguracionPage() {
  const [config, setConfig] = useState({
    sendDay: 'monday',
    sendTime: '09:00',
    frequency: 'weekly',
    expirationDays: 7,
    reminderEnabled: true,
    reminderDays: 3,
  });

  const handleSave = () => {
    alert('Configuración guardada (funcionalidad en desarrollo)');
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

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '600', color: '#111827', margin: 0 }}>
            Configuración de Formularios
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: 0 }}>
            Ajusta el envío automático de reportes semanales
          </p>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '48rem' }}>
          {/* Envío Automático */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1.5rem' }}>
              Envío Automático
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Día de envío */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Día de envío
                </label>
                <select
                  value={config.sendDay}
                  onChange={(e) => setConfig({ ...config, sendDay: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {weekDays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0, marginTop: '0.25rem' }}>
                  Los formularios se enviarán automáticamente cada {weekDays.find(d => d.value === config.sendDay)?.label}
                </p>
              </div>

              {/* Hora de envío */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Hora de envío
                </label>
                <input
                  type="time"
                  value={config.sendTime}
                  onChange={(e) => setConfig({ ...config, sendTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0, marginTop: '0.25rem' }}>
                  Los emails se enviarán a las {config.sendTime} (hora de Argentina)
                </p>
              </div>

              {/* Frecuencia */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Frecuencia
                </label>
                <select
                  value={config.frequency}
                  onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expiración de Links */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1.5rem' }}>
              Expiración de Links
            </h2>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
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
                  padding: '0.625rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0, marginTop: '0.25rem' }}>
                Los links expirarán después de {config.expirationDays} días
              </p>
            </div>
          </div>

          {/* Recordatorios */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Recordatorios Automáticos
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem', marginBottom: 0 }}>
                  Enviar recordatorios a alumnos que no han respondido
                </p>
              </div>
              <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.reminderEnabled}
                  onChange={(e) => setConfig({ ...config, reminderEnabled: e.target.checked })}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
                <div style={{
                  width: '2.75rem',
                  height: '1.5rem',
                  backgroundColor: config.reminderEnabled ? '#2563EB' : '#D1D5DB',
                  borderRadius: '9999px',
                  position: 'relative',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    backgroundColor: 'white',
                    borderRadius: '9999px',
                    position: 'absolute',
                    top: '0.125rem',
                    left: config.reminderEnabled ? '1.375rem' : '0.125rem',
                    transition: 'left 0.2s'
                  }} />
                </div>
              </label>
            </div>

            {config.reminderEnabled && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Enviar recordatorio después de
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={config.reminderDays || 3}
                    onChange={(e) => setConfig({ ...config, reminderDays: parseInt(e.target.value) || 3 })}
                    style={{
                      width: '6rem',
                      padding: '0.625rem 1rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>días sin respuesta</span>
                </div>
              </div>
            )}
          </div>

          {/* Estado Automático */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '1rem' }}>
              Cambio de Estado Automático
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: '#FEF3C7',
                borderRadius: '0.5rem'
              }}>
                <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>
                  <svg width="20" height="20" fill="none" stroke="#D97706" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400E', margin: 0 }}>
                    En Riesgo
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#92400E', margin: 0, marginTop: '0.125rem' }}>
                    14 días sin enviar reporte
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: '#F3F4F6',
                borderRadius: '0.5rem'
              }}>
                <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>
                  <svg width="20" height="20" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: 0 }}>
                    Inactivo
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0, marginTop: '0.125rem' }}>
                    21 días sin enviar reporte
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
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
              💾 Guardar Configuración
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}