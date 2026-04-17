import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import dns from 'dns';

// Override local DNS to Google's Public DNS to bypass SRV query blocks
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Routes
import authRoutes from './routes/auth.js';
import surveyRoutes from './routes/surveys.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const allowedOrigins = [
  'http://localhost:3000',
  'https://surveyquest-blush.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Attach io to req so we can use it in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Setup Routes
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io for Realtime Connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextgen-survey';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
app.get('/', (req, res) => {
  res.send("Backend is running 🚀");
});