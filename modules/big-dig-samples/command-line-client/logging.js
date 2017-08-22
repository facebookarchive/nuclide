'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupDefaultLogging = setupDefaultLogging;

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _os = _interopRequireDefault(require('os'));

var _path = _interopRequireDefault(require('path'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setupDefaultLogging(loggingFile) {
  (_log4js || _load_log4js()).default.configure({
    appenders: [{
      type: 'file',
      filename: _path.default.join(_os.default.tmpdir(), loggingFile)
    }, {
      type: 'console'
    }]
  });

  process.on('unhandledRejection', error => {
    (_log4js || _load_log4js()).default.getLogger().fatal('Unhandled rejection:', error);
    (_log4js || _load_log4js()).default.shutdown(() => process.exit(1));
  });

  process.on('uncaughtException', error => {
    (_log4js || _load_log4js()).default.getLogger().fatal('Uncaught exception:', error);
    (_log4js || _load_log4js()).default.shutdown(() => process.exit(1));
  });
}
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
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