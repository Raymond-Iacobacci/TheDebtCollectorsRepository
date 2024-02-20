# Stage One
FROM node:latest AS builder
WORKDIR /app
COPY package.json package-lock.json  yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Stage Two
FROM nginx:1.21.0-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]