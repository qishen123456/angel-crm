FROM node:20-slim AS builder

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    NODE_ENV=production \
    NPM_REGISTRY=https://registry.npmmirror.com

WORKDIR /app

COPY package*.json ./
RUN npm config set registry $NPM_REGISTRY && npm ci --include=dev

COPY . .
RUN npm run build

FROM nginx:alpine

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
