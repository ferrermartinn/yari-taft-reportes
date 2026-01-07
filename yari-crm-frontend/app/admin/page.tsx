"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserFriends, FaChartBar, FaCogs, FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaPhone, FaGlobe, FaTelegramPlane } from 'react-icons/fa';
import { BiSolidData } from 'react-icons/bi';
import { useRouter } from 'next/navigation'; // 👈 Importamos esto para poder navegar

interface Student {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  telegram_id?: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter(); // 👈 Inicializamos el router

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ 
    full_name: '', 
    email: '', 
    phone: '', 
    country: '', 
    telegram_id: '' 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/students');
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando alumnos:", error);
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('http://localhost:3000/students', newStudent);
      alert('¡Alumno creado con éxito! 🎉');
      setIsModalOpen(false);
      setNewStudent({ full_name: '', email: '', phone: '', country: '', telegram_id: '' });
      fetchStudents();
    } catch (error) {
      alert('Error creando alumno.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 relative overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col z-10 shadow-sm">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">Y</div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">Yari CRM</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2 mt-2">Menú Principal</p>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-all duration-200">
                <FaChartBar className="text-gray-400" /> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-lg transition-all duration-200 shadow-sm">
                <BiSolidData /> Base de Datos
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-all duration-200">
                <FaUserFriends className="text-gray-400" /> Auditoría
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-all duration-200">
                <FaCogs className="text-gray-400" /> Configuración
            </button>
        </nav>
        <div className="p-4 border-t text-xs text-center text-gray-400">
            v2.0.0 - Admin Panel
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8 relative z-0">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestión de Alumnos</h1>
                <p className="text-gray-500 text-sm">Administra la base de datos completa de estudiantes.</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-medium"
            >
                <FaPlus size={14} /> Nuevo Alumno
            </button>
        </div>

        {/* Buscador y Filtros */}
        <div className="bg-white p-1 rounded-xl border shadow-sm mb-6 flex items-center">
            <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre, email..." 
                    className="w-full pl-11 pr-4 py-3 rounded-lg focus:outline-none text-gray-700 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="border-l px-4 text-sm text-gray-500">
                <span className="font-bold text-gray-800">{filteredStudents.length}</span> resultados
            </div>
        </div>

        {/* Tabla Elegante */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider border-b">
                    <tr>
                        <th className="p-5">Alumno</th>
                        <th className="p-5">Contacto</th>
                        <th className="p-5">País</th>
                        <th className="p-5 text-center">Estado</th>
                        <th className="p-5 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-400">Cargando base de datos...</td></tr>
                    ) : filteredStudents.map((student) => (
                        <tr 
                            key={student.id} 
                            // 👇 AQUÍ ESTÁ LA MAGIA: Al hacer clic, navega a la ficha
                            onClick={() => router.push(`/admin/student/${student.id}`)}
                            className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                        >
                            <td className="p-5">
                                <div className="font-bold text-gray-900">{student.full_name}</div>
                                <div className="text-xs text-gray-400">ID: #{student.id}</div>
                            </td>
                            <td className="p-5">
                                <div className="text-gray-600 text-sm">{student.email}</div>
                                {student.phone && <div className="text-xs text-gray-400 flex items-center gap-1 mt-1"><FaPhone size={10}/> {student.phone}</div>}
                            </td>
                            <td className="p-5 text-sm text-gray-600">
                                {student.country || <span className="text-gray-300">-</span>}
                            </td>
                            <td className="p-5 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${student.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    {student.status.toUpperCase()}
                                </span>
                            </td>
                            <td className="p-5 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        // Evitamos que el botón dispare el click de la fila
                                        onClick={(e) => { e.stopPropagation(); /* Lógica editar */ }} 
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Editar">
                                        <FaEdit />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); /* Lógica eliminar */ }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition" title="Eliminar">
                                        <FaTrash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </main>

      {/* --- MODAL ELEGANTE CON BLUR --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fondo con Blur y opacidad */}
            <div 
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Ventana Modal */}
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden transform transition-all scale-100">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Registrar Nuevo Alumno</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition rounded-full p-1 hover:bg-gray-200">
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-800"
                                placeholder="Ej: Lionel Messi"
                                value={newStudent.full_name}
                                onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <input 
                                type="email" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-800"
                                placeholder="ejemplo@correo.com"
                                value={newStudent.email}
                                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><FaPhone className="text-gray-400 text-xs"/> Teléfono</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-800"
                                placeholder="+54 9..."
                                value={newStudent.phone}
                                onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><FaGlobe className="text-gray-400 text-xs"/> País</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-800"
                                placeholder="Argentina"
                                value={newStudent.country}
                                onChange={(e) => setNewStudent({...newStudent, country: e.target.value})}
                            />
                        </div>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><FaTelegramPlane className="text-blue-400"/> Telegram ID (Opcional)</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-800"
                            placeholder="Ej: @usuario o 12345678"
                            value={newStudent.telegram_id}
                            onChange={(e) => setNewStudent({...newStudent, telegram_id: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Guardando...' : 'Confirmar Registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}