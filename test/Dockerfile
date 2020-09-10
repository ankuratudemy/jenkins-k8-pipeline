FROM calculator

COPY test test
ENV NODE_ENV dev

RUN npm install 

CMD ["npm", "test", "--reporter", "spec"]