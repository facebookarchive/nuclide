Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideArcanistClient = require('../../nuclide-arcanist-client');

var _nuclideArcanistClient2 = _interopRequireDefault(_nuclideArcanistClient);

var _atom = require('atom');

var _constants = require('./constants');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _utils = require('./utils');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _RepositoryStack = require('./RepositoryStack');

var _RepositoryStack2 = _interopRequireDefault(_RepositoryStack);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _notifications = require('./notifications');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideLogging = require('../../nuclide-logging');

var serializeAsyncCall = _nuclideCommons.promises.serializeAsyncCall;

var ACTIVE_FILE_UPDATE_EVENT = 'active-file-update';
var CHANGE_REVISIONS_EVENT = 'did-change-revisions';
var ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT = 'active-buffer-change-modified';
var DID_UPDATE_STATE_EVENT = 'did-update-state';

function getRevisionUpdateMessage(phabricatorRevision) {
  return '\n\n# Updating ' + phabricatorRevision.id + '\n#\n# Enter a brief description of the changes included in this update.\n# The first line is used as subject, next lines as comment.';
}

var FILE_CHANGE_DEBOUNCE_MS = 200;
var MAX_DIALOG_FILE_STATUS_COUNT = 20;

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

function viewModeToDiffOption(viewMode) {
  switch (viewMode) {
    case _constants.DiffMode.COMMIT_MODE:
      return _constants.DiffOption.DIRTY;
    case _constants.DiffMode.PUBLISH_MODE:
      return _constants.DiffOption.LAST_COMMIT;
    case _constants.DiffMode.BROWSE_MODE:
      return _constants.DiffOption.COMPARE_COMMIT;
    default:
      throw new Error('Unrecognized view mode!');
  }
}

function getFileStatusListMessage(fileChanges) {
  var message = '';
  if (fileChanges.size < MAX_DIALOG_FILE_STATUS_COUNT) {
    for (var _ref3 of fileChanges) {
      var _ref2 = _slicedToArray(_ref3, 2);

      var filePath = _ref2[0];
      var statusCode = _ref2[1];

      message += '\n' + _constants.FileChangeStatusToPrefix[statusCode] + atom.project.relativize(filePath);
    }
  } else {
    message = '\n more than ' + MAX_DIALOG_FILE_STATUS_COUNT + ' files (check using `hg status`)';
  }
  return message;
}

function hgRepositoryForPath(filePath) {
  // Calling atom.project.repositoryForDirectory gets the real path of the directory,
  // which is another round-trip and calls the repository providers to get an existing repository.
  // Instead, the first match of the filtering here is the only possible match.
  var repository = (0, _nuclideHgGitBridge.repositoryForPath)(filePath);
  if (repository == null || repository.getType() !== 'hg') {
    var type = repository ? repository.getType() : 'no repository';
    throw new Error('Diff view only supports `Mercurial` repositories, ' + ('but found `' + type + '` at path: `' + filePath + '`'));
  }
  return repository;
}

