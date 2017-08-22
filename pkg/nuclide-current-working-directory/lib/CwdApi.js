'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CwdApi = undefined;

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('../../nuclide-file-tree/lib/FileTreeHelpers'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class CwdApi {

  constructor(initialCwdPath) {
    this._cwdPath$ = new _rxjsBundlesRxMinJs.BehaviorSubject(initialCwdPath);
    this._cwd$ = this._cwdPath$
    // Re-check the CWD every time the project paths change.
    // Adding/removing projects can affect the validity of cwdPath.
    .merge((0, (_event || _load_event()).observableFromSubscribeFunction)(cb => atom.project.onDidChangePaths(cb)).mapTo(null)).map(() => this.getCwd()).map(directory => isValidDirectory(directory) ? directory : null).distinctUntilChanged();

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  setCwd(path) {
    if (getDirectory(path) == null) {
      throw new Error(`Path does not belong to a project root: ${path}`);
    }
    this._cwdPath$.next(path);
  }

  observeCwd(callback) {
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._cwd$.subscribe(directory => {
      callback(directory);
    }));
    this._disposables.add(disposable);
    return disposable;
  }

  dispose() {
    this._disposables.dispose();
  }

  _getDefaultCwdPath() {
    for (const directory of atom.project.getDirectories()) {
      if (isValidDirectory(directory)) {
        return directory.getPath();
      }
    }
    return null;
  }

  getCwd() {
    return getDirectory(this._cwdPath$.getValue()) || getDirectory(this._getDefaultCwdPath());
  }
}

exports.CwdApi = CwdApi; /**
                          * Copyright (c) 2015-present, Facebook, Inc.
                          * All rights reserved.
                          *
                          * This source code is licensed under the license found in the LICENSE file in
                          * the root directory of this source tree.
                          *
                          * 
                          * @format
                          */

function getDirectory(path) {
  if (path == null) {
    return null;
  }
  for (const directory of atom.project.getDirectories()) {
    if (!isValidDirectory(directory)) {
      continue;
    }
    const dirPath = directory.getPath();
    if ((_nuclideUri || _load_nuclideUri()).default.contains(dirPath, path)) {
      const relative = (_nuclideUri || _load_nuclideUri()).default.relative(dirPath, path);
      return directory.getSubdirectory(relative);
    }
  }
}

function isValidDirectory(directory) {
  if (directory == null) {
    return true;
  }
  return (_FileTreeHelpers || _load_FileTreeHelpers()).default.isValidDirectory(directory);
}