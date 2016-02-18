var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

function getInitialFileChangeState() {
  return {
    fromRevisionTitle: 'No file selected',
    toRevisionTitle: 'No file selected',
    filePath: '',
    oldContents: '',
    newContents: '',
    compareRevisionInfo: null
  };
}

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
    this._setActiveFileState(getInitialFileChangeState());
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
        var revisionInfo = _ref4.revisionInfo;

        yield this._updateDiffStateIfChanged(filePath, committedContents, filesystemContents, revisionInfo);
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
      var _activeFileState = this._activeFileState;
      var committedContents = _activeFileState.oldContents;
      var revisionInfo = _activeFileState.compareRevisionInfo;

      (0, _assert2['default'])(revisionInfo, 'Diff View: Revision info must be defined to update changed state');
      yield this._updateDiffStateIfChanged(filePath, committedContents, filesystemContents, revisionInfo);
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
    value: function _updateDiffStateIfChanged(filePath, committedContents, filesystemContents, revisionInfo) {
      var _activeFileState2 = this._activeFileState;
      var activeFilePath = _activeFileState2.filePath;
      var newContents = _activeFileState2.newContents;
      var savedContents = _activeFileState2.savedContents;

      if (filePath !== activeFilePath) {
        return Promise.resolve();
      }
      var updatedDiffState = {
        committedContents: committedContents,
        filesystemContents: filesystemContents,
        revisionInfo: revisionInfo
      };
      if (savedContents === newContents || filesystemContents === newContents) {
        return this._updateDiffState(filePath, updatedDiffState);
      }
      // The user have edited since the last update.
      if (filesystemContents === savedContents) {
        // The changes haven't touched the filesystem, keep user edits.
        return this._updateDiffState(filePath, _extends({}, updatedDiffState, { filesystemContents: newContents }));
      } else {
        // The committed and filesystem state have changed, notify of override.
        (0, _notifications.notifyFilesystemOverrideUserEdits)(filePath);
        return this._updateDiffState(filePath, updatedDiffState);
      }
    }
  }, {
    key: 'setNewContents',
    value: function setNewContents(newContents) {
      this._setActiveFileState(_extends({}, this._activeFileState, { newContents: newContents }));
    }
  }, {
    key: 'setRevision',
    value: function setRevision(revision) {
      (0, _analytics.track)('diff-view-set-revision');
      var repositoryStack = this._activeRepositoryStack;
      (0, _assert2['default'])(repositoryStack, 'There must be an active repository stack!');
      this._activeFileState = _extends({}, this._activeFileState, { compareRevisionInfo: revision });
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
      var revisionInfo = hgDiffState.revisionInfo;
      var hash = revisionInfo.hash;
      var bookmarks = revisionInfo.bookmarks;

      var newFileState = {
        filePath: filePath,
        oldContents: oldContents,
        newContents: newContents,
        savedContents: newContents,
        compareRevisionInfo: revisionInfo,
        fromRevisionTitle: '' + hash + (bookmarks.length === 0 ? '' : ' - (' + bookmarks.join(', ') + ')'),
        toRevisionTitle: 'Filesystem / Editor'
      };
      this._setActiveFileState(newFileState);
      // TODO(most): Fix: this assumes that the editor contents aren't changed while
      // fetching the comments, that's okay now because we don't fetch them.
      var inlineComponents = yield this._fetchInlineComponents();
      this._setActiveFileState(_extends({}, newFileState, { inlineComponents: inlineComponents }));
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
      (0, _assert2['default'])(repositoryStack, 'There must be an repository stack for a given repository!');

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
      this._updateRepositories();
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
      this._setActiveFileState(getInitialFileChangeState());
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
//# sourceMappingURL=data:application/json;base64,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S0FDRjs7O1NBN1pHLGFBQWE7OztBQWdhbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdNb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlU3RhdGUsIFJldmlzaW9uc1N0YXRlLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsIEhnRGlmZlN0YXRlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7cmVwb3NpdG9yeUZvclBhdGh9IGZyb20gJy4uLy4uL2hnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1Db250ZW50c30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2FycmF5LCBtYXAsIGRlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBSZXBvc2l0b3J5U3RhY2sgZnJvbSAnLi9SZXBvc2l0b3J5U3RhY2snO1xuaW1wb3J0IHtcbiAgbm90aWZ5SW50ZXJuYWxFcnJvcixcbiAgbm90aWZ5RmlsZXN5c3RlbU92ZXJyaWRlVXNlckVkaXRzLFxufSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IHtidWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5cbmNvbnN0IENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQgPSAnZGlkLWNoYW5nZS1kaXJ0eS1zdGF0dXMnO1xuY29uc3QgQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5UID0gJ2RpZC1jaGFuZ2UtY29tcGFyZS1zdGF0dXMnO1xuY29uc3QgQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5UID0gJ2FjdGl2ZS1maWxlLXVwZGF0ZSc7XG5jb25zdCBDSEFOR0VfUkVWSVNJT05TX0VWRU5UID0gJ2RpZC1jaGFuZ2UtcmV2aXNpb25zJztcbmNvbnN0IEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5UID0gJ2FjdGl2ZS1idWZmZXItY2hhbmdlLW1vZGlmaWVkJztcblxuY29uc3QgRklMRV9DSEFOR0VfREVCT1VOQ0VfTVMgPSAyMDA7XG5jb25zdCBVSV9DSEFOR0VfREVCT1VOQ0VfTVMgPSAxMDA7XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxGaWxlQ2hhbmdlU3RhdGUoKTogRmlsZUNoYW5nZVN0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICBmcm9tUmV2aXNpb25UaXRsZTogJ05vIGZpbGUgc2VsZWN0ZWQnLFxuICAgIHRvUmV2aXNpb25UaXRsZTogJ05vIGZpbGUgc2VsZWN0ZWQnLFxuICAgIGZpbGVQYXRoOiAnJyxcbiAgICBvbGRDb250ZW50czogJycsXG4gICAgbmV3Q29udGVudHM6ICcnLFxuICAgIGNvbXBhcmVSZXZpc2lvbkluZm86IG51bGwsXG4gIH07XG59XG5cbmNsYXNzIERpZmZWaWV3TW9kZWwge1xuXG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGl2ZVN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYWN0aXZlRmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGU7XG4gIF9hY3RpdmVSZXBvc2l0b3J5U3RhY2s6ID9SZXBvc2l0b3J5U3RhY2s7XG4gIF9uZXdFZGl0b3I6ID9UZXh0RWRpdG9yO1xuICBfZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9jb21wYXJlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfdWlQcm92aWRlcnM6IEFycmF5PE9iamVjdD47XG4gIF9yZXBvc2l0b3J5U3RhY2tzOiBNYXA8SGdSZXBvc2l0b3J5Q2xpZW50LCBSZXBvc2l0b3J5U3RhY2s+O1xuICBfcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnM6IE1hcDxIZ1JlcG9zaXRvcnlDbGllbnQsIENvbXBvc2l0ZURpc3Bvc2FibGU+O1xuICBfaXNBY3RpdmU6IGJvb2xlYW47XG4gIF9kZWJvdW5jZWRFbWl0QWN0aXZlRmlsZVVwZGF0ZTogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3Rvcih1aVByb3ZpZGVyczogQXJyYXk8T2JqZWN0Pikge1xuICAgIHRoaXMuX3VpUHJvdmlkZXJzID0gdWlQcm92aWRlcnM7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcygpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcy5iaW5kKHRoaXMpKSk7XG4gICAgdGhpcy5fZGVib3VuY2VkRW1pdEFjdGl2ZUZpbGVVcGRhdGUgPSBkZWJvdW5jZShcbiAgICAgIHRoaXMuX2VtaXRBY3RpdmVGaWxlVXBkYXRlLmJpbmQodGhpcyksXG4gICAgICBVSV9DSEFOR0VfREVCT1VOQ0VfTVMsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZShnZXRJbml0aWFsRmlsZUNoYW5nZVN0YXRlKCkpO1xuICB9XG5cbiAgX3VwZGF0ZVJlcG9zaXRvcmllcygpOiB2b2lkIHtcbiAgICBjb25zdCByZXBvc2l0b3JpZXMgPSBuZXcgU2V0KFxuICAgICAgYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpLmZpbHRlcihcbiAgICAgICAgcmVwb3NpdG9yeSA9PiByZXBvc2l0b3J5ICE9IG51bGwgJiYgcmVwb3NpdG9yeS5nZXRUeXBlKCkgPT09ICdoZydcbiAgICAgIClcbiAgICApO1xuICAgIC8vIERpc3Bvc2UgcmVtb3ZlZCBwcm9qZWN0cyByZXBvc2l0b3JpZXMuXG4gICAgZm9yIChjb25zdCBbcmVwb3NpdG9yeSwgcmVwb3NpdG9yeVN0YWNrXSBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzKSB7XG4gICAgICBpZiAocmVwb3NpdG9yaWVzLmhhcyhyZXBvc2l0b3J5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHJlcG9zaXRvcnlTdGFjay5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmRlbGV0ZShyZXBvc2l0b3J5KTtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5nZXQocmVwb3NpdG9yeSk7XG4gICAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmRlbGV0ZShyZXBvc2l0b3J5KTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnkgb2YgcmVwb3NpdG9yaWVzKSB7XG4gICAgICBpZiAodGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5oYXMocmVwb3NpdG9yeSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSAoKHJlcG9zaXRvcnk6IGFueSk6IEhnUmVwb3NpdG9yeUNsaWVudCk7XG4gICAgICB0aGlzLl9jcmVhdGVSZXBvc2l0b3J5U3RhY2soaGdSZXBvc2l0b3J5KTtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVEaXJ0eUNoYW5nZWRTdGF0dXMoKTtcbiAgfVxuXG4gIF91cGRhdGVEaXJ0eUNoYW5nZWRTdGF0dXMoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyA9IHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IG1hcC51bmlvbiguLi5hcnJheVxuICAgICAgLmZyb20odGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSlcbiAgICAgIC5tYXAocmVwb3NpdG9yeVN0YWNrID0+IHJlcG9zaXRvcnlTdGFjay5nZXREaXJ0eUZpbGVDaGFuZ2VzKCkpXG4gICAgKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX0RJUlRZX1NUQVRVU19FVkVOVCwgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBfY3JlYXRlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCk6IFJlcG9zaXRvcnlTdGFjayB7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gbmV3IFJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5KTtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZENoYW5nZURpcnR5U3RhdHVzKHRoaXMuX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cy5iaW5kKHRoaXMpKSxcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZENoYW5nZUNvbXBhcmVTdGF0dXModGhpcy5fdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMuYmluZCh0aGlzKSksXG4gICAgICByZXBvc2l0b3J5U3RhY2sub25EaWRDaGFuZ2VSZXZpc2lvbnMocmV2aXNpb25zU3RhdGUgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVDaGFuZ2VkUmV2aXNpb25zKHJlcG9zaXRvcnlTdGFjaywgcmV2aXNpb25zU3RhdGUsIHRydWUpXG4gICAgICAgICAgLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICAgICAgfSksXG4gICAgKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnNldChyZXBvc2l0b3J5LCByZXBvc2l0b3J5U3RhY2spO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLnNldChyZXBvc2l0b3J5LCBzdWJzY3JpcHRpb25zKTtcbiAgICBpZiAodGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5hY3RpdmF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVwb3NpdG9yeVN0YWNrO1xuICB9XG5cbiAgX3VwZGF0ZUNvbXBhcmVDaGFuZ2VkU3RhdHVzKCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IG1hcC51bmlvbiguLi5hcnJheVxuICAgICAgLmZyb20odGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSlcbiAgICAgIC5tYXAocmVwb3NpdG9yeVN0YWNrID0+IHJlcG9zaXRvcnlTdGFjay5nZXRDb21wYXJlRmlsZUNoYW5nZXMoKSlcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQsIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhcbiAgICByZXBvc2l0b3J5U3RhY2s6IFJlcG9zaXRvcnlTdGFjayxcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICAgcmVsb2FkRmlsZURpZmY6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChyZXBvc2l0b3J5U3RhY2sgPT09IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaykge1xuICAgICAgdHJhY2soJ2RpZmYtdmlldy11cGRhdGUtdGltZWxpbmUtcmV2aXNpb25zJywge1xuICAgICAgICByZXZpc2lvbnNDb3VudDogYCR7cmV2aXNpb25zU3RhdGUucmV2aXNpb25zLmxlbmd0aH1gLFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuXG4gICAgICAvLyBVcGRhdGUgdGhlIGFjdGl2ZSBmaWxlLCBpZiBjaGFuZ2VkLlxuICAgICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICAgIGlmICghZmlsZVBhdGggfHwgIXJlbG9hZEZpbGVEaWZmKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHtcbiAgICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgICAgcmV2aXNpb25JbmZvLFxuICAgICAgfSA9IGF3YWl0IHRoaXMuX2ZldGNoSGdEaWZmKGZpbGVQYXRoKTtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZTdGF0ZUlmQ2hhbmdlZChcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICAgIHJldmlzaW9uSW5mbyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWN0aXZhdGVGaWxlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBjb25zdCBhY3RpdmVTdWJzY3JpcHRpb25zID0gdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgLy8gVE9ETyhtb3N0KTogU2hvdyBwcm9ncmVzcyBpbmRpY2F0b3I6IHQ4OTkxNjc2XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICBjb25zdCB7ZmlsZX0gPSBidWZmZXI7XG4gICAgaWYgKGZpbGUgIT0gbnVsbCkge1xuICAgICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoZmlsZS5vbkRpZENoYW5nZShkZWJvdW5jZShcbiAgICAgICAgKCkgPT4gdGhpcy5fb25EaWRGaWxlQ2hhbmdlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKSxcbiAgICAgICAgRklMRV9DSEFOR0VfREVCT1VOQ0VfTVMsXG4gICAgICAgIGZhbHNlLFxuICAgICAgKSkpO1xuICAgIH1cbiAgICBhY3RpdmVTdWJzY3JpcHRpb25zLmFkZChidWZmZXIub25EaWRDaGFuZ2VNb2RpZmllZChcbiAgICAgIHRoaXMuX29uRGlkQnVmZmVyQ2hhbmdlTW9kaWZpZWQuYmluZCh0aGlzKSxcbiAgICApKTtcbiAgICB0cmFjaygnZGlmZi12aWV3LW9wZW4tZmlsZScsIHtmaWxlUGF0aH0pO1xuICAgIHRoaXMuX3VwZGF0ZUFjdGl2ZURpZmZTdGF0ZShmaWxlUGF0aCkuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5maWxlLWNoYW5nZS11cGRhdGUnKVxuICBhc3luYyBfb25EaWRGaWxlQ2hhbmdlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZS5maWxlUGF0aCAhPT0gZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmlsZXN5c3RlbUNvbnRlbnRzID0gYXdhaXQgZ2V0RmlsZVN5c3RlbUNvbnRlbnRzKGZpbGVQYXRoKTtcbiAgICBjb25zdCB7XG4gICAgICBvbGRDb250ZW50czogY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBjb21wYXJlUmV2aXNpb25JbmZvOiByZXZpc2lvbkluZm8sXG4gICAgfSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBpbnZhcmlhbnQocmV2aXNpb25JbmZvLCAnRGlmZiBWaWV3OiBSZXZpc2lvbiBpbmZvIG11c3QgYmUgZGVmaW5lZCB0byB1cGRhdGUgY2hhbmdlZCBzdGF0ZScpO1xuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZTdGF0ZUlmQ2hhbmdlZChcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgKTtcbiAgfVxuXG4gIF9vbkRpZEJ1ZmZlckNoYW5nZU1vZGlmaWVkKCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChBQ1RJVkVfQlVGRkVSX0NIQU5HRV9NT0RJRklFRF9FVkVOVCk7XG4gIH1cblxuICBvbkRpZEFjdGl2ZUJ1ZmZlckNoYW5nZU1vZGlmaWVkKFxuICAgIGNhbGxiYWNrOiAoKSA9PiBtaXhlZCxcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBpc0FjdGl2ZUJ1ZmZlck1vZGlmaWVkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICByZXR1cm4gYnVmZmVyLmlzTW9kaWZpZWQoKTtcbiAgfVxuXG4gIF91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29tbWl0dGVkQ29udGVudHM6IHN0cmluZyxcbiAgICBmaWxlc3lzdGVtQ29udGVudHM6IHN0cmluZyxcbiAgICByZXZpc2lvbkluZm86IFJldmlzaW9uSW5mbyxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge1xuICAgICAgZmlsZVBhdGg6IGFjdGl2ZUZpbGVQYXRoLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgIH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaWYgKGZpbGVQYXRoICE9PSBhY3RpdmVGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICBjb25zdCB1cGRhdGVkRGlmZlN0YXRlID0ge1xuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfTtcbiAgICBpZiAoc2F2ZWRDb250ZW50cyA9PT0gbmV3Q29udGVudHMgfHwgZmlsZXN5c3RlbUNvbnRlbnRzID09PSBuZXdDb250ZW50cykge1xuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShmaWxlUGF0aCwgdXBkYXRlZERpZmZTdGF0ZSk7XG4gICAgfVxuICAgIC8vIFRoZSB1c2VyIGhhdmUgZWRpdGVkIHNpbmNlIHRoZSBsYXN0IHVwZGF0ZS5cbiAgICBpZiAoZmlsZXN5c3RlbUNvbnRlbnRzID09PSBzYXZlZENvbnRlbnRzKSB7XG4gICAgICAvLyBUaGUgY2hhbmdlcyBoYXZlbid0IHRvdWNoZWQgdGhlIGZpbGVzeXN0ZW0sIGtlZXAgdXNlciBlZGl0cy5cbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICB7Li4udXBkYXRlZERpZmZTdGF0ZSwgZmlsZXN5c3RlbUNvbnRlbnRzOiBuZXdDb250ZW50c30sXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgY29tbWl0dGVkIGFuZCBmaWxlc3lzdGVtIHN0YXRlIGhhdmUgY2hhbmdlZCwgbm90aWZ5IG9mIG92ZXJyaWRlLlxuICAgICAgbm90aWZ5RmlsZXN5c3RlbU92ZXJyaWRlVXNlckVkaXRzKGZpbGVQYXRoKTtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGgsIHVwZGF0ZWREaWZmU3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIHNldE5ld0NvbnRlbnRzKG5ld0NvbnRlbnRzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoey4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSwgbmV3Q29udGVudHN9KTtcbiAgfVxuXG4gIHNldFJldmlzaW9uKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiB2b2lkIHtcbiAgICB0cmFjaygnZGlmZi12aWV3LXNldC1yZXZpc2lvbicpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaztcbiAgICBpbnZhcmlhbnQocmVwb3NpdG9yeVN0YWNrLCAnVGhlcmUgbXVzdCBiZSBhbiBhY3RpdmUgcmVwb3NpdG9yeSBzdGFjayEnKTtcbiAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUgPSB7Li4udGhpcy5fYWN0aXZlRmlsZVN0YXRlLCBjb21wYXJlUmV2aXNpb25JbmZvOiByZXZpc2lvbn07XG4gICAgcmVwb3NpdG9yeVN0YWNrLnNldFJldmlzaW9uKHJldmlzaW9uKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIGdldEFjdGl2ZUZpbGVTdGF0ZSgpOiBGaWxlQ2hhbmdlU3RhdGUge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQWN0aXZlRGlmZlN0YXRlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBoZ0RpZmZTdGF0ZSA9IGF3YWl0IHRoaXMuX2ZldGNoSGdEaWZmKGZpbGVQYXRoKTtcbiAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGgsIGhnRGlmZlN0YXRlKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGg6IE51Y2xpZGVVcmksIGhnRGlmZlN0YXRlOiBIZ0RpZmZTdGF0ZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzOiBvbGRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50czogbmV3Q29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfSA9IGhnRGlmZlN0YXRlO1xuICAgIGNvbnN0IHtoYXNoLCBib29rbWFya3N9ID0gcmV2aXNpb25JbmZvO1xuICAgIGNvbnN0IG5ld0ZpbGVTdGF0ZSA9IHtcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgb2xkQ29udGVudHMsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHM6IG5ld0NvbnRlbnRzLFxuICAgICAgY29tcGFyZVJldmlzaW9uSW5mbzogcmV2aXNpb25JbmZvLFxuICAgICAgZnJvbVJldmlzaW9uVGl0bGU6IGAke2hhc2h9YCArIChib29rbWFya3MubGVuZ3RoID09PSAwID8gJycgOiBgIC0gKCR7Ym9va21hcmtzLmpvaW4oJywgJyl9KWApLFxuICAgICAgdG9SZXZpc2lvblRpdGxlOiAnRmlsZXN5c3RlbSAvIEVkaXRvcicsXG4gICAgfTtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUobmV3RmlsZVN0YXRlKTtcbiAgICAvLyBUT0RPKG1vc3QpOiBGaXg6IHRoaXMgYXNzdW1lcyB0aGF0IHRoZSBlZGl0b3IgY29udGVudHMgYXJlbid0IGNoYW5nZWQgd2hpbGVcbiAgICAvLyBmZXRjaGluZyB0aGUgY29tbWVudHMsIHRoYXQncyBva2F5IG5vdyBiZWNhdXNlIHdlIGRvbid0IGZldGNoIHRoZW0uXG4gICAgY29uc3QgaW5saW5lQ29tcG9uZW50cyA9IGF3YWl0IHRoaXMuX2ZldGNoSW5saW5lQ29tcG9uZW50cygpO1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZSh7Li4ubmV3RmlsZVN0YXRlLCBpbmxpbmVDb21wb25lbnRzfSk7XG4gIH1cblxuICBfc2V0QWN0aXZlRmlsZVN0YXRlKHN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLl9kZWJvdW5jZWRFbWl0QWN0aXZlRmlsZVVwZGF0ZSgpO1xuICB9XG5cbiAgX2VtaXRBY3RpdmVGaWxlVXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQsIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5oZy1zdGF0ZS11cGRhdGUnKVxuICBhc3luYyBfZmV0Y2hIZ0RpZmYoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPEhnRGlmZlN0YXRlPiB7XG4gICAgLy8gQ2FsbGluZyBhdG9tLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeSBnZXRzIHRoZSByZWFsIHBhdGggb2YgdGhlIGRpcmVjdG9yeSxcbiAgICAvLyB3aGljaCBpcyBhbm90aGVyIHJvdW5kLXRyaXAgYW5kIGNhbGxzIHRoZSByZXBvc2l0b3J5IHByb3ZpZGVycyB0byBnZXQgYW4gZXhpc3RpbmcgcmVwb3NpdG9yeS5cbiAgICAvLyBJbnN0ZWFkLCB0aGUgZmlyc3QgbWF0Y2ggb2YgdGhlIGZpbHRlcmluZyBoZXJlIGlzIHRoZSBvbmx5IHBvc3NpYmxlIG1hdGNoLlxuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aCk7XG4gICAgaWYgKHJlcG9zaXRvcnkgPT0gbnVsbCB8fCByZXBvc2l0b3J5LmdldFR5cGUoKSAhPT0gJ2hnJykge1xuICAgICAgY29uc3QgdHlwZSA9IHJlcG9zaXRvcnkgPyByZXBvc2l0b3J5LmdldFR5cGUoKSA6ICdubyByZXBvc2l0b3J5JztcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRGlmZiB2aWV3IG9ubHkgc3VwcG9ydHMgXFxgTWVyY3VyaWFsXFxgIHJlcG9zaXRvcmllcywgYnV0IGZvdW5kIFxcYCR7dHlwZX1cXGBgKTtcbiAgICB9XG5cbiAgICBjb25zdCBoZ1JlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCA9IChyZXBvc2l0b3J5OiBhbnkpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuZ2V0KGhnUmVwb3NpdG9yeSk7XG4gICAgaW52YXJpYW50KHJlcG9zaXRvcnlTdGFjaywgJ1RoZXJlIG11c3QgYmUgYW4gcmVwb3NpdG9yeSBzdGFjayBmb3IgYSBnaXZlbiByZXBvc2l0b3J5IScpO1xuICAgIGNvbnN0IFtoZ0RpZmZdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmZldGNoSGdEaWZmKGZpbGVQYXRoKSxcbiAgICAgIHRoaXMuX3NldEFjdGl2ZVJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5U3RhY2spLFxuICAgIF0pO1xuICAgIHJldHVybiBoZ0RpZmY7XG4gIH1cblxuICBhc3luYyBfc2V0QWN0aXZlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnlTdGFjazogUmVwb3NpdG9yeVN0YWNrKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PT0gcmVwb3NpdG9yeVN0YWNrKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9IHJlcG9zaXRvcnlTdGFjaztcbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZSA9IGF3YWl0IHJlcG9zaXRvcnlTdGFjay5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICB0aGlzLl91cGRhdGVDaGFuZ2VkUmV2aXNpb25zKHJlcG9zaXRvcnlTdGFjaywgcmV2aXNpb25zU3RhdGUsIGZhbHNlKTtcbiAgfVxuXG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuc2F2ZS1maWxlJylcbiAgYXN5bmMgc2F2ZUFjdGl2ZUZpbGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICB0cmFjaygnZGlmZi12aWV3LXNhdmUtZmlsZScsIHtmaWxlUGF0aH0pO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUuc2F2ZWRDb250ZW50cyA9IGF3YWl0IHRoaXMuX3NhdmVGaWxlKGZpbGVQYXRoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbm90aWZ5SW50ZXJuYWxFcnJvcihlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3NhdmVGaWxlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIGlmIChidWZmZXIgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBmaWxlIGJ1ZmZlciB0byBzYXZlOiBcXGAke2ZpbGVQYXRofVxcYGApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYnVmZmVyLnNhdmUoKTtcbiAgICAgIHJldHVybiBidWZmZXIuZ2V0VGV4dCgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3Qgc2F2ZSBmaWxlIGJ1ZmZlcjogXFxgJHtmaWxlUGF0aH1cXGAgLSAke2Vyci50b1N0cmluZygpfWApO1xuICAgIH1cbiAgfVxuXG4gIG9uRGlkQ2hhbmdlRGlydHlTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChkaXJ0eUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPikgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX0RJUlRZX1NUQVRVU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VDb21wYXJlU3RhdHVzKFxuICAgIGNhbGxiYWNrOiAoY29tcGFyZUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPikgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvblJldmlzaW9uc1VwZGF0ZShjYWxsYmFjazogKHN0YXRlOiA/UmV2aXNpb25zU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25BY3RpdmVGaWxlVXBkYXRlcyhjYWxsYmFjazogKHN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1jb21tZW50cycpXG4gIGFzeW5jIF9mZXRjaElubGluZUNvbXBvbmVudHMoKTogUHJvbWlzZTxBcnJheTxPYmplY3Q+PiB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBjb25zdCB1aUVsZW1lbnRQcm9taXNlcyA9IHRoaXMuX3VpUHJvdmlkZXJzLm1hcChcbiAgICAgIHByb3ZpZGVyID0+IHByb3ZpZGVyLmNvbXBvc2VVaUVsZW1lbnRzKGZpbGVQYXRoKVxuICAgICk7XG4gICAgY29uc3QgdWlDb21wb25lbnRMaXN0cyA9IGF3YWl0IFByb21pc2UuYWxsKHVpRWxlbWVudFByb21pc2VzKTtcbiAgICAvLyBGbGF0dGVuIHVpQ29tcG9uZW50TGlzdHMgZnJvbSBsaXN0IG9mIGxpc3RzIG9mIGNvbXBvbmVudHMgdG8gYSBsaXN0IG9mIGNvbXBvbmVudHMuXG4gICAgY29uc3QgdWlDb21wb25lbnRzID0gW10uY29uY2F0LmFwcGx5KFtdLCB1aUNvbXBvbmVudExpc3RzKTtcbiAgICByZXR1cm4gdWlDb21wb25lbnRzO1xuICB9XG5cbiAgZ2V0RGlydHlGaWxlQ2hhbmdlcygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXM7XG4gIH1cblxuICBnZXRDb21wYXJlRmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXM7XG4gIH1cblxuICBhc3luYyBnZXRBY3RpdmVSZXZpc2lvbnNTdGF0ZSgpOiBQcm9taXNlPD9SZXZpc2lvbnNTdGF0ZT4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2suZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVSZXBvc2l0b3JpZXMoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5U3RhY2sgb2YgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmFjdGl2YXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmRlYWN0aXZhdGUoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZShnZXRJbml0aWFsRmlsZUNoYW5nZVN0YXRlKCkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnlTdGFjayBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmNsZWFyKCk7XG4gICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2YgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmNsZWFyKCk7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIGlmICh0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlZpZXdNb2RlbDtcbiJdfQ==