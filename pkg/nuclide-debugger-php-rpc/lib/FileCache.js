'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
}

var _ClientCallback;

function _load_ClientCallback() {
  return _ClientCallback = require('./ClientCallback');
}

var _File;

function _load_File() {
  return _File = _interopRequireDefault(require('./File'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Handles registering files encountered during debugging with the Chrome debugger
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class FileCache {

  constructor(callback) {
    this._callback = callback;
    this._files = new Map();
  }

  registerFile(fileUrl) {
    const filepath = (0, (_helpers || _load_helpers()).uriToPath)(fileUrl);
    if (!this._files.has(filepath)) {
      this._files.set(filepath, new (_File || _load_File()).default(filepath));
      this._callback.sendServerMethod('Debugger.scriptParsed', {
        scriptId: filepath,
        url: fileUrl,
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 0
      });
    }
    const result = this._files.get(filepath);

    if (!(result != null)) {
      throw new Error('Invariant violation: "result != null"');
    }

    return result;
  }

  getFileSource(filepath) {
    return this.registerFile(filepath).getSource();
  }
}
exports.default = FileCache;