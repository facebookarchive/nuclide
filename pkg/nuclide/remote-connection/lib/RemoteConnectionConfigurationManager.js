'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import crypto from 'crypto';
import invariant from 'assert';
import {getLogger} from '../../logging';
import type {ServerConnectionConfiguration} from './ServerConnection';

const logger = getLogger();

/**
 * Version of ServerConnectionConfiguration that uses string instead of Buffer for fields so it can
 * be translated directly to/from JSON.
 */
type SerializableServerConnectionConfiguration = {
  host: string;
  port: number;
  certificateAuthorityCertificate?: string;
  clientCertificate?: string;
  clientKey?: string;
};

const CONFIG_KEY_PREFIX = 'nuclide.nuclide-connection.config';

export function getConnectionConfig(host: string): ?ServerConnectionConfiguration {
  // $FlowIssue
  const storedConfig = atom.config.get(getAtomConfigKey(host));
  // $UPFixMe: These settings should go through nuclide-feature-config
  if (!storedConfig) {
    return null;
  }
  try {
    return decryptConfig(storedConfig);
  } catch (e) {
    logger.error(`The configuration file for ${host} is corrupted.`, e);
    return null;
  }
}

export function setConnectionConfig(config: ServerConnectionConfiguration): void {
  try {
    atom.config.set(getAtomConfigKey(config.host), encryptConfig(config));
  } catch (e) {
    logger.error(`Failed to store configuration file for ${config.host}.`, e);
  }
}

function getAtomConfigKey(host: string): string {
  return `${CONFIG_KEY_PREFIX}.${host}`;
}

/**
 * Encrypts the clientKey of a ConnectionConfig.
 * @param remoteProjectConfig - The config with the clientKey we want encrypted.
 * @return returns the passed in config with the clientKey encrypted.
 */
function encryptConfig(
  remoteProjectConfig: ServerConnectionConfiguration,
): SerializableServerConnectionConfiguration {
  const {replacePassword} = require('../../keytar-wrapper');

  const sha1 = crypto.createHash('sha1');
  sha1.update(`${remoteProjectConfig.host}:${remoteProjectConfig.port}`);
  const sha1sum = sha1.digest('hex');

  const {certificateAuthorityCertificate, clientCertificate, clientKey} = remoteProjectConfig;
  invariant(clientKey);
  const realClientKey = clientKey.toString(); // Convert from Buffer to string.
  const {salt, password, encryptedString} = encryptString(realClientKey);
  replacePassword('nuclide.remoteProjectConfig', sha1sum, password);

  const clientKeyWithSalt = encryptedString + '.' + salt;

  invariant(certificateAuthorityCertificate);
  invariant(clientCertificate);

  return {
    host: remoteProjectConfig.host,
    port: remoteProjectConfig.port,
    certificateAuthorityCertificate: certificateAuthorityCertificate.toString(),
    clientCertificate: clientCertificate.toString(),
    clientKey: clientKeyWithSalt,
  };
}

/**
 * Decrypts the clientKey of a SerializableServerConnectionConfiguration.
 * @param remoteProjectConfig - The config with the clientKey we want encrypted.
 * @return returns the passed in config with the clientKey encrypted.
 */
function decryptConfig(
  remoteProjectConfig: SerializableServerConnectionConfiguration,
): ServerConnectionConfiguration {
  const {getPassword} = require('../../keytar-wrapper');

  const sha1 = crypto.createHash('sha1');
  sha1.update(`${remoteProjectConfig.host}:${remoteProjectConfig.port}`);
  const sha1sum = sha1.digest('hex');

  const password = getPassword('nuclide.remoteProjectConfig', sha1sum);

  if (!password) {
    throw new Error('Cannot find password for encrypted client key');
  }

  const {certificateAuthorityCertificate, clientCertificate, clientKey} = remoteProjectConfig;
  invariant(clientKey);
  const [encryptedString, salt] = clientKey.split('.');

  if (!encryptedString || !salt) {
    throw new Error('Cannot decrypt client key');
  }

  const restoredClientKey = decryptString(encryptedString, password, salt);
  //  "nolint" is to suppress ArcanistPrivateKeyLinter errors
  if (!restoredClientKey.startsWith('-----BEGIN RSA PRIVATE KEY-----')) { /*nolint*/
    getLogger().error(
      `decrypted client key did not start with expected header: ${restoredClientKey}`);
  }

  invariant(certificateAuthorityCertificate);
  invariant(clientCertificate);
  return {
    host: remoteProjectConfig.host,
    port: remoteProjectConfig.port,
    certificateAuthorityCertificate: new Buffer(certificateAuthorityCertificate),
    clientCertificate: new Buffer(clientCertificate),
    clientKey: new Buffer(restoredClientKey),
  };
}

function decryptString(text: string, password: string, salt: string): string {
  const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      new Buffer(password, 'base64'),
      new Buffer(salt, 'base64'));

  let decryptedString = decipher.update(text, 'base64', 'utf8');
  decryptedString += decipher.final('utf8');

  return decryptedString;
}

function encryptString(text: string): {password: string; salt: string; encryptedString: string} {
  const password = crypto.randomBytes(16).toString('base64');
  const salt = crypto.randomBytes(16).toString('base64');

  const cipher = crypto.createCipheriv(
    'aes-128-cbc',
    new Buffer(password, 'base64'),
    new Buffer(salt, 'base64'));

  let encryptedString = cipher.update(
    text,
    /* input_encoding */ 'utf8',
    /* output_encoding */ 'base64',
  );
  encryptedString += cipher.final('base64');

  return {
    password,
    salt,
    encryptedString,
  };
}

export const __test__ = {
  decryptString,
  encryptString,
};
