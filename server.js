const http = require('http');
const app = require('./app');
const { port }= require('./config/config');

const PORT = port || 8080;

const server = http.createServer(app);

server.listen(PORT);