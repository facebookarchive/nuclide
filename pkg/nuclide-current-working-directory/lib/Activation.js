"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _CwdApi() {
  const data = _interopRequireDefault(require("./CwdApi"));

  _CwdApi = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _projects() {
  const data = require("../../../modules/nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _getElementFilePath() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/getElementFilePath"));

  _getElementFilePath = function () {
    return data;
  };

  return data;
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
class Activation {
  constructor(rawState) {
    const state = rawState || {};
    const {
      initialCwdPath
    } = state;
    this._cwdApi = new (_CwdApi().default)(initialCwdPath);
    this._currentWorkingRootDirectory = this._cwdApi.getCwd();
    this._disposables = new (_UniversalDisposable().default)(this._cwdApi, atom.commands.add('atom-workspace', 'nuclide-current-working-root:set-from-active-file', this._setFromActiveFile.bind(this)), atom.commands.add('atom-workspace', 'nuclide-current-working-root:switch-to-previous', this._switchToLastWorkingRoot.bind(this)), this._cwdApi.observeCwd(newCwd => {
      if (this._currentWorkingRootDirectory != null) {
        const oldCwd = this._currentWorkingRootDirectory;

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
      initialCwdPath: cwd
    };
  }

  _switchToLastWorkingRoot() {
    if (this._lastWorkingRootPath != null) {
      this._cwdApi.setCwd(this._lastWorkingRootPath);
    }
  }

  _setFromActiveFile(event) {
    let path = (0, _getElementFilePath().default)(event.target);

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

    const projectRoot = (0, _projects().getAtomProjectRootPath)(path);

    if (projectRoot == null) {
      atom.notifications.addError('Active file does not belong to a project.');
      return;
    }

    this._cwdApi.setCwd(projectRoot);
  }

}

exports.default = Activation;