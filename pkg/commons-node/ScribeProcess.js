'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _os = _interopRequireDefault(require('os'));

var _process;

function _load_process() {
  return _process = require('./process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const DEFAULT_JOIN_TIMEOUT = 5000;
let SCRIBE_CAT_COMMAND = 'scribe_cat';

/**
 * A wrapper of `scribe_cat` (https://github.com/facebookarchive/scribe/blob/master/examples/scribe_cat)
 * command. User could call `new ScribeProcess($scribeCategoryName)` to create a process and then
 * call `scribeProcess.write($object)` to save an JSON schemaed Object into scribe category.
 * It will also recover from `scribe_cat` failure automatically.
 */
class ScribeProcess {

  constructor(scribeCategory) {
    this._scribeCategory = scribeCategory;
    this._childProcessRunning = new WeakMap();
    this._getOrCreateChildProcess();
  }

  /**
   * Check if `scribe_cat` exists in PATH.
   */
  static isScribeCatOnPath() {
    return (0, _asyncToGenerator.default)(function* () {
      const { exitCode } = yield (0, (_process || _load_process()).asyncExecute)('which', [SCRIBE_CAT_COMMAND]);
      return exitCode === 0;
    })();
  }

  /**
   * Write a string to a Scribe category.
   * Ensure newlines are properly escaped.
   */
  write(message) {
    const child = this._getOrCreateChildProcess();
    return new Promise((resolve, reject) => {
      child.stdin.write(`${message}${_os.default.EOL}`, resolve);
    });
  }

  dispose() {
    if (this._childProcess != null) {
      const child = this._childProcess;
      if (this._childProcessRunning.get(child)) {
        child.kill();
      }
    }
    return Promise.resolve();
  }

  join(timeout = DEFAULT_JOIN_TIMEOUT) {
    if (this._childProcess != null) {
      const { stdin } = this._childProcess;
      // Make sure stdin has drained before ending it.
      if (!stdin.write(_os.default.EOL)) {
        stdin.once('drain', () => stdin.end());
      } else {
        stdin.end();
      }
      return new Promise(resolve => {
        if (this._childProcess == null) {
          resolve();
        } else {
          this._childProcess.on('exit', () => resolve());
          setTimeout(resolve, timeout);
        }
      });
    } else {
      return Promise.resolve();
    }
  }

  _getOrCreateChildProcess() {
    if (this._childProcess) {
      return this._childProcess;
    }

    const child = this._childProcess = (0, (_process || _load_process()).safeSpawn)(SCRIBE_CAT_COMMAND, [this._scribeCategory]);
    child.stdin.setDefaultEncoding('utf8');
    this._childProcessRunning.set(child, true);
    child.on('error', error => {
      this._childProcess = null;
      this._childProcessRunning.set(child, false);
    });
    child.on('exit', e => {
      this._childProcess = null;
      this._childProcessRunning.set(child, false);
    });

    return child;
  }
}

exports.default = ScribeProcess;
const __test__ = exports.__test__ = {
  setScribeCatCommand(newCommand) {
    const originalCommand = SCRIBE_CAT_COMMAND;
    SCRIBE_CAT_COMMAND = newCommand;
    return originalCommand;
  }
};