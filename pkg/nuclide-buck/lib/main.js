'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeTaskRunnerServiceApi = consumeTaskRunnerServiceApi;
exports.consumeOutputService = consumeOutputService;
exports.provideObservableDiagnosticUpdates = provideObservableDiagnosticUpdates;
exports.serialize = serialize;
exports.getHyperclickProvider = getHyperclickProvider;
exports.provideBuckBuilder = provideBuckBuilder;
exports.providePlatformService = providePlatformService;

var _registerGrammar;

function _load_registerGrammar() {
  return _registerGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _atom = require('atom');

var _HyperclickProvider;

function _load_HyperclickProvider() {
  return _HyperclickProvider = require('./HyperclickProvider');
}

var _BuckBuildSystem;

function _load_BuckBuildSystem() {
  return _BuckBuildSystem = require('./BuckBuildSystem');
}

var _PlatformService;

function _load_PlatformService() {
  return _PlatformService = require('./PlatformService');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let disposables = null; /**
                         * Copyright (c) 2015-present, Facebook, Inc.
                         * All rights reserved.
                         *
                         * This source code is licensed under the license found in the LICENSE file in
                         * the root directory of this source tree.
                         *
                         * 
                         */

let buildSystem = null;
let initialState = null;

function activate(rawState) {
  if (!(disposables == null)) {
    throw new Error('Invariant violation: "disposables == null"');
  }

  initialState = rawState;
  disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
    buildSystem = null;
  }), new _atom.Disposable(() => {
    initialState = null;
  }));
  (0, (_registerGrammar || _load_registerGrammar()).default)('source.python', ['BUCK']);
  (0, (_registerGrammar || _load_registerGrammar()).default)('source.json', ['BUCK.autodeps']);
  (0, (_registerGrammar || _load_registerGrammar()).default)('source.ini', ['.buckconfig']);
}

function deactivate() {
  if (!(disposables != null)) {
    throw new Error('Invariant violation: "disposables != null"');
  }

  disposables.dispose();
  disposables = null;
}

function consumeTaskRunnerServiceApi(api) {
  if (!(disposables != null)) {
    throw new Error('Invariant violation: "disposables != null"');
  }

  disposables.add(api.register(getBuildSystem()));
}

function getBuildSystem() {
  if (buildSystem == null) {
    if (!(disposables != null)) {
      throw new Error('Invariant violation: "disposables != null"');
    }

    buildSystem = new (_BuckBuildSystem || _load_BuckBuildSystem()).BuckBuildSystem(initialState);
    disposables.add(buildSystem);
  }
  return buildSystem;
}

function consumeOutputService(service) {
  if (!(disposables != null)) {
    throw new Error('Invariant violation: "disposables != null"');
  }

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
    getSuggestion(editor, position) {
      return (0, (_HyperclickProvider || _load_HyperclickProvider()).getSuggestion)(editor, position);
    }
  };
}

function provideBuckBuilder() {
  return {
    build: options => getBuildSystem().buildArtifact(options)
  };
}

function providePlatformService() {
  return getBuildSystem().getPlatformService();
}