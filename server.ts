import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import Database from './db';
import mountPaymentsEndpoints from './routes/payments';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3314;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Initialize database connection
const initApp = async () => {
  try {
    const db = Database.getInstance();
    await db.connect();
    app.locals.db = db.getDb();

    // Mount payment routes
    const router = express.Router();
    mountPaymentsEndpoints(router);
    app.use('/api/payments', router);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

// Configure platform API client
import axios from 'axios';
import { platformAPIClient } from './services/platformAPIClient';

platformAPIClient.defaults.baseURL = process.env.PLATFORM_API_URL;
platformAPIClient.defaults.headers.common['Authorization'] = `Key ${process.env.PI_API_KEY}`;

initApp();

// platformAPIClient.ts (in services directory)
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const platformAPIClient = axios.create({
  baseURL: process.env.PLATFORM_API_URL,
  timeout: 20000,
  headers: {
    'Authorization': `Key ${process.env.PI_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export default platformAPIClient;