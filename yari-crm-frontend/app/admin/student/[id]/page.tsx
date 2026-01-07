"use client";

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaPaperPlane, FaTrash, FaHistory, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface Student {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  telegram_id?: string;
  status: string;
}

interface Report {
  id: number;
  created_at: string;
  answers: {
    resumen: string;
    bloqueos: string;
    procesos_activos: number;
    entrevistas_rrhh: number;
    entrevistas_tecnicas: number;
    challenges: number;
    propuestas: number;
  };
}

export default function StudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params); 
  const studentId = resolvedParams.id;

  const [student, setStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<Report[]>([]); // Estado para los reportes
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);

  // Totales calculados
  const [totals, setTotals] = useState({ entrevistas: 0, challenges: 0, propuestas: 0 });

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      // 1. Datos del alumno
      const studentRes = await axios.get(`http://localhost:3000/students/${studentId}`);
      setStudent(studentRes.data);

      // 2. Historial de reportes
      const reportsRes = await axios.get(`http://localhost:3000/weekly-reports/student/${studentId}`);
      setReports(reportsRes.data);

      // Calcular totales sumando todos los reportes
      let ent = 0, chall = 0, prop = 0;
      reportsRes.data.forEach((r: Report) => {
        ent += (r.answers.entrevistas_rrhh || 0) + (r.answers.entrevistas_tecnicas || 0);
        chall += (r.answers.challenges || 0);
        prop += (r.answers.propuestas || 0);
      });
      setTotals({ entrevistas: ent, challenges: chall, propuestas: prop });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    try {
      await axios.patch(`http://localhost:3000/students/${student.id}`, student);
      alert('Datos actualizados correctamente ✅');
    } catch (error) {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if(!confirm('¿ESTÁS SEGURO? Se borrará el alumno y todo su historial. Esto no se puede deshacer.')) return;
    try {
        await axios.delete(`http://localhost:3000/students/${studentId}`);
        router.push('/admin'); // Volver al inicio
    } catch (error) {
        alert('Error al eliminar');
    }
  };

  const handleSendLink = async () => {
    if (!confirm('¿Enviar reporte manual ahora?')) return;
    setSendingLink(true);
    try {
      await axios.post(`http://localhost:3000/magic-links/send-one/${studentId}`);
      alert('¡Enlace enviado! 📨');
    } catch (error) {
      alert('Error enviando enlace.');
    } finally {
      setSendingLink(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Cargando ficha...</div>;
  if (!student) return <div className="p-10 text-center text-red-500">Alumno no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <button onClick={() => router.back()} className="mb-6 flex items-center text-gray-500 hover:text-blue-600 transition font-medium">
        <FaArrowLeft className="mr-2" /> Volver a Base de Datos
      </button>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Datos (3 columnas de ancho) */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Perfil del Alumno</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Nombre Completo</label>
                        <input type="text" className="w-full p-2.5 border bg-gray-50 rounded-lg mt-1 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" 
                            value={student.full_name} onChange={e => setStudent({...student!, full_name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                        <input type="email" className="w-full p-2.5 border bg-gray-50 rounded-lg mt-1 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" 
                            value={student.email} onChange={e => setStudent({...student!, email: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Teléfono</label>
                            <input type="text" className="w-full p-2.5 border bg-gray-50 rounded-lg mt-1 text-gray-900" 
                                value={student.phone || ''} onChange={e => setStudent({...student!, phone: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">País</label>
                            <input type="text" className="w-full p-2.5 border bg-gray-50 rounded-lg mt-1 text-gray-900" 
                                value={student.country || ''} onChange={e => setStudent({...student!, country: e.target.value})} />
                        </div>
                    </div>
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Estado</label>
                        <select className="w-full p-2.5 border bg-gray-50 rounded-lg mt-1 text-gray-900"
                            value={student.status} onChange={e => setStudent({...student!, status: e.target.value})}>
                            <option value="active">Activo (Recibe Correos)</option>
                            <option value="inactive">Inactivo (No recibe)</option>
                            <option value="hired">CONTRATADO 🎉</option>
                        </select>
                    </div>

                    <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-md">
                        <FaSave /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>

            {/* Acciones */}
            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Zona de Control</h3>
                <button 
                    onClick={handleSendLink}
                    disabled={sendingLink}
                    className="w-full bg-green-50 text-green-700 font-bold py-3 rounded-lg border border-green-200 hover:bg-green-100 transition flex items-center justify-center gap-2"
                >
                    <FaPaperPlane /> {sendingLink ? 'Enviando...' : 'Enviar Reporte Manual'}
                </button>
                 <button onClick={handleDelete} className="w-full text-red-500 text-sm hover:bg-red-50 py-2 rounded transition flex items-center justify-center gap-2">
                    <FaTrash size={12}/> Eliminar Alumno
                </button>
            </div>
        </div>

        {/* COLUMNA DERECHA: Métricas e Historial (8 columnas de ancho) */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                    <div className="text-3xl font-bold text-purple-700">{totals.entrevistas}</div>
                    <div className="text-xs font-bold text-purple-400 uppercase">Entrevistas Totales</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-center">
                    <div className="text-3xl font-bold text-yellow-700">{totals.challenges}</div>
                    <div className="text-xs font-bold text-yellow-400 uppercase">Challenges</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                    <div className="text-3xl font-bold text-green-700">{totals.propuestas}</div>
                    <div className="text-xs font-bold text-green-400 uppercase">Propuestas</div>
                </div>
            </div>

            {/* Tabla Historial */}
            <div className="bg-white p-6 rounded-xl shadow-sm border min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaHistory className="text-blue-500"/> Historial Semanal
                    </h2>
                    <span className="text-sm text-gray-400">{reports.length} reportes recibidos</span>
                </div>

                {reports.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-lg border-dashed border-2">
                        <FaExclamationTriangle className="mx-auto mb-2 text-2xl opacity-20"/>
                        <p>No hay reportes recibidos todavía.</p>
                        <p className="text-sm">Envía un reporte manual para probar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="p-3 rounded-tl-lg">Fecha</th>
                                    <th className="p-3">Resumen</th>
                                    <th className="p-3 text-center">Métricas (E/C/P)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reports.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition">
                                        <td className="p-3 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(r.created_at).toLocaleDateString()}
                                            <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-3">
                                            <p className="text-sm text-gray-800 font-medium line-clamp-2">{r.answers.resumen}</p>
                                            {r.answers.bloqueos && (
                                                <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded mt-1 inline-block">
                                                    Bloqueo: {r.answers.bloqueos}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center text-sm font-mono text-gray-600">
                                            {/* Formato rápido: Entrevistas / Challenges / Propuestas */}
                                            <span className="text-purple-600 font-bold" title="Entrevistas">
                                                {(r.answers.entrevistas_rrhh || 0) + (r.answers.entrevistas_tecnicas || 0)}
                                            </span>
                                            <span className="mx-1 text-gray-300">/</span>
                                            <span className="text-yellow-600 font-bold" title="Challenges">
                                                {r.answers.challenges || 0}
                                            </span>
                                            <span className="mx-1 text-gray-300">/</span>
                                            <span className="text-green-600 font-bold" title="Propuestas">
                                                {r.answers.propuestas || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}