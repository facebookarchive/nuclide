'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

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

var _BuckClangProvider;

function _load_BuckClangProvider() {
  return _BuckClangProvider = require('./BuckClangProvider');
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

const OPEN_NEAREST_BUILD_FILE_COMMAND = 'nuclide-buck:open-nearest-build-file';

class Activation {

  constructor(rawState) {
    this._initialState = null;

    this._taskRunner = new (_BuckTaskRunner || _load_BuckTaskRunner()).BuckTaskRunner(rawState);
    this._disposables = new _atom.CompositeDisposable(atom.commands.add('atom-workspace', OPEN_NEAREST_BUILD_FILE_COMMAND, event => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(OPEN_NEAREST_BUILD_FILE_COMMAND);
      // Add feature logging.
      const target = event.target;
      (0, (_buildFiles || _load_buildFiles()).openNearestBuildFile)(target); // Note this returns a Promise.
    }), this._taskRunner);
    (0, (_registerGrammar || _load_registerGrammar()).default)('source.python', ['BUCK']);
    (0, (_registerGrammar || _load_registerGrammar()).default)('source.json', ['BUCK.autodeps']);
    (0, (_registerGrammar || _load_registerGrammar()).default)('source.ini', ['.buckconfig']);
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeTaskRunnerServiceApi(api) {
    this._disposables.add(api.register(this._taskRunner));
  }

  provideObservableDiagnosticUpdates() {
    return this._taskRunner.getBuildSystem().getDiagnosticProvider();
  }

  serialize() {
    return this._taskRunner.serialize();
  }

  getHyperclickProvider() {
    return {
      priority: 200,
      providerName: 'nuclide-buck',
      getSuggestion(editor, position) {
        return (0, (_HyperclickProvider || _load_HyperclickProvider()).getSuggestion)(editor, position);
      }
    };
  }

  provideBuckBuilder() {
    return this._taskRunner.getBuildSystem();
  }

  providePlatformService() {
    return this._taskRunner.getPlatformService();
  }

  provideClangConfiguration() {
    return (0, (_BuckClangProvider || _load_BuckClangProvider()).getClangProvider)(this._taskRunner);
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);