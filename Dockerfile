FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist /usr/share/nginx/html/letter_to_self

RUN rm /etc/nginx/conf.d/default.conf
COPY vite-nginx.conf /etc/nginx/conf.d/nginx.conf

# Environment variables for runtime
ENV DATABASE_URL=$DATABASE_URL
ENV NEON_PROJECT_ID=$NEON_PROJECT_ID
ENV NEON_API_KEY=$NEON_API_KEY

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
