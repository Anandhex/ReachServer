const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongooseSantize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRoutes = require('./routes/userRoutes');

const app = express();

// middlewares
//http header
app.use(helmet());

app.use(cors());

//setting rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP in an hour'
});

app.use('/api', limiter);

//body parser
app.use(
  express.json({
    limit: '10kb'
  })
);

//protect against nosql injection
app.use(mongooseSantize());

//against js attacks
app.use(xss());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// routes
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
