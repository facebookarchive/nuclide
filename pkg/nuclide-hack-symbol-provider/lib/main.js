Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.registerProvider = registerProvider;
exports.activate = activate;

var providerInstance = undefined;
function getProviderInstance() {
  if (providerInstance == null) {
    var _require = require('./HackSymbolProvider');

    var HackSymbolProvider = _require.HackSymbolProvider;

    providerInstance = _extends({}, HackSymbolProvider);
  }
  return providerInstance;
}

function registerProvider() {
  return getProviderInstance();
}

function activate(state) {}