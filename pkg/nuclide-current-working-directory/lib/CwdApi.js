'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _memoize2;

function _load_memoize() {
  return _memoize2 = _interopRequireDefault(require('lodash/memoize'));
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('../../nuclide-file-tree/lib/FileTreeHelpers'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class CwdApi {

  constructor(initialPath) {
    this._disposed = new _rxjsBundlesRxMinJs.ReplaySubject(1);
    this._getPaths = (0, (_memoize2 || _load_memoize()).default)(() => {
      // Since adding and removing projects can affect the validity of cwdPath, we need to re-query
      // every time it happens.
      const projectPathChanges = (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => atom.project.onDidChangePaths(cb)).mapTo(null).share();

      return _rxjsBundlesRxMinJs.Observable.merge(this._explicitlySetPaths, projectPathChanges).map(() => this.getCwd()).distinctUntilChanged().takeUntil(this._disposed);
    });

    this._explicitlySetPaths = new _rxjsBundlesRxMinJs.BehaviorSubject(initialPath);
  }

  setCwd(path) {
    if (getDirectory(path) == null) {
      throw new Error(`Path does not belong to a project root: ${path}`);
    }
    this._explicitlySetPaths.next(path);
  }

  observeCwd(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._getPaths().subscribe(path => {
      callback(path);
    }));
  }

  dispose() {
    this._disposed.next();
  }

  /**
   * Create an observable that represents the CWD path changes.
   */


  _getDefaultPath() {
    for (const directory of atom.project.getDirectories()) {
      if (isValidDirectory(directory)) {
        return directory.getPath();
      }
    }
    return null;
  }

  getCwd() {
    if (isValidDirectoryPath(this._explicitlySetPaths.getValue())) {
      return this._explicitlySetPaths.getValue();
    } else if (isValidDirectoryPath(this._getDefaultPath())) {
      return this._getDefaultPath();
    }
    return null;
  }
}

exports.default = CwdApi; /**
                           * Copyright (c) 2015-present, Facebook, Inc.
                           * All rights reserved.
                           *
                           * This source code is licensed under the license found in the LICENSE file in
                           * the root directory of this source tree.
                           *
                           *  strict-local
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

function isValidDirectoryPath(path) {
  return getDirectory(path) != null;
}

function isValidDirectory(directory) {
  if (directory == null) {
    return true;
  }
  return (_FileTreeHelpers || _load_FileTreeHelpers()).default.isValidDirectory(directory);
}