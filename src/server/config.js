import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const vaultPath = path.resolve(__dirname, '../../vault');
const ssoCertPath = path.resolve(vaultPath, 'sso-cert.pem');
const ssoPrivateKeyPath = path.resolve(vaultPath, 'privkeysso.pem');
const sslCert = path.resolve(vaultPath, 'ssl-cert.pem');
const sslKey = path.resolve(vaultPath, 'ssl-key.pem');
const ssoCert = fs.readFileSync(ssoCertPath, 'utf-8').toString();

export const port = {
  http: 4001,
  https: 8444,
};

export const tls = {
  cert: sslCert,
  key: sslKey,
};

export const sso = {
  devMode: false,
  ajaxTimeoutStatus: true,
  exclude: [
    '/oauth2',
    '/profile/images/:image',
    '/sites/default/files/(.*)',
    '/css/(.*)',
    '/js/(.*)',
    '/scripts/(.*)',
    '/livenessprobe',
  ],
  issuer: 'https://peoplexdev1.corp.ebay.com',
  path: '/saml/acs',
  cert: ssoCert,
  privateCertPath: ssoPrivateKeyPath,
  entryPoint: 'https://ssodev.corp.ebay.com/idp/SSO.saml2',
  impersonateAs: {
    Corpid: [
      'srganapur',
      'samganesan',
      'shegu',
      'dazhang',
      'shke',
      'tzhang4',
    ][2],
    Type: 'Employee',
    Email: 'sijzhu@ebay.com',
    FirstName: 'Sijia',
    DisplayName: 'Sijia Sijia ',
    LastName: 'Zhu',
    QID: 'Q10526860',
  },
};

export const redis = {
  host: 'localhost',
  port: 6379,
  pass: '',
  prefix: 'peoplexdev1:',
  clusterEnable: false,
};

export const session = {
  cookie: {
    httpOnly: true,
    maxAge: 10800000,
    secure: false,
  },
  rolling: false,
  proxy: true,
  resave: false,
  saveUninitialized: false,
  secret: '111',
};
