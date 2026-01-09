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
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Configuración de Formularios</h1>
          <p className="text-sm text-gray-600 mt-1">
            Ajusta el envío automático de reportes semanales
          </p>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-3xl">
          {/* Envío Automático */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Envío Automático</h2>
            
            <div className="space-y-6">
              {/* Día de envío */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Día de envío
                </label>
                <select
                  value={config.sendDay}
                  onChange={(e) => setConfig({ ...config, sendDay: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {weekDays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Los formularios se enviarán automáticamente cada {weekDays.find(d => d.value === config.sendDay)?.label}
                </p>
              </div>

              {/* Hora de envío */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de envío
                </label>
                <input
                  type="time"
                  value={config.sendTime}
                  onChange={(e) => setConfig({ ...config, sendTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Los emails se enviarán a las {config.sendTime} (hora de Argentina)
                </p>
              </div>

              {/* Frecuencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia
                </label>
                <select
                  value={config.frequency}
                  onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuración de Expiración */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Expiración de Links</h2>
            
            <div className="space-y-6">
              {/* Días de expiración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de validez del link
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={config.expirationDays}
                  onChange={(e) => setConfig({ ...config, expirationDays: parseInt(e.target.value) || 7 })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Los links expirarán después de {config.expirationDays} días
                </p>
              </div>
            </div>
          </div>

          {/* Recordatorios */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recordatorios Automáticos</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Enviar recordatorios a alumnos que no han respondido
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.reminderEnabled}
                  onChange={(e) => setConfig({ ...config, reminderEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {config.reminderEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enviar recordatorio después de
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={config.reminderDays || 3}
                    onChange={(e) => setConfig({ ...config, reminderDays: parseInt(e.target.value) || 3 })}
                    className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <span className="text-sm text-gray-600">días sin respuesta</span>
                </div>
              </div>
            )}
          </div>

          {/* Estado Automático */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambio de Estado Automático</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">En Riesgo</p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    14 días sin enviar reporte
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Inactivo</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    21 días sin enviar reporte
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Guardar Configuración
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}