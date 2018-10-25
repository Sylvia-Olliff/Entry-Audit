'use strict';

import 'babel-polyfill';
import express from 'express';
import config from 'config';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from './logger';
import routes from './routes';

const app = express();
const port = config.get('SETTINGS.PORT');

morgan.token('remote-addr', (req, res) => {
  return req.connection.remoteAddress.replace(/::ffff:/g, '');
});

app.use(morgan({
  stream: logger.stream,
  format: `[LOG] ORIGIN ADDR: :remote-addr | LOCATION: :method :url | STATUS CODE: :status - :response-time[3]ms`
}));

app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

app.set('view engine', 'ejs');

routes.init(app)
  .then(app => {
    app.listen(port);
    logger.info(`Entry Audit Server listening on port: ${port}`);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
