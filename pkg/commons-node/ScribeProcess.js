'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _os = _interopRequireDefault(require('os'));

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('nuclide-commons/which'));
}

var _once;

function _load_once() {
  return _once = _interopRequireDefault(require('./once'));
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
 * @format
 */

const DEFAULT_JOIN_TIMEOUT = 5000;
let SCRIBE_CAT_COMMAND = 'scribe_cat';

// On Mac OS, `scribe_cat` isn't quite the same as the server-side one:
// it only dumps its logs on exit. To make sure that logs are delivered
// in a timely manner, we'll periodically force-kill the process.
const DEFAULT_JOIN_INTERVAL = process.platform === 'darwin' ? 60000 : null;

/**
 * A wrapper of `scribe_cat` (https://github.com/facebookarchive/scribe/blob/master/examples/scribe_cat)
 * command. User could call `new ScribeProcess($scribeCategoryName)` to create a process and then
 * call `scribeProcess.write($object)` to save an JSON schemaed Object into scribe category.
 * It will also recover from `scribe_cat` failure automatically.
 */
class ScribeProcess {

  constructor(scribeCategory, joinInterval = DEFAULT_JOIN_INTERVAL) {
    this._scribeCategory = scribeCategory;
    this._joinInterval = joinInterval;
    this._getChildProcess();
  }

  /**
   * Check if `scribe_cat` exists in PATH.
   */


  /**
   * Write a string to a Scribe category.
   * Ensure newlines are properly escaped.
   */
  write(message) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const child = yield _this._getChildProcess();
      yield new Promise(function (resolve) {
        child.stdin.write(`${message}${_os.default.EOL}`, resolve);
      });
    })();
  }

  /**
   * Waits for the remaining messages to be written, then closes the write stream. Resolves once the
   * process has exited. This method is called when the server shuts down in order to guarantee we
   * capture logging during shutdown.
   */
  join(timeout = DEFAULT_JOIN_TIMEOUT) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { _childPromise, _subscription } = _this2;
      if (_childPromise == null || _subscription == null) {
        return;
      }

      // join() renders the existing process unusable.
      // The next call to write() should create a new process, so clear out the references.
      // Note that we stored them in local variables already above.
      _this2._clear();

      const child = yield _childPromise;
      const { stdin } = child;
      const waitForExit = new Promise(function (resolve) {
        child.on('exit', function () {
          resolve();
        });
        setTimeout(function () {
          _subscription.unsubscribe();
          resolve();
        }, timeout);
      });
      // Make sure stdin has drained before ending it.
      if (!stdin.write(_os.default.EOL)) {
        stdin.once('drain', function () {
          return stdin.end();
        });
      } else {
        stdin.end();
      }
      return waitForExit;
    })();
  }

  _getChildProcess() {
    if (this._childPromise) {
      return this._childPromise;
    }

    // Obtain a promise to get the child process, but don't start it yet.
    // this._subscription will have control over starting / stopping the process.
    const processStream = (0, (_process || _load_process()).spawn)(SCRIBE_CAT_COMMAND, [this._scribeCategory], {
      dontLogInNuclide: true
    }).do(child => {
      child.stdin.setDefaultEncoding('utf8');
    }).finally(() => {
      // We may have already started a new process in the meantime.
      if (this._childPromise === childPromise) {
        this._clear();
      }
    }).publish();

    const childPromise = this._childPromise = processStream.first().toPromise();
    this._subscription = processStream.connect();

    if (this._joinInterval != null) {
      this._joinTimer = setTimeout(() => {
        this._joinTimer = null;
        this.join();
      }, this._joinInterval);
    }

    return childPromise;
  }

  _clear() {
    this._childPromise = null;
    this._subscription = null;
    if (this._joinTimer != null) {
      clearTimeout(this._joinTimer);
      this._joinTimer = null;
    }
  }
}

exports.default = ScribeProcess;
ScribeProcess.isScribeCatOnPath = (0, (_once || _load_once()).default)(() => (0, (_which || _load_which()).default)(SCRIBE_CAT_COMMAND).then(cmd => cmd != null));
const __test__ = exports.__test__ = {
  setScribeCatCommand(newCommand) {
    const originalCommand = SCRIBE_CAT_COMMAND;
    SCRIBE_CAT_COMMAND = newCommand;
    return originalCommand;
  }
};