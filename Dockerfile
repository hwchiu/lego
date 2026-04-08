# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files to nginx, serving under /lego path
COPY --from=builder /app/out /usr/share/nginx/html/lego

# Nginx config to handle basePath /lego and client-side routing
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
\n\
    location /lego/ {\n\
        index index.html;\n\
        try_files $uri $uri/index.html $uri/ /lego/404.html;\n\
    }\n\
\n\
    location = /lego {\n\
        return 301 /lego/;\n\
    }\n\
\n\
    location = / {\n\
        return 301 /lego/;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
