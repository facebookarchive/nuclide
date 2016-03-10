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

var CHANGE_DIRTY_STATUS_EVENT = 'did-change-dirty-status';
var CHANGE_COMPARE_STATUS_EVENT = 'did-change-compare-status';
var ACTIVE_FILE_UPDATE_EVENT = 'active-file-update';
var CHANGE_REVISIONS_EVENT = 'did-change-revisions';
var ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT = 'active-buffer-change-modified';
var DID_UPDATE_STATE_EVENT = 'did-update-state';
var UPDATE_REVISION_TEMPLATE = '';

var FILE_CHANGE_DEBOUNCE_MS = 200;
var UI_CHANGE_DEBOUNCE_MS = 100;

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
    this._dirtyFileChanges = new Map();
    this._compareFileChanges = new Map();
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
      headRevision: null
    };
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
    key: 'onDidUpdateState',
    value: function onDidUpdateState(callback) {
      return this._emitter.on(DID_UPDATE_STATE_EVENT, callback);
    }
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
//# sourceMappingURL=data:application/json;base64,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QUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO09BQ2xDO0tBQ0Y7OztTQXRtQkcsYUFBYTs7O0FBeW1CbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdNb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtcbiAgRmlsZUNoYW5nZVN0YXRlLFxuICBSZXZpc2lvbnNTdGF0ZSxcbiAgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlLFxuICBIZ0RpZmZTdGF0ZSxcbiAgQ29tbWl0TW9kZVR5cGUsXG4gIENvbW1pdE1vZGVTdGF0ZVR5cGUsXG4gIFB1Ymxpc2hNb2RlVHlwZSxcbiAgUHVibGlzaE1vZGVTdGF0ZVR5cGUsXG4gIERpZmZNb2RlVHlwZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL0hnU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBEaWZmTW9kZSxcbiAgQ29tbWl0TW9kZSxcbiAgQ29tbWl0TW9kZVN0YXRlLFxuICBQdWJsaXNoTW9kZSxcbiAgUHVibGlzaE1vZGVTdGF0ZSxcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vaGctZ2l0LWJyaWRnZSc7XG5pbXBvcnQge3RyYWNrLCB0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7Z2V0RmlsZVN5c3RlbUNvbnRlbnRzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7YXJyYXksIG1hcCwgZGVib3VuY2UsIHByb21pc2VzfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBSZXBvc2l0b3J5U3RhY2sgZnJvbSAnLi9SZXBvc2l0b3J5U3RhY2snO1xuaW1wb3J0IHtcbiAgbm90aWZ5SW50ZXJuYWxFcnJvcixcbiAgbm90aWZ5RmlsZXN5c3RlbU92ZXJyaWRlVXNlckVkaXRzLFxufSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IHtidWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5cbmNvbnN0IENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQgPSAnZGlkLWNoYW5nZS1kaXJ0eS1zdGF0dXMnO1xuY29uc3QgQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5UID0gJ2RpZC1jaGFuZ2UtY29tcGFyZS1zdGF0dXMnO1xuY29uc3QgQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5UID0gJ2FjdGl2ZS1maWxlLXVwZGF0ZSc7XG5jb25zdCBDSEFOR0VfUkVWSVNJT05TX0VWRU5UID0gJ2RpZC1jaGFuZ2UtcmV2aXNpb25zJztcbmNvbnN0IEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5UID0gJ2FjdGl2ZS1idWZmZXItY2hhbmdlLW1vZGlmaWVkJztcbmNvbnN0IERJRF9VUERBVEVfU1RBVEVfRVZFTlQgPSAnZGlkLXVwZGF0ZS1zdGF0ZSc7XG5jb25zdCBVUERBVEVfUkVWSVNJT05fVEVNUExBVEUgPSAnJztcblxuY29uc3QgRklMRV9DSEFOR0VfREVCT1VOQ0VfTVMgPSAyMDA7XG5jb25zdCBVSV9DSEFOR0VfREVCT1VOQ0VfTVMgPSAxMDA7XG5cbi8vIFJldHVybnMgYSBzdHJpbmcgd2l0aCBhbGwgbmV3bGluZSBzdHJpbmdzLCAnXFxcXG4nLCBjb252ZXJ0ZWQgdG8gbGl0ZXJhbCBuZXdsaW5lcywgJ1xcbicuXG5mdW5jdGlvbiBjb252ZXJ0TmV3bGluZXMobWVzc2FnZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG1lc3NhZ2UucmVwbGFjZSgvXFxcXG4vZywgJ1xcbicpO1xufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsRmlsZUNoYW5nZVN0YXRlKCk6IEZpbGVDaGFuZ2VTdGF0ZSB7XG4gIHJldHVybiB7XG4gICAgZnJvbVJldmlzaW9uVGl0bGU6ICdObyBmaWxlIHNlbGVjdGVkJyxcbiAgICB0b1JldmlzaW9uVGl0bGU6ICdObyBmaWxlIHNlbGVjdGVkJyxcbiAgICBmaWxlUGF0aDogJycsXG4gICAgb2xkQ29udGVudHM6ICcnLFxuICAgIG5ld0NvbnRlbnRzOiAnJyxcbiAgICBjb21wYXJlUmV2aXNpb25JbmZvOiBudWxsLFxuICB9O1xufVxuXG50eXBlIFN0YXRlID0ge1xuICB2aWV3TW9kZTogRGlmZk1vZGVUeXBlO1xuICBjb21taXRNZXNzYWdlOiA/c3RyaW5nO1xuICBjb21taXRNb2RlOiBDb21taXRNb2RlVHlwZTtcbiAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGVUeXBlO1xuICBwdWJsaXNoTWVzc2FnZTogP3N0cmluZztcbiAgcHVibGlzaE1vZGU6IFB1Ymxpc2hNb2RlVHlwZTtcbiAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZVR5cGU7XG4gIGhlYWRSZXZpc2lvbjogP1JldmlzaW9uSW5mbztcbn07XG5cbmNsYXNzIERpZmZWaWV3TW9kZWwge1xuXG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGl2ZVN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYWN0aXZlRmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGU7XG4gIF9hY3RpdmVSZXBvc2l0b3J5U3RhY2s6ID9SZXBvc2l0b3J5U3RhY2s7XG4gIF9uZXdFZGl0b3I6ID9UZXh0RWRpdG9yO1xuICBfZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9jb21wYXJlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfdWlQcm92aWRlcnM6IEFycmF5PE9iamVjdD47XG4gIF9yZXBvc2l0b3J5U3RhY2tzOiBNYXA8SGdSZXBvc2l0b3J5Q2xpZW50LCBSZXBvc2l0b3J5U3RhY2s+O1xuICBfcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnM6IE1hcDxIZ1JlcG9zaXRvcnlDbGllbnQsIENvbXBvc2l0ZURpc3Bvc2FibGU+O1xuICBfaXNBY3RpdmU6IGJvb2xlYW47XG4gIF9zdGF0ZTogU3RhdGU7XG4gIF9kZWJvdW5jZWRFbWl0QWN0aXZlRmlsZVVwZGF0ZTogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3Rvcih1aVByb3ZpZGVyczogQXJyYXk8T2JqZWN0Pikge1xuICAgIHRoaXMuX3VpUHJvdmlkZXJzID0gdWlQcm92aWRlcnM7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuX3N0YXRlID0ge1xuICAgICAgdmlld01vZGU6IERpZmZNb2RlLkJST1dTRV9NT0RFLFxuICAgICAgY29tbWl0TWVzc2FnZTogbnVsbCxcbiAgICAgIGNvbW1pdE1vZGU6IENvbW1pdE1vZGUuQ09NTUlULFxuICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuUkVBRFksXG4gICAgICBwdWJsaXNoTWVzc2FnZTogbnVsbCxcbiAgICAgIHB1Ymxpc2hNb2RlOiBQdWJsaXNoTW9kZS5DUkVBVEUsXG4gICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLlJFQURZLFxuICAgICAgaGVhZFJldmlzaW9uOiBudWxsLFxuICAgIH07XG4gICAgdGhpcy5fdXBkYXRlUmVwb3NpdG9yaWVzKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHModGhpcy5fdXBkYXRlUmVwb3NpdG9yaWVzLmJpbmQodGhpcykpKTtcbiAgICB0aGlzLl9kZWJvdW5jZWRFbWl0QWN0aXZlRmlsZVVwZGF0ZSA9IGRlYm91bmNlKFxuICAgICAgdGhpcy5fZW1pdEFjdGl2ZUZpbGVVcGRhdGUuYmluZCh0aGlzKSxcbiAgICAgIFVJX0NIQU5HRV9ERUJPVU5DRV9NUyxcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKGdldEluaXRpYWxGaWxlQ2hhbmdlU3RhdGUoKSk7XG4gIH1cblxuICBfdXBkYXRlUmVwb3NpdG9yaWVzKCk6IHZvaWQge1xuICAgIGNvbnN0IHJlcG9zaXRvcmllcyA9IG5ldyBTZXQoXG4gICAgICBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKCkuZmlsdGVyKFxuICAgICAgICByZXBvc2l0b3J5ID0+IHJlcG9zaXRvcnkgIT0gbnVsbCAmJiByZXBvc2l0b3J5LmdldFR5cGUoKSA9PT0gJ2hnJ1xuICAgICAgKVxuICAgICk7XG4gICAgLy8gRGlzcG9zZSByZW1vdmVkIHByb2plY3RzIHJlcG9zaXRvcmllcy5cbiAgICBmb3IgKGNvbnN0IFtyZXBvc2l0b3J5LCByZXBvc2l0b3J5U3RhY2tdIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MpIHtcbiAgICAgIGlmIChyZXBvc2l0b3JpZXMuaGFzKHJlcG9zaXRvcnkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgcmVwb3NpdG9yeVN0YWNrLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmdldChyZXBvc2l0b3J5KTtcbiAgICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgcmVwb3NpdG9yeSBvZiByZXBvc2l0b3JpZXMpIHtcbiAgICAgIGlmICh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmhhcyhyZXBvc2l0b3J5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9ICgocmVwb3NpdG9yeTogYW55KTogSGdSZXBvc2l0b3J5Q2xpZW50KTtcbiAgICAgIHRoaXMuX2NyZWF0ZVJlcG9zaXRvcnlTdGFjayhoZ1JlcG9zaXRvcnkpO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cygpO1xuICB9XG5cbiAgX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldERpcnR5RmlsZUNoYW5nZXMoKSlcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5ULCB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIF9jcmVhdGVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50KTogUmVwb3NpdG9yeVN0YWNrIHtcbiAgICBjb25zdCByZXBvc2l0b3J5U3RhY2sgPSBuZXcgUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnkpO1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlRGlydHlTdGF0dXModGhpcy5fdXBkYXRlRGlydHlDaGFuZ2VkU3RhdHVzLmJpbmQodGhpcykpLFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyh0aGlzLl91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cy5iaW5kKHRoaXMpKSxcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZENoYW5nZVJldmlzaW9ucyhyZXZpc2lvbnNTdGF0ZSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMocmVwb3NpdG9yeVN0YWNrLCByZXZpc2lvbnNTdGF0ZSwgdHJ1ZSlcbiAgICAgICAgICAuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gICAgICB9KSxcbiAgICApO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3Muc2V0KHJlcG9zaXRvcnksIHJlcG9zaXRvcnlTdGFjayk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuc2V0KHJlcG9zaXRvcnksIHN1YnNjcmlwdGlvbnMpO1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmFjdGl2YXRlKCk7XG4gICAgfVxuICAgIHJldHVybiByZXBvc2l0b3J5U3RhY2s7XG4gIH1cblxuICBfdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMoKTogdm9pZCB7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldENvbXBhcmVGaWxlQ2hhbmdlcygpKVxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVDaGFuZ2VkUmV2aXNpb25zKFxuICAgIHJlcG9zaXRvcnlTdGFjazogUmVwb3NpdG9yeVN0YWNrLFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgICByZWxvYWRGaWxlRGlmZjogYm9vbGVhbixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHJlcG9zaXRvcnlTdGFjayAhPT0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyYWNrKCdkaWZmLXZpZXctdXBkYXRlLXRpbWVsaW5lLXJldmlzaW9ucycsIHtcbiAgICAgIHJldmlzaW9uc0NvdW50OiBgJHtyZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMubGVuZ3RofWAsXG4gICAgfSk7XG4gICAgdGhpcy5fb25VcGRhdGVSZXZpc2lvbnNTdGF0ZShyZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGFjdGl2ZSBmaWxlLCBpZiBjaGFuZ2VkLlxuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaWYgKCFmaWxlUGF0aCB8fCAhcmVsb2FkRmlsZURpZmYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge1xuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfSA9IGF3YWl0IHRoaXMuX2ZldGNoSGdEaWZmKGZpbGVQYXRoKTtcbiAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgICk7XG4gIH1cblxuICBfb25VcGRhdGVSZXZpc2lvbnNTdGF0ZShyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuICAgIHRoaXMuX2xvYWRNb2RlU3RhdGUoKTtcbiAgfVxuXG4gIHNldFB1Ymxpc2hNZXNzYWdlKHB1Ymxpc2hNZXNzYWdlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0Vmlld01vZGUodmlld01vZGU6IERpZmZNb2RlVHlwZSkge1xuICAgIGlmICh2aWV3TW9kZSA9PT0gdGhpcy5fc3RhdGUudmlld01vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICB2aWV3TW9kZSxcbiAgICB9KTtcbiAgICB0aGlzLl9sb2FkTW9kZVN0YXRlKCk7XG4gIH1cblxuICBfbG9hZE1vZGVTdGF0ZSgpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHRoaXMuX3N0YXRlLnZpZXdNb2RlKSB7XG4gICAgICBjYXNlIERpZmZNb2RlLkNPTU1JVF9NT0RFOlxuICAgICAgICB0aGlzLl9sb2FkQ29tbWl0TW9kZVN0YXRlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmTW9kZS5QVUJMSVNIX01PREU6XG4gICAgICAgIHRoaXMuX2xvYWRQdWJsaXNoTW9kZVN0YXRlKCkuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGFjdGl2YXRlRmlsZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgY29uc3QgYWN0aXZlU3Vic2NyaXB0aW9ucyA9IHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIC8vIFRPRE8obW9zdCk6IFNob3cgcHJvZ3Jlc3MgaW5kaWNhdG9yOiB0ODk5MTY3NlxuICAgIGNvbnN0IGJ1ZmZlciA9IGJ1ZmZlckZvclVyaShmaWxlUGF0aCk7XG4gICAgY29uc3Qge2ZpbGV9ID0gYnVmZmVyO1xuICAgIGlmIChmaWxlICE9IG51bGwpIHtcbiAgICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMuYWRkKGZpbGUub25EaWRDaGFuZ2UoZGVib3VuY2UoXG4gICAgICAgICgpID0+IHRoaXMuX29uRGlkRmlsZUNoYW5nZShmaWxlUGF0aCkuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvciksXG4gICAgICAgIEZJTEVfQ0hBTkdFX0RFQk9VTkNFX01TLFxuICAgICAgICBmYWxzZSxcbiAgICAgICkpKTtcbiAgICB9XG4gICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoYnVmZmVyLm9uRGlkQ2hhbmdlTW9kaWZpZWQoXG4gICAgICB0aGlzLl9vbkRpZEJ1ZmZlckNoYW5nZU1vZGlmaWVkLmJpbmQodGhpcyksXG4gICAgKSk7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1vcGVuLWZpbGUnLCB7ZmlsZVBhdGh9KTtcbiAgICB0aGlzLl91cGRhdGVBY3RpdmVEaWZmU3RhdGUoZmlsZVBhdGgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmlsZS1jaGFuZ2UtdXBkYXRlJylcbiAgYXN5bmMgX29uRGlkRmlsZUNoYW5nZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVGaWxlU3RhdGUuZmlsZVBhdGggIT09IGZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpbGVzeXN0ZW1Db250ZW50cyA9IGF3YWl0IGdldEZpbGVTeXN0ZW1Db250ZW50cyhmaWxlUGF0aCk7XG4gICAgY29uc3Qge1xuICAgICAgb2xkQ29udGVudHM6IGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgY29tcGFyZVJldmlzaW9uSW5mbzogcmV2aXNpb25JbmZvLFxuICAgIH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaW52YXJpYW50KHJldmlzaW9uSW5mbywgJ0RpZmYgVmlldzogUmV2aXNpb24gaW5mbyBtdXN0IGJlIGRlZmluZWQgdG8gdXBkYXRlIGNoYW5nZWQgc3RhdGUnKTtcbiAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgICk7XG4gIH1cblxuICBfb25EaWRCdWZmZXJDaGFuZ2VNb2RpZmllZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQUNUSVZFX0JVRkZFUl9DSEFOR0VfTU9ESUZJRURfRVZFTlQpO1xuICB9XG5cbiAgb25EaWRBY3RpdmVCdWZmZXJDaGFuZ2VNb2RpZmllZChcbiAgICBjYWxsYmFjazogKCkgPT4gbWl4ZWQsXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihBQ1RJVkVfQlVGRkVSX0NIQU5HRV9NT0RJRklFRF9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgaXNBY3RpdmVCdWZmZXJNb2RpZmllZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGNvbnN0IGJ1ZmZlciA9IGJ1ZmZlckZvclVyaShmaWxlUGF0aCk7XG4gICAgcmV0dXJuIGJ1ZmZlci5pc01vZGlmaWVkKCk7XG4gIH1cblxuICBfdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbW1pdHRlZENvbnRlbnRzOiBzdHJpbmcsXG4gICAgZmlsZXN5c3RlbUNvbnRlbnRzOiBzdHJpbmcsXG4gICAgcmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm8sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGZpbGVQYXRoOiBhY3RpdmVGaWxlUGF0aCxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICB9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGlmIChmaWxlUGF0aCAhPT0gYWN0aXZlRmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgY29uc3QgdXBkYXRlZERpZmZTdGF0ZSA9IHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgIH07XG4gICAgaWYgKHNhdmVkQ29udGVudHMgPT09IG5ld0NvbnRlbnRzIHx8IGZpbGVzeXN0ZW1Db250ZW50cyA9PT0gbmV3Q29udGVudHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGgsIHVwZGF0ZWREaWZmU3RhdGUpO1xuICAgIH1cbiAgICAvLyBUaGUgdXNlciBoYXZlIGVkaXRlZCBzaW5jZSB0aGUgbGFzdCB1cGRhdGUuXG4gICAgaWYgKGZpbGVzeXN0ZW1Db250ZW50cyA9PT0gc2F2ZWRDb250ZW50cykge1xuICAgICAgLy8gVGhlIGNoYW5nZXMgaGF2ZW4ndCB0b3VjaGVkIHRoZSBmaWxlc3lzdGVtLCBrZWVwIHVzZXIgZWRpdHMuXG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgey4uLnVwZGF0ZWREaWZmU3RhdGUsIGZpbGVzeXN0ZW1Db250ZW50czogbmV3Q29udGVudHN9LFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGNvbW1pdHRlZCBhbmQgZmlsZXN5c3RlbSBzdGF0ZSBoYXZlIGNoYW5nZWQsIG5vdGlmeSBvZiBvdmVycmlkZS5cbiAgICAgIG5vdGlmeUZpbGVzeXN0ZW1PdmVycmlkZVVzZXJFZGl0cyhmaWxlUGF0aCk7XG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKGZpbGVQYXRoLCB1cGRhdGVkRGlmZlN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBzZXROZXdDb250ZW50cyhuZXdDb250ZW50czogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHsuLi50aGlzLl9hY3RpdmVGaWxlU3RhdGUsIG5ld0NvbnRlbnRzfSk7XG4gIH1cblxuICBzZXRSZXZpc2lvbihyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogdm9pZCB7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1zZXQtcmV2aXNpb24nKTtcbiAgICBjb25zdCByZXBvc2l0b3J5U3RhY2sgPSB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2s7XG4gICAgaW52YXJpYW50KHJlcG9zaXRvcnlTdGFjaywgJ1RoZXJlIG11c3QgYmUgYW4gYWN0aXZlIHJlcG9zaXRvcnkgc3RhY2shJyk7XG4gICAgdGhpcy5fYWN0aXZlRmlsZVN0YXRlID0gey4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSwgY29tcGFyZVJldmlzaW9uSW5mbzogcmV2aXNpb259O1xuICAgIHJlcG9zaXRvcnlTdGFjay5zZXRSZXZpc2lvbihyZXZpc2lvbikuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gIH1cblxuICBnZXRBY3RpdmVGaWxlU3RhdGUoKTogRmlsZUNoYW5nZVN0YXRlIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZUFjdGl2ZURpZmZTdGF0ZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaGdEaWZmU3RhdGUgPSBhd2FpdCB0aGlzLl9mZXRjaEhnRGlmZihmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlKGZpbGVQYXRoLCBoZ0RpZmZTdGF0ZSk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlRGlmZlN0YXRlKGZpbGVQYXRoOiBOdWNsaWRlVXJpLCBoZ0RpZmZTdGF0ZTogSGdEaWZmU3RhdGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7XG4gICAgICBjb21taXR0ZWRDb250ZW50czogb2xkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHM6IG5ld0NvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgIH0gPSBoZ0RpZmZTdGF0ZTtcbiAgICBjb25zdCB7aGFzaCwgYm9va21hcmtzfSA9IHJldmlzaW9uSW5mbztcbiAgICBjb25zdCBuZXdGaWxlU3RhdGUgPSB7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZENvbnRlbnRzLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzOiBuZXdDb250ZW50cyxcbiAgICAgIGNvbXBhcmVSZXZpc2lvbkluZm86IHJldmlzaW9uSW5mbyxcbiAgICAgIGZyb21SZXZpc2lvblRpdGxlOiBgJHtoYXNofWAgKyAoYm9va21hcmtzLmxlbmd0aCA9PT0gMCA/ICcnIDogYCAtICgke2Jvb2ttYXJrcy5qb2luKCcsICcpfSlgKSxcbiAgICAgIHRvUmV2aXNpb25UaXRsZTogJ0ZpbGVzeXN0ZW0gLyBFZGl0b3InLFxuICAgIH07XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKG5ld0ZpbGVTdGF0ZSk7XG4gICAgLy8gVE9ETyhtb3N0KTogRml4OiB0aGlzIGFzc3VtZXMgdGhhdCB0aGUgZWRpdG9yIGNvbnRlbnRzIGFyZW4ndCBjaGFuZ2VkIHdoaWxlXG4gICAgLy8gZmV0Y2hpbmcgdGhlIGNvbW1lbnRzLCB0aGF0J3Mgb2theSBub3cgYmVjYXVzZSB3ZSBkb24ndCBmZXRjaCB0aGVtLlxuICAgIGNvbnN0IGlubGluZUNvbXBvbmVudHMgPSBhd2FpdCB0aGlzLl9mZXRjaElubGluZUNvbXBvbmVudHMoKTtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoey4uLm5ld0ZpbGVTdGF0ZSwgaW5saW5lQ29tcG9uZW50c30pO1xuICB9XG5cbiAgX3NldEFjdGl2ZUZpbGVTdGF0ZShzdGF0ZTogRmlsZUNoYW5nZVN0YXRlKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aXZlRmlsZVN0YXRlID0gc3RhdGU7XG4gICAgdGhpcy5fZGVib3VuY2VkRW1pdEFjdGl2ZUZpbGVVcGRhdGUoKTtcbiAgfVxuXG4gIF9lbWl0QWN0aXZlRmlsZVVwZGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5ULCB0aGlzLl9hY3RpdmVGaWxlU3RhdGUpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuaGctc3RhdGUtdXBkYXRlJylcbiAgYXN5bmMgX2ZldGNoSGdEaWZmKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxIZ0RpZmZTdGF0ZT4ge1xuICAgIC8vIENhbGxpbmcgYXRvbS5wcm9qZWN0LnJlcG9zaXRvcnlGb3JEaXJlY3RvcnkgZ2V0cyB0aGUgcmVhbCBwYXRoIG9mIHRoZSBkaXJlY3RvcnksXG4gICAgLy8gd2hpY2ggaXMgYW5vdGhlciByb3VuZC10cmlwIGFuZCBjYWxscyB0aGUgcmVwb3NpdG9yeSBwcm92aWRlcnMgdG8gZ2V0IGFuIGV4aXN0aW5nIHJlcG9zaXRvcnkuXG4gICAgLy8gSW5zdGVhZCwgdGhlIGZpcnN0IG1hdGNoIG9mIHRoZSBmaWx0ZXJpbmcgaGVyZSBpcyB0aGUgb25seSBwb3NzaWJsZSBtYXRjaC5cbiAgICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgoZmlsZVBhdGgpO1xuICAgIGlmIChyZXBvc2l0b3J5ID09IG51bGwgfHwgcmVwb3NpdG9yeS5nZXRUeXBlKCkgIT09ICdoZycpIHtcbiAgICAgIGNvbnN0IHR5cGUgPSByZXBvc2l0b3J5ID8gcmVwb3NpdG9yeS5nZXRUeXBlKCkgOiAnbm8gcmVwb3NpdG9yeSc7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYERpZmYgdmlldyBvbmx5IHN1cHBvcnRzIFxcYE1lcmN1cmlhbFxcYCByZXBvc2l0b3JpZXMsIGJ1dCBmb3VuZCBcXGAke3R5cGV9XFxgYCk7XG4gICAgfVxuXG4gICAgY29uc3QgaGdSZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQgPSAocmVwb3NpdG9yeTogYW55KTtcbiAgICBjb25zdCByZXBvc2l0b3J5U3RhY2sgPSB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmdldChoZ1JlcG9zaXRvcnkpO1xuICAgIGludmFyaWFudChyZXBvc2l0b3J5U3RhY2ssICdUaGVyZSBtdXN0IGJlIGFuIHJlcG9zaXRvcnkgc3RhY2sgZm9yIGEgZ2l2ZW4gcmVwb3NpdG9yeSEnKTtcbiAgICBjb25zdCBbaGdEaWZmXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5mZXRjaEhnRGlmZihmaWxlUGF0aCksXG4gICAgICB0aGlzLl9zZXRBY3RpdmVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeVN0YWNrKSxcbiAgICBdKTtcbiAgICByZXR1cm4gaGdEaWZmO1xuICB9XG5cbiAgYXN5bmMgX3NldEFjdGl2ZVJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5U3RhY2s6IFJlcG9zaXRvcnlTdGFjayk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPT09IHJlcG9zaXRvcnlTdGFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPSByZXBvc2l0b3J5U3RhY2s7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCByZXBvc2l0b3J5U3RhY2suZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgdGhpcy5fdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhyZXBvc2l0b3J5U3RhY2ssIHJldmlzaW9uc1N0YXRlLCBmYWxzZSk7XG4gIH1cblxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnNhdmUtZmlsZScpXG4gIGFzeW5jIHNhdmVBY3RpdmVGaWxlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1zYXZlLWZpbGUnLCB7ZmlsZVBhdGh9KTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fYWN0aXZlRmlsZVN0YXRlLnNhdmVkQ29udGVudHMgPSBhd2FpdCB0aGlzLl9zYXZlRmlsZShmaWxlUGF0aCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnB1Ymxpc2gtZGlmZicpXG4gIGFzeW5jIHB1Ymxpc2hEaWZmKHB1Ymxpc2hNZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlLFxuICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5BV0FJVElOR19QVUJMSVNILFxuICAgIH0pO1xuICAgIC8vIFRPRE8obW9zdCk6IGRvIHB1Ymxpc2ggdG8gUGhhYnJpY2F0b3IuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHByb21pc2VzLmF3YWl0TWlsbGlTZWNvbmRzKDUwMDApO1xuICAgICAgYXdhaXQgUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgICBwdWJsaXNoTWVzc2FnZSxcbiAgICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5SRUFEWSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9zYXZlRmlsZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICBpZiAoYnVmZmVyID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgZmlsZSBidWZmZXIgdG8gc2F2ZTogXFxgJHtmaWxlUGF0aH1cXGBgKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGJ1ZmZlci5zYXZlKCk7XG4gICAgICByZXR1cm4gYnVmZmVyLmdldFRleHQoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHNhdmUgZmlsZSBidWZmZXI6IFxcYCR7ZmlsZVBhdGh9XFxgIC0gJHtlcnIudG9TdHJpbmcoKX1gKTtcbiAgICB9XG4gIH1cblxuICBvbkRpZFVwZGF0ZVN0YXRlKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihESURfVVBEQVRFX1NUQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZURpcnR5U3RhdHVzKFxuICAgIGNhbGxiYWNrOiAoZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGNvbXBhcmVGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25SZXZpc2lvbnNVcGRhdGUoY2FsbGJhY2s6IChzdGF0ZTogP1JldmlzaW9uc1N0YXRlKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uQWN0aXZlRmlsZVVwZGF0ZXMoY2FsbGJhY2s6IChzdGF0ZTogRmlsZUNoYW5nZVN0YXRlKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKEFDVElWRV9GSUxFX1VQREFURV9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtY29tbWVudHMnKVxuICBhc3luYyBfZmV0Y2hJbmxpbmVDb21wb25lbnRzKCk6IFByb21pc2U8QXJyYXk8T2JqZWN0Pj4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgY29uc3QgdWlFbGVtZW50UHJvbWlzZXMgPSB0aGlzLl91aVByb3ZpZGVycy5tYXAoXG4gICAgICBwcm92aWRlciA9PiBwcm92aWRlci5jb21wb3NlVWlFbGVtZW50cyhmaWxlUGF0aClcbiAgICApO1xuICAgIGNvbnN0IHVpQ29tcG9uZW50TGlzdHMgPSBhd2FpdCBQcm9taXNlLmFsbCh1aUVsZW1lbnRQcm9taXNlcyk7XG4gICAgLy8gRmxhdHRlbiB1aUNvbXBvbmVudExpc3RzIGZyb20gbGlzdCBvZiBsaXN0cyBvZiBjb21wb25lbnRzIHRvIGEgbGlzdCBvZiBjb21wb25lbnRzLlxuICAgIGNvbnN0IHVpQ29tcG9uZW50cyA9IFtdLmNvbmNhdC5hcHBseShbXSwgdWlDb21wb25lbnRMaXN0cyk7XG4gICAgcmV0dXJuIHVpQ29tcG9uZW50cztcbiAgfVxuXG4gIGdldERpcnR5RmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgZ2V0Q29tcGFyZUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgYXN5bmMgX2xvYWRDb21taXRNb2RlU3RhdGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZS5MT0FESU5HX0NPTU1JVF9NRVNTQUdFLFxuICAgIH0pO1xuXG4gICAgbGV0IGNvbW1pdE1lc3NhZ2U7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLl9zdGF0ZS5jb21taXRNb2RlID09PSBDb21taXRNb2RlLkNPTU1JVCkge1xuICAgICAgICBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fbG9hZEFjdGl2ZVJlcG9zaXRvcnlUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgICAgICAgLy8gQ29tbWl0IHRlbXBsYXRlcyB0aGF0IGluY2x1ZGUgbmV3bGluZSBzdHJpbmdzLCAnXFxcXG4nIGluIEphdmFTY3JpcHQsIG5lZWQgdG8gY29udmVydCB0aGVpclxuICAgICAgICAvLyBzdHJpbmdzIHRvIGxpdGVyYWwgbmV3bGluZXMsICdcXG4nIGluIEphdmFTY3JpcHQsIHRvIGJlIHJlbmRlcmVkIGFzIGxpbmUgYnJlYWtzLlxuICAgICAgICBpZiAoY29tbWl0TWVzc2FnZSAhPSBudWxsKSB7XG4gICAgICAgICAgY29tbWl0TWVzc2FnZSA9IGNvbnZlcnROZXdsaW5lcyhjb21taXRNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2xvYWRBY3RpdmVSZXBvc2l0b3J5TGF0ZXN0Q29tbWl0TWVzc2FnZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TWVzc2FnZSxcbiAgICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuUkVBRFksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfbG9hZFB1Ymxpc2hNb2RlU3RhdGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBwdWJsaXNoTW9kZTogUHVibGlzaE1vZGUuQ1JFQVRFLFxuICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5MT0FESU5HX1BVQkxJU0hfTUVTU0FHRSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlOiBudWxsLFxuICAgICAgaGVhZFJldmlzaW9uOiBudWxsLFxuICAgIH0pO1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRBY3RpdmVSZXZpc2lvbnNTdGF0ZSgpO1xuICAgIGlmIChyZXZpc2lvbnNTdGF0ZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBMb2FkIFB1Ymxpc2ggVmlldzogTm8gYWN0aXZlIGZpbGUgb3IgcmVwb3NpdG9yeScpO1xuICAgIH1cbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIGludmFyaWFudChyZXZpc2lvbnMubGVuZ3RoID4gMCwgJ0RpZmYgVmlldyBFcnJvcjogWmVybyBSZXZpc2lvbnMnKTtcbiAgICBjb25zdCBoZWFkUmV2aXNpb24gPSByZXZpc2lvbnNbcmV2aXNpb25zLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGhlYWRNZXNzYWdlID0gaGVhZFJldmlzaW9uLmRlc2NyaXB0aW9uO1xuICAgIC8vIFRPRE8obW9zdCk6IFVzZSBAbWFyZWtzYXBvdGEncyB1dGlsaXR5IHdoZW4gZG9uZS5cbiAgICBjb25zdCBoYXNQaGFicmljYXRvclJldmlzaW9uID0gaGVhZE1lc3NhZ2UuaW5kZXhPZignRGlmZmVyZW50aWFsIFJldmlzaW9uOicpICE9PSAtMTtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNb2RlOiBoYXNQaGFicmljYXRvclJldmlzaW9uID8gUHVibGlzaE1vZGUuVVBEQVRFIDogUHVibGlzaE1vZGUuQ1JFQVRFLFxuICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5SRUFEWSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlOiBoYXNQaGFicmljYXRvclJldmlzaW9uXG4gICAgICAgID8gVVBEQVRFX1JFVklTSU9OX1RFTVBMQVRFXG4gICAgICAgIDogaGVhZE1lc3NhZ2UsXG4gICAgICBoZWFkUmV2aXNpb24sXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfbG9hZEFjdGl2ZVJlcG9zaXRvcnlMYXRlc3RDb21taXRNZXNzYWdlKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZmYgVmlldzogTm8gYWN0aXZlIGZpbGUgb3IgcmVwb3NpdG9yeSBvcGVuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRBY3RpdmVSZXZpc2lvbnNTdGF0ZSgpO1xuICAgIGludmFyaWFudChyZXZpc2lvbnNTdGF0ZSwgJ0RpZmYgVmlldyBJbnRlcm5hbCBFcnJvcjogcmV2aXNpb25zU3RhdGUgY2Fubm90IGJlIG51bGwnKTtcbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIGludmFyaWFudChyZXZpc2lvbnMubGVuZ3RoID4gMCwgJ0RpZmYgVmlldyBFcnJvcjogQ2Fubm90IGFtZW5kIG5vbi1leGlzdGluZyBjb21taXQnKTtcbiAgICByZXR1cm4gcmV2aXNpb25zW3JldmlzaW9ucy5sZW5ndGggLSAxXS5kZXNjcmlwdGlvbjtcbiAgfVxuXG4gIF9sb2FkQWN0aXZlUmVwb3NpdG9yeVRlbXBsYXRlQ29tbWl0TWVzc2FnZSgpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGlmZiBWaWV3OiBObyBhY3RpdmUgZmlsZSBvciByZXBvc2l0b3J5IG9wZW4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgfVxuXG4gIGFzeW5jIGdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCk6IFByb21pc2U8P1JldmlzaW9uc1N0YXRlPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgfVxuXG4gIF9zZXRTdGF0ZShuZXdTdGF0ZTogU3RhdGUpIHtcbiAgICB0aGlzLl9zdGF0ZSA9IG5ld1N0YXRlO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChESURfVVBEQVRFX1NUQVRFX0VWRU5UKTtcbiAgfVxuXG4gIGFzeW5jIGNvbW1pdChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIGNvbW1pdE1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZS5BV0FJVElOR19DT01NSVQsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY3RpdmVTdGFjayA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaztcbiAgICB0cnkge1xuICAgICAgaW52YXJpYW50KGFjdGl2ZVN0YWNrLCAnTm8gYWN0aXZlIHJlcG9zaXRvcnkgc3RhY2snKTtcbiAgICAgIHN3aXRjaCAodGhpcy5fc3RhdGUuY29tbWl0TW9kZSkge1xuICAgICAgICBjYXNlIENvbW1pdE1vZGUuQ09NTUlUOlxuICAgICAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLmNvbW1pdChtZXNzYWdlKTtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnQ29tbWl0IGNyZWF0ZWQnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBDb21taXRNb2RlLkFNRU5EOlxuICAgICAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLmFtZW5kKG1lc3NhZ2UpO1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb21taXQgYW1lbmRlZCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgLy8gRm9yY2UgdHJpZ2dlciBhbiB1cGRhdGUgdG8gdGhlIHJldmlzaW9ucyB0byB1cGRhdGUgdGhlIFVJIHN0YXRlIHdpdGggdGhlIG5ldyBjb21pdCBpbmZvLlxuICAgICAgYWN0aXZlU3RhY2suZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAnRXJyb3IgY3JlYXRpbmcgY29tbWl0JyxcbiAgICAgICAge2RldGFpbDogYERldGFpbHM6ICR7ZS5zdGRvdXR9YH0sXG4gICAgICApO1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuUkVBRFksXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBnZXRTdGF0ZSgpOiBTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICB9XG5cbiAgc2V0Q29tbWl0TW9kZShjb21taXRNb2RlOiBDb21taXRNb2RlVHlwZSk6IHZvaWQge1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgY29tbWl0TW9kZSxcbiAgICB9KTtcbiAgICAvLyBXaGVuIHRoZSBjb21taXQgbW9kZSBjaGFuZ2VzLCBsb2FkIHRoZSBhcHByb3ByaWF0ZSBjb21taXQgbWVzc2FnZS5cbiAgICB0aGlzLl9sb2FkQ29tbWl0TW9kZVN0YXRlKCk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVSZXBvc2l0b3JpZXMoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5U3RhY2sgb2YgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmFjdGl2YXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmRlYWN0aXZhdGUoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZShnZXRJbml0aWFsRmlsZUNoYW5nZVN0YXRlKCkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnlTdGFjayBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmNsZWFyKCk7XG4gICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2YgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmNsZWFyKCk7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIGlmICh0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlZpZXdNb2RlbDtcbiJdfQ==