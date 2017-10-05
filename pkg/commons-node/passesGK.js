'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.isGkEnabled = isGkEnabled;
exports.onceGkInitialized = onceGkInitialized;
exports.onceGkInitializedAsync = onceGkInitializedAsync;

var _once;

function _load_once() {
  return _once = _interopRequireDefault(require('./once'));
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get the actual Gatekeeper constructor or stub the relevant methods for OSS
 * friendliness.
 */
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

const getGatekeeper = (0, (_once || _load_once()).default)(() => {
  let Gatekeeper;
  try {
    // $FlowFB
    Gatekeeper = require('./fb-gatekeeper').Gatekeeper;
  } catch (e) {
    Gatekeeper = class {
      isGkEnabled(name) {
        return null;
      }
      asyncIsGkEnabled(name, timeout) {
        return Promise.resolve();
      }
      onceGkInitialized(callback) {
        process.nextTick(() => {
          callback();
        });
        return new (_eventKit || _load_eventKit()).Disposable();
      }
    };
  }
  return new Gatekeeper();
});

/**
 * Check a GK. Silently return false on error.
 */

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (name,
  // timeout in ms
  timeout) {
    try {
      return (yield getGatekeeper().asyncIsGkEnabled(name, timeout)) === true;
    } catch (e) {
      return false;
    }
  });

  function passesGK(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return passesGK;
})();

/**
 * Synchronous GK check. There is no guarantee that GKs have loaded. This
 * should be used inside a `onceGkInitialized`.
 */


function isGkEnabled(name) {
  return getGatekeeper().isGkEnabled(name);
}

function onceGkInitialized(callback) {
  return getGatekeeper().onceGkInitialized(callback);
}

function onceGkInitializedAsync() {
  return new Promise(resolve => {
    getGatekeeper().onceGkInitialized(() => resolve());
  });
}