FROM node:21-alpine

WORKDIR /src

COPY package*.json .

RUN npm i --silent

COPY . .

RUN npm run build 

CMD ["npm", "run", "start:dev"]