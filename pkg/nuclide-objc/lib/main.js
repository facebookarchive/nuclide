'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _ObjectiveCColonIndenter;

function _load_ObjectiveCColonIndenter() {
  return _ObjectiveCColonIndenter = _interopRequireDefault(require('./ObjectiveCColonIndenter'));
}

var _ObjectiveCBracketBalancer;

function _load_ObjectiveCBracketBalancer() {
  return _ObjectiveCBracketBalancer = _interopRequireDefault(require('./ObjectiveCBracketBalancer'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor() {
    this._indentFeature = new (_ObjectiveCColonIndenter || _load_ObjectiveCColonIndenter()).default();
    this._indentFeature.enable();

    this._bracketFeature = new (_ObjectiveCBracketBalancer || _load_ObjectiveCBracketBalancer()).default();
    this._configSubscription = (_featureConfig || _load_featureConfig()).default.observe('nuclide-objc.enableAutomaticSquareBracketInsertion', enabled => enabled ? this._bracketFeature.enable() : this._bracketFeature.disable());
  }

  dispose() {
    this._configSubscription.dispose();
    this._bracketFeature.disable();
    this._indentFeature.disable();
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

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