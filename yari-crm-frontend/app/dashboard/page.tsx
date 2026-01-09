"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Student {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  last_interaction_at?: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  atRisk: number;
  withoutReport: number;
}

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats>({ 
    total: 0, 
    active: 0, 
    inactive: 0, 
    atRisk: 0,
    withoutReport: 0 
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch students
      const studentsResponse = await axios.get('http://localhost:3000/students');
      const studentsData = studentsResponse.data;
      setStudents(studentsData);
      calculateStats(studentsData);

      // Fetch recent reports
      const reportsResponse = await axios.get('http://localhost:3000/weekly-reports');
      setRecentReports(reportsResponse.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Student[]) => {
    const now = Date.now();
    const total = data.length;
    const active = data.filter(s => s.status === 'active').length;
    const inactive = data.filter(s => s.status === 'inactive').length;
    
    const atRisk = data.filter(s => {
      if (!s.last_interaction_at || s.status !== 'active') return false;
      const days = Math.floor((now - new Date(s.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 14 && days < 21;
    }).length;

    const withoutReport = data.filter(s => {
      if (!s.last_interaction_at) return true;
      const days = Math.floor((now - new Date(s.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 7;
    }).length;

    setStats({ total, active, inactive, atRisk, withoutReport });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600 mb-3 mx-auto"></div>
          <p className="text-sm text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Panel Principal</h1>
          <p className="text-sm text-gray-600 mt-1">
            Resumen general del sistema de reportes
          </p>
        </div>
      </div>

      <div className="p-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/dashboard/gestion/alumnos"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-all hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <svg className="w-6 h-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Gestión de Alumnos</h3>
                <p className="text-sm text-gray-600">Base de datos completa</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/gestion/auditoria"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-500 transition-all hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <svg className="w-6 h-6 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Auditoría de Envíos</h3>
                <p className="text-sm text-gray-600">Historial completo</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/gestion/configuracion"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-500 transition-all hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <svg className="w-6 h-6 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Configuración</h3>
                <p className="text-sm text-gray-600">Envío automático</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Alumnos"
            value={stats.total.toString()}
            subtitle="Registrados"
            color="blue"
          />
          <StatCard
            title="Activos"
            value={stats.active.toString()}
            subtitle={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% del total`}
            color="green"
          />
          <StatCard
            title="En Riesgo"
            value={stats.atRisk.toString()}
            subtitle="14-21 días sin reporte"
            color="yellow"
          />
          <StatCard
            title="Inactivos"
            value={stats.inactive.toString()}
            subtitle="+21 días sin actividad"
            color="gray"
          />
          <StatCard
            title="Sin Reporte"
            value={stats.withoutReport.toString()}
            subtitle="Esta semana"
            color="red"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">
                Últimos Reportes Recibidos
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentReports.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  No hay reportes recientes
                </div>
              ) : (
                recentReports.map((report) => (
                  <div key={report.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Reporte recibido
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(report.created_at).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        Recibido
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentReports.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <Link
                  href="/dashboard/gestion/auditoria"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Ver historial completo →
                </Link>
              </div>
            )}
          </div>

          {/* Active Students */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">
                Alumnos Activos
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {students.filter(s => s.status === 'active').slice(0, 5).map((student) => (
                <Link
                  key={student.id}
                  href={`/dashboard/gestion/alumnos/${student.id}`}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {student.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {students.filter(s => s.status === 'active').length > 5 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <Link
                  href="/dashboard/gestion/alumnos"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Ver todos los alumnos →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: any) {
  const colorClasses: any = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    gray: 'from-gray-500 to-gray-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}