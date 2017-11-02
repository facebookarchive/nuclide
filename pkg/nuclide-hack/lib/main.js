'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.registerQuickOpenProvider = registerQuickOpenProvider;

var _HackSymbolProvider;

function _load_HackSymbolProvider() {
  return _HackSymbolProvider = require('./HackSymbolProvider');
}

var _HackLanguage;

function _load_HackLanguage() {
  return _HackLanguage = require('./HackLanguage');
}

function activate() {
  (_HackLanguage || _load_HackLanguage()).hackLanguageService.then(value => value.activate());
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

function deactivate() {
  (0, (_HackLanguage || _load_HackLanguage()).resetHackLanguageService)();
}

function registerQuickOpenProvider() {
  return (_HackSymbolProvider || _load_HackSymbolProvider()).HackSymbolProvider;
}