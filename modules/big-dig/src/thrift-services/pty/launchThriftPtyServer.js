"use strict";

function _log4js() {
  const data = _interopRequireDefault(require("log4js"));

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _ThriftPtyServer() {
  const data = require("./ThriftPtyServer");

  _ThriftPtyServer = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
async function main() {
  if (process.argv.length !== 3) {
    // eslint-disable-next-line no-console
    console.error('Error: launchServer expected port as parameter.');
    process.exit(1);
  }

  const portOrPath = process.argv[2];

  _log4js().default.getLogger().info('Initializing server on ', portOrPath);

  const server = new (_ThriftPtyServer().ThriftPtyServer)(portOrPath);
  await server.initialize();

  _log4js().default.getLogger().info('Server listening on ', portOrPath);
}

_log4js().default.configure({
  appenders: [{
    type: 'file',
    filename: _nuclideUri().default.join(_os.default.tmpdir(), 'big-dig-service-pty.log')
  }, {
    type: 'stderr'
  }]
});

process.on('unhandledRejection', error => {
  _log4js().default.getLogger().error('Unhandled rejection:', error);
});
process.on('uncaughtException', error => {
  _log4js().default.getLogger().fatal('Uncaught exception:', error);

  _log4js().default.shutdown(() => process.abort());
});
main();