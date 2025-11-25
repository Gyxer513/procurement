# Монорепозиторий Nx + pnpm (api + web)
### Интегрированный Nx-монорепозиторий с pnpm:
```text
backend: NestJS (apps/api)
frontend: React + Vite (apps/web)
```

### Требования

Node 18 LTS или 20 LTS (одинаковая версия на всех машинах)
pnpm 8+ (рекомендуется включить corepack: corepack enable)
Один корневой package.json. В apps/* и libs/* package.json не создаём.

### Опционально:

.nvmrc или Volta для фиксации версии Node
Docker для локальных сервисов (например, MongoDB через docker-compose)
Установка

```shell
## Клонируй репозиторий
git clone <link>
## Установи зависимости
pnpm install
```


### Проверка видимости проектов
```shell
pnpm nx graph
```

### Переменные окружения
Создай файл .env в корне на основе .env.example. Примеры:

Общие
NODE_ENV=development
Backend (Nest)
PORT=3000
MONGODB_URI=mongodb://localhost:27017/procurement
Frontend (Vite)
VITE_API_URL=http://localhost:3000
Рекомендуется использовать @nestjs/config:

pnpm add -w @nestjs/config
В AppModule: ConfigModule.forRoot({ isGlobal: true })
Если без @nestjs/config — достаточно добавить в main.ts:

import 'dotenv/config'
Быстрый старт (dev)
Запуск API: pnpm nx serve api
Запуск Web (Vite dev): pnpm nx dev web
Оба параллельно: pnpm nx run-many -t serve -p api,web --parallel
Сборка, линт и тесты
Сборка
```shell
pnpm nx build api
pnpm nx build web
## Линт
pnpm nx lint api
pnpm nx lint web
## Тесты
pnpm nx test api
pnpm nx test web
```
________
### Форматирование

```text
Проверка: pnpm nx format:check
Исправить: pnpm nx format:write
```
____
### Добавление пакетов
В интегрированном режиме все зависимости ставятся в корень:

Runtime-зависимость: 
```text
pnpm add -w имя@версия
пример: pnpm add -w @nestjs/mongoose mongoose
Dev-зависимость: pnpm add -w -D имя
пример: pnpm add -w -D @types/node
Удалить: pnpm remove -w имя
Обновить: pnpm update -w имя
```

Зависимости «только для одного проекта» также ставим в корень. Локальные package.json внутри apps/* не используем.

Генераторы кода (nx g)
Nest (api)
Модуль: pnpm nx g @nx/nest:module purchases --project=api
Контроллер: pnpm nx g @nx/nest:controller purchases --project=api --flat
Сервис: pnpm nx g @nx/nest:service purchases --project=api --flat
React (web)
Компонент: pnpm nx g @nx/react:component Button --project=web --style=css
Общие библиотеки
pnpm nx g @nx/js:lib utils
затем импортируй из @proj/utils (или из настроенного алиаса)
Affected (только изменённое относительно master)

```text
Сборка: pnpm nx affected -t build
Тесты: pnpm nx affected -t test
Линт: pnpm nx affected -t lint
Граф: pnpm nx affected:graph
База сравнения задаётся в nx.json (defaultBase: master).
```


Полезные команды Nx
Диаграмма зависимостей: pnpm nx graph
Несколько таргетов: pnpm nx run-many -t build -p api,web --parallel
Сброс кэша/состояния: pnpm nx reset
Nx Cloud (ускоряет CI): pnpm nx connect-to-nx-cloud
Docker (опционально)
Если используется docker-compose.yml (например, для MongoDB):

docker-compose up -d
Проверь MONGODB_URI в .env
Правила репозитория
Используем только pnpm.
Не коммитим package-lock.json и не создаём package.json в apps/* и libs/*.
pnpm-workspace.yaml:
packages:
apps/*
libs*
tools/*
.npmrc в корне:
auto-install-peers=true
при необходимости: strict-peer-dependencies=false
Обновление Nx и миграции
pnpm dlx nx@latest migrate latest
pnpm install
pnpm nx migrate --run-migrations
Закоммитить изменения
Типичные проблемы и решения
Module not found (пакет не найден)
Установи в корень: pnpm add -w имя
Затем pnpm nx reset и pnpm install
Конфликт менеджеров пакетов
Удалить все package-lock.json и локальные node_modules в подпроектах
Оставить только pnpm-lock.yaml в корне
.env не подхватывается
Для Nest — проверь @nestjs/config или import 'dotenv/config'
Для Vite — переменные должны начинаться с VITE_
Несовпадение Node
Выравнивай через .nvmrc или Volta
Скрипты-алиасы (рекомендуется добавить в package.json)
"serve:api": "nx serve api"
"serve:web": "nx dev web"
"serve:all": "nx run-many -t serve -p api,web --parallel"
"build:all": "nx run-many -t build --all"
"lint:all": "nx run-many -t lint --all"
"test:all": "nx run-many -t test --all"
"affected:build": "nx affected -t build"
"affected:test": "nx affected -t test"
"graph": "nx graph"
"reset": "nx reset"
Примеры установок
Nest + MongoDB:
pnpm add -w @nestjs/mongoose mongoose
pnpm add -w @nestjs/config
Dotenv (если без @nestjs/config):
pnpm add -w dotenv
в main.ts: import 'dotenv/config'
Типы и инструменты:
pnpm add -w -D @types/node eslint prettier
