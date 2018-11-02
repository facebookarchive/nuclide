"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _passesGK() {
  const data = require("../modules/nuclide-commons/passesGK");

  _passesGK = function () {
    return data;
  };

  return data;
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

/**
 * Usage: In the feature package's `package.json`, add:
 *
 *  "activationHooks": [
 *    "my_gk_name:gk:nuclide"
 *  ]
 *
 * Now, the package will only load and activate if the GK is enabled.
 */
// May use: "!my_gk_name:gk:nuclide" to avoid activating the package when the GK passes.
const GK_HOOK_RE = /^(!?)([\w-]+):gk:nuclide$/;

class ActivateGKFeatures {
  constructor() {
    this._subscriptions = new (_UniversalDisposable().default)();

    const boundOnGKInitialized = this._onGKInitialized.bind(this);

    if (atom.inSpecMode()) {
      // call in next tick to more closely simulate what's happening in the normal case
      process.nextTick(boundOnGKInitialized);
    } else {
      this._subscriptions.add((0, _passesGK().onceGkInitialized)(boundOnGKInitialized));
    }
  }

  _onGKInitialized() {
    const usedGKNames = new Set();

    for (const pack of atom.packages.getLoadedPackages()) {
      if (pack.metadata.nuclide != null) {
        for (const hookName of pack.getActivationHooks()) {
          const match = hookName.match(GK_HOOK_RE);

          if (match == null) {
            continue;
          }

          const [, isNegated, gkName] = match;

          if (atom.inSpecMode() || (0, _passesGK().isGkEnabled)(gkName) === !isNegated) {
            usedGKNames.add(hookName);
          }
        }
      }
    }

    for (const hookName of usedGKNames) {
      atom.packages.triggerActivationHook(hookName);
    }
  }

  dispose() {
    this._subscriptions.dispose();
  }

}

exports.default = ActivateGKFeatures;