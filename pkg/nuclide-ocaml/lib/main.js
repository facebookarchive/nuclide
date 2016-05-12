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

exports.activate = activate;
exports.getHyperclickProvider = getHyperclickProvider;
exports.createAutocompleteProvider = createAutocompleteProvider;
exports.provideLinter = provideLinter;
exports.createTypeHintProvider = createTypeHintProvider;

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

function activate() {}

function getHyperclickProvider() {
  return require('./HyperclickProvider');
}

function createAutocompleteProvider() {
  var _require = require('../../nuclide-analytics');

  var trackOperationTiming = _require.trackOperationTiming;

  var getSuggestions = function getSuggestions(request) {
    return trackOperationTiming('nuclide-ocaml:getAutocompleteSuggestions', function () {
      return require('./AutoComplete').getAutocompleteSuggestions(request);
    });
  };
  return {
    selector: '.source.ocaml',
    inclusionPriority: 1,
    disableForSelector: '.source.ocaml .comment',
    getSuggestions: getSuggestions
  };
}

function provideLinter() {
  var MerlinLinterProvider = require('./LinterProvider');
  return MerlinLinterProvider;
}

function createTypeHintProvider() {
  var _require2 = require('./TypeHintProvider');

  var TypeHintProvider = _require2.TypeHintProvider;

  var typeHintProvider = new TypeHintProvider();
  var typeHint = typeHintProvider.typeHint.bind(typeHintProvider);

  return {
    inclusionPriority: 1,
    providerName: 'nuclide-ocaml',
    selector: Array.from((_constants2 || _constants()).GRAMMARS).join(', '),
    typeHint: typeHint
  };
}