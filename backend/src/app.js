import express from 'express';
import session from './middlewares/SessionMiddleware.js';
import passport from 'passport';
import seedRoles from './utils/seedRoles.js';
import connectToDatabase from './config/db.js';
import User from './models/user.js';
  // Middleware
  const app = express();
  connectToDatabase();
  app.use(session);
  app.use(passport.initialize());
  app.use(passport.session());

  // use static authenticate method of model in LocalStrategy
  passport.use(User.createStrategy());

  // use static serialize and deserialize of model for passport session support
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());


  // Seed Roles
  await seedRoles();

  // Mounting the Routes
  // const routes = require('./routes');
  // app.use('/api', routes);

  // app.use()

export default app;