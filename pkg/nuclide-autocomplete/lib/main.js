'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.consumeProvider = consumeProvider;

var _createAutocompleteProvider;

function _load_createAutocompleteProvider() {
  return _createAutocompleteProvider = _interopRequireDefault(require('./createAutocompleteProvider'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function consumeProvider(_provider) {
  const providers = Array.isArray(_provider) ? _provider : [_provider];
  const disposables = providers.map(provider => atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', (0, (_createAutocompleteProvider || _load_createAutocompleteProvider()).default)(provider)));
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(...disposables);
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