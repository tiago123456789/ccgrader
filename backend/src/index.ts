import * as dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import { closeRedisConnection } from './config/redis';
import cors from 'cors';
import apiRoutes from './routes';
import handleExceptionMiddleware from './middlewares/handle-exception.middleware';
import helmet from 'helmet';
import { getBullBoard } from './config/bull-board';


const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN_ALLOWED
}));
app.use(helmet());


app.use('/api', apiRoutes);
app.use("/queue-board", getBullBoard().getRouter());
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use(handleExceptionMiddleware);

const initializeApp = async () => {
  try {
    console.log('✅ Redis initialized successfully');

    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
      console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await closeRedisConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await closeRedisConnection();
  process.exit(0);
});

initializeApp();
