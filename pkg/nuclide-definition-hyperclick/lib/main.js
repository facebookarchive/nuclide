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

  (0, (_assert2 || _assert()).default)(definitions.length > 0);

  function createCallback(definition) {
    return function () {
      (0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocation)(definition.path, definition.position.row, definition.position.column);
    };
  }

  function createTitle(definition) {
    (0, (_assert2 || _assert()).default)(definition.name != null, 'must include name when returning multiple definitions');
    var filePath = definition.projectRoot == null ? definition.path : (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.relative(definition.projectRoot, definition.path);
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

var _commonsAtomGoToLocation2;

function _commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation2 = require('../../commons-atom/go-to-location');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var currentService = null;

function consumeDefinitionService(service) {
  (0, (_assert2 || _assert()).default)(currentService == null);
  currentService = service;
  return new (_atom2 || _atom()).Disposable(function () {
    (0, (_assert2 || _assert()).default)(currentService === service);
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