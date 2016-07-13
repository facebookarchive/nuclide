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
exports.consumeCurrentWorkingDirectory = consumeCurrentWorkingDirectory;
exports.consumeOutputService = consumeOutputService;
exports.serialize = serialize;
exports.getHyperclickProvider = getHyperclickProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomRegisterGrammar2;

function _commonsAtomRegisterGrammar() {
  return _commonsAtomRegisterGrammar2 = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _HyperclickProvider2;

function _HyperclickProvider() {
  return _HyperclickProvider2 = _interopRequireDefault(require('./HyperclickProvider'));
}

var _BuckBuildSystem2;

function _BuckBuildSystem() {
  return _BuckBuildSystem2 = require('./BuckBuildSystem');
}

var disposables = null;
var buildSystem = null;
var initialState = null;

function activate(rawState) {
  (0, (_assert2 || _assert()).default)(disposables == null);
  initialState = rawState;
  disposables = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(function () {
    buildSystem = null;
  }), new (_atom2 || _atom()).Disposable(function () {
    initialState = null;
  }));
  (0, (_commonsAtomRegisterGrammar2 || _commonsAtomRegisterGrammar()).default)('source.python', 'BUCK');
  (0, (_commonsAtomRegisterGrammar2 || _commonsAtomRegisterGrammar()).default)('source.json', 'BUCK.autodeps');
  (0, (_commonsAtomRegisterGrammar2 || _commonsAtomRegisterGrammar()).default)('source.ini', '.buckconfig');
}

function deactivate() {
  (0, (_assert2 || _assert()).default)(disposables != null);
  disposables.dispose();
  disposables = null;
}

function consumeBuildSystemRegistry(registry) {
  (0, (_assert2 || _assert()).default)(disposables != null);
  disposables.add(registry.register(getBuildSystem()));
}

function getBuildSystem() {
  if (buildSystem == null) {
    (0, (_assert2 || _assert()).default)(disposables != null);
    buildSystem = new (_BuckBuildSystem2 || _BuckBuildSystem()).BuckBuildSystem(initialState);
    disposables.add(buildSystem);
  }
  return buildSystem;
}

function consumeCurrentWorkingDirectory(service) {
  (0, (_assert2 || _assert()).default)(disposables != null);
  disposables.add(service.observeCwd(function (cwd) {
    if (cwd != null) {
      getBuildSystem().updateCwd(cwd.getPath());
    }
  }));
}

function consumeOutputService(service) {
  (0, (_assert2 || _assert()).default)(disposables != null);
  disposables.add(service.registerOutputProvider({
    messages: getBuildSystem().getOutputMessages(),
    id: 'Buck'
  }));
}

function serialize() {
  if (buildSystem != null) {
    return buildSystem.serialize();
  }
}

function getHyperclickProvider() {
  return (_HyperclickProvider2 || _HyperclickProvider()).default;
}