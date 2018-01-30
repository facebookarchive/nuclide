'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PathsObserver = undefined;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PathsObserver {

  constructor(workingSetsStore) {
    this._prevPaths = atom.project.getPaths();
    this._workingSetsStore = workingSetsStore;

    this._disposable = atom.project.onDidChangePaths(this._didChangePaths.bind(this));
  }

  dispose() {
    this._disposable.dispose();
  }

  _didChangePaths(_paths) {
    const paths = _paths.filter(p => (_nuclideUri || _load_nuclideUri()).default.isRemote(p) || (_nuclideUri || _load_nuclideUri()).default.isAbsolute(p));
    this._workingSetsStore.updateApplicability();

    const prevPaths = this._prevPaths;
    this._prevPaths = paths;

    const currentWs = this._workingSetsStore.getCurrent();
    const noneShown = !paths.some(p => currentWs.containsDir(p));
    if (noneShown) {
      this._workingSetsStore.deactivateAll();
      return;
    }

    const addedPaths = paths.filter(p => prevPaths.indexOf(p) < 0);
    const pathChangeWasHidden = addedPaths.some(p => !currentWs.containsDir(p));

    // The user added a new project root and the currently active working sets did not let
    // it show. This would feel broken - better deactivate the working sets.
    if (pathChangeWasHidden) {
      this._workingSetsStore.deactivateAll();
    }
  }
}
exports.PathsObserver = PathsObserver; /**
                                        * Copyright (c) 2015-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the license found in the LICENSE file in
                                        * the root directory of this source tree.
                                        *
                                        * 
                                        * @format
                                        */