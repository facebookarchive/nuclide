"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readConfig = readConfig;
exports.parseConfig = parseConfig;

var _os = _interopRequireDefault(require("os"));

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../../../nuclide-commons/string");

  _string = function () {
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
 * 
 * @format
 */
const CONFIG_BASENAME = '.nuclide-terminal.json';

async function readConfig() {
  let configContents = null;

  try {
    const configFile = _nuclideUri().default.expandHomeDir(`~/${CONFIG_BASENAME}`);

    configContents = await _fsPromise().default.readFile(configFile, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If the user has no config file, that is still success, just with empty result.
      return Promise.resolve(null);
    } else {
      return Promise.reject(new Error(`code='${error.code}', error='${error}'`));
    }
  }

  try {
    return parseConfig(configContents);
  } catch (error) {
    return Promise.reject(error);
  }
}

function parseConfig(configContents) {
  function throwError(message) {
    throw new Error(`(${_os.default.hostname()}) error parsing ~/${CONFIG_BASENAME}:\n` + `  ${message}.\n` + 'Contents:\n' + configContents);
  }

  let rawConfig = null;

  try {
    rawConfig = JSON.parse(configContents);
  } catch (e) {
    throwError(e);
  }

  if (typeof rawConfig !== 'object') {
    throw throwError('Expected top-level to be an object.');
  }

  if (!(rawConfig != null)) {
    throw new Error("Invariant violation: \"rawConfig != null\"");
  }

  let argv = null;
  const command = rawConfig.command;

  if (typeof command === 'string') {
    argv = (0, _string().shellParse)(command);
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
      args: argv.slice(1)
    }
  };
}