const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const mongoose = require('mongoose');
const webpush = require('web-push');

const { sessionMiddleware } = require('./utils/middlewares');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');

const pre_populate = require('./dummy-data/pre_populate');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URL || 'mongodb://localhost/test', {
  })
  .then(() => {
    console.log('connected to database!', 'pre_populating now...');
    pre_populate();
  })
  .catch((err) => {
    console.log('error starting database', err);
  });

const app = express();
const passport = require('./passport');
// app.set('trust proxy', 1) // trust first proxy, when node is behind proxy server

app.use(sessionMiddleware);

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

webpush.setVapidDetails(process.env.WEB_PUSH_CONTACT, process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);

app.use('/api', apiRouter);
app.use('/auth', authRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

exports.app = app;
