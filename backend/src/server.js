const app = require('./app');
const config = require('./config');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initializeSocket } = require('./sockets');
const logger = require('./utils/logger');
const http = require('http');
const { Server } = require('socket.io');

connectDB();
connectRedis();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    credentials: true,
  },
});

initializeSocket(io);

server.listen(config.port, () => {
  logger.info(`EMS Server running on port ${config.port} [${config.env}]`);
  logger.info(`Swagger docs: http://localhost:${config.port}/api-docs`);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

module.exports = server;
