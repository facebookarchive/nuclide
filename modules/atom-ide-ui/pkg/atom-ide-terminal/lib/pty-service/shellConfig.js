'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.readConfig = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));let readConfig = exports.readConfig = (() => {var _ref = (0, _asyncToGenerator.default)(


























  function* () {
    let configContents = null;
    try {
      const configFile = (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(`~/${CONFIG_BASENAME}`);
      configContents = yield (_fsPromise || _load_fsPromise()).default.readFile(configFile, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If the user has no config file, that is still success, just with empty result.
        return Promise.resolve(null);
      } else {
        return Promise.reject(
        new Error(`code='${error.code}', error='${error}'`));

      }
    }

    try {
      return parseConfig(configContents);
    } catch (error) {
      return Promise.reject(error);
    }
  });return function readConfig() {return _ref.apply(this, arguments);};})();exports.

parseConfig = parseConfig;var _os = _interopRequireDefault(require('os'));var _fsPromise;function _load_fsPromise() {return _fsPromise = _interopRequireDefault(require('../../../../../nuclide-commons/fsPromise'));}var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../../../nuclide-commons/nuclideUri'));}var _string;function _load_string() {return _string = require('../../../../../nuclide-commons/string');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */const CONFIG_BASENAME = '.nuclide-terminal.json';function parseConfig(configContents) {function throwError(message) {throw new Error(`(${_os.default.hostname()}) error parsing ~/${CONFIG_BASENAME}:\n` + `  ${message}.\n` + 'Contents:\n' + configContents);}let rawConfig = null;
  try {
    rawConfig = JSON.parse(configContents);
  } catch (e) {
    throwError(e);
  }

  if (typeof rawConfig !== 'object') {
    throw throwError('Expected top-level to be an object.');
  }if (!(
  rawConfig != null)) {throw new Error('Invariant violation: "rawConfig != null"');}

  let argv = null;
  const command = rawConfig.command;
  if (typeof command === 'string') {
    argv = (0, (_string || _load_string()).shellParse)(command);
  } else if (Array.isArray(command)) {
    for (const arg of command) {
      if (typeof arg !== 'string') {
        throwError(`'args' must be strings, got ${arg}`);
      }
    }
    argv = command;
  } else {
    throw throwError('"command" must be a string or string array');
  }

  return {
    command: {
      file: argv[0],
      args: argv.slice(1) } };


}