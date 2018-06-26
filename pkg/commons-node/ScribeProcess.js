'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = undefined;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _performanceNow;

function _load_performanceNow() {
  return _performanceNow = _interopRequireDefault(require('../../modules/nuclide-commons/performanceNow'));
}

var _os = _interopRequireDefault(require('os'));

var _process;

function _load_process() {
  return _process = require('../../modules/nuclide-commons/process');
}

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('../../modules/nuclide-commons/which'));
}

var _once;

function _load_once() {
  return _once = _interopRequireDefault(require('./once'));
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('./passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_JOIN_TIMEOUT = 5000; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    *  strict-local
                                    * @format
                                    */

let SCRIBE_CAT_COMMAND = 'scribe_cat';

// On Mac OS, `scribe_cat` isn't quite the same as the server-side one:
// it only dumps its logs on exit. To make sure that logs are delivered
// in a timely manner, we'll periodically force-kill the process.
const DEFAULT_JOIN_INTERVAL = process.platform === 'darwin' ? 60000 : null;

// If spawning the Scribe process takes this long, disable it.
// Node sometimes runs into strange issues where spawning() starts to block.
// https://github.com/nodejs/node/issues/14917
const SPAWN_TOO_LONG_MS = 2000;

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


  static isEnabled() {
    return ScribeProcess._enabled;
  }

  /**
   * Write a string to a Scribe category.
   * Ensure newlines are properly escaped.
   * Returns false if something is wrong with the Scribe process (use a fallback instead.)
   */
  async write(message) {
    if (!ScribeProcess._enabled) {
      return false;
    }
    let child;
    try {
      child = await this._getChildProcess();
    } catch (err) {
      ScribeProcess._enabled = false;
      // Note: Logging errors is potentially recursive, since they go through Scribe!
      // It's important that we set _enabled before logging errors in this file.
      (0, (_log4js || _load_log4js()).getLogger)('ScribeProcess').error('Disabling ScribeProcess due to spawn error:', err);
      return false;
    }
    await new Promise(resolve => {
      child.stdin.write(`${message}${_os.default.EOL}`, resolve);
    });
    return true;
  }

  /**
   * Waits for the remaining messages to be written, then closes the write stream. Resolves once the
   * process has exited. This method is called when the server shuts down in order to guarantee we
   * capture logging during shutdown.
   */
  async join(timeout = DEFAULT_JOIN_TIMEOUT) {
    const { _childPromise, _subscription } = this;
    if (_childPromise == null || _subscription == null) {
      return;
    }

    // join() renders the existing process unusable.
    // The next call to write() should create a new process, so clear out the references.
    // Note that we stored them in local variables already above.
    this._clear();

    const child = await _childPromise;
    const { stdin } = child;
    const waitForExit = new Promise(resolve => {
      child.on('exit', () => {
        resolve();
      });
      setTimeout(() => {
        _subscription.unsubscribe();
        resolve();
      }, timeout);
    });
    // Make sure stdin has drained before ending it.
    if (!stdin.write(_os.default.EOL)) {
      stdin.once('drain', () => stdin.end());
    } else {
      stdin.end();
    }
    return waitForExit;
  }

  _getChildProcess() {
    if (this._childPromise) {
      return this._childPromise;
    }

    // Obtain a promise to get the child process, but don't start it yet.
    // this._subscription will have control over starting / stopping the process.
    const startTime = (0, (_performanceNow || _load_performanceNow()).default)();
    const processStream = (0, (_process || _load_process()).spawn)(SCRIBE_CAT_COMMAND, [this._scribeCategory], {
      dontLogInNuclide: true
    }).do(child => {
      const duration = (0, (_performanceNow || _load_performanceNow()).default)() - startTime;
      if (duration > SPAWN_TOO_LONG_MS) {
        ScribeProcess._enabled = false;
        (0, (_log4js || _load_log4js()).getLogger)('ScribeProcess').error(`Disabling ScribeProcess because spawn took too long (${duration}ms)`);
        // Don't raise any errors and allow the current write to complete.
        // However, the next write will fail due to the _enabled check.
        this.join();
      }
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
ScribeProcess._enabled = true;
ScribeProcess.isScribeCatOnPath = (0, (_once || _load_once()).default)(async () => {
  const [whichCmd, gkEnabled] = await Promise.all([(0, (_which || _load_which()).default)(SCRIBE_CAT_COMMAND), process.platform === 'darwin' ? (0, (_passesGK || _load_passesGK()).default)('nuclide_scribe_macos') : Promise.resolve(true)]);
  return whichCmd != null && gkEnabled;
});
const __test__ = exports.__test__ = {
  setScribeCatCommand(newCommand) {
    const originalCommand = SCRIBE_CAT_COMMAND;
    SCRIBE_CAT_COMMAND = newCommand;
    return originalCommand;
  }
};