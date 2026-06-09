# Build reproduzivel com dependencias travadas pelo package-lock.
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./

RUN npm run prisma:generate \
  && npm run build \
  && npm prune --omit=dev

# Imagem final menor e executada sem privilegios de root.
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system safehome \
  && adduser --system --ingroup safehome safehome

COPY --from=build --chown=safehome:safehome /app/node_modules ./node_modules
COPY --from=build --chown=safehome:safehome /app/dist ./dist
COPY --from=build --chown=safehome:safehome /app/prisma ./prisma
COPY --chown=safehome:safehome package.json ./

USER safehome

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3333/api/v1/health || exit 1

CMD ["npm", "run", "start"]
