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

var _client = require('../../client');

var _commons = require('../../commons');

var _RepositoryStack = require('./RepositoryStack');

var _RepositoryStack2 = _interopRequireDefault(_RepositoryStack);

var _notifications = require('./notifications');

var CHANGE_DIRTY_STATUS_EVENT = 'did-change-dirty-status';
var CHANGE_COMPARE_STATUS_EVENT = 'did-change-compare-status';
var ACTIVE_FILE_UPDATE_EVENT = 'active-file-update';
var CHANGE_REVISIONS_EVENT = 'did-change-revisions';
var FILE_CHANGE_DEBOUNCE_MS = 100;

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
        _this._updateChangedRevisions(repositoryStack, revisionsState)['catch'](_notifications.notifyInternalError);
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
    value: _asyncToGenerator(function* (repositoryStack, revisionsState) {
      if (repositoryStack === this._activeRepositoryStack) {
        (0, _analytics.track)('diff-view-update-timeline-revisions', {
          revisionsCount: '' + revisionsState.revisions.length
        });
        this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);

        // Update the active file, if changed.
        var filePath = this._activeFileState.filePath;

        if (!filePath) {
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
      this._setActiveFileState({
        filePath: '',
        oldContents: '',
        newContents: ''
      });
      var file = (0, _client.getFileForPath)(filePath);
      if (file) {
        activeSubscriptions.add(file.onDidChange((0, _commons.debounce)(function () {
          return _this2._onDidFileChange(filePath)['catch'](_notifications.notifyInternalError);
        }, FILE_CHANGE_DEBOUNCE_MS, false)));
      }
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
    key: '_updateDiffStateIfChanged',
    value: function _updateDiffStateIfChanged(filePath, committedContents, filesystemContents) {
      var _activeFileState = this._activeFileState;
      var activeFilePath = _activeFileState.filePath;
      var newContents = _activeFileState.newContents;
      var savedContents = _activeFileState.savedContents;

      if (filePath !== activeFilePath) {
        return Promise.resolve();
      }
      if (savedContents === newContents) {
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
      this._emitter.emit(ACTIVE_FILE_UPDATE_EVENT, state);
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
      this._updateChangedRevisions(repositoryStack, revisionsState);
    })
  }, {
    key: 'saveActiveFile',
    decorators: [(0, _analytics.trackTiming)('diff-view.save-file')],
    value: _asyncToGenerator(function* () {
      var _activeFileState3 = this._activeFileState;
      var filePath = _activeFileState3.filePath;
      var newContents = _activeFileState3.newContents;

      (0, _analytics.track)('diff-view-save-file', { filePath: filePath });
      try {
        yield this._saveFile(filePath, newContents);
        this._activeFileState.savedContents = newContents;
      } catch (error) {
        (0, _notifications.notifyInternalError)(error);
      }
    })
  }, {
    key: '_saveFile',
    value: _asyncToGenerator(function* (filePath, newContents) {
      var _require = require('../../remote-uri');

      var getPath = _require.getPath;

      try {
        // We don't use files, because `getFileForPath` returns the same remote file
        // instance everytime, which could have an invalid filesystem contents cache.
        yield (0, _client.getFileSystemServiceByNuclideUri)(filePath).writeFile(getPath(filePath), newContents);
      } catch (err) {
        throw new Error('could not save file: `' + filePath + '` - ' + err.toString());
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
//# sourceMappingURL=data:application/json;base64,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Vmlld01vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0ZSwgUmV2aXNpb25zU3RhdGUsIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSwgSGdEaWZmU3RhdGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vaGctZ2l0LWJyaWRnZSc7XG5pbXBvcnQge3RyYWNrLCB0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7Z2V0RmlsZVN5c3RlbUNvbnRlbnRzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7Z2V0RmlsZUZvclBhdGgsIGdldEZpbGVTeXN0ZW1TZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9jbGllbnQnO1xuaW1wb3J0IHthcnJheSwgbWFwLCBkZWJvdW5jZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgUmVwb3NpdG9yeVN0YWNrIGZyb20gJy4vUmVwb3NpdG9yeVN0YWNrJztcbmltcG9ydCB7XG4gIG5vdGlmeUludGVybmFsRXJyb3IsXG4gIG5vdGlmeUZpbGVzeXN0ZW1PdmVycmlkZVVzZXJFZGl0cyxcbn0gZnJvbSAnLi9ub3RpZmljYXRpb25zJztcblxuY29uc3QgQ0hBTkdFX0RJUlRZX1NUQVRVU19FVkVOVCA9ICdkaWQtY2hhbmdlLWRpcnR5LXN0YXR1cyc7XG5jb25zdCBDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQgPSAnZGlkLWNoYW5nZS1jb21wYXJlLXN0YXR1cyc7XG5jb25zdCBBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQgPSAnYWN0aXZlLWZpbGUtdXBkYXRlJztcbmNvbnN0IENIQU5HRV9SRVZJU0lPTlNfRVZFTlQgPSAnZGlkLWNoYW5nZS1yZXZpc2lvbnMnO1xuY29uc3QgRklMRV9DSEFOR0VfREVCT1VOQ0VfTVMgPSAxMDA7XG5cbmNsYXNzIERpZmZWaWV3TW9kZWwge1xuXG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGl2ZVN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYWN0aXZlRmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGU7XG4gIF9hY3RpdmVSZXBvc2l0b3J5U3RhY2s6ID9SZXBvc2l0b3J5U3RhY2s7XG4gIF9uZXdFZGl0b3I6ID9UZXh0RWRpdG9yO1xuICBfZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9jb21wYXJlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfdWlQcm92aWRlcnM6IEFycmF5PE9iamVjdD47XG4gIF9yZXBvc2l0b3J5U3RhY2tzOiBNYXA8SGdSZXBvc2l0b3J5Q2xpZW50LCBSZXBvc2l0b3J5U3RhY2s+O1xuICBfcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnM6IE1hcDxIZ1JlcG9zaXRvcnlDbGllbnQsIENvbXBvc2l0ZURpc3Bvc2FibGU+O1xuICBfaXNBY3RpdmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IodWlQcm92aWRlcnM6IEFycmF5PE9iamVjdD4pIHtcbiAgICB0aGlzLl91aVByb3ZpZGVycyA9IHVpUHJvdmlkZXJzO1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl91cGRhdGVSZXBvc2l0b3JpZXMoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyh0aGlzLl91cGRhdGVSZXBvc2l0b3JpZXMuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZSh7XG4gICAgICBmaWxlUGF0aDogJycsXG4gICAgICBvbGRDb250ZW50czogJycsXG4gICAgICBuZXdDb250ZW50czogJycsXG4gICAgfSk7XG4gIH1cblxuICBfdXBkYXRlUmVwb3NpdG9yaWVzKCk6IHZvaWQge1xuICAgIGNvbnN0IHJlcG9zaXRvcmllcyA9IG5ldyBTZXQoXG4gICAgICBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKCkuZmlsdGVyKFxuICAgICAgICByZXBvc2l0b3J5ID0+IHJlcG9zaXRvcnkgIT0gbnVsbCAmJiByZXBvc2l0b3J5LmdldFR5cGUoKSA9PT0gJ2hnJ1xuICAgICAgKVxuICAgICk7XG4gICAgLy8gRGlzcG9zZSByZW1vdmVkIHByb2plY3RzIHJlcG9zaXRvcmllcy5cbiAgICBmb3IgKGNvbnN0IFtyZXBvc2l0b3J5LCByZXBvc2l0b3J5U3RhY2tdIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MpIHtcbiAgICAgIGlmIChyZXBvc2l0b3JpZXMuaGFzKHJlcG9zaXRvcnkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgcmVwb3NpdG9yeVN0YWNrLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmdldChyZXBvc2l0b3J5KTtcbiAgICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgcmVwb3NpdG9yeSBvZiByZXBvc2l0b3JpZXMpIHtcbiAgICAgIGlmICh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmhhcyhyZXBvc2l0b3J5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9ICgocmVwb3NpdG9yeTogYW55KTogSGdSZXBvc2l0b3J5Q2xpZW50KTtcbiAgICAgIHRoaXMuX2NyZWF0ZVJlcG9zaXRvcnlTdGFjayhoZ1JlcG9zaXRvcnkpO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cygpO1xuICB9XG5cbiAgX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldERpcnR5RmlsZUNoYW5nZXMoKSlcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5ULCB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIF9jcmVhdGVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50KTogUmVwb3NpdG9yeVN0YWNrIHtcbiAgICBjb25zdCByZXBvc2l0b3J5U3RhY2sgPSBuZXcgUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnkpO1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlRGlydHlTdGF0dXModGhpcy5fdXBkYXRlRGlydHlDaGFuZ2VkU3RhdHVzLmJpbmQodGhpcykpLFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyh0aGlzLl91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cy5iaW5kKHRoaXMpKSxcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZENoYW5nZVJldmlzaW9ucyhyZXZpc2lvbnNTdGF0ZSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMocmVwb3NpdG9yeVN0YWNrLCByZXZpc2lvbnNTdGF0ZSlcbiAgICAgICAgICAuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gICAgICB9KSxcbiAgICApO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3Muc2V0KHJlcG9zaXRvcnksIHJlcG9zaXRvcnlTdGFjayk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuc2V0KHJlcG9zaXRvcnksIHN1YnNjcmlwdGlvbnMpO1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmFjdGl2YXRlKCk7XG4gICAgfVxuICAgIHJldHVybiByZXBvc2l0b3J5U3RhY2s7XG4gIH1cblxuICBfdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMoKTogdm9pZCB7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldENvbXBhcmVGaWxlQ2hhbmdlcygpKVxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVDaGFuZ2VkUmV2aXNpb25zKFxuICAgIHJlcG9zaXRvcnlTdGFjazogUmVwb3NpdG9yeVN0YWNrLFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHJlcG9zaXRvcnlTdGFjayA9PT0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrKSB7XG4gICAgICB0cmFjaygnZGlmZi12aWV3LXVwZGF0ZS10aW1lbGluZS1yZXZpc2lvbnMnLCB7XG4gICAgICAgIHJldmlzaW9uc0NvdW50OiBgJHtyZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMubGVuZ3RofWAsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgYWN0aXZlIGZpbGUsIGlmIGNoYW5nZWQuXG4gICAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB7Y29tbWl0dGVkQ29udGVudHMsIGZpbGVzeXN0ZW1Db250ZW50c30gPSBhd2FpdCB0aGlzLl9mZXRjaEhnRGlmZihmaWxlUGF0aCk7XG4gICAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhY3RpdmF0ZUZpbGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGNvbnN0IGFjdGl2ZVN1YnNjcmlwdGlvbnMgPSB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoe1xuICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgb2xkQ29udGVudHM6ICcnLFxuICAgICAgbmV3Q29udGVudHM6ICcnLFxuICAgIH0pO1xuICAgIGNvbnN0IGZpbGUgPSBnZXRGaWxlRm9yUGF0aChmaWxlUGF0aCk7XG4gICAgaWYgKGZpbGUpIHtcbiAgICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMuYWRkKGZpbGUub25EaWRDaGFuZ2UoZGVib3VuY2UoXG4gICAgICAgICgpID0+IHRoaXMuX29uRGlkRmlsZUNoYW5nZShmaWxlUGF0aCkuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvciksXG4gICAgICAgIEZJTEVfQ0hBTkdFX0RFQk9VTkNFX01TLFxuICAgICAgICBmYWxzZSxcbiAgICAgICkpKTtcbiAgICB9XG4gICAgdHJhY2soJ2RpZmYtdmlldy1vcGVuLWZpbGUnLCB7ZmlsZVBhdGh9KTtcbiAgICB0aGlzLl91cGRhdGVBY3RpdmVEaWZmU3RhdGUoZmlsZVBhdGgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmlsZS1jaGFuZ2UtdXBkYXRlJylcbiAgYXN5bmMgX29uRGlkRmlsZUNoYW5nZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVGaWxlU3RhdGUuZmlsZVBhdGggIT09IGZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpbGVzeXN0ZW1Db250ZW50cyA9IGF3YWl0IGdldEZpbGVTeXN0ZW1Db250ZW50cyhmaWxlUGF0aCk7XG4gICAgY29uc3Qge1xuICAgICAgb2xkQ29udGVudHM6IGNvbW1pdHRlZENvbnRlbnRzLFxuICAgIH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICApO1xuICB9XG5cbiAgX3VwZGF0ZURpZmZTdGF0ZUlmQ2hhbmdlZChcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb21taXR0ZWRDb250ZW50czogc3RyaW5nLFxuICAgIGZpbGVzeXN0ZW1Db250ZW50czogc3RyaW5nLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGg6IGFjdGl2ZUZpbGVQYXRoLCBuZXdDb250ZW50cywgc2F2ZWRDb250ZW50c30gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaWYgKGZpbGVQYXRoICE9PSBhY3RpdmVGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICBpZiAoc2F2ZWRDb250ZW50cyA9PT0gbmV3Q29udGVudHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGgsIHtcbiAgICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBUaGUgdXNlciBoYXZlIGVkaXRlZCBzaW5jZSB0aGUgbGFzdCB1cGRhdGUuXG4gICAgaWYgKGZpbGVzeXN0ZW1Db250ZW50cyA9PT0gc2F2ZWRDb250ZW50cykge1xuICAgICAgLy8gVGhlIGNoYW5nZXMgaGF2ZW4ndCB0b3VjaGVkIHRoZSBmaWxlc3lzdGVtLCBrZWVwIHVzZXIgZWRpdHMuXG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKGZpbGVQYXRoLCB7XG4gICAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgICBmaWxlc3lzdGVtQ29udGVudHM6IG5ld0NvbnRlbnRzLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBjb21taXR0ZWQgYW5kIGZpbGVzeXN0ZW0gc3RhdGUgaGF2ZSBjaGFuZ2VkLCBub3RpZnkgb2Ygb3ZlcnJpZGUuXG4gICAgICBub3RpZnlGaWxlc3lzdGVtT3ZlcnJpZGVVc2VyRWRpdHMoZmlsZVBhdGgpO1xuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShmaWxlUGF0aCwge1xuICAgICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2V0TmV3Q29udGVudHMobmV3Q29udGVudHM6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHtmaWxlUGF0aCwgb2xkQ29udGVudHMsIHNhdmVkQ29udGVudHMsIGlubGluZUNvbXBvbmVudHN9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZSh7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZENvbnRlbnRzLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgaW5saW5lQ29tcG9uZW50cyxcbiAgICB9KTtcbiAgfVxuXG4gIHNldFJldmlzaW9uKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiB2b2lkIHtcbiAgICB0cmFjaygnZGlmZi12aWV3LXNldC1yZXZpc2lvbicpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaztcbiAgICBpbnZhcmlhbnQocmVwb3NpdG9yeVN0YWNrLCAnVGhlcmUgbXVzdCBiZSBhbiBhY3RpdmUgcmVwb3NpdG9yeSBzdGFjayEnKTtcbiAgICByZXBvc2l0b3J5U3RhY2suc2V0UmV2aXNpb24ocmV2aXNpb24pLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICB9XG5cbiAgZ2V0QWN0aXZlRmlsZVN0YXRlKCk6IEZpbGVDaGFuZ2VTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVBY3RpdmVEaWZmU3RhdGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGhnRGlmZlN0YXRlID0gYXdhaXQgdGhpcy5fZmV0Y2hIZ0RpZmYoZmlsZVBhdGgpO1xuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShmaWxlUGF0aCwgaGdEaWZmU3RhdGUpO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZURpZmZTdGF0ZShmaWxlUGF0aDogTnVjbGlkZVVyaSwgaGdEaWZmU3RhdGU6IEhnRGlmZlN0YXRlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge1xuICAgICAgY29tbWl0dGVkQ29udGVudHM6IG9sZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzOiBuZXdDb250ZW50cyxcbiAgICB9ID0gaGdEaWZmU3RhdGU7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHtcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgb2xkQ29udGVudHMsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHM6IG5ld0NvbnRlbnRzLFxuICAgIH0pO1xuICAgIGNvbnN0IGlubGluZUNvbXBvbmVudHMgPSBhd2FpdCB0aGlzLl9mZXRjaElubGluZUNvbXBvbmVudHMoKTtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoe1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRDb250ZW50cyxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50czogbmV3Q29udGVudHMsXG4gICAgICBpbmxpbmVDb21wb25lbnRzLFxuICAgIH0pO1xuICB9XG5cbiAgX3NldEFjdGl2ZUZpbGVTdGF0ZShzdGF0ZTogRmlsZUNoYW5nZVN0YXRlKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aXZlRmlsZVN0YXRlID0gc3RhdGU7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KEFDVElWRV9GSUxFX1VQREFURV9FVkVOVCwgc3RhdGUpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuaGctc3RhdGUtdXBkYXRlJylcbiAgYXN5bmMgX2ZldGNoSGdEaWZmKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxIZ0RpZmZTdGF0ZT4ge1xuICAgIC8vIENhbGxpbmcgYXRvbS5wcm9qZWN0LnJlcG9zaXRvcnlGb3JEaXJlY3RvcnkgZ2V0cyB0aGUgcmVhbCBwYXRoIG9mIHRoZSBkaXJlY3RvcnksXG4gICAgLy8gd2hpY2ggaXMgYW5vdGhlciByb3VuZC10cmlwIGFuZCBjYWxscyB0aGUgcmVwb3NpdG9yeSBwcm92aWRlcnMgdG8gZ2V0IGFuIGV4aXN0aW5nIHJlcG9zaXRvcnkuXG4gICAgLy8gSW5zdGVhZCwgdGhlIGZpcnN0IG1hdGNoIG9mIHRoZSBmaWx0ZXJpbmcgaGVyZSBpcyB0aGUgb25seSBwb3NzaWJsZSBtYXRjaC5cbiAgICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgoZmlsZVBhdGgpO1xuICAgIGlmIChyZXBvc2l0b3J5ID09IG51bGwgfHwgcmVwb3NpdG9yeS5nZXRUeXBlKCkgIT09ICdoZycpIHtcbiAgICAgIGNvbnN0IHR5cGUgPSByZXBvc2l0b3J5ID8gcmVwb3NpdG9yeS5nZXRUeXBlKCkgOiAnbm8gcmVwb3NpdG9yeSc7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYERpZmYgdmlldyBvbmx5IHN1cHBvcnRzIFxcYE1lcmN1cmlhbFxcYCByZXBvc2l0b3JpZXMsIGJ1dCBmb3VuZCBcXGAke3R5cGV9XFxgYCk7XG4gICAgfVxuXG4gICAgY29uc3QgaGdSZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQgPSAocmVwb3NpdG9yeTogYW55KTtcbiAgICBjb25zdCByZXBvc2l0b3J5U3RhY2sgPSB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmdldChoZ1JlcG9zaXRvcnkpO1xuICAgIGludmFyaWFudChyZXBvc2l0b3J5U3RhY2spO1xuICAgIGNvbnN0IFtoZ0RpZmZdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmZldGNoSGdEaWZmKGZpbGVQYXRoKSxcbiAgICAgIHRoaXMuX3NldEFjdGl2ZVJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5U3RhY2spLFxuICAgIF0pO1xuICAgIHJldHVybiBoZ0RpZmY7XG4gIH1cblxuICBhc3luYyBfc2V0QWN0aXZlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnlTdGFjazogUmVwb3NpdG9yeVN0YWNrKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PT0gcmVwb3NpdG9yeVN0YWNrKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9IHJlcG9zaXRvcnlTdGFjaztcbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZSA9IGF3YWl0IHJlcG9zaXRvcnlTdGFjay5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICB0aGlzLl91cGRhdGVDaGFuZ2VkUmV2aXNpb25zKHJlcG9zaXRvcnlTdGFjaywgcmV2aXNpb25zU3RhdGUpO1xuICB9XG5cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5zYXZlLWZpbGUnKVxuICBhc3luYyBzYXZlQWN0aXZlRmlsZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGgsIG5ld0NvbnRlbnRzfSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICB0cmFjaygnZGlmZi12aWV3LXNhdmUtZmlsZScsIHtmaWxlUGF0aH0pO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9zYXZlRmlsZShmaWxlUGF0aCwgbmV3Q29udGVudHMpO1xuICAgICAgdGhpcy5fYWN0aXZlRmlsZVN0YXRlLnNhdmVkQ29udGVudHMgPSBuZXdDb250ZW50cztcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbm90aWZ5SW50ZXJuYWxFcnJvcihlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3NhdmVGaWxlKGZpbGVQYXRoOiBOdWNsaWRlVXJpLCBuZXdDb250ZW50czogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge2dldFBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLXVyaScpO1xuICAgIHRyeSB7XG4gICAgICAvLyBXZSBkb24ndCB1c2UgZmlsZXMsIGJlY2F1c2UgYGdldEZpbGVGb3JQYXRoYCByZXR1cm5zIHRoZSBzYW1lIHJlbW90ZSBmaWxlXG4gICAgICAvLyBpbnN0YW5jZSBldmVyeXRpbWUsIHdoaWNoIGNvdWxkIGhhdmUgYW4gaW52YWxpZCBmaWxlc3lzdGVtIGNvbnRlbnRzIGNhY2hlLlxuICAgICAgYXdhaXQgZ2V0RmlsZVN5c3RlbVNlcnZpY2VCeU51Y2xpZGVVcmkoZmlsZVBhdGgpLndyaXRlRmlsZShnZXRQYXRoKGZpbGVQYXRoKSwgbmV3Q29udGVudHMpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBjb3VsZCBub3Qgc2F2ZSBmaWxlOiBcXGAke2ZpbGVQYXRofVxcYCAtICR7ZXJyLnRvU3RyaW5nKCl9YCk7XG4gICAgfVxuICB9XG5cbiAgb25EaWRDaGFuZ2VEaXJ0eVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGRpcnR5RmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+KSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZUNvbXBhcmVTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChjb21wYXJlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+KSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uUmV2aXNpb25zVXBkYXRlKGNhbGxiYWNrOiAoc3RhdGU6ID9SZXZpc2lvbnNTdGF0ZSkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkFjdGl2ZUZpbGVVcGRhdGVzKGNhbGxiYWNrOiAoc3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZldGNoLWNvbW1lbnRzJylcbiAgYXN5bmMgX2ZldGNoSW5saW5lQ29tcG9uZW50cygpOiBQcm9taXNlPEFycmF5PE9iamVjdD4+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGNvbnN0IHVpRWxlbWVudFByb21pc2VzID0gdGhpcy5fdWlQcm92aWRlcnMubWFwKFxuICAgICAgcHJvdmlkZXIgPT4gcHJvdmlkZXIuY29tcG9zZVVpRWxlbWVudHMoZmlsZVBhdGgpXG4gICAgKTtcbiAgICBjb25zdCB1aUNvbXBvbmVudExpc3RzID0gYXdhaXQgUHJvbWlzZS5hbGwodWlFbGVtZW50UHJvbWlzZXMpO1xuICAgIC8vIEZsYXR0ZW4gdWlDb21wb25lbnRMaXN0cyBmcm9tIGxpc3Qgb2YgbGlzdHMgb2YgY29tcG9uZW50cyB0byBhIGxpc3Qgb2YgY29tcG9uZW50cy5cbiAgICBjb25zdCB1aUNvbXBvbmVudHMgPSBbXS5jb25jYXQuYXBwbHkoW10sIHVpQ29tcG9uZW50TGlzdHMpO1xuICAgIHJldHVybiB1aUNvbXBvbmVudHM7XG4gIH1cblxuICBnZXREaXJ0eUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fZGlydHlGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGdldENvbXBhcmVGaWxlQ2hhbmdlcygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGFzeW5jIGdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCk6IFByb21pc2U8P1JldmlzaW9uc1N0YXRlPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnlTdGFjayBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suYWN0aXZhdGUoKTtcbiAgICB9XG4gIH1cblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2suZGVhY3RpdmF0ZSgpO1xuICAgICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHtcbiAgICAgIGZpbGVQYXRoOiAnJyxcbiAgICAgIG9sZENvbnRlbnRzOiAnJyxcbiAgICAgIG5ld0NvbnRlbnRzOiAnJyxcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5U3RhY2sgb2YgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5jbGVhcigpO1xuICAgIGZvciAoY29uc3Qgc3Vic2NyaXB0aW9uIG9mIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLnZhbHVlcygpKSB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5jbGVhcigpO1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMuY2xlYXIoKTtcbiAgICBpZiAodGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpZmZWaWV3TW9kZWw7XG4iXX0=