var DiffViewModel = (function () {
  function DiffViewModel(uiProviders) {
    var _this = this;

    _classCallCheck(this, DiffViewModel);

    this._uiProviders = uiProviders;
    this._emitter = new _atom.Emitter();
    this._subscriptions = new _atom.CompositeDisposable();
    this._repositoryStacks = new Map();
    this._repositorySubscriptions = new Map();
    this._isActive = false;
    this._messages = new _rx2['default'].Subject();
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
      lastCommitMergeFileChanges: new Map(),
      selectedFileChanges: new Map(),
      showNonHgRepos: true
    };
    this._serializedUpdateActiveFileDiff = serializeAsyncCall(function () {
      return _this._updateActiveFileDiff();
    });
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
      for (var _ref43 of this._repositoryStacks) {
        var _ref42 = _slicedToArray(_ref43, 2);

        var repository = _ref42[0];
        var repositoryStack = _ref42[1];

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
      var _this2 = this;

      var repositoryStack = new _RepositoryStack2['default'](repository);
      var subscriptions = new _atom.CompositeDisposable();
      subscriptions.add(repositoryStack.onDidUpdateDirtyFileChanges(this._updateDirtyChangedStatus.bind(this)), repositoryStack.onDidUpdateCommitMergeFileChanges(this._updateCommitMergeFileChanges.bind(this)), repositoryStack.onDidChangeRevisions(function (revisionsState) {
        _this2._updateChangedRevisions(repositoryStack, revisionsState, true)['catch'](_notifications.notifyInternalError);
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
      var dirtyFileChanges = _nuclideCommons.map.union.apply(_nuclideCommons.map, _toConsumableArray(_nuclideCommons.array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
        return repositoryStack.getDirtyFileChanges();
      })));
      this._updateCompareChangedStatus(dirtyFileChanges);
    }
  }, {
    key: '_updateCommitMergeFileChanges',
    value: function _updateCommitMergeFileChanges() {
      var commitMergeFileChanges = _nuclideCommons.map.union.apply(_nuclideCommons.map, _toConsumableArray(_nuclideCommons.array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
        return repositoryStack.getCommitMergeFileChanges();
      })));
      var lastCommitMergeFileChanges = _nuclideCommons.map.union.apply(_nuclideCommons.map, _toConsumableArray(_nuclideCommons.array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
        return repositoryStack.getLastCommitMergeFileChanges();
      })));
      this._updateCompareChangedStatus(null, commitMergeFileChanges, lastCommitMergeFileChanges);
    }
  }, {
    key: '_updateCompareChangedStatus',
    value: function _updateCompareChangedStatus(dirtyFileChanges, commitMergeFileChanges, lastCommitMergeFileChanges) {
      var _this3 = this;

      if (dirtyFileChanges == null) {
        dirtyFileChanges = this._state.dirtyFileChanges;
      }
      if (commitMergeFileChanges == null) {
        commitMergeFileChanges = this._state.commitMergeFileChanges;
      }
      if (lastCommitMergeFileChanges == null) {
        lastCommitMergeFileChanges = this._state.lastCommitMergeFileChanges;
      }
      var selectedFileChanges = undefined;
      var showNonHgRepos = undefined;
      var activeRepositorySelector = function activeRepositorySelector() {
        return true;
      };
      if (this._activeRepositoryStack != null) {
        (function () {
          var projectDirectory = _this3._activeRepositoryStack.getRepository().getProjectDirectory();
          activeRepositorySelector = function (filePath) {
            return _nuclideRemoteUri2['default'].contains(projectDirectory, filePath);
          };
        })();
      }
      switch (this._state.viewMode) {
        case _constants.DiffMode.COMMIT_MODE:
          // Commit mode only shows the changes of the active repository.
          selectedFileChanges = _nuclideCommons.map.filter(dirtyFileChanges, activeRepositorySelector);
          showNonHgRepos = false;
          break;
        case _constants.DiffMode.PUBLISH_MODE:
          // Publish mode only shows the changes of the active repository.
          selectedFileChanges = _nuclideCommons.map.filter(lastCommitMergeFileChanges, activeRepositorySelector);
          showNonHgRepos = false;
          break;
        case _constants.DiffMode.BROWSE_MODE:
          // Broswe mode shows all changes from all repositories.
          selectedFileChanges = commitMergeFileChanges;
          showNonHgRepos = true;
          break;
        default:
          throw new Error('Unrecognized view mode!');
      }
      this._setState(_extends({}, this._state, {
        dirtyFileChanges: dirtyFileChanges,
        commitMergeFileChanges: commitMergeFileChanges,
        lastCommitMergeFileChanges: lastCommitMergeFileChanges,
        selectedFileChanges: selectedFileChanges,
        showNonHgRepos: showNonHgRepos
      }));
    }
  }, {
    key: '_updateChangedRevisions',
    value: _asyncToGenerator(function* (repositoryStack, revisionsState, reloadFileDiffState) {
      if (repositoryStack !== this._activeRepositoryStack) {
        return;
      }
      (0, _nuclideAnalytics.track)('diff-view-update-timeline-revisions', {
        revisionsCount: '' + revisionsState.revisions.length
      });
      this._onUpdateRevisionsState(revisionsState);

      // Update the active file, if changed.
      var filePath = this._activeFileState.filePath;

      if (!filePath || !reloadFileDiffState) {
        return;
      }
      this._serializedUpdateActiveFileDiff();
    })
  }, {
    key: '_updateActiveFileDiff',
    value: _asyncToGenerator(function* () {
      var filePath = this._activeFileState.filePath;

      if (!filePath) {
        return;
      }
      // Capture the view state before the update starts.
      var _state = this._state;
      var viewMode = _state.viewMode;
      var commitMode = _state.commitMode;

      var _ref5 = yield this._fetchFileDiff(filePath);

      var committedContents = _ref5.committedContents;
      var filesystemContents = _ref5.filesystemContents;
      var revisionInfo = _ref5.revisionInfo;

      if (this._activeFileState.filePath !== filePath || this._state.viewMode !== viewMode || this._state.commitMode !== commitMode) {
        // The state have changed since the update started, and there must be another
        // scheduled update. Hence, we return early to allow it to go through.
        return;
      }
      yield this._updateDiffStateIfChanged(filePath, committedContents, filesystemContents, revisionInfo);
    })
  }, {
    key: '_onUpdateRevisionsState',
    value: function _onUpdateRevisionsState(revisionsState) {
      this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);
      this._loadModeState(true);
    }
  }, {
    key: 'getMessages',
    value: function getMessages() {
      return this._messages;
    }
  }, {
    key: 'setPublishMessage',
    value: function setPublishMessage(publishMessage) {
      this._setState(_extends({}, this._state, {
        publishMessage: publishMessage
      }));
    }
  }, {
    key: 'setCommitMessage',
    value: function setCommitMessage(commitMessage) {
      this._setState(_extends({}, this._state, {
        commitMessage: commitMessage
      }));
    }
  }, {
    key: 'setViewMode',
    value: function setViewMode(viewMode) {
      if (viewMode === this._state.viewMode) {
        return;
      }
      (0, _nuclideAnalytics.track)('diff-view-switch-mode', {
        viewMode: viewMode
      });
      this._setState(_extends({}, this._state, {
        viewMode: viewMode
      }));
      this._updateCompareChangedStatus();
      this._loadModeState(false);
      this._serializedUpdateActiveFileDiff();
    }
  }, {
    key: '_loadModeState',
    value: function _loadModeState(resetState) {
      if (resetState) {
        this._setState(_extends({}, this._state, {
          commitMessage: null,
          publishMessage: null
        }));
      }
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
    key: '_findFilePathToDiffInDirectory',
    value: function _findFilePathToDiffInDirectory(directoryPath) {
      var repositoryStack = this._getRepositoryStackForPath(directoryPath);
      var hgRepository = repositoryStack.getRepository();
      var projectDirectory = hgRepository.getProjectDirectory();

      function getMatchingFileChange(filePaths, parentPath) {
        return filePaths.filter(function (filePath) {
          return _nuclideRemoteUri2['default'].contains(parentPath, filePath);
        })[0];
      }
      var dirtyFilePaths = _nuclideCommons.array.from(repositoryStack.getDirtyFileChanges().keys());
      // Try to match dirty file changes in the selected directory,
      // Then lookup for changes in the project directory if there is no active repository.
      var matchedFilePaths = [getMatchingFileChange(dirtyFilePaths, directoryPath), this._activeRepositoryStack == null ? getMatchingFileChange(dirtyFilePaths, projectDirectory) : null];
      return matchedFilePaths[0] || matchedFilePaths[1];
    }
  }, {
    key: 'diffEntity',
    value: function diffEntity(entityOption) {
      var _this4 = this;

      var diffPath = null;
      if (entityOption.file != null) {
        diffPath = entityOption.file;
      } else if (entityOption.directory != null) {
        diffPath = this._findFilePathToDiffInDirectory(entityOption.directory);
      }

      if (diffPath == null) {
        (0, _nuclideLogging.getLogger)().error('Non diffable entity:', entityOption);
        return;
      }

      var filePath = diffPath;
      if (this._activeSubscriptions != null) {
        this._activeSubscriptions.dispose();
      }
      var activeSubscriptions = this._activeSubscriptions = new _atom.CompositeDisposable();
      // TODO(most): Show progress indicator: t8991676
      var buffer = (0, _nuclideAtomHelpers.bufferForUri)(filePath);
      var file = buffer.file;

      if (file != null) {
        activeSubscriptions.add(file.onDidChange((0, _nuclideCommons.debounce)(function () {
          return _this4._onDidFileChange(filePath)['catch'](_notifications.notifyInternalError);
        }, FILE_CHANGE_DEBOUNCE_MS, false)));
      }
      activeSubscriptions.add(buffer.onDidChangeModified(this.emitActiveBufferChangeModified.bind(this)));
      // Modified events could be late that it doesn't capture the latest edits/ state changes.
      // Hence, it's safe to re-emit changes when stable from changes.
      activeSubscriptions.add(buffer.onDidStopChanging(this.emitActiveBufferChangeModified.bind(this)));
      // Update `savedContents` on buffer save requests.
      activeSubscriptions.add(buffer.onWillSave(function () {
        return _this4._onWillSaveActiveBuffer(buffer);
      }));
      (0, _nuclideAnalytics.track)('diff-view-open-file', { filePath: filePath });
      this._updateActiveDiffState(filePath)['catch'](_notifications.notifyInternalError);
    }
  }, {
    key: '_onDidFileChange',
    decorators: [(0, _nuclideAnalytics.trackTiming)('diff-view.file-change-update')],
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
    key: 'emitActiveBufferChangeModified',
    value: function emitActiveBufferChangeModified() {
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

      var buffer = (0, _nuclideAtomHelpers.bufferForUri)(filePath);
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
      (0, _nuclideAnalytics.track)('diff-view-set-revision');
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
      var fileDiffState = yield this._fetchFileDiff(filePath);
      yield this._updateDiffState(filePath, fileDiffState, fileDiffState.filesystemContents);
    })
  }, {
    key: '_updateDiffState',
    value: _asyncToGenerator(function* (filePath, fileDiffState, savedContents) {
      var oldContents = fileDiffState.committedContents;
      var newContents = fileDiffState.filesystemContents;
      var revisionInfo = fileDiffState.revisionInfo;
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
    key: '_fetchFileDiff',
    decorators: [(0, _nuclideAnalytics.trackTiming)('diff-view.hg-state-update')],
    value: _asyncToGenerator(function* (filePath) {
      var repositoryStack = this._getRepositoryStackForPath(filePath);

      var _ref6 = yield Promise.all([repositoryStack.fetchHgDiff(filePath, viewModeToDiffOption(this._state.viewMode)), this._setActiveRepositoryStack(repositoryStack)]);

      var _ref62 = _slicedToArray(_ref6, 1);

      var hgDiff = _ref62[0];

      // Intentionally fetch the filesystem contents after getting the committed contents
      // to make sure we have the latest filesystem version.
      var buffer = yield (0, _nuclideAtomHelpers.loadBufferForUri)(filePath);
      return _extends({}, hgDiff, {
        filesystemContents: buffer.getText()
      });
    })
  }, {
    key: '_getRepositoryStackForPath',
    value: function _getRepositoryStackForPath(filePath) {
      var hgRepository = hgRepositoryForPath(filePath);
      var repositoryStack = this._repositoryStacks.get(hgRepository);
      (0, _assert2['default'])(repositoryStack, 'There must be an repository stack for a given repository!');
      return repositoryStack;
    }
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
    decorators: [(0, _nuclideAnalytics.trackTiming)('diff-view.save-file')],
    value: function saveActiveFile() {
      var filePath = this._activeFileState.filePath;

      (0, _nuclideAnalytics.track)('diff-view-save-file', { filePath: filePath });
      return this._saveFile(filePath)['catch'](_notifications.notifyInternalError);
    }
  }, {
    key: 'publishDiff',
    decorators: [(0, _nuclideAnalytics.trackTiming)('diff-view.publish-diff')],
    value: _asyncToGenerator(function* (publishMessage) {
      this._setState(_extends({}, this._state, {
        publishMessage: publishMessage,
        publishModeState: _constants.PublishModeState.AWAITING_PUBLISH
      }));
      var publishMode = this._state.publishMode;

      (0, _nuclideAnalytics.track)('diff-view-publish', {
        publishMode: publishMode
      });
      var cleanResult = yield this._promptToCleanDirtyChanges(publishMessage);
      if (cleanResult == null) {
        this._setState(_extends({}, this._state, {
          publishModeState: _constants.PublishModeState.READY
        }));
        return;
      }
      var amended = cleanResult.amended;
      var allowUntracked = cleanResult.allowUntracked;

      try {
        switch (publishMode) {
          case _constants.PublishMode.CREATE:
            // Create uses `verbatim` and `n` answer buffer
            // and that implies that untracked files will be ignored.
            yield this._createPhabricatorRevision(publishMessage, amended);
            (0, _assert2['default'])(this._activeRepositoryStack, 'No active repository stack');
            // Invalidate the current revisions state because the current commit info has changed.
            this._activeRepositoryStack.getRevisionsStatePromise();
            break;
          case _constants.PublishMode.UPDATE:
            yield this._updatePhabricatorRevision(publishMessage, allowUntracked);
            break;
          default:
            throw new Error('Unknown publish mode \'' + publishMode + '\'');
        }
        // Populate Publish UI with the most recent data after a successful push.
        this._loadModeState(true);
      } catch (error) {
        (0, _notifications.notifyInternalError)(error, true /*persist the error (user dismissable)*/);
        this._setState(_extends({}, this._state, {
          publishModeState: _constants.PublishModeState.READY
        }));
      }
    })
  }, {
    key: '_promptToCleanDirtyChanges',
    value: _asyncToGenerator(function* (commitMessage) {
      var activeStack = this._activeRepositoryStack;
      (0, _assert2['default'])(activeStack != null, 'No active repository stack when cleaning dirty changes');
      var dirtyFileChanges = activeStack.getDirtyFileChanges();
      var shouldAmend = false;
      var amended = false;
      var allowUntracked = false;
      if (dirtyFileChanges.size === 0) {
        return {
          amended: amended,
          allowUntracked: allowUntracked
        };
      }
      var untrackedChanges = new Map(_nuclideCommons.array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
        return fileChange[1] === _constants.FileChangeStatus.UNTRACKED;
      }));
      if (untrackedChanges.size > 0) {
        var untrackedChoice = atom.confirm({
          message: 'You have untracked files in your working copy:',
          detailedMessage: getFileStatusListMessage(untrackedChanges),
          buttons: ['Cancel', 'Add', 'Allow Untracked']
        });
        (0, _nuclideLogging.getLogger)().info('Untracked changes choice:', untrackedChoice);
        if (untrackedChoice === 0) /*Cancel*/{
            return null;
          } else if (untrackedChoice === 1) /*Add*/{
            yield activeStack.add(_nuclideCommons.array.from(untrackedChanges.keys()));
            shouldAmend = true;
          } else if (untrackedChoice === 2) /*Allow Untracked*/{
            allowUntracked = true;
          }
      }
      var revertableChanges = new Map(_nuclideCommons.array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
        return fileChange[1] !== _constants.FileChangeStatus.UNTRACKED;
      }));
      if (revertableChanges.size > 0) {
        var cleanChoice = atom.confirm({
          message: 'You have uncommitted changes in your working copy:',
          detailedMessage: getFileStatusListMessage(revertableChanges),
          buttons: ['Cancel', 'Revert', 'Amend']
        });
        (0, _nuclideLogging.getLogger)().info('Dirty changes clean choice:', cleanChoice);
        if (cleanChoice === 0) /*Cancel*/{
            return null;
          } else if (cleanChoice === 1) /*Revert*/{
            var canRevertFilePaths = _nuclideCommons.array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
              return fileChange[1] !== _constants.FileChangeStatus.UNTRACKED;
            }).map(function (fileChange) {
              return fileChange[0];
            });
            yield activeStack.revert(canRevertFilePaths);
          } else if (cleanChoice === 2) /*Amend*/{
            shouldAmend = true;
          }
      }
      if (shouldAmend) {
        yield activeStack.amend(commitMessage);
        amended = true;
      }
      return {
        amended: amended,
        allowUntracked: allowUntracked
      };
    })
  }, {
    key: '_createPhabricatorRevision',
    value: _asyncToGenerator(function* (publishMessage, amended) {
      var _this5 = this;

      var filePath = this._activeFileState.filePath;

      var lastCommitMessage = yield this._loadActiveRepositoryLatestCommitMessage();
      if (!amended && publishMessage !== lastCommitMessage) {
        (0, _nuclideLogging.getLogger)().info('Amending commit with the updated message');
        (0, _assert2['default'])(this._activeRepositoryStack);
        yield this._activeRepositoryStack.amend(publishMessage);
        atom.notifications.addSuccess('Commit amended with the updated message');
      }

      // TODO(rossallen): Make nuclide-console inform the user there is new output rather than force
      // it open like the following.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');

      this._messages.onNext({ level: 'log', text: 'Creating new revision...' });
      yield _nuclideArcanistClient2['default'].createPhabricatorRevision(filePath).tap(function (message) {
        _this5._messages.onNext({
          level: message.stderr == null ? 'log' : 'error',
          text: message.stdout || message.stderr
        });
      }, function () {}, function () {
        atom.notifications.addSuccess('Revision created');
      }).toPromise();
    })
  }, {
    key: '_updatePhabricatorRevision',
    value: _asyncToGenerator(function* (publishMessage, allowUntracked) {
      var _this6 = this;

      var filePath = this._activeFileState.filePath;

      var _ref7 = yield this._getActiveHeadRevisionDetails();

      var phabricatorRevision = _ref7.phabricatorRevision;

      (0, _assert2['default'])(phabricatorRevision != null, 'A phabricator revision must exist to update!');
      var updateTemplate = getRevisionUpdateMessage(phabricatorRevision).trim();
      var userUpdateMessage = publishMessage.replace(updateTemplate, '').trim();
      if (userUpdateMessage.length === 0) {
        throw new Error('Cannot update revision with empty message');
      }

      // TODO(rossallen): Make nuclide-console inform the user there is new output rather than force
      // it open like the following.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');

      this._messages.onNext({
        level: 'log',
        text: 'Updating revision `' + phabricatorRevision.id + '`...'
      });
      yield _nuclideArcanistClient2['default'].updatePhabricatorRevision(filePath, userUpdateMessage, allowUntracked).tap(function (message) {
        _this6._messages.onNext({
          level: message.stderr == null ? 'log' : 'error',
          text: message.stdout || message.stderr
        });
      }, function () {}, function () {
        atom.notifications.addSuccess('Revision `' + phabricatorRevision.id + '` updated');
      }).toPromise();
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
      var buffer = (0, _nuclideAtomHelpers.bufferForUri)(filePath);
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
    decorators: [(0, _nuclideAnalytics.trackTiming)('diff-view.fetch-comments')],
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

      var commitMessage = null;
      try {
        if (this._state.commitMessage != null) {
          commitMessage = this._state.commitMessage;
        } else if (this._state.commitMode === _constants.CommitMode.COMMIT) {
          commitMessage = yield this._loadActiveRepositoryTemplateCommitMessage();
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
      var publishMessage = this._state.publishMessage;
      this._setState(_extends({}, this._state, {
        publishMode: _constants.PublishMode.CREATE,
        publishModeState: _constants.PublishModeState.LOADING_PUBLISH_MESSAGE,
        publishMessage: null,
        headRevision: null
      }));

      var _ref8 = yield this._getActiveHeadRevisionDetails();

      var headRevision = _ref8.headRevision;
      var phabricatorRevision = _ref8.phabricatorRevision;

      if (publishMessage == null) {
        publishMessage = phabricatorRevision != null ? getRevisionUpdateMessage(phabricatorRevision) : headRevision.description;
      }
      this._setState(_extends({}, this._state, {
        publishMode: phabricatorRevision != null ? _constants.PublishMode.UPDATE : _constants.PublishMode.CREATE,
        publishModeState: _constants.PublishModeState.READY,
        publishMessage: publishMessage,
        headRevision: headRevision
      }));
    })
  }, {
    key: '_getActiveHeadRevisionDetails',
    value: _asyncToGenerator(function* () {
      var revisionsState = yield this.getActiveRevisionsState();
      if (revisionsState == null) {
        throw new Error('Cannot Load Publish View: No active file or repository');
      }
      var revisions = revisionsState.revisions;

      (0, _assert2['default'])(revisions.length > 0, 'Diff View Error: Zero Revisions');
      var headRevision = revisions[revisions.length - 1];
      var phabricatorRevision = _nuclideArcanistClient2['default'].getPhabricatorRevisionFromCommitMessage(headRevision.description);
      return {
        headRevision: headRevision,
        phabricatorRevision: phabricatorRevision
      };
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
    value: _asyncToGenerator(function* () {
      if (this._activeRepositoryStack == null) {
        throw new Error('Diff View: No active file or repository open');
      }
      var commitMessage = yield this._activeRepositoryStack.getTemplateCommitMessage();
      // Commit templates that include newline strings, '\\n' in JavaScript, need to convert their
      // strings to literal newlines, '\n' in JavaScript, to be rendered as line breaks.
      if (commitMessage != null) {
        commitMessage = convertNewlines(commitMessage);
      }
      return commitMessage;
    })
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
    decorators: [(0, _nuclideAnalytics.trackTiming)('diff-view.commit')],
    value: _asyncToGenerator(function* (message) {
      if (message === '') {
        atom.notifications.addError('Commit aborted', { detail: 'Commit message empty' });
        return;
      }

      this._setState(_extends({}, this._state, {
        commitMessage: message,
        commitModeState: _constants.CommitModeState.AWAITING_COMMIT
      }));

      var commitMode = this._state.commitMode;

      (0, _nuclideAnalytics.track)('diff-view-commit', {
        commitMode: commitMode
      });

      var activeStack = this._activeRepositoryStack;
      try {
        (0, _assert2['default'])(activeStack, 'No active repository stack');
        switch (commitMode) {
          case _constants.CommitMode.COMMIT:
            yield activeStack.commit(message);
            atom.notifications.addSuccess('Commit created');
            break;
          case _constants.CommitMode.AMEND:
            yield activeStack.amend(message);
            atom.notifications.addSuccess('Commit amended');
            break;
        }

        // Force trigger an update to the revisions to update the UI state with the new commit info.
        activeStack.getRevisionsStatePromise();
        this._loadModeState(true);
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
      if (this._state.commitMode === commitMode) {
        return;
      }
      (0, _nuclideAnalytics.track)('diff-view-switch-commit-mode', {
        commitMode: commitMode
      });
      this._setState(_extends({}, this._state, {
        commitMode: commitMode,
        commitMessage: null
      }));
      // When the commit mode changes, load the appropriate commit message.
      this._loadModeState(true);
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
//# sourceMappingURL=data:application/json;base64,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b0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN4QjtBQUNELFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QyxVQUFJLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLEVBQUU7QUFDckMsWUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BDLFlBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7T0FDbEM7S0FDRjs7O1NBMzhCRyxhQUFhOzs7QUE4OEJuQixNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJEaWZmVmlld01vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWNsaWVudCc7XG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVDaGFuZ2VTdGF0ZSxcbiAgUmV2aXNpb25zU3RhdGUsXG4gIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSxcbiAgQ29tbWl0TW9kZVR5cGUsXG4gIENvbW1pdE1vZGVTdGF0ZVR5cGUsXG4gIFB1Ymxpc2hNb2RlVHlwZSxcbiAgUHVibGlzaE1vZGVTdGF0ZVR5cGUsXG4gIERpZmZNb2RlVHlwZSxcbiAgRGlmZk9wdGlvblR5cGUsXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UvbGliL0hnU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtQaGFicmljYXRvclJldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hcmNhbmlzdC1jbGllbnQnO1xuXG50eXBlIEZpbGVEaWZmU3RhdGUgPSB7XG4gIHJldmlzaW9uSW5mbzogUmV2aXNpb25JbmZvO1xuICBjb21taXR0ZWRDb250ZW50czogc3RyaW5nO1xuICBmaWxlc3lzdGVtQ29udGVudHM6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIERpZmZFbnRpdHlPcHRpb25zID0ge1xuICBmaWxlOiBOdWNsaWRlVXJpO1xufSB8IHtcbiAgZGlyZWN0b3J5OiBOdWNsaWRlVXJpO1xufTtcblxuaW1wb3J0IGFyY2FuaXN0IGZyb20gJy4uLy4uL251Y2xpZGUtYXJjYW5pc3QtY2xpZW50JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBEaWZmTW9kZSxcbiAgRGlmZk9wdGlvbixcbiAgQ29tbWl0TW9kZSxcbiAgQ29tbWl0TW9kZVN0YXRlLFxuICBQdWJsaXNoTW9kZSxcbiAgUHVibGlzaE1vZGVTdGF0ZSxcbiAgRmlsZUNoYW5nZVN0YXR1cyxcbiAgRmlsZUNoYW5nZVN0YXR1c1RvUHJlZml4LFxufSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge3JlcG9zaXRvcnlGb3JQYXRofSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7Z2V0RmlsZVN5c3RlbUNvbnRlbnRzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7YXJyYXksIG1hcCwgZGVib3VuY2UsIHByb21pc2VzfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHJlbW90ZVVyaSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IFJlcG9zaXRvcnlTdGFjayBmcm9tICcuL1JlcG9zaXRvcnlTdGFjayc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuaW1wb3J0IHtcbiAgbm90aWZ5SW50ZXJuYWxFcnJvcixcbiAgbm90aWZ5RmlsZXN5c3RlbU92ZXJyaWRlVXNlckVkaXRzLFxufSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IHtidWZmZXJGb3JVcmksIGxvYWRCdWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuXG5jb25zdCB7c2VyaWFsaXplQXN5bmNDYWxsfSA9IHByb21pc2VzO1xuXG5jb25zdCBBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQgPSAnYWN0aXZlLWZpbGUtdXBkYXRlJztcbmNvbnN0IENIQU5HRV9SRVZJU0lPTlNfRVZFTlQgPSAnZGlkLWNoYW5nZS1yZXZpc2lvbnMnO1xuY29uc3QgQUNUSVZFX0JVRkZFUl9DSEFOR0VfTU9ESUZJRURfRVZFTlQgPSAnYWN0aXZlLWJ1ZmZlci1jaGFuZ2UtbW9kaWZpZWQnO1xuY29uc3QgRElEX1VQREFURV9TVEFURV9FVkVOVCA9ICdkaWQtdXBkYXRlLXN0YXRlJztcblxuZnVuY3Rpb24gZ2V0UmV2aXNpb25VcGRhdGVNZXNzYWdlKHBoYWJyaWNhdG9yUmV2aXNpb246IFBoYWJyaWNhdG9yUmV2aXNpb25JbmZvKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBcblxuIyBVcGRhdGluZyAke3BoYWJyaWNhdG9yUmV2aXNpb24uaWR9XG4jXG4jIEVudGVyIGEgYnJpZWYgZGVzY3JpcHRpb24gb2YgdGhlIGNoYW5nZXMgaW5jbHVkZWQgaW4gdGhpcyB1cGRhdGUuXG4jIFRoZSBmaXJzdCBsaW5lIGlzIHVzZWQgYXMgc3ViamVjdCwgbmV4dCBsaW5lcyBhcyBjb21tZW50LmA7XG59XG5cbmNvbnN0IEZJTEVfQ0hBTkdFX0RFQk9VTkNFX01TID0gMjAwO1xuY29uc3QgTUFYX0RJQUxPR19GSUxFX1NUQVRVU19DT1VOVCA9IDIwO1xuXG4vLyBSZXR1cm5zIGEgc3RyaW5nIHdpdGggYWxsIG5ld2xpbmUgc3RyaW5ncywgJ1xcXFxuJywgY29udmVydGVkIHRvIGxpdGVyYWwgbmV3bGluZXMsICdcXG4nLlxuZnVuY3Rpb24gY29udmVydE5ld2xpbmVzKG1lc3NhZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBtZXNzYWdlLnJlcGxhY2UoL1xcXFxuL2csICdcXG4nKTtcbn1cblxuZnVuY3Rpb24gZ2V0SW5pdGlhbEZpbGVDaGFuZ2VTdGF0ZSgpOiBGaWxlQ2hhbmdlU3RhdGUge1xuICByZXR1cm4ge1xuICAgIGZyb21SZXZpc2lvblRpdGxlOiAnTm8gZmlsZSBzZWxlY3RlZCcsXG4gICAgdG9SZXZpc2lvblRpdGxlOiAnTm8gZmlsZSBzZWxlY3RlZCcsXG4gICAgZmlsZVBhdGg6ICcnLFxuICAgIG9sZENvbnRlbnRzOiAnJyxcbiAgICBuZXdDb250ZW50czogJycsXG4gICAgY29tcGFyZVJldmlzaW9uSW5mbzogbnVsbCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gdmlld01vZGVUb0RpZmZPcHRpb24odmlld01vZGU6IERpZmZNb2RlVHlwZSk6IERpZmZPcHRpb25UeXBlIHtcbiAgc3dpdGNoICh2aWV3TW9kZSkge1xuICAgIGNhc2UgRGlmZk1vZGUuQ09NTUlUX01PREU6XG4gICAgICByZXR1cm4gRGlmZk9wdGlvbi5ESVJUWTtcbiAgICBjYXNlIERpZmZNb2RlLlBVQkxJU0hfTU9ERTpcbiAgICAgIHJldHVybiBEaWZmT3B0aW9uLkxBU1RfQ09NTUlUO1xuICAgIGNhc2UgRGlmZk1vZGUuQlJPV1NFX01PREU6XG4gICAgICByZXR1cm4gRGlmZk9wdGlvbi5DT01QQVJFX0NPTU1JVDtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlY29nbml6ZWQgdmlldyBtb2RlIScpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVTdGF0dXNMaXN0TWVzc2FnZShmaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pOiBzdHJpbmcge1xuICBsZXQgbWVzc2FnZSA9ICcnO1xuICBpZiAoZmlsZUNoYW5nZXMuc2l6ZSA8IE1BWF9ESUFMT0dfRklMRV9TVEFUVVNfQ09VTlQpIHtcbiAgICBmb3IgKGNvbnN0IFtmaWxlUGF0aCwgc3RhdHVzQ29kZV0gb2YgZmlsZUNoYW5nZXMpIHtcbiAgICAgIG1lc3NhZ2UgKz0gJ1xcbidcbiAgICAgICAgKyBGaWxlQ2hhbmdlU3RhdHVzVG9QcmVmaXhbc3RhdHVzQ29kZV1cbiAgICAgICAgKyBhdG9tLnByb2plY3QucmVsYXRpdml6ZShmaWxlUGF0aCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG1lc3NhZ2UgPSBgXFxuIG1vcmUgdGhhbiAke01BWF9ESUFMT0dfRklMRV9TVEFUVVNfQ09VTlR9IGZpbGVzIChjaGVjayB1c2luZyBcXGBoZyBzdGF0dXNcXGApYDtcbiAgfVxuICByZXR1cm4gbWVzc2FnZTtcbn1cblxuZnVuY3Rpb24gaGdSZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IEhnUmVwb3NpdG9yeUNsaWVudCB7XG4gIC8vIENhbGxpbmcgYXRvbS5wcm9qZWN0LnJlcG9zaXRvcnlGb3JEaXJlY3RvcnkgZ2V0cyB0aGUgcmVhbCBwYXRoIG9mIHRoZSBkaXJlY3RvcnksXG4gIC8vIHdoaWNoIGlzIGFub3RoZXIgcm91bmQtdHJpcCBhbmQgY2FsbHMgdGhlIHJlcG9zaXRvcnkgcHJvdmlkZXJzIHRvIGdldCBhbiBleGlzdGluZyByZXBvc2l0b3J5LlxuICAvLyBJbnN0ZWFkLCB0aGUgZmlyc3QgbWF0Y2ggb2YgdGhlIGZpbHRlcmluZyBoZXJlIGlzIHRoZSBvbmx5IHBvc3NpYmxlIG1hdGNoLlxuICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgoZmlsZVBhdGgpO1xuICBpZiAocmVwb3NpdG9yeSA9PSBudWxsIHx8IHJlcG9zaXRvcnkuZ2V0VHlwZSgpICE9PSAnaGcnKSB7XG4gICAgY29uc3QgdHlwZSA9IHJlcG9zaXRvcnkgPyByZXBvc2l0b3J5LmdldFR5cGUoKSA6ICdubyByZXBvc2l0b3J5JztcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgRGlmZiB2aWV3IG9ubHkgc3VwcG9ydHMgXFxgTWVyY3VyaWFsXFxgIHJlcG9zaXRvcmllcywgYCArXG4gICAgICBgYnV0IGZvdW5kIFxcYCR7dHlwZX1cXGAgYXQgcGF0aDogXFxgJHtmaWxlUGF0aH1cXGBgXG4gICAgKTtcbiAgfVxuICByZXR1cm4gKHJlcG9zaXRvcnk6IGFueSk7XG59XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHZpZXdNb2RlOiBEaWZmTW9kZVR5cGU7XG4gIGNvbW1pdE1lc3NhZ2U6ID9zdHJpbmc7XG4gIGNvbW1pdE1vZGU6IENvbW1pdE1vZGVUeXBlO1xuICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZVR5cGU7XG4gIHB1Ymxpc2hNZXNzYWdlOiA/c3RyaW5nO1xuICBwdWJsaXNoTW9kZTogUHVibGlzaE1vZGVUeXBlO1xuICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlVHlwZTtcbiAgaGVhZFJldmlzaW9uOiA/UmV2aXNpb25JbmZvO1xuICBkaXJ0eUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgY29tbWl0TWVyZ2VGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIGxhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgc2VsZWN0ZWRGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIHNob3dOb25IZ1JlcG9zOiBib29sZWFuO1xufTtcblxuY2xhc3MgRGlmZlZpZXdNb2RlbCB7XG5cbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYWN0aXZlU3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9hY3RpdmVGaWxlU3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZTtcbiAgX2FjdGl2ZVJlcG9zaXRvcnlTdGFjazogP1JlcG9zaXRvcnlTdGFjaztcbiAgX25ld0VkaXRvcjogP1RleHRFZGl0b3I7XG4gIF91aVByb3ZpZGVyczogQXJyYXk8T2JqZWN0PjtcbiAgX3JlcG9zaXRvcnlTdGFja3M6IE1hcDxIZ1JlcG9zaXRvcnlDbGllbnQsIFJlcG9zaXRvcnlTdGFjaz47XG4gIF9yZXBvc2l0b3J5U3Vic2NyaXB0aW9uczogTWFwPEhnUmVwb3NpdG9yeUNsaWVudCwgQ29tcG9zaXRlRGlzcG9zYWJsZT47XG4gIF9pc0FjdGl2ZTogYm9vbGVhbjtcbiAgX3N0YXRlOiBTdGF0ZTtcbiAgX21lc3NhZ2VzOiBSeC5TdWJqZWN0O1xuICBfc2VyaWFsaXplZFVwZGF0ZUFjdGl2ZUZpbGVEaWZmOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKHVpUHJvdmlkZXJzOiBBcnJheTxPYmplY3Q+KSB7XG4gICAgdGhpcy5fdWlQcm92aWRlcnMgPSB1aVByb3ZpZGVycztcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fbWVzc2FnZXMgPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIHRoaXMuX3N0YXRlID0ge1xuICAgICAgdmlld01vZGU6IERpZmZNb2RlLkJST1dTRV9NT0RFLFxuICAgICAgY29tbWl0TWVzc2FnZTogbnVsbCxcbiAgICAgIGNvbW1pdE1vZGU6IENvbW1pdE1vZGUuQ09NTUlULFxuICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuUkVBRFksXG4gICAgICBwdWJsaXNoTWVzc2FnZTogbnVsbCxcbiAgICAgIHB1Ymxpc2hNb2RlOiBQdWJsaXNoTW9kZS5DUkVBVEUsXG4gICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLlJFQURZLFxuICAgICAgaGVhZFJldmlzaW9uOiBudWxsLFxuICAgICAgZGlydHlGaWxlQ2hhbmdlczogbmV3IE1hcCgpLFxuICAgICAgY29tbWl0TWVyZ2VGaWxlQ2hhbmdlczogbmV3IE1hcCgpLFxuICAgICAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXM6IG5ldyBNYXAoKSxcbiAgICAgIHNlbGVjdGVkRmlsZUNoYW5nZXM6IG5ldyBNYXAoKSxcbiAgICAgIHNob3dOb25IZ1JlcG9zOiB0cnVlLFxuICAgIH07XG4gICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZUFjdGl2ZUZpbGVEaWZmID0gc2VyaWFsaXplQXN5bmNDYWxsKCgpID0+IHRoaXMuX3VwZGF0ZUFjdGl2ZUZpbGVEaWZmKCkpO1xuICAgIHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcygpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcy5iaW5kKHRoaXMpKSk7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKGdldEluaXRpYWxGaWxlQ2hhbmdlU3RhdGUoKSk7XG4gICAgdGhpcy5fY2hlY2tDdXN0b21Db25maWcoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIGFzeW5jIF9jaGVja0N1c3RvbUNvbmZpZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgY29uZmlnID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgY29uZmlnID0gcmVxdWlyZSgnLi9mYi9jb25maWcnKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGNvbmZpZyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGF3YWl0IGNvbmZpZy5hcHBseUNvbmZpZygpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVSZXBvc2l0b3JpZXMoKTogdm9pZCB7XG4gICAgY29uc3QgcmVwb3NpdG9yaWVzID0gbmV3IFNldChcbiAgICAgIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKS5maWx0ZXIoXG4gICAgICAgIHJlcG9zaXRvcnkgPT4gcmVwb3NpdG9yeSAhPSBudWxsICYmIHJlcG9zaXRvcnkuZ2V0VHlwZSgpID09PSAnaGcnXG4gICAgICApXG4gICAgKTtcbiAgICAvLyBEaXNwb3NlIHJlbW92ZWQgcHJvamVjdHMgcmVwb3NpdG9yaWVzLlxuICAgIGZvciAoY29uc3QgW3JlcG9zaXRvcnksIHJlcG9zaXRvcnlTdGFja10gb2YgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcykge1xuICAgICAgaWYgKHJlcG9zaXRvcmllcy5oYXMocmVwb3NpdG9yeSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICByZXBvc2l0b3J5U3RhY2suZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5kZWxldGUocmVwb3NpdG9yeSk7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuZ2V0KHJlcG9zaXRvcnkpO1xuICAgICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5kZWxldGUocmVwb3NpdG9yeSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5IG9mIHJlcG9zaXRvcmllcykge1xuICAgICAgaWYgKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuaGFzKHJlcG9zaXRvcnkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgICAgdGhpcy5fY3JlYXRlUmVwb3NpdG9yeVN0YWNrKGhnUmVwb3NpdG9yeSk7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlRGlydHlDaGFuZ2VkU3RhdHVzKCk7XG4gIH1cblxuICBfY3JlYXRlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCk6IFJlcG9zaXRvcnlTdGFjayB7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gbmV3IFJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5KTtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZFVwZGF0ZURpcnR5RmlsZUNoYW5nZXMoXG4gICAgICAgIHRoaXMuX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cy5iaW5kKHRoaXMpXG4gICAgICApLFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkVXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyhcbiAgICAgICAgdGhpcy5fdXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcy5iaW5kKHRoaXMpXG4gICAgICApLFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlUmV2aXNpb25zKHJldmlzaW9uc1N0YXRlID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhyZXBvc2l0b3J5U3RhY2ssIHJldmlzaW9uc1N0YXRlLCB0cnVlKVxuICAgICAgICAgIC5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5zZXQocmVwb3NpdG9yeSwgcmVwb3NpdG9yeVN0YWNrKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5zZXQocmVwb3NpdG9yeSwgc3Vic2NyaXB0aW9ucyk7XG4gICAgaWYgKHRoaXMuX2lzQWN0aXZlKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suYWN0aXZhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcG9zaXRvcnlTdGFjaztcbiAgfVxuXG4gIF91cGRhdGVEaXJ0eUNoYW5nZWRTdGF0dXMoKTogdm9pZCB7XG4gICAgY29uc3QgZGlydHlGaWxlQ2hhbmdlcyA9IG1hcC51bmlvbiguLi5hcnJheVxuICAgICAgLmZyb20odGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSlcbiAgICAgIC5tYXAocmVwb3NpdG9yeVN0YWNrID0+IHJlcG9zaXRvcnlTdGFjay5nZXREaXJ0eUZpbGVDaGFuZ2VzKCkpXG4gICAgKTtcbiAgICB0aGlzLl91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cyhkaXJ0eUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIF91cGRhdGVDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSBtYXAudW5pb24oLi4uYXJyYXlcbiAgICAgIC5mcm9tKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpXG4gICAgICAubWFwKHJlcG9zaXRvcnlTdGFjayA9PiByZXBvc2l0b3J5U3RhY2suZ2V0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcygpKVxuICAgICk7XG4gICAgY29uc3QgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSBtYXAudW5pb24oLi4uYXJyYXlcbiAgICAgIC5mcm9tKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpXG4gICAgICAubWFwKHJlcG9zaXRvcnlTdGFjayA9PiByZXBvc2l0b3J5U3RhY2suZ2V0TGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMoKSlcbiAgICApO1xuICAgIHRoaXMuX3VwZGF0ZUNvbXBhcmVDaGFuZ2VkU3RhdHVzKFxuICAgICAgbnVsbCxcbiAgICAgIGNvbW1pdE1lcmdlRmlsZUNoYW5nZXMsXG4gICAgICBsYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyxcbiAgICApO1xuICB9XG5cbiAgX3VwZGF0ZUNvbXBhcmVDaGFuZ2VkU3RhdHVzKFxuICAgIGRpcnR5RmlsZUNoYW5nZXM/OiA/TWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4sXG4gICAgY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcz86ID9NYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPixcbiAgICBsYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcz86ID9NYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPixcbiAgKTogdm9pZCB7XG4gICAgaWYgKGRpcnR5RmlsZUNoYW5nZXMgPT0gbnVsbCkge1xuICAgICAgZGlydHlGaWxlQ2hhbmdlcyA9IHRoaXMuX3N0YXRlLmRpcnR5RmlsZUNoYW5nZXM7XG4gICAgfVxuICAgIGlmIChjb21taXRNZXJnZUZpbGVDaGFuZ2VzID09IG51bGwpIHtcbiAgICAgIGNvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSB0aGlzLl9zdGF0ZS5jb21taXRNZXJnZUZpbGVDaGFuZ2VzO1xuICAgIH1cbiAgICBpZiAobGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPT0gbnVsbCkge1xuICAgICAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSB0aGlzLl9zdGF0ZS5sYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcztcbiAgICB9XG4gICAgbGV0IHNlbGVjdGVkRmlsZUNoYW5nZXM7XG4gICAgbGV0IHNob3dOb25IZ1JlcG9zO1xuICAgIGxldCBhY3RpdmVSZXBvc2l0b3J5U2VsZWN0b3IgPSAoKSA9PiB0cnVlO1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgIT0gbnVsbCkge1xuICAgICAgY29uc3QgcHJvamVjdERpcmVjdG9yeSA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRSZXBvc2l0b3J5KCkuZ2V0UHJvamVjdERpcmVjdG9yeSgpO1xuICAgICAgYWN0aXZlUmVwb3NpdG9yeVNlbGVjdG9yID0gKGZpbGVQYXRoOiBOdWNsaWRlVXJpKSA9PlxuICAgICAgICByZW1vdGVVcmkuY29udGFpbnMocHJvamVjdERpcmVjdG9yeSwgZmlsZVBhdGgpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHRoaXMuX3N0YXRlLnZpZXdNb2RlKSB7XG4gICAgICBjYXNlIERpZmZNb2RlLkNPTU1JVF9NT0RFOlxuICAgICAgICAvLyBDb21taXQgbW9kZSBvbmx5IHNob3dzIHRoZSBjaGFuZ2VzIG9mIHRoZSBhY3RpdmUgcmVwb3NpdG9yeS5cbiAgICAgICAgc2VsZWN0ZWRGaWxlQ2hhbmdlcyA9IG1hcC5maWx0ZXIoZGlydHlGaWxlQ2hhbmdlcywgYWN0aXZlUmVwb3NpdG9yeVNlbGVjdG9yKTtcbiAgICAgICAgc2hvd05vbkhnUmVwb3MgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpZmZNb2RlLlBVQkxJU0hfTU9ERTpcbiAgICAgICAgLy8gUHVibGlzaCBtb2RlIG9ubHkgc2hvd3MgdGhlIGNoYW5nZXMgb2YgdGhlIGFjdGl2ZSByZXBvc2l0b3J5LlxuICAgICAgICBzZWxlY3RlZEZpbGVDaGFuZ2VzID0gbWFwLmZpbHRlcihsYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcywgYWN0aXZlUmVwb3NpdG9yeVNlbGVjdG9yKTtcbiAgICAgICAgc2hvd05vbkhnUmVwb3MgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpZmZNb2RlLkJST1dTRV9NT0RFOlxuICAgICAgICAvLyBCcm9zd2UgbW9kZSBzaG93cyBhbGwgY2hhbmdlcyBmcm9tIGFsbCByZXBvc2l0b3JpZXMuXG4gICAgICAgIHNlbGVjdGVkRmlsZUNoYW5nZXMgPSBjb21taXRNZXJnZUZpbGVDaGFuZ2VzO1xuICAgICAgICBzaG93Tm9uSGdSZXBvcyA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlY29nbml6ZWQgdmlldyBtb2RlIScpO1xuICAgIH1cbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIGRpcnR5RmlsZUNoYW5nZXMsXG4gICAgICBjb21taXRNZXJnZUZpbGVDaGFuZ2VzLFxuICAgICAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMsXG4gICAgICBzZWxlY3RlZEZpbGVDaGFuZ2VzLFxuICAgICAgc2hvd05vbkhnUmVwb3MsXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhcbiAgICByZXBvc2l0b3J5U3RhY2s6IFJlcG9zaXRvcnlTdGFjayxcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICAgcmVsb2FkRmlsZURpZmZTdGF0ZTogYm9vbGVhbixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHJlcG9zaXRvcnlTdGFjayAhPT0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyYWNrKCdkaWZmLXZpZXctdXBkYXRlLXRpbWVsaW5lLXJldmlzaW9ucycsIHtcbiAgICAgIHJldmlzaW9uc0NvdW50OiBgJHtyZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMubGVuZ3RofWAsXG4gICAgfSk7XG4gICAgdGhpcy5fb25VcGRhdGVSZXZpc2lvbnNTdGF0ZShyZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGFjdGl2ZSBmaWxlLCBpZiBjaGFuZ2VkLlxuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaWYgKCFmaWxlUGF0aCB8fCAhcmVsb2FkRmlsZURpZmZTdGF0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlQWN0aXZlRmlsZURpZmYoKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVBY3RpdmVGaWxlRGlmZigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gQ2FwdHVyZSB0aGUgdmlldyBzdGF0ZSBiZWZvcmUgdGhlIHVwZGF0ZSBzdGFydHMuXG4gICAgY29uc3Qge3ZpZXdNb2RlLCBjb21taXRNb2RlfSA9IHRoaXMuX3N0YXRlO1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgIH0gPSBhd2FpdCB0aGlzLl9mZXRjaEZpbGVEaWZmKGZpbGVQYXRoKTtcbiAgICBpZiAoXG4gICAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUuZmlsZVBhdGggIT09IGZpbGVQYXRoIHx8XG4gICAgICB0aGlzLl9zdGF0ZS52aWV3TW9kZSAhPT0gdmlld01vZGUgfHxcbiAgICAgIHRoaXMuX3N0YXRlLmNvbW1pdE1vZGUgIT09IGNvbW1pdE1vZGVcbiAgICApIHtcbiAgICAgIC8vIFRoZSBzdGF0ZSBoYXZlIGNoYW5nZWQgc2luY2UgdGhlIHVwZGF0ZSBzdGFydGVkLCBhbmQgdGhlcmUgbXVzdCBiZSBhbm90aGVyXG4gICAgICAvLyBzY2hlZHVsZWQgdXBkYXRlLiBIZW5jZSwgd2UgcmV0dXJuIGVhcmx5IHRvIGFsbG93IGl0IHRvIGdvIHRocm91Z2guXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZTdGF0ZUlmQ2hhbmdlZChcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgKTtcbiAgfVxuXG4gIF9vblVwZGF0ZVJldmlzaW9uc1N0YXRlKHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG4gICAgdGhpcy5fbG9hZE1vZGVTdGF0ZSh0cnVlKTtcbiAgfVxuXG4gIGdldE1lc3NhZ2VzKCk6IFJ4Lk9ic2VydmFibGUge1xuICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcztcbiAgfVxuXG4gIHNldFB1Ymxpc2hNZXNzYWdlKHB1Ymxpc2hNZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0Q29tbWl0TWVzc2FnZShjb21taXRNZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIGNvbW1pdE1lc3NhZ2UsXG4gICAgfSk7XG4gIH1cblxuICBzZXRWaWV3TW9kZSh2aWV3TW9kZTogRGlmZk1vZGVUeXBlKTogdm9pZCB7XG4gICAgaWYgKHZpZXdNb2RlID09PSB0aGlzLl9zdGF0ZS52aWV3TW9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cmFjaygnZGlmZi12aWV3LXN3aXRjaC1tb2RlJywge1xuICAgICAgdmlld01vZGUsXG4gICAgfSk7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICB2aWV3TW9kZSxcbiAgICB9KTtcbiAgICB0aGlzLl91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cygpO1xuICAgIHRoaXMuX2xvYWRNb2RlU3RhdGUoZmFsc2UpO1xuICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVBY3RpdmVGaWxlRGlmZigpO1xuICB9XG5cbiAgX2xvYWRNb2RlU3RhdGUocmVzZXRTdGF0ZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChyZXNldFN0YXRlKSB7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgICBjb21taXRNZXNzYWdlOiBudWxsLFxuICAgICAgICBwdWJsaXNoTWVzc2FnZTogbnVsbCxcbiAgICAgIH0pO1xuICAgIH1cbiAgICBzd2l0Y2ggKHRoaXMuX3N0YXRlLnZpZXdNb2RlKSB7XG4gICAgICBjYXNlIERpZmZNb2RlLkNPTU1JVF9NT0RFOlxuICAgICAgICB0aGlzLl9sb2FkQ29tbWl0TW9kZVN0YXRlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmTW9kZS5QVUJMSVNIX01PREU6XG4gICAgICAgIHRoaXMuX2xvYWRQdWJsaXNoTW9kZVN0YXRlKCkuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9maW5kRmlsZVBhdGhUb0RpZmZJbkRpcmVjdG9yeShkaXJlY3RvcnlQYXRoOiBOdWNsaWRlVXJpKTogP3N0cmluZyB7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gdGhpcy5fZ2V0UmVwb3NpdG9yeVN0YWNrRm9yUGF0aChkaXJlY3RvcnlQYXRoKTtcbiAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSByZXBvc2l0b3J5U3RhY2suZ2V0UmVwb3NpdG9yeSgpO1xuICAgIGNvbnN0IHByb2plY3REaXJlY3RvcnkgPSBoZ1JlcG9zaXRvcnkuZ2V0UHJvamVjdERpcmVjdG9yeSgpO1xuXG4gICAgZnVuY3Rpb24gZ2V0TWF0Y2hpbmdGaWxlQ2hhbmdlKFxuICAgICAgZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPixcbiAgICAgIHBhcmVudFBhdGg6IE51Y2xpZGVVcmksXG4gICAgKTogP051Y2xpZGVVcmkge1xuICAgICAgcmV0dXJuIGZpbGVQYXRocy5maWx0ZXIoZmlsZVBhdGggPT4gcmVtb3RlVXJpLmNvbnRhaW5zKHBhcmVudFBhdGgsIGZpbGVQYXRoKSlbMF07XG4gICAgfVxuICAgIGNvbnN0IGRpcnR5RmlsZVBhdGhzID0gYXJyYXkuZnJvbShyZXBvc2l0b3J5U3RhY2suZ2V0RGlydHlGaWxlQ2hhbmdlcygpLmtleXMoKSk7XG4gICAgLy8gVHJ5IHRvIG1hdGNoIGRpcnR5IGZpbGUgY2hhbmdlcyBpbiB0aGUgc2VsZWN0ZWQgZGlyZWN0b3J5LFxuICAgIC8vIFRoZW4gbG9va3VwIGZvciBjaGFuZ2VzIGluIHRoZSBwcm9qZWN0IGRpcmVjdG9yeSBpZiB0aGVyZSBpcyBubyBhY3RpdmUgcmVwb3NpdG9yeS5cbiAgICBjb25zdCBtYXRjaGVkRmlsZVBhdGhzID0gW1xuICAgICAgZ2V0TWF0Y2hpbmdGaWxlQ2hhbmdlKGRpcnR5RmlsZVBhdGhzLCBkaXJlY3RvcnlQYXRoKSxcbiAgICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsXG4gICAgICAgID8gZ2V0TWF0Y2hpbmdGaWxlQ2hhbmdlKGRpcnR5RmlsZVBhdGhzLCBwcm9qZWN0RGlyZWN0b3J5KVxuICAgICAgICA6IG51bGwsXG4gICAgXTtcbiAgICByZXR1cm4gbWF0Y2hlZEZpbGVQYXRoc1swXSB8fCBtYXRjaGVkRmlsZVBhdGhzWzFdO1xuICB9XG5cbiAgZGlmZkVudGl0eShlbnRpdHlPcHRpb246IERpZmZFbnRpdHlPcHRpb25zKTogdm9pZCB7XG4gICAgbGV0IGRpZmZQYXRoID0gbnVsbDtcbiAgICBpZiAoZW50aXR5T3B0aW9uLmZpbGUgIT0gbnVsbCkge1xuICAgICAgZGlmZlBhdGggPSBlbnRpdHlPcHRpb24uZmlsZTtcbiAgICB9IGVsc2UgaWYgKGVudGl0eU9wdGlvbi5kaXJlY3RvcnkgIT0gbnVsbCkge1xuICAgICAgZGlmZlBhdGggPSB0aGlzLl9maW5kRmlsZVBhdGhUb0RpZmZJbkRpcmVjdG9yeShlbnRpdHlPcHRpb24uZGlyZWN0b3J5KTtcbiAgICB9XG5cbiAgICBpZiAoZGlmZlBhdGggPT0gbnVsbCkge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoJ05vbiBkaWZmYWJsZSBlbnRpdHk6JywgZW50aXR5T3B0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0aCA9IGRpZmZQYXRoO1xuICAgIGlmICh0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBjb25zdCBhY3RpdmVTdWJzY3JpcHRpb25zID0gdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgLy8gVE9ETyhtb3N0KTogU2hvdyBwcm9ncmVzcyBpbmRpY2F0b3I6IHQ4OTkxNjc2XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICBjb25zdCB7ZmlsZX0gPSBidWZmZXI7XG4gICAgaWYgKGZpbGUgIT0gbnVsbCkge1xuICAgICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoZmlsZS5vbkRpZENoYW5nZShkZWJvdW5jZShcbiAgICAgICAgKCkgPT4gdGhpcy5fb25EaWRGaWxlQ2hhbmdlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKSxcbiAgICAgICAgRklMRV9DSEFOR0VfREVCT1VOQ0VfTVMsXG4gICAgICAgIGZhbHNlLFxuICAgICAgKSkpO1xuICAgIH1cbiAgICBhY3RpdmVTdWJzY3JpcHRpb25zLmFkZChidWZmZXIub25EaWRDaGFuZ2VNb2RpZmllZChcbiAgICAgIHRoaXMuZW1pdEFjdGl2ZUJ1ZmZlckNoYW5nZU1vZGlmaWVkLmJpbmQodGhpcyksXG4gICAgKSk7XG4gICAgLy8gTW9kaWZpZWQgZXZlbnRzIGNvdWxkIGJlIGxhdGUgdGhhdCBpdCBkb2Vzbid0IGNhcHR1cmUgdGhlIGxhdGVzdCBlZGl0cy8gc3RhdGUgY2hhbmdlcy5cbiAgICAvLyBIZW5jZSwgaXQncyBzYWZlIHRvIHJlLWVtaXQgY2hhbmdlcyB3aGVuIHN0YWJsZSBmcm9tIGNoYW5nZXMuXG4gICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoYnVmZmVyLm9uRGlkU3RvcENoYW5naW5nKFxuICAgICAgdGhpcy5lbWl0QWN0aXZlQnVmZmVyQ2hhbmdlTW9kaWZpZWQuYmluZCh0aGlzKSxcbiAgICApKTtcbiAgICAvLyBVcGRhdGUgYHNhdmVkQ29udGVudHNgIG9uIGJ1ZmZlciBzYXZlIHJlcXVlc3RzLlxuICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMuYWRkKGJ1ZmZlci5vbldpbGxTYXZlKFxuICAgICAgKCkgPT4gdGhpcy5fb25XaWxsU2F2ZUFjdGl2ZUJ1ZmZlcihidWZmZXIpLFxuICAgICkpO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctb3Blbi1maWxlJywge2ZpbGVQYXRofSk7XG4gICAgdGhpcy5fdXBkYXRlQWN0aXZlRGlmZlN0YXRlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZpbGUtY2hhbmdlLXVwZGF0ZScpXG4gIGFzeW5jIF9vbkRpZEZpbGVDaGFuZ2UoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlRmlsZVN0YXRlLmZpbGVQYXRoICE9PSBmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaWxlc3lzdGVtQ29udGVudHMgPSBhd2FpdCBnZXRGaWxlU3lzdGVtQ29udGVudHMoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHtcbiAgICAgIG9sZENvbnRlbnRzOiBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGNvbXBhcmVSZXZpc2lvbkluZm86IHJldmlzaW9uSW5mbyxcbiAgICB9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGludmFyaWFudChyZXZpc2lvbkluZm8sICdEaWZmIFZpZXc6IFJldmlzaW9uIGluZm8gbXVzdCBiZSBkZWZpbmVkIHRvIHVwZGF0ZSBjaGFuZ2VkIHN0YXRlJyk7XG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICApO1xuICB9XG5cbiAgZW1pdEFjdGl2ZUJ1ZmZlckNoYW5nZU1vZGlmaWVkKCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChBQ1RJVkVfQlVGRkVSX0NIQU5HRV9NT0RJRklFRF9FVkVOVCk7XG4gIH1cblxuICBvbkRpZEFjdGl2ZUJ1ZmZlckNoYW5nZU1vZGlmaWVkKFxuICAgIGNhbGxiYWNrOiAoKSA9PiBtaXhlZCxcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBpc0FjdGl2ZUJ1ZmZlck1vZGlmaWVkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICByZXR1cm4gYnVmZmVyLmlzTW9kaWZpZWQoKTtcbiAgfVxuXG4gIF91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29tbWl0dGVkQ29udGVudHM6IHN0cmluZyxcbiAgICBmaWxlc3lzdGVtQ29udGVudHM6IHN0cmluZyxcbiAgICByZXZpc2lvbkluZm86IFJldmlzaW9uSW5mbyxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge1xuICAgICAgZmlsZVBhdGg6IGFjdGl2ZUZpbGVQYXRoLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgIH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaWYgKGZpbGVQYXRoICE9PSBhY3RpdmVGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICBjb25zdCB1cGRhdGVkRGlmZlN0YXRlID0ge1xuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfTtcbiAgICBpbnZhcmlhbnQoc2F2ZWRDb250ZW50cywgJ3NhdmVkQ29udGVudHMgaXMgbm90IGRlZmluZWQgd2hpbGUgdXBkYXRpbmcgZGlmZiBzdGF0ZSEnKTtcbiAgICBpZiAoc2F2ZWRDb250ZW50cyA9PT0gbmV3Q29udGVudHMgfHwgZmlsZXN5c3RlbUNvbnRlbnRzID09PSBuZXdDb250ZW50cykge1xuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIHVwZGF0ZWREaWZmU3RhdGUsXG4gICAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgICApO1xuICAgIH1cbiAgICAvLyBUaGUgdXNlciBoYXZlIGVkaXRlZCBzaW5jZSB0aGUgbGFzdCB1cGRhdGUuXG4gICAgaWYgKGZpbGVzeXN0ZW1Db250ZW50cyA9PT0gc2F2ZWRDb250ZW50cykge1xuICAgICAgLy8gVGhlIGNoYW5nZXMgaGF2ZW4ndCB0b3VjaGVkIHRoZSBmaWxlc3lzdGVtLCBrZWVwIHVzZXIgZWRpdHMuXG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgey4uLnVwZGF0ZWREaWZmU3RhdGUsIGZpbGVzeXN0ZW1Db250ZW50czogbmV3Q29udGVudHN9LFxuICAgICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGNvbW1pdHRlZCBhbmQgZmlsZXN5c3RlbSBzdGF0ZSBoYXZlIGNoYW5nZWQsIG5vdGlmeSBvZiBvdmVycmlkZS5cbiAgICAgIG5vdGlmeUZpbGVzeXN0ZW1PdmVycmlkZVVzZXJFZGl0cyhmaWxlUGF0aCk7XG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgdXBkYXRlZERpZmZTdGF0ZSxcbiAgICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBzZXROZXdDb250ZW50cyhuZXdDb250ZW50czogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHsuLi50aGlzLl9hY3RpdmVGaWxlU3RhdGUsIG5ld0NvbnRlbnRzfSk7XG4gIH1cblxuICBzZXRSZXZpc2lvbihyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogdm9pZCB7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1zZXQtcmV2aXNpb24nKTtcbiAgICBjb25zdCByZXBvc2l0b3J5U3RhY2sgPSB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2s7XG4gICAgaW52YXJpYW50KHJlcG9zaXRvcnlTdGFjaywgJ1RoZXJlIG11c3QgYmUgYW4gYWN0aXZlIHJlcG9zaXRvcnkgc3RhY2shJyk7XG4gICAgdGhpcy5fYWN0aXZlRmlsZVN0YXRlID0gey4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSwgY29tcGFyZVJldmlzaW9uSW5mbzogcmV2aXNpb259O1xuICAgIHJlcG9zaXRvcnlTdGFjay5zZXRSZXZpc2lvbihyZXZpc2lvbikuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gIH1cblxuICBnZXRBY3RpdmVGaWxlU3RhdGUoKTogRmlsZUNoYW5nZVN0YXRlIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZUFjdGl2ZURpZmZTdGF0ZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmlsZURpZmZTdGF0ZSA9IGF3YWl0IHRoaXMuX2ZldGNoRmlsZURpZmYoZmlsZVBhdGgpO1xuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgZmlsZURpZmZTdGF0ZSxcbiAgICAgIGZpbGVEaWZmU3RhdGUuZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlRGlmZlN0YXRlKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGZpbGVEaWZmU3RhdGU6IEZpbGVEaWZmU3RhdGUsXG4gICAgc2F2ZWRDb250ZW50czogc3RyaW5nLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7XG4gICAgICBjb21taXR0ZWRDb250ZW50czogb2xkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHM6IG5ld0NvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgIH0gPSBmaWxlRGlmZlN0YXRlO1xuICAgIGNvbnN0IHtoYXNoLCBib29rbWFya3N9ID0gcmV2aXNpb25JbmZvO1xuICAgIGNvbnN0IG5ld0ZpbGVTdGF0ZSA9IHtcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgb2xkQ29udGVudHMsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgICBjb21wYXJlUmV2aXNpb25JbmZvOiByZXZpc2lvbkluZm8sXG4gICAgICBmcm9tUmV2aXNpb25UaXRsZTogYCR7aGFzaH1gICsgKGJvb2ttYXJrcy5sZW5ndGggPT09IDAgPyAnJyA6IGAgLSAoJHtib29rbWFya3Muam9pbignLCAnKX0pYCksXG4gICAgICB0b1JldmlzaW9uVGl0bGU6ICdGaWxlc3lzdGVtIC8gRWRpdG9yJyxcbiAgICB9O1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZShuZXdGaWxlU3RhdGUpO1xuICAgIC8vIFRPRE8obW9zdCk6IEZpeDogdGhpcyBhc3N1bWVzIHRoYXQgdGhlIGVkaXRvciBjb250ZW50cyBhcmVuJ3QgY2hhbmdlZCB3aGlsZVxuICAgIC8vIGZldGNoaW5nIHRoZSBjb21tZW50cywgdGhhdCdzIG9rYXkgbm93IGJlY2F1c2Ugd2UgZG9uJ3QgZmV0Y2ggdGhlbS5cbiAgICBjb25zdCBpbmxpbmVDb21wb25lbnRzID0gYXdhaXQgdGhpcy5fZmV0Y2hJbmxpbmVDb21wb25lbnRzKCk7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHsuLi5uZXdGaWxlU3RhdGUsIGlubGluZUNvbXBvbmVudHN9KTtcbiAgfVxuXG4gIF9zZXRBY3RpdmVGaWxlU3RhdGUoc3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQsIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5oZy1zdGF0ZS11cGRhdGUnKVxuICBhc3luYyBfZmV0Y2hGaWxlRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8RmlsZURpZmZTdGF0ZT4ge1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX2dldFJlcG9zaXRvcnlTdGFja0ZvclBhdGgoZmlsZVBhdGgpO1xuICAgIGNvbnN0IFtoZ0RpZmZdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmZldGNoSGdEaWZmKGZpbGVQYXRoLCB2aWV3TW9kZVRvRGlmZk9wdGlvbih0aGlzLl9zdGF0ZS52aWV3TW9kZSkpLFxuICAgICAgdGhpcy5fc2V0QWN0aXZlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnlTdGFjayksXG4gICAgXSk7XG4gICAgLy8gSW50ZW50aW9uYWxseSBmZXRjaCB0aGUgZmlsZXN5c3RlbSBjb250ZW50cyBhZnRlciBnZXR0aW5nIHRoZSBjb21taXR0ZWQgY29udGVudHNcbiAgICAvLyB0byBtYWtlIHN1cmUgd2UgaGF2ZSB0aGUgbGF0ZXN0IGZpbGVzeXN0ZW0gdmVyc2lvbi5cbiAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBsb2FkQnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uaGdEaWZmLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzOiBidWZmZXIuZ2V0VGV4dCgpLFxuICAgIH07XG4gIH1cblxuICBfZ2V0UmVwb3NpdG9yeVN0YWNrRm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFJlcG9zaXRvcnlTdGFjayB7XG4gICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gaGdSZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aCk7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5nZXQoaGdSZXBvc2l0b3J5KTtcbiAgICBpbnZhcmlhbnQocmVwb3NpdG9yeVN0YWNrLCAnVGhlcmUgbXVzdCBiZSBhbiByZXBvc2l0b3J5IHN0YWNrIGZvciBhIGdpdmVuIHJlcG9zaXRvcnkhJyk7XG4gICAgcmV0dXJuIHJlcG9zaXRvcnlTdGFjaztcbiAgfVxuXG4gIGFzeW5jIF9zZXRBY3RpdmVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeVN0YWNrOiBSZXBvc2l0b3J5U3RhY2spOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09PSByZXBvc2l0b3J5U3RhY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID0gcmVwb3NpdG9yeVN0YWNrO1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgcmVwb3NpdG9yeVN0YWNrLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIHRoaXMuX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMocmVwb3NpdG9yeVN0YWNrLCByZXZpc2lvbnNTdGF0ZSwgZmFsc2UpO1xuICB9XG5cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5zYXZlLWZpbGUnKVxuICBzYXZlQWN0aXZlRmlsZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctc2F2ZS1maWxlJywge2ZpbGVQYXRofSk7XG4gICAgcmV0dXJuIHRoaXMuX3NhdmVGaWxlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnB1Ymxpc2gtZGlmZicpXG4gIGFzeW5jIHB1Ymxpc2hEaWZmKHB1Ymxpc2hNZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlLFxuICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5BV0FJVElOR19QVUJMSVNILFxuICAgIH0pO1xuICAgIGNvbnN0IHtwdWJsaXNoTW9kZX0gPSB0aGlzLl9zdGF0ZTtcbiAgICB0cmFjaygnZGlmZi12aWV3LXB1Ymxpc2gnLCB7XG4gICAgICBwdWJsaXNoTW9kZSxcbiAgICB9KTtcbiAgICBjb25zdCBjbGVhblJlc3VsdCA9IGF3YWl0IHRoaXMuX3Byb21wdFRvQ2xlYW5EaXJ0eUNoYW5nZXMocHVibGlzaE1lc3NhZ2UpO1xuICAgIGlmIChjbGVhblJlc3VsdCA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLlJFQURZLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHthbWVuZGVkLCBhbGxvd1VudHJhY2tlZH0gPSBjbGVhblJlc3VsdDtcbiAgICB0cnkge1xuICAgICAgc3dpdGNoIChwdWJsaXNoTW9kZSkge1xuICAgICAgICBjYXNlIFB1Ymxpc2hNb2RlLkNSRUFURTpcbiAgICAgICAgICAvLyBDcmVhdGUgdXNlcyBgdmVyYmF0aW1gIGFuZCBgbmAgYW5zd2VyIGJ1ZmZlclxuICAgICAgICAgIC8vIGFuZCB0aGF0IGltcGxpZXMgdGhhdCB1bnRyYWNrZWQgZmlsZXMgd2lsbCBiZSBpZ25vcmVkLlxuICAgICAgICAgIGF3YWl0IHRoaXMuX2NyZWF0ZVBoYWJyaWNhdG9yUmV2aXNpb24ocHVibGlzaE1lc3NhZ2UsIGFtZW5kZWQpO1xuICAgICAgICAgIGludmFyaWFudCh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2ssICdObyBhY3RpdmUgcmVwb3NpdG9yeSBzdGFjaycpO1xuICAgICAgICAgIC8vIEludmFsaWRhdGUgdGhlIGN1cnJlbnQgcmV2aXNpb25zIHN0YXRlIGJlY2F1c2UgdGhlIGN1cnJlbnQgY29tbWl0IGluZm8gaGFzIGNoYW5nZWQuXG4gICAgICAgICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmdldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFB1Ymxpc2hNb2RlLlVQREFURTpcbiAgICAgICAgICBhd2FpdCB0aGlzLl91cGRhdGVQaGFicmljYXRvclJldmlzaW9uKHB1Ymxpc2hNZXNzYWdlLCBhbGxvd1VudHJhY2tlZCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHB1Ymxpc2ggbW9kZSAnJHtwdWJsaXNoTW9kZX0nYCk7XG4gICAgICB9XG4gICAgICAvLyBQb3B1bGF0ZSBQdWJsaXNoIFVJIHdpdGggdGhlIG1vc3QgcmVjZW50IGRhdGEgYWZ0ZXIgYSBzdWNjZXNzZnVsIHB1c2guXG4gICAgICB0aGlzLl9sb2FkTW9kZVN0YXRlKHRydWUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yLCB0cnVlIC8qcGVyc2lzdCB0aGUgZXJyb3IgKHVzZXIgZGlzbWlzc2FibGUpKi8pO1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5SRUFEWSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9wcm9tcHRUb0NsZWFuRGlydHlDaGFuZ2VzKFxuICAgIGNvbW1pdE1lc3NhZ2U6IHN0cmluZyxcbiAgKTogUHJvbWlzZTw/e2FsbG93VW50cmFja2VkOiBib29sZWFuOyBhbWVuZGVkOiBib29sZWFuO30+IHtcbiAgICBjb25zdCBhY3RpdmVTdGFjayA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaztcbiAgICBpbnZhcmlhbnQoYWN0aXZlU3RhY2sgIT0gbnVsbCwgJ05vIGFjdGl2ZSByZXBvc2l0b3J5IHN0YWNrIHdoZW4gY2xlYW5pbmcgZGlydHkgY2hhbmdlcycpO1xuICAgIGNvbnN0IGRpcnR5RmlsZUNoYW5nZXMgPSBhY3RpdmVTdGFjay5nZXREaXJ0eUZpbGVDaGFuZ2VzKCk7XG4gICAgbGV0IHNob3VsZEFtZW5kID0gZmFsc2U7XG4gICAgbGV0IGFtZW5kZWQgPSBmYWxzZTtcbiAgICBsZXQgYWxsb3dVbnRyYWNrZWQgPSBmYWxzZTtcbiAgICBpZiAoZGlydHlGaWxlQ2hhbmdlcy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhbWVuZGVkLFxuICAgICAgICBhbGxvd1VudHJhY2tlZCxcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHVudHJhY2tlZENoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+ID0gbmV3IE1hcChcbiAgICAgIGFycmF5LmZyb20oZGlydHlGaWxlQ2hhbmdlcy5lbnRyaWVzKCkpXG4gICAgICAgIC5maWx0ZXIoZmlsZUNoYW5nZSA9PiBmaWxlQ2hhbmdlWzFdID09PSBGaWxlQ2hhbmdlU3RhdHVzLlVOVFJBQ0tFRClcbiAgICApO1xuICAgIGlmICh1bnRyYWNrZWRDaGFuZ2VzLnNpemUgPiAwKSB7XG4gICAgICBjb25zdCB1bnRyYWNrZWRDaG9pY2UgPSBhdG9tLmNvbmZpcm0oe1xuICAgICAgICBtZXNzYWdlOiAnWW91IGhhdmUgdW50cmFja2VkIGZpbGVzIGluIHlvdXIgd29ya2luZyBjb3B5OicsXG4gICAgICAgIGRldGFpbGVkTWVzc2FnZTogZ2V0RmlsZVN0YXR1c0xpc3RNZXNzYWdlKHVudHJhY2tlZENoYW5nZXMpLFxuICAgICAgICBidXR0b25zOiBbJ0NhbmNlbCcsICdBZGQnLCAnQWxsb3cgVW50cmFja2VkJ10sXG4gICAgICB9KTtcbiAgICAgIGdldExvZ2dlcigpLmluZm8oJ1VudHJhY2tlZCBjaGFuZ2VzIGNob2ljZTonLCB1bnRyYWNrZWRDaG9pY2UpO1xuICAgICAgaWYgKHVudHJhY2tlZENob2ljZSA9PT0gMCkgLypDYW5jZWwqLyB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIGlmICh1bnRyYWNrZWRDaG9pY2UgPT09IDEpIC8qQWRkKi8ge1xuICAgICAgICBhd2FpdCBhY3RpdmVTdGFjay5hZGQoYXJyYXkuZnJvbSh1bnRyYWNrZWRDaGFuZ2VzLmtleXMoKSkpO1xuICAgICAgICBzaG91bGRBbWVuZCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHVudHJhY2tlZENob2ljZSA9PT0gMikgLypBbGxvdyBVbnRyYWNrZWQqLyB7XG4gICAgICAgIGFsbG93VW50cmFja2VkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmV2ZXJ0YWJsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+ID0gbmV3IE1hcChcbiAgICAgIGFycmF5LmZyb20oZGlydHlGaWxlQ2hhbmdlcy5lbnRyaWVzKCkpXG4gICAgICAgIC5maWx0ZXIoZmlsZUNoYW5nZSA9PiBmaWxlQ2hhbmdlWzFdICE9PSBGaWxlQ2hhbmdlU3RhdHVzLlVOVFJBQ0tFRClcbiAgICApO1xuICAgIGlmIChyZXZlcnRhYmxlQ2hhbmdlcy5zaXplID4gMCkge1xuICAgICAgY29uc3QgY2xlYW5DaG9pY2UgPSBhdG9tLmNvbmZpcm0oe1xuICAgICAgICBtZXNzYWdlOiAnWW91IGhhdmUgdW5jb21taXR0ZWQgY2hhbmdlcyBpbiB5b3VyIHdvcmtpbmcgY29weTonLFxuICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IGdldEZpbGVTdGF0dXNMaXN0TWVzc2FnZShyZXZlcnRhYmxlQ2hhbmdlcyksXG4gICAgICAgIGJ1dHRvbnM6IFsnQ2FuY2VsJywgJ1JldmVydCcsICdBbWVuZCddLFxuICAgICAgfSk7XG4gICAgICBnZXRMb2dnZXIoKS5pbmZvKCdEaXJ0eSBjaGFuZ2VzIGNsZWFuIGNob2ljZTonLCBjbGVhbkNob2ljZSk7XG4gICAgICBpZiAoY2xlYW5DaG9pY2UgPT09IDApIC8qQ2FuY2VsKi8ge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoY2xlYW5DaG9pY2UgPT09IDEpIC8qUmV2ZXJ0Ki8ge1xuICAgICAgICBjb25zdCBjYW5SZXZlcnRGaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+ID0gYXJyYXlcbiAgICAgICAgICAuZnJvbShkaXJ0eUZpbGVDaGFuZ2VzLmVudHJpZXMoKSlcbiAgICAgICAgICAuZmlsdGVyKGZpbGVDaGFuZ2UgPT4gZmlsZUNoYW5nZVsxXSAhPT0gRmlsZUNoYW5nZVN0YXR1cy5VTlRSQUNLRUQpXG4gICAgICAgICAgLm1hcChmaWxlQ2hhbmdlID0+IGZpbGVDaGFuZ2VbMF0pO1xuICAgICAgICBhd2FpdCBhY3RpdmVTdGFjay5yZXZlcnQoY2FuUmV2ZXJ0RmlsZVBhdGhzKTtcbiAgICAgIH0gZWxzZSBpZiAoY2xlYW5DaG9pY2UgPT09IDIpIC8qQW1lbmQqLyB7XG4gICAgICAgIHNob3VsZEFtZW5kID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNob3VsZEFtZW5kKSB7XG4gICAgICBhd2FpdCBhY3RpdmVTdGFjay5hbWVuZChjb21taXRNZXNzYWdlKTtcbiAgICAgIGFtZW5kZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgYW1lbmRlZCxcbiAgICAgIGFsbG93VW50cmFja2VkLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBfY3JlYXRlUGhhYnJpY2F0b3JSZXZpc2lvbihcbiAgICBwdWJsaXNoTWVzc2FnZTogc3RyaW5nLFxuICAgIGFtZW5kZWQ6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgY29uc3QgbGFzdENvbW1pdE1lc3NhZ2UgPSBhd2FpdCB0aGlzLl9sb2FkQWN0aXZlUmVwb3NpdG9yeUxhdGVzdENvbW1pdE1lc3NhZ2UoKTtcbiAgICBpZiAoIWFtZW5kZWQgJiYgcHVibGlzaE1lc3NhZ2UgIT09IGxhc3RDb21taXRNZXNzYWdlKSB7XG4gICAgICBnZXRMb2dnZXIoKS5pbmZvKCdBbWVuZGluZyBjb21taXQgd2l0aCB0aGUgdXBkYXRlZCBtZXNzYWdlJyk7XG4gICAgICBpbnZhcmlhbnQodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrKTtcbiAgICAgIGF3YWl0IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5hbWVuZChwdWJsaXNoTWVzc2FnZSk7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnQ29tbWl0IGFtZW5kZWQgd2l0aCB0aGUgdXBkYXRlZCBtZXNzYWdlJyk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyhyb3NzYWxsZW4pOiBNYWtlIG51Y2xpZGUtY29uc29sZSBpbmZvcm0gdGhlIHVzZXIgdGhlcmUgaXMgbmV3IG91dHB1dCByYXRoZXIgdGhhbiBmb3JjZVxuICAgIC8vIGl0IG9wZW4gbGlrZSB0aGUgZm9sbG93aW5nLlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ251Y2xpZGUtY29uc29sZTpzaG93Jyk7XG5cbiAgICB0aGlzLl9tZXNzYWdlcy5vbk5leHQoe2xldmVsOiAnbG9nJywgdGV4dDogJ0NyZWF0aW5nIG5ldyByZXZpc2lvbi4uLid9KTtcbiAgICBhd2FpdCBhcmNhbmlzdC5jcmVhdGVQaGFicmljYXRvclJldmlzaW9uKGZpbGVQYXRoKVxuICAgICAgLnRhcChcbiAgICAgICAgKG1lc3NhZ2U6IHtzdGRlcnI/OiBzdHJpbmc7IHN0ZG91dD86IHN0cmluZzt9KSA9PiB7XG4gICAgICAgICAgdGhpcy5fbWVzc2FnZXMub25OZXh0KHtcbiAgICAgICAgICAgIGxldmVsOiAobWVzc2FnZS5zdGRlcnIgPT0gbnVsbCkgPyAnbG9nJyA6ICdlcnJvcicsXG4gICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLnN0ZG91dCB8fCBtZXNzYWdlLnN0ZGVycixcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge30sXG4gICAgICAgICgpID0+IHsgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ1JldmlzaW9uIGNyZWF0ZWQnKTsgfSxcbiAgICAgIClcbiAgICAgIC50b1Byb21pc2UoKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVQaGFicmljYXRvclJldmlzaW9uKFxuICAgIHB1Ymxpc2hNZXNzYWdlOiBzdHJpbmcsXG4gICAgYWxsb3dVbnRyYWNrZWQ6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgY29uc3Qge3BoYWJyaWNhdG9yUmV2aXNpb259ID0gYXdhaXQgdGhpcy5fZ2V0QWN0aXZlSGVhZFJldmlzaW9uRGV0YWlscygpO1xuICAgIGludmFyaWFudChwaGFicmljYXRvclJldmlzaW9uICE9IG51bGwsICdBIHBoYWJyaWNhdG9yIHJldmlzaW9uIG11c3QgZXhpc3QgdG8gdXBkYXRlIScpO1xuICAgIGNvbnN0IHVwZGF0ZVRlbXBsYXRlID0gZ2V0UmV2aXNpb25VcGRhdGVNZXNzYWdlKHBoYWJyaWNhdG9yUmV2aXNpb24pLnRyaW0oKTtcbiAgICBjb25zdCB1c2VyVXBkYXRlTWVzc2FnZSA9IHB1Ymxpc2hNZXNzYWdlLnJlcGxhY2UodXBkYXRlVGVtcGxhdGUsICcnKS50cmltKCk7XG4gICAgaWYgKHVzZXJVcGRhdGVNZXNzYWdlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXBkYXRlIHJldmlzaW9uIHdpdGggZW1wdHkgbWVzc2FnZScpO1xuICAgIH1cblxuICAgIC8vIFRPRE8ocm9zc2FsbGVuKTogTWFrZSBudWNsaWRlLWNvbnNvbGUgaW5mb3JtIHRoZSB1c2VyIHRoZXJlIGlzIG5ldyBvdXRwdXQgcmF0aGVyIHRoYW4gZm9yY2VcbiAgICAvLyBpdCBvcGVuIGxpa2UgdGhlIGZvbGxvd2luZy5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdudWNsaWRlLWNvbnNvbGU6c2hvdycpO1xuXG4gICAgdGhpcy5fbWVzc2FnZXMub25OZXh0KHtcbiAgICAgIGxldmVsOiAnbG9nJyxcbiAgICAgIHRleHQ6IGBVcGRhdGluZyByZXZpc2lvbiBcXGAke3BoYWJyaWNhdG9yUmV2aXNpb24uaWR9XFxgLi4uYCxcbiAgICB9KTtcbiAgICBhd2FpdCBhcmNhbmlzdC51cGRhdGVQaGFicmljYXRvclJldmlzaW9uKGZpbGVQYXRoLCB1c2VyVXBkYXRlTWVzc2FnZSwgYWxsb3dVbnRyYWNrZWQpXG4gICAgICAudGFwKFxuICAgICAgICAobWVzc2FnZToge3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30pID0+IHtcbiAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5vbk5leHQoe1xuICAgICAgICAgICAgbGV2ZWw6IChtZXNzYWdlLnN0ZGVyciA9PSBudWxsKSA/ICdsb2cnIDogJ2Vycm9yJyxcbiAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2Uuc3Rkb3V0IHx8IG1lc3NhZ2Uuc3RkZXJyLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7fSxcbiAgICAgICAgKCkgPT4geyBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhgUmV2aXNpb24gXFxgJHtwaGFicmljYXRvclJldmlzaW9uLmlkfVxcYCB1cGRhdGVkYCk7IH1cbiAgICAgIClcbiAgICAgIC50b1Byb21pc2UoKTtcbiAgfVxuXG4gIF9vbldpbGxTYXZlQWN0aXZlQnVmZmVyKGJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSxcbiAgICAgIHNhdmVkQ29udGVudHM6IGJ1ZmZlci5nZXRUZXh0KCksXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfc2F2ZUZpbGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIGlmIChidWZmZXIgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBmaWxlIGJ1ZmZlciB0byBzYXZlOiBcXGAke2ZpbGVQYXRofVxcYGApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYnVmZmVyLnNhdmUoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHNhdmUgZmlsZSBidWZmZXI6IFxcYCR7ZmlsZVBhdGh9XFxgIC0gJHtlcnIudG9TdHJpbmcoKX1gKTtcbiAgICB9XG4gIH1cblxuICBvbkRpZFVwZGF0ZVN0YXRlKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihESURfVVBEQVRFX1NUQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvblJldmlzaW9uc1VwZGF0ZShjYWxsYmFjazogKHN0YXRlOiA/UmV2aXNpb25zU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25BY3RpdmVGaWxlVXBkYXRlcyhjYWxsYmFjazogKHN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1jb21tZW50cycpXG4gIGFzeW5jIF9mZXRjaElubGluZUNvbXBvbmVudHMoKTogUHJvbWlzZTxBcnJheTxPYmplY3Q+PiB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBjb25zdCB1aUVsZW1lbnRQcm9taXNlcyA9IHRoaXMuX3VpUHJvdmlkZXJzLm1hcChcbiAgICAgIHByb3ZpZGVyID0+IHByb3ZpZGVyLmNvbXBvc2VVaUVsZW1lbnRzKGZpbGVQYXRoKVxuICAgICk7XG4gICAgY29uc3QgdWlDb21wb25lbnRMaXN0cyA9IGF3YWl0IFByb21pc2UuYWxsKHVpRWxlbWVudFByb21pc2VzKTtcbiAgICAvLyBGbGF0dGVuIHVpQ29tcG9uZW50TGlzdHMgZnJvbSBsaXN0IG9mIGxpc3RzIG9mIGNvbXBvbmVudHMgdG8gYSBsaXN0IG9mIGNvbXBvbmVudHMuXG4gICAgY29uc3QgdWlDb21wb25lbnRzID0gW10uY29uY2F0LmFwcGx5KFtdLCB1aUNvbXBvbmVudExpc3RzKTtcbiAgICByZXR1cm4gdWlDb21wb25lbnRzO1xuICB9XG5cbiAgYXN5bmMgX2xvYWRDb21taXRNb2RlU3RhdGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZS5MT0FESU5HX0NPTU1JVF9NRVNTQUdFLFxuICAgIH0pO1xuXG4gICAgbGV0IGNvbW1pdE1lc3NhZ2UgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5fc3RhdGUuY29tbWl0TWVzc2FnZSAhPSBudWxsKSB7XG4gICAgICAgIGNvbW1pdE1lc3NhZ2UgPSB0aGlzLl9zdGF0ZS5jb21taXRNZXNzYWdlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9zdGF0ZS5jb21taXRNb2RlID09PSBDb21taXRNb2RlLkNPTU1JVCkge1xuICAgICAgICBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fbG9hZEFjdGl2ZVJlcG9zaXRvcnlUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbW1pdE1lc3NhZ2UgPSBhd2FpdCB0aGlzLl9sb2FkQWN0aXZlUmVwb3NpdG9yeUxhdGVzdENvbW1pdE1lc3NhZ2UoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbm90aWZ5SW50ZXJuYWxFcnJvcihlcnJvcik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICAgIGNvbW1pdE1lc3NhZ2UsXG4gICAgICAgIGNvbW1pdE1vZGVTdGF0ZTogQ29tbWl0TW9kZVN0YXRlLlJFQURZLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX2xvYWRQdWJsaXNoTW9kZVN0YXRlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBwdWJsaXNoTWVzc2FnZSA9IHRoaXMuX3N0YXRlLnB1Ymxpc2hNZXNzYWdlO1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgcHVibGlzaE1vZGU6IFB1Ymxpc2hNb2RlLkNSRUFURSxcbiAgICAgIHB1Ymxpc2hNb2RlU3RhdGU6IFB1Ymxpc2hNb2RlU3RhdGUuTE9BRElOR19QVUJMSVNIX01FU1NBR0UsXG4gICAgICBwdWJsaXNoTWVzc2FnZTogbnVsbCxcbiAgICAgIGhlYWRSZXZpc2lvbjogbnVsbCxcbiAgICB9KTtcbiAgICBjb25zdCB7aGVhZFJldmlzaW9uLCBwaGFicmljYXRvclJldmlzaW9ufSA9IGF3YWl0IHRoaXMuX2dldEFjdGl2ZUhlYWRSZXZpc2lvbkRldGFpbHMoKTtcbiAgICBpZiAocHVibGlzaE1lc3NhZ2UgPT0gbnVsbCkge1xuICAgICAgcHVibGlzaE1lc3NhZ2UgPSBwaGFicmljYXRvclJldmlzaW9uICE9IG51bGxcbiAgICAgICAgPyBnZXRSZXZpc2lvblVwZGF0ZU1lc3NhZ2UocGhhYnJpY2F0b3JSZXZpc2lvbilcbiAgICAgICAgOiBoZWFkUmV2aXNpb24uZGVzY3JpcHRpb247XG4gICAgfVxuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgcHVibGlzaE1vZGU6IHBoYWJyaWNhdG9yUmV2aXNpb24gIT0gbnVsbCA/IFB1Ymxpc2hNb2RlLlVQREFURSA6IFB1Ymxpc2hNb2RlLkNSRUFURSxcbiAgICAgIHB1Ymxpc2hNb2RlU3RhdGU6IFB1Ymxpc2hNb2RlU3RhdGUuUkVBRFksXG4gICAgICBwdWJsaXNoTWVzc2FnZSxcbiAgICAgIGhlYWRSZXZpc2lvbixcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9nZXRBY3RpdmVIZWFkUmV2aXNpb25EZXRhaWxzKCk6IFByb21pc2U8e1xuICAgIGhlYWRSZXZpc2lvbjogUmV2aXNpb25JbmZvO1xuICAgIHBoYWJyaWNhdG9yUmV2aXNpb246ID9QaGFicmljYXRvclJldmlzaW9uSW5mbztcbiAgfT4ge1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRBY3RpdmVSZXZpc2lvbnNTdGF0ZSgpO1xuICAgIGlmIChyZXZpc2lvbnNTdGF0ZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBMb2FkIFB1Ymxpc2ggVmlldzogTm8gYWN0aXZlIGZpbGUgb3IgcmVwb3NpdG9yeScpO1xuICAgIH1cbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIGludmFyaWFudChyZXZpc2lvbnMubGVuZ3RoID4gMCwgJ0RpZmYgVmlldyBFcnJvcjogWmVybyBSZXZpc2lvbnMnKTtcbiAgICBjb25zdCBoZWFkUmV2aXNpb24gPSByZXZpc2lvbnNbcmV2aXNpb25zLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IHBoYWJyaWNhdG9yUmV2aXNpb24gPSBhcmNhbmlzdC5nZXRQaGFicmljYXRvclJldmlzaW9uRnJvbUNvbW1pdE1lc3NhZ2UoXG4gICAgICBoZWFkUmV2aXNpb24uZGVzY3JpcHRpb24sXG4gICAgKTtcbiAgICByZXR1cm4ge1xuICAgICAgaGVhZFJldmlzaW9uLFxuICAgICAgcGhhYnJpY2F0b3JSZXZpc2lvbixcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgX2xvYWRBY3RpdmVSZXBvc2l0b3J5TGF0ZXN0Q29tbWl0TWVzc2FnZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEaWZmIFZpZXc6IE5vIGFjdGl2ZSBmaWxlIG9yIHJlcG9zaXRvcnkgb3BlbicpO1xuICAgIH1cbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZSA9IGF3YWl0IHRoaXMuZ2V0QWN0aXZlUmV2aXNpb25zU3RhdGUoKTtcbiAgICBpbnZhcmlhbnQocmV2aXNpb25zU3RhdGUsICdEaWZmIFZpZXcgSW50ZXJuYWwgRXJyb3I6IHJldmlzaW9uc1N0YXRlIGNhbm5vdCBiZSBudWxsJyk7XG4gICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICBpbnZhcmlhbnQocmV2aXNpb25zLmxlbmd0aCA+IDAsICdEaWZmIFZpZXcgRXJyb3I6IENhbm5vdCBhbWVuZCBub24tZXhpc3RpbmcgY29tbWl0Jyk7XG4gICAgcmV0dXJuIHJldmlzaW9uc1tyZXZpc2lvbnMubGVuZ3RoIC0gMV0uZGVzY3JpcHRpb247XG4gIH1cblxuICBhc3luYyBfbG9hZEFjdGl2ZVJlcG9zaXRvcnlUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZmYgVmlldzogTm8gYWN0aXZlIGZpbGUgb3IgcmVwb3NpdG9yeSBvcGVuJyk7XG4gICAgfVxuICAgIGxldCBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmdldFRlbXBsYXRlQ29tbWl0TWVzc2FnZSgpO1xuICAgIC8vIENvbW1pdCB0ZW1wbGF0ZXMgdGhhdCBpbmNsdWRlIG5ld2xpbmUgc3RyaW5ncywgJ1xcXFxuJyBpbiBKYXZhU2NyaXB0LCBuZWVkIHRvIGNvbnZlcnQgdGhlaXJcbiAgICAvLyBzdHJpbmdzIHRvIGxpdGVyYWwgbmV3bGluZXMsICdcXG4nIGluIEphdmFTY3JpcHQsIHRvIGJlIHJlbmRlcmVkIGFzIGxpbmUgYnJlYWtzLlxuICAgIGlmIChjb21taXRNZXNzYWdlICE9IG51bGwpIHtcbiAgICAgIGNvbW1pdE1lc3NhZ2UgPSBjb252ZXJ0TmV3bGluZXMoY29tbWl0TWVzc2FnZSk7XG4gICAgfVxuICAgIHJldHVybiBjb21taXRNZXNzYWdlO1xuICB9XG5cbiAgYXN5bmMgZ2V0QWN0aXZlUmV2aXNpb25zU3RhdGUoKTogUHJvbWlzZTw/UmV2aXNpb25zU3RhdGU+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICB9XG5cbiAgX3NldFN0YXRlKG5ld1N0YXRlOiBTdGF0ZSkge1xuICAgIHRoaXMuX3N0YXRlID0gbmV3U3RhdGU7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KERJRF9VUERBVEVfU1RBVEVfRVZFTlQpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuY29tbWl0JylcbiAgYXN5bmMgY29tbWl0KG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChtZXNzYWdlID09PSAnJykge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdDb21taXQgYWJvcnRlZCcsIHtkZXRhaWw6ICdDb21taXQgbWVzc2FnZSBlbXB0eSd9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIGNvbW1pdE1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZS5BV0FJVElOR19DT01NSVQsXG4gICAgfSk7XG5cbiAgICBjb25zdCB7Y29tbWl0TW9kZX0gPSB0aGlzLl9zdGF0ZTtcbiAgICB0cmFjaygnZGlmZi12aWV3LWNvbW1pdCcsIHtcbiAgICAgIGNvbW1pdE1vZGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY3RpdmVTdGFjayA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaztcbiAgICB0cnkge1xuICAgICAgaW52YXJpYW50KGFjdGl2ZVN0YWNrLCAnTm8gYWN0aXZlIHJlcG9zaXRvcnkgc3RhY2snKTtcbiAgICAgIHN3aXRjaCAoY29tbWl0TW9kZSkge1xuICAgICAgICBjYXNlIENvbW1pdE1vZGUuQ09NTUlUOlxuICAgICAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLmNvbW1pdChtZXNzYWdlKTtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnQ29tbWl0IGNyZWF0ZWQnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBDb21taXRNb2RlLkFNRU5EOlxuICAgICAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLmFtZW5kKG1lc3NhZ2UpO1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb21taXQgYW1lbmRlZCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBGb3JjZSB0cmlnZ2VyIGFuIHVwZGF0ZSB0byB0aGUgcmV2aXNpb25zIHRvIHVwZGF0ZSB0aGUgVUkgc3RhdGUgd2l0aCB0aGUgbmV3IGNvbW1pdCBpbmZvLlxuICAgICAgYWN0aXZlU3RhY2suZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgICB0aGlzLl9sb2FkTW9kZVN0YXRlKHRydWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgJ0Vycm9yIGNyZWF0aW5nIGNvbW1pdCcsXG4gICAgICAgIHtkZXRhaWw6IGBEZXRhaWxzOiAke2Uuc3Rkb3V0fWB9LFxuICAgICAgKTtcbiAgICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICAgIGNvbW1pdE1vZGVTdGF0ZTogQ29tbWl0TW9kZVN0YXRlLlJFQURZLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgZ2V0U3RhdGUoKTogU3RhdGUge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgfVxuXG4gIHNldENvbW1pdE1vZGUoY29tbWl0TW9kZTogQ29tbWl0TW9kZVR5cGUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RhdGUuY29tbWl0TW9kZSA9PT0gY29tbWl0TW9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cmFjaygnZGlmZi12aWV3LXN3aXRjaC1jb21taXQtbW9kZScsIHtcbiAgICAgIGNvbW1pdE1vZGUsXG4gICAgfSk7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBjb21taXRNb2RlLFxuICAgICAgY29tbWl0TWVzc2FnZTogbnVsbCxcbiAgICB9KTtcbiAgICAvLyBXaGVuIHRoZSBjb21taXQgbW9kZSBjaGFuZ2VzLCBsb2FkIHRoZSBhcHByb3ByaWF0ZSBjb21taXQgbWVzc2FnZS5cbiAgICB0aGlzLl9sb2FkTW9kZVN0YXRlKHRydWUpO1xuICB9XG5cbiAgYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlUmVwb3NpdG9yaWVzKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgcmVwb3NpdG9yeVN0YWNrIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpIHtcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5hY3RpdmF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5kZWFjdGl2YXRlKCk7XG4gICAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoZ2V0SW5pdGlhbEZpbGVDaGFuZ2VTdGF0ZSgpKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5U3RhY2sgb2YgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5jbGVhcigpO1xuICAgIGZvciAoY29uc3Qgc3Vic2NyaXB0aW9uIG9mIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLnZhbHVlcygpKSB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5jbGVhcigpO1xuICAgIGlmICh0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlZpZXdNb2RlbDtcbiJdfQ==