# Etapa 1: Construcción (Build)
FROM node:22-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para poder hacer el build)
RUN npm ci || npm install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación Angular
RUN npm run build

# Etapa 2: Producción (Serve SSR)
FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo las dependencias de producción
RUN npm ci --omit=dev || npm install --production

# Copiar la carpeta 'dist' generada en la etapa de construcción
COPY --from=build /app/dist ./dist

# Variables de entorno
ENV PORT=4000
ENV NODE_ENV=production

# Exponer el puerto
EXPOSE 4000

# Ejecutar el servidor SSR de Angular
CMD ["npm", "run", "serve:ssr:Biblioteca"]
