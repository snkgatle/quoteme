FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/
RUN npm install
COPY . .
RUN npm run build -w packages/database
RUN npm run build -w apps/api

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database ./packages/database
RUN npm install --omit=dev
EXPOSE 3001
CMD ["npm", "start", "-w", "apps/api"]
