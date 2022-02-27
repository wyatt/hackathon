FROM node:16-alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY .yarn .

RUN yarn install

COPY . .

# Remove the env file from backend as we'll inject these at compose level
RUN rm ./apps/backend/.env

RUN yarn db:generate
RUN yarn server-build

CMD ["yarn", "docker-start"]