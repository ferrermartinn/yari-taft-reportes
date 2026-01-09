"use client";

import { useState, useEffect } from 'react';
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
      setStudentName(response.data.student.full_name);
      setLoading(false);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando acceso...</p>
        </div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Reporte Enviado!</h1>
          <p className="text-gray-600">
            Gracias por completar tu reporte semanal. Tu información ha sido registrada correctamente.
          </p>
        </div>
      </div>
    );
  }

  const metrics = [
    { key: 'procesos_activos', label: 'Procesos Activos', emoji: '🎯' },
    { key: 'entrevistas_rrhh', label: 'Entrevistas RRHH', emoji: '👥' },
    { key: 'entrevistas_tecnicas', label: 'Entrevistas Técnicas', emoji: '💻' },
    { key: 'challenges', label: 'Challenges', emoji: '🧩' },
    { key: 'rechazos', label: 'Rechazos', emoji: '❌' },
    { key: 'ghosting', label: 'Ghosting', emoji: '👻' },
    { key: 'propuestas', label: 'Propuestas/Ofertas', emoji: '🎉' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <h1 className="text-2xl font-bold mb-1">Reporte Semanal</h1>
            <p className="text-blue-100">Hola {studentName}, completa tu reporte de la semana</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Métricas numéricas */}
            <div className="space-y-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad de la Semana</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.map((metric) => (
                  <div key={metric.key} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{metric.emoji}</span>
                      <label className="text-sm font-medium text-gray-700">
                        {metric.label}
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDecrement(metric.key)}
                        className="w-10 h-10 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center text-gray-600 hover:text-blue-600 font-semibold"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {formData[metric.key as keyof typeof formData]}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleIncrement(metric.key)}
                        className="w-10 h-10 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center text-gray-600 hover:text-blue-600 font-semibold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen cualitativo */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Resumen de la semana
                </label>
                <textarea
                  value={formData.resumen}
                  onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
                  rows={4}
                  placeholder="Cuéntanos cómo fue tu semana, logros, aprendizajes..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🚧 Bloqueos / ¿Necesitas ayuda?
                </label>
                <textarea
                  value={formData.bloqueos}
                  onChange={(e) => setFormData({ ...formData, bloqueos: e.target.value })}
                  rows={4}
                  placeholder="¿Hay algo en lo que necesites ayuda? Cuéntanos..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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