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
  return _projects = require('../../commons-atom/projects');
}

class Activation {

  constructor(rawState) {
    const state = rawState || {};
    const { initialCwdPath } = state;
    this._cwdApi = new (_CwdApi || _load_CwdApi()).CwdApi(initialCwdPath);
    this._disposables = new _atom.CompositeDisposable(this._cwdApi, atom.commands.add('atom-workspace', 'nuclide-current-working-root:set-from-active-file', this._setFromActiveFile.bind(this)));
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

  _setFromActiveFile() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      atom.notifications.addError('No file is currently active.');
      return;
    }

    const path = editor.getPath();
    if (path == null) {
      atom.notifications.addError('Active file does not have a path.');
      return;
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
                                  */