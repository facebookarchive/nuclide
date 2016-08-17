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

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _HyperclickProvider2;

function _HyperclickProvider() {
  return _HyperclickProvider2 = _interopRequireDefault(require('./HyperclickProvider'));
}

var _AutoComplete2;

function _AutoComplete() {
  return _AutoComplete2 = _interopRequireDefault(require('./AutoComplete'));
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _LinterProvider2;

function _LinterProvider() {
  return _LinterProvider2 = _interopRequireDefault(require('./LinterProvider'));
}

var _OutlineProvider2;

function _OutlineProvider() {
  return _OutlineProvider2 = require('./OutlineProvider');
}

var _TypeHintProvider2;

function _TypeHintProvider() {
  return _TypeHintProvider2 = _interopRequireDefault(require('./TypeHintProvider'));
}

function getHyperclickProvider() {
  return (_HyperclickProvider2 || _HyperclickProvider()).default;
}

function createAutocompleteProvider() {
  var getSuggestions = function getSuggestions(request) {
    return (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)('nuclide-ocaml:getAutocompleteSuggestions', function () {
      return (_AutoComplete2 || _AutoComplete()).default.getAutocompleteSuggestions(request);
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
  return (_LinterProvider2 || _LinterProvider()).default;
}

function provideOutlines() {
  return {
    grammarScopes: Array.from((_constants2 || _constants()).GRAMMARS),
    priority: 1,
    name: 'OCaml',
    getOutline: (_OutlineProvider2 || _OutlineProvider()).getOutline
  };
}

function createTypeHintProvider() {
  var typeHintProvider = new (_TypeHintProvider2 || _TypeHintProvider()).default();
  var typeHint = typeHintProvider.typeHint.bind(typeHintProvider);

  return {
    inclusionPriority: 1,
    providerName: 'nuclide-ocaml',
    selector: Array.from((_constants2 || _constants()).GRAMMARS).join(', '),
    typeHint: typeHint
  };
}