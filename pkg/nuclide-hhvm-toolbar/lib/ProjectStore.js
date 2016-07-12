var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideHackLibUtils2;

function _nuclideHackLibUtils() {
  return _nuclideHackLibUtils2 = require('../../nuclide-hack/lib/utils');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _events2;

function _events() {
  return _events2 = require('events');
}

var _nuclideBuckBase2;

function _nuclideBuckBase() {
  return _nuclideBuckBase2 = require('../../nuclide-buck-base');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _commonsAtomDebounced2;

function _commonsAtomDebounced() {
  return _commonsAtomDebounced2 = require('../../commons-atom/debounced');
}

var ProjectStore = (function () {
  function ProjectStore() {
    _classCallCheck(this, ProjectStore);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._eventEmitter = new (_events2 || _events()).EventEmitter();
    this._currentFilePath = '';
    this._projectType = 'Other';
    this._filePathsToScriptCommand = new Map();
    this._monitorActiveEditorChange();
  }

  _createDecoratedClass(ProjectStore, [{
    key: '_monitorActiveEditorChange',
    value: function _monitorActiveEditorChange() {
      // For the current active editor, and any update to the active editor,
      // decide whether the toolbar should be displayed.
      var callback = this._onDidChangeActivePaneItem.bind(this);
      this._disposables.add((0, (_commonsAtomDebounced2 || _commonsAtomDebounced()).onWorkspaceDidStopChangingActivePaneItem)(callback));
      callback();
    }
  }, {
    key: '_onDidChangeActivePaneItem',
    value: _asyncToGenerator(function* () {
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      if (!activeTextEditor) {
        return;
      }

      var fileName = activeTextEditor.getPath();
      if (!fileName) {
        return;
      }
      this._currentFilePath = fileName;

      this._projectType = 'Other';
      var isBuckProject = yield this._isFileBuckProject(fileName);
      if (isBuckProject) {
        this._projectType = 'Buck';
      } else if (yield this._isFileHHVMProject(fileName)) {
        this._projectType = 'Hhvm';
      }
      this._eventEmitter.emit('change');
    })
  }, {
    key: '_isFileHHVMProject',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('toolbar.isFileHHVMProject')],
    value: _asyncToGenerator(function* (fileUri) {
      var _ref = yield (0, (_nuclideHackLibUtils2 || _nuclideHackLibUtils()).getHackEnvironmentDetails)(fileUri);

      var hackService = _ref.hackService;

      return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(fileUri) && hackService != null && (yield hackService.isFileInHackProject(fileUri));
    })
  }, {
    key: '_isFileBuckProject',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('toolbar.isFileBuckProject')],
    value: _asyncToGenerator(function* (fileName) {
      var buckProject = yield (0, (_nuclideBuckBase2 || _nuclideBuckBase()).getBuckProjectRoot)(fileName);
      return buckProject != null;
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
      this._filePathsToScriptCommand.set((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(this._currentFilePath), command);
    }
  }, {
    key: 'onChange',
    value: function onChange(callback) {
      var emitter = this._eventEmitter;
      this._eventEmitter.on('change', callback);
      return new (_atom2 || _atom()).Disposable(function () {
        return emitter.removeListener('change', callback);
      });
    }
  }, {
    key: 'getCurrentFilePath',
    value: function getCurrentFilePath() {
      return this._currentFilePath;
    }
  }, {
    key: 'getProjectType',
    value: function getProjectType() {
      return this._projectType;
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