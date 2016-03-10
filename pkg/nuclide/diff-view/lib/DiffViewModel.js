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

var _constants = require('./constants');

var _hgGitBridge = require('../../hg-git-bridge');

var _analytics = require('../../analytics');

var _utils = require('./utils');

var _commons = require('../../commons');

var _RepositoryStack = require('./RepositoryStack');

var _RepositoryStack2 = _interopRequireDefault(_RepositoryStack);

var _notifications = require('./notifications');

var _atomHelpers = require('../../atom-helpers');

var ACTIVE_FILE_UPDATE_EVENT = 'active-file-update';
var CHANGE_REVISIONS_EVENT = 'did-change-revisions';
var ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT = 'active-buffer-change-modified';
var DID_UPDATE_STATE_EVENT = 'did-update-state';
var UPDATE_REVISION_TEMPLATE = '';

var FILE_CHANGE_DEBOUNCE_MS = 200;

// Returns a string with all newline strings, '\\n', converted to literal newlines, '\n'.
function convertNewlines(message) {
  return message.replace(/\\n/g, '\n');
}

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
    this._emitter = new _atom.Emitter();
    this._subscriptions = new _atom.CompositeDisposable();
    this._repositoryStacks = new Map();
    this._repositorySubscriptions = new Map();
    this._isActive = false;
    this._state = {
      viewMode: _constants.DiffMode.BROWSE_MODE,
      commitMessage: null,
      commitMode: _constants.CommitMode.COMMIT,
      commitModeState: _constants.CommitModeState.READY,
      publishMessage: null,
      publishMode: _constants.PublishMode.CREATE,
      publishModeState: _constants.PublishModeState.READY,
      headRevision: null,
      dirtyFileChanges: new Map(),
      commitMergeFileChanges: new Map(),
      compareFileChanges: new Map()
    };
    this._updateRepositories();
    this._subscriptions.add(atom.project.onDidChangePaths(this._updateRepositories.bind(this)));
    this._setActiveFileState(getInitialFileChangeState());
    this._checkCustomConfig()['catch'](_notifications.notifyInternalError);
  }

  _createDecoratedClass(DiffViewModel, [{
    key: '_checkCustomConfig',
    value: _asyncToGenerator(function* () {
      var config = null;
      try {
        config = require('./fb/config');
      } finally {
        if (config == null) {
          return;
        }
        yield config.applyConfig();
      }
    })
  }, {
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
    key: '_createRepositoryStack',
    value: function _createRepositoryStack(repository) {
      var _this = this;

      var repositoryStack = new _RepositoryStack2['default'](repository);
      var subscriptions = new _atom.CompositeDisposable();
      subscriptions.add(repositoryStack.onDidUpdateDirtyFileChanges(this._updateDirtyChangedStatus.bind(this)), repositoryStack.onDidUpdateCommitMergeFileChanges(this._updateCommitMergeFileChanges.bind(this)), repositoryStack.onDidChangeRevisions(function (revisionsState) {
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
    key: '_updateDirtyChangedStatus',
    value: function _updateDirtyChangedStatus() {
      var dirtyFileChanges = _commons.map.union.apply(_commons.map, _toConsumableArray(_commons.array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
        return repositoryStack.getDirtyFileChanges();
      })));
      this._updateCompareChangedStatus(dirtyFileChanges, null);
    }
  }, {
    key: '_updateCommitMergeFileChanges',
    value: function _updateCommitMergeFileChanges() {
      var commitMergeFileChanges = _commons.map.union.apply(_commons.map, _toConsumableArray(_commons.array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
        return repositoryStack.getCommitMergeFileChanges();
      })));
      this._updateCompareChangedStatus(null, commitMergeFileChanges);
    }
  }, {
    key: '_updateCompareChangedStatus',
    value: function _updateCompareChangedStatus(dirtyFileChanges, commitMergeFileChanges) {
      if (dirtyFileChanges == null) {
        dirtyFileChanges = this._state.dirtyFileChanges;
      }
      if (commitMergeFileChanges == null) {
        commitMergeFileChanges = this._state.commitMergeFileChanges;
      }
      var compareFileChanges = null;
      if (this._state.viewMode === _constants.DiffMode.COMMIT_MODE) {
        compareFileChanges = dirtyFileChanges;
      } else {
        compareFileChanges = commitMergeFileChanges;
      }
      this._setState(_extends({}, this._state, {
        dirtyFileChanges: dirtyFileChanges,
        commitMergeFileChanges: commitMergeFileChanges,
        compareFileChanges: compareFileChanges
      }));
    }
  }, {
    key: '_updateChangedRevisions',
    value: _asyncToGenerator(function* (repositoryStack, revisionsState, reloadFileDiff) {
      if (repositoryStack !== this._activeRepositoryStack) {
        return;
      }
      (0, _analytics.track)('diff-view-update-timeline-revisions', {
        revisionsCount: '' + revisionsState.revisions.length
      });
      this._onUpdateRevisionsState(revisionsState);

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
    })
  }, {
    key: '_onUpdateRevisionsState',
    value: function _onUpdateRevisionsState(revisionsState) {
      this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);
      this._loadModeState();
    }
  }, {
    key: 'setPublishMessage',
    value: function setPublishMessage(publishMessage) {
      this._setState(_extends({}, this._state, {
        publishMessage: publishMessage
      }));
    }
  }, {
    key: 'setViewMode',
    value: function setViewMode(viewMode) {
      if (viewMode === this._state.viewMode) {
        return;
      }
      this._setState(_extends({}, this._state, {
        viewMode: viewMode
      }));
      this._updateCompareChangedStatus();
      this._loadModeState();
    }
  }, {
    key: '_loadModeState',
    value: function _loadModeState() {
      switch (this._state.viewMode) {
        case _constants.DiffMode.COMMIT_MODE:
          this._loadCommitModeState();
          break;
        case _constants.DiffMode.PUBLISH_MODE:
          this._loadPublishModeState()['catch'](_notifications.notifyInternalError);
          break;
      }
    }
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
      // Modified events could be late that it doesn't capture the latest edits/ state changes.
      // Hence, it's safe to re-emit changes when stable from changes.
      activeSubscriptions.add(buffer.onDidStopChanging(this._onDidBufferChangeModified.bind(this)));
      // Update `savedContents` on buffer save requests.
      activeSubscriptions.add(buffer.onWillSave(function () {
        return _this2._onWillSaveActiveBuffer(buffer);
      }));
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
      (0, _assert2['default'])(savedContents, 'savedContents is not defined while updating diff state!');
      if (savedContents === newContents || filesystemContents === newContents) {
        return this._updateDiffState(filePath, updatedDiffState, savedContents);
      }
      // The user have edited since the last update.
      if (filesystemContents === savedContents) {
        // The changes haven't touched the filesystem, keep user edits.
        return this._updateDiffState(filePath, _extends({}, updatedDiffState, { filesystemContents: newContents }), savedContents);
      } else {
        // The committed and filesystem state have changed, notify of override.
        (0, _notifications.notifyFilesystemOverrideUserEdits)(filePath);
        return this._updateDiffState(filePath, updatedDiffState, filesystemContents);
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
      yield this._updateDiffState(filePath, hgDiffState, hgDiffState.filesystemContents);
    })
  }, {
    key: '_updateDiffState',
    value: _asyncToGenerator(function* (filePath, hgDiffState, savedContents) {
      var oldContents = hgDiffState.committedContents;
      var newContents = hgDiffState.filesystemContents;
      var revisionInfo = hgDiffState.revisionInfo;
      var hash = revisionInfo.hash;
      var bookmarks = revisionInfo.bookmarks;

      var newFileState = {
        filePath: filePath,
        oldContents: oldContents,
        newContents: newContents,
        savedContents: savedContents,
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
    value: function saveActiveFile() {
      var filePath = this._activeFileState.filePath;

      (0, _analytics.track)('diff-view-save-file', { filePath: filePath });
      return this._saveFile(filePath)['catch'](_notifications.notifyInternalError);
    }
  }, {
    key: 'publishDiff',
    decorators: [(0, _analytics.trackTiming)('diff-view.publish-diff')],
    value: _asyncToGenerator(function* (publishMessage) {
      this._setState(_extends({}, this._state, {
        publishMessage: publishMessage,
        publishModeState: _constants.PublishModeState.AWAITING_PUBLISH
      }));
      // TODO(most): do publish to Phabricator.
      try {
        yield _commons.promises.awaitMilliSeconds(5000);
        yield Promise.resolve();
      } catch (error) {
        (0, _notifications.notifyInternalError)(error);
      } finally {
        this._setState(_extends({}, this._state, {
          publishMessage: publishMessage,
          publishModeState: _constants.PublishModeState.READY
        }));
      }
    })
  }, {
    key: '_onWillSaveActiveBuffer',
    value: function _onWillSaveActiveBuffer(buffer) {
      this._setActiveFileState(_extends({}, this._activeFileState, {
        savedContents: buffer.getText()
      }));
    }
  }, {
    key: '_saveFile',
    value: _asyncToGenerator(function* (filePath) {
      var buffer = (0, _atomHelpers.bufferForUri)(filePath);
      if (buffer == null) {
        throw new Error('Could not find file buffer to save: `' + filePath + '`');
      }
      try {
        yield buffer.save();
      } catch (err) {
        throw new Error('Could not save file buffer: `' + filePath + '` - ' + err.toString());
      }
    })
  }, {
    key: 'onDidUpdateState',
    value: function onDidUpdateState(callback) {
      return this._emitter.on(DID_UPDATE_STATE_EVENT, callback);
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
    key: '_loadCommitModeState',
    value: _asyncToGenerator(function* () {
      this._setState(_extends({}, this._state, {
        commitModeState: _constants.CommitModeState.LOADING_COMMIT_MESSAGE
      }));

      var commitMessage = undefined;
      try {
        if (this._state.commitMode === _constants.CommitMode.COMMIT) {
          commitMessage = yield this._loadActiveRepositoryTemplateCommitMessage();
          // Commit templates that include newline strings, '\\n' in JavaScript, need to convert their
          // strings to literal newlines, '\n' in JavaScript, to be rendered as line breaks.
          if (commitMessage != null) {
            commitMessage = convertNewlines(commitMessage);
          }
        } else {
          commitMessage = yield this._loadActiveRepositoryLatestCommitMessage();
        }
      } catch (error) {
        (0, _notifications.notifyInternalError)(error);
      } finally {
        this._setState(_extends({}, this._state, {
          commitMessage: commitMessage,
          commitModeState: _constants.CommitModeState.READY
        }));
      }
    })
  }, {
    key: '_loadPublishModeState',
    value: _asyncToGenerator(function* () {
      this._setState(_extends({}, this._state, {
        publishMode: _constants.PublishMode.CREATE,
        publishModeState: _constants.PublishModeState.LOADING_PUBLISH_MESSAGE,
        publishMessage: null,
        headRevision: null
      }));
      var revisionsState = yield this.getActiveRevisionsState();
      if (revisionsState == null) {
        throw new Error('Cannot Load Publish View: No active file or repository');
      }
      var revisions = revisionsState.revisions;

      (0, _assert2['default'])(revisions.length > 0, 'Diff View Error: Zero Revisions');
      var headRevision = revisions[revisions.length - 1];
      var headMessage = headRevision.description;
      // TODO(most): Use @mareksapota's utility when done.
      var hasPhabricatorRevision = headMessage.indexOf('Differential Revision:') !== -1;
      this._setState(_extends({}, this._state, {
        publishMode: hasPhabricatorRevision ? _constants.PublishMode.UPDATE : _constants.PublishMode.CREATE,
        publishModeState: _constants.PublishModeState.READY,
        publishMessage: hasPhabricatorRevision ? UPDATE_REVISION_TEMPLATE : headMessage,
        headRevision: headRevision
      }));
    })
  }, {
    key: '_loadActiveRepositoryLatestCommitMessage',
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
    key: '_loadActiveRepositoryTemplateCommitMessage',
    value: function _loadActiveRepositoryTemplateCommitMessage() {
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
    key: '_setState',
    value: function _setState(newState) {
      this._state = newState;
      this._emitter.emit(DID_UPDATE_STATE_EVENT);
    }
  }, {
    key: 'commit',
    value: _asyncToGenerator(function* (message) {
      this._setState(_extends({}, this._state, {
        commitMessage: message,
        commitModeState: _constants.CommitModeState.AWAITING_COMMIT
      }));

      var activeStack = this._activeRepositoryStack;
      try {
        (0, _assert2['default'])(activeStack, 'No active repository stack');
        switch (this._state.commitMode) {
          case _constants.CommitMode.COMMIT:
            yield activeStack.commit(message);
            atom.notifications.addSuccess('Commit created');
            break;
          case _constants.CommitMode.AMEND:
            yield activeStack.amend(message);
            atom.notifications.addSuccess('Commit amended');
            break;
        }
        // Force trigger an update to the revisions to update the UI state with the new comit info.
        activeStack.getRevisionsStatePromise();
      } catch (e) {
        atom.notifications.addError('Error creating commit', { detail: 'Details: ' + e.stdout });
        this._setState(_extends({}, this._state, {
          commitModeState: _constants.CommitModeState.READY
        }));
        return;
      }
    })
  }, {
    key: 'getState',
    value: function getState() {
      return this._state;
    }
  }, {
    key: 'setCommitMode',
    value: function setCommitMode(commitMode) {
      this._setState(_extends({}, this._state, {
        commitMode: commitMode
      }));
      // When the commit mode changes, load the appropriate commit message.
      this._loadCommitModeState();
    }
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
      if (this._activeSubscriptions != null) {
        this._activeSubscriptions.dispose();
        this._activeSubscriptions = null;
      }
    }
  }]);

  return DiffViewModel;
})();

