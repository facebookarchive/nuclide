'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _dec, _desc, _value, _class;

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports


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
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let ProjectStore = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('toolbar.isFileHHVMProject'), (_class = class ProjectStore {

  constructor() {
    this._emitter = new _atom.Emitter();
    this._currentFilePath = '';
    this._projectRoot = new _rxjsBundlesRxMinJs.BehaviorSubject();
    this._projectType = 'Other';
    this._debugMode = 'webserver';
    this._filePathsToScriptCommand = new Map();

    const onDidChange = this._onDidChangeActivePaneItem.bind(this);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._projectRoot.switchMap(root => this._isFileHHVMProject(root)).subscribe(isHHVM => {
      this._projectType = isHHVM ? 'Hhvm' : 'Other';
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
    if (!fileName) {
      return;
    }
    this._currentFilePath = fileName;
    this._emitter.emit('change');
  }

  _isFileHHVMProject(fileUri) {
    return (0, _asyncToGenerator.default)(function* () {
      return fileUri != null && (_nuclideUri || _load_nuclideUri()).default.isRemote(fileUri) && (yield (0, (_HackLanguage || _load_HackLanguage()).isFileInHackProject)(fileUri));
    })();
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

  getProjectType() {
    return this._projectType;
  }

  getDebugMode() {
    return this._debugMode;
  }

  setDebugMode(debugMode) {
    this._debugMode = debugMode;
    this._emitter.emit('change');
  }

  getDebugTarget() {
    const filePath = this._currentFilePath;
    if (this._debugMode === 'script') {
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
}, (_applyDecoratedDescriptor(_class.prototype, '_isFileHHVMProject', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, '_isFileHHVMProject'), _class.prototype)), _class));


module.exports = ProjectStore;