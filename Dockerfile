# Install dependencies only when needed
FROM node:14-alpine3.14 AS deps
# To understand why libc6-compat might be needed check the link below:
# https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
# FROM node:14-alpine3.14 AS builder
# WORKDIR /app
# COPY . .
# COPY --from=deps /app/node_modules ./node_modules
# RUN yarn build && yarn install --production --ignore-scripts --prefer-offline

# Production image, copy all the files and run next
FROM node:14-alpine3.14 AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# COPY --from=builder --chown=nestjs:nodejs app/.env ./.env
# COPY --from=builder --chown=nestjs:nodejs app/dist ./dist
COPY --from=builder app/node_modules ./node_modules
COPY --from=builder app/package.json ./package.json

USER nestjs

EXPOSE 8080

ENV PORT 8080

CMD ["yarn", "start"]