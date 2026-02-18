# Этап 1: сборка Next.js (не путать с папкой проекта "builder")
FROM node:20-alpine AS next-build

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код проекта
COPY . .

# Собираем Next.js приложение
RUN npm run build

# Этап 2: минимальный образ для запуска приложения
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Копируем результат сборки из первого этапа
COPY --from=next-build /app/.next/standalone ./
COPY --from=next-build /app/.next/static ./.next/static
COPY --from=next-build /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]