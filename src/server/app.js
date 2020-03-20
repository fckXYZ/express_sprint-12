require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const cardsRouter = require('./routes/cards');
const usersRouter = require('./routes/users');
const wrongAddress = require('./routes/wrongAddress');
const errorsHandler = require('./routes/errors');
const config = require('./config.js');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const skipLogs = (req, res) => res.statusCode < 399;

app.use(helmet());
app.use(morgan('combined', { stream: accessLogStream, skip: skipLogs }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
})
  .catch((err) => {
    console.error(err);
  });

app.listen(config.PORT, () => {});
//  routes

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use('/', cardsRouter, usersRouter);
app.use(errorsHandler);
app.use(wrongAddress);
