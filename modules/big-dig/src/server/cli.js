'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseArgsAndRunMain = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * @param absolutePathToServerMain The code that bootstraps the server will load the code at this
 *     path via require(). It is expected to have a default export that is a function that takes the
 *     WebSocket server created by Big Dig, along with other arguments, and starts the main
 *     server [that is using Big Dig as a building block].
 */
let parseArgsAndRunMain = exports.parseArgsAndRunMain = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (absolutePathToServerMain) {
    const params = JSON.parse(process.argv[2]);
    const { cname, expiration, jsonOutputFile } = params;
    let { port } = params;
    if (typeof cname !== 'string') {
      throw Error(`cname must be specified as string but was: '${cname}'`);
    }
    if (typeof jsonOutputFile !== 'string') {
      throw Error('Must specify jsonOutputFile');
    }

    // port arg validation
    if (port == null) {
      port = DEFAULT_PORT;
    }
    if (typeof port !== 'number') {
      throw Error(`port must be specified as number but was: '${port}'`);
    }
    // eslint-disable-next-line no-bitwise
    if ((port | 0) !== port) {
      throw Error(`port must be an integer but was: '${port}'`);
    }
    if (port < 0) {
      throw Error(`port must be >=0 but was ${port}`);
    }

    // expiration arg validation
    if (typeof expiration !== 'string') {
      throw Error(`expiration must be specified as string but was: '${expiration}'`);
    }
    const expirationMatch = expiration.match(/^(\d+)d$/);
    if (expirationMatch == null) {
      throw Error(`expiration must be /(\\d+)d/ but was: '${expiration}'`);
    }
    const expirationDays = parseInt(expirationMatch[1], 10);
    if (expirationDays <= 0) {
      throw Error(`expiration must be >0 but was ${expirationDays}`);
    }

    const clientCommonName = 'nuclide';
    const serverCommonName = cname || `${(0, (_username || _load_username()).getUsername)()}.nuclide.${_os.default.hostname()}`;
    const openSSLConfigPath = require.resolve('./openssl.cnf');

    yield (0, (_main || _load_main()).generateCertificatesAndStartServer)(clientCommonName, serverCommonName, openSSLConfigPath, port, expirationDays, jsonOutputFile, absolutePathToServerMain, params.serverParams);
  });

  return function parseArgsAndRunMain(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _os = _interopRequireDefault(require('os'));

var _username;

function _load_username() {
  return _username = require('../common/username');
}

var _main;

function _load_main() {
  return _main = require('./main');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(_log4js || _load_log4js()).default.configure({
  appenders: [{
    type: 'file',
    filename: (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'big-dig-cli.log')
  }, {
    type: 'console'
  }]
}); /**
     * Copyright (c) 2017-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the BSD-style license found in the
     * LICENSE file in the root directory of this source tree. An additional grant
     * of patent rights can be found in the PATENTS file in the same directory.
     *
     * 
     * @format
     */

const DEFAULT_PORT = 0;