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
exports.deactivate = deactivate;
exports.consumeBuildSystemRegistry = consumeBuildSystemRegistry;
exports.consumeOutputService = consumeOutputService;
exports.provideObservableDiagnosticUpdates = provideObservableDiagnosticUpdates;
exports.serialize = serialize;
exports.getHyperclickProvider = getHyperclickProvider;
exports.provideBuckBuilder = provideBuckBuilder;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomRegisterGrammar;

function _load_commonsAtomRegisterGrammar() {
  return _commonsAtomRegisterGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _HyperclickProvider;

function _load_HyperclickProvider() {
  return _HyperclickProvider = require('./HyperclickProvider');
}

var _BuckBuildSystem;

function _load_BuckBuildSystem() {
  return _BuckBuildSystem = require('./BuckBuildSystem');
}

var disposables = null;
var buildSystem = null;
var initialState = null;

function activate(rawState) {
  (0, (_assert || _load_assert()).default)(disposables == null);
  initialState = rawState;
  disposables = new (_atom || _load_atom()).CompositeDisposable(new (_atom || _load_atom()).Disposable(function () {
    buildSystem = null;
  }), new (_atom || _load_atom()).Disposable(function () {
    initialState = null;
  }));
  (0, (_commonsAtomRegisterGrammar || _load_commonsAtomRegisterGrammar()).default)('source.python', 'BUCK');
  (0, (_commonsAtomRegisterGrammar || _load_commonsAtomRegisterGrammar()).default)('source.json', 'BUCK.autodeps');
  (0, (_commonsAtomRegisterGrammar || _load_commonsAtomRegisterGrammar()).default)('source.ini', '.buckconfig');
}

function deactivate() {
  (0, (_assert || _load_assert()).default)(disposables != null);
  disposables.dispose();
  disposables = null;
}

function consumeBuildSystemRegistry(registry) {
  (0, (_assert || _load_assert()).default)(disposables != null);
  disposables.add(registry.register(getBuildSystem()));
}

function getBuildSystem() {
  if (buildSystem == null) {
    (0, (_assert || _load_assert()).default)(disposables != null);
    buildSystem = new (_BuckBuildSystem || _load_BuckBuildSystem()).BuckBuildSystem(initialState);
    disposables.add(buildSystem);
  }
  return buildSystem;
}

function consumeOutputService(service) {
  (0, (_assert || _load_assert()).default)(disposables != null);
  disposables.add(service.registerOutputProvider({
    messages: getBuildSystem().getOutputMessages(),
    id: 'Buck'
  }));
}

function provideObservableDiagnosticUpdates() {
  return getBuildSystem().getDiagnosticProvider();
}

function serialize() {
  if (buildSystem != null) {
    return buildSystem.serialize();
  }
}

function getHyperclickProvider() {
  return {
    priority: 200,
    providerName: 'nuclide-buck',
    getSuggestion: function getSuggestion(editor, position) {
      return (0, (_HyperclickProvider || _load_HyperclickProvider()).getSuggestion)(editor, position);
    }
  };
}

function provideBuckBuilder() {
  return {
    build: function build(options) {
      return getBuildSystem().buildArtifact(options);
    }
  };
}