module.exports = DiffViewModel;
//# sourceMappingURL=data:application/json;base64,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UztBQUNkLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsV0FBSyxJQUFNLGVBQWUsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDN0QsdUJBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUMzQjtBQUNELFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMvQixXQUFLLElBQU0sWUFBWSxJQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUNqRSxvQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3hCO0FBQ0QsVUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RDLFVBQUksSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksRUFBRTtBQUNyQyxZQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDcEMsWUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztPQUNsQztLQUNGOzs7U0E3b0JHLGFBQWE7OztBQWdwQm5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IkRpZmZWaWV3TW9kZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5Q2xpZW50fSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWNsaWVudCc7XG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVDaGFuZ2VTdGF0ZSxcbiAgUmV2aXNpb25zU3RhdGUsXG4gIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSxcbiAgSGdEaWZmU3RhdGUsXG4gIENvbW1pdE1vZGVUeXBlLFxuICBDb21taXRNb2RlU3RhdGVUeXBlLFxuICBQdWJsaXNoTW9kZVR5cGUsXG4gIFB1Ymxpc2hNb2RlU3RhdGVUeXBlLFxuICBEaWZmTW9kZVR5cGUsXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgRGlmZk1vZGUsXG4gIENvbW1pdE1vZGUsXG4gIENvbW1pdE1vZGVTdGF0ZSxcbiAgUHVibGlzaE1vZGUsXG4gIFB1Ymxpc2hNb2RlU3RhdGUsXG59IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7cmVwb3NpdG9yeUZvclBhdGh9IGZyb20gJy4uLy4uL2hnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1Db250ZW50c30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2FycmF5LCBtYXAsIGRlYm91bmNlLCBwcm9taXNlc30gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgUmVwb3NpdG9yeVN0YWNrIGZyb20gJy4vUmVwb3NpdG9yeVN0YWNrJztcbmltcG9ydCB7XG4gIG5vdGlmeUludGVybmFsRXJyb3IsXG4gIG5vdGlmeUZpbGVzeXN0ZW1PdmVycmlkZVVzZXJFZGl0cyxcbn0gZnJvbSAnLi9ub3RpZmljYXRpb25zJztcbmltcG9ydCB7YnVmZmVyRm9yVXJpfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuXG5jb25zdCBBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQgPSAnYWN0aXZlLWZpbGUtdXBkYXRlJztcbmNvbnN0IENIQU5HRV9SRVZJU0lPTlNfRVZFTlQgPSAnZGlkLWNoYW5nZS1yZXZpc2lvbnMnO1xuY29uc3QgQUNUSVZFX0JVRkZFUl9DSEFOR0VfTU9ESUZJRURfRVZFTlQgPSAnYWN0aXZlLWJ1ZmZlci1jaGFuZ2UtbW9kaWZpZWQnO1xuY29uc3QgRElEX1VQREFURV9TVEFURV9FVkVOVCA9ICdkaWQtdXBkYXRlLXN0YXRlJztcbmNvbnN0IFVQREFURV9SRVZJU0lPTl9URU1QTEFURSA9ICcnO1xuXG5jb25zdCBGSUxFX0NIQU5HRV9ERUJPVU5DRV9NUyA9IDIwMDtcblxuLy8gUmV0dXJucyBhIHN0cmluZyB3aXRoIGFsbCBuZXdsaW5lIHN0cmluZ3MsICdcXFxcbicsIGNvbnZlcnRlZCB0byBsaXRlcmFsIG5ld2xpbmVzLCAnXFxuJy5cbmZ1bmN0aW9uIGNvbnZlcnROZXdsaW5lcyhtZXNzYWdlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbWVzc2FnZS5yZXBsYWNlKC9cXFxcbi9nLCAnXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxGaWxlQ2hhbmdlU3RhdGUoKTogRmlsZUNoYW5nZVN0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICBmcm9tUmV2aXNpb25UaXRsZTogJ05vIGZpbGUgc2VsZWN0ZWQnLFxuICAgIHRvUmV2aXNpb25UaXRsZTogJ05vIGZpbGUgc2VsZWN0ZWQnLFxuICAgIGZpbGVQYXRoOiAnJyxcbiAgICBvbGRDb250ZW50czogJycsXG4gICAgbmV3Q29udGVudHM6ICcnLFxuICAgIGNvbXBhcmVSZXZpc2lvbkluZm86IG51bGwsXG4gIH07XG59XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHZpZXdNb2RlOiBEaWZmTW9kZVR5cGU7XG4gIGNvbW1pdE1lc3NhZ2U6ID9zdHJpbmc7XG4gIGNvbW1pdE1vZGU6IENvbW1pdE1vZGVUeXBlO1xuICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZVR5cGU7XG4gIHB1Ymxpc2hNZXNzYWdlOiA/c3RyaW5nO1xuICBwdWJsaXNoTW9kZTogUHVibGlzaE1vZGVUeXBlO1xuICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlVHlwZTtcbiAgaGVhZFJldmlzaW9uOiA/UmV2aXNpb25JbmZvO1xuICBkaXJ0eUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgY29tbWl0TWVyZ2VGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIGNvbXBhcmVGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG59O1xuXG5jbGFzcyBEaWZmVmlld01vZGVsIHtcblxuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9hY3RpdmVTdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGl2ZUZpbGVTdGF0ZTogRmlsZUNoYW5nZVN0YXRlO1xuICBfYWN0aXZlUmVwb3NpdG9yeVN0YWNrOiA/UmVwb3NpdG9yeVN0YWNrO1xuICBfbmV3RWRpdG9yOiA/VGV4dEVkaXRvcjtcbiAgX3VpUHJvdmlkZXJzOiBBcnJheTxPYmplY3Q+O1xuICBfcmVwb3NpdG9yeVN0YWNrczogTWFwPEhnUmVwb3NpdG9yeUNsaWVudCwgUmVwb3NpdG9yeVN0YWNrPjtcbiAgX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zOiBNYXA8SGdSZXBvc2l0b3J5Q2xpZW50LCBDb21wb3NpdGVEaXNwb3NhYmxlPjtcbiAgX2lzQWN0aXZlOiBib29sZWFuO1xuICBfc3RhdGU6IFN0YXRlO1xuXG4gIGNvbnN0cnVjdG9yKHVpUHJvdmlkZXJzOiBBcnJheTxPYmplY3Q+KSB7XG4gICAgdGhpcy5fdWlQcm92aWRlcnMgPSB1aVByb3ZpZGVycztcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fc3RhdGUgPSB7XG4gICAgICB2aWV3TW9kZTogRGlmZk1vZGUuQlJPV1NFX01PREUsXG4gICAgICBjb21taXRNZXNzYWdlOiBudWxsLFxuICAgICAgY29tbWl0TW9kZTogQ29tbWl0TW9kZS5DT01NSVQsXG4gICAgICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZS5SRUFEWSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlOiBudWxsLFxuICAgICAgcHVibGlzaE1vZGU6IFB1Ymxpc2hNb2RlLkNSRUFURSxcbiAgICAgIHB1Ymxpc2hNb2RlU3RhdGU6IFB1Ymxpc2hNb2RlU3RhdGUuUkVBRFksXG4gICAgICBoZWFkUmV2aXNpb246IG51bGwsXG4gICAgICBkaXJ0eUZpbGVDaGFuZ2VzOiBuZXcgTWFwKCksXG4gICAgICBjb21taXRNZXJnZUZpbGVDaGFuZ2VzOiBuZXcgTWFwKCksXG4gICAgICBjb21wYXJlRmlsZUNoYW5nZXM6IG5ldyBNYXAoKSxcbiAgICB9O1xuICAgIHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcygpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcy5iaW5kKHRoaXMpKSk7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKGdldEluaXRpYWxGaWxlQ2hhbmdlU3RhdGUoKSk7XG4gICAgdGhpcy5fY2hlY2tDdXN0b21Db25maWcoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIGFzeW5jIF9jaGVja0N1c3RvbUNvbmZpZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgY29uZmlnID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgY29uZmlnID0gcmVxdWlyZSgnLi9mYi9jb25maWcnKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGNvbmZpZyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGF3YWl0IGNvbmZpZy5hcHBseUNvbmZpZygpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVSZXBvc2l0b3JpZXMoKTogdm9pZCB7XG4gICAgY29uc3QgcmVwb3NpdG9yaWVzID0gbmV3IFNldChcbiAgICAgIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKS5maWx0ZXIoXG4gICAgICAgIHJlcG9zaXRvcnkgPT4gcmVwb3NpdG9yeSAhPSBudWxsICYmIHJlcG9zaXRvcnkuZ2V0VHlwZSgpID09PSAnaGcnXG4gICAgICApXG4gICAgKTtcbiAgICAvLyBEaXNwb3NlIHJlbW92ZWQgcHJvamVjdHMgcmVwb3NpdG9yaWVzLlxuICAgIGZvciAoY29uc3QgW3JlcG9zaXRvcnksIHJlcG9zaXRvcnlTdGFja10gb2YgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcykge1xuICAgICAgaWYgKHJlcG9zaXRvcmllcy5oYXMocmVwb3NpdG9yeSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICByZXBvc2l0b3J5U3RhY2suZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5kZWxldGUocmVwb3NpdG9yeSk7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuZ2V0KHJlcG9zaXRvcnkpO1xuICAgICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5kZWxldGUocmVwb3NpdG9yeSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5IG9mIHJlcG9zaXRvcmllcykge1xuICAgICAgaWYgKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuaGFzKHJlcG9zaXRvcnkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgICAgdGhpcy5fY3JlYXRlUmVwb3NpdG9yeVN0YWNrKGhnUmVwb3NpdG9yeSk7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlRGlydHlDaGFuZ2VkU3RhdHVzKCk7XG4gIH1cblxuICBfY3JlYXRlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCk6IFJlcG9zaXRvcnlTdGFjayB7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gbmV3IFJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5KTtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZFVwZGF0ZURpcnR5RmlsZUNoYW5nZXMoXG4gICAgICAgIHRoaXMuX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cy5iaW5kKHRoaXMpXG4gICAgICApLFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkVXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyhcbiAgICAgICAgdGhpcy5fdXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcy5iaW5kKHRoaXMpXG4gICAgICApLFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlUmV2aXNpb25zKHJldmlzaW9uc1N0YXRlID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhyZXBvc2l0b3J5U3RhY2ssIHJldmlzaW9uc1N0YXRlLCB0cnVlKVxuICAgICAgICAgIC5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5zZXQocmVwb3NpdG9yeSwgcmVwb3NpdG9yeVN0YWNrKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5zZXQocmVwb3NpdG9yeSwgc3Vic2NyaXB0aW9ucyk7XG4gICAgaWYgKHRoaXMuX2lzQWN0aXZlKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suYWN0aXZhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcG9zaXRvcnlTdGFjaztcbiAgfVxuXG4gIF91cGRhdGVEaXJ0eUNoYW5nZWRTdGF0dXMoKTogdm9pZCB7XG4gICAgY29uc3QgZGlydHlGaWxlQ2hhbmdlcyA9IG1hcC51bmlvbiguLi5hcnJheVxuICAgICAgLmZyb20odGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSlcbiAgICAgIC5tYXAocmVwb3NpdG9yeVN0YWNrID0+IHJlcG9zaXRvcnlTdGFjay5nZXREaXJ0eUZpbGVDaGFuZ2VzKCkpXG4gICAgKTtcbiAgICB0aGlzLl91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cyhkaXJ0eUZpbGVDaGFuZ2VzLCBudWxsKTtcbiAgfVxuXG4gIF91cGRhdGVDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSBtYXAudW5pb24oLi4uYXJyYXlcbiAgICAgIC5mcm9tKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpXG4gICAgICAubWFwKHJlcG9zaXRvcnlTdGFjayA9PiByZXBvc2l0b3J5U3RhY2suZ2V0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcygpKVxuICAgICk7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMobnVsbCwgY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBfdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMoXG4gICAgZGlydHlGaWxlQ2hhbmdlcz86ID9NYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPixcbiAgICBjb21taXRNZXJnZUZpbGVDaGFuZ2VzPzogP01hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+LFxuICApOiB2b2lkIHtcbiAgICBpZiAoZGlydHlGaWxlQ2hhbmdlcyA9PSBudWxsKSB7XG4gICAgICBkaXJ0eUZpbGVDaGFuZ2VzID0gdGhpcy5fc3RhdGUuZGlydHlGaWxlQ2hhbmdlcztcbiAgICB9XG4gICAgaWYgKGNvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPT0gbnVsbCkge1xuICAgICAgY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyA9IHRoaXMuX3N0YXRlLmNvbW1pdE1lcmdlRmlsZUNoYW5nZXM7XG4gICAgfVxuICAgIGxldCBjb21wYXJlRmlsZUNoYW5nZXMgPSBudWxsO1xuICAgIGlmICh0aGlzLl9zdGF0ZS52aWV3TW9kZSA9PT0gRGlmZk1vZGUuQ09NTUlUX01PREUpIHtcbiAgICAgIGNvbXBhcmVGaWxlQ2hhbmdlcyA9IGRpcnR5RmlsZUNoYW5nZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbXBhcmVGaWxlQ2hhbmdlcyA9IGNvbW1pdE1lcmdlRmlsZUNoYW5nZXM7XG4gICAgfVxuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgZGlydHlGaWxlQ2hhbmdlcyxcbiAgICAgIGNvbW1pdE1lcmdlRmlsZUNoYW5nZXMsXG4gICAgICBjb21wYXJlRmlsZUNoYW5nZXMsXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhcbiAgICByZXBvc2l0b3J5U3RhY2s6IFJlcG9zaXRvcnlTdGFjayxcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICAgcmVsb2FkRmlsZURpZmY6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChyZXBvc2l0b3J5U3RhY2sgIT09IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cmFjaygnZGlmZi12aWV3LXVwZGF0ZS10aW1lbGluZS1yZXZpc2lvbnMnLCB7XG4gICAgICByZXZpc2lvbnNDb3VudDogYCR7cmV2aXNpb25zU3RhdGUucmV2aXNpb25zLmxlbmd0aH1gLFxuICAgIH0pO1xuICAgIHRoaXMuX29uVXBkYXRlUmV2aXNpb25zU3RhdGUocmV2aXNpb25zU3RhdGUpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBhY3RpdmUgZmlsZSwgaWYgY2hhbmdlZC5cbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGlmICghZmlsZVBhdGggfHwgIXJlbG9hZEZpbGVEaWZmKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgIH0gPSBhd2FpdCB0aGlzLl9mZXRjaEhnRGlmZihmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICApO1xuICB9XG5cbiAgX29uVXBkYXRlUmV2aXNpb25zU3RhdGUocmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIHJldmlzaW9uc1N0YXRlKTtcbiAgICB0aGlzLl9sb2FkTW9kZVN0YXRlKCk7XG4gIH1cblxuICBzZXRQdWJsaXNoTWVzc2FnZShwdWJsaXNoTWVzc2FnZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBwdWJsaXNoTWVzc2FnZSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldFZpZXdNb2RlKHZpZXdNb2RlOiBEaWZmTW9kZVR5cGUpIHtcbiAgICBpZiAodmlld01vZGUgPT09IHRoaXMuX3N0YXRlLnZpZXdNb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgdmlld01vZGUsXG4gICAgfSk7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMoKTtcbiAgICB0aGlzLl9sb2FkTW9kZVN0YXRlKCk7XG4gIH1cblxuICBfbG9hZE1vZGVTdGF0ZSgpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHRoaXMuX3N0YXRlLnZpZXdNb2RlKSB7XG4gICAgICBjYXNlIERpZmZNb2RlLkNPTU1JVF9NT0RFOlxuICAgICAgICB0aGlzLl9sb2FkQ29tbWl0TW9kZVN0YXRlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmTW9kZS5QVUJMSVNIX01PREU6XG4gICAgICAgIHRoaXMuX2xvYWRQdWJsaXNoTW9kZVN0YXRlKCkuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGFjdGl2YXRlRmlsZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgY29uc3QgYWN0aXZlU3Vic2NyaXB0aW9ucyA9IHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIC8vIFRPRE8obW9zdCk6IFNob3cgcHJvZ3Jlc3MgaW5kaWNhdG9yOiB0ODk5MTY3NlxuICAgIGNvbnN0IGJ1ZmZlciA9IGJ1ZmZlckZvclVyaShmaWxlUGF0aCk7XG4gICAgY29uc3Qge2ZpbGV9ID0gYnVmZmVyO1xuICAgIGlmIChmaWxlICE9IG51bGwpIHtcbiAgICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMuYWRkKGZpbGUub25EaWRDaGFuZ2UoZGVib3VuY2UoXG4gICAgICAgICgpID0+IHRoaXMuX29uRGlkRmlsZUNoYW5nZShmaWxlUGF0aCkuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvciksXG4gICAgICAgIEZJTEVfQ0hBTkdFX0RFQk9VTkNFX01TLFxuICAgICAgICBmYWxzZSxcbiAgICAgICkpKTtcbiAgICB9XG4gICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoYnVmZmVyLm9uRGlkQ2hhbmdlTW9kaWZpZWQoXG4gICAgICB0aGlzLl9vbkRpZEJ1ZmZlckNoYW5nZU1vZGlmaWVkLmJpbmQodGhpcyksXG4gICAgKSk7XG4gICAgLy8gTW9kaWZpZWQgZXZlbnRzIGNvdWxkIGJlIGxhdGUgdGhhdCBpdCBkb2Vzbid0IGNhcHR1cmUgdGhlIGxhdGVzdCBlZGl0cy8gc3RhdGUgY2hhbmdlcy5cbiAgICAvLyBIZW5jZSwgaXQncyBzYWZlIHRvIHJlLWVtaXQgY2hhbmdlcyB3aGVuIHN0YWJsZSBmcm9tIGNoYW5nZXMuXG4gICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoYnVmZmVyLm9uRGlkU3RvcENoYW5naW5nKFxuICAgICAgdGhpcy5fb25EaWRCdWZmZXJDaGFuZ2VNb2RpZmllZC5iaW5kKHRoaXMpLFxuICAgICkpO1xuICAgIC8vIFVwZGF0ZSBgc2F2ZWRDb250ZW50c2Agb24gYnVmZmVyIHNhdmUgcmVxdWVzdHMuXG4gICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoYnVmZmVyLm9uV2lsbFNhdmUoXG4gICAgICAoKSA9PiB0aGlzLl9vbldpbGxTYXZlQWN0aXZlQnVmZmVyKGJ1ZmZlciksXG4gICAgKSk7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1vcGVuLWZpbGUnLCB7ZmlsZVBhdGh9KTtcbiAgICB0aGlzLl91cGRhdGVBY3RpdmVEaWZmU3RhdGUoZmlsZVBhdGgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmlsZS1jaGFuZ2UtdXBkYXRlJylcbiAgYXN5bmMgX29uRGlkRmlsZUNoYW5nZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVGaWxlU3RhdGUuZmlsZVBhdGggIT09IGZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpbGVzeXN0ZW1Db250ZW50cyA9IGF3YWl0IGdldEZpbGVTeXN0ZW1Db250ZW50cyhmaWxlUGF0aCk7XG4gICAgY29uc3Qge1xuICAgICAgb2xkQ29udGVudHM6IGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgY29tcGFyZVJldmlzaW9uSW5mbzogcmV2aXNpb25JbmZvLFxuICAgIH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaW52YXJpYW50KHJldmlzaW9uSW5mbywgJ0RpZmYgVmlldzogUmV2aXNpb24gaW5mbyBtdXN0IGJlIGRlZmluZWQgdG8gdXBkYXRlIGNoYW5nZWQgc3RhdGUnKTtcbiAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgICk7XG4gIH1cblxuICBfb25EaWRCdWZmZXJDaGFuZ2VNb2RpZmllZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQUNUSVZFX0JVRkZFUl9DSEFOR0VfTU9ESUZJRURfRVZFTlQpO1xuICB9XG5cbiAgb25EaWRBY3RpdmVCdWZmZXJDaGFuZ2VNb2RpZmllZChcbiAgICBjYWxsYmFjazogKCkgPT4gbWl4ZWQsXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihBQ1RJVkVfQlVGRkVSX0NIQU5HRV9NT0RJRklFRF9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgaXNBY3RpdmVCdWZmZXJNb2RpZmllZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGNvbnN0IGJ1ZmZlciA9IGJ1ZmZlckZvclVyaShmaWxlUGF0aCk7XG4gICAgcmV0dXJuIGJ1ZmZlci5pc01vZGlmaWVkKCk7XG4gIH1cblxuICBfdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbW1pdHRlZENvbnRlbnRzOiBzdHJpbmcsXG4gICAgZmlsZXN5c3RlbUNvbnRlbnRzOiBzdHJpbmcsXG4gICAgcmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm8sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGZpbGVQYXRoOiBhY3RpdmVGaWxlUGF0aCxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICB9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGlmIChmaWxlUGF0aCAhPT0gYWN0aXZlRmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgY29uc3QgdXBkYXRlZERpZmZTdGF0ZSA9IHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgIH07XG4gICAgaW52YXJpYW50KHNhdmVkQ29udGVudHMsICdzYXZlZENvbnRlbnRzIGlzIG5vdCBkZWZpbmVkIHdoaWxlIHVwZGF0aW5nIGRpZmYgc3RhdGUhJyk7XG4gICAgaWYgKHNhdmVkQ29udGVudHMgPT09IG5ld0NvbnRlbnRzIHx8IGZpbGVzeXN0ZW1Db250ZW50cyA9PT0gbmV3Q29udGVudHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICB1cGRhdGVkRGlmZlN0YXRlLFxuICAgICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgKTtcbiAgICB9XG4gICAgLy8gVGhlIHVzZXIgaGF2ZSBlZGl0ZWQgc2luY2UgdGhlIGxhc3QgdXBkYXRlLlxuICAgIGlmIChmaWxlc3lzdGVtQ29udGVudHMgPT09IHNhdmVkQ29udGVudHMpIHtcbiAgICAgIC8vIFRoZSBjaGFuZ2VzIGhhdmVuJ3QgdG91Y2hlZCB0aGUgZmlsZXN5c3RlbSwga2VlcCB1c2VyIGVkaXRzLlxuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIHsuLi51cGRhdGVkRGlmZlN0YXRlLCBmaWxlc3lzdGVtQ29udGVudHM6IG5ld0NvbnRlbnRzfSxcbiAgICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBjb21taXR0ZWQgYW5kIGZpbGVzeXN0ZW0gc3RhdGUgaGF2ZSBjaGFuZ2VkLCBub3RpZnkgb2Ygb3ZlcnJpZGUuXG4gICAgICBub3RpZnlGaWxlc3lzdGVtT3ZlcnJpZGVVc2VyRWRpdHMoZmlsZVBhdGgpO1xuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIHVwZGF0ZWREaWZmU3RhdGUsXG4gICAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgc2V0TmV3Q29udGVudHMobmV3Q29udGVudHM6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZSh7Li4udGhpcy5fYWN0aXZlRmlsZVN0YXRlLCBuZXdDb250ZW50c30pO1xuICB9XG5cbiAgc2V0UmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IHZvaWQge1xuICAgIHRyYWNrKCdkaWZmLXZpZXctc2V0LXJldmlzaW9uJyk7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrO1xuICAgIGludmFyaWFudChyZXBvc2l0b3J5U3RhY2ssICdUaGVyZSBtdXN0IGJlIGFuIGFjdGl2ZSByZXBvc2l0b3J5IHN0YWNrIScpO1xuICAgIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSA9IHsuLi50aGlzLl9hY3RpdmVGaWxlU3RhdGUsIGNvbXBhcmVSZXZpc2lvbkluZm86IHJldmlzaW9ufTtcbiAgICByZXBvc2l0b3J5U3RhY2suc2V0UmV2aXNpb24ocmV2aXNpb24pLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICB9XG5cbiAgZ2V0QWN0aXZlRmlsZVN0YXRlKCk6IEZpbGVDaGFuZ2VTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVBY3RpdmVEaWZmU3RhdGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGhnRGlmZlN0YXRlID0gYXdhaXQgdGhpcy5fZmV0Y2hIZ0RpZmYoZmlsZVBhdGgpO1xuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgaGdEaWZmU3RhdGUsXG4gICAgICBoZ0RpZmZTdGF0ZS5maWxlc3lzdGVtQ29udGVudHMsXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVEaWZmU3RhdGUoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgaGdEaWZmU3RhdGU6IEhnRGlmZlN0YXRlLFxuICAgIHNhdmVkQ29udGVudHM6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge1xuICAgICAgY29tbWl0dGVkQ29udGVudHM6IG9sZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzOiBuZXdDb250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICB9ID0gaGdEaWZmU3RhdGU7XG4gICAgY29uc3Qge2hhc2gsIGJvb2ttYXJrc30gPSByZXZpc2lvbkluZm87XG4gICAgY29uc3QgbmV3RmlsZVN0YXRlID0ge1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRDb250ZW50cyxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgIGNvbXBhcmVSZXZpc2lvbkluZm86IHJldmlzaW9uSW5mbyxcbiAgICAgIGZyb21SZXZpc2lvblRpdGxlOiBgJHtoYXNofWAgKyAoYm9va21hcmtzLmxlbmd0aCA9PT0gMCA/ICcnIDogYCAtICgke2Jvb2ttYXJrcy5qb2luKCcsICcpfSlgKSxcbiAgICAgIHRvUmV2aXNpb25UaXRsZTogJ0ZpbGVzeXN0ZW0gLyBFZGl0b3InLFxuICAgIH07XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKG5ld0ZpbGVTdGF0ZSk7XG4gICAgLy8gVE9ETyhtb3N0KTogRml4OiB0aGlzIGFzc3VtZXMgdGhhdCB0aGUgZWRpdG9yIGNvbnRlbnRzIGFyZW4ndCBjaGFuZ2VkIHdoaWxlXG4gICAgLy8gZmV0Y2hpbmcgdGhlIGNvbW1lbnRzLCB0aGF0J3Mgb2theSBub3cgYmVjYXVzZSB3ZSBkb24ndCBmZXRjaCB0aGVtLlxuICAgIGNvbnN0IGlubGluZUNvbXBvbmVudHMgPSBhd2FpdCB0aGlzLl9mZXRjaElubGluZUNvbXBvbmVudHMoKTtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoey4uLm5ld0ZpbGVTdGF0ZSwgaW5saW5lQ29tcG9uZW50c30pO1xuICB9XG5cbiAgX3NldEFjdGl2ZUZpbGVTdGF0ZShzdGF0ZTogRmlsZUNoYW5nZVN0YXRlKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aXZlRmlsZVN0YXRlID0gc3RhdGU7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KEFDVElWRV9GSUxFX1VQREFURV9FVkVOVCwgdGhpcy5fYWN0aXZlRmlsZVN0YXRlKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmhnLXN0YXRlLXVwZGF0ZScpXG4gIGFzeW5jIF9mZXRjaEhnRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8SGdEaWZmU3RhdGU+IHtcbiAgICAvLyBDYWxsaW5nIGF0b20ucHJvamVjdC5yZXBvc2l0b3J5Rm9yRGlyZWN0b3J5IGdldHMgdGhlIHJlYWwgcGF0aCBvZiB0aGUgZGlyZWN0b3J5LFxuICAgIC8vIHdoaWNoIGlzIGFub3RoZXIgcm91bmQtdHJpcCBhbmQgY2FsbHMgdGhlIHJlcG9zaXRvcnkgcHJvdmlkZXJzIHRvIGdldCBhbiBleGlzdGluZyByZXBvc2l0b3J5LlxuICAgIC8vIEluc3RlYWQsIHRoZSBmaXJzdCBtYXRjaCBvZiB0aGUgZmlsdGVyaW5nIGhlcmUgaXMgdGhlIG9ubHkgcG9zc2libGUgbWF0Y2guXG4gICAgY29uc3QgcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnlGb3JQYXRoKGZpbGVQYXRoKTtcbiAgICBpZiAocmVwb3NpdG9yeSA9PSBudWxsIHx8IHJlcG9zaXRvcnkuZ2V0VHlwZSgpICE9PSAnaGcnKSB7XG4gICAgICBjb25zdCB0eXBlID0gcmVwb3NpdG9yeSA/IHJlcG9zaXRvcnkuZ2V0VHlwZSgpIDogJ25vIHJlcG9zaXRvcnknO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaWZmIHZpZXcgb25seSBzdXBwb3J0cyBcXGBNZXJjdXJpYWxcXGAgcmVwb3NpdG9yaWVzLCBidXQgZm91bmQgXFxgJHt0eXBlfVxcYGApO1xuICAgIH1cblxuICAgIGNvbnN0IGhnUmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50ID0gKHJlcG9zaXRvcnk6IGFueSk7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5nZXQoaGdSZXBvc2l0b3J5KTtcbiAgICBpbnZhcmlhbnQocmVwb3NpdG9yeVN0YWNrLCAnVGhlcmUgbXVzdCBiZSBhbiByZXBvc2l0b3J5IHN0YWNrIGZvciBhIGdpdmVuIHJlcG9zaXRvcnkhJyk7XG4gICAgY29uc3QgW2hnRGlmZl0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICByZXBvc2l0b3J5U3RhY2suZmV0Y2hIZ0RpZmYoZmlsZVBhdGgpLFxuICAgICAgdGhpcy5fc2V0QWN0aXZlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnlTdGFjayksXG4gICAgXSk7XG4gICAgcmV0dXJuIGhnRGlmZjtcbiAgfVxuXG4gIGFzeW5jIF9zZXRBY3RpdmVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeVN0YWNrOiBSZXBvc2l0b3J5U3RhY2spOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09PSByZXBvc2l0b3J5U3RhY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID0gcmVwb3NpdG9yeVN0YWNrO1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgcmVwb3NpdG9yeVN0YWNrLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIHRoaXMuX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMocmVwb3NpdG9yeVN0YWNrLCByZXZpc2lvbnNTdGF0ZSwgZmFsc2UpO1xuICB9XG5cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5zYXZlLWZpbGUnKVxuICBzYXZlQWN0aXZlRmlsZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctc2F2ZS1maWxlJywge2ZpbGVQYXRofSk7XG4gICAgcmV0dXJuIHRoaXMuX3NhdmVGaWxlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnB1Ymxpc2gtZGlmZicpXG4gIGFzeW5jIHB1Ymxpc2hEaWZmKHB1Ymxpc2hNZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlLFxuICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5BV0FJVElOR19QVUJMSVNILFxuICAgIH0pO1xuICAgIC8vIFRPRE8obW9zdCk6IGRvIHB1Ymxpc2ggdG8gUGhhYnJpY2F0b3IuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHByb21pc2VzLmF3YWl0TWlsbGlTZWNvbmRzKDUwMDApO1xuICAgICAgYXdhaXQgUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgICBwdWJsaXNoTWVzc2FnZSxcbiAgICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5SRUFEWSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9vbldpbGxTYXZlQWN0aXZlQnVmZmVyKGJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSxcbiAgICAgIHNhdmVkQ29udGVudHM6IGJ1ZmZlci5nZXRUZXh0KCksXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfc2F2ZUZpbGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIGlmIChidWZmZXIgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBmaWxlIGJ1ZmZlciB0byBzYXZlOiBcXGAke2ZpbGVQYXRofVxcYGApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYnVmZmVyLnNhdmUoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHNhdmUgZmlsZSBidWZmZXI6IFxcYCR7ZmlsZVBhdGh9XFxgIC0gJHtlcnIudG9TdHJpbmcoKX1gKTtcbiAgICB9XG4gIH1cblxuICBvbkRpZFVwZGF0ZVN0YXRlKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihESURfVVBEQVRFX1NUQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvblJldmlzaW9uc1VwZGF0ZShjYWxsYmFjazogKHN0YXRlOiA/UmV2aXNpb25zU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25BY3RpdmVGaWxlVXBkYXRlcyhjYWxsYmFjazogKHN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1jb21tZW50cycpXG4gIGFzeW5jIF9mZXRjaElubGluZUNvbXBvbmVudHMoKTogUHJvbWlzZTxBcnJheTxPYmplY3Q+PiB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBjb25zdCB1aUVsZW1lbnRQcm9taXNlcyA9IHRoaXMuX3VpUHJvdmlkZXJzLm1hcChcbiAgICAgIHByb3ZpZGVyID0+IHByb3ZpZGVyLmNvbXBvc2VVaUVsZW1lbnRzKGZpbGVQYXRoKVxuICAgICk7XG4gICAgY29uc3QgdWlDb21wb25lbnRMaXN0cyA9IGF3YWl0IFByb21pc2UuYWxsKHVpRWxlbWVudFByb21pc2VzKTtcbiAgICAvLyBGbGF0dGVuIHVpQ29tcG9uZW50TGlzdHMgZnJvbSBsaXN0IG9mIGxpc3RzIG9mIGNvbXBvbmVudHMgdG8gYSBsaXN0IG9mIGNvbXBvbmVudHMuXG4gICAgY29uc3QgdWlDb21wb25lbnRzID0gW10uY29uY2F0LmFwcGx5KFtdLCB1aUNvbXBvbmVudExpc3RzKTtcbiAgICByZXR1cm4gdWlDb21wb25lbnRzO1xuICB9XG5cbiAgYXN5bmMgX2xvYWRDb21taXRNb2RlU3RhdGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZS5MT0FESU5HX0NPTU1JVF9NRVNTQUdFLFxuICAgIH0pO1xuXG4gICAgbGV0IGNvbW1pdE1lc3NhZ2U7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLl9zdGF0ZS5jb21taXRNb2RlID09PSBDb21taXRNb2RlLkNPTU1JVCkge1xuICAgICAgICBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fbG9hZEFjdGl2ZVJlcG9zaXRvcnlUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgICAgICAgLy8gQ29tbWl0IHRlbXBsYXRlcyB0aGF0IGluY2x1ZGUgbmV3bGluZSBzdHJpbmdzLCAnXFxcXG4nIGluIEphdmFTY3JpcHQsIG5lZWQgdG8gY29udmVydCB0aGVpclxuICAgICAgICAvLyBzdHJpbmdzIHRvIGxpdGVyYWwgbmV3bGluZXMsICdcXG4nIGluIEphdmFTY3JpcHQsIHRvIGJlIHJlbmRlcmVkIGFzIGxpbmUgYnJlYWtzLlxuICAgICAgICBpZiAoY29tbWl0TWVzc2FnZSAhPSBudWxsKSB7XG4gICAgICAgICAgY29tbWl0TWVzc2FnZSA9IGNvbnZlcnROZXdsaW5lcyhjb21taXRNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2xvYWRBY3RpdmVSZXBvc2l0b3J5TGF0ZXN0Q29tbWl0TWVzc2FnZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TWVzc2FnZSxcbiAgICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuUkVBRFksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfbG9hZFB1Ymxpc2hNb2RlU3RhdGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBwdWJsaXNoTW9kZTogUHVibGlzaE1vZGUuQ1JFQVRFLFxuICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5MT0FESU5HX1BVQkxJU0hfTUVTU0FHRSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlOiBudWxsLFxuICAgICAgaGVhZFJldmlzaW9uOiBudWxsLFxuICAgIH0pO1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRBY3RpdmVSZXZpc2lvbnNTdGF0ZSgpO1xuICAgIGlmIChyZXZpc2lvbnNTdGF0ZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBMb2FkIFB1Ymxpc2ggVmlldzogTm8gYWN0aXZlIGZpbGUgb3IgcmVwb3NpdG9yeScpO1xuICAgIH1cbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIGludmFyaWFudChyZXZpc2lvbnMubGVuZ3RoID4gMCwgJ0RpZmYgVmlldyBFcnJvcjogWmVybyBSZXZpc2lvbnMnKTtcbiAgICBjb25zdCBoZWFkUmV2aXNpb24gPSByZXZpc2lvbnNbcmV2aXNpb25zLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGhlYWRNZXNzYWdlID0gaGVhZFJldmlzaW9uLmRlc2NyaXB0aW9uO1xuICAgIC8vIFRPRE8obW9zdCk6IFVzZSBAbWFyZWtzYXBvdGEncyB1dGlsaXR5IHdoZW4gZG9uZS5cbiAgICBjb25zdCBoYXNQaGFicmljYXRvclJldmlzaW9uID0gaGVhZE1lc3NhZ2UuaW5kZXhPZignRGlmZmVyZW50aWFsIFJldmlzaW9uOicpICE9PSAtMTtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNb2RlOiBoYXNQaGFicmljYXRvclJldmlzaW9uID8gUHVibGlzaE1vZGUuVVBEQVRFIDogUHVibGlzaE1vZGUuQ1JFQVRFLFxuICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5SRUFEWSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlOiBoYXNQaGFicmljYXRvclJldmlzaW9uXG4gICAgICAgID8gVVBEQVRFX1JFVklTSU9OX1RFTVBMQVRFXG4gICAgICAgIDogaGVhZE1lc3NhZ2UsXG4gICAgICBoZWFkUmV2aXNpb24sXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfbG9hZEFjdGl2ZVJlcG9zaXRvcnlMYXRlc3RDb21taXRNZXNzYWdlKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZmYgVmlldzogTm8gYWN0aXZlIGZpbGUgb3IgcmVwb3NpdG9yeSBvcGVuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRBY3RpdmVSZXZpc2lvbnNTdGF0ZSgpO1xuICAgIGludmFyaWFudChyZXZpc2lvbnNTdGF0ZSwgJ0RpZmYgVmlldyBJbnRlcm5hbCBFcnJvcjogcmV2aXNpb25zU3RhdGUgY2Fubm90IGJlIG51bGwnKTtcbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIGludmFyaWFudChyZXZpc2lvbnMubGVuZ3RoID4gMCwgJ0RpZmYgVmlldyBFcnJvcjogQ2Fubm90IGFtZW5kIG5vbi1leGlzdGluZyBjb21taXQnKTtcbiAgICByZXR1cm4gcmV2aXNpb25zW3JldmlzaW9ucy5sZW5ndGggLSAxXS5kZXNjcmlwdGlvbjtcbiAgfVxuXG4gIF9sb2FkQWN0aXZlUmVwb3NpdG9yeVRlbXBsYXRlQ29tbWl0TWVzc2FnZSgpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGlmZiBWaWV3OiBObyBhY3RpdmUgZmlsZSBvciByZXBvc2l0b3J5IG9wZW4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgfVxuXG4gIGFzeW5jIGdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCk6IFByb21pc2U8P1JldmlzaW9uc1N0YXRlPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgfVxuXG4gIF9zZXRTdGF0ZShuZXdTdGF0ZTogU3RhdGUpIHtcbiAgICB0aGlzLl9zdGF0ZSA9IG5ld1N0YXRlO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChESURfVVBEQVRFX1NUQVRFX0VWRU5UKTtcbiAgfVxuXG4gIGFzeW5jIGNvbW1pdChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIGNvbW1pdE1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZS5BV0FJVElOR19DT01NSVQsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY3RpdmVTdGFjayA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaztcbiAgICB0cnkge1xuICAgICAgaW52YXJpYW50KGFjdGl2ZVN0YWNrLCAnTm8gYWN0aXZlIHJlcG9zaXRvcnkgc3RhY2snKTtcbiAgICAgIHN3aXRjaCAodGhpcy5fc3RhdGUuY29tbWl0TW9kZSkge1xuICAgICAgICBjYXNlIENvbW1pdE1vZGUuQ09NTUlUOlxuICAgICAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLmNvbW1pdChtZXNzYWdlKTtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnQ29tbWl0IGNyZWF0ZWQnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBDb21taXRNb2RlLkFNRU5EOlxuICAgICAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLmFtZW5kKG1lc3NhZ2UpO1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb21taXQgYW1lbmRlZCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgLy8gRm9yY2UgdHJpZ2dlciBhbiB1cGRhdGUgdG8gdGhlIHJldmlzaW9ucyB0byB1cGRhdGUgdGhlIFVJIHN0YXRlIHdpdGggdGhlIG5ldyBjb21pdCBpbmZvLlxuICAgICAgYWN0aXZlU3RhY2suZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAnRXJyb3IgY3JlYXRpbmcgY29tbWl0JyxcbiAgICAgICAge2RldGFpbDogYERldGFpbHM6ICR7ZS5zdGRvdXR9YH0sXG4gICAgICApO1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuUkVBRFksXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBnZXRTdGF0ZSgpOiBTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICB9XG5cbiAgc2V0Q29tbWl0TW9kZShjb21taXRNb2RlOiBDb21taXRNb2RlVHlwZSk6IHZvaWQge1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgY29tbWl0TW9kZSxcbiAgICB9KTtcbiAgICAvLyBXaGVuIHRoZSBjb21taXQgbW9kZSBjaGFuZ2VzLCBsb2FkIHRoZSBhcHByb3ByaWF0ZSBjb21taXQgbWVzc2FnZS5cbiAgICB0aGlzLl9sb2FkQ29tbWl0TW9kZVN0YXRlKCk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVSZXBvc2l0b3JpZXMoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5U3RhY2sgb2YgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmFjdGl2YXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmRlYWN0aXZhdGUoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZShnZXRJbml0aWFsRmlsZUNoYW5nZVN0YXRlKCkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnlTdGFjayBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmNsZWFyKCk7XG4gICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2YgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmNsZWFyKCk7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld01vZGVsO1xuIl19