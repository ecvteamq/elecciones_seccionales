# Imagen de producción del backend (Express)
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Instalar dependencias primero para aprovechar la caché de capas.
# package-lock.json es opcional porque está en .gitignore.
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi \
    && npm cache clean --force

COPY --chown=node:node . .

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3001) + '/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "index.js"]
