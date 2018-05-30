'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isGkEnabled = isGkEnabled;
exports.onceGkInitialized = onceGkInitialized;
exports.onceGkInitializedAsync = onceGkInitializedAsync;
exports.getCacheEntries = getCacheEntries;

var _once;

function _load_once() {
  return _once = _interopRequireDefault(require('./once'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../modules/nuclide-commons/UniversalDisposable'));
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
 *  strict-local
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
        let canceled = false;
        process.nextTick(() => {
          if (!canceled) {
            callback();
          }
        });
        return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
          canceled = true;
        });
      }

      getCacheEntries() {
        return [];
      }
    };
  }
  return new Gatekeeper();
});

/**
 * Check a GK. Silently return false on error.
 */

exports.default = async function passesGK(name,
// timeout in ms
timeout) {
  try {
    return (await getGatekeeper().asyncIsGkEnabled(name, timeout)) === true;
  } catch (e) {
    return false;
  }
};

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

function getCacheEntries() {
  return getGatekeeper().getCacheEntries();
}