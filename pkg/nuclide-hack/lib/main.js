'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.registerQuickOpenProvider = registerQuickOpenProvider;
exports.registerProjectSymbolSearchProvider = registerProjectSymbolSearchProvider;

var _HackSymbolProvider;

function _load_HackSymbolProvider() {
  return _HackSymbolProvider = require('./HackSymbolProvider');
}

var _HackLanguage;

function _load_HackLanguage() {
  return _HackLanguage = require('./HackLanguage');
}

var _DashProjectSymbolProvider;

function _load_DashProjectSymbolProvider() {
  return _DashProjectSymbolProvider = _interopRequireDefault(require('./DashProjectSymbolProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function activate() {
  (_HackLanguage || _load_HackLanguage()).hackLanguageService.then(value => value.activate());
} /**
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
function deactivate() {
  (0, (_HackLanguage || _load_HackLanguage()).resetHackLanguageService)();
}

function registerQuickOpenProvider() {
  return (_HackSymbolProvider || _load_HackSymbolProvider()).HackSymbolProvider;
}

function registerProjectSymbolSearchProvider() {
  return (_DashProjectSymbolProvider || _load_DashProjectSymbolProvider()).default;
}