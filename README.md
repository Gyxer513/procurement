
pnpm nx run-many --target=serve --projects=api,web --parallel

Быстрая проверка сборки/линта/тестов (опционально)

pnpm nx build api
pnpm nx build web
pnpm nx lint api web
pnpm nx test web
pnpm nx test api
