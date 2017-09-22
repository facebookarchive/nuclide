'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Activation = undefined;

var _CwdApi;

function _load_CwdApi() {
  return _CwdApi = require('./CwdApi');
}

var _atom = require('atom');

var _projects;

function _load_projects() {
  return _projects = require('nuclide-commons-atom/projects');
}

var _getElementFilePath;

function _load_getElementFilePath() {
  return _getElementFilePath = _interopRequireDefault(require('../../commons-atom/getElementFilePath'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(rawState) {
    const state = rawState || {};
    const { initialCwdPath } = state;
    this._cwdApi = new (_CwdApi || _load_CwdApi()).CwdApi(initialCwdPath);
    this._currentWorkingRootDirectory = this._cwdApi.getCwd();
    this._disposables = new _atom.CompositeDisposable(this._cwdApi, atom.commands.add('atom-workspace', 'nuclide-current-working-root:set-from-active-file', this._setFromActiveFile.bind(this)), atom.commands.add('atom-workspace', 'nuclide-current-working-root:switch-to-previous', this._switchToLastWorkingRoot.bind(this)), this._cwdApi.observeCwd(newCwd => {
      if (this._currentWorkingRootDirectory != null) {
        const oldCwd = this._currentWorkingRootDirectory.getPath();
        if (newCwd === oldCwd) {
          return;
        }
        this._lastWorkingRootPath = oldCwd;
      }
      this._currentWorkingRootDirectory = newCwd;
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  provideApi() {
    return this._cwdApi;
  }

  serialize() {
    const cwd = this._cwdApi.getCwd();
    return {
      initialCwdPath: cwd == null ? null : cwd.getPath()
    };
  }

  _switchToLastWorkingRoot() {
    if (this._lastWorkingRootPath != null) {
      this._cwdApi.setCwd(this._lastWorkingRootPath);
    }
  }

  _setFromActiveFile(event) {
    let path = (0, (_getElementFilePath || _load_getElementFilePath()).default)(event.target);
    if (path == null) {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        atom.notifications.addError('No file is currently active.');
        return;
      }

      path = editor.getPath();
      if (path == null) {
        atom.notifications.addError('Active file does not have a path.');
        return;
      }
    }

    const projectRoot = (0, (_projects || _load_projects()).getAtomProjectRootPath)(path);
    if (projectRoot == null) {
      atom.notifications.addError('Active file does not belong to a project.');
      return;
    }

    this._cwdApi.setCwd(projectRoot);
  }
}
exports.Activation = Activation; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */