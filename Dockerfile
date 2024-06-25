FROM node:21 AS development

WORKDIR /usr/src/app


COPY package*.json ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

EXPOSE 3030

RUN pnpm build



FROM node:21 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY . .

COPY --from=development /usr/src/app/dist ./dist

RUN npm install -g pnpm

RUN pnpm install --only=prod


CMD [ "node", "dist/main" ]


