// Script para probar el envío de emails
// Instalar axios primero: npm install axios
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testEmail() {
  try {
    console.log('🔍 Verificando que el backend esté corriendo...');
    
    // 1. Verificar health check
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Backend está corriendo:', healthResponse.data);
    
    // 2. Obtener lista de estudiantes
    console.log('\n📋 Obteniendo lista de estudiantes...');
    const studentsResponse = await axios.get(`${API_URL}/students`);
    const students = studentsResponse.data;
    
    if (!students || students.length === 0) {
      console.log('❌ No hay estudiantes en la base de datos.');
      console.log('💡 Primero agrega un estudiante desde el dashboard.');
      return;
    }
    
    console.log(`✅ Encontrados ${students.length} estudiante(s):`);
    students.forEach((student, index) => {
      console.log(`   ${index + 1}. ID: ${student.id} - ${student.full_name} (${student.email})`);
    });
    
    // 3. Usar el primer estudiante para la prueba
    const testStudent = students[0];
    console.log(`\n🧪 Enviando email de prueba a: ${testStudent.full_name} (${testStudent.email})`);
    console.log(`   ID del estudiante: ${testStudent.id}`);
    
    // 4. Enviar email de prueba
    const testResponse = await axios.post(`${API_URL}/sync/test-send/${testStudent.id}`);
    
    if (testResponse.data.success) {
      console.log('\n✅ ¡Email enviado exitosamente!');
      console.log('📧 Detalles:', testResponse.data);
      console.log(`\n🔗 Link del formulario: ${testResponse.data.link}`);
      console.log('\n💡 Revisa el email del estudiante para verificar que llegó.');
    } else {
      console.log('\n❌ Error al enviar email:', testResponse.data.error);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Error: El backend no está corriendo en http://localhost:3000');
      console.log('💡 Inicia el backend con: cd yari-crm-backend && npm run start:dev');
    } else if (error.response) {
      console.log('❌ Error del servidor:', error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testEmail();
