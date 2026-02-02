# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run expects 8080
EXPOSE 8080
