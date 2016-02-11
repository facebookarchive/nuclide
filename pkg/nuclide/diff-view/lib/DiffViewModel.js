var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _hgGitBridge = require('../../hg-git-bridge');

var _analytics = require('../../analytics');

var _utils = require('./utils');

var _commons = require('../../commons');

var _RepositoryStack = require('./RepositoryStack');

var _RepositoryStack2 = _interopRequireDefault(_RepositoryStack);

var _notifications = require('./notifications');

var _atomHelpers = require('../../atom-helpers');

var CHANGE_DIRTY_STATUS_EVENT = 'did-change-dirty-status';
var CHANGE_COMPARE_STATUS_EVENT = 'did-change-compare-status';
var ACTIVE_FILE_UPDATE_EVENT = 'active-file-update';
var CHANGE_REVISIONS_EVENT = 'did-change-revisions';
var ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT = 'active-buffer-change-modified';

var FILE_CHANGE_DEBOUNCE_MS = 200;
var UI_CHANGE_DEBOUNCE_MS = 100;

var DiffViewModel = (function () {
  function DiffViewModel(uiProviders) {
    _classCallCheck(this, DiffViewModel);

    this._uiProviders = uiProviders;
    this._dirtyFileChanges = new Map();
    this._compareFileChanges = new Map();
    this._emitter = new _atom.Emitter();
    this._subscriptions = new _atom.CompositeDisposable();
    this._repositoryStacks = new Map();
    this._repositorySubscriptions = new Map();
    this._isActive = false;
    this._updateRepositories();
    this._subscriptions.add(atom.project.onDidChangePaths(this._updateRepositories.bind(this)));
    this._debouncedEmitActiveFileUpdate = (0, _commons.debounce)(this._emitActiveFileUpdate.bind(this), UI_CHANGE_DEBOUNCE_MS, false);
    this._setActiveFileState({
      filePath: '',
      oldContents: '',
      newContents: ''
    });
  }

  _createDecoratedClass(DiffViewModel, [{
    key: '_updateRepositories',
    value: function _updateRepositories() {
      var repositories = new Set(atom.project.getRepositories().filter(function (repository) {
        return repository != null && repository.getType() === 'hg';
      }));
      // Dispose removed projects repositories.
      for (var _ref3 of this._repositoryStacks) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var repository = _ref2[0];
        var repositoryStack = _ref2[1];

        if (repositories.has(repository)) {
          continue;
        }
        repositoryStack.dispose();
        this._repositoryStacks['delete'](repository);
        var subscriptions = this._repositorySubscriptions.get(repository);
        (0, _assert2['default'])(subscriptions);
        subscriptions.dispose();
        this._repositorySubscriptions['delete'](repository);
      }

      for (var repository of repositories) {
        if (this._repositoryStacks.has(repository)) {
          continue;
        }
        var hgRepository = repository;
        this._createRepositoryStack(hgRepository);
      }

      this._updateDirtyChangedStatus();
    }
  }, {
    key: '_updateDirtyChangedStatus',
    value: function _updateDirtyChangedStatus() {
      this._dirtyFileChanges = this._compareFileChanges = _commons.map.union.apply(_commons.map, _toConsumableArray(_commons.array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
        return repositoryStack.getDirtyFileChanges();
      })));
      this._emitter.emit(CHANGE_DIRTY_STATUS_EVENT, this._dirtyFileChanges);
    }
  }, {
    key: '_createRepositoryStack',
    value: function _createRepositoryStack(repository) {
      var _this = this;

      var repositoryStack = new _RepositoryStack2['default'](repository);
      var subscriptions = new _atom.CompositeDisposable();
      subscriptions.add(repositoryStack.onDidChangeDirtyStatus(this._updateDirtyChangedStatus.bind(this)), repositoryStack.onDidChangeCompareStatus(this._updateCompareChangedStatus.bind(this)), repositoryStack.onDidChangeRevisions(function (revisionsState) {
        _this._updateChangedRevisions(repositoryStack, revisionsState, true)['catch'](_notifications.notifyInternalError);
      }));
      this._repositoryStacks.set(repository, repositoryStack);
      this._repositorySubscriptions.set(repository, subscriptions);
      if (this._isActive) {
        repositoryStack.activate();
      }
      return repositoryStack;
    }
  }, {
    key: '_updateCompareChangedStatus',
    value: function _updateCompareChangedStatus() {
      this._compareFileChanges = _commons.map.union.apply(_commons.map, _toConsumableArray(_commons.array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
        return repositoryStack.getCompareFileChanges();
      })));
      this._emitter.emit(CHANGE_COMPARE_STATUS_EVENT, this._compareFileChanges);
    }
  }, {
    key: '_updateChangedRevisions',
    value: _asyncToGenerator(function* (repositoryStack, revisionsState, reloadFileDiff) {
      if (repositoryStack === this._activeRepositoryStack) {
        (0, _analytics.track)('diff-view-update-timeline-revisions', {
          revisionsCount: '' + revisionsState.revisions.length
        });
        this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);

        // Update the active file, if changed.
        var filePath = this._activeFileState.filePath;

        if (!filePath || !reloadFileDiff) {
          return;
        }

        var _ref4 = yield this._fetchHgDiff(filePath);

        var committedContents = _ref4.committedContents;
        var filesystemContents = _ref4.filesystemContents;

        yield this._updateDiffStateIfChanged(filePath, committedContents, filesystemContents);
      }
    })
  }, {
    key: 'activateFile',
    value: function activateFile(filePath) {
      var _this2 = this;

      if (this._activeSubscriptions) {
        this._activeSubscriptions.dispose();
      }
      var activeSubscriptions = this._activeSubscriptions = new _atom.CompositeDisposable();
      // TODO(most): Show progress indicator: t8991676
      var buffer = (0, _atomHelpers.bufferForUri)(filePath);
      var file = buffer.file;

      if (file != null) {
        activeSubscriptions.add(file.onDidChange((0, _commons.debounce)(function () {
          return _this2._onDidFileChange(filePath)['catch'](_notifications.notifyInternalError);
        }, FILE_CHANGE_DEBOUNCE_MS, false)));
      }
      activeSubscriptions.add(buffer.onDidChangeModified(this._onDidBufferChangeModified.bind(this)));
      (0, _analytics.track)('diff-view-open-file', { filePath: filePath });
      this._updateActiveDiffState(filePath)['catch'](_notifications.notifyInternalError);
    }
  }, {
    key: '_onDidFileChange',
    decorators: [(0, _analytics.trackTiming)('diff-view.file-change-update')],
    value: _asyncToGenerator(function* (filePath) {
      if (this._activeFileState.filePath !== filePath) {
        return;
      }
      var filesystemContents = yield (0, _utils.getFileSystemContents)(filePath);
      var committedContents = this._activeFileState.oldContents;

      yield this._updateDiffStateIfChanged(filePath, committedContents, filesystemContents);
    })
  }, {
    key: '_onDidBufferChangeModified',
    value: function _onDidBufferChangeModified() {
      this._emitter.emit(ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT);
    }
  }, {
    key: 'onDidActiveBufferChangeModified',
    value: function onDidActiveBufferChangeModified(callback) {
      return this._emitter.on(ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT, callback);
    }
  }, {
    key: 'isActiveBufferModified',
    value: function isActiveBufferModified() {
      var filePath = this._activeFileState.filePath;

      var buffer = (0, _atomHelpers.bufferForUri)(filePath);
      return buffer.isModified();
    }
  }, {
    key: '_updateDiffStateIfChanged',
    value: function _updateDiffStateIfChanged(filePath, committedContents, filesystemContents) {
      var _activeFileState = this._activeFileState;
      var activeFilePath = _activeFileState.filePath;
      var newContents = _activeFileState.newContents;
      var savedContents = _activeFileState.savedContents;

      if (filePath !== activeFilePath) {
        return Promise.resolve();
      }
      if (savedContents === newContents || filesystemContents === newContents) {
        return this._updateDiffState(filePath, {
          committedContents: committedContents,
          filesystemContents: filesystemContents
        });
      }
      // The user have edited since the last update.
      if (filesystemContents === savedContents) {
        // The changes haven't touched the filesystem, keep user edits.
        return this._updateDiffState(filePath, {
          committedContents: committedContents,
          filesystemContents: newContents
        });
      } else {
        // The committed and filesystem state have changed, notify of override.
        (0, _notifications.notifyFilesystemOverrideUserEdits)(filePath);
        return this._updateDiffState(filePath, {
          committedContents: committedContents,
          filesystemContents: filesystemContents
        });
      }
    }
  }, {
    key: 'setNewContents',
    value: function setNewContents(newContents) {
      var _activeFileState2 = this._activeFileState;
      var filePath = _activeFileState2.filePath;
      var oldContents = _activeFileState2.oldContents;
      var savedContents = _activeFileState2.savedContents;
      var inlineComponents = _activeFileState2.inlineComponents;

      this._setActiveFileState({
        filePath: filePath,
        oldContents: oldContents,
        newContents: newContents,
        savedContents: savedContents,
        inlineComponents: inlineComponents
      });
    }
  }, {
    key: 'setRevision',
    value: function setRevision(revision) {
      (0, _analytics.track)('diff-view-set-revision');
      var repositoryStack = this._activeRepositoryStack;
      (0, _assert2['default'])(repositoryStack, 'There must be an active repository stack!');
      repositoryStack.setRevision(revision)['catch'](_notifications.notifyInternalError);
    }
  }, {
    key: 'getActiveFileState',
    value: function getActiveFileState() {
      return this._activeFileState;
    }
  }, {
    key: '_updateActiveDiffState',
    value: _asyncToGenerator(function* (filePath) {
      if (!filePath) {
        return;
      }
      var hgDiffState = yield this._fetchHgDiff(filePath);
      yield this._updateDiffState(filePath, hgDiffState);
    })
  }, {
    key: '_updateDiffState',
    value: _asyncToGenerator(function* (filePath, hgDiffState) {
      var oldContents = hgDiffState.committedContents;
      var newContents = hgDiffState.filesystemContents;

      this._setActiveFileState({
        filePath: filePath,
        oldContents: oldContents,
        newContents: newContents,
        savedContents: newContents
      });
      var inlineComponents = yield this._fetchInlineComponents();
      this._setActiveFileState({
        filePath: filePath,
        oldContents: oldContents,
        newContents: newContents,
        savedContents: newContents,
        inlineComponents: inlineComponents
      });
    })
  }, {
    key: '_setActiveFileState',
    value: function _setActiveFileState(state) {
      this._activeFileState = state;
      this._debouncedEmitActiveFileUpdate();
    }
  }, {
    key: '_emitActiveFileUpdate',
    value: function _emitActiveFileUpdate() {
      this._emitter.emit(ACTIVE_FILE_UPDATE_EVENT, this._activeFileState);
    }
  }, {
    key: '_fetchHgDiff',
    decorators: [(0, _analytics.trackTiming)('diff-view.hg-state-update')],
    value: _asyncToGenerator(function* (filePath) {
      // Calling atom.project.repositoryForDirectory gets the real path of the directory,
      // which is another round-trip and calls the repository providers to get an existing repository.
      // Instead, the first match of the filtering here is the only possible match.
      var repository = (0, _hgGitBridge.repositoryForPath)(filePath);
      if (repository == null || repository.getType() !== 'hg') {
        var type = repository ? repository.getType() : 'no repository';
        throw new Error('Diff view only supports `Mercurial` repositories, but found `' + type + '`');
      }

      var hgRepository = repository;
      var repositoryStack = this._repositoryStacks.get(hgRepository);
      (0, _assert2['default'])(repositoryStack);

      var _ref5 = yield Promise.all([repositoryStack.fetchHgDiff(filePath), this._setActiveRepositoryStack(repositoryStack)]);

      var _ref52 = _slicedToArray(_ref5, 1);

      var hgDiff = _ref52[0];

      return hgDiff;
    })
  }, {
    key: '_setActiveRepositoryStack',
    value: _asyncToGenerator(function* (repositoryStack) {
      if (this._activeRepositoryStack === repositoryStack) {
        return;
      }
      this._activeRepositoryStack = repositoryStack;
      var revisionsState = yield repositoryStack.getCachedRevisionsStatePromise();
      this._updateChangedRevisions(repositoryStack, revisionsState, false);
    })
  }, {
    key: 'saveActiveFile',
    decorators: [(0, _analytics.trackTiming)('diff-view.save-file')],
    value: _asyncToGenerator(function* () {
      var filePath = this._activeFileState.filePath;

      (0, _analytics.track)('diff-view-save-file', { filePath: filePath });
      try {
        this._activeFileState.savedContents = yield this._saveFile(filePath);
      } catch (error) {
        (0, _notifications.notifyInternalError)(error);
      }
    })
  }, {
    key: '_saveFile',
    value: _asyncToGenerator(function* (filePath) {
      var buffer = (0, _atomHelpers.bufferForUri)(filePath);
      if (buffer == null) {
        throw new Error('Could not find file buffer to save: `' + filePath + '`');
      }
      try {
        yield buffer.save();
        return buffer.getText();
      } catch (err) {
        throw new Error('Could not save file buffer: `' + filePath + '` - ' + err.toString());
      }
    })
  }, {
    key: 'onDidChangeDirtyStatus',
    value: function onDidChangeDirtyStatus(callback) {
      return this._emitter.on(CHANGE_DIRTY_STATUS_EVENT, callback);
    }
  }, {
    key: 'onDidChangeCompareStatus',
    value: function onDidChangeCompareStatus(callback) {
      return this._emitter.on(CHANGE_COMPARE_STATUS_EVENT, callback);
    }
  }, {
    key: 'onRevisionsUpdate',
    value: function onRevisionsUpdate(callback) {
      return this._emitter.on(CHANGE_REVISIONS_EVENT, callback);
    }
  }, {
    key: 'onActiveFileUpdates',
    value: function onActiveFileUpdates(callback) {
      return this._emitter.on(ACTIVE_FILE_UPDATE_EVENT, callback);
    }
  }, {
    key: '_fetchInlineComponents',
    decorators: [(0, _analytics.trackTiming)('diff-view.fetch-comments')],
    value: _asyncToGenerator(function* () {
      var filePath = this._activeFileState.filePath;

      var uiElementPromises = this._uiProviders.map(function (provider) {
        return provider.composeUiElements(filePath);
      });
      var uiComponentLists = yield Promise.all(uiElementPromises);
      // Flatten uiComponentLists from list of lists of components to a list of components.
      var uiComponents = [].concat.apply([], uiComponentLists);
      return uiComponents;
    })
  }, {
    key: 'getDirtyFileChanges',
    value: function getDirtyFileChanges() {
      return this._dirtyFileChanges;
    }
  }, {
    key: 'getCompareFileChanges',
    value: function getCompareFileChanges() {
      return this._compareFileChanges;
    }
  }, {
    key: 'getActiveRevisionsState',
    value: _asyncToGenerator(function* () {
      if (this._activeRepositoryStack == null) {
        return null;
      }
      return yield this._activeRepositoryStack.getCachedRevisionsStatePromise();
    })
  }, {
    key: 'activate',
    value: function activate() {
      this._isActive = true;
      for (var repositoryStack of this._repositoryStacks.values()) {
        repositoryStack.activate();
      }
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this._isActive = false;
      if (this._activeRepositoryStack != null) {
        this._activeRepositoryStack.deactivate();
        this._activeRepositoryStack = null;
      }
      this._setActiveFileState({
        filePath: '',
        oldContents: '',
        newContents: ''
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      for (var repositoryStack of this._repositoryStacks.values()) {
        repositoryStack.dispose();
      }
      this._repositoryStacks.clear();
      for (var subscription of this._repositorySubscriptions.values()) {
        subscription.dispose();
      }
      this._repositorySubscriptions.clear();
      this._dirtyFileChanges.clear();
      if (this._activeSubscriptions != null) {
        this._activeSubscriptions.dispose();
        this._activeSubscriptions = null;
      }
    }
  }]);

  return DiffViewModel;
})();

