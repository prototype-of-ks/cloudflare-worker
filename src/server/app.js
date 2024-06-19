import express from 'express';
import sso from './sso/index.js';
import * as config from './config.js';
import http from 'http';
import fs from 'fs';
import spdy from 'spdy';
import sessionRedis from './middlewares/redis-session.js';
import bodyParser from 'body-parser';
import compression from 'compression';

const app = express();

app.use(sessionRedis());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(sso(config.sso));

app.use(compression());

app.get('/', (req, res) => {
  res.json({
    message: 'message'
  });
});

http.createServer(app).listen(config.port.http, async () => {
  console.log(`🚀 Http server ready at http://localhost:${config.port.http}`);
});

spdy
  .createServer(
    {
      key: fs.readFileSync(config.tls.key),
      cert: fs.readFileSync(config.tls.cert),
    },
    app
  )
  .listen(config.port.https, () => {
    console.log(`🤺 Https server ready at https://localhost:${config.port.https}`);
  });
