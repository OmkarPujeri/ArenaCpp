FROM node:18

# Install g++ compiler
RUN apt-get update && \
    apt-get install -y g++ && \
    apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]