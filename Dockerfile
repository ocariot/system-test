FROM node:10.15.3
RUN mkdir -p /usr/src/ac 
WORKDIR /usr/src/ac 

COPY package.json /usr/src/ac/ 
RUN npm install 
COPY . /usr/src/ac 

EXPOSE 5000

ENTRYPOINT  npm run build && npm start

