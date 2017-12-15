'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _electron = require('electron');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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

if (!(_electron.remote != null)) {
  throw new Error('Must be run from renderer');
}

/**
 * Documented at:
 * https://chromedevtools.github.io/devtools-protocol/tot/Memory/#method-getDOMCounters
 */

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    const chromeDebugger = _electron.remote.getCurrentWebContents().debugger;
    if (chromeDebugger == null) {
      return null;
    }
    try {
      chromeDebugger.attach('1.1');
      return yield new Promise(function (resolve) {
        chromeDebugger.sendCommand('Memory.getDOMCounters', {}, function (err, result) {
          // Oddly, err is an Object even if there is no error.
          // We'll resort to checking that result is a valid DOMCounter type.
          if (result != null && typeof result.nodes === 'number' && typeof result.jsEventListeners === 'number') {
            resolve({
              nodes: result.nodes,
              jsEventListeners: result.jsEventListeners,
              // While not cheap, this isn't more expensive than the debugger calls.
              attachedNodes: document.querySelectorAll('*').length
            });
          } else {
            (0, (_log4js || _load_log4js()).getLogger)().warn('Error from Memory.getDOMCounters', err);
            resolve(null);
          }
        });
      });
    } catch (e) {
      // The debugger is likely already attached.
      return null;
    } finally {
      chromeDebugger.detach();
    }
  });

  function getDOMCounters() {
    return _ref.apply(this, arguments);
  }

  return getDOMCounters;
})();