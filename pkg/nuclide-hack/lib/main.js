"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.registerQuickOpenProvider = registerQuickOpenProvider;
exports.registerProjectSymbolSearchProvider = registerProjectSymbolSearchProvider;

function _HackSymbolProvider() {
  const data = require("./HackSymbolProvider");

  _HackSymbolProvider = function () {
    return data;
  };

  return data;
}

function _HackLanguage() {
  const data = require("./HackLanguage");

  _HackLanguage = function () {
    return data;
  };

  return data;
}

function _DashProjectSymbolProvider() {
  const data = _interopRequireDefault(require("./DashProjectSymbolProvider"));

  _DashProjectSymbolProvider = function () {
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
 *  strict-local
 * @format
 */
// $FlowFB
function activate() {
  _HackLanguage().hackLanguageService.then(value => value.activate());
}

function deactivate() {
  (0, _HackLanguage().resetHackLanguageService)();
}

function registerQuickOpenProvider() {
  return _HackSymbolProvider().HackSymbolProvider;
}

function registerProjectSymbolSearchProvider() {
  return _DashProjectSymbolProvider().default;
}