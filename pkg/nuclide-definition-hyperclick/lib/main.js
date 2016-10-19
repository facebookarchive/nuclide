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

// This package provides Hyperclick results for any language which provides a
// DefinitionProvider.

var getSuggestion = _asyncToGenerator(function* (editor, position) {
  if (currentService == null) {
    return null;
  }
  var result = yield currentService.getDefinition(editor, position);
  if (result == null) {
    return null;
  }
  var definitions = result.definitions;

  (0, (_assert || _load_assert()).default)(definitions.length > 0);

  function createCallback(definition) {
    return function () {
      (0, (_commonsAtomGoToLocation || _load_commonsAtomGoToLocation()).goToLocation)(definition.path, definition.position.row, definition.position.column);
    };
  }

  function createTitle(definition) {
    (0, (_assert || _load_assert()).default)(definition.name != null, 'must include name when returning multiple definitions');
    var filePath = definition.projectRoot == null ? definition.path : (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.relative(definition.projectRoot, definition.path);
    return definition.name + ' (' + filePath + ')';
  }

  if (definitions.length === 1) {
    return {
      range: result.queryRange,
      callback: createCallback(definitions[0])
    };
  } else {
    return {
      range: result.queryRange,
      callback: definitions.map(function (definition) {
        return {
          title: createTitle(definition),
          callback: createCallback(definition)
        };
      })
    };
  }
});

exports.consumeDefinitionService = consumeDefinitionService;
exports.getHyperclickProvider = getHyperclickProvider;
exports.activate = activate;
exports.deactivate = deactivate;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomGoToLocation;

function _load_commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation = require('../../commons-atom/go-to-location');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var currentService = null;

function consumeDefinitionService(service) {
  (0, (_assert || _load_assert()).default)(currentService == null);
  currentService = service;
  return new (_atom || _load_atom()).Disposable(function () {
    (0, (_assert || _load_assert()).default)(currentService === service);
    currentService = null;
  });
}

function getHyperclickProvider() {
  return {
    priority: 20,
    providerName: 'nuclide-definition-hyperclick',
    getSuggestion: getSuggestion
  };
}

function activate(state) {}

function deactivate() {}