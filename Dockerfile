#Use official emscripten image
FROM emscripten/emsdk:4.0.11

#Set working dir
WORKDIR /app

#Copy package files for Node server
COPY package*.json ./

#Install only prod dependencies
RUN npm install --only=production

#Copy source code
COPY . .

#Expose the server port
EXPOSE 3333

#Default command to start the Node.js server
CMD ["node", "server.js"]
