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
      var _activeFileState = this._activeFileState;
      var savedContents = _activeFileState.savedContents;
      var committedContents = _activeFileState.oldContents;
      var activeFilePath = _activeFileState.filePath;

      yield this._updateDiffStateIfChanged(filePath, committedContents, filesystemContents);
    })
  }, {
    key: '_updateDiffStateIfChanged',
    value: function _updateDiffStateIfChanged(filePath, committedContents, filesystemContents) {
      var _activeFileState2 = this._activeFileState;
      var activeFilePath = _activeFileState2.filePath;
      var newContents = _activeFileState2.newContents;
      var savedContents = _activeFileState2.savedContents;

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
      var _activeFileState3 = this._activeFileState;
      var filePath = _activeFileState3.filePath;
      var oldContents = _activeFileState3.oldContents;
      var savedContents = _activeFileState3.savedContents;
      var inlineComponents = _activeFileState3.inlineComponents;

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
      var _activeFileState4 = this._activeFileState;
      var filePath = _activeFileState4.filePath;
      var newContents = _activeFileState4.newContents;

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
//# sourceMappingURL=data:application/json;base64,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QXFZbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdNb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlU3RhdGUsIFJldmlzaW9uc1N0YXRlLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsIEhnRGlmZlN0YXRlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7cmVwb3NpdG9yeUZvclBhdGh9IGZyb20gJy4uLy4uL2hnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1Db250ZW50c30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2dldEZpbGVGb3JQYXRoLCBnZXRGaWxlU3lzdGVtU2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vY2xpZW50JztcbmltcG9ydCB7YXJyYXksIG1hcCwgZGVib3VuY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IFJlcG9zaXRvcnlTdGFjayBmcm9tICcuL1JlcG9zaXRvcnlTdGFjayc7XG5pbXBvcnQge1xuICBub3RpZnlJbnRlcm5hbEVycm9yLFxuICBub3RpZnlGaWxlc3lzdGVtT3ZlcnJpZGVVc2VyRWRpdHMsXG59IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XG5cbmNvbnN0IENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQgPSAnZGlkLWNoYW5nZS1kaXJ0eS1zdGF0dXMnO1xuY29uc3QgQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5UID0gJ2RpZC1jaGFuZ2UtY29tcGFyZS1zdGF0dXMnO1xuY29uc3QgQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5UID0gJ2FjdGl2ZS1maWxlLXVwZGF0ZSc7XG5jb25zdCBDSEFOR0VfUkVWSVNJT05TX0VWRU5UID0gJ2RpZC1jaGFuZ2UtcmV2aXNpb25zJztcbmNvbnN0IEZJTEVfQ0hBTkdFX0RFQk9VTkNFX01TID0gMTAwO1xuXG5jbGFzcyBEaWZmVmlld01vZGVsIHtcblxuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9hY3RpdmVTdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGl2ZUZpbGVTdGF0ZTogRmlsZUNoYW5nZVN0YXRlO1xuICBfYWN0aXZlUmVwb3NpdG9yeVN0YWNrOiA/UmVwb3NpdG9yeVN0YWNrO1xuICBfbmV3RWRpdG9yOiA/VGV4dEVkaXRvcjtcbiAgX2RpcnR5RmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfY29tcGFyZUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgX3VpUHJvdmlkZXJzOiBBcnJheTxPYmplY3Q+O1xuICBfcmVwb3NpdG9yeVN0YWNrczogTWFwPEhnUmVwb3NpdG9yeUNsaWVudCwgUmVwb3NpdG9yeVN0YWNrPjtcbiAgX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zOiBNYXA8SGdSZXBvc2l0b3J5Q2xpZW50LCBDb21wb3NpdGVEaXNwb3NhYmxlPjtcbiAgX2lzQWN0aXZlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHVpUHJvdmlkZXJzOiBBcnJheTxPYmplY3Q+KSB7XG4gICAgdGhpcy5fdWlQcm92aWRlcnMgPSB1aVByb3ZpZGVycztcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fdXBkYXRlUmVwb3NpdG9yaWVzKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHModGhpcy5fdXBkYXRlUmVwb3NpdG9yaWVzLmJpbmQodGhpcykpKTtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoe1xuICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgb2xkQ29udGVudHM6ICcnLFxuICAgICAgbmV3Q29udGVudHM6ICcnLFxuICAgIH0pO1xuICB9XG5cbiAgX3VwZGF0ZVJlcG9zaXRvcmllcygpOiB2b2lkIHtcbiAgICBjb25zdCByZXBvc2l0b3JpZXMgPSBuZXcgU2V0KFxuICAgICAgYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpLmZpbHRlcihcbiAgICAgICAgcmVwb3NpdG9yeSA9PiByZXBvc2l0b3J5ICE9IG51bGwgJiYgcmVwb3NpdG9yeS5nZXRUeXBlKCkgPT09ICdoZydcbiAgICAgIClcbiAgICApO1xuICAgIC8vIERpc3Bvc2UgcmVtb3ZlZCBwcm9qZWN0cyByZXBvc2l0b3JpZXMuXG4gICAgZm9yIChjb25zdCBbcmVwb3NpdG9yeSwgcmVwb3NpdG9yeVN0YWNrXSBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzKSB7XG4gICAgICBpZiAocmVwb3NpdG9yaWVzLmhhcyhyZXBvc2l0b3J5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHJlcG9zaXRvcnlTdGFjay5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmRlbGV0ZShyZXBvc2l0b3J5KTtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5nZXQocmVwb3NpdG9yeSk7XG4gICAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmRlbGV0ZShyZXBvc2l0b3J5KTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnkgb2YgcmVwb3NpdG9yaWVzKSB7XG4gICAgICBpZiAodGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5oYXMocmVwb3NpdG9yeSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSAoKHJlcG9zaXRvcnk6IGFueSk6IEhnUmVwb3NpdG9yeUNsaWVudCk7XG4gICAgICB0aGlzLl9jcmVhdGVSZXBvc2l0b3J5U3RhY2soaGdSZXBvc2l0b3J5KTtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVEaXJ0eUNoYW5nZWRTdGF0dXMoKTtcbiAgfVxuXG4gIF91cGRhdGVEaXJ0eUNoYW5nZWRTdGF0dXMoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyA9IHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IG1hcC51bmlvbiguLi5hcnJheVxuICAgICAgLmZyb20odGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSlcbiAgICAgIC5tYXAocmVwb3NpdG9yeVN0YWNrID0+IHJlcG9zaXRvcnlTdGFjay5nZXREaXJ0eUZpbGVDaGFuZ2VzKCkpXG4gICAgKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX0RJUlRZX1NUQVRVU19FVkVOVCwgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBfY3JlYXRlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCk6IFJlcG9zaXRvcnlTdGFjayB7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gbmV3IFJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5KTtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZENoYW5nZURpcnR5U3RhdHVzKHRoaXMuX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cy5iaW5kKHRoaXMpKSxcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZENoYW5nZUNvbXBhcmVTdGF0dXModGhpcy5fdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMuYmluZCh0aGlzKSksXG4gICAgICByZXBvc2l0b3J5U3RhY2sub25EaWRDaGFuZ2VSZXZpc2lvbnMocmV2aXNpb25zU3RhdGUgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVDaGFuZ2VkUmV2aXNpb25zKHJlcG9zaXRvcnlTdGFjaywgcmV2aXNpb25zU3RhdGUpXG4gICAgICAgICAgLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICAgICAgfSksXG4gICAgKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnNldChyZXBvc2l0b3J5LCByZXBvc2l0b3J5U3RhY2spO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLnNldChyZXBvc2l0b3J5LCBzdWJzY3JpcHRpb25zKTtcbiAgICBpZiAodGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5hY3RpdmF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVwb3NpdG9yeVN0YWNrO1xuICB9XG5cbiAgX3VwZGF0ZUNvbXBhcmVDaGFuZ2VkU3RhdHVzKCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IG1hcC51bmlvbiguLi5hcnJheVxuICAgICAgLmZyb20odGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSlcbiAgICAgIC5tYXAocmVwb3NpdG9yeVN0YWNrID0+IHJlcG9zaXRvcnlTdGFjay5nZXRDb21wYXJlRmlsZUNoYW5nZXMoKSlcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQsIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhcbiAgICByZXBvc2l0b3J5U3RhY2s6IFJlcG9zaXRvcnlTdGFjayxcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChyZXBvc2l0b3J5U3RhY2sgPT09IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaykge1xuICAgICAgdHJhY2soJ2RpZmYtdmlldy11cGRhdGUtdGltZWxpbmUtcmV2aXNpb25zJywge1xuICAgICAgICByZXZpc2lvbnNDb3VudDogYCR7cmV2aXNpb25zU3RhdGUucmV2aXNpb25zLmxlbmd0aH1gLFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuXG4gICAgICAvLyBVcGRhdGUgdGhlIGFjdGl2ZSBmaWxlLCBpZiBjaGFuZ2VkLlxuICAgICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3Qge2NvbW1pdHRlZENvbnRlbnRzLCBmaWxlc3lzdGVtQ29udGVudHN9ID0gYXdhaXQgdGhpcy5fZmV0Y2hIZ0RpZmYoZmlsZVBhdGgpO1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWN0aXZhdGVGaWxlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBjb25zdCBhY3RpdmVTdWJzY3JpcHRpb25zID0gdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHtcbiAgICAgIGZpbGVQYXRoOiAnJyxcbiAgICAgIG9sZENvbnRlbnRzOiAnJyxcbiAgICAgIG5ld0NvbnRlbnRzOiAnJyxcbiAgICB9KTtcbiAgICBjb25zdCBmaWxlID0gZ2V0RmlsZUZvclBhdGgoZmlsZVBhdGgpO1xuICAgIGlmIChmaWxlKSB7XG4gICAgICBhY3RpdmVTdWJzY3JpcHRpb25zLmFkZChmaWxlLm9uRGlkQ2hhbmdlKGRlYm91bmNlKFxuICAgICAgICAoKSA9PiB0aGlzLl9vbkRpZEZpbGVDaGFuZ2UoZmlsZVBhdGgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpLFxuICAgICAgICBGSUxFX0NIQU5HRV9ERUJPVU5DRV9NUyxcbiAgICAgICAgZmFsc2UsXG4gICAgICApKSk7XG4gICAgfVxuICAgIHRyYWNrKCdkaWZmLXZpZXctb3Blbi1maWxlJywge2ZpbGVQYXRofSk7XG4gICAgdGhpcy5fdXBkYXRlQWN0aXZlRGlmZlN0YXRlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZpbGUtY2hhbmdlLXVwZGF0ZScpXG4gIGFzeW5jIF9vbkRpZEZpbGVDaGFuZ2UoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlRmlsZVN0YXRlLmZpbGVQYXRoICE9PSBmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaWxlc3lzdGVtQ29udGVudHMgPSBhd2FpdCBnZXRGaWxlU3lzdGVtQ29udGVudHMoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHtcbiAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgICBvbGRDb250ZW50czogY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlUGF0aDogYWN0aXZlRmlsZVBhdGgsXG4gICAgfSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICk7XG4gIH1cblxuICBfdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbW1pdHRlZENvbnRlbnRzOiBzdHJpbmcsXG4gICAgZmlsZXN5c3RlbUNvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aDogYWN0aXZlRmlsZVBhdGgsIG5ld0NvbnRlbnRzLCBzYXZlZENvbnRlbnRzfSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBpZiAoZmlsZVBhdGggIT09IGFjdGl2ZUZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIGlmIChzYXZlZENvbnRlbnRzID09PSBuZXdDb250ZW50cykge1xuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShmaWxlUGF0aCwge1xuICAgICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFRoZSB1c2VyIGhhdmUgZWRpdGVkIHNpbmNlIHRoZSBsYXN0IHVwZGF0ZS5cbiAgICBpZiAoZmlsZXN5c3RlbUNvbnRlbnRzID09PSBzYXZlZENvbnRlbnRzKSB7XG4gICAgICAvLyBUaGUgY2hhbmdlcyBoYXZlbid0IHRvdWNoZWQgdGhlIGZpbGVzeXN0ZW0sIGtlZXAgdXNlciBlZGl0cy5cbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGgsIHtcbiAgICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICAgIGZpbGVzeXN0ZW1Db250ZW50czogbmV3Q29udGVudHMsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGNvbW1pdHRlZCBhbmQgZmlsZXN5c3RlbSBzdGF0ZSBoYXZlIGNoYW5nZWQsIG5vdGlmeSBvZiBvdmVycmlkZS5cbiAgICAgIG5vdGlmeUZpbGVzeXN0ZW1PdmVycmlkZVVzZXJFZGl0cyhmaWxlUGF0aCk7XG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKGZpbGVQYXRoLCB7XG4gICAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZXROZXdDb250ZW50cyhuZXdDb250ZW50czogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qge2ZpbGVQYXRoLCBvbGRDb250ZW50cywgc2F2ZWRDb250ZW50cywgaW5saW5lQ29tcG9uZW50c30gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHtcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgb2xkQ29udGVudHMsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgICBpbmxpbmVDb21wb25lbnRzLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0UmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IHZvaWQge1xuICAgIHRyYWNrKCdkaWZmLXZpZXctc2V0LXJldmlzaW9uJyk7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrO1xuICAgIGludmFyaWFudChyZXBvc2l0b3J5U3RhY2ssICdUaGVyZSBtdXN0IGJlIGFuIGFjdGl2ZSByZXBvc2l0b3J5IHN0YWNrIScpO1xuICAgIHJlcG9zaXRvcnlTdGFjay5zZXRSZXZpc2lvbihyZXZpc2lvbikuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gIH1cblxuICBnZXRBY3RpdmVGaWxlU3RhdGUoKTogRmlsZUNoYW5nZVN0YXRlIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZUFjdGl2ZURpZmZTdGF0ZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaGdEaWZmU3RhdGUgPSBhd2FpdCB0aGlzLl9mZXRjaEhnRGlmZihmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlKGZpbGVQYXRoLCBoZ0RpZmZTdGF0ZSk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlRGlmZlN0YXRlKGZpbGVQYXRoOiBOdWNsaWRlVXJpLCBoZ0RpZmZTdGF0ZTogSGdEaWZmU3RhdGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7XG4gICAgICBjb21taXR0ZWRDb250ZW50czogb2xkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHM6IG5ld0NvbnRlbnRzLFxuICAgIH0gPSBoZ0RpZmZTdGF0ZTtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoe1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRDb250ZW50cyxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50czogbmV3Q29udGVudHMsXG4gICAgfSk7XG4gICAgY29uc3QgaW5saW5lQ29tcG9uZW50cyA9IGF3YWl0IHRoaXMuX2ZldGNoSW5saW5lQ29tcG9uZW50cygpO1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZSh7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZENvbnRlbnRzLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzOiBuZXdDb250ZW50cyxcbiAgICAgIGlubGluZUNvbXBvbmVudHMsXG4gICAgfSk7XG4gIH1cblxuICBfc2V0QWN0aXZlRmlsZVN0YXRlKHN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5ULCBzdGF0ZSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5oZy1zdGF0ZS11cGRhdGUnKVxuICBhc3luYyBfZmV0Y2hIZ0RpZmYoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPEhnRGlmZlN0YXRlPiB7XG4gICAgLy8gQ2FsbGluZyBhdG9tLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeSBnZXRzIHRoZSByZWFsIHBhdGggb2YgdGhlIGRpcmVjdG9yeSxcbiAgICAvLyB3aGljaCBpcyBhbm90aGVyIHJvdW5kLXRyaXAgYW5kIGNhbGxzIHRoZSByZXBvc2l0b3J5IHByb3ZpZGVycyB0byBnZXQgYW4gZXhpc3RpbmcgcmVwb3NpdG9yeS5cbiAgICAvLyBJbnN0ZWFkLCB0aGUgZmlyc3QgbWF0Y2ggb2YgdGhlIGZpbHRlcmluZyBoZXJlIGlzIHRoZSBvbmx5IHBvc3NpYmxlIG1hdGNoLlxuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aCk7XG4gICAgaWYgKHJlcG9zaXRvcnkgPT0gbnVsbCB8fCByZXBvc2l0b3J5LmdldFR5cGUoKSAhPT0gJ2hnJykge1xuICAgICAgY29uc3QgdHlwZSA9IHJlcG9zaXRvcnkgPyByZXBvc2l0b3J5LmdldFR5cGUoKSA6ICdubyByZXBvc2l0b3J5JztcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRGlmZiB2aWV3IG9ubHkgc3VwcG9ydHMgXFxgTWVyY3VyaWFsXFxgIHJlcG9zaXRvcmllcywgYnV0IGZvdW5kIFxcYCR7dHlwZX1cXGBgKTtcbiAgICB9XG5cbiAgICBjb25zdCBoZ1JlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCA9IChyZXBvc2l0b3J5OiBhbnkpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuZ2V0KGhnUmVwb3NpdG9yeSk7XG4gICAgaW52YXJpYW50KHJlcG9zaXRvcnlTdGFjayk7XG4gICAgY29uc3QgW2hnRGlmZl0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICByZXBvc2l0b3J5U3RhY2suZmV0Y2hIZ0RpZmYoZmlsZVBhdGgpLFxuICAgICAgdGhpcy5fc2V0QWN0aXZlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnlTdGFjayksXG4gICAgXSk7XG4gICAgcmV0dXJuIGhnRGlmZjtcbiAgfVxuXG4gIGFzeW5jIF9zZXRBY3RpdmVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeVN0YWNrOiBSZXBvc2l0b3J5U3RhY2spOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09PSByZXBvc2l0b3J5U3RhY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID0gcmVwb3NpdG9yeVN0YWNrO1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgcmVwb3NpdG9yeVN0YWNrLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIHRoaXMuX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMocmVwb3NpdG9yeVN0YWNrLCByZXZpc2lvbnNTdGF0ZSk7XG4gIH1cblxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnNhdmUtZmlsZScpXG4gIGFzeW5jIHNhdmVBY3RpdmVGaWxlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aCwgbmV3Q29udGVudHN9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctc2F2ZS1maWxlJywge2ZpbGVQYXRofSk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuX3NhdmVGaWxlKGZpbGVQYXRoLCBuZXdDb250ZW50cyk7XG4gICAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUuc2F2ZWRDb250ZW50cyA9IG5ld0NvbnRlbnRzO1xuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9zYXZlRmlsZShmaWxlUGF0aDogTnVjbGlkZVVyaSwgbmV3Q29udGVudHM6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtnZXRQYXRofSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS11cmknKTtcbiAgICB0cnkge1xuICAgICAgLy8gV2UgZG9uJ3QgdXNlIGZpbGVzLCBiZWNhdXNlIGBnZXRGaWxlRm9yUGF0aGAgcmV0dXJucyB0aGUgc2FtZSByZW1vdGUgZmlsZVxuICAgICAgLy8gaW5zdGFuY2UgZXZlcnl0aW1lLCB3aGljaCBjb3VsZCBoYXZlIGFuIGludmFsaWQgZmlsZXN5c3RlbSBjb250ZW50cyBjYWNoZS5cbiAgICAgIGF3YWl0IGdldEZpbGVTeXN0ZW1TZXJ2aWNlQnlOdWNsaWRlVXJpKGZpbGVQYXRoKS53cml0ZUZpbGUoZ2V0UGF0aChmaWxlUGF0aCksIG5ld0NvbnRlbnRzKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgY291bGQgbm90IHNhdmUgZmlsZTogXFxgJHtmaWxlUGF0aH1cXGAgLSAke2Vyci50b1N0cmluZygpfWApO1xuICAgIH1cbiAgfVxuXG4gIG9uRGlkQ2hhbmdlRGlydHlTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChkaXJ0eUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPikgPT4gdm9pZFxuICApOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGNvbXBhcmVGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uUmV2aXNpb25zVXBkYXRlKGNhbGxiYWNrOiAoc3RhdGU6ID9SZXZpc2lvbnNTdGF0ZSkgPT4gdm9pZCk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25BY3RpdmVGaWxlVXBkYXRlcyhjYWxsYmFjazogKHN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpID0+IHZvaWQpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKEFDVElWRV9GSUxFX1VQREFURV9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtY29tbWVudHMnKVxuICBhc3luYyBfZmV0Y2hJbmxpbmVDb21wb25lbnRzKCk6IFByb21pc2U8QXJyYXk8T2JqZWN0Pj4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgY29uc3QgdWlFbGVtZW50UHJvbWlzZXMgPSB0aGlzLl91aVByb3ZpZGVycy5tYXAoXG4gICAgICBwcm92aWRlciA9PiBwcm92aWRlci5jb21wb3NlVWlFbGVtZW50cyhmaWxlUGF0aClcbiAgICApO1xuICAgIGNvbnN0IHVpQ29tcG9uZW50TGlzdHMgPSBhd2FpdCBQcm9taXNlLmFsbCh1aUVsZW1lbnRQcm9taXNlcyk7XG4gICAgLy8gRmxhdHRlbiB1aUNvbXBvbmVudExpc3RzIGZyb20gbGlzdCBvZiBsaXN0cyBvZiBjb21wb25lbnRzIHRvIGEgbGlzdCBvZiBjb21wb25lbnRzLlxuICAgIGNvbnN0IHVpQ29tcG9uZW50cyA9IFtdLmNvbmNhdC5hcHBseShbXSwgdWlDb21wb25lbnRMaXN0cyk7XG4gICAgcmV0dXJuIHVpQ29tcG9uZW50cztcbiAgfVxuXG4gIGdldERpcnR5RmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgZ2V0Q29tcGFyZUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgYXN5bmMgZ2V0QWN0aXZlUmV2aXNpb25zU3RhdGUoKTogUHJvbWlzZTw/UmV2aXNpb25zU3RhdGU+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICB9XG5cbiAgYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgcmVwb3NpdG9yeVN0YWNrIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpIHtcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5hY3RpdmF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5kZWFjdGl2YXRlKCk7XG4gICAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoe1xuICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgb2xkQ29udGVudHM6ICcnLFxuICAgICAgbmV3Q29udGVudHM6ICcnLFxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnlTdGFjayBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmNsZWFyKCk7XG4gICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2YgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmNsZWFyKCk7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIGlmICh0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlZpZXdNb2RlbDtcbiJdfQ==