module.exports = DiffViewModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3TW9kZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBZ0JzQixRQUFROzs7O29CQUNhLE1BQU07OzJCQUNqQixxQkFBcUI7O3lCQUNwQixpQkFBaUI7O3FCQUNkLFNBQVM7O3VCQUNWLGVBQWU7OytCQUN0QixtQkFBbUI7Ozs7NkJBSXhDLGlCQUFpQjs7MkJBQ0csb0JBQW9COztBQUUvQyxJQUFNLHlCQUF5QixHQUFHLHlCQUF5QixDQUFDO0FBQzVELElBQU0sMkJBQTJCLEdBQUcsMkJBQTJCLENBQUM7QUFDaEUsSUFBTSx3QkFBd0IsR0FBRyxvQkFBb0IsQ0FBQztBQUN0RCxJQUFNLHNCQUFzQixHQUFHLHNCQUFzQixDQUFDO0FBQ3RELElBQU0sbUNBQW1DLEdBQUcsK0JBQStCLENBQUM7O0FBRTVFLElBQU0sdUJBQXVCLEdBQUcsR0FBRyxDQUFDO0FBQ3BDLElBQU0scUJBQXFCLEdBQUcsR0FBRyxDQUFDOztJQUU1QixhQUFhO0FBZ0JOLFdBaEJQLGFBQWEsQ0FnQkwsV0FBMEIsRUFBRTswQkFoQnBDLGFBQWE7O0FBaUJmLFFBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ25DLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxRQUFRLEdBQUcsbUJBQWEsQ0FBQztBQUM5QixRQUFJLENBQUMsY0FBYyxHQUFHLCtCQUF5QixDQUFDO0FBQ2hELFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ25DLFFBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzFDLFFBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUYsUUFBSSxDQUFDLDhCQUE4QixHQUFHLHVCQUNwQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNyQyxxQkFBcUIsRUFDckIsS0FBSyxDQUNOLENBQUM7QUFDRixRQUFJLENBQUMsbUJBQW1CLENBQUM7QUFDdkIsY0FBUSxFQUFFLEVBQUU7QUFDWixpQkFBVyxFQUFFLEVBQUU7QUFDZixpQkFBVyxFQUFFLEVBQUU7S0FDaEIsQ0FBQyxDQUFDO0dBQ0o7O3dCQXJDRyxhQUFhOztXQXVDRSwrQkFBUztBQUMxQixVQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxNQUFNLENBQ25DLFVBQUEsVUFBVTtlQUFJLFVBQVUsSUFBSSxJQUFJLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUk7T0FBQSxDQUNsRSxDQUNGLENBQUM7O0FBRUYsd0JBQTRDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTs7O1lBQXhELFVBQVU7WUFBRSxlQUFlOztBQUNyQyxZQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDaEMsbUJBQVM7U0FDVjtBQUNELHVCQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDMUIsWUFBSSxDQUFDLGlCQUFpQixVQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDMUMsWUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwRSxpQ0FBVSxhQUFhLENBQUMsQ0FBQztBQUN6QixxQkFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLFlBQUksQ0FBQyx3QkFBd0IsVUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQ2xEOztBQUVELFdBQUssSUFBTSxVQUFVLElBQUksWUFBWSxFQUFFO0FBQ3JDLFlBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUMxQyxtQkFBUztTQUNWO0FBQ0QsWUFBTSxZQUFZLEdBQUssVUFBVSxBQUEyQixDQUFDO0FBQzdELFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztPQUMzQzs7QUFFRCxVQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztLQUNsQzs7O1dBRXdCLHFDQUFTO0FBQ2hDLFVBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsYUFBSSxLQUFLLE1BQUEsa0NBQUksZUFDOUQsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUNyQyxHQUFHLENBQUMsVUFBQSxlQUFlO2VBQUksZUFBZSxDQUFDLG1CQUFtQixFQUFFO09BQUEsQ0FBQyxFQUMvRCxDQUFDO0FBQ0YsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDdkU7OztXQUVxQixnQ0FBQyxVQUE4QixFQUFtQjs7O0FBQ3RFLFVBQU0sZUFBZSxHQUFHLGlDQUFvQixVQUFVLENBQUMsQ0FBQztBQUN4RCxVQUFNLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxtQkFBYSxDQUFDLEdBQUcsQ0FDZixlQUFlLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUNqRixlQUFlLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUNyRixlQUFlLENBQUMsb0JBQW9CLENBQUMsVUFBQSxjQUFjLEVBQUk7QUFDckQsY0FBSyx1QkFBdUIsQ0FBQyxlQUFlLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUMzRCxvQ0FBcUIsQ0FBQztPQUMvQixDQUFDLENBQ0gsQ0FBQztBQUNGLFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3hELFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQzdELFVBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNsQix1QkFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO09BQzVCO0FBQ0QsYUFBTyxlQUFlLENBQUM7S0FDeEI7OztXQUUwQix1Q0FBUztBQUNsQyxVQUFJLENBQUMsbUJBQW1CLEdBQUcsYUFBSSxLQUFLLE1BQUEsa0NBQUksZUFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUNyQyxHQUFHLENBQUMsVUFBQSxlQUFlO2VBQUksZUFBZSxDQUFDLHFCQUFxQixFQUFFO09BQUEsQ0FBQyxFQUNqRSxDQUFDO0FBQ0YsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7S0FDM0U7Ozs2QkFFNEIsV0FDM0IsZUFBZ0MsRUFDaEMsY0FBOEIsRUFDOUIsY0FBdUIsRUFDUjtBQUNmLFVBQUksZUFBZSxLQUFLLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtBQUNuRCw4QkFBTSxxQ0FBcUMsRUFBRTtBQUMzQyx3QkFBYyxPQUFLLGNBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxBQUFFO1NBQ3JELENBQUMsQ0FBQztBQUNILFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLGNBQWMsQ0FBQyxDQUFDOzs7WUFHcEQsUUFBUSxHQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBakMsUUFBUTs7QUFDZixZQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ2hDLGlCQUFPO1NBQ1I7O29CQUMrQyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDOztZQUExRSxpQkFBaUIsU0FBakIsaUJBQWlCO1lBQUUsa0JBQWtCLFNBQWxCLGtCQUFrQjs7QUFDNUMsY0FBTSxJQUFJLENBQUMseUJBQXlCLENBQ2xDLFFBQVEsRUFDUixpQkFBaUIsRUFDakIsa0JBQWtCLENBQ25CLENBQUM7T0FDSDtLQUNGOzs7V0FFVyxzQkFBQyxRQUFvQixFQUFROzs7QUFDdkMsVUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7QUFDN0IsWUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3JDO0FBQ0QsVUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsK0JBQXlCLENBQUM7O0FBRWxGLFVBQU0sTUFBTSxHQUFHLCtCQUFhLFFBQVEsQ0FBQyxDQUFDO1VBQy9CLElBQUksR0FBSSxNQUFNLENBQWQsSUFBSTs7QUFDWCxVQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsMkJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQ3ZDO2lCQUFNLE9BQUssZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFNBQU0sb0NBQXFCO1NBQUEsRUFDaEUsdUJBQXVCLEVBQ3ZCLEtBQUssQ0FDTixDQUFDLENBQUMsQ0FBQztPQUNMO0FBQ0QseUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FDaEQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDM0MsQ0FBQyxDQUFDO0FBQ0gsNEJBQU0scUJBQXFCLEVBQUUsRUFBQyxRQUFRLEVBQVIsUUFBUSxFQUFDLENBQUMsQ0FBQztBQUN6QyxVQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLFNBQU0sb0NBQXFCLENBQUM7S0FDbEU7OztpQkFFQSw0QkFBWSw4QkFBOEIsQ0FBQzs2QkFDdEIsV0FBQyxRQUFvQixFQUFpQjtBQUMxRCxVQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO0FBQy9DLGVBQU87T0FDUjtBQUNELFVBQU0sa0JBQWtCLEdBQUcsTUFBTSxrQ0FBc0IsUUFBUSxDQUFDLENBQUM7VUFFbEQsaUJBQWlCLEdBQzVCLElBQUksQ0FBQyxnQkFBZ0IsQ0FEdkIsV0FBVzs7QUFFYixZQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FDbEMsUUFBUSxFQUNSLGlCQUFpQixFQUNqQixrQkFBa0IsQ0FDbkIsQ0FBQztLQUNIOzs7V0FFeUIsc0NBQVM7QUFDakMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQztLQUN6RDs7O1dBRThCLHlDQUM3QixRQUFxQixFQUNSO0FBQ2IsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxtQ0FBbUMsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN4RTs7O1dBRXFCLGtDQUFZO1VBQ3pCLFFBQVEsR0FBSSxJQUFJLENBQUMsZ0JBQWdCLENBQWpDLFFBQVE7O0FBQ2YsVUFBTSxNQUFNLEdBQUcsK0JBQWEsUUFBUSxDQUFDLENBQUM7QUFDdEMsYUFBTyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDNUI7OztXQUV3QixtQ0FDdkIsUUFBb0IsRUFDcEIsaUJBQXlCLEVBQ3pCLGtCQUEwQixFQUNYOzZCQUNnRCxJQUFJLENBQUMsZ0JBQWdCO1VBQW5FLGNBQWMsb0JBQXhCLFFBQVE7VUFBa0IsV0FBVyxvQkFBWCxXQUFXO1VBQUUsYUFBYSxvQkFBYixhQUFhOztBQUMzRCxVQUFJLFFBQVEsS0FBSyxjQUFjLEVBQUU7QUFDL0IsZUFBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDMUI7QUFDRCxVQUFJLGFBQWEsS0FBSyxXQUFXLElBQUksa0JBQWtCLEtBQUssV0FBVyxFQUFFO0FBQ3ZFLGVBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRTtBQUNyQywyQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLDRCQUFrQixFQUFsQixrQkFBa0I7U0FDbkIsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsVUFBSSxrQkFBa0IsS0FBSyxhQUFhLEVBQUU7O0FBRXhDLGVBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRTtBQUNyQywyQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLDRCQUFrQixFQUFFLFdBQVc7U0FDaEMsQ0FBQyxDQUFDO09BQ0osTUFBTTs7QUFFTCw4REFBa0MsUUFBUSxDQUFDLENBQUM7QUFDNUMsZUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFO0FBQ3JDLDJCQUFpQixFQUFqQixpQkFBaUI7QUFDakIsNEJBQWtCLEVBQWxCLGtCQUFrQjtTQUNuQixDQUFDLENBQUM7T0FDSjtLQUNGOzs7V0FFYSx3QkFBQyxXQUFtQixFQUFROzhCQUN5QixJQUFJLENBQUMsZ0JBQWdCO1VBQS9FLFFBQVEscUJBQVIsUUFBUTtVQUFFLFdBQVcscUJBQVgsV0FBVztVQUFFLGFBQWEscUJBQWIsYUFBYTtVQUFFLGdCQUFnQixxQkFBaEIsZ0JBQWdCOztBQUM3RCxVQUFJLENBQUMsbUJBQW1CLENBQUM7QUFDdkIsZ0JBQVEsRUFBUixRQUFRO0FBQ1IsbUJBQVcsRUFBWCxXQUFXO0FBQ1gsbUJBQVcsRUFBWCxXQUFXO0FBQ1gscUJBQWEsRUFBYixhQUFhO0FBQ2Isd0JBQWdCLEVBQWhCLGdCQUFnQjtPQUNqQixDQUFDLENBQUM7S0FDSjs7O1dBRVUscUJBQUMsUUFBc0IsRUFBUTtBQUN4Qyw0QkFBTSx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2hDLFVBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztBQUNwRCwrQkFBVSxlQUFlLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztBQUN4RSxxQkFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBTSxvQ0FBcUIsQ0FBQztLQUNsRTs7O1dBRWlCLDhCQUFvQjtBQUNwQyxhQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztLQUM5Qjs7OzZCQUUyQixXQUFDLFFBQW9CLEVBQWlCO0FBQ2hFLFVBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixlQUFPO09BQ1I7QUFDRCxVQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdEQsWUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3BEOzs7NkJBRXFCLFdBQUMsUUFBb0IsRUFBRSxXQUF3QixFQUFpQjtVQUUvRCxXQUFXLEdBRTVCLFdBQVcsQ0FGYixpQkFBaUI7VUFDRyxXQUFXLEdBQzdCLFdBQVcsQ0FEYixrQkFBa0I7O0FBRXBCLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQztBQUN2QixnQkFBUSxFQUFSLFFBQVE7QUFDUixtQkFBVyxFQUFYLFdBQVc7QUFDWCxtQkFBVyxFQUFYLFdBQVc7QUFDWCxxQkFBYSxFQUFFLFdBQVc7T0FDM0IsQ0FBQyxDQUFDO0FBQ0gsVUFBTSxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0FBQzdELFVBQUksQ0FBQyxtQkFBbUIsQ0FBQztBQUN2QixnQkFBUSxFQUFSLFFBQVE7QUFDUixtQkFBVyxFQUFYLFdBQVc7QUFDWCxtQkFBVyxFQUFYLFdBQVc7QUFDWCxxQkFBYSxFQUFFLFdBQVc7QUFDMUIsd0JBQWdCLEVBQWhCLGdCQUFnQjtPQUNqQixDQUFDLENBQUM7S0FDSjs7O1dBRWtCLDZCQUFDLEtBQXNCLEVBQVE7QUFDaEQsVUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztBQUM5QixVQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztLQUN2Qzs7O1dBRW9CLGlDQUFTO0FBQzVCLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQ3JFOzs7aUJBRUEsNEJBQVksMkJBQTJCLENBQUM7NkJBQ3ZCLFdBQUMsUUFBb0IsRUFBd0I7Ozs7QUFJN0QsVUFBTSxVQUFVLEdBQUcsb0NBQWtCLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLFVBQUksVUFBVSxJQUFJLElBQUksSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxFQUFFO0FBQ3ZELFlBQU0sSUFBSSxHQUFHLFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLEdBQUcsZUFBZSxDQUFDO0FBQ2pFLGNBQU0sSUFBSSxLQUFLLG1FQUFvRSxJQUFJLE9BQUssQ0FBQztPQUM5Rjs7QUFFRCxVQUFNLFlBQWdDLEdBQUksVUFBVSxBQUFNLENBQUM7QUFDM0QsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNqRSwrQkFBVSxlQUFlLENBQUMsQ0FBQzs7a0JBQ1YsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQ2pDLGVBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQ3JDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxlQUFlLENBQUMsQ0FDaEQsQ0FBQzs7OztVQUhLLE1BQU07O0FBSWIsYUFBTyxNQUFNLENBQUM7S0FDZjs7OzZCQUU4QixXQUFDLGVBQWdDLEVBQWlCO0FBQy9FLFVBQUksSUFBSSxDQUFDLHNCQUFzQixLQUFLLGVBQWUsRUFBRTtBQUNuRCxlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsc0JBQXNCLEdBQUcsZUFBZSxDQUFDO0FBQzlDLFVBQU0sY0FBYyxHQUFHLE1BQU0sZUFBZSxDQUFDLDhCQUE4QixFQUFFLENBQUM7QUFDOUUsVUFBSSxDQUFDLHVCQUF1QixDQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDdEU7OztpQkFHQSw0QkFBWSxxQkFBcUIsQ0FBQzs2QkFDZixhQUFrQjtVQUM3QixRQUFRLEdBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFqQyxRQUFROztBQUNmLDRCQUFNLHFCQUFxQixFQUFFLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBQyxDQUFDLENBQUM7QUFDekMsVUFBSTtBQUNGLFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ3RFLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxnREFBb0IsS0FBSyxDQUFDLENBQUM7T0FDNUI7S0FDRjs7OzZCQUVjLFdBQUMsUUFBb0IsRUFBbUI7QUFDckQsVUFBTSxNQUFNLEdBQUcsK0JBQWEsUUFBUSxDQUFDLENBQUM7QUFDdEMsVUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ2xCLGNBQU0sSUFBSSxLQUFLLDJDQUEwQyxRQUFRLE9BQUssQ0FBQztPQUN4RTtBQUNELFVBQUk7QUFDRixjQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNwQixlQUFPLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN6QixDQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ1osY0FBTSxJQUFJLEtBQUssbUNBQWtDLFFBQVEsWUFBUSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUcsQ0FBQztPQUNwRjtLQUNGOzs7V0FFcUIsZ0NBQ3BCLFFBQTRFLEVBQy9EO0FBQ2IsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUM5RDs7O1dBRXVCLGtDQUN0QixRQUE4RSxFQUNqRTtBQUNiLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsMkJBQTJCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDaEU7OztXQUVnQiwyQkFBQyxRQUEwQyxFQUFlO0FBQ3pFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDM0Q7OztXQUVrQiw2QkFBQyxRQUEwQyxFQUFlO0FBQzNFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsd0JBQXdCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDN0Q7OztpQkFFQSw0QkFBWSwwQkFBMEIsQ0FBQzs2QkFDWixhQUEyQjtVQUM5QyxRQUFRLEdBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFqQyxRQUFROztBQUNmLFVBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQzdDLFVBQUEsUUFBUTtlQUFJLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7T0FBQSxDQUNqRCxDQUFDO0FBQ0YsVUFBTSxnQkFBZ0IsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQzs7QUFFOUQsVUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFDM0QsYUFBTyxZQUFZLENBQUM7S0FDckI7OztXQUVrQiwrQkFBMkM7QUFDNUQsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7S0FDL0I7OztXQUVvQixpQ0FBMkM7QUFDOUQsYUFBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7S0FDakM7Ozs2QkFFNEIsYUFBNkI7QUFDeEQsVUFBSSxJQUFJLENBQUMsc0JBQXNCLElBQUksSUFBSSxFQUFFO0FBQ3ZDLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxhQUFPLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLDhCQUE4QixFQUFFLENBQUM7S0FDM0U7OztXQUVPLG9CQUFTO0FBQ2YsVUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdEIsV0FBSyxJQUFNLGVBQWUsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDN0QsdUJBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztPQUM1QjtLQUNGOzs7V0FFUyxzQkFBUztBQUNqQixVQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztBQUN2QixVQUFJLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxJQUFJLEVBQUU7QUFDdkMsWUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3pDLFlBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7T0FDcEM7QUFDRCxVQUFJLENBQUMsbUJBQW1CLENBQUM7QUFDdkIsZ0JBQVEsRUFBRSxFQUFFO0FBQ1osbUJBQVcsRUFBRSxFQUFFO0FBQ2YsbUJBQVcsRUFBRSxFQUFFO09BQ2hCLENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsV0FBSyxJQUFNLGVBQWUsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDN0QsdUJBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUMzQjtBQUNELFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMvQixXQUFLLElBQU0sWUFBWSxJQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUNqRSxvQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3hCO0FBQ0QsVUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMvQixVQUFJLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLEVBQUU7QUFDckMsWUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BDLFlBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7T0FDbEM7S0FDRjs7O1NBNVpHLGFBQWE7OztBQStabkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdNb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlU3RhdGUsIFJldmlzaW9uc1N0YXRlLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsIEhnRGlmZlN0YXRlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7cmVwb3NpdG9yeUZvclBhdGh9IGZyb20gJy4uLy4uL2hnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1Db250ZW50c30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2FycmF5LCBtYXAsIGRlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBSZXBvc2l0b3J5U3RhY2sgZnJvbSAnLi9SZXBvc2l0b3J5U3RhY2snO1xuaW1wb3J0IHtcbiAgbm90aWZ5SW50ZXJuYWxFcnJvcixcbiAgbm90aWZ5RmlsZXN5c3RlbU92ZXJyaWRlVXNlckVkaXRzLFxufSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IHtidWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5cbmNvbnN0IENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQgPSAnZGlkLWNoYW5nZS1kaXJ0eS1zdGF0dXMnO1xuY29uc3QgQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5UID0gJ2RpZC1jaGFuZ2UtY29tcGFyZS1zdGF0dXMnO1xuY29uc3QgQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5UID0gJ2FjdGl2ZS1maWxlLXVwZGF0ZSc7XG5jb25zdCBDSEFOR0VfUkVWSVNJT05TX0VWRU5UID0gJ2RpZC1jaGFuZ2UtcmV2aXNpb25zJztcbmNvbnN0IEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5UID0gJ2FjdGl2ZS1idWZmZXItY2hhbmdlLW1vZGlmaWVkJztcblxuY29uc3QgRklMRV9DSEFOR0VfREVCT1VOQ0VfTVMgPSAyMDA7XG5jb25zdCBVSV9DSEFOR0VfREVCT1VOQ0VfTVMgPSAxMDA7XG5cbmNsYXNzIERpZmZWaWV3TW9kZWwge1xuXG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGl2ZVN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYWN0aXZlRmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGU7XG4gIF9hY3RpdmVSZXBvc2l0b3J5U3RhY2s6ID9SZXBvc2l0b3J5U3RhY2s7XG4gIF9uZXdFZGl0b3I6ID9UZXh0RWRpdG9yO1xuICBfZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9jb21wYXJlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfdWlQcm92aWRlcnM6IEFycmF5PE9iamVjdD47XG4gIF9yZXBvc2l0b3J5U3RhY2tzOiBNYXA8SGdSZXBvc2l0b3J5Q2xpZW50LCBSZXBvc2l0b3J5U3RhY2s+O1xuICBfcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnM6IE1hcDxIZ1JlcG9zaXRvcnlDbGllbnQsIENvbXBvc2l0ZURpc3Bvc2FibGU+O1xuICBfaXNBY3RpdmU6IGJvb2xlYW47XG4gIF9kZWJvdW5jZWRFbWl0QWN0aXZlRmlsZVVwZGF0ZTogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3Rvcih1aVByb3ZpZGVyczogQXJyYXk8T2JqZWN0Pikge1xuICAgIHRoaXMuX3VpUHJvdmlkZXJzID0gdWlQcm92aWRlcnM7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcygpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcy5iaW5kKHRoaXMpKSk7XG4gICAgdGhpcy5fZGVib3VuY2VkRW1pdEFjdGl2ZUZpbGVVcGRhdGUgPSBkZWJvdW5jZShcbiAgICAgIHRoaXMuX2VtaXRBY3RpdmVGaWxlVXBkYXRlLmJpbmQodGhpcyksXG4gICAgICBVSV9DSEFOR0VfREVCT1VOQ0VfTVMsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZSh7XG4gICAgICBmaWxlUGF0aDogJycsXG4gICAgICBvbGRDb250ZW50czogJycsXG4gICAgICBuZXdDb250ZW50czogJycsXG4gICAgfSk7XG4gIH1cblxuICBfdXBkYXRlUmVwb3NpdG9yaWVzKCk6IHZvaWQge1xuICAgIGNvbnN0IHJlcG9zaXRvcmllcyA9IG5ldyBTZXQoXG4gICAgICBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKCkuZmlsdGVyKFxuICAgICAgICByZXBvc2l0b3J5ID0+IHJlcG9zaXRvcnkgIT0gbnVsbCAmJiByZXBvc2l0b3J5LmdldFR5cGUoKSA9PT0gJ2hnJ1xuICAgICAgKVxuICAgICk7XG4gICAgLy8gRGlzcG9zZSByZW1vdmVkIHByb2plY3RzIHJlcG9zaXRvcmllcy5cbiAgICBmb3IgKGNvbnN0IFtyZXBvc2l0b3J5LCByZXBvc2l0b3J5U3RhY2tdIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MpIHtcbiAgICAgIGlmIChyZXBvc2l0b3JpZXMuaGFzKHJlcG9zaXRvcnkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgcmVwb3NpdG9yeVN0YWNrLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmdldChyZXBvc2l0b3J5KTtcbiAgICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgcmVwb3NpdG9yeSBvZiByZXBvc2l0b3JpZXMpIHtcbiAgICAgIGlmICh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmhhcyhyZXBvc2l0b3J5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9ICgocmVwb3NpdG9yeTogYW55KTogSGdSZXBvc2l0b3J5Q2xpZW50KTtcbiAgICAgIHRoaXMuX2NyZWF0ZVJlcG9zaXRvcnlTdGFjayhoZ1JlcG9zaXRvcnkpO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cygpO1xuICB9XG5cbiAgX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldERpcnR5RmlsZUNoYW5nZXMoKSlcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5ULCB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIF9jcmVhdGVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50KTogUmVwb3NpdG9yeVN0YWNrIHtcbiAgICBjb25zdCByZXBvc2l0b3J5U3RhY2sgPSBuZXcgUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnkpO1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlRGlydHlTdGF0dXModGhpcy5fdXBkYXRlRGlydHlDaGFuZ2VkU3RhdHVzLmJpbmQodGhpcykpLFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyh0aGlzLl91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cy5iaW5kKHRoaXMpKSxcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZENoYW5nZVJldmlzaW9ucyhyZXZpc2lvbnNTdGF0ZSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMocmVwb3NpdG9yeVN0YWNrLCByZXZpc2lvbnNTdGF0ZSwgdHJ1ZSlcbiAgICAgICAgICAuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gICAgICB9KSxcbiAgICApO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3Muc2V0KHJlcG9zaXRvcnksIHJlcG9zaXRvcnlTdGFjayk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuc2V0KHJlcG9zaXRvcnksIHN1YnNjcmlwdGlvbnMpO1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmFjdGl2YXRlKCk7XG4gICAgfVxuICAgIHJldHVybiByZXBvc2l0b3J5U3RhY2s7XG4gIH1cblxuICBfdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMoKTogdm9pZCB7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldENvbXBhcmVGaWxlQ2hhbmdlcygpKVxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVDaGFuZ2VkUmV2aXNpb25zKFxuICAgIHJlcG9zaXRvcnlTdGFjazogUmVwb3NpdG9yeVN0YWNrLFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgICByZWxvYWRGaWxlRGlmZjogYm9vbGVhbixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHJlcG9zaXRvcnlTdGFjayA9PT0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrKSB7XG4gICAgICB0cmFjaygnZGlmZi12aWV3LXVwZGF0ZS10aW1lbGluZS1yZXZpc2lvbnMnLCB7XG4gICAgICAgIHJldmlzaW9uc0NvdW50OiBgJHtyZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMubGVuZ3RofWAsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgYWN0aXZlIGZpbGUsIGlmIGNoYW5nZWQuXG4gICAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgICAgaWYgKCFmaWxlUGF0aCB8fCAhcmVsb2FkRmlsZURpZmYpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3Qge2NvbW1pdHRlZENvbnRlbnRzLCBmaWxlc3lzdGVtQ29udGVudHN9ID0gYXdhaXQgdGhpcy5fZmV0Y2hIZ0RpZmYoZmlsZVBhdGgpO1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWN0aXZhdGVGaWxlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBjb25zdCBhY3RpdmVTdWJzY3JpcHRpb25zID0gdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgLy8gVE9ETyhtb3N0KTogU2hvdyBwcm9ncmVzcyBpbmRpY2F0b3I6IHQ4OTkxNjc2XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICBjb25zdCB7ZmlsZX0gPSBidWZmZXI7XG4gICAgaWYgKGZpbGUgIT0gbnVsbCkge1xuICAgICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoZmlsZS5vbkRpZENoYW5nZShkZWJvdW5jZShcbiAgICAgICAgKCkgPT4gdGhpcy5fb25EaWRGaWxlQ2hhbmdlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKSxcbiAgICAgICAgRklMRV9DSEFOR0VfREVCT1VOQ0VfTVMsXG4gICAgICAgIGZhbHNlLFxuICAgICAgKSkpO1xuICAgIH1cbiAgICBhY3RpdmVTdWJzY3JpcHRpb25zLmFkZChidWZmZXIub25EaWRDaGFuZ2VNb2RpZmllZChcbiAgICAgIHRoaXMuX29uRGlkQnVmZmVyQ2hhbmdlTW9kaWZpZWQuYmluZCh0aGlzKSxcbiAgICApKTtcbiAgICB0cmFjaygnZGlmZi12aWV3LW9wZW4tZmlsZScsIHtmaWxlUGF0aH0pO1xuICAgIHRoaXMuX3VwZGF0ZUFjdGl2ZURpZmZTdGF0ZShmaWxlUGF0aCkuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5maWxlLWNoYW5nZS11cGRhdGUnKVxuICBhc3luYyBfb25EaWRGaWxlQ2hhbmdlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZS5maWxlUGF0aCAhPT0gZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmlsZXN5c3RlbUNvbnRlbnRzID0gYXdhaXQgZ2V0RmlsZVN5c3RlbUNvbnRlbnRzKGZpbGVQYXRoKTtcbiAgICBjb25zdCB7XG4gICAgICBvbGRDb250ZW50czogY29tbWl0dGVkQ29udGVudHMsXG4gICAgfSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICk7XG4gIH1cblxuICBfb25EaWRCdWZmZXJDaGFuZ2VNb2RpZmllZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQUNUSVZFX0JVRkZFUl9DSEFOR0VfTU9ESUZJRURfRVZFTlQpO1xuICB9XG5cbiAgb25EaWRBY3RpdmVCdWZmZXJDaGFuZ2VNb2RpZmllZChcbiAgICBjYWxsYmFjazogKCkgPT4gbWl4ZWQsXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihBQ1RJVkVfQlVGRkVSX0NIQU5HRV9NT0RJRklFRF9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgaXNBY3RpdmVCdWZmZXJNb2RpZmllZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGNvbnN0IGJ1ZmZlciA9IGJ1ZmZlckZvclVyaShmaWxlUGF0aCk7XG4gICAgcmV0dXJuIGJ1ZmZlci5pc01vZGlmaWVkKCk7XG4gIH1cblxuICBfdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbW1pdHRlZENvbnRlbnRzOiBzdHJpbmcsXG4gICAgZmlsZXN5c3RlbUNvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aDogYWN0aXZlRmlsZVBhdGgsIG5ld0NvbnRlbnRzLCBzYXZlZENvbnRlbnRzfSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBpZiAoZmlsZVBhdGggIT09IGFjdGl2ZUZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIGlmIChzYXZlZENvbnRlbnRzID09PSBuZXdDb250ZW50cyB8fCBmaWxlc3lzdGVtQ29udGVudHMgPT09IG5ld0NvbnRlbnRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKGZpbGVQYXRoLCB7XG4gICAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gVGhlIHVzZXIgaGF2ZSBlZGl0ZWQgc2luY2UgdGhlIGxhc3QgdXBkYXRlLlxuICAgIGlmIChmaWxlc3lzdGVtQ29udGVudHMgPT09IHNhdmVkQ29udGVudHMpIHtcbiAgICAgIC8vIFRoZSBjaGFuZ2VzIGhhdmVuJ3QgdG91Y2hlZCB0aGUgZmlsZXN5c3RlbSwga2VlcCB1c2VyIGVkaXRzLlxuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShmaWxlUGF0aCwge1xuICAgICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzOiBuZXdDb250ZW50cyxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgY29tbWl0dGVkIGFuZCBmaWxlc3lzdGVtIHN0YXRlIGhhdmUgY2hhbmdlZCwgbm90aWZ5IG9mIG92ZXJyaWRlLlxuICAgICAgbm90aWZ5RmlsZXN5c3RlbU92ZXJyaWRlVXNlckVkaXRzKGZpbGVQYXRoKTtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGgsIHtcbiAgICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNldE5ld0NvbnRlbnRzKG5ld0NvbnRlbnRzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB7ZmlsZVBhdGgsIG9sZENvbnRlbnRzLCBzYXZlZENvbnRlbnRzLCBpbmxpbmVDb21wb25lbnRzfSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoe1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRDb250ZW50cyxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgIGlubGluZUNvbXBvbmVudHMsXG4gICAgfSk7XG4gIH1cblxuICBzZXRSZXZpc2lvbihyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogdm9pZCB7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1zZXQtcmV2aXNpb24nKTtcbiAgICBjb25zdCByZXBvc2l0b3J5U3RhY2sgPSB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2s7XG4gICAgaW52YXJpYW50KHJlcG9zaXRvcnlTdGFjaywgJ1RoZXJlIG11c3QgYmUgYW4gYWN0aXZlIHJlcG9zaXRvcnkgc3RhY2shJyk7XG4gICAgcmVwb3NpdG9yeVN0YWNrLnNldFJldmlzaW9uKHJldmlzaW9uKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIGdldEFjdGl2ZUZpbGVTdGF0ZSgpOiBGaWxlQ2hhbmdlU3RhdGUge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQWN0aXZlRGlmZlN0YXRlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBoZ0RpZmZTdGF0ZSA9IGF3YWl0IHRoaXMuX2ZldGNoSGdEaWZmKGZpbGVQYXRoKTtcbiAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGgsIGhnRGlmZlN0YXRlKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGg6IE51Y2xpZGVVcmksIGhnRGlmZlN0YXRlOiBIZ0RpZmZTdGF0ZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzOiBvbGRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50czogbmV3Q29udGVudHMsXG4gICAgfSA9IGhnRGlmZlN0YXRlO1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZSh7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZENvbnRlbnRzLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzOiBuZXdDb250ZW50cyxcbiAgICB9KTtcbiAgICBjb25zdCBpbmxpbmVDb21wb25lbnRzID0gYXdhaXQgdGhpcy5fZmV0Y2hJbmxpbmVDb21wb25lbnRzKCk7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHtcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgb2xkQ29udGVudHMsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHM6IG5ld0NvbnRlbnRzLFxuICAgICAgaW5saW5lQ29tcG9uZW50cyxcbiAgICB9KTtcbiAgfVxuXG4gIF9zZXRBY3RpdmVGaWxlU3RhdGUoc3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuX2RlYm91bmNlZEVtaXRBY3RpdmVGaWxlVXBkYXRlKCk7XG4gIH1cblxuICBfZW1pdEFjdGl2ZUZpbGVVcGRhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KEFDVElWRV9GSUxFX1VQREFURV9FVkVOVCwgdGhpcy5fYWN0aXZlRmlsZVN0YXRlKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmhnLXN0YXRlLXVwZGF0ZScpXG4gIGFzeW5jIF9mZXRjaEhnRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8SGdEaWZmU3RhdGU+IHtcbiAgICAvLyBDYWxsaW5nIGF0b20ucHJvamVjdC5yZXBvc2l0b3J5Rm9yRGlyZWN0b3J5IGdldHMgdGhlIHJlYWwgcGF0aCBvZiB0aGUgZGlyZWN0b3J5LFxuICAgIC8vIHdoaWNoIGlzIGFub3RoZXIgcm91bmQtdHJpcCBhbmQgY2FsbHMgdGhlIHJlcG9zaXRvcnkgcHJvdmlkZXJzIHRvIGdldCBhbiBleGlzdGluZyByZXBvc2l0b3J5LlxuICAgIC8vIEluc3RlYWQsIHRoZSBmaXJzdCBtYXRjaCBvZiB0aGUgZmlsdGVyaW5nIGhlcmUgaXMgdGhlIG9ubHkgcG9zc2libGUgbWF0Y2guXG4gICAgY29uc3QgcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnlGb3JQYXRoKGZpbGVQYXRoKTtcbiAgICBpZiAocmVwb3NpdG9yeSA9PSBudWxsIHx8IHJlcG9zaXRvcnkuZ2V0VHlwZSgpICE9PSAnaGcnKSB7XG4gICAgICBjb25zdCB0eXBlID0gcmVwb3NpdG9yeSA/IHJlcG9zaXRvcnkuZ2V0VHlwZSgpIDogJ25vIHJlcG9zaXRvcnknO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaWZmIHZpZXcgb25seSBzdXBwb3J0cyBcXGBNZXJjdXJpYWxcXGAgcmVwb3NpdG9yaWVzLCBidXQgZm91bmQgXFxgJHt0eXBlfVxcYGApO1xuICAgIH1cblxuICAgIGNvbnN0IGhnUmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50ID0gKHJlcG9zaXRvcnk6IGFueSk7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5nZXQoaGdSZXBvc2l0b3J5KTtcbiAgICBpbnZhcmlhbnQocmVwb3NpdG9yeVN0YWNrKTtcbiAgICBjb25zdCBbaGdEaWZmXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5mZXRjaEhnRGlmZihmaWxlUGF0aCksXG4gICAgICB0aGlzLl9zZXRBY3RpdmVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeVN0YWNrKSxcbiAgICBdKTtcbiAgICByZXR1cm4gaGdEaWZmO1xuICB9XG5cbiAgYXN5bmMgX3NldEFjdGl2ZVJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5U3RhY2s6IFJlcG9zaXRvcnlTdGFjayk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPT09IHJlcG9zaXRvcnlTdGFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPSByZXBvc2l0b3J5U3RhY2s7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCByZXBvc2l0b3J5U3RhY2suZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgdGhpcy5fdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhyZXBvc2l0b3J5U3RhY2ssIHJldmlzaW9uc1N0YXRlLCBmYWxzZSk7XG4gIH1cblxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnNhdmUtZmlsZScpXG4gIGFzeW5jIHNhdmVBY3RpdmVGaWxlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1zYXZlLWZpbGUnLCB7ZmlsZVBhdGh9KTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fYWN0aXZlRmlsZVN0YXRlLnNhdmVkQ29udGVudHMgPSBhd2FpdCB0aGlzLl9zYXZlRmlsZShmaWxlUGF0aCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9zYXZlRmlsZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICBpZiAoYnVmZmVyID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgZmlsZSBidWZmZXIgdG8gc2F2ZTogXFxgJHtmaWxlUGF0aH1cXGBgKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGJ1ZmZlci5zYXZlKCk7XG4gICAgICByZXR1cm4gYnVmZmVyLmdldFRleHQoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHNhdmUgZmlsZSBidWZmZXI6IFxcYCR7ZmlsZVBhdGh9XFxgIC0gJHtlcnIudG9TdHJpbmcoKX1gKTtcbiAgICB9XG4gIH1cblxuICBvbkRpZENoYW5nZURpcnR5U3RhdHVzKFxuICAgIGNhbGxiYWNrOiAoZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGNvbXBhcmVGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25SZXZpc2lvbnNVcGRhdGUoY2FsbGJhY2s6IChzdGF0ZTogP1JldmlzaW9uc1N0YXRlKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uQWN0aXZlRmlsZVVwZGF0ZXMoY2FsbGJhY2s6IChzdGF0ZTogRmlsZUNoYW5nZVN0YXRlKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKEFDVElWRV9GSUxFX1VQREFURV9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtY29tbWVudHMnKVxuICBhc3luYyBfZmV0Y2hJbmxpbmVDb21wb25lbnRzKCk6IFByb21pc2U8QXJyYXk8T2JqZWN0Pj4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgY29uc3QgdWlFbGVtZW50UHJvbWlzZXMgPSB0aGlzLl91aVByb3ZpZGVycy5tYXAoXG4gICAgICBwcm92aWRlciA9PiBwcm92aWRlci5jb21wb3NlVWlFbGVtZW50cyhmaWxlUGF0aClcbiAgICApO1xuICAgIGNvbnN0IHVpQ29tcG9uZW50TGlzdHMgPSBhd2FpdCBQcm9taXNlLmFsbCh1aUVsZW1lbnRQcm9taXNlcyk7XG4gICAgLy8gRmxhdHRlbiB1aUNvbXBvbmVudExpc3RzIGZyb20gbGlzdCBvZiBsaXN0cyBvZiBjb21wb25lbnRzIHRvIGEgbGlzdCBvZiBjb21wb25lbnRzLlxuICAgIGNvbnN0IHVpQ29tcG9uZW50cyA9IFtdLmNvbmNhdC5hcHBseShbXSwgdWlDb21wb25lbnRMaXN0cyk7XG4gICAgcmV0dXJuIHVpQ29tcG9uZW50cztcbiAgfVxuXG4gIGdldERpcnR5RmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgZ2V0Q29tcGFyZUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgYXN5bmMgZ2V0QWN0aXZlUmV2aXNpb25zU3RhdGUoKTogUHJvbWlzZTw/UmV2aXNpb25zU3RhdGU+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICB9XG5cbiAgYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgcmVwb3NpdG9yeVN0YWNrIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpIHtcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5hY3RpdmF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5kZWFjdGl2YXRlKCk7XG4gICAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoe1xuICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgb2xkQ29udGVudHM6ICcnLFxuICAgICAgbmV3Q29udGVudHM6ICcnLFxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnlTdGFjayBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmNsZWFyKCk7XG4gICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2YgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmNsZWFyKCk7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIGlmICh0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlZpZXdNb2RlbDtcbiJdfQ==