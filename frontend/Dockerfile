# Build stage
FROM docker.io/library/node:20-slim AS builder

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

# Serve stage
FROM docker.io/library/nginx:alpine

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
