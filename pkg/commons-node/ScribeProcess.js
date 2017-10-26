'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _child_process = _interopRequireDefault(require('child_process'));

var _os = _interopRequireDefault(require('os'));

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _once;

function _load_once() {
  return _once = _interopRequireDefault(require('./once'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_JOIN_TIMEOUT = 5000;
// $FlowFixMe: Add EmptyError to type defs
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

let SCRIBE_CAT_COMMAND = 'scribe_cat';

/**
 * A wrapper of `scribe_cat` (https://github.com/facebookarchive/scribe/blob/master/examples/scribe_cat)
 * command. User could call `new ScribeProcess($scribeCategoryName)` to create a process and then
 * call `scribeProcess.write($object)` to save an JSON schemaed Object into scribe category.
 * It will also recover from `scribe_cat` failure automatically.
 */
class ScribeProcess {

  constructor(scribeCategory) {
    this._disposals = new _rxjsBundlesRxMinJs.Subject();
    this._scribeCategory = scribeCategory;
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

  dispose() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this2._disposals.next();
      if (_this2._subscription != null) {
        _this2._childPromise = null;
        _this2._subscription.unsubscribe();
        _this2._subscription = null;
      }
    })();
  }

  /**
   * Waits for the remaining messages to be written, then closes the write stream. Resolves once the
   * process has exited. This method is called when the server shuts down in order to guarantee we
   * capture logging during shutdown.
   */
  join(timeout = DEFAULT_JOIN_TIMEOUT) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this3._childPromise == null) {
        return;
      }

      const { stdin } = yield _this3._childPromise;
      // Make sure stdin has drained before ending it.
      if (!stdin.write(_os.default.EOL)) {
        stdin.once('drain', function () {
          return stdin.end();
        });
      } else {
        stdin.end();
      }
      if (_this3._childPromise == null) {
        return;
      }
      const child = yield _this3._childPromise;
      yield new Promise(function (resolve) {
        child.on('exit', function () {
          resolve();
        });
        setTimeout(resolve, timeout);
      });
    })();
  }

  _getChildProcess() {
    if (this._childPromise) {
      return this._childPromise;
    }

    // Kick off the process. Ideally we would store the subscription and unsubscribe when
    // `dispose()` was called. Practically, it probably doesn't matter since there's very little
    // chance we'd want to cancel before the process was ready.
    const processStream = (0, (_process || _load_process()).spawn)(SCRIBE_CAT_COMMAND, [this._scribeCategory]).do(child => {
      child.stdin.setDefaultEncoding('utf8');
    }).finally(() => {
      this._childPromise = null;
      this._subscription = null;
    }).publish();

    const childPromise = this._childPromise = processStream.takeUntil(this._disposals).first().catch(err => {
      if (err instanceof _rxjsBundlesRxMinJs.EmptyError) {
        // Disposing before we have a process should send an error to anybody waiting on the
        // process promise.
        throw new Error('Disconnected before process was spawned');
      }
      throw err;
    }).toPromise();
    this._subscription = processStream.connect();
    return childPromise;
  }
}

exports.default = ScribeProcess;
ScribeProcess.isScribeCatOnPath = (0, (_once || _load_once()).default)(() => {
  try {
    const proc = _child_process.default.spawnSync('which', [SCRIBE_CAT_COMMAND]);
    return proc.status === 0;
  } catch (e) {
    return false;
  }
});
const __test__ = exports.__test__ = {
  setScribeCatCommand(newCommand) {
    const originalCommand = SCRIBE_CAT_COMMAND;
    SCRIBE_CAT_COMMAND = newCommand;
    return originalCommand;
  }
};