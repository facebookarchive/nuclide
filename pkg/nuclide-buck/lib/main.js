'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeTaskRunnerServiceApi = consumeTaskRunnerServiceApi;
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

var _buildFiles;

function _load_buildFiles() {
  return _buildFiles = require('./buildFiles');
}

var _HyperclickProvider;

function _load_HyperclickProvider() {
  return _HyperclickProvider = require('./HyperclickProvider');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _BuckTaskRunner;

function _load_BuckTaskRunner() {
  return _BuckTaskRunner = require('./BuckTaskRunner');
}

var _PlatformService;

function _load_PlatformService() {
  return _PlatformService = require('./PlatformService');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const OPEN_NEAREST_BUILD_FILE_COMMAND = 'nuclide-buck:open-nearest-build-file'; /**
                                                                                 * Copyright (c) 2015-present, Facebook, Inc.
                                                                                 * All rights reserved.
                                                                                 *
                                                                                 * This source code is licensed under the license found in the LICENSE file in
                                                                                 * the root directory of this source tree.
                                                                                 *
                                                                                 * 
                                                                                 * @format
                                                                                 */

let disposables = null;
let taskRunner = null;
let initialState = null;

function activate(rawState) {
  if (!(disposables == null)) {
    throw new Error('Invariant violation: "disposables == null"');
  }

  initialState = rawState;
  disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
    taskRunner = null;
  }), new _atom.Disposable(() => {
    initialState = null;
  }), atom.commands.add('atom-workspace', OPEN_NEAREST_BUILD_FILE_COMMAND, event => {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(OPEN_NEAREST_BUILD_FILE_COMMAND);
    // Add feature logging.
    const target = event.target;
    (0, (_buildFiles || _load_buildFiles()).openNearestBuildFile)(target); // Note this returns a Promise.
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

  disposables.add(api.register(getTaskRunner()));
}

function getTaskRunner() {
  if (taskRunner == null) {
    if (!(disposables != null)) {
      throw new Error('Invariant violation: "disposables != null"');
    }

    taskRunner = new (_BuckTaskRunner || _load_BuckTaskRunner()).BuckTaskRunner(initialState);
    disposables.add(taskRunner);
  }
  return taskRunner;
}

function provideObservableDiagnosticUpdates() {
  return getTaskRunner().getBuildSystem().getDiagnosticProvider();
}

function serialize() {
  if (taskRunner != null) {
    return taskRunner.serialize();
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
  return getTaskRunner().getBuildSystem();
}

function providePlatformService() {
  return getTaskRunner().getPlatformService();
}