const mongoose = require('mongoose');
const dotnev = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

dotnev.config({ path: './.env' });

const DB = process.env.DB.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB started'));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
