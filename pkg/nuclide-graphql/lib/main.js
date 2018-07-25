"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

function _GraphQLLanguage() {
  const data = require("./GraphQLLanguage");

  _GraphQLLanguage = function () {
    return data;
  };

  return data;
}

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
function activate() {
  if (process.platform !== 'win32') {
    _GraphQLLanguage().graphqlLanguageService.then(value => value.activate());
  }
}

function deactivate() {
  if (process.platform !== 'win32') {
    (0, _GraphQLLanguage().resetGraphQLLanguageService)();
  }
}