# ================================
# Stage 1: Build frontend
# ================================

FROM node:26-alpine AS frontend-builder

WORKDIR /app/frontend

RUN npm install -g pnpm

COPY frontend/package.json frontend/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY frontend/ .

RUN pnpm build


# ================================
# Stage 2: Build backend
# ================================

FROM node:26-alpine AS backend-builder

WORKDIR /app/backend

RUN npm install -g pnpm

COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY backend/ .

RUN pnpm build


# ================================
# Stage 3: Install production dependencies
# ================================

FROM node:26-alpine AS production-deps

WORKDIR /app/backend

RUN npm install -g pnpm

COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile --prod


# ================================
# Stage 4: Production
# ================================

FROM node:26-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=production-deps /app/backend/node_modules ./node_modules

COPY --from=backend-builder /app/backend/dist ./dist

COPY --from=frontend-builder /app/frontend/dist ./dist/public

RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["node", "dist/server.js"]