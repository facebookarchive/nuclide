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
    key: 'getActiveRepositoryLatestCommitMessage',
    value: _asyncToGenerator(function* () {
      if (this._activeRepositoryStack == null) {
        throw new Error('Diff View: No active file or repository open');
      }
      var revisionsState = yield this.getActiveRevisionsState();
      (0, _assert2['default'])(revisionsState, 'Diff View Internal Error: revisionsState cannot be null');
      var revisions = revisionsState.revisions;

      (0, _assert2['default'])(revisions.length > 0, 'Diff View Error: Cannot amend non-existing commit');
      return revisions[revisions.length - 1].description;
    })
  }, {
    key: 'getActiveRepositoryTemplateCommitMessage',
    value: function getActiveRepositoryTemplateCommitMessage() {
      if (this._activeRepositoryStack == null) {
        throw new Error('Diff View: No active file or repository open');
      }
      return this._activeRepositoryStack.getTemplateCommitMessage();
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
//# sourceMappingURL=data:application/json;base64,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LENBQUM7S0FDdkQ7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixXQUFLLElBQU0sZUFBZSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUM3RCx1QkFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQzNCO0FBQ0QsVUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9CLFdBQUssSUFBTSxZQUFZLElBQUksSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQ2pFLG9CQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDeEI7QUFDRCxVQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEMsVUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9CLFVBQUksSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksRUFBRTtBQUNyQyxZQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDcEMsWUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztPQUNsQztLQUNGOzs7U0EvYUcsYUFBYTs7O0FBa2JuQixNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJEaWZmVmlld01vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0ZSwgUmV2aXNpb25zU3RhdGUsIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSwgSGdEaWZmU3RhdGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vaGctZ2l0LWJyaWRnZSc7XG5pbXBvcnQge3RyYWNrLCB0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7Z2V0RmlsZVN5c3RlbUNvbnRlbnRzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7YXJyYXksIG1hcCwgZGVib3VuY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IFJlcG9zaXRvcnlTdGFjayBmcm9tICcuL1JlcG9zaXRvcnlTdGFjayc7XG5pbXBvcnQge1xuICBub3RpZnlJbnRlcm5hbEVycm9yLFxuICBub3RpZnlGaWxlc3lzdGVtT3ZlcnJpZGVVc2VyRWRpdHMsXG59IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XG5pbXBvcnQge2J1ZmZlckZvclVyaX0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcblxuY29uc3QgQ0hBTkdFX0RJUlRZX1NUQVRVU19FVkVOVCA9ICdkaWQtY2hhbmdlLWRpcnR5LXN0YXR1cyc7XG5jb25zdCBDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQgPSAnZGlkLWNoYW5nZS1jb21wYXJlLXN0YXR1cyc7XG5jb25zdCBBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQgPSAnYWN0aXZlLWZpbGUtdXBkYXRlJztcbmNvbnN0IENIQU5HRV9SRVZJU0lPTlNfRVZFTlQgPSAnZGlkLWNoYW5nZS1yZXZpc2lvbnMnO1xuY29uc3QgQUNUSVZFX0JVRkZFUl9DSEFOR0VfTU9ESUZJRURfRVZFTlQgPSAnYWN0aXZlLWJ1ZmZlci1jaGFuZ2UtbW9kaWZpZWQnO1xuXG5jb25zdCBGSUxFX0NIQU5HRV9ERUJPVU5DRV9NUyA9IDIwMDtcbmNvbnN0IFVJX0NIQU5HRV9ERUJPVU5DRV9NUyA9IDEwMDtcblxuZnVuY3Rpb24gZ2V0SW5pdGlhbEZpbGVDaGFuZ2VTdGF0ZSgpOiBGaWxlQ2hhbmdlU3RhdGUge1xuICByZXR1cm4ge1xuICAgIGZyb21SZXZpc2lvblRpdGxlOiAnTm8gZmlsZSBzZWxlY3RlZCcsXG4gICAgdG9SZXZpc2lvblRpdGxlOiAnTm8gZmlsZSBzZWxlY3RlZCcsXG4gICAgZmlsZVBhdGg6ICcnLFxuICAgIG9sZENvbnRlbnRzOiAnJyxcbiAgICBuZXdDb250ZW50czogJycsXG4gICAgY29tcGFyZVJldmlzaW9uSW5mbzogbnVsbCxcbiAgfTtcbn1cblxuY2xhc3MgRGlmZlZpZXdNb2RlbCB7XG5cbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYWN0aXZlU3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9hY3RpdmVGaWxlU3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZTtcbiAgX2FjdGl2ZVJlcG9zaXRvcnlTdGFjazogP1JlcG9zaXRvcnlTdGFjaztcbiAgX25ld0VkaXRvcjogP1RleHRFZGl0b3I7XG4gIF9kaXJ0eUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgX2NvbXBhcmVGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF91aVByb3ZpZGVyczogQXJyYXk8T2JqZWN0PjtcbiAgX3JlcG9zaXRvcnlTdGFja3M6IE1hcDxIZ1JlcG9zaXRvcnlDbGllbnQsIFJlcG9zaXRvcnlTdGFjaz47XG4gIF9yZXBvc2l0b3J5U3Vic2NyaXB0aW9uczogTWFwPEhnUmVwb3NpdG9yeUNsaWVudCwgQ29tcG9zaXRlRGlzcG9zYWJsZT47XG4gIF9pc0FjdGl2ZTogYm9vbGVhbjtcbiAgX2RlYm91bmNlZEVtaXRBY3RpdmVGaWxlVXBkYXRlOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHVpUHJvdmlkZXJzOiBBcnJheTxPYmplY3Q+KSB7XG4gICAgdGhpcy5fdWlQcm92aWRlcnMgPSB1aVByb3ZpZGVycztcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fdXBkYXRlUmVwb3NpdG9yaWVzKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHModGhpcy5fdXBkYXRlUmVwb3NpdG9yaWVzLmJpbmQodGhpcykpKTtcbiAgICB0aGlzLl9kZWJvdW5jZWRFbWl0QWN0aXZlRmlsZVVwZGF0ZSA9IGRlYm91bmNlKFxuICAgICAgdGhpcy5fZW1pdEFjdGl2ZUZpbGVVcGRhdGUuYmluZCh0aGlzKSxcbiAgICAgIFVJX0NIQU5HRV9ERUJPVU5DRV9NUyxcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKGdldEluaXRpYWxGaWxlQ2hhbmdlU3RhdGUoKSk7XG4gIH1cblxuICBfdXBkYXRlUmVwb3NpdG9yaWVzKCk6IHZvaWQge1xuICAgIGNvbnN0IHJlcG9zaXRvcmllcyA9IG5ldyBTZXQoXG4gICAgICBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKCkuZmlsdGVyKFxuICAgICAgICByZXBvc2l0b3J5ID0+IHJlcG9zaXRvcnkgIT0gbnVsbCAmJiByZXBvc2l0b3J5LmdldFR5cGUoKSA9PT0gJ2hnJ1xuICAgICAgKVxuICAgICk7XG4gICAgLy8gRGlzcG9zZSByZW1vdmVkIHByb2plY3RzIHJlcG9zaXRvcmllcy5cbiAgICBmb3IgKGNvbnN0IFtyZXBvc2l0b3J5LCByZXBvc2l0b3J5U3RhY2tdIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MpIHtcbiAgICAgIGlmIChyZXBvc2l0b3JpZXMuaGFzKHJlcG9zaXRvcnkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgcmVwb3NpdG9yeVN0YWNrLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmdldChyZXBvc2l0b3J5KTtcbiAgICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgcmVwb3NpdG9yeSBvZiByZXBvc2l0b3JpZXMpIHtcbiAgICAgIGlmICh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmhhcyhyZXBvc2l0b3J5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9ICgocmVwb3NpdG9yeTogYW55KTogSGdSZXBvc2l0b3J5Q2xpZW50KTtcbiAgICAgIHRoaXMuX2NyZWF0ZVJlcG9zaXRvcnlTdGFjayhoZ1JlcG9zaXRvcnkpO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cygpO1xuICB9XG5cbiAgX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldERpcnR5RmlsZUNoYW5nZXMoKSlcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5ULCB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIF9jcmVhdGVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50KTogUmVwb3NpdG9yeVN0YWNrIHtcbiAgICBjb25zdCByZXBvc2l0b3J5U3RhY2sgPSBuZXcgUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnkpO1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlRGlydHlTdGF0dXModGhpcy5fdXBkYXRlRGlydHlDaGFuZ2VkU3RhdHVzLmJpbmQodGhpcykpLFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyh0aGlzLl91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cy5iaW5kKHRoaXMpKSxcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZENoYW5nZVJldmlzaW9ucyhyZXZpc2lvbnNTdGF0ZSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMocmVwb3NpdG9yeVN0YWNrLCByZXZpc2lvbnNTdGF0ZSwgdHJ1ZSlcbiAgICAgICAgICAuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gICAgICB9KSxcbiAgICApO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3Muc2V0KHJlcG9zaXRvcnksIHJlcG9zaXRvcnlTdGFjayk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuc2V0KHJlcG9zaXRvcnksIHN1YnNjcmlwdGlvbnMpO1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmFjdGl2YXRlKCk7XG4gICAgfVxuICAgIHJldHVybiByZXBvc2l0b3J5U3RhY2s7XG4gIH1cblxuICBfdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMoKTogdm9pZCB7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldENvbXBhcmVGaWxlQ2hhbmdlcygpKVxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVDaGFuZ2VkUmV2aXNpb25zKFxuICAgIHJlcG9zaXRvcnlTdGFjazogUmVwb3NpdG9yeVN0YWNrLFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgICByZWxvYWRGaWxlRGlmZjogYm9vbGVhbixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHJlcG9zaXRvcnlTdGFjayA9PT0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrKSB7XG4gICAgICB0cmFjaygnZGlmZi12aWV3LXVwZGF0ZS10aW1lbGluZS1yZXZpc2lvbnMnLCB7XG4gICAgICAgIHJldmlzaW9uc0NvdW50OiBgJHtyZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMubGVuZ3RofWAsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgYWN0aXZlIGZpbGUsIGlmIGNoYW5nZWQuXG4gICAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgICAgaWYgKCFmaWxlUGF0aCB8fCAhcmVsb2FkRmlsZURpZmYpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3Qge1xuICAgICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgICByZXZpc2lvbkluZm8sXG4gICAgICB9ID0gYXdhaXQgdGhpcy5fZmV0Y2hIZ0RpZmYoZmlsZVBhdGgpO1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgICAgcmV2aXNpb25JbmZvLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBhY3RpdmF0ZUZpbGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGNvbnN0IGFjdGl2ZVN1YnNjcmlwdGlvbnMgPSB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAvLyBUT0RPKG1vc3QpOiBTaG93IHByb2dyZXNzIGluZGljYXRvcjogdDg5OTE2NzZcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHtmaWxlfSA9IGJ1ZmZlcjtcbiAgICBpZiAoZmlsZSAhPSBudWxsKSB7XG4gICAgICBhY3RpdmVTdWJzY3JpcHRpb25zLmFkZChmaWxlLm9uRGlkQ2hhbmdlKGRlYm91bmNlKFxuICAgICAgICAoKSA9PiB0aGlzLl9vbkRpZEZpbGVDaGFuZ2UoZmlsZVBhdGgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpLFxuICAgICAgICBGSUxFX0NIQU5HRV9ERUJPVU5DRV9NUyxcbiAgICAgICAgZmFsc2UsXG4gICAgICApKSk7XG4gICAgfVxuICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMuYWRkKGJ1ZmZlci5vbkRpZENoYW5nZU1vZGlmaWVkKFxuICAgICAgdGhpcy5fb25EaWRCdWZmZXJDaGFuZ2VNb2RpZmllZC5iaW5kKHRoaXMpLFxuICAgICkpO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctb3Blbi1maWxlJywge2ZpbGVQYXRofSk7XG4gICAgdGhpcy5fdXBkYXRlQWN0aXZlRGlmZlN0YXRlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZpbGUtY2hhbmdlLXVwZGF0ZScpXG4gIGFzeW5jIF9vbkRpZEZpbGVDaGFuZ2UoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlRmlsZVN0YXRlLmZpbGVQYXRoICE9PSBmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaWxlc3lzdGVtQ29udGVudHMgPSBhd2FpdCBnZXRGaWxlU3lzdGVtQ29udGVudHMoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHtcbiAgICAgIG9sZENvbnRlbnRzOiBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGNvbXBhcmVSZXZpc2lvbkluZm86IHJldmlzaW9uSW5mbyxcbiAgICB9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGludmFyaWFudChyZXZpc2lvbkluZm8sICdEaWZmIFZpZXc6IFJldmlzaW9uIGluZm8gbXVzdCBiZSBkZWZpbmVkIHRvIHVwZGF0ZSBjaGFuZ2VkIHN0YXRlJyk7XG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICApO1xuICB9XG5cbiAgX29uRGlkQnVmZmVyQ2hhbmdlTW9kaWZpZWQoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5UKTtcbiAgfVxuXG4gIG9uRGlkQWN0aXZlQnVmZmVyQ2hhbmdlTW9kaWZpZWQoXG4gICAgY2FsbGJhY2s6ICgpID0+IG1peGVkLFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQUNUSVZFX0JVRkZFUl9DSEFOR0VfTU9ESUZJRURfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGlzQWN0aXZlQnVmZmVyTW9kaWZpZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIHJldHVybiBidWZmZXIuaXNNb2RpZmllZCgpO1xuICB9XG5cbiAgX3VwZGF0ZURpZmZTdGF0ZUlmQ2hhbmdlZChcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb21taXR0ZWRDb250ZW50czogc3RyaW5nLFxuICAgIGZpbGVzeXN0ZW1Db250ZW50czogc3RyaW5nLFxuICAgIHJldmlzaW9uSW5mbzogUmV2aXNpb25JbmZvLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7XG4gICAgICBmaWxlUGF0aDogYWN0aXZlRmlsZVBhdGgsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgfSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBpZiAoZmlsZVBhdGggIT09IGFjdGl2ZUZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIGNvbnN0IHVwZGF0ZWREaWZmU3RhdGUgPSB7XG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICB9O1xuICAgIGlmIChzYXZlZENvbnRlbnRzID09PSBuZXdDb250ZW50cyB8fCBmaWxlc3lzdGVtQ29udGVudHMgPT09IG5ld0NvbnRlbnRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKGZpbGVQYXRoLCB1cGRhdGVkRGlmZlN0YXRlKTtcbiAgICB9XG4gICAgLy8gVGhlIHVzZXIgaGF2ZSBlZGl0ZWQgc2luY2UgdGhlIGxhc3QgdXBkYXRlLlxuICAgIGlmIChmaWxlc3lzdGVtQ29udGVudHMgPT09IHNhdmVkQ29udGVudHMpIHtcbiAgICAgIC8vIFRoZSBjaGFuZ2VzIGhhdmVuJ3QgdG91Y2hlZCB0aGUgZmlsZXN5c3RlbSwga2VlcCB1c2VyIGVkaXRzLlxuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIHsuLi51cGRhdGVkRGlmZlN0YXRlLCBmaWxlc3lzdGVtQ29udGVudHM6IG5ld0NvbnRlbnRzfSxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBjb21taXR0ZWQgYW5kIGZpbGVzeXN0ZW0gc3RhdGUgaGF2ZSBjaGFuZ2VkLCBub3RpZnkgb2Ygb3ZlcnJpZGUuXG4gICAgICBub3RpZnlGaWxlc3lzdGVtT3ZlcnJpZGVVc2VyRWRpdHMoZmlsZVBhdGgpO1xuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShmaWxlUGF0aCwgdXBkYXRlZERpZmZTdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgc2V0TmV3Q29udGVudHMobmV3Q29udGVudHM6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZSh7Li4udGhpcy5fYWN0aXZlRmlsZVN0YXRlLCBuZXdDb250ZW50c30pO1xuICB9XG5cbiAgc2V0UmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IHZvaWQge1xuICAgIHRyYWNrKCdkaWZmLXZpZXctc2V0LXJldmlzaW9uJyk7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrO1xuICAgIGludmFyaWFudChyZXBvc2l0b3J5U3RhY2ssICdUaGVyZSBtdXN0IGJlIGFuIGFjdGl2ZSByZXBvc2l0b3J5IHN0YWNrIScpO1xuICAgIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSA9IHsuLi50aGlzLl9hY3RpdmVGaWxlU3RhdGUsIGNvbXBhcmVSZXZpc2lvbkluZm86IHJldmlzaW9ufTtcbiAgICByZXBvc2l0b3J5U3RhY2suc2V0UmV2aXNpb24ocmV2aXNpb24pLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICB9XG5cbiAgZ2V0QWN0aXZlRmlsZVN0YXRlKCk6IEZpbGVDaGFuZ2VTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVBY3RpdmVEaWZmU3RhdGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGhnRGlmZlN0YXRlID0gYXdhaXQgdGhpcy5fZmV0Y2hIZ0RpZmYoZmlsZVBhdGgpO1xuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShmaWxlUGF0aCwgaGdEaWZmU3RhdGUpO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZURpZmZTdGF0ZShmaWxlUGF0aDogTnVjbGlkZVVyaSwgaGdEaWZmU3RhdGU6IEhnRGlmZlN0YXRlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge1xuICAgICAgY29tbWl0dGVkQ29udGVudHM6IG9sZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzOiBuZXdDb250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICB9ID0gaGdEaWZmU3RhdGU7XG4gICAgY29uc3Qge2hhc2gsIGJvb2ttYXJrc30gPSByZXZpc2lvbkluZm87XG4gICAgY29uc3QgbmV3RmlsZVN0YXRlID0ge1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRDb250ZW50cyxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50czogbmV3Q29udGVudHMsXG4gICAgICBjb21wYXJlUmV2aXNpb25JbmZvOiByZXZpc2lvbkluZm8sXG4gICAgICBmcm9tUmV2aXNpb25UaXRsZTogYCR7aGFzaH1gICsgKGJvb2ttYXJrcy5sZW5ndGggPT09IDAgPyAnJyA6IGAgLSAoJHtib29rbWFya3Muam9pbignLCAnKX0pYCksXG4gICAgICB0b1JldmlzaW9uVGl0bGU6ICdGaWxlc3lzdGVtIC8gRWRpdG9yJyxcbiAgICB9O1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZShuZXdGaWxlU3RhdGUpO1xuICAgIC8vIFRPRE8obW9zdCk6IEZpeDogdGhpcyBhc3N1bWVzIHRoYXQgdGhlIGVkaXRvciBjb250ZW50cyBhcmVuJ3QgY2hhbmdlZCB3aGlsZVxuICAgIC8vIGZldGNoaW5nIHRoZSBjb21tZW50cywgdGhhdCdzIG9rYXkgbm93IGJlY2F1c2Ugd2UgZG9uJ3QgZmV0Y2ggdGhlbS5cbiAgICBjb25zdCBpbmxpbmVDb21wb25lbnRzID0gYXdhaXQgdGhpcy5fZmV0Y2hJbmxpbmVDb21wb25lbnRzKCk7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHsuLi5uZXdGaWxlU3RhdGUsIGlubGluZUNvbXBvbmVudHN9KTtcbiAgfVxuXG4gIF9zZXRBY3RpdmVGaWxlU3RhdGUoc3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuX2RlYm91bmNlZEVtaXRBY3RpdmVGaWxlVXBkYXRlKCk7XG4gIH1cblxuICBfZW1pdEFjdGl2ZUZpbGVVcGRhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KEFDVElWRV9GSUxFX1VQREFURV9FVkVOVCwgdGhpcy5fYWN0aXZlRmlsZVN0YXRlKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmhnLXN0YXRlLXVwZGF0ZScpXG4gIGFzeW5jIF9mZXRjaEhnRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8SGdEaWZmU3RhdGU+IHtcbiAgICAvLyBDYWxsaW5nIGF0b20ucHJvamVjdC5yZXBvc2l0b3J5Rm9yRGlyZWN0b3J5IGdldHMgdGhlIHJlYWwgcGF0aCBvZiB0aGUgZGlyZWN0b3J5LFxuICAgIC8vIHdoaWNoIGlzIGFub3RoZXIgcm91bmQtdHJpcCBhbmQgY2FsbHMgdGhlIHJlcG9zaXRvcnkgcHJvdmlkZXJzIHRvIGdldCBhbiBleGlzdGluZyByZXBvc2l0b3J5LlxuICAgIC8vIEluc3RlYWQsIHRoZSBmaXJzdCBtYXRjaCBvZiB0aGUgZmlsdGVyaW5nIGhlcmUgaXMgdGhlIG9ubHkgcG9zc2libGUgbWF0Y2guXG4gICAgY29uc3QgcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnlGb3JQYXRoKGZpbGVQYXRoKTtcbiAgICBpZiAocmVwb3NpdG9yeSA9PSBudWxsIHx8IHJlcG9zaXRvcnkuZ2V0VHlwZSgpICE9PSAnaGcnKSB7XG4gICAgICBjb25zdCB0eXBlID0gcmVwb3NpdG9yeSA/IHJlcG9zaXRvcnkuZ2V0VHlwZSgpIDogJ25vIHJlcG9zaXRvcnknO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaWZmIHZpZXcgb25seSBzdXBwb3J0cyBcXGBNZXJjdXJpYWxcXGAgcmVwb3NpdG9yaWVzLCBidXQgZm91bmQgXFxgJHt0eXBlfVxcYGApO1xuICAgIH1cblxuICAgIGNvbnN0IGhnUmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50ID0gKHJlcG9zaXRvcnk6IGFueSk7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5nZXQoaGdSZXBvc2l0b3J5KTtcbiAgICBpbnZhcmlhbnQocmVwb3NpdG9yeVN0YWNrLCAnVGhlcmUgbXVzdCBiZSBhbiByZXBvc2l0b3J5IHN0YWNrIGZvciBhIGdpdmVuIHJlcG9zaXRvcnkhJyk7XG4gICAgY29uc3QgW2hnRGlmZl0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICByZXBvc2l0b3J5U3RhY2suZmV0Y2hIZ0RpZmYoZmlsZVBhdGgpLFxuICAgICAgdGhpcy5fc2V0QWN0aXZlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnlTdGFjayksXG4gICAgXSk7XG4gICAgcmV0dXJuIGhnRGlmZjtcbiAgfVxuXG4gIGFzeW5jIF9zZXRBY3RpdmVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeVN0YWNrOiBSZXBvc2l0b3J5U3RhY2spOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09PSByZXBvc2l0b3J5U3RhY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID0gcmVwb3NpdG9yeVN0YWNrO1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgcmVwb3NpdG9yeVN0YWNrLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIHRoaXMuX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMocmVwb3NpdG9yeVN0YWNrLCByZXZpc2lvbnNTdGF0ZSwgZmFsc2UpO1xuICB9XG5cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5zYXZlLWZpbGUnKVxuICBhc3luYyBzYXZlQWN0aXZlRmlsZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctc2F2ZS1maWxlJywge2ZpbGVQYXRofSk7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZS5zYXZlZENvbnRlbnRzID0gYXdhaXQgdGhpcy5fc2F2ZUZpbGUoZmlsZVBhdGgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfc2F2ZUZpbGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGJ1ZmZlckZvclVyaShmaWxlUGF0aCk7XG4gICAgaWYgKGJ1ZmZlciA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGZpbGUgYnVmZmVyIHRvIHNhdmU6IFxcYCR7ZmlsZVBhdGh9XFxgYCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBidWZmZXIuc2F2ZSgpO1xuICAgICAgcmV0dXJuIGJ1ZmZlci5nZXRUZXh0KCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBzYXZlIGZpbGUgYnVmZmVyOiBcXGAke2ZpbGVQYXRofVxcYCAtICR7ZXJyLnRvU3RyaW5nKCl9YCk7XG4gICAgfVxuICB9XG5cbiAgb25EaWRDaGFuZ2VEaXJ0eVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGRpcnR5RmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+KSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZUNvbXBhcmVTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChjb21wYXJlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+KSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uUmV2aXNpb25zVXBkYXRlKGNhbGxiYWNrOiAoc3RhdGU6ID9SZXZpc2lvbnNTdGF0ZSkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkFjdGl2ZUZpbGVVcGRhdGVzKGNhbGxiYWNrOiAoc3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZldGNoLWNvbW1lbnRzJylcbiAgYXN5bmMgX2ZldGNoSW5saW5lQ29tcG9uZW50cygpOiBQcm9taXNlPEFycmF5PE9iamVjdD4+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGNvbnN0IHVpRWxlbWVudFByb21pc2VzID0gdGhpcy5fdWlQcm92aWRlcnMubWFwKFxuICAgICAgcHJvdmlkZXIgPT4gcHJvdmlkZXIuY29tcG9zZVVpRWxlbWVudHMoZmlsZVBhdGgpXG4gICAgKTtcbiAgICBjb25zdCB1aUNvbXBvbmVudExpc3RzID0gYXdhaXQgUHJvbWlzZS5hbGwodWlFbGVtZW50UHJvbWlzZXMpO1xuICAgIC8vIEZsYXR0ZW4gdWlDb21wb25lbnRMaXN0cyBmcm9tIGxpc3Qgb2YgbGlzdHMgb2YgY29tcG9uZW50cyB0byBhIGxpc3Qgb2YgY29tcG9uZW50cy5cbiAgICBjb25zdCB1aUNvbXBvbmVudHMgPSBbXS5jb25jYXQuYXBwbHkoW10sIHVpQ29tcG9uZW50TGlzdHMpO1xuICAgIHJldHVybiB1aUNvbXBvbmVudHM7XG4gIH1cblxuICBnZXREaXJ0eUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fZGlydHlGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGdldENvbXBhcmVGaWxlQ2hhbmdlcygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGFzeW5jIGdldEFjdGl2ZVJlcG9zaXRvcnlMYXRlc3RDb21taXRNZXNzYWdlKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZmYgVmlldzogTm8gYWN0aXZlIGZpbGUgb3IgcmVwb3NpdG9yeSBvcGVuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRBY3RpdmVSZXZpc2lvbnNTdGF0ZSgpO1xuICAgIGludmFyaWFudChyZXZpc2lvbnNTdGF0ZSwgJ0RpZmYgVmlldyBJbnRlcm5hbCBFcnJvcjogcmV2aXNpb25zU3RhdGUgY2Fubm90IGJlIG51bGwnKTtcbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIGludmFyaWFudChyZXZpc2lvbnMubGVuZ3RoID4gMCwgJ0RpZmYgVmlldyBFcnJvcjogQ2Fubm90IGFtZW5kIG5vbi1leGlzdGluZyBjb21taXQnKTtcbiAgICByZXR1cm4gcmV2aXNpb25zW3JldmlzaW9ucy5sZW5ndGggLSAxXS5kZXNjcmlwdGlvbjtcbiAgfVxuXG4gIGdldEFjdGl2ZVJlcG9zaXRvcnlUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGlmZiBWaWV3OiBObyBhY3RpdmUgZmlsZSBvciByZXBvc2l0b3J5IG9wZW4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgfVxuXG4gIGFzeW5jIGdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCk6IFByb21pc2U8P1JldmlzaW9uc1N0YXRlPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcygpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnlTdGFjayBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suYWN0aXZhdGUoKTtcbiAgICB9XG4gIH1cblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2suZGVhY3RpdmF0ZSgpO1xuICAgICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKGdldEluaXRpYWxGaWxlQ2hhbmdlU3RhdGUoKSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIGZvciAoY29uc3QgcmVwb3NpdG9yeVN0YWNrIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpIHtcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuY2xlYXIoKTtcbiAgICBmb3IgKGNvbnN0IHN1YnNjcmlwdGlvbiBvZiB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuY2xlYXIoKTtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld01vZGVsO1xuIl19