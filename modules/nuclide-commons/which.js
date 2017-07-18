'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _os = _interopRequireDefault(require('os'));

var _process;

function _load_process() {
  return _process = require('./process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Provides a cross-platform way to check whether a binary is available.
 *
 * We ran into problems with the npm `which` package (the nature of which I unfortunately don't
 * remember) so we can use this for now.
 */
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

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (command) {
    const whichCommand = process.platform === 'win32' ? 'where' : 'which';
    try {
      const result = yield (0, (_process || _load_process()).runCommand)(whichCommand, [command]).toPromise();
      return result.split(_os.default.EOL)[0];
    } catch (e) {
      return null;
    }
  });

  function which(_x) {
    return _ref.apply(this, arguments);
  }

  return which;
})();