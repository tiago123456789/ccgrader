FROM node:22-alpine as builder

ENV VITE_API_URL=http://localhost:3000

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY firebase.json ./

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY scripts/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]