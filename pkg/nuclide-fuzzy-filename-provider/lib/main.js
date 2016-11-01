'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _scheduleIdleCallback;

function _load_scheduleIdleCallback() {
  return _scheduleIdleCallback = _interopRequireDefault(require('../../commons-atom/scheduleIdleCallback'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _FuzzyFileNameProvider;

function _load_FuzzyFileNameProvider() {
  return _FuzzyFileNameProvider = _interopRequireDefault(require('./FuzzyFileNameProvider'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
let Activation = class Activation {

  constructor() {
    this._busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).BusySignalProviderBase();
    this._disposables = new _atom.CompositeDisposable();
    this._projectRoots = new Set();
    this._readySearch = this._readySearch.bind(this);

    // Do search preprocessing for all existing and future root directories.
    this._readySearch(atom.project.getPaths());
    this._disposables.add(atom.project.onDidChangePaths(this._readySearch));
  }

  _readySearch(projectPaths) {
    const newProjectPaths = new Set(projectPaths);
    // Add new project roots.
    for (const newProjectPath of newProjectPaths) {
      if (!this._projectRoots.has(newProjectPath)) {
        this._projectRoots.add(newProjectPath);
        // Wait a bit before starting the initial search, since it's a heavy op.
        const disposable = (0, (_scheduleIdleCallback || _load_scheduleIdleCallback()).default)(() => {
          this._disposables.remove(disposable);
          this._busySignalProvider.reportBusy(`File search: indexing files for project ${ newProjectPath }`, () => this._initialSearch(newProjectPath)).catch(err => {
            logger.error(`Error starting fuzzy filename search for ${ newProjectPath }`, err);
            this._disposeSearch(newProjectPath);
          });
        });
        this._disposables.add(disposable);
      }
    }
    // Clean up removed project roots.
    for (const existingProjectPath of this._projectRoots) {
      if (!newProjectPaths.has(existingProjectPath)) {
        this._disposeSearch(existingProjectPath);
      }
    }
  }

  _initialSearch(projectPath) {
    return (0, _asyncToGenerator.default)(function* () {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFuzzyFileSearchServiceByNuclideUri)(projectPath);
      const isAvailable = yield service.isFuzzySearchAvailableFor(projectPath);
      if (isAvailable) {
        // It doesn't matter what the search term is. Empirically, doing an initial
        // search speeds up the next search much more than simply doing the setup
        // kicked off by 'fileSearchForDirectory'.
        yield service.queryFuzzyFile(projectPath, 'a', (0, (_utils || _load_utils()).getIgnoredNames)());
      } else {
        throw new Error('Nonexistent directory');
      }
    })();
  }

  _disposeSearch(projectPath) {
    try {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFuzzyFileSearchServiceByNuclideUri)(projectPath);
      service.disposeFuzzySearch(projectPath);
    } catch (err) {
      logger.error(`Error disposing fuzzy filename service for ${ projectPath }`, err);
    } finally {
      this._projectRoots.delete(projectPath);
    }
  }

  registerProvider() {
    return (_FuzzyFileNameProvider || _load_FuzzyFileNameProvider()).default;
  }

  provideBusySignal() {
    return this._busySignalProvider;
  }

  dispose() {
    this._disposables.dispose();
  }
};
exports.default = (0, (_createPackage || _load_createPackage()).default)(Activation);
module.exports = exports['default'];