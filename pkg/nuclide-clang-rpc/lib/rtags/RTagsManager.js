'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _ClangServerManager;

function _load_ClangServerManager() {
  return _ClangServerManager = require('../ClangServerManager');
}

var _RC;

function _load_RC() {
  return _RC = require('./RC');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rcCompileCommand(src, flags) {
  return (0, (_utils || _load_utils()).rcCommand)(['--compile', `${flags.concat([src]).join(' ')}`]);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

class RTagsManager {
  // string because we only use .file

  constructor(flagsManager) {
    this._flagsManager = flagsManager;
    this._compilationDatabases = new Set();
    // TODO pelmers: lazily initialize the 'rdm' process on first getService.
  }

  _fallbackGetService(src, defaultFlags) {
    return (0, _asyncToGenerator.default)(function* () {
      if (defaultFlags != null) {
        yield rcCompileCommand(src, (yield (0, (_ClangServerManager || _load_ClangServerManager()).augmentDefaultFlags)(src, defaultFlags))).toPromise();
        return new (_RC || _load_RC()).RC(src);
      } else {
        return null;
      }
    })();
  }

  getService(src, contents, _requestSettings, defaultFlags) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const requestSettings = _requestSettings || {
        compilationDatabase: null,
        projectRoot: null
      };
      // First try to ensure the compilation database is loaded.
      const file = yield _this._flagsManager.getDatabaseForSrc(src);
      if (file != null) {
        if (!_this._compilationDatabases.has(file)) {
          _this._compilationDatabases.add(file);
          yield (0, (_utils || _load_utils()).rcCommand)(['--load-compile-commands', file]).toPromise();
        }
        return new (_RC || _load_RC()).RC(src);
      }
      // Otherwise the file may be new/a header, ask for compilation flags.
      const flags = yield _this._flagsManager.getFlagsForSrc(src, requestSettings);
      if (flags && flags.flags) {
        yield rcCompileCommand(src, flags.flags).toPromise();
        return new (_RC || _load_RC()).RC(src);
      }
      return _this._fallbackGetService(src, defaultFlags);
    })();
  }

  reset(src) {
    this._compilationDatabases.clear();
    if (src == null) {
      (0, (_utils || _load_utils()).rcCommand)(['--clear']);
    }
  }
}
exports.default = RTagsManager;