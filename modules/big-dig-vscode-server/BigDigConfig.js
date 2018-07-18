"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findBigDigConfig = findBigDigConfig;

function proto() {
  const data = _interopRequireWildcard(require("./Protocol"));

  proto = function () {
    return data;
  };

  return data;
}

var pathModule = _interopRequireWildcard(require("path"));

function _fs() {
  const data = _interopRequireDefault(require("../big-dig/src/common/fs"));

  _fs = function () {
    return data;
  };

  return data;
}

function _toml() {
  const data = _interopRequireDefault(require("toml"));

  _toml = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/** Name of a Big Dig configuration file. */
const CONFIG_FILE_NAME = '.bigdig.toml';
/**
 * Looks in directory and its parent directories until it finds one with a
 * .bigdig.toml file. If it finds one, it parses it and returns a BigDigConfig
 * with its parsed contents; otherwise, returns null.
 */

async function findBigDigConfig(directory) {
  const file = await _fs().default.findNearestFile(CONFIG_FILE_NAME, directory);

  if (file == null) {
    return null;
  }

  const contents = await _fs().default.readFileAsString(file);

  const data = _toml().default.parse(contents);

  return new BigDigConfig(file, data);
}
/**
 * This represents a .bigdig.toml file that has been processed. All of the
 * configuration data is stored in this class, which is why its getter methods
 * are synchronous.
 */


class BigDigConfig {
  constructor(file, data) {
    this._file = file;
    this._dir = pathModule.dirname(file);
    this._data = data;
  }

  getFile() {
    return this._file;
  }

  getLspConfigs() {
    const {
      lsp
    } = this._data;

    if (lsp == null) {
      return {};
    }

    const configs = {};

    for (const [key, value] of Object.entries(lsp)) {
      const config = this._parseCommonExecArgs(value);

      const rootPath = value.rootPath != null ? pathModule.resolve(this._dir, value.rootPath) : null;
      configs[key] = Object.assign({}, config, {
        rootPath
      });
    }

    return configs;
  }

  getDebuggerConfigs() {
    // "debugger" is a reserved word, hence the rename.
    const {
      debugger: _debugger
    } = this._data;

    if (_debugger == null) {
      return {};
    }

    const configs = {};

    for (const [key, value] of Object.entries(_debugger)) {
      const config = this._parseCommonExecArgs(value);

      const request = value.request === 'launch' ? 'launch' : 'attach';
      configs[key] = Object.assign({}, config, {
        request
      });
    }

    return configs;
  }

  _parseCommonExecArgs(value) {
    const {
      language,
      command,
      args,
      cwd: _cwd
    } = value;
    let cwd;

    if (_cwd == null) {
      cwd = this._dir;
    } else if (pathModule.isAbsolute(_cwd)) {
      cwd = _cwd;
    } else {
      cwd = pathModule.join(this._dir, _cwd);
    }

    return {
      language: asArrayOfStrings(language),
      command: typeof command === 'string' ? command : '',
      args: asArrayOfStrings(args),
      cwd
    };
  }

}
/**
 * If `value` is an array where all of the elements are strings, returns value;
 * otherwise, returns an empty array.
 */


function asArrayOfStrings(value) {
  if (Array.isArray(value) && value.every(x => typeof x === 'string')) {
    return value;
  }

  return [];
}