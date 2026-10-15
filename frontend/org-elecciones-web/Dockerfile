# ---------- Etapa 1: build de Angular ----------
# Angular 14 es compatible con Node 16
FROM node:16-alpine AS build

WORKDIR /app

COPY package*.json .npmrc ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

# URL del backend que usará el navegador. Vacío = mismo dominio que el front
# (nginx reenvía /api/* al contenedor del backend).
ARG API_URL=""
RUN sed -i "s#^\([[:space:]]*\)API_URL[[:space:]]*:.*#\1API_URL: '${API_URL}',#" src/environments/environment.prod.ts \
    && npx ng build --configuration production

# ---------- Etapa 2: servir con nginx ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/flexy-angular /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
