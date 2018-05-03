'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.generateCertificates = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));






























/**
                                                                                                                                                                                                    * If successful, this will return a set of paths where all of the certificate info was written.
                                                                                                                                                                                                    */let generateCertificates = exports.generateCertificates = (() => {var _ref = (0, _asyncToGenerator.default)(
  function* (
  clientCommonName,
  serverCommonName,
  openSSLConfigPath,
  expirationDays)
  {
    // Set the process umask to 0077 to ensure that certificates have 0700 permissions.
    // The spawned OpenSSL processes will inherit the umask.
    const oldUmask = process.umask();
    process.umask(0o77);
    try {
      const paths = yield generateKeyPairPaths();
      const env = generateEnvironmentForOpenSSLCalls(serverCommonName);
      yield generateCA(paths.caKey, paths.caCert, expirationDays, env);
      yield Promise.all([
      generateKeyAndCertificate(
      paths.caKey,
      paths.caCert,
      expirationDays,
      paths.serverKey,
      paths.serverCsr,
      paths.serverCert,
      openSSLConfigPath,
      serverCommonName,
      1,
      env),

      generateKeyAndCertificate(
      paths.caKey,
      paths.caCert,
      expirationDays,
      paths.clientKey,
      paths.clientCsr,
      paths.clientCert,
      openSSLConfigPath,
      clientCommonName,
      2,
      env)]);


      return paths;
    } finally {
      process.umask(oldUmask);
    }
  });return function generateCertificates(_x, _x2, _x3, _x4) {return _ref.apply(this, arguments);};})(); /**
                                                                                                          * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                          * All rights reserved.
                                                                                                          *
                                                                                                          * This source code is licensed under the BSD-style license found in the
                                                                                                          * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                          * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                          *
                                                                                                          * 
                                                                                                          * @format
                                                                                                          */let generateCA = (() => {var _ref2 = (0, _asyncToGenerator.default)(function* (caKeyPath, caCertPath, expirationDays, env) {const command = 'openssl';const options = { env };yield (0, (_child_process || _load_child_process()).execFile)(command, ['genrsa', '-out', caKeyPath, '1024'], options);
    yield (0, (_child_process || _load_child_process()).execFile)(
    command,
    [
    'req',
    '-new',
    '-x509',
    '-days',
    String(expirationDays),
    '-key',
    caKeyPath,
    '-out',
    caCertPath,
    '-batch'],

    options);

  });return function generateCA(_x5, _x6, _x7, _x8) {return _ref2.apply(this, arguments);};})();let generateKeyAndCertificate = (() => {var _ref3 = (0, _asyncToGenerator.default)(

  function* (
  caKeyPath,
  caCertPath,
  expirationDays,
  keyFilePath,
  csrFilePath,
  certFilePath,
  openSSLConfigPath,
  commonName,
  serial,
  env)
  {
    const command = 'openssl';
    const options = { env };
    yield (0, (_child_process || _load_child_process()).execFile)(command, ['genrsa', '-out', keyFilePath, '1024'], options);
    yield (0, (_child_process || _load_child_process()).execFile)(
    command,
    [
    'req',
    '-new',
    '-key',
    keyFilePath,
    '-out',
    csrFilePath,
    '-subj',
    `/CN=${commonName}`,
    '-config',
    openSSLConfigPath],

    options);

    yield (0, (_child_process || _load_child_process()).execFile)(
    command,
    [
    'x509',
    '-req',
    '-days',
    String(expirationDays),
    '-in',
    csrFilePath,
    '-CA',
    caCertPath,
    '-CAkey',
    caKeyPath,
    '-set_serial',
    String(serial),
    '-out',
    certFilePath,
    '-extensions',
    'v3_req',
    '-extfile',
    openSSLConfigPath],

    options);

  });return function generateKeyAndCertificate(_x9, _x10, _x11, _x12, _x13, _x14, _x15, _x16, _x17, _x18) {return _ref3.apply(this, arguments);};})();

/**
                                                                                                                                                        * Creates a new temporary directory where all of the certificate data for one instance
                                                                                                                                                        * of the server should be written.
                                                                                                                                                        */let generateKeyPairPaths = (() => {var _ref4 = (0, _asyncToGenerator.default)(
  function* () {
    const certsDir = yield (_fs || _load_fs()).default.mkdtemp(
    (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), '.big-dig-certs'));

    const pathPrefix = (_nuclideUri || _load_nuclideUri()).default.join(certsDir, 'big-dig');
    return {
      certsDir,
      caKey: `${pathPrefix}.ca.key`,
      caCert: `${pathPrefix}.ca.crt`,
      serverKey: `${pathPrefix}.server.key`,
      serverCsr: `${pathPrefix}.server.csr`,
      serverCert: `${pathPrefix}.server.cert`,
      clientKey: `${pathPrefix}.client.key`,
      clientCsr: `${pathPrefix}.client.csr`,
      clientCert: `${pathPrefix}.client.cert` };

  });return function generateKeyPairPaths() {return _ref4.apply(this, arguments);};})();var _net = _interopRequireDefault(require('net'));var _os = _interopRequireDefault(require('os'));var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));}var _child_process;function _load_child_process() {return _child_process = require('../common/child_process');}var _fs;function _load_fs() {return _fs = _interopRequireDefault(require('../common/fs'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

function generateEnvironmentForOpenSSLCalls(serverCommonName) {
  const env = Object.assign({}, process.env);
  if (process.platform === 'darwin') {
    // High Sierra comes with LibreSSL by default, which is not supported.
    // Often, OpenSSL may be installed by Homebrew.
    env.PATH = '/usr/local/opt/openssl/bin:' + env.PATH;
  }
  // Usually, we don't have to make the common name a SAN,
  // but our openssl.cnf requires a value via $OPENSSL_SAN.
  env.OPENSSL_SAN = _net.default.isIP(serverCommonName) ?
  `IP:${serverCommonName}` :
  `DNS.1:${serverCommonName}`;
  return env;
}