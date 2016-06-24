Object.defineProperty(exports, '__esModule', {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// undefined means unknown. null means known to not be present.
var gatekeeper = undefined;

/**
 * Check a GK. Silently return false on error.
 */
exports.default = _asyncToGenerator(function* (gatekeeperName, timeout) {
  // Only do the expensive require once.
  if (gatekeeper === undefined) {
    try {
      // $FlowFB
      gatekeeper = require('../fb-gatekeeper').gatekeeper;
    } catch (e) {
      gatekeeper = null;
    }
  }

  if (gatekeeper == null) {
    return false;
  }
  try {
    return (yield gatekeeper.asyncIsGkEnabled(gatekeeperName, timeout)) === true;
  } catch (e) {
    return false;
  }
});
module.exports = exports.default;