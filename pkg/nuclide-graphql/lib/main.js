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

function _passesGK() {
  const data = _interopRequireDefault(require("../../commons-node/passesGK"));

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
 *  strict-local
 * @format
 */
async function activate() {
  if (process.platform !== 'win32' && !(await (0, _passesGK().default)('nuclide_fb_graphql_vscode_ext'))) {
    _GraphQLLanguage().graphqlLanguageService.activate();
  }
}

function deactivate() {
  if (process.platform !== 'win32') {
    (0, _GraphQLLanguage().resetGraphQLLanguageService)();
  }
}