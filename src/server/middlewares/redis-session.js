import session from 'express-session';
import ioRedis from 'ioredis';
import ConnectRedis from 'connect-redis';
import * as config from '../config.js';

const redisConfig = config.redis;
const sessionConfig = config.session;
const RedisStore = ConnectRedis(session);

export default function () {
  const host = redisConfig.host;
  const port = redisConfig.port;
  const pass = redisConfig.pass;
  const isClusterNeeded = redisConfig.clusterEnable;

  const nodes = [
    {
      port: port,
      host: host,
    },
  ];

  /** @type {ConnectRedis.RedisStoreOptions} */
  const redisOptions = {
    prefix: redisConfig.prefix,
    client: new ioRedis({
      host: host,
      port: port,
      password: pass,
      lazyConnect: true,
    }),
    logErrors: function () {
      console.error({ function: 'REDIS CONNECT error' });
    },
  };

  if (isClusterNeeded) {
    const cluster = new ioRedis.Cluster(nodes, {
      redisOptions: {
        password: pass,
        tls: {
          servername: host,
          rejectUnauthorized: false,
        },
      },
    });
    cluster.on('connect', function () {
      //console.log("REDIS CONNECT  "+ err);
      console.log('REDIS CONNECT success');
    });

    cluster.on('ready', function () {
      //console.log("REDIS READY "+ err);
      console.log('REDIS ready');
    });

    redisOptions.client = cluster;
  } else {
    redisOptions.pass = pass;
  }

  return session({
    ...sessionConfig,
    store: new RedisStore(redisOptions),
  });
}
