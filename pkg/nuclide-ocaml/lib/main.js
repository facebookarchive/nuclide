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

exports.getHyperclickProvider = getHyperclickProvider;
exports.createAutocompleteProvider = createAutocompleteProvider;
exports.provideLinter = provideLinter;
exports.provideOutlines = provideOutlines;
exports.createTypeHintProvider = createTypeHintProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _HyperclickProvider;

function _load_HyperclickProvider() {
  return _HyperclickProvider = _interopRequireDefault(require('./HyperclickProvider'));
}

var _AutoComplete;

function _load_AutoComplete() {
  return _AutoComplete = _interopRequireDefault(require('./AutoComplete'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _LinterProvider;

function _load_LinterProvider() {
  return _LinterProvider = _interopRequireDefault(require('./LinterProvider'));
}

var _OutlineProvider;

function _load_OutlineProvider() {
  return _OutlineProvider = require('./OutlineProvider');
}

var _TypeHintProvider;

function _load_TypeHintProvider() {
  return _TypeHintProvider = _interopRequireDefault(require('./TypeHintProvider'));
}

function getHyperclickProvider() {
  return (_HyperclickProvider || _load_HyperclickProvider()).default;
}

function createAutocompleteProvider() {
  var getSuggestions = function getSuggestions(request) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('nuclide-ocaml:getAutocompleteSuggestions', function () {
      return (_AutoComplete || _load_AutoComplete()).default.getAutocompleteSuggestions(request);
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
  return (_LinterProvider || _load_LinterProvider()).default;
}

function provideOutlines() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMARS),
    priority: 1,
    name: 'OCaml',
    getOutline: (_OutlineProvider || _load_OutlineProvider()).getOutline
  };
}

function createTypeHintProvider() {
  var typeHintProvider = new (_TypeHintProvider || _load_TypeHintProvider()).default();
  var typeHint = typeHintProvider.typeHint.bind(typeHintProvider);

  return {
    inclusionPriority: 1,
    providerName: 'nuclide-ocaml',
    selector: Array.from((_constants || _load_constants()).GRAMMARS).join(', '),
    typeHint: typeHint
  };
}