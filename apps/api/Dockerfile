FROM node:20-slim

WORKDIR /app

# Copy monorepo root files for workspace support
COPY package.json package-lock.json tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database ./packages/database/

# Install dependencies (including workspace dependencies)
RUN npm install

# Generate Prisma client
RUN npm run db:generate

# Copy source
COPY apps/api ./apps/api

# Build
RUN npm run build -w apps/api

EXPOSE 8080

ENV PORT 8080

CMD ["npm", "start", "-w", "apps/api"]
