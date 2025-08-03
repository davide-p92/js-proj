#Use official emscripten image
FROM emscripten/emsdk:4.0.11

# Install wabt (for wasm2wat, wat2wasm, etc.)
RUN apt-get update && \
    apt-get install -y wget cmake git build-essential && \
    git clone --recursive https://github.com/WebAssembly/wabt && \
    cd wabt && \
    cmake . && \
    make && \
    make install

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
CMD ["/bin/bash", "-c", "source /emsdk/emsdk_env.sh && node server.js"]
