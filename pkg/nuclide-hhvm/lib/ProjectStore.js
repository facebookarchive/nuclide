'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _HackLanguage;

function _load_HackLanguage() {
  return _HackLanguage = require('../../nuclide-hack/lib/HackLanguage');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class ProjectStore {

  constructor() {
    this._emitter = new _atom.Emitter();
    this._currentFilePath = '';
    this._projectRoot = new _rxjsBundlesRxMinJs.BehaviorSubject();
    this._isHHVMProject = null;
    this._debugMode = 'webserver';
    this._filePathsToScriptCommand = new Map();
    this._stickyCommand = '';

    const onDidChange = this._onDidChangeActivePaneItem.bind(this);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._projectRoot.do(() => {
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

    const fileName = activeTextEditor.getPath();
    // flowlint-next-line sketchy-null-string:off
    if (!fileName) {
      return;
    }
    this._currentFilePath = fileName;
    this._emitter.emit('change');
  }

  _isFileHHVMProject(fileUri) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('toolbar.isFileHHVMProject', (0, _asyncToGenerator.default)(function* () {
      return fileUri != null && (_nuclideUri || _load_nuclideUri()).default.isRemote(fileUri) && (0, (_HackLanguage || _load_HackLanguage()).isFileInHackProject)(fileUri);
    }));
  }

  getLastScriptCommand(filePath) {
    const command = this._filePathsToScriptCommand.get(filePath);
    if (command != null) {
      return command;
    }
    return '';
  }

  updateLastScriptCommand(command) {
    this._filePathsToScriptCommand.set((_nuclideUri || _load_nuclideUri()).default.getPath(this._currentFilePath), command);
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

  getDebugTarget() {
    const filePath = this._currentFilePath;
    if (this._debugMode !== 'webserver') {
      if (this._stickyCommand !== '') {
        return this._stickyCommand;
      }
      const localPath = (_nuclideUri || _load_nuclideUri()).default.getPath(filePath);
      const lastScriptCommand = this.getLastScriptCommand(localPath);
      return lastScriptCommand === '' ? localPath : lastScriptCommand;
    }
    // getHostname throws for non-remote paths.
    // Technically this shouldn't be visible for non-remote paths, but the UI
    // can sometimes display the toolbar anyway.
    const rootPath = this._projectRoot.getValue();
    if (rootPath != null && (_nuclideUri || _load_nuclideUri()).default.isRemote(rootPath)) {
      return (_nuclideUri || _load_nuclideUri()).default.getHostname(rootPath);
    }
    return '';
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.default = ProjectStore; /**
                                 * Copyright (c) 2015-present, Facebook, Inc.
                                 * All rights reserved.
                                 *
                                 * This source code is licensed under the license found in the LICENSE file in
                                 * the root directory of this source tree.
                                 *
                                 * 
                                 * @format
                                 */