Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.getConnectionConfig = getConnectionConfig;
exports.setConnectionConfig = setConnectionConfig;

var clearConnectionConfig = _asyncToGenerator(function* (host) {
  try {
    window.localStorage.removeItem(getStorageKey(host));
  } catch (e) {
    logger.error('Failed to clear configuration for ' + host + '.', e);
  }
}

/**
 * Encrypts the clientKey of a ConnectionConfig.
 * @param remoteProjectConfig - The config with the clientKey we want encrypted.
 * @return returns the passed in config with the clientKey encrypted.
 */
);

exports.clearConnectionConfig = clearConnectionConfig;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _crypto2;

function _crypto() {
  return _crypto2 = _interopRequireDefault(require('crypto'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _keytarWrapper2;

function _keytarWrapper() {
  return _keytarWrapper2 = _interopRequireDefault(require('./keytarWrapper'));
}

var CONFIG_DIR = 'nuclide-connections';

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

/**
 * Version of ServerConnectionConfiguration that uses string instead of Buffer for fields so it can
 * be translated directly to/from JSON.
 */

// Insecure configs are used for testing only.
function isInsecure(config) {
  return config.clientKey == null && config.clientCertificate == null && config.certificateAuthorityCertificate == null;
}

function getStorageKey(host) {
  return CONFIG_DIR + ':' + host;
}

function getConnectionConfig(host) {
  var storedConfig = window.localStorage.getItem(getStorageKey(host));
  if (storedConfig == null) {
    return null;
  }
  try {
    return decryptConfig(JSON.parse(storedConfig));
  } catch (e) {
    logger.error('The configuration file for ' + host + ' is corrupted.', e);
    return null;
  }
}

function setConnectionConfig(config) {
  // Don't attempt to store insecure connections.
  // Insecure connections are used for testing and will fail the encryption call below.
  if (isInsecure(config)) {
    return;
  }

  try {
    window.localStorage.setItem(getStorageKey(config.host), JSON.stringify(encryptConfig(config)));
  } catch (e) {
    logger.error('Failed to store configuration file for ' + config.host + '.', e);
  }
}

function encryptConfig(remoteProjectConfig) {
  var sha1 = (_crypto2 || _crypto()).default.createHash('sha1');
  sha1.update(remoteProjectConfig.host + ':' + remoteProjectConfig.port);
  var sha1sum = sha1.digest('hex');

  var certificateAuthorityCertificate = remoteProjectConfig.certificateAuthorityCertificate;
  var clientCertificate = remoteProjectConfig.clientCertificate;
  var clientKey = remoteProjectConfig.clientKey;

  (0, (_assert2 || _assert()).default)(clientKey);
  var realClientKey = clientKey.toString(); // Convert from Buffer to string.

  var _encryptString = encryptString(realClientKey);

  var salt = _encryptString.salt;
  var password = _encryptString.password;
  var encryptedString = _encryptString.encryptedString;

  (_keytarWrapper2 || _keytarWrapper()).default.replacePassword('nuclide.remoteProjectConfig', sha1sum, password);

  var clientKeyWithSalt = encryptedString + '.' + salt;

  (0, (_assert2 || _assert()).default)(certificateAuthorityCertificate);
  (0, (_assert2 || _assert()).default)(clientCertificate);

  return {
    host: remoteProjectConfig.host,
    port: remoteProjectConfig.port,
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
  var sha1 = (_crypto2 || _crypto()).default.createHash('sha1');
  sha1.update(remoteProjectConfig.host + ':' + remoteProjectConfig.port);
  var sha1sum = sha1.digest('hex');

  var password = (_keytarWrapper2 || _keytarWrapper()).default.getPassword('nuclide.remoteProjectConfig', sha1sum);

  if (!password) {
    throw new Error('Cannot find password for encrypted client key');
  }

  var certificateAuthorityCertificate = remoteProjectConfig.certificateAuthorityCertificate;
  var clientCertificate = remoteProjectConfig.clientCertificate;
  var clientKey = remoteProjectConfig.clientKey;

  (0, (_assert2 || _assert()).default)(clientKey);

  var _clientKey$split = clientKey.split('.');

  var _clientKey$split2 = _slicedToArray(_clientKey$split, 2);

  var encryptedString = _clientKey$split2[0];
  var salt = _clientKey$split2[1];

  if (!encryptedString || !salt) {
    throw new Error('Cannot decrypt client key');
  }

  var restoredClientKey = decryptString(encryptedString, password, salt);
  //  "nolint" is to suppress ArcanistPrivateKeyLinter errors
  if (!restoredClientKey.startsWith('-----BEGIN RSA PRIVATE KEY-----')) {
    /* nolint */
    (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('decrypted client key did not start with expected header: ' + restoredClientKey);
  }

  (0, (_assert2 || _assert()).default)(certificateAuthorityCertificate);
  (0, (_assert2 || _assert()).default)(clientCertificate);
  return {
    host: remoteProjectConfig.host,
    port: remoteProjectConfig.port,
    certificateAuthorityCertificate: new Buffer(certificateAuthorityCertificate),
    clientCertificate: new Buffer(clientCertificate),
    clientKey: new Buffer(restoredClientKey)
  };
}

function decryptString(text, password, salt) {
  var decipher = (_crypto2 || _crypto()).default.createDecipheriv('aes-128-cbc', new Buffer(password, 'base64'), new Buffer(salt, 'base64'));

  // $FlowFixMe
  var decryptedString = decipher.update(text, 'base64', 'utf8');
  // $FlowFixMe
  decryptedString += decipher.final('utf8');

  return decryptedString;
}

function encryptString(text) {
  var password = (_crypto2 || _crypto()).default.randomBytes(16).toString('base64');
  var salt = (_crypto2 || _crypto()).default.randomBytes(16).toString('base64');

  var cipher = (_crypto2 || _crypto()).default.createCipheriv('aes-128-cbc', new Buffer(password, 'base64'), new Buffer(salt, 'base64'));

  var encryptedString = cipher.update(text,
  /* input_encoding */'utf8',
  /* output_encoding */'base64');
  encryptedString += cipher.final('base64');

  return {
    password: password,
    salt: salt,
    encryptedString: encryptedString
  };
}

var __test__ = {
  decryptString: decryptString,
  encryptString: encryptString
};
exports.__test__ = __test__;