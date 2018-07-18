"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.consumeProvider = consumeProvider;

function _createAutocompleteProvider() {
  const data = _interopRequireDefault(require("./createAutocompleteProvider"));

  _createAutocompleteProvider = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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
function consumeProvider(_provider) {
  const providers = Array.isArray(_provider) ? _provider : [_provider];
  const disposables = providers.map(provider => atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', (0, _createAutocompleteProvider().default)(provider)));
  return new (_UniversalDisposable().default)(...disposables);
}