'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

var _atom = require('atom');

var _GraphQLLanguage;

function _load_GraphQLLanguage() {
  return _GraphQLLanguage = require('./GraphQLLanguage');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class Activation {

  constructor() {
    this._disposables = new _atom.CompositeDisposable();
    (_GraphQLLanguage || _load_GraphQLLanguage()).graphqlLanguageService.activate();
    this._disposables.add((_GraphQLLanguage || _load_GraphQLLanguage()).graphqlLanguageService);
  }

  dispose() {
    (0, (_GraphQLLanguage || _load_GraphQLLanguage()).resetGraphQLLanguageService)();
    this._disposables.dispose();
  }
}

let activation = null;

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