"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _atom = require("atom");

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _HackLanguage() {
  const data = require("../../nuclide-hack/lib/HackLanguage");

  _HackLanguage = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class ProjectStore {
  constructor() {
    this._emitter = new _atom.Emitter();
    this._currentFilePath = '';
    this._projectRoot = new _RxMin.BehaviorSubject();
    this._isHHVMProject = null;
    this._debugMode = 'webserver';
    this._filePathsToScriptCommand = new Map();
    this._stickyCommand = '';
    this._useTerminal = false;
    this._scriptArguments = '';

    const onDidChange = this._onDidChangeActivePaneItem.bind(this);

    this._disposables = new (_UniversalDisposable().default)(this._projectRoot.do(() => {
      // Set the project type to a "loading" state.
      this._isHHVMProject = null;

      this._emitter.emit('change');
    }).switchMap(root => this._isFileHHVMProject(root)).subscribe(isHHVM => {
      this._isHHVMProject = isHHVM;

      this._emitter.emit('change');
    }), atom.workspace.onDidStopChangingActivePaneItem(onDidChange));
    onDidChange();
  }

  _onDidChangeActivePaneItem() {
    const activeTextEditor = atom.workspace.getActiveTextEditor();

    if (!activeTextEditor) {
      return;
    }

    const fileName = activeTextEditor.getPath(); // flowlint-next-line sketchy-null-string:off

    if (!fileName) {
      return;
    }

    this._currentFilePath = fileName;

    this._emitter.emit('change');
  }

  _isFileHHVMProject(fileUri) {
    return (0, _nuclideAnalytics().trackTiming)('toolbar.isFileHHVMProject', async () => {
      return fileUri != null && _nuclideUri().default.isRemote(fileUri) && (0, _HackLanguage().isFileInHackProject)(fileUri);
    });
  }

  getLastScriptCommand(filePath) {
    const command = this._filePathsToScriptCommand.get(filePath);

    if (command != null) {
      return command;
    }

    return '';
  }

  updateLastScriptCommand(command) {
    this._filePathsToScriptCommand.set(_nuclideUri().default.getPath(this._currentFilePath), command);
  }

  onChange(callback) {
    return this._emitter.on('change', callback);
  }

  getCurrentFilePath() {
    return this._currentFilePath;
  }

  setProjectRoot(root) {
    this._projectRoot.next(root);
  }

  getProjectRoot() {
    return this._projectRoot.getValue();
  }

  isHHVMProject() {
    return this._isHHVMProject;
  }

  getDebugMode() {
    return this._debugMode;
  }

  setDebugMode(debugMode) {
    this._debugMode = debugMode;

    this._emitter.emit('change');
  }

  setScriptArguments(args) {
    this._scriptArguments = args;
  }

  getScriptArguments() {
    return this._scriptArguments;
  }

  setStickyCommand(command, sticky) {
    if (sticky) {
      this._stickyCommand = command;
    } else {
      const activeTextEditor = atom.workspace.getActiveTextEditor();

      if (!activeTextEditor || !activeTextEditor.getPath()) {
        this._currentFilePath = command;
      }

      this._stickyCommand = '';
    }
  }

  setUseTerminal(useTerminal) {
    this._useTerminal = useTerminal;
  }

  getUseTerminal() {
    return this._useTerminal;
  }

  getDebugTarget() {
    const filePath = this._currentFilePath;

    if (this._debugMode !== 'webserver') {
      if (this._stickyCommand !== '') {
        return this._stickyCommand;
      }

      const localPath = _nuclideUri().default.getPath(filePath);

      const lastScriptCommand = this.getLastScriptCommand(localPath);
      return lastScriptCommand === '' ? localPath : lastScriptCommand;
    } // getHostname throws for non-remote paths.
    // Technically this shouldn't be visible for non-remote paths, but the UI
    // can sometimes display the toolbar anyway.


    const rootPath = this._projectRoot.getValue();

    if (rootPath != null && _nuclideUri().default.isRemote(rootPath)) {
      return _nuclideUri().default.getHostname(rootPath);
    }

    return '';
  }

  dispose() {
    this._disposables.dispose();
  }

}

exports.default = ProjectStore;