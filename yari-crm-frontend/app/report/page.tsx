"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import { BiSolidTrafficCone } from 'react-icons/bi';

// Componente para los contadores (+ / -)
function MetricCounter({ label, value, onChange, color = "blue" }: any) {
  const colors: any = {
    blue: "bg-blue-100 text-blue-600 hover:bg-blue-200",
    green: "bg-green-100 text-green-600 hover:bg-green-200",
    red: "bg-red-100 text-red-600 hover:bg-red-200",
    purple: "bg-purple-100 text-purple-600 hover:bg-purple-200",
    yellow: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
    gray: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${colors[color]}`}
        >
          -
        </button>
        <span className="font-bold text-xl w-6 text-center text-gray-800">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${colors[color]}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function ReportForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // El estado ahora refleja TUS métricas reales
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
      // Enviamos todo el paquete de datos
      await axios.post('http://localhost:3000/weekly-reports', {
        token: token,
        answers: {
            ...metrics, // Expande todas las métricas numéricas
            resumen,    // Añade el resumen de texto
            bloqueos    // Añade los bloqueos
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
        <FaCheckCircle className="text-green-500 text-6xl mb-4" />
        <h1 className="text-3xl font-bold text-green-700 mb-2">¡Reporte Recibido!</h1>
        <p className="text-gray-600 text-center">Gracias por actualizar tus métricas semanales. ¡A seguir dándolo todo! 💪</p>
      </div>
    );
  }

  if (!token) {
      return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Link inválido. Falta el token.</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-4 text-white text-center">
            <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                <FaPaperPlane /> Reporte Semanal de Progreso
            </h1>
            <p className="text-blue-100 text-sm mt-1">Completa con tus números de esta semana</p>
        </div>

        <div className="p-6 space-y-6">
            {/* Sección Métricas */}
            <div className="space-y-3">
                <h2 className="font-bold text-gray-800 border-b pb-2 mb-4">Métricas Clave 📈</h2>
                <MetricCounter label="Procesos Activos" value={metrics.procesos_activos} onChange={(v: number) => updateMetric('procesos_activos', v)} color="blue" />
                <MetricCounter label="Entrevistas RRHH" value={metrics.entrevistas_rrhh} onChange={(v: number) => updateMetric('entrevistas_rrhh', v)} color="purple" />
                <MetricCounter label="Entrevistas Técnicas" value={metrics.entrevistas_tecnicas} onChange={(v: number) => updateMetric('entrevistas_tecnicas', v)} color="yellow" />
                <MetricCounter label="Challenges / Pruebas" value={metrics.challenges} onChange={(v: number) => updateMetric('challenges', v)} color="yellow" />
                <MetricCounter label="Rechazos" value={metrics.rechazos} onChange={(v: number) => updateMetric('rechazos', v)} color="red" />
                <MetricCounter label="Ghosting (Sin respuesta)" value={metrics.ghosting} onChange={(v: number) => updateMetric('ghosting', v)} color="gray" />
                <MetricCounter label="🎉 Propuestas / Ofertas!" value={metrics.propuestas} onChange={(v: number) => updateMetric('propuestas', v)} color="green" />
            </div>

            {/* Sección Texto */}
             <div className="space-y-4 mt-6">
                <h2 className="font-bold text-gray-800 border-b pb-2">Resumen Cualitativo 📝</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resumen semanal / Comentarios</label>
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                        rows={3}
                        placeholder="¿Cómo te sentiste? ¿Algún aprendizaje clave?"
                        value={resumen}
                        onChange={(e) => setResumen(e.target.value)}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <BiSolidTrafficCone className="text-yellow-500" /> Bloqueos / Necesito ayuda con...
                    </label>
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-gray-800"
                        placeholder="¿Algo te está frenando?"
                        value={bloqueos}
                        onChange={(e) => setBloqueos(e.target.value)}
                    />
                </div>
            </div>

            {/* Botón Enviar */}
            <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition transform active:scale-[0.98] flex items-center justify-center gap-2 text-lg shadow-md mt-4"
            >
            {status === 'loading' ? 'Enviando datos...' : (
                <>
                    Enviar Reporte Semanal <FaPaperPlane />
                </>
            )}
            </button>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 p-3 text-red-600 text-center text-sm font-medium">
            Hubo un error al enviar. Verifica que el link no haya caducado.
          </div>
        )}
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-medium text-blue-600">Cargando reporte...</div>}>
      <ReportForm />
    </Suspense>
  );
}