'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
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

let main = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    const params = JSON.parse(process.argv[2]);
    // TODO(mbolin): Do basic runtime validation on params.

    const port = yield (0, (_NuclideServer || _load_NuclideServer()).launchServer)({
      port: params.port,
      webServer: {
        key: params.key,
        cert: params.cert,
        ca: params.ca
      },
      absolutePathToServerMain: params.launcher,
      serverParams: params.serverParams
    });

    // $FlowIgnore
    process.send({ port }, function () {
      if (!process.disconnect) {
        throw new Error('Invariant violation: "process.disconnect"');
      }

      process.disconnect();
    });
  });

  return function main() {
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

var _NuclideServer;

function _load_NuclideServer() {
  return _NuclideServer = require('./NuclideServer');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(_log4js || _load_log4js()).default.configure({
  appenders: [{
    type: 'file',
    filename: (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'big-dig.log')
  }, {
    type: 'console'
  }]
});

main();

process.on('unhandledRejection', error => {
  (_log4js || _load_log4js()).default.getLogger().fatal('Unhandled rejection:', error);
  (_log4js || _load_log4js()).default.shutdown(() => process.exit(1));
});

process.on('uncaughtException', error => {
  (_log4js || _load_log4js()).default.getLogger().fatal('Uncaught exception:', error);
  (_log4js || _load_log4js()).default.shutdown(() => process.exit(1));
});