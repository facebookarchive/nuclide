'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

var _GraphQLLanguage;

function _load_GraphQLLanguage() {
  return _GraphQLLanguage = require('./GraphQLLanguage');
}

function activate() {
  if (process.platform !== 'win32') {
    (_GraphQLLanguage || _load_GraphQLLanguage()).graphqlLanguageService.then(value => value.activate());
  }
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

function deactivate() {
  if (process.platform !== 'win32') {
    (0, (_GraphQLLanguage || _load_GraphQLLanguage()).resetGraphQLLanguageService)();
  }
}