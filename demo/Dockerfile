FROM node:18 as react-builder

WORKDIR /app

RUN corepack enable

COPY ./demo/package.json ./demo/pnpm-lock.yaml ./
RUN pnpm install

COPY ./demo ./
RUN pnpm run build