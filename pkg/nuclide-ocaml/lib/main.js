'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deactivate = exports.activate = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let activate = exports.activate = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    if (yield (0, (_OCamlService || _load_OCamlService()).getUseLspConnection)()) {
      const ocamlLspLanguageService = (0, (_OCamlLanguage || _load_OCamlLanguage()).createLanguageService)();
      ocamlLspLanguageService.activate();
      disposables.add(ocamlLspLanguageService);
    } else {
      disposables.add(atom.commands.add('atom-workspace', 'nuclide-ocaml:destructure', function () {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor) {
          (0, (_DestructureHelpers || _load_DestructureHelpers()).cases)(editor, editor.getCursorScreenPosition());
        }
      }), atom.packages.serviceHub.provide('outline-view', '0.1.0', provideOutlines()), atom.packages.serviceHub.provide('nuclide-type-hint.provider', '0.0.0', createTypeHintProvider()), atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', createAutocompleteProvider()), atom.packages.serviceHub.provide('hyperclick', '0.1.0', getHyperclickProvider()), atom.packages.serviceHub.provide('linter', '1.0.0', provideLinter()), atom.packages.serviceHub.provide('code-format.file', '0.1.0', createCodeFormatProvider()));
    }
  });

  return function activate() {
    return _ref.apply(this, arguments);
  };
})();

let deactivate = exports.deactivate = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    disposables.dispose();
    disposables = new _atom.CompositeDisposable();
  });

  return function deactivate() {
    return _ref2.apply(this, arguments);
  };
})();

exports.getHyperclickProvider = getHyperclickProvider;
exports.createAutocompleteProvider = createAutocompleteProvider;
exports.provideLinter = provideLinter;
exports.provideOutlines = provideOutlines;
exports.createTypeHintProvider = createTypeHintProvider;
exports.createCodeFormatProvider = createCodeFormatProvider;

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

var _DestructureHelpers;

function _load_DestructureHelpers() {
  return _DestructureHelpers = require('./DestructureHelpers');
}

var _CodeFormatHelpers;

function _load_CodeFormatHelpers() {
  return _CodeFormatHelpers = require('./CodeFormatHelpers');
}

var _atom = require('atom');

var _OCamlLanguage;

function _load_OCamlLanguage() {
  return _OCamlLanguage = require('./OCamlLanguage');
}

var _OCamlService;

function _load_OCamlService() {
  return _OCamlService = require('../../nuclide-ocaml-rpc/lib/OCamlService');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function getHyperclickProvider() {
  return (_HyperclickProvider || _load_HyperclickProvider()).default;
}

function createAutocompleteProvider() {
  const getSuggestions = request => {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-ocaml:getAutocompleteSuggestions', () => (_AutoComplete || _load_AutoComplete()).default.getAutocompleteSuggestions(request));
  };
  return {
    selector: '.source.ocaml, .source.reason',
    inclusionPriority: 1,
    disableForSelector: '.source.ocaml .comment, .source.reason .comment',
    getSuggestions
  };
}

function provideLinter() {
  return (_LinterProvider || _load_LinterProvider()).default;
}

function provideOutlines() {
  // TODO: (chenglou) get back the ability to output Reason outline.
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMARS),
    priority: 1,
    name: 'OCaml',
    getOutline: editor => (0, (_OutlineProvider || _load_OutlineProvider()).getOutline)(editor)
  };
}

function createTypeHintProvider() {
  const typeHintProvider = new (_TypeHintProvider || _load_TypeHintProvider()).default();
  const typeHint = typeHintProvider.typeHint.bind(typeHintProvider);

  return {
    inclusionPriority: 1,
    providerName: 'nuclide-ocaml',
    selector: Array.from((_constants || _load_constants()).GRAMMARS).join(', '),
    typeHint
  };
}

function createCodeFormatProvider() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMARS),
    priority: 1,
    formatEntireFile: (editor, range) => (0, (_CodeFormatHelpers || _load_CodeFormatHelpers()).getEntireFormatting)(editor, range)
  };
}

let disposables = new _atom.CompositeDisposable();