FROM node:19
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

ENTRYPOINT ["tail", "-F", "never"]