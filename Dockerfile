FROM node:26-alpine3.24

WORKDIR /app

RUN npm install -g corepack

RUN corepack enable

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
RUN pnpm install -y

COPY . .

RUN pnpm build

CMD ["node", ".output/server/index.mjs"]