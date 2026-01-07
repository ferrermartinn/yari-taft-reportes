# 1. Usamos una imagen de Node.js oficial (Versión 20 que es la que usas)
FROM node:20

# 2. Creamos la carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiamos los archivos de definición de paquetes primero (para aprovechar la caché)
COPY package*.json ./

# 4. Instalamos las dependencias
RUN npm install

# 5. Copiamos el resto del código fuente
COPY . .

# 6. Construimos la aplicación (NestJS build)
RUN npm run build

# 7. Exponemos el puerto 3000
EXPOSE 3000

# 8. Comando para iniciar en modo producción (o dev según configuremos luego)
CMD ["npm", "run", "start:prod"]