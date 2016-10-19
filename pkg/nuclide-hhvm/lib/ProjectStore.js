var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideHackLibHackLanguage;

function _load_nuclideHackLibHackLanguage() {
  return _nuclideHackLibHackLanguage = require('../../nuclide-hack/lib/HackLanguage');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var ProjectStore = (function () {
  function ProjectStore() {
    var _this = this;

    _classCallCheck(this, ProjectStore);

    this._emitter = new (_atom || _load_atom()).Emitter();
    this._currentFilePath = '';
    this._projectRoot = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).BehaviorSubject();
    this._projectType = 'Other';
    this._debugMode = 'webserver';
    this._filePathsToScriptCommand = new Map();

    var onDidChange = this._onDidChangeActivePaneItem.bind(this);
    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this._projectRoot.switchMap(function (root) {
      return _this._isFileHHVMProject(root);
    }).subscribe(function (isHHVM) {
      _this._projectType = isHHVM ? 'Hhvm' : 'Other';
      _this._emitter.emit('change');
    }), atom.workspace.onDidStopChangingActivePaneItem(onDidChange));
    onDidChange();
  }

  _createDecoratedClass(ProjectStore, [{
    key: '_onDidChangeActivePaneItem',
    value: function _onDidChangeActivePaneItem() {
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      if (!activeTextEditor) {
        return;
      }

      var fileName = activeTextEditor.getPath();
      if (!fileName) {
        return;
      }
      this._currentFilePath = fileName;
      this._emitter.emit('change');
    }
  }, {
    key: '_isFileHHVMProject',
    decorators: [(0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('toolbar.isFileHHVMProject')],
    value: _asyncToGenerator(function* (fileUri) {
      return fileUri != null && (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(fileUri) && (yield (0, (_nuclideHackLibHackLanguage || _load_nuclideHackLibHackLanguage()).isFileInHackProject)(fileUri));
    })
  }, {
    key: 'getLastScriptCommand',
    value: function getLastScriptCommand(filePath) {
      var command = this._filePathsToScriptCommand.get(filePath);
      if (command != null) {
        return command;
      }
      return '';
    }
  }, {
    key: 'updateLastScriptCommand',
    value: function updateLastScriptCommand(command) {
      this._filePathsToScriptCommand.set((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(this._currentFilePath), command);
    }
  }, {
    key: 'onChange',
    value: function onChange(callback) {
      return this._emitter.on('change', callback);
    }
  }, {
    key: 'getCurrentFilePath',
    value: function getCurrentFilePath() {
      return this._currentFilePath;
    }
  }, {
    key: 'setProjectRoot',
    value: function setProjectRoot(root) {
      this._projectRoot.next(root);
    }
  }, {
    key: 'getProjectType',
    value: function getProjectType() {
      return this._projectType;
    }
  }, {
    key: 'getDebugMode',
    value: function getDebugMode() {
      return this._debugMode;
    }
  }, {
    key: 'setDebugMode',
    value: function setDebugMode(debugMode) {
      this._debugMode = debugMode;
      this._emitter.emit('change');
    }
  }, {
    key: 'getDebugTarget',
    value: function getDebugTarget() {
      var filePath = this._currentFilePath;
      if (this._debugMode === 'script') {
        var localPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(filePath);
        var lastScriptCommand = this.getLastScriptCommand(localPath);
        return lastScriptCommand === '' ? localPath : lastScriptCommand;
      }
      // getHostname throws for non-remote paths.
      // Technically this shouldn't be visible for non-remote paths, but the UI
      // can sometimes display the toolbar anyway.
      var rootPath = this._projectRoot.getValue();
      if (rootPath != null && (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(rootPath)) {
        return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getHostname(rootPath);
      }
      return '';
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return ProjectStore;
})();

module.exports = ProjectStore;