FROM node:lts-alpine

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install && mv node_modules ../

COPY . .

EXPOSE 4000:4000

RUN chown -R node /usr/src/app

USER node

CMD ["node", "server"]
