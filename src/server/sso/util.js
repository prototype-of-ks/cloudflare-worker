'use strict';
import path from 'path';
import fs from 'fs';
import shelljs from 'shelljs';
import { Buffer } from 'buffer';

/**
 * cleanPassphrase - Takes in a passphrase read from protected package cfg file
 * and prepares it for use in open ssl call
 *
 * @param  {string} raw decrypted, base64 encoded passphrase pulled from protected package cfg file
 * @return {string}     decoded, escaped passphrase
 */
function cleanPassphrase(raw) {
  // Decode the passphrase
  raw = Buffer.from(raw, 'base64').toString('utf8');

  var str = '';

  // Escape all of the characters just to be safe
  for (var i = 0; i < raw.length; i++) {
    str += '\\' + raw[i];
  }

  return str;
}

/**
 * Reads in the SSO private key for saml signing. If passphrase is provided,
 * it is assumed that he keyfile needs to be decrypted before passing back.
 *
 * @param  {String} keyFile    path to keyfile
 * @param  {String} passphrase base64 encoded passphrase for encrypted certs
 * @return {String}            decrypted private key file
 */
export function readSSOCert(keyFile, passphrase) {
  if (passphrase) {
    var shellExec = shelljs.exec;
    return shellExec(
      'openssl rsa -in ' +
        path.resolve(keyFile) +
        ' -passin pass:' +
        cleanPassphrase(passphrase) +
        '',
      { silent: true }
    ).output;
  } else {
    return fs.readFileSync(path.resolve(keyFile), 'utf-8');
  }
}
