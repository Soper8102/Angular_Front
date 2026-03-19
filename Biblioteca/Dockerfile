# ETAPA 1: Construcción (Build)
FROM node:20-alpine AS build

WORKDIR /app

# Copiar configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente completo
COPY . .

# Construir la aplicación para producción (genera la carpeta dist)
RUN npm run build

# ETAPA 2: Servidor Node para SSR (Server-Side Rendering)
FROM node:20-alpine

WORKDIR /app

# Copiamos la carpeta dist y los archivos de empaquetado generados
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Instalamos solo las dependencias de producción (necesitaremos el proxy y otras utilidades en runtime)
RUN npm ci --omit=dev

# Le indicamos al servidor SSR interno de Angular que escuche en el puerto 4200
ENV PORT=4200

# Configuramos la ruta del backend para que el contenedor detecte el puerto 8080 de LA MÁQUINA HOST
ENV BACKEND_URL="http://host.docker.internal:8080"

# Exponemos el puerto 4200 hacia afuera del contenedor
EXPOSE 4200

# Iniciamos el servidor de Node usando la ruta definida en tu package.json
CMD ["node", "dist/Biblioteca/server/server.mjs"]
