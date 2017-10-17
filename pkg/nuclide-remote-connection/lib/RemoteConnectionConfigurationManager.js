'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = exports.clearConnectionConfig = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let clearConnectionConfig = exports.clearConnectionConfig = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (host) {
    try {
      localStorage.removeItem(getStorageKey(host));
    } catch (e) {
      logger.error(`Failed to clear configuration for ${host}.`, e);
    }
  });

  return function clearConnectionConfig(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Encrypts the clientKey of a ConnectionConfig.
 * @param remoteProjectConfig - The config with the clientKey we want encrypted.
 * @return returns the passed in config with the clientKey encrypted.
 */


exports.getConnectionConfig = getConnectionConfig;
exports.setConnectionConfig = setConnectionConfig;

var _crypto = _interopRequireDefault(require('crypto'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _keytarWrapper;

function _load_keytarWrapper() {
  return _keytarWrapper = _interopRequireDefault(require('../../commons-atom/keytarWrapper'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/* global localStorage */

const CONFIG_DIR = 'nuclide-connections';

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-connection');

/**
 * Version of ServerConnectionConfiguration that uses string instead of Buffer for fields so it can
 * be translated directly to/from JSON.
 */


// Insecure configs are used for testing only.
function isInsecure(config) {
  return config.clientKey == null && config.clientCertificate == null && config.certificateAuthorityCertificate == null;
}

function getStorageKey(host) {
  return `${CONFIG_DIR}:${host}`;
}

function getConnectionConfig(host) {
  const storedConfig = localStorage.getItem(getStorageKey(host));
  if (storedConfig == null) {
    return null;
  }
  try {
    return decryptConfig(JSON.parse(storedConfig));
  } catch (e) {
    logger.error(`The configuration file for ${host} is corrupted.`, e);
    return null;
  }
}

function setConnectionConfig(config, ipAddress) {
  // Don't attempt to store insecure connections.
  // Insecure connections are used for testing and will fail the encryption call below.
  if (isInsecure(config)) {
    return;
  }

  try {
    const encrypted = JSON.stringify(encryptConfig(config));
    localStorage.setItem(getStorageKey(config.host), encrypted);
    // Store configurations by their IP address as well.
    // This way, multiple aliases for the same hostname can reuse a single connection.
    localStorage.setItem(getStorageKey(ipAddress), encrypted);
  } catch (e) {
    logger.error(`Failed to store configuration file for ${config.host}.`, e);
  }
}

function encryptConfig(remoteProjectConfig) {
  const sha1 = _crypto.default.createHash('sha1');
  sha1.update(`${remoteProjectConfig.host}:${remoteProjectConfig.port}`);
  const sha1sum = sha1.digest('hex');

  const {
    certificateAuthorityCertificate,
    clientCertificate,
    clientKey
  } = remoteProjectConfig;

  if (!clientKey) {
    throw new Error('Invariant violation: "clientKey"');
  }

  const realClientKey = clientKey.toString(); // Convert from Buffer to string.
  const { salt, password, encryptedString } = encryptString(realClientKey);
  (_keytarWrapper || _load_keytarWrapper()).default.replacePassword('nuclide.remoteProjectConfig', sha1sum, password);

  const clientKeyWithSalt = encryptedString + '.' + salt;

  if (!certificateAuthorityCertificate) {
    throw new Error('Invariant violation: "certificateAuthorityCertificate"');
  }

  if (!clientCertificate) {
    throw new Error('Invariant violation: "clientCertificate"');
  }

  return {
    host: remoteProjectConfig.host,
    port: remoteProjectConfig.port,
    family: remoteProjectConfig.family,
    certificateAuthorityCertificate: certificateAuthorityCertificate.toString(),
    clientCertificate: clientCertificate.toString(),
    clientKey: clientKeyWithSalt
  };
}

/**
 * Decrypts the clientKey of a SerializableServerConnectionConfiguration.
 * @param remoteProjectConfig - The config with the clientKey we want encrypted.
 * @return returns the passed in config with the clientKey encrypted.
 */
function decryptConfig(remoteProjectConfig) {
  const sha1 = _crypto.default.createHash('sha1');
  sha1.update(`${remoteProjectConfig.host}:${remoteProjectConfig.port}`);
  const sha1sum = sha1.digest('hex');

  const password = (_keytarWrapper || _load_keytarWrapper()).default.getPassword('nuclide.remoteProjectConfig', sha1sum);

  // flowlint-next-line sketchy-null-string:off
  if (!password) {
    throw new Error('Cannot find password for encrypted client key');
  }

  const {
    certificateAuthorityCertificate,
    clientCertificate,
    clientKey
  } = remoteProjectConfig;
  // flowlint-next-line sketchy-null-string:off

  if (!clientKey) {
    throw new Error('Invariant violation: "clientKey"');
  }

  const [encryptedString, salt] = clientKey.split('.');

  if (!encryptedString || !salt) {
    throw new Error('Cannot decrypt client key');
  }

  const restoredClientKey = decryptString(encryptedString, password, salt);
  // "nolint" is to suppress ArcanistPrivateKeyLinter errors
  if (!restoredClientKey.startsWith('-----BEGIN RSA PRIVATE KEY-----') // nolint
  ) {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-connection').error(`decrypted client key did not start with expected header: ${restoredClientKey}`);
    }

  // flowlint-next-line sketchy-null-string:off

  if (!certificateAuthorityCertificate) {
    throw new Error('Invariant violation: "certificateAuthorityCertificate"');
  }
  // flowlint-next-line sketchy-null-string:off


  if (!clientCertificate) {
    throw new Error('Invariant violation: "clientCertificate"');
  }

  return {
    host: remoteProjectConfig.host,
    port: remoteProjectConfig.port,
    family: remoteProjectConfig.family,
    certificateAuthorityCertificate: new Buffer(certificateAuthorityCertificate),
    clientCertificate: new Buffer(clientCertificate),
    clientKey: new Buffer(restoredClientKey)
  };
}

function decryptString(text, password, salt) {
  const decipher = _crypto.default.createDecipheriv('aes-128-cbc', new Buffer(password, 'base64'), new Buffer(salt, 'base64'));

  let decryptedString = decipher.update(text, 'base64', 'utf8');
  decryptedString += decipher.final('utf8');

  return decryptedString;
}

function encryptString(text) {
  const password = _crypto.default.randomBytes(16).toString('base64');
  const salt = _crypto.default.randomBytes(16).toString('base64');

  const cipher = _crypto.default.createCipheriv('aes-128-cbc', new Buffer(password, 'base64'), new Buffer(salt, 'base64'));

  let encryptedString = cipher.update(text,
  /* input_encoding */'utf8',
  /* output_encoding */'base64');
  encryptedString += cipher.final('base64');

  return {
    password,
    salt,
    encryptedString
  };
}

const __test__ = exports.__test__ = {
  decryptString,
  encryptString
};