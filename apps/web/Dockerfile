# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json ./
COPY apps ./apps

RUN pnpm install --frozen-lockfile
RUN pnpm nx build web

# ---- run ----
FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# ВАЖНО: outDir = apps/dist/web
COPY --from=build /app/apps/dist/web ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
