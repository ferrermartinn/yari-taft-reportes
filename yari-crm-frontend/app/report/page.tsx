"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

function MetricCounter({ label, value, onChange, icon }: any) {
  return (
    <div className="group">
      <div className="flex items-center justify-between py-5 px-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{icon}</span>
          <span className="text-[15px] font-medium text-gray-900 tracking-tight">{label}</span>
        </div>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center transition-all duration-150 text-gray-600"
          >
            <span className="text-xl font-light">−</span>
          </button>
          <span className="text-[17px] font-semibold w-10 text-center text-gray-900 tabular-nums">{value}</span>
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 flex items-center justify-center transition-all duration-150 text-white"
          >
            <span className="text-xl font-light">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [metrics, setMetrics] = useState({
    procesos_activos: 0,
    entrevistas_rrhh: 0,
    entrevistas_tecnicas: 0,
    challenges: 0,
    rechazos: 0,
    ghosting: 0,
    propuestas: 0,
  });
  const [resumen, setResumen] = useState('');
  const [bloqueos, setBloqueos] = useState('');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const updateMetric = (key: keyof typeof metrics, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setStatus('loading');

    try {
      await axios.post('http://localhost:3000/weekly-reports', {
        token: token,
        answers: {
          ...metrics,
          resumen,
          bloqueos
        },
      });
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-[32px] font-semibold text-gray-900 mb-3 tracking-tight">Reporte Enviado</h1>
          <p className="text-[17px] text-gray-600 leading-relaxed">
            Gracias por mantener tu progreso actualizado.
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h1 className="text-[32px] font-semibold text-gray-900 mb-3 tracking-tight">Link Inválido</h1>
          <p className="text-[17px] text-gray-600">Este enlace no es válido o ha caducado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-[48px] font-semibold text-gray-900 tracking-tight leading-none">
              Reporte Semanal
            </h1>
            <p className="text-[17px] text-gray-600">Actualiza tu progreso de la semana</p>
          </div>

          {/* Metrics Section */}
          <div className="space-y-3">
            <MetricCounter 
              label="Procesos Activos" 
              icon="🎯" 
              value={metrics.procesos_activos} 
              onChange={(v: number) => updateMetric('procesos_activos', v)} 
            />
            <MetricCounter 
              label="Entrevistas RRHH" 
              icon="👥" 
              value={metrics.entrevistas_rrhh} 
              onChange={(v: number) => updateMetric('entrevistas_rrhh', v)} 
            />
            <MetricCounter 
              label="Entrevistas Técnicas" 
              icon="💻" 
              value={metrics.entrevistas_tecnicas} 
              onChange={(v: number) => updateMetric('entrevistas_tecnicas', v)} 
            />
            <MetricCounter 
              label="Challenges / Pruebas" 
              icon="🧩" 
              value={metrics.challenges} 
              onChange={(v: number) => updateMetric('challenges', v)} 
            />
            <MetricCounter 
              label="Rechazos" 
              icon="❌" 
              value={metrics.rechazos} 
              onChange={(v: number) => updateMetric('rechazos', v)} 
            />
            <MetricCounter 
              label="Ghosting" 
              icon="👻" 
              value={metrics.ghosting} 
              onChange={(v: number) => updateMetric('ghosting', v)} 
            />
            <MetricCounter 
              label="Propuestas / Ofertas" 
              icon="🎉" 
              value={metrics.propuestas} 
              onChange={(v: number) => updateMetric('propuestas', v)} 
            />
          </div>

          {/* Text Inputs Section */}
          <div className="space-y-6 pt-8">
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-3 tracking-wide uppercase">
                Resumen Semanal
              </label>
              <textarea
                className="w-full p-5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[15px] text-gray-900 placeholder-gray-400 resize-none transition-all duration-200"
                rows={5}
                placeholder="¿Cómo te sentiste esta semana? ¿Algún aprendizaje clave?"
                value={resumen}
                onChange={(e) => setResumen(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-3 tracking-wide uppercase">
                Bloqueos / Necesito ayuda con
              </label>
              <input
                type="text"
                className="w-full p-5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[15px] text-gray-900 placeholder-gray-400 transition-all duration-200"
                placeholder="¿Algo te está frenando?"
                value={bloqueos}
                onChange={(e) => setBloqueos(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-200 text-[17px] tracking-tight disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enviando...</span>
              </div>
            ) : (
              'Enviar Reporte Semanal'
            )}
          </button>

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-center">
              <p className="text-[15px] text-red-700 font-medium">
                Error al enviar. Verifica que el link no haya caducado.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-500 mb-4"></div>
        <p className="text-[15px] font-medium text-gray-600">Cargando reporte...</p>
      </div>
    }>
      <ReportForm />
    </Suspense>
  );
}