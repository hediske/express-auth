import express from 'express';
import {session} from './middlewares/SessionMiddleware'
// const routes = require('./routes');

const app = express();
app.use(session)



// Mounting the Routes
// app.use('/api', routes);

// app.use()

module.exports = app;