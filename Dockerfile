FROM node:17

WORKDIR /server

COPY package.json /server
RUN npm i

COPY . .

EXPOSE 5000

CMD ["node", "app.js"]