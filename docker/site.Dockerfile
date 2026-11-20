FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM nginx:stable-alpine
COPY --from=build /app/build/prod/ /usr/share/nginx/html/
EXPOSE 80
