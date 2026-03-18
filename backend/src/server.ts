import { app } from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Synapse] Server running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`[Synapse] ${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('[Synapse] HTTP server closed.');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
};

startServer();
