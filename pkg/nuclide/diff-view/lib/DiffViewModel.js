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
      isCommitMessageLoading: false,
      commitMode: _constants.CommitMode.COMMIT,
      publishMessageLoading: true,
      publishMessage: '',
      publishMode: _constants.PublishMode.CREATE,
      isPublishing: false,
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
      if (repositoryStack === this._activeRepositoryStack) {
        (0, _analytics.track)('diff-view-update-timeline-revisions', {
          revisionsCount: '' + revisionsState.revisions.length
        });
        var revisions = revisionsState.revisions;

        (0, _assert2['default'])(revisions.length > 0, 'Diff View Error: Zero Revisions');
        var _headRevision = revisions[revisions.length - 1];
        var headMessage = _headRevision.description;
        // TODO(most): Use @mareksapota's utility when done.
        var hasPhabricatorRevision = headMessage.indexOf('Differential Revision:') !== -1;
        this._setState(_extends({}, this._state, {
          publishMessageLoading: false,
          publishMessage: hasPhabricatorRevision ? UPDATE_REVISION_TEMPLATE : headMessage,
          isPublishing: false,
          publishMode: hasPhabricatorRevision ? _constants.PublishMode.UPDATE : _constants.PublishMode.CREATE,
          headRevision: _headRevision
        }));
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
    key: 'setPublishMessage',
    value: function setPublishMessage(publishMessage) {
      this._setState(_extends({}, this._state, {
        publishMessage: publishMessage
      }));
    }
  }, {
    key: 'setViewMode',
    value: function setViewMode(viewMode) {
      this._setState(_extends({}, this._state, {
        viewMode: viewMode
      }));
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
        isPublishing: true
      }));
      // TODO(most): do publish to Phabricator.
      var headRevision = this._state.headRevision;
      try {
        yield _commons.promises.awaitMilliSeconds(5000);
        headRevision = yield Promise.resolve(null);
        // Switch to browse mode after a successful publish.
        this.setViewMode(_constants.DiffMode.BROWSE_MODE);
      } catch (error) {
        (0, _notifications.notifyInternalError)(error);
      } finally {
        this._setState(_extends({}, this._state, {
          publishMessage: publishMessage,
          isPublishing: false,
          headRevision: headRevision
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

    // TODO(ssorallen): This should be removed by moving the DiffMode from DiffViewComponent's state
    //   into this model. After that, commit message loading can be triggered by either changing the
    //   the diff mode *or* the commit mode.
  }, {
    key: 'loadCommitMessage',
    value: _asyncToGenerator(function* () {
      this._setState(_extends({}, this._state, {
        isCommitMessageLoading: true
      }));
      var commitMessage = null;
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
          isCommitMessageLoading: false
        }));
      }
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
      this.loadCommitMessage();
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
//# sourceMappingURL=data:application/json;base64,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QWUsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDN0QsdUJBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUMzQjtBQUNELFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMvQixXQUFLLElBQU0sWUFBWSxJQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUNqRSxvQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3hCO0FBQ0QsVUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMvQixVQUFJLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLEVBQUU7QUFDckMsWUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BDLFlBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7T0FDbEM7S0FDRjs7O1NBeGlCRyxhQUFhOzs7QUEyaUJuQixNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJEaWZmVmlld01vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge1xuICBGaWxlQ2hhbmdlU3RhdGUsXG4gIFJldmlzaW9uc1N0YXRlLFxuICBGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsXG4gIEhnRGlmZlN0YXRlLFxuICBDb21taXRNb2RlVHlwZSxcbiAgUHVibGlzaE1vZGVUeXBlLFxuICBEaWZmTW9kZVR5cGUsXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtDb21taXRNb2RlLCBEaWZmTW9kZSwgUHVibGlzaE1vZGV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7cmVwb3NpdG9yeUZvclBhdGh9IGZyb20gJy4uLy4uL2hnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1Db250ZW50c30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2FycmF5LCBtYXAsIGRlYm91bmNlLCBwcm9taXNlc30gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgUmVwb3NpdG9yeVN0YWNrIGZyb20gJy4vUmVwb3NpdG9yeVN0YWNrJztcbmltcG9ydCB7XG4gIG5vdGlmeUludGVybmFsRXJyb3IsXG4gIG5vdGlmeUZpbGVzeXN0ZW1PdmVycmlkZVVzZXJFZGl0cyxcbn0gZnJvbSAnLi9ub3RpZmljYXRpb25zJztcbmltcG9ydCB7YnVmZmVyRm9yVXJpfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuXG5jb25zdCBDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5UID0gJ2RpZC1jaGFuZ2UtZGlydHktc3RhdHVzJztcbmNvbnN0IENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCA9ICdkaWQtY2hhbmdlLWNvbXBhcmUtc3RhdHVzJztcbmNvbnN0IEFDVElWRV9GSUxFX1VQREFURV9FVkVOVCA9ICdhY3RpdmUtZmlsZS11cGRhdGUnO1xuY29uc3QgQ0hBTkdFX1JFVklTSU9OU19FVkVOVCA9ICdkaWQtY2hhbmdlLXJldmlzaW9ucyc7XG5jb25zdCBBQ1RJVkVfQlVGRkVSX0NIQU5HRV9NT0RJRklFRF9FVkVOVCA9ICdhY3RpdmUtYnVmZmVyLWNoYW5nZS1tb2RpZmllZCc7XG5jb25zdCBESURfVVBEQVRFX1NUQVRFX0VWRU5UID0gJ2RpZC11cGRhdGUtc3RhdGUnO1xuY29uc3QgVVBEQVRFX1JFVklTSU9OX1RFTVBMQVRFID0gJyc7XG5cbmNvbnN0IEZJTEVfQ0hBTkdFX0RFQk9VTkNFX01TID0gMjAwO1xuY29uc3QgVUlfQ0hBTkdFX0RFQk9VTkNFX01TID0gMTAwO1xuXG4vLyBSZXR1cm5zIGEgc3RyaW5nIHdpdGggYWxsIG5ld2xpbmUgc3RyaW5ncywgJ1xcXFxuJywgY29udmVydGVkIHRvIGxpdGVyYWwgbmV3bGluZXMsICdcXG4nLlxuZnVuY3Rpb24gY29udmVydE5ld2xpbmVzKG1lc3NhZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBtZXNzYWdlLnJlcGxhY2UoL1xcXFxuL2csICdcXG4nKTtcbn1cblxuZnVuY3Rpb24gZ2V0SW5pdGlhbEZpbGVDaGFuZ2VTdGF0ZSgpOiBGaWxlQ2hhbmdlU3RhdGUge1xuICByZXR1cm4ge1xuICAgIGZyb21SZXZpc2lvblRpdGxlOiAnTm8gZmlsZSBzZWxlY3RlZCcsXG4gICAgdG9SZXZpc2lvblRpdGxlOiAnTm8gZmlsZSBzZWxlY3RlZCcsXG4gICAgZmlsZVBhdGg6ICcnLFxuICAgIG9sZENvbnRlbnRzOiAnJyxcbiAgICBuZXdDb250ZW50czogJycsXG4gICAgY29tcGFyZVJldmlzaW9uSW5mbzogbnVsbCxcbiAgfTtcbn1cblxudHlwZSBTdGF0ZSA9IHtcbiAgdmlld01vZGU6IERpZmZNb2RlVHlwZTtcbiAgY29tbWl0TWVzc2FnZTogP3N0cmluZztcbiAgaXNDb21taXRNZXNzYWdlTG9hZGluZzogYm9vbGVhbjtcbiAgY29tbWl0TW9kZTogQ29tbWl0TW9kZVR5cGU7XG4gIHB1Ymxpc2hNZXNzYWdlTG9hZGluZzogYm9vbGVhbjtcbiAgcHVibGlzaE1lc3NhZ2U6IHN0cmluZztcbiAgaXNQdWJsaXNoaW5nOiBib29sZWFuO1xuICBwdWJsaXNoTW9kZTogUHVibGlzaE1vZGVUeXBlO1xuICBoZWFkUmV2aXNpb246ID9SZXZpc2lvbkluZm87XG59O1xuXG5jbGFzcyBEaWZmVmlld01vZGVsIHtcblxuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9hY3RpdmVTdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGl2ZUZpbGVTdGF0ZTogRmlsZUNoYW5nZVN0YXRlO1xuICBfYWN0aXZlUmVwb3NpdG9yeVN0YWNrOiA/UmVwb3NpdG9yeVN0YWNrO1xuICBfbmV3RWRpdG9yOiA/VGV4dEVkaXRvcjtcbiAgX2RpcnR5RmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfY29tcGFyZUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgX3VpUHJvdmlkZXJzOiBBcnJheTxPYmplY3Q+O1xuICBfcmVwb3NpdG9yeVN0YWNrczogTWFwPEhnUmVwb3NpdG9yeUNsaWVudCwgUmVwb3NpdG9yeVN0YWNrPjtcbiAgX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zOiBNYXA8SGdSZXBvc2l0b3J5Q2xpZW50LCBDb21wb3NpdGVEaXNwb3NhYmxlPjtcbiAgX2lzQWN0aXZlOiBib29sZWFuO1xuICBfc3RhdGU6IFN0YXRlO1xuICBfZGVib3VuY2VkRW1pdEFjdGl2ZUZpbGVVcGRhdGU6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IodWlQcm92aWRlcnM6IEFycmF5PE9iamVjdD4pIHtcbiAgICB0aGlzLl91aVByb3ZpZGVycyA9IHVpUHJvdmlkZXJzO1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIHZpZXdNb2RlOiBEaWZmTW9kZS5CUk9XU0VfTU9ERSxcbiAgICAgIGNvbW1pdE1lc3NhZ2U6IG51bGwsXG4gICAgICBpc0NvbW1pdE1lc3NhZ2VMb2FkaW5nOiBmYWxzZSxcbiAgICAgIGNvbW1pdE1vZGU6IENvbW1pdE1vZGUuQ09NTUlULFxuICAgICAgcHVibGlzaE1lc3NhZ2VMb2FkaW5nOiB0cnVlLFxuICAgICAgcHVibGlzaE1lc3NhZ2U6ICcnLFxuICAgICAgcHVibGlzaE1vZGU6IFB1Ymxpc2hNb2RlLkNSRUFURSxcbiAgICAgIGlzUHVibGlzaGluZzogZmFsc2UsXG4gICAgICBoZWFkUmV2aXNpb246IG51bGwsXG4gICAgfTtcbiAgICB0aGlzLl91cGRhdGVSZXBvc2l0b3JpZXMoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyh0aGlzLl91cGRhdGVSZXBvc2l0b3JpZXMuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuX2RlYm91bmNlZEVtaXRBY3RpdmVGaWxlVXBkYXRlID0gZGVib3VuY2UoXG4gICAgICB0aGlzLl9lbWl0QWN0aXZlRmlsZVVwZGF0ZS5iaW5kKHRoaXMpLFxuICAgICAgVUlfQ0hBTkdFX0RFQk9VTkNFX01TLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoZ2V0SW5pdGlhbEZpbGVDaGFuZ2VTdGF0ZSgpKTtcbiAgfVxuXG4gIF91cGRhdGVSZXBvc2l0b3JpZXMoKTogdm9pZCB7XG4gICAgY29uc3QgcmVwb3NpdG9yaWVzID0gbmV3IFNldChcbiAgICAgIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKS5maWx0ZXIoXG4gICAgICAgIHJlcG9zaXRvcnkgPT4gcmVwb3NpdG9yeSAhPSBudWxsICYmIHJlcG9zaXRvcnkuZ2V0VHlwZSgpID09PSAnaGcnXG4gICAgICApXG4gICAgKTtcbiAgICAvLyBEaXNwb3NlIHJlbW92ZWQgcHJvamVjdHMgcmVwb3NpdG9yaWVzLlxuICAgIGZvciAoY29uc3QgW3JlcG9zaXRvcnksIHJlcG9zaXRvcnlTdGFja10gb2YgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcykge1xuICAgICAgaWYgKHJlcG9zaXRvcmllcy5oYXMocmVwb3NpdG9yeSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICByZXBvc2l0b3J5U3RhY2suZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5kZWxldGUocmVwb3NpdG9yeSk7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuZ2V0KHJlcG9zaXRvcnkpO1xuICAgICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5kZWxldGUocmVwb3NpdG9yeSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5IG9mIHJlcG9zaXRvcmllcykge1xuICAgICAgaWYgKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuaGFzKHJlcG9zaXRvcnkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgICAgdGhpcy5fY3JlYXRlUmVwb3NpdG9yeVN0YWNrKGhnUmVwb3NpdG9yeSk7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlRGlydHlDaGFuZ2VkU3RhdHVzKCk7XG4gIH1cblxuICBfdXBkYXRlRGlydHlDaGFuZ2VkU3RhdHVzKCk6IHZvaWQge1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMgPSB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSBtYXAudW5pb24oLi4uYXJyYXlcbiAgICAgIC5mcm9tKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpXG4gICAgICAubWFwKHJlcG9zaXRvcnlTdGFjayA9PiByZXBvc2l0b3J5U3RhY2suZ2V0RGlydHlGaWxlQ2hhbmdlcygpKVxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMpO1xuICB9XG5cbiAgX2NyZWF0ZVJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQpOiBSZXBvc2l0b3J5U3RhY2sge1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IG5ldyBSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeSk7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICByZXBvc2l0b3J5U3RhY2sub25EaWRDaGFuZ2VEaXJ0eVN0YXR1cyh0aGlzLl91cGRhdGVEaXJ0eUNoYW5nZWRTdGF0dXMuYmluZCh0aGlzKSksXG4gICAgICByZXBvc2l0b3J5U3RhY2sub25EaWRDaGFuZ2VDb21wYXJlU3RhdHVzKHRoaXMuX3VwZGF0ZUNvbXBhcmVDaGFuZ2VkU3RhdHVzLmJpbmQodGhpcykpLFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlUmV2aXNpb25zKHJldmlzaW9uc1N0YXRlID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhyZXBvc2l0b3J5U3RhY2ssIHJldmlzaW9uc1N0YXRlLCB0cnVlKVxuICAgICAgICAgIC5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5zZXQocmVwb3NpdG9yeSwgcmVwb3NpdG9yeVN0YWNrKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5zZXQocmVwb3NpdG9yeSwgc3Vic2NyaXB0aW9ucyk7XG4gICAgaWYgKHRoaXMuX2lzQWN0aXZlKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suYWN0aXZhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcG9zaXRvcnlTdGFjaztcbiAgfVxuXG4gIF91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cygpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSBtYXAudW5pb24oLi4uYXJyYXlcbiAgICAgIC5mcm9tKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpXG4gICAgICAubWFwKHJlcG9zaXRvcnlTdGFjayA9PiByZXBvc2l0b3J5U3RhY2suZ2V0Q29tcGFyZUZpbGVDaGFuZ2VzKCkpXG4gICAgKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5ULCB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMpO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMoXG4gICAgcmVwb3NpdG9yeVN0YWNrOiBSZXBvc2l0b3J5U3RhY2ssXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICAgIHJlbG9hZEZpbGVEaWZmOiBib29sZWFuLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAocmVwb3NpdG9yeVN0YWNrID09PSB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2spIHtcbiAgICAgIHRyYWNrKCdkaWZmLXZpZXctdXBkYXRlLXRpbWVsaW5lLXJldmlzaW9ucycsIHtcbiAgICAgICAgcmV2aXNpb25zQ291bnQ6IGAke3JldmlzaW9uc1N0YXRlLnJldmlzaW9ucy5sZW5ndGh9YCxcbiAgICAgIH0pO1xuICAgICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAgIGludmFyaWFudChyZXZpc2lvbnMubGVuZ3RoID4gMCwgJ0RpZmYgVmlldyBFcnJvcjogWmVybyBSZXZpc2lvbnMnKTtcbiAgICAgIGNvbnN0IGhlYWRSZXZpc2lvbiA9IHJldmlzaW9uc1tyZXZpc2lvbnMubGVuZ3RoIC0gMV07XG4gICAgICBjb25zdCBoZWFkTWVzc2FnZSA9IGhlYWRSZXZpc2lvbi5kZXNjcmlwdGlvbjtcbiAgICAgIC8vIFRPRE8obW9zdCk6IFVzZSBAbWFyZWtzYXBvdGEncyB1dGlsaXR5IHdoZW4gZG9uZS5cbiAgICAgIGNvbnN0IGhhc1BoYWJyaWNhdG9yUmV2aXNpb24gPSBoZWFkTWVzc2FnZS5pbmRleE9mKCdEaWZmZXJlbnRpYWwgUmV2aXNpb246JykgIT09IC0xO1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgcHVibGlzaE1lc3NhZ2VMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgcHVibGlzaE1lc3NhZ2U6IGhhc1BoYWJyaWNhdG9yUmV2aXNpb25cbiAgICAgICAgICA/IFVQREFURV9SRVZJU0lPTl9URU1QTEFURVxuICAgICAgICAgIDogaGVhZE1lc3NhZ2UsXG4gICAgICAgIGlzUHVibGlzaGluZzogZmFsc2UsXG4gICAgICAgIHB1Ymxpc2hNb2RlOiBoYXNQaGFicmljYXRvclJldmlzaW9uID8gUHVibGlzaE1vZGUuVVBEQVRFIDogUHVibGlzaE1vZGUuQ1JFQVRFLFxuICAgICAgICBoZWFkUmV2aXNpb24sXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgYWN0aXZlIGZpbGUsIGlmIGNoYW5nZWQuXG4gICAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgICAgaWYgKCFmaWxlUGF0aCB8fCAhcmVsb2FkRmlsZURpZmYpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3Qge1xuICAgICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgICByZXZpc2lvbkluZm8sXG4gICAgICB9ID0gYXdhaXQgdGhpcy5fZmV0Y2hIZ0RpZmYoZmlsZVBhdGgpO1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgICAgcmV2aXNpb25JbmZvLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBzZXRQdWJsaXNoTWVzc2FnZShwdWJsaXNoTWVzc2FnZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBwdWJsaXNoTWVzc2FnZSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldFZpZXdNb2RlKHZpZXdNb2RlOiBEaWZmTW9kZVR5cGUpIHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHZpZXdNb2RlLFxuICAgIH0pO1xuICB9XG5cbiAgYWN0aXZhdGVGaWxlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBjb25zdCBhY3RpdmVTdWJzY3JpcHRpb25zID0gdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgLy8gVE9ETyhtb3N0KTogU2hvdyBwcm9ncmVzcyBpbmRpY2F0b3I6IHQ4OTkxNjc2XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICBjb25zdCB7ZmlsZX0gPSBidWZmZXI7XG4gICAgaWYgKGZpbGUgIT0gbnVsbCkge1xuICAgICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoZmlsZS5vbkRpZENoYW5nZShkZWJvdW5jZShcbiAgICAgICAgKCkgPT4gdGhpcy5fb25EaWRGaWxlQ2hhbmdlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKSxcbiAgICAgICAgRklMRV9DSEFOR0VfREVCT1VOQ0VfTVMsXG4gICAgICAgIGZhbHNlLFxuICAgICAgKSkpO1xuICAgIH1cbiAgICBhY3RpdmVTdWJzY3JpcHRpb25zLmFkZChidWZmZXIub25EaWRDaGFuZ2VNb2RpZmllZChcbiAgICAgIHRoaXMuX29uRGlkQnVmZmVyQ2hhbmdlTW9kaWZpZWQuYmluZCh0aGlzKSxcbiAgICApKTtcbiAgICB0cmFjaygnZGlmZi12aWV3LW9wZW4tZmlsZScsIHtmaWxlUGF0aH0pO1xuICAgIHRoaXMuX3VwZGF0ZUFjdGl2ZURpZmZTdGF0ZShmaWxlUGF0aCkuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5maWxlLWNoYW5nZS11cGRhdGUnKVxuICBhc3luYyBfb25EaWRGaWxlQ2hhbmdlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZS5maWxlUGF0aCAhPT0gZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmlsZXN5c3RlbUNvbnRlbnRzID0gYXdhaXQgZ2V0RmlsZVN5c3RlbUNvbnRlbnRzKGZpbGVQYXRoKTtcbiAgICBjb25zdCB7XG4gICAgICBvbGRDb250ZW50czogY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBjb21wYXJlUmV2aXNpb25JbmZvOiByZXZpc2lvbkluZm8sXG4gICAgfSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBpbnZhcmlhbnQocmV2aXNpb25JbmZvLCAnRGlmZiBWaWV3OiBSZXZpc2lvbiBpbmZvIG11c3QgYmUgZGVmaW5lZCB0byB1cGRhdGUgY2hhbmdlZCBzdGF0ZScpO1xuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZTdGF0ZUlmQ2hhbmdlZChcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgKTtcbiAgfVxuXG4gIF9vbkRpZEJ1ZmZlckNoYW5nZU1vZGlmaWVkKCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChBQ1RJVkVfQlVGRkVSX0NIQU5HRV9NT0RJRklFRF9FVkVOVCk7XG4gIH1cblxuICBvbkRpZEFjdGl2ZUJ1ZmZlckNoYW5nZU1vZGlmaWVkKFxuICAgIGNhbGxiYWNrOiAoKSA9PiBtaXhlZCxcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBpc0FjdGl2ZUJ1ZmZlck1vZGlmaWVkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICByZXR1cm4gYnVmZmVyLmlzTW9kaWZpZWQoKTtcbiAgfVxuXG4gIF91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29tbWl0dGVkQ29udGVudHM6IHN0cmluZyxcbiAgICBmaWxlc3lzdGVtQ29udGVudHM6IHN0cmluZyxcbiAgICByZXZpc2lvbkluZm86IFJldmlzaW9uSW5mbyxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge1xuICAgICAgZmlsZVBhdGg6IGFjdGl2ZUZpbGVQYXRoLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgIH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaWYgKGZpbGVQYXRoICE9PSBhY3RpdmVGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICBjb25zdCB1cGRhdGVkRGlmZlN0YXRlID0ge1xuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfTtcbiAgICBpZiAoc2F2ZWRDb250ZW50cyA9PT0gbmV3Q29udGVudHMgfHwgZmlsZXN5c3RlbUNvbnRlbnRzID09PSBuZXdDb250ZW50cykge1xuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShmaWxlUGF0aCwgdXBkYXRlZERpZmZTdGF0ZSk7XG4gICAgfVxuICAgIC8vIFRoZSB1c2VyIGhhdmUgZWRpdGVkIHNpbmNlIHRoZSBsYXN0IHVwZGF0ZS5cbiAgICBpZiAoZmlsZXN5c3RlbUNvbnRlbnRzID09PSBzYXZlZENvbnRlbnRzKSB7XG4gICAgICAvLyBUaGUgY2hhbmdlcyBoYXZlbid0IHRvdWNoZWQgdGhlIGZpbGVzeXN0ZW0sIGtlZXAgdXNlciBlZGl0cy5cbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICB7Li4udXBkYXRlZERpZmZTdGF0ZSwgZmlsZXN5c3RlbUNvbnRlbnRzOiBuZXdDb250ZW50c30sXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgY29tbWl0dGVkIGFuZCBmaWxlc3lzdGVtIHN0YXRlIGhhdmUgY2hhbmdlZCwgbm90aWZ5IG9mIG92ZXJyaWRlLlxuICAgICAgbm90aWZ5RmlsZXN5c3RlbU92ZXJyaWRlVXNlckVkaXRzKGZpbGVQYXRoKTtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGgsIHVwZGF0ZWREaWZmU3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIHNldE5ld0NvbnRlbnRzKG5ld0NvbnRlbnRzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoey4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSwgbmV3Q29udGVudHN9KTtcbiAgfVxuXG4gIHNldFJldmlzaW9uKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiB2b2lkIHtcbiAgICB0cmFjaygnZGlmZi12aWV3LXNldC1yZXZpc2lvbicpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaztcbiAgICBpbnZhcmlhbnQocmVwb3NpdG9yeVN0YWNrLCAnVGhlcmUgbXVzdCBiZSBhbiBhY3RpdmUgcmVwb3NpdG9yeSBzdGFjayEnKTtcbiAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUgPSB7Li4udGhpcy5fYWN0aXZlRmlsZVN0YXRlLCBjb21wYXJlUmV2aXNpb25JbmZvOiByZXZpc2lvbn07XG4gICAgcmVwb3NpdG9yeVN0YWNrLnNldFJldmlzaW9uKHJldmlzaW9uKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIGdldEFjdGl2ZUZpbGVTdGF0ZSgpOiBGaWxlQ2hhbmdlU3RhdGUge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQWN0aXZlRGlmZlN0YXRlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBoZ0RpZmZTdGF0ZSA9IGF3YWl0IHRoaXMuX2ZldGNoSGdEaWZmKGZpbGVQYXRoKTtcbiAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGgsIGhnRGlmZlN0YXRlKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVEaWZmU3RhdGUoZmlsZVBhdGg6IE51Y2xpZGVVcmksIGhnRGlmZlN0YXRlOiBIZ0RpZmZTdGF0ZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzOiBvbGRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50czogbmV3Q29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfSA9IGhnRGlmZlN0YXRlO1xuICAgIGNvbnN0IHtoYXNoLCBib29rbWFya3N9ID0gcmV2aXNpb25JbmZvO1xuICAgIGNvbnN0IG5ld0ZpbGVTdGF0ZSA9IHtcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgb2xkQ29udGVudHMsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHM6IG5ld0NvbnRlbnRzLFxuICAgICAgY29tcGFyZVJldmlzaW9uSW5mbzogcmV2aXNpb25JbmZvLFxuICAgICAgZnJvbVJldmlzaW9uVGl0bGU6IGAke2hhc2h9YCArIChib29rbWFya3MubGVuZ3RoID09PSAwID8gJycgOiBgIC0gKCR7Ym9va21hcmtzLmpvaW4oJywgJyl9KWApLFxuICAgICAgdG9SZXZpc2lvblRpdGxlOiAnRmlsZXN5c3RlbSAvIEVkaXRvcicsXG4gICAgfTtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUobmV3RmlsZVN0YXRlKTtcbiAgICAvLyBUT0RPKG1vc3QpOiBGaXg6IHRoaXMgYXNzdW1lcyB0aGF0IHRoZSBlZGl0b3IgY29udGVudHMgYXJlbid0IGNoYW5nZWQgd2hpbGVcbiAgICAvLyBmZXRjaGluZyB0aGUgY29tbWVudHMsIHRoYXQncyBva2F5IG5vdyBiZWNhdXNlIHdlIGRvbid0IGZldGNoIHRoZW0uXG4gICAgY29uc3QgaW5saW5lQ29tcG9uZW50cyA9IGF3YWl0IHRoaXMuX2ZldGNoSW5saW5lQ29tcG9uZW50cygpO1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZSh7Li4ubmV3RmlsZVN0YXRlLCBpbmxpbmVDb21wb25lbnRzfSk7XG4gIH1cblxuICBfc2V0QWN0aXZlRmlsZVN0YXRlKHN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLl9kZWJvdW5jZWRFbWl0QWN0aXZlRmlsZVVwZGF0ZSgpO1xuICB9XG5cbiAgX2VtaXRBY3RpdmVGaWxlVXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQsIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5oZy1zdGF0ZS11cGRhdGUnKVxuICBhc3luYyBfZmV0Y2hIZ0RpZmYoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPEhnRGlmZlN0YXRlPiB7XG4gICAgLy8gQ2FsbGluZyBhdG9tLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeSBnZXRzIHRoZSByZWFsIHBhdGggb2YgdGhlIGRpcmVjdG9yeSxcbiAgICAvLyB3aGljaCBpcyBhbm90aGVyIHJvdW5kLXRyaXAgYW5kIGNhbGxzIHRoZSByZXBvc2l0b3J5IHByb3ZpZGVycyB0byBnZXQgYW4gZXhpc3RpbmcgcmVwb3NpdG9yeS5cbiAgICAvLyBJbnN0ZWFkLCB0aGUgZmlyc3QgbWF0Y2ggb2YgdGhlIGZpbHRlcmluZyBoZXJlIGlzIHRoZSBvbmx5IHBvc3NpYmxlIG1hdGNoLlxuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aCk7XG4gICAgaWYgKHJlcG9zaXRvcnkgPT0gbnVsbCB8fCByZXBvc2l0b3J5LmdldFR5cGUoKSAhPT0gJ2hnJykge1xuICAgICAgY29uc3QgdHlwZSA9IHJlcG9zaXRvcnkgPyByZXBvc2l0b3J5LmdldFR5cGUoKSA6ICdubyByZXBvc2l0b3J5JztcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRGlmZiB2aWV3IG9ubHkgc3VwcG9ydHMgXFxgTWVyY3VyaWFsXFxgIHJlcG9zaXRvcmllcywgYnV0IGZvdW5kIFxcYCR7dHlwZX1cXGBgKTtcbiAgICB9XG5cbiAgICBjb25zdCBoZ1JlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCA9IChyZXBvc2l0b3J5OiBhbnkpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuZ2V0KGhnUmVwb3NpdG9yeSk7XG4gICAgaW52YXJpYW50KHJlcG9zaXRvcnlTdGFjaywgJ1RoZXJlIG11c3QgYmUgYW4gcmVwb3NpdG9yeSBzdGFjayBmb3IgYSBnaXZlbiByZXBvc2l0b3J5IScpO1xuICAgIGNvbnN0IFtoZ0RpZmZdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmZldGNoSGdEaWZmKGZpbGVQYXRoKSxcbiAgICAgIHRoaXMuX3NldEFjdGl2ZVJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5U3RhY2spLFxuICAgIF0pO1xuICAgIHJldHVybiBoZ0RpZmY7XG4gIH1cblxuICBhc3luYyBfc2V0QWN0aXZlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnlTdGFjazogUmVwb3NpdG9yeVN0YWNrKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PT0gcmVwb3NpdG9yeVN0YWNrKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9IHJlcG9zaXRvcnlTdGFjaztcbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZSA9IGF3YWl0IHJlcG9zaXRvcnlTdGFjay5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICB0aGlzLl91cGRhdGVDaGFuZ2VkUmV2aXNpb25zKHJlcG9zaXRvcnlTdGFjaywgcmV2aXNpb25zU3RhdGUsIGZhbHNlKTtcbiAgfVxuXG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuc2F2ZS1maWxlJylcbiAgYXN5bmMgc2F2ZUFjdGl2ZUZpbGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICB0cmFjaygnZGlmZi12aWV3LXNhdmUtZmlsZScsIHtmaWxlUGF0aH0pO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUuc2F2ZWRDb250ZW50cyA9IGF3YWl0IHRoaXMuX3NhdmVGaWxlKGZpbGVQYXRoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbm90aWZ5SW50ZXJuYWxFcnJvcihlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcucHVibGlzaC1kaWZmJylcbiAgYXN5bmMgcHVibGlzaERpZmYocHVibGlzaE1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgcHVibGlzaE1lc3NhZ2UsXG4gICAgICBpc1B1Ymxpc2hpbmc6IHRydWUsXG4gICAgfSk7XG4gICAgLy8gVE9ETyhtb3N0KTogZG8gcHVibGlzaCB0byBQaGFicmljYXRvci5cbiAgICBsZXQgaGVhZFJldmlzaW9uID0gdGhpcy5fc3RhdGUuaGVhZFJldmlzaW9uO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBwcm9taXNlcy5hd2FpdE1pbGxpU2Vjb25kcyg1MDAwKTtcbiAgICAgIGhlYWRSZXZpc2lvbiA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICAgIC8vIFN3aXRjaCB0byBicm93c2UgbW9kZSBhZnRlciBhIHN1Y2Nlc3NmdWwgcHVibGlzaC5cbiAgICAgIHRoaXMuc2V0Vmlld01vZGUoRGlmZk1vZGUuQlJPV1NFX01PREUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgcHVibGlzaE1lc3NhZ2UsXG4gICAgICAgIGlzUHVibGlzaGluZzogZmFsc2UsXG4gICAgICAgIGhlYWRSZXZpc2lvbixcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9zYXZlRmlsZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICBpZiAoYnVmZmVyID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgZmlsZSBidWZmZXIgdG8gc2F2ZTogXFxgJHtmaWxlUGF0aH1cXGBgKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGJ1ZmZlci5zYXZlKCk7XG4gICAgICByZXR1cm4gYnVmZmVyLmdldFRleHQoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHNhdmUgZmlsZSBidWZmZXI6IFxcYCR7ZmlsZVBhdGh9XFxgIC0gJHtlcnIudG9TdHJpbmcoKX1gKTtcbiAgICB9XG4gIH1cblxuICBvbkRpZFVwZGF0ZVN0YXRlKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihESURfVVBEQVRFX1NUQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZURpcnR5U3RhdHVzKFxuICAgIGNhbGxiYWNrOiAoZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGNvbXBhcmVGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25SZXZpc2lvbnNVcGRhdGUoY2FsbGJhY2s6IChzdGF0ZTogP1JldmlzaW9uc1N0YXRlKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uQWN0aXZlRmlsZVVwZGF0ZXMoY2FsbGJhY2s6IChzdGF0ZTogRmlsZUNoYW5nZVN0YXRlKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKEFDVElWRV9GSUxFX1VQREFURV9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtY29tbWVudHMnKVxuICBhc3luYyBfZmV0Y2hJbmxpbmVDb21wb25lbnRzKCk6IFByb21pc2U8QXJyYXk8T2JqZWN0Pj4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgY29uc3QgdWlFbGVtZW50UHJvbWlzZXMgPSB0aGlzLl91aVByb3ZpZGVycy5tYXAoXG4gICAgICBwcm92aWRlciA9PiBwcm92aWRlci5jb21wb3NlVWlFbGVtZW50cyhmaWxlUGF0aClcbiAgICApO1xuICAgIGNvbnN0IHVpQ29tcG9uZW50TGlzdHMgPSBhd2FpdCBQcm9taXNlLmFsbCh1aUVsZW1lbnRQcm9taXNlcyk7XG4gICAgLy8gRmxhdHRlbiB1aUNvbXBvbmVudExpc3RzIGZyb20gbGlzdCBvZiBsaXN0cyBvZiBjb21wb25lbnRzIHRvIGEgbGlzdCBvZiBjb21wb25lbnRzLlxuICAgIGNvbnN0IHVpQ29tcG9uZW50cyA9IFtdLmNvbmNhdC5hcHBseShbXSwgdWlDb21wb25lbnRMaXN0cyk7XG4gICAgcmV0dXJuIHVpQ29tcG9uZW50cztcbiAgfVxuXG4gIGdldERpcnR5RmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgZ2V0Q29tcGFyZUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgLy8gVE9ETyhzc29yYWxsZW4pOiBUaGlzIHNob3VsZCBiZSByZW1vdmVkIGJ5IG1vdmluZyB0aGUgRGlmZk1vZGUgZnJvbSBEaWZmVmlld0NvbXBvbmVudCdzIHN0YXRlXG4gIC8vICAgaW50byB0aGlzIG1vZGVsLiBBZnRlciB0aGF0LCBjb21taXQgbWVzc2FnZSBsb2FkaW5nIGNhbiBiZSB0cmlnZ2VyZWQgYnkgZWl0aGVyIGNoYW5naW5nIHRoZVxuICAvLyAgIHRoZSBkaWZmIG1vZGUgKm9yKiB0aGUgY29tbWl0IG1vZGUuXG4gIGFzeW5jIGxvYWRDb21taXRNZXNzYWdlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgaXNDb21taXRNZXNzYWdlTG9hZGluZzogdHJ1ZSxcbiAgICB9KTtcbiAgICBsZXQgY29tbWl0TWVzc2FnZSA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLl9zdGF0ZS5jb21taXRNb2RlID09PSBDb21taXRNb2RlLkNPTU1JVCkge1xuICAgICAgICBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fbG9hZEFjdGl2ZVJlcG9zaXRvcnlUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgICAgICAgLy8gQ29tbWl0IHRlbXBsYXRlcyB0aGF0IGluY2x1ZGUgbmV3bGluZSBzdHJpbmdzLCAnXFxcXG4nIGluIEphdmFTY3JpcHQsIG5lZWQgdG8gY29udmVydCB0aGVpclxuICAgICAgICAvLyBzdHJpbmdzIHRvIGxpdGVyYWwgbmV3bGluZXMsICdcXG4nIGluIEphdmFTY3JpcHQsIHRvIGJlIHJlbmRlcmVkIGFzIGxpbmUgYnJlYWtzLlxuICAgICAgICBpZiAoY29tbWl0TWVzc2FnZSAhPSBudWxsKSB7XG4gICAgICAgICAgY29tbWl0TWVzc2FnZSA9IGNvbnZlcnROZXdsaW5lcyhjb21taXRNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2xvYWRBY3RpdmVSZXBvc2l0b3J5TGF0ZXN0Q29tbWl0TWVzc2FnZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TWVzc2FnZSxcbiAgICAgICAgaXNDb21taXRNZXNzYWdlTG9hZGluZzogZmFsc2UsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfbG9hZEFjdGl2ZVJlcG9zaXRvcnlMYXRlc3RDb21taXRNZXNzYWdlKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZmYgVmlldzogTm8gYWN0aXZlIGZpbGUgb3IgcmVwb3NpdG9yeSBvcGVuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRBY3RpdmVSZXZpc2lvbnNTdGF0ZSgpO1xuICAgIGludmFyaWFudChyZXZpc2lvbnNTdGF0ZSwgJ0RpZmYgVmlldyBJbnRlcm5hbCBFcnJvcjogcmV2aXNpb25zU3RhdGUgY2Fubm90IGJlIG51bGwnKTtcbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIGludmFyaWFudChyZXZpc2lvbnMubGVuZ3RoID4gMCwgJ0RpZmYgVmlldyBFcnJvcjogQ2Fubm90IGFtZW5kIG5vbi1leGlzdGluZyBjb21taXQnKTtcbiAgICByZXR1cm4gcmV2aXNpb25zW3JldmlzaW9ucy5sZW5ndGggLSAxXS5kZXNjcmlwdGlvbjtcbiAgfVxuXG4gIF9sb2FkQWN0aXZlUmVwb3NpdG9yeVRlbXBsYXRlQ29tbWl0TWVzc2FnZSgpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGlmZiBWaWV3OiBObyBhY3RpdmUgZmlsZSBvciByZXBvc2l0b3J5IG9wZW4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgfVxuXG4gIGFzeW5jIGdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCk6IFByb21pc2U8P1JldmlzaW9uc1N0YXRlPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgfVxuXG4gIF9zZXRTdGF0ZShuZXdTdGF0ZTogU3RhdGUpIHtcbiAgICB0aGlzLl9zdGF0ZSA9IG5ld1N0YXRlO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChESURfVVBEQVRFX1NUQVRFX0VWRU5UKTtcbiAgfVxuXG4gIGdldFN0YXRlKCk6IFN0YXRlIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhdGU7XG4gIH1cblxuICBzZXRDb21taXRNb2RlKGNvbW1pdE1vZGU6IENvbW1pdE1vZGVUeXBlKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBjb21taXRNb2RlLFxuICAgIH0pO1xuICAgIC8vIFdoZW4gdGhlIGNvbW1pdCBtb2RlIGNoYW5nZXMsIGxvYWQgdGhlIGFwcHJvcHJpYXRlIGNvbW1pdCBtZXNzYWdlLlxuICAgIHRoaXMubG9hZENvbW1pdE1lc3NhZ2UoKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcygpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnlTdGFjayBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suYWN0aXZhdGUoKTtcbiAgICB9XG4gIH1cblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2suZGVhY3RpdmF0ZSgpO1xuICAgICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKGdldEluaXRpYWxGaWxlQ2hhbmdlU3RhdGUoKSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIGZvciAoY29uc3QgcmVwb3NpdG9yeVN0YWNrIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpIHtcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuY2xlYXIoKTtcbiAgICBmb3IgKGNvbnN0IHN1YnNjcmlwdGlvbiBvZiB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuY2xlYXIoKTtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld01vZGVsO1xuIl19