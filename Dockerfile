#Use official emscripten image
FROM emscripten/emsdk:4.0.11

# Install wabt (for wasm2wat, wat2wasm, etc.)
# Install WABT prebuilt
RUN wget https://github.com/WebAssembly/wabt/releases/download/1.0.33/wabt-1.0.33-ubuntu.tar.gz \
    && tar -xvzf wabt-1.0.33-ubuntu.tar.gz \
    && cp -r wabt-1.0.33/bin/* /usr/local/bin/ \
    && rm -rf wabt-1.0.33*
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
