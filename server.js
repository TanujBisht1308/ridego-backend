// Entry point — starts the HTTP server + Socket.IO, after confirming the
// database connection is healthy.

import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';
import { initSocket } from './src/sockets/socketManager.js';

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`RideGo API running on port ${env.port}`);
    console.log(`Environment: ${env.nodeEnv}`);
    console.log('Socket.IO ready');
  });
};

startServer();