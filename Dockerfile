FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=https://sricu-uls-api.onrender.com/api
ARG VITE_MAX_UPLOAD_MB=20
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MAX_UPLOAD_MB=$VITE_MAX_UPLOAD_MB
RUN npm run build
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
