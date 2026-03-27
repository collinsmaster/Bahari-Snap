# Build stage
FROM node:20-slim AS builder

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Generate Prisma Client and build the app
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-slim

RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig.json ./

# Install tsx for running server.ts in production if needed, 
# or use a compiled server.ts. Since we use tsx in dev, 
# let's ensure it's available or compile server.ts.
# For simplicity in this environment, we'll use tsx to run server.ts.
RUN npm install -g tsx

EXPOSE 3000

# Run migrations and start the server
CMD ["sh", "-c", "npx prisma generate && npx prisma db push && tsx server.ts"]
