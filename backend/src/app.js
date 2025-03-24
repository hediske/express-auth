import express from 'express';
import session from './middlewares/SessionMiddleware.js';
import passport from 'passport';
import seedRoles from './utils/seedRoles.js';
import connectToDatabase from './config/db.js';
import User from './models/User.js';

// Routes
import userRoutes from './routes/userRoutes.js';

// Middleware
const app = express();
app.use(express.json());
connectToDatabase();
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

// Use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// Use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Seed Roles
await seedRoles();

// Mounting the Routes
app.use('/api/user', userRoutes);

export default app;