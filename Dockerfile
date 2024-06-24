FROM node:21 AS development

WORKDIR /usr/src/app

COPY . .

RUN npm install -g pnpm

RUN pnpm install

EXPOSE 3030

CMD ["pnpm", "start:dev"]

