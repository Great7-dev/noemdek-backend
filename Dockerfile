FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN yarn
COPY . .
EXPOSE 4000
USER node
CMD ["yarn", "start"]
