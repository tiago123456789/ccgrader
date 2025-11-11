FROM node:22-alpine as build

WORKDIR /app

COPY package*.json .

COPY pnpm-lock.yaml .

COPY tsconfig.json .

COPY . .

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm run build


FROM node:22-alpine as run

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml

COPY ./fcredential.json ./fcredential.json

RUN npm install -g pnpm

RUN pnpm install --prod

EXPOSE 3000

CMD ["node", "dist/index.js"]
