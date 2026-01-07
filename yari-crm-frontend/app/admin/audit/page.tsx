"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserFriends, FaChartBar, FaCogs, FaSearch, FaHistory, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { BiSolidData } from 'react-icons/bi';
import { useRouter } from 'next/navigation';

export default function AuditPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Traer TODOS los reportes
    axios.get('http://localhost:3000/weekly-reports')
        .then(res => {
            setReports(res.data);
            setLoading(false);
        })
        .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 relative overflow-hidden">
        {/* SIDEBAR (Simple navigation) */}
        <aside className="w-64 bg-white border-r flex flex-col z-10 shadow-sm">
            <div className="p-6 border-b flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">Y</div>
            <span className="text-xl font-bold text-gray-800">Yari CRM</span>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                <button onClick={() => router.push('/admin')} className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition">
                    <BiSolidData /> Base de Datos
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-lg transition">
                    <FaHistory /> Auditoría Envíos
                </button>
            </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Auditoría de Envíos</h1>
                <p className="text-gray-500">Monitorea quién está cumpliendo con sus reportes.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Fecha Recepción</th>
                            <th className="p-4">Alumno</th>
                            <th className="p-4">Resumen Semanal</th>
                            <th className="p-4 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr><td colSpan={4} className="p-8 text-center">Cargando auditoría...</td></tr>
                        ) : reports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(report.created_at).toLocaleString()}
                                </td>
                                <td className="p-4 font-bold text-blue-600 cursor-pointer hover:underline" onClick={() => router.push(`/admin/student/${report.student_id}`)}>
                                    {report.student?.full_name || 'Alumno Desconocido'}
                                    <div className="text-xs text-gray-400 font-normal">{report.student?.email}</div>
                                </td>
                                <td className="p-4 text-sm text-gray-700 max-w-md truncate">
                                    {report.answers.resumen}
                                </td>
                                <td className="p-4 text-center">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                                        <FaCheck size={10}/> RECIBIDO
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    </div>
  );
}