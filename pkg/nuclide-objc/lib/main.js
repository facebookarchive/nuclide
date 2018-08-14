"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _ObjectiveCColonIndenter() {
  const data = _interopRequireDefault(require("./ObjectiveCColonIndenter"));

  _ObjectiveCColonIndenter = function () {
    return data;
  };

  return data;
}

function _ObjectiveCBracketBalancer() {
  const data = _interopRequireDefault(require("./ObjectiveCBracketBalancer"));

  _ObjectiveCBracketBalancer = function () {
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
class Activation {
  constructor() {
    this._indentFeature = new (_ObjectiveCColonIndenter().default)();

    this._indentFeature.enable();

    this._bracketFeature = new (_ObjectiveCBracketBalancer().default)();
    this._configSubscription = _featureConfig().default.observe('nuclide-objc.enableAutomaticSquareBracketInsertion', enabled => enabled ? this._bracketFeature.enable() : this._bracketFeature.disable());
  }

  dispose() {
    this._configSubscription.dispose();

    this._bracketFeature.disable();

    this._indentFeature.disable();
  }

}

let activation;

function activate(state) {
  if (!activation) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}