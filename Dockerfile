FROM node:12

# Dockerize is needed to sync containers startup
ENV DOCKERIZE_VERSION v0.6.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz
# Create app directory
WORKDIR /usr/src/app
ENV NODE_ENV dev
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./app .
COPY ./test /test

RUN npm install --save-dev
RUN npm install -g mocha chai chai-http chai-dom
COPY ./app .
COPY ./test test

EXPOSE 8080

CMD ["npm", "test"]