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
  function DiffViewModel() {
    var _this = this;

    _classCallCheck(this, DiffViewModel);

    this._emitter = new _atom.Emitter();
    this._subscriptions = new _atom.CompositeDisposable();
    this._uiProviders = [];
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
      // Dispose removed projects repositories, if any.
      for (var _ref43 of this._repositoryStacks) {
        var _ref42 = _slicedToArray(_ref43, 2);

        var repository = _ref42[0];
        var repositoryStack = _ref42[1];

        if (repositories.has(repository)) {
          continue;
        }
        if (this._activeRepositoryStack === repositoryStack) {
          this._activeRepositoryStack = null;
        }
        repositoryStack.dispose();
        this._repositoryStacks['delete'](repository);
        var subscriptions = this._repositorySubscriptions.get(repository);
        (0, _assert2['default'])(subscriptions);
        subscriptions.dispose();
        this._repositorySubscriptions['delete'](repository);
      }

      // Add the new project repositories, if any.
      for (var repository of repositories) {
        if (this._repositoryStacks.has(repository)) {
          continue;
        }
        var hgRepository = repository;
        this._createRepositoryStack(hgRepository);
      }

      // Update active repository stack, if needed.
      // This will make sure we have a repository stack active whenever we have
      // a mercurial repository added to the project.
      if (this._activeRepositoryStack == null && this._repositoryStacks.size > 0) {
        this._setActiveRepositoryStack(_nuclideCommons.array.from(this._repositoryStacks.values())[0]);
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
        var repository = (0, _nuclideHgGitBridge.repositoryForPath)(entityOption.file || entityOption.directory || '');
        if (repository != null && repository.getType() === 'hg' && this._repositoryStacks.has(repository)) {
          var repositoryStack = this._repositoryStacks.get(repository);
          (0, _assert2['default'])(repositoryStack);
          this._setActiveRepositoryStack(repositoryStack);
        } else {
          (0, _nuclideLogging.getLogger)().warn('Non diffable entity:', entityOption);
        }
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
      yield this._updateInlineComponents();
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
      if (!this._isActive) {
        return;
      }
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
    key: '_getArcanistFilePath',
    value: function _getArcanistFilePath() {
      var filePath = this._activeFileState.filePath;

      if (filePath === '' && this._activeRepositoryStack != null) {
        filePath = this._activeRepositoryStack.getRepository().getProjectDirectory();
      }
      return filePath;
    }
  }, {
    key: '_createPhabricatorRevision',
    value: _asyncToGenerator(function* (publishMessage, amended) {
      var _this5 = this;

      var filePath = this._getArcanistFilePath();
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

      var filePath = this._getArcanistFilePath();

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
    key: '_updateInlineComponents',
    value: _asyncToGenerator(function* () {
      var filePath = this._activeFileState.filePath;

      if (!filePath) {
        return;
      }
      var inlineComponents = yield this._fetchInlineComponents(filePath);
      if (filePath !== this._activeFileState.filePath) {
        return;
      }
      this._setActiveFileState(_extends({}, this._activeFileState, { inlineComponents: inlineComponents }));
    })
  }, {
    key: '_fetchInlineComponents',
    decorators: [(0, _nuclideAnalytics.trackTiming)('diff-view.fetch-comments')],
    value: _asyncToGenerator(function* (filePath) {
      // TODO(most): Fix UI rendering and re-introduce: t8174332
      // provider.composeUiElements(filePath)
      var uiElementPromises = this._uiProviders.map(function (provider) {
        return Promise.resolve([]);
      });
      var uiComponentLists = yield Promise.all(uiElementPromises);
      // Flatten uiComponentLists from list of lists of components to a list of components.
      var uiComponents = [].concat.apply([], uiComponentLists);
      return uiComponents;
    })
  }, {
    key: 'setUiProviders',
    value: function setUiProviders(uiProviders) {
      this._uiProviders = uiProviders;
      this._updateInlineComponents()['catch'](_notifications.notifyInternalError);
    }
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
      if (this._activeRepositoryStack == null || !this._isActive) {
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
//# sourceMappingURL=data:application/json;base64,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QXNCLEdBQUcsSUFBSSxDQUFDO09BQ3BDO0FBQ0QsVUFBSSxDQUFDLG1CQUFtQixDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQztLQUN2RDs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFdBQUssSUFBTSxlQUFlLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQzdELHVCQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDM0I7QUFDRCxVQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDL0IsV0FBSyxJQUFNLFlBQVksSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDakUsb0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN4QjtBQUNELFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QyxVQUFJLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLEVBQUU7QUFDckMsWUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BDLFlBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7T0FDbEM7S0FDRjs7O1NBOS9CRyxhQUFhOzs7QUFpZ0NuQixNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJEaWZmVmlld01vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWNsaWVudCc7XG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVDaGFuZ2VTdGF0ZSxcbiAgUmV2aXNpb25zU3RhdGUsXG4gIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSxcbiAgQ29tbWl0TW9kZVR5cGUsXG4gIENvbW1pdE1vZGVTdGF0ZVR5cGUsXG4gIFB1Ymxpc2hNb2RlVHlwZSxcbiAgUHVibGlzaE1vZGVTdGF0ZVR5cGUsXG4gIERpZmZNb2RlVHlwZSxcbiAgRGlmZk9wdGlvblR5cGUsXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UvbGliL0hnU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtQaGFicmljYXRvclJldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hcmNhbmlzdC1jbGllbnQnO1xuaW1wb3J0IHR5cGUge1xuICBVSVByb3ZpZGVyLFxuICBVSUVsZW1lbnQsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGlmZi11aS1wcm92aWRlci1pbnRlcmZhY2VzJztcblxudHlwZSBGaWxlRGlmZlN0YXRlID0ge1xuICByZXZpc2lvbkluZm86IFJldmlzaW9uSW5mbztcbiAgY29tbWl0dGVkQ29udGVudHM6IHN0cmluZztcbiAgZmlsZXN5c3RlbUNvbnRlbnRzOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBEaWZmRW50aXR5T3B0aW9ucyA9IHtcbiAgZmlsZTogTnVjbGlkZVVyaTtcbn0gfCB7XG4gIGRpcmVjdG9yeTogTnVjbGlkZVVyaTtcbn07XG5cbmltcG9ydCBhcmNhbmlzdCBmcm9tICcuLi8uLi9udWNsaWRlLWFyY2FuaXN0LWNsaWVudCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgRGlmZk1vZGUsXG4gIERpZmZPcHRpb24sXG4gIENvbW1pdE1vZGUsXG4gIENvbW1pdE1vZGVTdGF0ZSxcbiAgUHVibGlzaE1vZGUsXG4gIFB1Ymxpc2hNb2RlU3RhdGUsXG4gIEZpbGVDaGFuZ2VTdGF0dXMsXG4gIEZpbGVDaGFuZ2VTdGF0dXNUb1ByZWZpeCxcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1naXQtYnJpZGdlJztcbmltcG9ydCB7dHJhY2ssIHRyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1Db250ZW50c30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2FycmF5LCBtYXAsIGRlYm91bmNlLCBwcm9taXNlc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCBSZXBvc2l0b3J5U3RhY2sgZnJvbSAnLi9SZXBvc2l0b3J5U3RhY2snO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcbmltcG9ydCB7XG4gIG5vdGlmeUludGVybmFsRXJyb3IsXG4gIG5vdGlmeUZpbGVzeXN0ZW1PdmVycmlkZVVzZXJFZGl0cyxcbn0gZnJvbSAnLi9ub3RpZmljYXRpb25zJztcbmltcG9ydCB7YnVmZmVyRm9yVXJpLCBsb2FkQnVmZmVyRm9yVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcblxuY29uc3Qge3NlcmlhbGl6ZUFzeW5jQ2FsbH0gPSBwcm9taXNlcztcblxuY29uc3QgQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5UID0gJ2FjdGl2ZS1maWxlLXVwZGF0ZSc7XG5jb25zdCBDSEFOR0VfUkVWSVNJT05TX0VWRU5UID0gJ2RpZC1jaGFuZ2UtcmV2aXNpb25zJztcbmNvbnN0IEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5UID0gJ2FjdGl2ZS1idWZmZXItY2hhbmdlLW1vZGlmaWVkJztcbmNvbnN0IERJRF9VUERBVEVfU1RBVEVfRVZFTlQgPSAnZGlkLXVwZGF0ZS1zdGF0ZSc7XG5cbmZ1bmN0aW9uIGdldFJldmlzaW9uVXBkYXRlTWVzc2FnZShwaGFicmljYXRvclJldmlzaW9uOiBQaGFicmljYXRvclJldmlzaW9uSW5mbyk6IHN0cmluZyB7XG4gIHJldHVybiBgXG5cbiMgVXBkYXRpbmcgJHtwaGFicmljYXRvclJldmlzaW9uLmlkfVxuI1xuIyBFbnRlciBhIGJyaWVmIGRlc2NyaXB0aW9uIG9mIHRoZSBjaGFuZ2VzIGluY2x1ZGVkIGluIHRoaXMgdXBkYXRlLlxuIyBUaGUgZmlyc3QgbGluZSBpcyB1c2VkIGFzIHN1YmplY3QsIG5leHQgbGluZXMgYXMgY29tbWVudC5gO1xufVxuXG5jb25zdCBGSUxFX0NIQU5HRV9ERUJPVU5DRV9NUyA9IDIwMDtcbmNvbnN0IE1BWF9ESUFMT0dfRklMRV9TVEFUVVNfQ09VTlQgPSAyMDtcblxuLy8gUmV0dXJucyBhIHN0cmluZyB3aXRoIGFsbCBuZXdsaW5lIHN0cmluZ3MsICdcXFxcbicsIGNvbnZlcnRlZCB0byBsaXRlcmFsIG5ld2xpbmVzLCAnXFxuJy5cbmZ1bmN0aW9uIGNvbnZlcnROZXdsaW5lcyhtZXNzYWdlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbWVzc2FnZS5yZXBsYWNlKC9cXFxcbi9nLCAnXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxGaWxlQ2hhbmdlU3RhdGUoKTogRmlsZUNoYW5nZVN0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICBmcm9tUmV2aXNpb25UaXRsZTogJ05vIGZpbGUgc2VsZWN0ZWQnLFxuICAgIHRvUmV2aXNpb25UaXRsZTogJ05vIGZpbGUgc2VsZWN0ZWQnLFxuICAgIGZpbGVQYXRoOiAnJyxcbiAgICBvbGRDb250ZW50czogJycsXG4gICAgbmV3Q29udGVudHM6ICcnLFxuICAgIGNvbXBhcmVSZXZpc2lvbkluZm86IG51bGwsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHZpZXdNb2RlVG9EaWZmT3B0aW9uKHZpZXdNb2RlOiBEaWZmTW9kZVR5cGUpOiBEaWZmT3B0aW9uVHlwZSB7XG4gIHN3aXRjaCAodmlld01vZGUpIHtcbiAgICBjYXNlIERpZmZNb2RlLkNPTU1JVF9NT0RFOlxuICAgICAgcmV0dXJuIERpZmZPcHRpb24uRElSVFk7XG4gICAgY2FzZSBEaWZmTW9kZS5QVUJMSVNIX01PREU6XG4gICAgICByZXR1cm4gRGlmZk9wdGlvbi5MQVNUX0NPTU1JVDtcbiAgICBjYXNlIERpZmZNb2RlLkJST1dTRV9NT0RFOlxuICAgICAgcmV0dXJuIERpZmZPcHRpb24uQ09NUEFSRV9DT01NSVQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5yZWNvZ25pemVkIHZpZXcgbW9kZSEnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRGaWxlU3RhdHVzTGlzdE1lc3NhZ2UoZmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+KTogc3RyaW5nIHtcbiAgbGV0IG1lc3NhZ2UgPSAnJztcbiAgaWYgKGZpbGVDaGFuZ2VzLnNpemUgPCBNQVhfRElBTE9HX0ZJTEVfU1RBVFVTX0NPVU5UKSB7XG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIHN0YXR1c0NvZGVdIG9mIGZpbGVDaGFuZ2VzKSB7XG4gICAgICBtZXNzYWdlICs9ICdcXG4nXG4gICAgICAgICsgRmlsZUNoYW5nZVN0YXR1c1RvUHJlZml4W3N0YXR1c0NvZGVdXG4gICAgICAgICsgYXRvbS5wcm9qZWN0LnJlbGF0aXZpemUoZmlsZVBhdGgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBtZXNzYWdlID0gYFxcbiBtb3JlIHRoYW4gJHtNQVhfRElBTE9HX0ZJTEVfU1RBVFVTX0NPVU5UfSBmaWxlcyAoY2hlY2sgdXNpbmcgXFxgaGcgc3RhdHVzXFxgKWA7XG4gIH1cbiAgcmV0dXJuIG1lc3NhZ2U7XG59XG5cbmZ1bmN0aW9uIGhnUmVwb3NpdG9yeUZvclBhdGgoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBIZ1JlcG9zaXRvcnlDbGllbnQge1xuICAvLyBDYWxsaW5nIGF0b20ucHJvamVjdC5yZXBvc2l0b3J5Rm9yRGlyZWN0b3J5IGdldHMgdGhlIHJlYWwgcGF0aCBvZiB0aGUgZGlyZWN0b3J5LFxuICAvLyB3aGljaCBpcyBhbm90aGVyIHJvdW5kLXRyaXAgYW5kIGNhbGxzIHRoZSByZXBvc2l0b3J5IHByb3ZpZGVycyB0byBnZXQgYW4gZXhpc3RpbmcgcmVwb3NpdG9yeS5cbiAgLy8gSW5zdGVhZCwgdGhlIGZpcnN0IG1hdGNoIG9mIHRoZSBmaWx0ZXJpbmcgaGVyZSBpcyB0aGUgb25seSBwb3NzaWJsZSBtYXRjaC5cbiAgY29uc3QgcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnlGb3JQYXRoKGZpbGVQYXRoKTtcbiAgaWYgKHJlcG9zaXRvcnkgPT0gbnVsbCB8fCByZXBvc2l0b3J5LmdldFR5cGUoKSAhPT0gJ2hnJykge1xuICAgIGNvbnN0IHR5cGUgPSByZXBvc2l0b3J5ID8gcmVwb3NpdG9yeS5nZXRUeXBlKCkgOiAnbm8gcmVwb3NpdG9yeSc7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYERpZmYgdmlldyBvbmx5IHN1cHBvcnRzIFxcYE1lcmN1cmlhbFxcYCByZXBvc2l0b3JpZXMsIGAgK1xuICAgICAgYGJ1dCBmb3VuZCBcXGAke3R5cGV9XFxgIGF0IHBhdGg6IFxcYCR7ZmlsZVBhdGh9XFxgYFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIChyZXBvc2l0b3J5OiBhbnkpO1xufVxuXG50eXBlIFN0YXRlID0ge1xuICB2aWV3TW9kZTogRGlmZk1vZGVUeXBlO1xuICBjb21taXRNZXNzYWdlOiA/c3RyaW5nO1xuICBjb21taXRNb2RlOiBDb21taXRNb2RlVHlwZTtcbiAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGVUeXBlO1xuICBwdWJsaXNoTWVzc2FnZTogP3N0cmluZztcbiAgcHVibGlzaE1vZGU6IFB1Ymxpc2hNb2RlVHlwZTtcbiAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZVR5cGU7XG4gIGhlYWRSZXZpc2lvbjogP1JldmlzaW9uSW5mbztcbiAgZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIGNvbW1pdE1lcmdlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBsYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIHNlbGVjdGVkRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBzaG93Tm9uSGdSZXBvczogYm9vbGVhbjtcbn07XG5cbmNsYXNzIERpZmZWaWV3TW9kZWwge1xuXG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGl2ZVN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYWN0aXZlRmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGU7XG4gIF9hY3RpdmVSZXBvc2l0b3J5U3RhY2s6ID9SZXBvc2l0b3J5U3RhY2s7XG4gIF9uZXdFZGl0b3I6ID9UZXh0RWRpdG9yO1xuICBfdWlQcm92aWRlcnM6IEFycmF5PFVJUHJvdmlkZXI+O1xuICBfcmVwb3NpdG9yeVN0YWNrczogTWFwPEhnUmVwb3NpdG9yeUNsaWVudCwgUmVwb3NpdG9yeVN0YWNrPjtcbiAgX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zOiBNYXA8SGdSZXBvc2l0b3J5Q2xpZW50LCBDb21wb3NpdGVEaXNwb3NhYmxlPjtcbiAgX2lzQWN0aXZlOiBib29sZWFuO1xuICBfc3RhdGU6IFN0YXRlO1xuICBfbWVzc2FnZXM6IFJ4LlN1YmplY3Q7XG4gIF9zZXJpYWxpemVkVXBkYXRlQWN0aXZlRmlsZURpZmY6ICgpID0+IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fdWlQcm92aWRlcnMgPSBbXTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fbWVzc2FnZXMgPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIHRoaXMuX3N0YXRlID0ge1xuICAgICAgdmlld01vZGU6IERpZmZNb2RlLkJST1dTRV9NT0RFLFxuICAgICAgY29tbWl0TWVzc2FnZTogbnVsbCxcbiAgICAgIGNvbW1pdE1vZGU6IENvbW1pdE1vZGUuQ09NTUlULFxuICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuUkVBRFksXG4gICAgICBwdWJsaXNoTWVzc2FnZTogbnVsbCxcbiAgICAgIHB1Ymxpc2hNb2RlOiBQdWJsaXNoTW9kZS5DUkVBVEUsXG4gICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLlJFQURZLFxuICAgICAgaGVhZFJldmlzaW9uOiBudWxsLFxuICAgICAgZGlydHlGaWxlQ2hhbmdlczogbmV3IE1hcCgpLFxuICAgICAgY29tbWl0TWVyZ2VGaWxlQ2hhbmdlczogbmV3IE1hcCgpLFxuICAgICAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXM6IG5ldyBNYXAoKSxcbiAgICAgIHNlbGVjdGVkRmlsZUNoYW5nZXM6IG5ldyBNYXAoKSxcbiAgICAgIHNob3dOb25IZ1JlcG9zOiB0cnVlLFxuICAgIH07XG4gICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZUFjdGl2ZUZpbGVEaWZmID0gc2VyaWFsaXplQXN5bmNDYWxsKCgpID0+IHRoaXMuX3VwZGF0ZUFjdGl2ZUZpbGVEaWZmKCkpO1xuICAgIHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcygpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHRoaXMuX3VwZGF0ZVJlcG9zaXRvcmllcy5iaW5kKHRoaXMpKSk7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKGdldEluaXRpYWxGaWxlQ2hhbmdlU3RhdGUoKSk7XG4gICAgdGhpcy5fY2hlY2tDdXN0b21Db25maWcoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIGFzeW5jIF9jaGVja0N1c3RvbUNvbmZpZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgY29uZmlnID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgY29uZmlnID0gcmVxdWlyZSgnLi9mYi9jb25maWcnKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGNvbmZpZyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGF3YWl0IGNvbmZpZy5hcHBseUNvbmZpZygpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVSZXBvc2l0b3JpZXMoKTogdm9pZCB7XG4gICAgY29uc3QgcmVwb3NpdG9yaWVzID0gbmV3IFNldChcbiAgICAgIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKS5maWx0ZXIoXG4gICAgICAgIHJlcG9zaXRvcnkgPT4gcmVwb3NpdG9yeSAhPSBudWxsICYmIHJlcG9zaXRvcnkuZ2V0VHlwZSgpID09PSAnaGcnXG4gICAgICApXG4gICAgKTtcbiAgICAvLyBEaXNwb3NlIHJlbW92ZWQgcHJvamVjdHMgcmVwb3NpdG9yaWVzLCBpZiBhbnkuXG4gICAgZm9yIChjb25zdCBbcmVwb3NpdG9yeSwgcmVwb3NpdG9yeVN0YWNrXSBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzKSB7XG4gICAgICBpZiAocmVwb3NpdG9yaWVzLmhhcyhyZXBvc2l0b3J5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPT09IHJlcG9zaXRvcnlTdGFjaykge1xuICAgICAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmVwb3NpdG9yeVN0YWNrLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmdldChyZXBvc2l0b3J5KTtcbiAgICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgbmV3IHByb2plY3QgcmVwb3NpdG9yaWVzLCBpZiBhbnkuXG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5IG9mIHJlcG9zaXRvcmllcykge1xuICAgICAgaWYgKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuaGFzKHJlcG9zaXRvcnkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgICAgdGhpcy5fY3JlYXRlUmVwb3NpdG9yeVN0YWNrKGhnUmVwb3NpdG9yeSk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGFjdGl2ZSByZXBvc2l0b3J5IHN0YWNrLCBpZiBuZWVkZWQuXG4gICAgLy8gVGhpcyB3aWxsIG1ha2Ugc3VyZSB3ZSBoYXZlIGEgcmVwb3NpdG9yeSBzdGFjayBhY3RpdmUgd2hlbmV2ZXIgd2UgaGF2ZVxuICAgIC8vIGEgbWVyY3VyaWFsIHJlcG9zaXRvcnkgYWRkZWQgdG8gdGhlIHByb2plY3QuXG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsICYmIHRoaXMuX3JlcG9zaXRvcnlTdGFja3Muc2l6ZSA+IDApIHtcbiAgICAgIHRoaXMuX3NldEFjdGl2ZVJlcG9zaXRvcnlTdGFjayhcbiAgICAgICAgYXJyYXkuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVswXSxcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cygpO1xuICB9XG5cbiAgX2NyZWF0ZVJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQpOiBSZXBvc2l0b3J5U3RhY2sge1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IG5ldyBSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeSk7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICByZXBvc2l0b3J5U3RhY2sub25EaWRVcGRhdGVEaXJ0eUZpbGVDaGFuZ2VzKFxuICAgICAgICB0aGlzLl91cGRhdGVEaXJ0eUNoYW5nZWRTdGF0dXMuYmluZCh0aGlzKVxuICAgICAgKSxcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZFVwZGF0ZUNvbW1pdE1lcmdlRmlsZUNoYW5nZXMoXG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvbW1pdE1lcmdlRmlsZUNoYW5nZXMuYmluZCh0aGlzKVxuICAgICAgKSxcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZENoYW5nZVJldmlzaW9ucyhyZXZpc2lvbnNTdGF0ZSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMocmVwb3NpdG9yeVN0YWNrLCByZXZpc2lvbnNTdGF0ZSwgdHJ1ZSlcbiAgICAgICAgICAuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gICAgICB9KSxcbiAgICApO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3Muc2V0KHJlcG9zaXRvcnksIHJlcG9zaXRvcnlTdGFjayk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuc2V0KHJlcG9zaXRvcnksIHN1YnNjcmlwdGlvbnMpO1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmFjdGl2YXRlKCk7XG4gICAgfVxuICAgIHJldHVybiByZXBvc2l0b3J5U3RhY2s7XG4gIH1cblxuICBfdXBkYXRlRGlydHlDaGFuZ2VkU3RhdHVzKCk6IHZvaWQge1xuICAgIGNvbnN0IGRpcnR5RmlsZUNoYW5nZXMgPSBtYXAudW5pb24oLi4uYXJyYXlcbiAgICAgIC5mcm9tKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpXG4gICAgICAubWFwKHJlcG9zaXRvcnlTdGFjayA9PiByZXBvc2l0b3J5U3RhY2suZ2V0RGlydHlGaWxlQ2hhbmdlcygpKVxuICAgICk7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMoZGlydHlGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBfdXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcygpOiB2b2lkIHtcbiAgICBjb25zdCBjb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldENvbW1pdE1lcmdlRmlsZUNoYW5nZXMoKSlcbiAgICApO1xuICAgIGNvbnN0IGxhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldExhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCkpXG4gICAgKTtcbiAgICB0aGlzLl91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cyhcbiAgICAgIG51bGwsXG4gICAgICBjb21taXRNZXJnZUZpbGVDaGFuZ2VzLFxuICAgICAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMsXG4gICAgKTtcbiAgfVxuXG4gIF91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cyhcbiAgICBkaXJ0eUZpbGVDaGFuZ2VzPzogP01hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+LFxuICAgIGNvbW1pdE1lcmdlRmlsZUNoYW5nZXM/OiA/TWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4sXG4gICAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXM/OiA/TWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4sXG4gICk6IHZvaWQge1xuICAgIGlmIChkaXJ0eUZpbGVDaGFuZ2VzID09IG51bGwpIHtcbiAgICAgIGRpcnR5RmlsZUNoYW5nZXMgPSB0aGlzLl9zdGF0ZS5kaXJ0eUZpbGVDaGFuZ2VzO1xuICAgIH1cbiAgICBpZiAoY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyA9PSBudWxsKSB7XG4gICAgICBjb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gdGhpcy5fc3RhdGUuY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcztcbiAgICB9XG4gICAgaWYgKGxhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzID09IG51bGwpIHtcbiAgICAgIGxhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gdGhpcy5fc3RhdGUubGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXM7XG4gICAgfVxuICAgIGxldCBzZWxlY3RlZEZpbGVDaGFuZ2VzO1xuICAgIGxldCBzaG93Tm9uSGdSZXBvcztcbiAgICBsZXQgYWN0aXZlUmVwb3NpdG9yeVNlbGVjdG9yID0gKCkgPT4gdHJ1ZTtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHByb2plY3REaXJlY3RvcnkgPSB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2suZ2V0UmVwb3NpdG9yeSgpLmdldFByb2plY3REaXJlY3RvcnkoKTtcbiAgICAgIGFjdGl2ZVJlcG9zaXRvcnlTZWxlY3RvciA9IChmaWxlUGF0aDogTnVjbGlkZVVyaSkgPT5cbiAgICAgICAgcmVtb3RlVXJpLmNvbnRhaW5zKHByb2plY3REaXJlY3RvcnksIGZpbGVQYXRoKTtcbiAgICB9XG4gICAgc3dpdGNoICh0aGlzLl9zdGF0ZS52aWV3TW9kZSkge1xuICAgICAgY2FzZSBEaWZmTW9kZS5DT01NSVRfTU9ERTpcbiAgICAgICAgLy8gQ29tbWl0IG1vZGUgb25seSBzaG93cyB0aGUgY2hhbmdlcyBvZiB0aGUgYWN0aXZlIHJlcG9zaXRvcnkuXG4gICAgICAgIHNlbGVjdGVkRmlsZUNoYW5nZXMgPSBtYXAuZmlsdGVyKGRpcnR5RmlsZUNoYW5nZXMsIGFjdGl2ZVJlcG9zaXRvcnlTZWxlY3Rvcik7XG4gICAgICAgIHNob3dOb25IZ1JlcG9zID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmTW9kZS5QVUJMSVNIX01PREU6XG4gICAgICAgIC8vIFB1Ymxpc2ggbW9kZSBvbmx5IHNob3dzIHRoZSBjaGFuZ2VzIG9mIHRoZSBhY3RpdmUgcmVwb3NpdG9yeS5cbiAgICAgICAgc2VsZWN0ZWRGaWxlQ2hhbmdlcyA9IG1hcC5maWx0ZXIobGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMsIGFjdGl2ZVJlcG9zaXRvcnlTZWxlY3Rvcik7XG4gICAgICAgIHNob3dOb25IZ1JlcG9zID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmTW9kZS5CUk9XU0VfTU9ERTpcbiAgICAgICAgLy8gQnJvc3dlIG1vZGUgc2hvd3MgYWxsIGNoYW5nZXMgZnJvbSBhbGwgcmVwb3NpdG9yaWVzLlxuICAgICAgICBzZWxlY3RlZEZpbGVDaGFuZ2VzID0gY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcztcbiAgICAgICAgc2hvd05vbkhnUmVwb3MgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5yZWNvZ25pemVkIHZpZXcgbW9kZSEnKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBkaXJ0eUZpbGVDaGFuZ2VzLFxuICAgICAgY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyxcbiAgICAgIGxhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzLFxuICAgICAgc2VsZWN0ZWRGaWxlQ2hhbmdlcyxcbiAgICAgIHNob3dOb25IZ1JlcG9zLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMoXG4gICAgcmVwb3NpdG9yeVN0YWNrOiBSZXBvc2l0b3J5U3RhY2ssXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICAgIHJlbG9hZEZpbGVEaWZmU3RhdGU6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChyZXBvc2l0b3J5U3RhY2sgIT09IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cmFjaygnZGlmZi12aWV3LXVwZGF0ZS10aW1lbGluZS1yZXZpc2lvbnMnLCB7XG4gICAgICByZXZpc2lvbnNDb3VudDogYCR7cmV2aXNpb25zU3RhdGUucmV2aXNpb25zLmxlbmd0aH1gLFxuICAgIH0pO1xuICAgIHRoaXMuX29uVXBkYXRlUmV2aXNpb25zU3RhdGUocmV2aXNpb25zU3RhdGUpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBhY3RpdmUgZmlsZSwgaWYgY2hhbmdlZC5cbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGlmICghZmlsZVBhdGggfHwgIXJlbG9hZEZpbGVEaWZmU3RhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZUFjdGl2ZUZpbGVEaWZmKCk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQWN0aXZlRmlsZURpZmYoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIENhcHR1cmUgdGhlIHZpZXcgc3RhdGUgYmVmb3JlIHRoZSB1cGRhdGUgc3RhcnRzLlxuICAgIGNvbnN0IHt2aWV3TW9kZSwgY29tbWl0TW9kZX0gPSB0aGlzLl9zdGF0ZTtcbiAgICBjb25zdCB7XG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICB9ID0gYXdhaXQgdGhpcy5fZmV0Y2hGaWxlRGlmZihmaWxlUGF0aCk7XG4gICAgaWYgKFxuICAgICAgdGhpcy5fYWN0aXZlRmlsZVN0YXRlLmZpbGVQYXRoICE9PSBmaWxlUGF0aCB8fFxuICAgICAgdGhpcy5fc3RhdGUudmlld01vZGUgIT09IHZpZXdNb2RlIHx8XG4gICAgICB0aGlzLl9zdGF0ZS5jb21taXRNb2RlICE9PSBjb21taXRNb2RlXG4gICAgKSB7XG4gICAgICAvLyBUaGUgc3RhdGUgaGF2ZSBjaGFuZ2VkIHNpbmNlIHRoZSB1cGRhdGUgc3RhcnRlZCwgYW5kIHRoZXJlIG11c3QgYmUgYW5vdGhlclxuICAgICAgLy8gc2NoZWR1bGVkIHVwZGF0ZS4gSGVuY2UsIHdlIHJldHVybiBlYXJseSB0byBhbGxvdyBpdCB0byBnbyB0aHJvdWdoLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgICk7XG4gIH1cblxuICBfb25VcGRhdGVSZXZpc2lvbnNTdGF0ZShyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuICAgIHRoaXMuX2xvYWRNb2RlU3RhdGUodHJ1ZSk7XG4gIH1cblxuICBnZXRNZXNzYWdlcygpOiBSeC5PYnNlcnZhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXM7XG4gIH1cblxuICBzZXRQdWJsaXNoTWVzc2FnZShwdWJsaXNoTWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBwdWJsaXNoTWVzc2FnZSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldENvbW1pdE1lc3NhZ2UoY29tbWl0TWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBjb21taXRNZXNzYWdlLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0Vmlld01vZGUodmlld01vZGU6IERpZmZNb2RlVHlwZSk6IHZvaWQge1xuICAgIGlmICh2aWV3TW9kZSA9PT0gdGhpcy5fc3RhdGUudmlld01vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJhY2soJ2RpZmYtdmlldy1zd2l0Y2gtbW9kZScsIHtcbiAgICAgIHZpZXdNb2RlLFxuICAgIH0pO1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgdmlld01vZGUsXG4gICAgfSk7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMoKTtcbiAgICB0aGlzLl9sb2FkTW9kZVN0YXRlKGZhbHNlKTtcbiAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlQWN0aXZlRmlsZURpZmYoKTtcbiAgfVxuXG4gIF9sb2FkTW9kZVN0YXRlKHJlc2V0U3RhdGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAocmVzZXRTdGF0ZSkge1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TWVzc2FnZTogbnVsbCxcbiAgICAgICAgcHVibGlzaE1lc3NhZ2U6IG51bGwsXG4gICAgICB9KTtcbiAgICB9XG4gICAgc3dpdGNoICh0aGlzLl9zdGF0ZS52aWV3TW9kZSkge1xuICAgICAgY2FzZSBEaWZmTW9kZS5DT01NSVRfTU9ERTpcbiAgICAgICAgdGhpcy5fbG9hZENvbW1pdE1vZGVTdGF0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlmZk1vZGUuUFVCTElTSF9NT0RFOlxuICAgICAgICB0aGlzLl9sb2FkUHVibGlzaE1vZGVTdGF0ZSgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfZmluZEZpbGVQYXRoVG9EaWZmSW5EaXJlY3RvcnkoZGlyZWN0b3J5UGF0aDogTnVjbGlkZVVyaSk6ID9zdHJpbmcge1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX2dldFJlcG9zaXRvcnlTdGFja0ZvclBhdGgoZGlyZWN0b3J5UGF0aCk7XG4gICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gcmVwb3NpdG9yeVN0YWNrLmdldFJlcG9zaXRvcnkoKTtcbiAgICBjb25zdCBwcm9qZWN0RGlyZWN0b3J5ID0gaGdSZXBvc2l0b3J5LmdldFByb2plY3REaXJlY3RvcnkoKTtcblxuICAgIGZ1bmN0aW9uIGdldE1hdGNoaW5nRmlsZUNoYW5nZShcbiAgICAgIGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4sXG4gICAgICBwYXJlbnRQYXRoOiBOdWNsaWRlVXJpLFxuICAgICk6ID9OdWNsaWRlVXJpIHtcbiAgICAgIHJldHVybiBmaWxlUGF0aHMuZmlsdGVyKGZpbGVQYXRoID0+IHJlbW90ZVVyaS5jb250YWlucyhwYXJlbnRQYXRoLCBmaWxlUGF0aCkpWzBdO1xuICAgIH1cbiAgICBjb25zdCBkaXJ0eUZpbGVQYXRocyA9IGFycmF5LmZyb20ocmVwb3NpdG9yeVN0YWNrLmdldERpcnR5RmlsZUNoYW5nZXMoKS5rZXlzKCkpO1xuICAgIC8vIFRyeSB0byBtYXRjaCBkaXJ0eSBmaWxlIGNoYW5nZXMgaW4gdGhlIHNlbGVjdGVkIGRpcmVjdG9yeSxcbiAgICAvLyBUaGVuIGxvb2t1cCBmb3IgY2hhbmdlcyBpbiB0aGUgcHJvamVjdCBkaXJlY3RvcnkgaWYgdGhlcmUgaXMgbm8gYWN0aXZlIHJlcG9zaXRvcnkuXG4gICAgY29uc3QgbWF0Y2hlZEZpbGVQYXRocyA9IFtcbiAgICAgIGdldE1hdGNoaW5nRmlsZUNoYW5nZShkaXJ0eUZpbGVQYXRocywgZGlyZWN0b3J5UGF0aCksXG4gICAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPT0gbnVsbFxuICAgICAgICA/IGdldE1hdGNoaW5nRmlsZUNoYW5nZShkaXJ0eUZpbGVQYXRocywgcHJvamVjdERpcmVjdG9yeSlcbiAgICAgICAgOiBudWxsLFxuICAgIF07XG4gICAgcmV0dXJuIG1hdGNoZWRGaWxlUGF0aHNbMF0gfHwgbWF0Y2hlZEZpbGVQYXRoc1sxXTtcbiAgfVxuXG4gIGRpZmZFbnRpdHkoZW50aXR5T3B0aW9uOiBEaWZmRW50aXR5T3B0aW9ucyk6IHZvaWQge1xuICAgIGxldCBkaWZmUGF0aCA9IG51bGw7XG4gICAgaWYgKGVudGl0eU9wdGlvbi5maWxlICE9IG51bGwpIHtcbiAgICAgIGRpZmZQYXRoID0gZW50aXR5T3B0aW9uLmZpbGU7XG4gICAgfSBlbHNlIGlmIChlbnRpdHlPcHRpb24uZGlyZWN0b3J5ICE9IG51bGwpIHtcbiAgICAgIGRpZmZQYXRoID0gdGhpcy5fZmluZEZpbGVQYXRoVG9EaWZmSW5EaXJlY3RvcnkoZW50aXR5T3B0aW9uLmRpcmVjdG9yeSk7XG4gICAgfVxuXG4gICAgaWYgKGRpZmZQYXRoID09IG51bGwpIHtcbiAgICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChlbnRpdHlPcHRpb24uZmlsZSB8fCBlbnRpdHlPcHRpb24uZGlyZWN0b3J5IHx8ICcnKTtcbiAgICAgIGlmIChcbiAgICAgICAgcmVwb3NpdG9yeSAhPSBudWxsICYmXG4gICAgICAgIHJlcG9zaXRvcnkuZ2V0VHlwZSgpID09PSAnaGcnICYmXG4gICAgICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuaGFzKChyZXBvc2l0b3J5OiBhbnkpKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuZ2V0KChyZXBvc2l0b3J5OiBhbnkpKTtcbiAgICAgICAgaW52YXJpYW50KHJlcG9zaXRvcnlTdGFjayk7XG4gICAgICAgIHRoaXMuX3NldEFjdGl2ZVJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5U3RhY2spO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0TG9nZ2VyKCkud2FybignTm9uIGRpZmZhYmxlIGVudGl0eTonLCBlbnRpdHlPcHRpb24pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gZGlmZlBhdGg7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGNvbnN0IGFjdGl2ZVN1YnNjcmlwdGlvbnMgPSB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAvLyBUT0RPKG1vc3QpOiBTaG93IHByb2dyZXNzIGluZGljYXRvcjogdDg5OTE2NzZcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHtmaWxlfSA9IGJ1ZmZlcjtcbiAgICBpZiAoZmlsZSAhPSBudWxsKSB7XG4gICAgICBhY3RpdmVTdWJzY3JpcHRpb25zLmFkZChmaWxlLm9uRGlkQ2hhbmdlKGRlYm91bmNlKFxuICAgICAgICAoKSA9PiB0aGlzLl9vbkRpZEZpbGVDaGFuZ2UoZmlsZVBhdGgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpLFxuICAgICAgICBGSUxFX0NIQU5HRV9ERUJPVU5DRV9NUyxcbiAgICAgICAgZmFsc2UsXG4gICAgICApKSk7XG4gICAgfVxuICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMuYWRkKGJ1ZmZlci5vbkRpZENoYW5nZU1vZGlmaWVkKFxuICAgICAgdGhpcy5lbWl0QWN0aXZlQnVmZmVyQ2hhbmdlTW9kaWZpZWQuYmluZCh0aGlzKSxcbiAgICApKTtcbiAgICAvLyBNb2RpZmllZCBldmVudHMgY291bGQgYmUgbGF0ZSB0aGF0IGl0IGRvZXNuJ3QgY2FwdHVyZSB0aGUgbGF0ZXN0IGVkaXRzLyBzdGF0ZSBjaGFuZ2VzLlxuICAgIC8vIEhlbmNlLCBpdCdzIHNhZmUgdG8gcmUtZW1pdCBjaGFuZ2VzIHdoZW4gc3RhYmxlIGZyb20gY2hhbmdlcy5cbiAgICBhY3RpdmVTdWJzY3JpcHRpb25zLmFkZChidWZmZXIub25EaWRTdG9wQ2hhbmdpbmcoXG4gICAgICB0aGlzLmVtaXRBY3RpdmVCdWZmZXJDaGFuZ2VNb2RpZmllZC5iaW5kKHRoaXMpLFxuICAgICkpO1xuICAgIC8vIFVwZGF0ZSBgc2F2ZWRDb250ZW50c2Agb24gYnVmZmVyIHNhdmUgcmVxdWVzdHMuXG4gICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoYnVmZmVyLm9uV2lsbFNhdmUoXG4gICAgICAoKSA9PiB0aGlzLl9vbldpbGxTYXZlQWN0aXZlQnVmZmVyKGJ1ZmZlciksXG4gICAgKSk7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1vcGVuLWZpbGUnLCB7ZmlsZVBhdGh9KTtcbiAgICB0aGlzLl91cGRhdGVBY3RpdmVEaWZmU3RhdGUoZmlsZVBhdGgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmlsZS1jaGFuZ2UtdXBkYXRlJylcbiAgYXN5bmMgX29uRGlkRmlsZUNoYW5nZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVGaWxlU3RhdGUuZmlsZVBhdGggIT09IGZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpbGVzeXN0ZW1Db250ZW50cyA9IGF3YWl0IGdldEZpbGVTeXN0ZW1Db250ZW50cyhmaWxlUGF0aCk7XG4gICAgY29uc3Qge1xuICAgICAgb2xkQ29udGVudHM6IGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgY29tcGFyZVJldmlzaW9uSW5mbzogcmV2aXNpb25JbmZvLFxuICAgIH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaW52YXJpYW50KHJldmlzaW9uSW5mbywgJ0RpZmYgVmlldzogUmV2aXNpb24gaW5mbyBtdXN0IGJlIGRlZmluZWQgdG8gdXBkYXRlIGNoYW5nZWQgc3RhdGUnKTtcbiAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgICk7XG4gIH1cblxuICBlbWl0QWN0aXZlQnVmZmVyQ2hhbmdlTW9kaWZpZWQoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5UKTtcbiAgfVxuXG4gIG9uRGlkQWN0aXZlQnVmZmVyQ2hhbmdlTW9kaWZpZWQoXG4gICAgY2FsbGJhY2s6ICgpID0+IG1peGVkLFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQUNUSVZFX0JVRkZFUl9DSEFOR0VfTU9ESUZJRURfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGlzQWN0aXZlQnVmZmVyTW9kaWZpZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIHJldHVybiBidWZmZXIuaXNNb2RpZmllZCgpO1xuICB9XG5cbiAgX3VwZGF0ZURpZmZTdGF0ZUlmQ2hhbmdlZChcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb21taXR0ZWRDb250ZW50czogc3RyaW5nLFxuICAgIGZpbGVzeXN0ZW1Db250ZW50czogc3RyaW5nLFxuICAgIHJldmlzaW9uSW5mbzogUmV2aXNpb25JbmZvLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7XG4gICAgICBmaWxlUGF0aDogYWN0aXZlRmlsZVBhdGgsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgfSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBpZiAoZmlsZVBhdGggIT09IGFjdGl2ZUZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIGNvbnN0IHVwZGF0ZWREaWZmU3RhdGUgPSB7XG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICB9O1xuICAgIGludmFyaWFudChzYXZlZENvbnRlbnRzLCAnc2F2ZWRDb250ZW50cyBpcyBub3QgZGVmaW5lZCB3aGlsZSB1cGRhdGluZyBkaWZmIHN0YXRlIScpO1xuICAgIGlmIChzYXZlZENvbnRlbnRzID09PSBuZXdDb250ZW50cyB8fCBmaWxlc3lzdGVtQ29udGVudHMgPT09IG5ld0NvbnRlbnRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgdXBkYXRlZERpZmZTdGF0ZSxcbiAgICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgICk7XG4gICAgfVxuICAgIC8vIFRoZSB1c2VyIGhhdmUgZWRpdGVkIHNpbmNlIHRoZSBsYXN0IHVwZGF0ZS5cbiAgICBpZiAoZmlsZXN5c3RlbUNvbnRlbnRzID09PSBzYXZlZENvbnRlbnRzKSB7XG4gICAgICAvLyBUaGUgY2hhbmdlcyBoYXZlbid0IHRvdWNoZWQgdGhlIGZpbGVzeXN0ZW0sIGtlZXAgdXNlciBlZGl0cy5cbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICB7Li4udXBkYXRlZERpZmZTdGF0ZSwgZmlsZXN5c3RlbUNvbnRlbnRzOiBuZXdDb250ZW50c30sXG4gICAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgY29tbWl0dGVkIGFuZCBmaWxlc3lzdGVtIHN0YXRlIGhhdmUgY2hhbmdlZCwgbm90aWZ5IG9mIG92ZXJyaWRlLlxuICAgICAgbm90aWZ5RmlsZXN5c3RlbU92ZXJyaWRlVXNlckVkaXRzKGZpbGVQYXRoKTtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICB1cGRhdGVkRGlmZlN0YXRlLFxuICAgICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHNldE5ld0NvbnRlbnRzKG5ld0NvbnRlbnRzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoey4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSwgbmV3Q29udGVudHN9KTtcbiAgfVxuXG4gIHNldFJldmlzaW9uKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiB2b2lkIHtcbiAgICB0cmFjaygnZGlmZi12aWV3LXNldC1yZXZpc2lvbicpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaztcbiAgICBpbnZhcmlhbnQocmVwb3NpdG9yeVN0YWNrLCAnVGhlcmUgbXVzdCBiZSBhbiBhY3RpdmUgcmVwb3NpdG9yeSBzdGFjayEnKTtcbiAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUgPSB7Li4udGhpcy5fYWN0aXZlRmlsZVN0YXRlLCBjb21wYXJlUmV2aXNpb25JbmZvOiByZXZpc2lvbn07XG4gICAgcmVwb3NpdG9yeVN0YWNrLnNldFJldmlzaW9uKHJldmlzaW9uKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIGdldEFjdGl2ZUZpbGVTdGF0ZSgpOiBGaWxlQ2hhbmdlU3RhdGUge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQWN0aXZlRGlmZlN0YXRlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaWxlRGlmZlN0YXRlID0gYXdhaXQgdGhpcy5fZmV0Y2hGaWxlRGlmZihmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBmaWxlRGlmZlN0YXRlLFxuICAgICAgZmlsZURpZmZTdGF0ZS5maWxlc3lzdGVtQ29udGVudHMsXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVEaWZmU3RhdGUoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgZmlsZURpZmZTdGF0ZTogRmlsZURpZmZTdGF0ZSxcbiAgICBzYXZlZENvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzOiBvbGRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50czogbmV3Q29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfSA9IGZpbGVEaWZmU3RhdGU7XG4gICAgY29uc3Qge2hhc2gsIGJvb2ttYXJrc30gPSByZXZpc2lvbkluZm87XG4gICAgY29uc3QgbmV3RmlsZVN0YXRlID0ge1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRDb250ZW50cyxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgIGNvbXBhcmVSZXZpc2lvbkluZm86IHJldmlzaW9uSW5mbyxcbiAgICAgIGZyb21SZXZpc2lvblRpdGxlOiBgJHtoYXNofWAgKyAoYm9va21hcmtzLmxlbmd0aCA9PT0gMCA/ICcnIDogYCAtICgke2Jvb2ttYXJrcy5qb2luKCcsICcpfSlgKSxcbiAgICAgIHRvUmV2aXNpb25UaXRsZTogJ0ZpbGVzeXN0ZW0gLyBFZGl0b3InLFxuICAgIH07XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKG5ld0ZpbGVTdGF0ZSk7XG4gICAgLy8gVE9ETyhtb3N0KTogRml4OiB0aGlzIGFzc3VtZXMgdGhhdCB0aGUgZWRpdG9yIGNvbnRlbnRzIGFyZW4ndCBjaGFuZ2VkIHdoaWxlXG4gICAgLy8gZmV0Y2hpbmcgdGhlIGNvbW1lbnRzLCB0aGF0J3Mgb2theSBub3cgYmVjYXVzZSB3ZSBkb24ndCBmZXRjaCB0aGVtLlxuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZUlubGluZUNvbXBvbmVudHMoKTtcbiAgfVxuXG4gIF9zZXRBY3RpdmVGaWxlU3RhdGUoc3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQsIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5oZy1zdGF0ZS11cGRhdGUnKVxuICBhc3luYyBfZmV0Y2hGaWxlRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8RmlsZURpZmZTdGF0ZT4ge1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX2dldFJlcG9zaXRvcnlTdGFja0ZvclBhdGgoZmlsZVBhdGgpO1xuICAgIGNvbnN0IFtoZ0RpZmZdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmZldGNoSGdEaWZmKGZpbGVQYXRoLCB2aWV3TW9kZVRvRGlmZk9wdGlvbih0aGlzLl9zdGF0ZS52aWV3TW9kZSkpLFxuICAgICAgdGhpcy5fc2V0QWN0aXZlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnlTdGFjayksXG4gICAgXSk7XG4gICAgLy8gSW50ZW50aW9uYWxseSBmZXRjaCB0aGUgZmlsZXN5c3RlbSBjb250ZW50cyBhZnRlciBnZXR0aW5nIHRoZSBjb21taXR0ZWQgY29udGVudHNcbiAgICAvLyB0byBtYWtlIHN1cmUgd2UgaGF2ZSB0aGUgbGF0ZXN0IGZpbGVzeXN0ZW0gdmVyc2lvbi5cbiAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBsb2FkQnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uaGdEaWZmLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzOiBidWZmZXIuZ2V0VGV4dCgpLFxuICAgIH07XG4gIH1cblxuICBfZ2V0UmVwb3NpdG9yeVN0YWNrRm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFJlcG9zaXRvcnlTdGFjayB7XG4gICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gaGdSZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aCk7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5nZXQoaGdSZXBvc2l0b3J5KTtcbiAgICBpbnZhcmlhbnQocmVwb3NpdG9yeVN0YWNrLCAnVGhlcmUgbXVzdCBiZSBhbiByZXBvc2l0b3J5IHN0YWNrIGZvciBhIGdpdmVuIHJlcG9zaXRvcnkhJyk7XG4gICAgcmV0dXJuIHJlcG9zaXRvcnlTdGFjaztcbiAgfVxuXG4gIGFzeW5jIF9zZXRBY3RpdmVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeVN0YWNrOiBSZXBvc2l0b3J5U3RhY2spOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09PSByZXBvc2l0b3J5U3RhY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID0gcmVwb3NpdG9yeVN0YWNrO1xuICAgIGlmICghdGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCByZXBvc2l0b3J5U3RhY2suZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgdGhpcy5fdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhyZXBvc2l0b3J5U3RhY2ssIHJldmlzaW9uc1N0YXRlLCBmYWxzZSk7XG4gIH1cblxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnNhdmUtZmlsZScpXG4gIHNhdmVBY3RpdmVGaWxlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1zYXZlLWZpbGUnLCB7ZmlsZVBhdGh9KTtcbiAgICByZXR1cm4gdGhpcy5fc2F2ZUZpbGUoZmlsZVBhdGgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcucHVibGlzaC1kaWZmJylcbiAgYXN5bmMgcHVibGlzaERpZmYocHVibGlzaE1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgcHVibGlzaE1lc3NhZ2UsXG4gICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLkFXQUlUSU5HX1BVQkxJU0gsXG4gICAgfSk7XG4gICAgY29uc3Qge3B1Ymxpc2hNb2RlfSA9IHRoaXMuX3N0YXRlO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctcHVibGlzaCcsIHtcbiAgICAgIHB1Ymxpc2hNb2RlLFxuICAgIH0pO1xuICAgIGNvbnN0IGNsZWFuUmVzdWx0ID0gYXdhaXQgdGhpcy5fcHJvbXB0VG9DbGVhbkRpcnR5Q2hhbmdlcyhwdWJsaXNoTWVzc2FnZSk7XG4gICAgaWYgKGNsZWFuUmVzdWx0ID09IG51bGwpIHtcbiAgICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICAgIHB1Ymxpc2hNb2RlU3RhdGU6IFB1Ymxpc2hNb2RlU3RhdGUuUkVBRFksXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge2FtZW5kZWQsIGFsbG93VW50cmFja2VkfSA9IGNsZWFuUmVzdWx0O1xuICAgIHRyeSB7XG4gICAgICBzd2l0Y2ggKHB1Ymxpc2hNb2RlKSB7XG4gICAgICAgIGNhc2UgUHVibGlzaE1vZGUuQ1JFQVRFOlxuICAgICAgICAgIC8vIENyZWF0ZSB1c2VzIGB2ZXJiYXRpbWAgYW5kIGBuYCBhbnN3ZXIgYnVmZmVyXG4gICAgICAgICAgLy8gYW5kIHRoYXQgaW1wbGllcyB0aGF0IHVudHJhY2tlZCBmaWxlcyB3aWxsIGJlIGlnbm9yZWQuXG4gICAgICAgICAgYXdhaXQgdGhpcy5fY3JlYXRlUGhhYnJpY2F0b3JSZXZpc2lvbihwdWJsaXNoTWVzc2FnZSwgYW1lbmRlZCk7XG4gICAgICAgICAgaW52YXJpYW50KHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaywgJ05vIGFjdGl2ZSByZXBvc2l0b3J5IHN0YWNrJyk7XG4gICAgICAgICAgLy8gSW52YWxpZGF0ZSB0aGUgY3VycmVudCByZXZpc2lvbnMgc3RhdGUgYmVjYXVzZSB0aGUgY3VycmVudCBjb21taXQgaW5mbyBoYXMgY2hhbmdlZC5cbiAgICAgICAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2suZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUHVibGlzaE1vZGUuVVBEQVRFOlxuICAgICAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZVBoYWJyaWNhdG9yUmV2aXNpb24ocHVibGlzaE1lc3NhZ2UsIGFsbG93VW50cmFja2VkKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcHVibGlzaCBtb2RlICcke3B1Ymxpc2hNb2RlfSdgKTtcbiAgICAgIH1cbiAgICAgIC8vIFBvcHVsYXRlIFB1Ymxpc2ggVUkgd2l0aCB0aGUgbW9zdCByZWNlbnQgZGF0YSBhZnRlciBhIHN1Y2Nlc3NmdWwgcHVzaC5cbiAgICAgIHRoaXMuX2xvYWRNb2RlU3RhdGUodHJ1ZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IsIHRydWUgLypwZXJzaXN0IHRoZSBlcnJvciAodXNlciBkaXNtaXNzYWJsZSkqLyk7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLlJFQURZLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3Byb21wdFRvQ2xlYW5EaXJ0eUNoYW5nZXMoXG4gICAgY29tbWl0TWVzc2FnZTogc3RyaW5nLFxuICApOiBQcm9taXNlPD97YWxsb3dVbnRyYWNrZWQ6IGJvb2xlYW47IGFtZW5kZWQ6IGJvb2xlYW47fT4ge1xuICAgIGNvbnN0IGFjdGl2ZVN0YWNrID0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrO1xuICAgIGludmFyaWFudChhY3RpdmVTdGFjayAhPSBudWxsLCAnTm8gYWN0aXZlIHJlcG9zaXRvcnkgc3RhY2sgd2hlbiBjbGVhbmluZyBkaXJ0eSBjaGFuZ2VzJyk7XG4gICAgY29uc3QgZGlydHlGaWxlQ2hhbmdlcyA9IGFjdGl2ZVN0YWNrLmdldERpcnR5RmlsZUNoYW5nZXMoKTtcbiAgICBsZXQgc2hvdWxkQW1lbmQgPSBmYWxzZTtcbiAgICBsZXQgYW1lbmRlZCA9IGZhbHNlO1xuICAgIGxldCBhbGxvd1VudHJhY2tlZCA9IGZhbHNlO1xuICAgIGlmIChkaXJ0eUZpbGVDaGFuZ2VzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFtZW5kZWQsXG4gICAgICAgIGFsbG93VW50cmFja2VkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgdW50cmFja2VkQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4gPSBuZXcgTWFwKFxuICAgICAgYXJyYXkuZnJvbShkaXJ0eUZpbGVDaGFuZ2VzLmVudHJpZXMoKSlcbiAgICAgICAgLmZpbHRlcihmaWxlQ2hhbmdlID0+IGZpbGVDaGFuZ2VbMV0gPT09IEZpbGVDaGFuZ2VTdGF0dXMuVU5UUkFDS0VEKVxuICAgICk7XG4gICAgaWYgKHVudHJhY2tlZENoYW5nZXMuc2l6ZSA+IDApIHtcbiAgICAgIGNvbnN0IHVudHJhY2tlZENob2ljZSA9IGF0b20uY29uZmlybSh7XG4gICAgICAgIG1lc3NhZ2U6ICdZb3UgaGF2ZSB1bnRyYWNrZWQgZmlsZXMgaW4geW91ciB3b3JraW5nIGNvcHk6JyxcbiAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBnZXRGaWxlU3RhdHVzTGlzdE1lc3NhZ2UodW50cmFja2VkQ2hhbmdlcyksXG4gICAgICAgIGJ1dHRvbnM6IFsnQ2FuY2VsJywgJ0FkZCcsICdBbGxvdyBVbnRyYWNrZWQnXSxcbiAgICAgIH0pO1xuICAgICAgZ2V0TG9nZ2VyKCkuaW5mbygnVW50cmFja2VkIGNoYW5nZXMgY2hvaWNlOicsIHVudHJhY2tlZENob2ljZSk7XG4gICAgICBpZiAodW50cmFja2VkQ2hvaWNlID09PSAwKSAvKkNhbmNlbCovIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2UgaWYgKHVudHJhY2tlZENob2ljZSA9PT0gMSkgLypBZGQqLyB7XG4gICAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLmFkZChhcnJheS5mcm9tKHVudHJhY2tlZENoYW5nZXMua2V5cygpKSk7XG4gICAgICAgIHNob3VsZEFtZW5kID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodW50cmFja2VkQ2hvaWNlID09PSAyKSAvKkFsbG93IFVudHJhY2tlZCovIHtcbiAgICAgICAgYWxsb3dVbnRyYWNrZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXZlcnRhYmxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4gPSBuZXcgTWFwKFxuICAgICAgYXJyYXkuZnJvbShkaXJ0eUZpbGVDaGFuZ2VzLmVudHJpZXMoKSlcbiAgICAgICAgLmZpbHRlcihmaWxlQ2hhbmdlID0+IGZpbGVDaGFuZ2VbMV0gIT09IEZpbGVDaGFuZ2VTdGF0dXMuVU5UUkFDS0VEKVxuICAgICk7XG4gICAgaWYgKHJldmVydGFibGVDaGFuZ2VzLnNpemUgPiAwKSB7XG4gICAgICBjb25zdCBjbGVhbkNob2ljZSA9IGF0b20uY29uZmlybSh7XG4gICAgICAgIG1lc3NhZ2U6ICdZb3UgaGF2ZSB1bmNvbW1pdHRlZCBjaGFuZ2VzIGluIHlvdXIgd29ya2luZyBjb3B5OicsXG4gICAgICAgIGRldGFpbGVkTWVzc2FnZTogZ2V0RmlsZVN0YXR1c0xpc3RNZXNzYWdlKHJldmVydGFibGVDaGFuZ2VzKSxcbiAgICAgICAgYnV0dG9uczogWydDYW5jZWwnLCAnUmV2ZXJ0JywgJ0FtZW5kJ10sXG4gICAgICB9KTtcbiAgICAgIGdldExvZ2dlcigpLmluZm8oJ0RpcnR5IGNoYW5nZXMgY2xlYW4gY2hvaWNlOicsIGNsZWFuQ2hvaWNlKTtcbiAgICAgIGlmIChjbGVhbkNob2ljZSA9PT0gMCkgLypDYW5jZWwqLyB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIGlmIChjbGVhbkNob2ljZSA9PT0gMSkgLypSZXZlcnQqLyB7XG4gICAgICAgIGNvbnN0IGNhblJldmVydEZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4gPSBhcnJheVxuICAgICAgICAgIC5mcm9tKGRpcnR5RmlsZUNoYW5nZXMuZW50cmllcygpKVxuICAgICAgICAgIC5maWx0ZXIoZmlsZUNoYW5nZSA9PiBmaWxlQ2hhbmdlWzFdICE9PSBGaWxlQ2hhbmdlU3RhdHVzLlVOVFJBQ0tFRClcbiAgICAgICAgICAubWFwKGZpbGVDaGFuZ2UgPT4gZmlsZUNoYW5nZVswXSk7XG4gICAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLnJldmVydChjYW5SZXZlcnRGaWxlUGF0aHMpO1xuICAgICAgfSBlbHNlIGlmIChjbGVhbkNob2ljZSA9PT0gMikgLypBbWVuZCovIHtcbiAgICAgICAgc2hvdWxkQW1lbmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2hvdWxkQW1lbmQpIHtcbiAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLmFtZW5kKGNvbW1pdE1lc3NhZ2UpO1xuICAgICAgYW1lbmRlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBhbWVuZGVkLFxuICAgICAgYWxsb3dVbnRyYWNrZWQsXG4gICAgfTtcbiAgfVxuXG4gIF9nZXRBcmNhbmlzdEZpbGVQYXRoKCk6IHN0cmluZyB7XG4gICAgbGV0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaWYgKGZpbGVQYXRoID09PSAnJyAmJiB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgIT0gbnVsbCkge1xuICAgICAgZmlsZVBhdGggPSB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2suZ2V0UmVwb3NpdG9yeSgpLmdldFByb2plY3REaXJlY3RvcnkoKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVQYXRoO1xuICB9XG5cbiAgYXN5bmMgX2NyZWF0ZVBoYWJyaWNhdG9yUmV2aXNpb24oXG4gICAgcHVibGlzaE1lc3NhZ2U6IHN0cmluZyxcbiAgICBhbWVuZGVkOiBib29sZWFuLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMuX2dldEFyY2FuaXN0RmlsZVBhdGgoKTtcbiAgICBjb25zdCBsYXN0Q29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2xvYWRBY3RpdmVSZXBvc2l0b3J5TGF0ZXN0Q29tbWl0TWVzc2FnZSgpO1xuICAgIGlmICghYW1lbmRlZCAmJiBwdWJsaXNoTWVzc2FnZSAhPT0gbGFzdENvbW1pdE1lc3NhZ2UpIHtcbiAgICAgIGdldExvZ2dlcigpLmluZm8oJ0FtZW5kaW5nIGNvbW1pdCB3aXRoIHRoZSB1cGRhdGVkIG1lc3NhZ2UnKTtcbiAgICAgIGludmFyaWFudCh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2spO1xuICAgICAgYXdhaXQgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmFtZW5kKHB1Ymxpc2hNZXNzYWdlKTtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb21taXQgYW1lbmRlZCB3aXRoIHRoZSB1cGRhdGVkIG1lc3NhZ2UnKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPKHJvc3NhbGxlbik6IE1ha2UgbnVjbGlkZS1jb25zb2xlIGluZm9ybSB0aGUgdXNlciB0aGVyZSBpcyBuZXcgb3V0cHV0IHJhdGhlciB0aGFuIGZvcmNlXG4gICAgLy8gaXQgb3BlbiBsaWtlIHRoZSBmb2xsb3dpbmcuXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1jb25zb2xlOnNob3cnKTtcblxuICAgIHRoaXMuX21lc3NhZ2VzLm9uTmV4dCh7bGV2ZWw6ICdsb2cnLCB0ZXh0OiAnQ3JlYXRpbmcgbmV3IHJldmlzaW9uLi4uJ30pO1xuICAgIGF3YWl0IGFyY2FuaXN0LmNyZWF0ZVBoYWJyaWNhdG9yUmV2aXNpb24oZmlsZVBhdGgpXG4gICAgICAudGFwKFxuICAgICAgICAobWVzc2FnZToge3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30pID0+IHtcbiAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5vbk5leHQoe1xuICAgICAgICAgICAgbGV2ZWw6IChtZXNzYWdlLnN0ZGVyciA9PSBudWxsKSA/ICdsb2cnIDogJ2Vycm9yJyxcbiAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2Uuc3Rkb3V0IHx8IG1lc3NhZ2Uuc3RkZXJyLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7fSxcbiAgICAgICAgKCkgPT4geyBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnUmV2aXNpb24gY3JlYXRlZCcpOyB9LFxuICAgICAgKVxuICAgICAgLnRvUHJvbWlzZSgpO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZVBoYWJyaWNhdG9yUmV2aXNpb24oXG4gICAgcHVibGlzaE1lc3NhZ2U6IHN0cmluZyxcbiAgICBhbGxvd1VudHJhY2tlZDogYm9vbGVhbixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0aGlzLl9nZXRBcmNhbmlzdEZpbGVQYXRoKCk7XG4gICAgY29uc3Qge3BoYWJyaWNhdG9yUmV2aXNpb259ID0gYXdhaXQgdGhpcy5fZ2V0QWN0aXZlSGVhZFJldmlzaW9uRGV0YWlscygpO1xuICAgIGludmFyaWFudChwaGFicmljYXRvclJldmlzaW9uICE9IG51bGwsICdBIHBoYWJyaWNhdG9yIHJldmlzaW9uIG11c3QgZXhpc3QgdG8gdXBkYXRlIScpO1xuICAgIGNvbnN0IHVwZGF0ZVRlbXBsYXRlID0gZ2V0UmV2aXNpb25VcGRhdGVNZXNzYWdlKHBoYWJyaWNhdG9yUmV2aXNpb24pLnRyaW0oKTtcbiAgICBjb25zdCB1c2VyVXBkYXRlTWVzc2FnZSA9IHB1Ymxpc2hNZXNzYWdlLnJlcGxhY2UodXBkYXRlVGVtcGxhdGUsICcnKS50cmltKCk7XG4gICAgaWYgKHVzZXJVcGRhdGVNZXNzYWdlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXBkYXRlIHJldmlzaW9uIHdpdGggZW1wdHkgbWVzc2FnZScpO1xuICAgIH1cblxuICAgIC8vIFRPRE8ocm9zc2FsbGVuKTogTWFrZSBudWNsaWRlLWNvbnNvbGUgaW5mb3JtIHRoZSB1c2VyIHRoZXJlIGlzIG5ldyBvdXRwdXQgcmF0aGVyIHRoYW4gZm9yY2VcbiAgICAvLyBpdCBvcGVuIGxpa2UgdGhlIGZvbGxvd2luZy5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdudWNsaWRlLWNvbnNvbGU6c2hvdycpO1xuXG4gICAgdGhpcy5fbWVzc2FnZXMub25OZXh0KHtcbiAgICAgIGxldmVsOiAnbG9nJyxcbiAgICAgIHRleHQ6IGBVcGRhdGluZyByZXZpc2lvbiBcXGAke3BoYWJyaWNhdG9yUmV2aXNpb24uaWR9XFxgLi4uYCxcbiAgICB9KTtcbiAgICBhd2FpdCBhcmNhbmlzdC51cGRhdGVQaGFicmljYXRvclJldmlzaW9uKGZpbGVQYXRoLCB1c2VyVXBkYXRlTWVzc2FnZSwgYWxsb3dVbnRyYWNrZWQpXG4gICAgICAudGFwKFxuICAgICAgICAobWVzc2FnZToge3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30pID0+IHtcbiAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5vbk5leHQoe1xuICAgICAgICAgICAgbGV2ZWw6IChtZXNzYWdlLnN0ZGVyciA9PSBudWxsKSA/ICdsb2cnIDogJ2Vycm9yJyxcbiAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2Uuc3Rkb3V0IHx8IG1lc3NhZ2Uuc3RkZXJyLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7fSxcbiAgICAgICAgKCkgPT4geyBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhgUmV2aXNpb24gXFxgJHtwaGFicmljYXRvclJldmlzaW9uLmlkfVxcYCB1cGRhdGVkYCk7IH1cbiAgICAgIClcbiAgICAgIC50b1Byb21pc2UoKTtcbiAgfVxuXG4gIF9vbldpbGxTYXZlQWN0aXZlQnVmZmVyKGJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSxcbiAgICAgIHNhdmVkQ29udGVudHM6IGJ1ZmZlci5nZXRUZXh0KCksXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfc2F2ZUZpbGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIGlmIChidWZmZXIgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBmaWxlIGJ1ZmZlciB0byBzYXZlOiBcXGAke2ZpbGVQYXRofVxcYGApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYnVmZmVyLnNhdmUoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHNhdmUgZmlsZSBidWZmZXI6IFxcYCR7ZmlsZVBhdGh9XFxgIC0gJHtlcnIudG9TdHJpbmcoKX1gKTtcbiAgICB9XG4gIH1cblxuICBvbkRpZFVwZGF0ZVN0YXRlKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihESURfVVBEQVRFX1NUQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvblJldmlzaW9uc1VwZGF0ZShjYWxsYmFjazogKHN0YXRlOiA/UmV2aXNpb25zU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25BY3RpdmVGaWxlVXBkYXRlcyhjYWxsYmFjazogKHN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlSW5saW5lQ29tcG9uZW50cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaW5saW5lQ29tcG9uZW50cyA9IGF3YWl0IHRoaXMuX2ZldGNoSW5saW5lQ29tcG9uZW50cyhmaWxlUGF0aCk7XG4gICAgaWYgKGZpbGVQYXRoICE9PSB0aGlzLl9hY3RpdmVGaWxlU3RhdGUuZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHsuLi50aGlzLl9hY3RpdmVGaWxlU3RhdGUsIGlubGluZUNvbXBvbmVudHN9KTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZldGNoLWNvbW1lbnRzJylcbiAgYXN5bmMgX2ZldGNoSW5saW5lQ29tcG9uZW50cyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8QXJyYXk8VUlFbGVtZW50Pj4ge1xuICAgIC8vIFRPRE8obW9zdCk6IEZpeCBVSSByZW5kZXJpbmcgYW5kIHJlLWludHJvZHVjZTogdDgxNzQzMzJcbiAgICAvLyBwcm92aWRlci5jb21wb3NlVWlFbGVtZW50cyhmaWxlUGF0aClcbiAgICBjb25zdCB1aUVsZW1lbnRQcm9taXNlcyA9IHRoaXMuX3VpUHJvdmlkZXJzLm1hcChcbiAgICAgIHByb3ZpZGVyID0+IFByb21pc2UucmVzb2x2ZShbXSksXG4gICAgKTtcbiAgICBjb25zdCB1aUNvbXBvbmVudExpc3RzID0gYXdhaXQgUHJvbWlzZS5hbGwodWlFbGVtZW50UHJvbWlzZXMpO1xuICAgIC8vIEZsYXR0ZW4gdWlDb21wb25lbnRMaXN0cyBmcm9tIGxpc3Qgb2YgbGlzdHMgb2YgY29tcG9uZW50cyB0byBhIGxpc3Qgb2YgY29tcG9uZW50cy5cbiAgICBjb25zdCB1aUNvbXBvbmVudHMgPSBbXS5jb25jYXQuYXBwbHkoW10sIHVpQ29tcG9uZW50TGlzdHMpO1xuICAgIHJldHVybiB1aUNvbXBvbmVudHM7XG4gIH1cblxuICBzZXRVaVByb3ZpZGVycyh1aVByb3ZpZGVyczogQXJyYXk8VUlQcm92aWRlcj4pOiB2b2lkIHtcbiAgICB0aGlzLl91aVByb3ZpZGVycyA9IHVpUHJvdmlkZXJzO1xuICAgIHRoaXMuX3VwZGF0ZUlubGluZUNvbXBvbmVudHMoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIGFzeW5jIF9sb2FkQ29tbWl0TW9kZVN0YXRlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuTE9BRElOR19DT01NSVRfTUVTU0FHRSxcbiAgICB9KTtcblxuICAgIGxldCBjb21taXRNZXNzYWdlID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMuX3N0YXRlLmNvbW1pdE1lc3NhZ2UgIT0gbnVsbCkge1xuICAgICAgICBjb21taXRNZXNzYWdlID0gdGhpcy5fc3RhdGUuY29tbWl0TWVzc2FnZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fc3RhdGUuY29tbWl0TW9kZSA9PT0gQ29tbWl0TW9kZS5DT01NSVQpIHtcbiAgICAgICAgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2xvYWRBY3RpdmVSZXBvc2l0b3J5VGVtcGxhdGVDb21taXRNZXNzYWdlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fbG9hZEFjdGl2ZVJlcG9zaXRvcnlMYXRlc3RDb21taXRNZXNzYWdlKCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgICBjb21taXRNZXNzYWdlLFxuICAgICAgICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZS5SRUFEWSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9sb2FkUHVibGlzaE1vZGVTdGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgcHVibGlzaE1lc3NhZ2UgPSB0aGlzLl9zdGF0ZS5wdWJsaXNoTWVzc2FnZTtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNb2RlOiBQdWJsaXNoTW9kZS5DUkVBVEUsXG4gICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLkxPQURJTkdfUFVCTElTSF9NRVNTQUdFLFxuICAgICAgcHVibGlzaE1lc3NhZ2U6IG51bGwsXG4gICAgICBoZWFkUmV2aXNpb246IG51bGwsXG4gICAgfSk7XG4gICAgY29uc3Qge2hlYWRSZXZpc2lvbiwgcGhhYnJpY2F0b3JSZXZpc2lvbn0gPSBhd2FpdCB0aGlzLl9nZXRBY3RpdmVIZWFkUmV2aXNpb25EZXRhaWxzKCk7XG4gICAgaWYgKHB1Ymxpc2hNZXNzYWdlID09IG51bGwpIHtcbiAgICAgIHB1Ymxpc2hNZXNzYWdlID0gcGhhYnJpY2F0b3JSZXZpc2lvbiAhPSBudWxsXG4gICAgICAgID8gZ2V0UmV2aXNpb25VcGRhdGVNZXNzYWdlKHBoYWJyaWNhdG9yUmV2aXNpb24pXG4gICAgICAgIDogaGVhZFJldmlzaW9uLmRlc2NyaXB0aW9uO1xuICAgIH1cbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNb2RlOiBwaGFicmljYXRvclJldmlzaW9uICE9IG51bGwgPyBQdWJsaXNoTW9kZS5VUERBVEUgOiBQdWJsaXNoTW9kZS5DUkVBVEUsXG4gICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLlJFQURZLFxuICAgICAgcHVibGlzaE1lc3NhZ2UsXG4gICAgICBoZWFkUmV2aXNpb24sXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfZ2V0QWN0aXZlSGVhZFJldmlzaW9uRGV0YWlscygpOiBQcm9taXNlPHtcbiAgICBoZWFkUmV2aXNpb246IFJldmlzaW9uSW5mbztcbiAgICBwaGFicmljYXRvclJldmlzaW9uOiA/UGhhYnJpY2F0b3JSZXZpc2lvbkluZm87XG4gIH0+IHtcbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZSA9IGF3YWl0IHRoaXMuZ2V0QWN0aXZlUmV2aXNpb25zU3RhdGUoKTtcbiAgICBpZiAocmV2aXNpb25zU3RhdGUgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgTG9hZCBQdWJsaXNoIFZpZXc6IE5vIGFjdGl2ZSBmaWxlIG9yIHJlcG9zaXRvcnknKTtcbiAgICB9XG4gICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICBpbnZhcmlhbnQocmV2aXNpb25zLmxlbmd0aCA+IDAsICdEaWZmIFZpZXcgRXJyb3I6IFplcm8gUmV2aXNpb25zJyk7XG4gICAgY29uc3QgaGVhZFJldmlzaW9uID0gcmV2aXNpb25zW3JldmlzaW9ucy5sZW5ndGggLSAxXTtcbiAgICBjb25zdCBwaGFicmljYXRvclJldmlzaW9uID0gYXJjYW5pc3QuZ2V0UGhhYnJpY2F0b3JSZXZpc2lvbkZyb21Db21taXRNZXNzYWdlKFxuICAgICAgaGVhZFJldmlzaW9uLmRlc2NyaXB0aW9uLFxuICAgICk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhlYWRSZXZpc2lvbixcbiAgICAgIHBoYWJyaWNhdG9yUmV2aXNpb24sXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIF9sb2FkQWN0aXZlUmVwb3NpdG9yeUxhdGVzdENvbW1pdE1lc3NhZ2UoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGlmZiBWaWV3OiBObyBhY3RpdmUgZmlsZSBvciByZXBvc2l0b3J5IG9wZW4nKTtcbiAgICB9XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLmdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCk7XG4gICAgaW52YXJpYW50KHJldmlzaW9uc1N0YXRlLCAnRGlmZiBWaWV3IEludGVybmFsIEVycm9yOiByZXZpc2lvbnNTdGF0ZSBjYW5ub3QgYmUgbnVsbCcpO1xuICAgIGNvbnN0IHtyZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG4gICAgaW52YXJpYW50KHJldmlzaW9ucy5sZW5ndGggPiAwLCAnRGlmZiBWaWV3IEVycm9yOiBDYW5ub3QgYW1lbmQgbm9uLWV4aXN0aW5nIGNvbW1pdCcpO1xuICAgIHJldHVybiByZXZpc2lvbnNbcmV2aXNpb25zLmxlbmd0aCAtIDFdLmRlc2NyaXB0aW9uO1xuICB9XG5cbiAgYXN5bmMgX2xvYWRBY3RpdmVSZXBvc2l0b3J5VGVtcGxhdGVDb21taXRNZXNzYWdlKCk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEaWZmIFZpZXc6IE5vIGFjdGl2ZSBmaWxlIG9yIHJlcG9zaXRvcnkgb3BlbicpO1xuICAgIH1cbiAgICBsZXQgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgICAvLyBDb21taXQgdGVtcGxhdGVzIHRoYXQgaW5jbHVkZSBuZXdsaW5lIHN0cmluZ3MsICdcXFxcbicgaW4gSmF2YVNjcmlwdCwgbmVlZCB0byBjb252ZXJ0IHRoZWlyXG4gICAgLy8gc3RyaW5ncyB0byBsaXRlcmFsIG5ld2xpbmVzLCAnXFxuJyBpbiBKYXZhU2NyaXB0LCB0byBiZSByZW5kZXJlZCBhcyBsaW5lIGJyZWFrcy5cbiAgICBpZiAoY29tbWl0TWVzc2FnZSAhPSBudWxsKSB7XG4gICAgICBjb21taXRNZXNzYWdlID0gY29udmVydE5ld2xpbmVzKGNvbW1pdE1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gY29tbWl0TWVzc2FnZTtcbiAgfVxuXG4gIGFzeW5jIGdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCk6IFByb21pc2U8P1JldmlzaW9uc1N0YXRlPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsIHx8ICF0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2suZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gIH1cblxuICBfc2V0U3RhdGUobmV3U3RhdGU6IFN0YXRlKSB7XG4gICAgdGhpcy5fc3RhdGUgPSBuZXdTdGF0ZTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoRElEX1VQREFURV9TVEFURV9FVkVOVCk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5jb21taXQnKVxuICBhc3luYyBjb21taXQobWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKG1lc3NhZ2UgPT09ICcnKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0NvbW1pdCBhYm9ydGVkJywge2RldGFpbDogJ0NvbW1pdCBtZXNzYWdlIGVtcHR5J30pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgY29tbWl0TWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIGNvbW1pdE1vZGVTdGF0ZTogQ29tbWl0TW9kZVN0YXRlLkFXQUlUSU5HX0NPTU1JVCxcbiAgICB9KTtcblxuICAgIGNvbnN0IHtjb21taXRNb2RlfSA9IHRoaXMuX3N0YXRlO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctY29tbWl0Jywge1xuICAgICAgY29tbWl0TW9kZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFjdGl2ZVN0YWNrID0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrO1xuICAgIHRyeSB7XG4gICAgICBpbnZhcmlhbnQoYWN0aXZlU3RhY2ssICdObyBhY3RpdmUgcmVwb3NpdG9yeSBzdGFjaycpO1xuICAgICAgc3dpdGNoIChjb21taXRNb2RlKSB7XG4gICAgICAgIGNhc2UgQ29tbWl0TW9kZS5DT01NSVQ6XG4gICAgICAgICAgYXdhaXQgYWN0aXZlU3RhY2suY29tbWl0KG1lc3NhZ2UpO1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb21taXQgY3JlYXRlZCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIENvbW1pdE1vZGUuQU1FTkQ6XG4gICAgICAgICAgYXdhaXQgYWN0aXZlU3RhY2suYW1lbmQobWVzc2FnZSk7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ0NvbW1pdCBhbWVuZGVkJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIEZvcmNlIHRyaWdnZXIgYW4gdXBkYXRlIHRvIHRoZSByZXZpc2lvbnMgdG8gdXBkYXRlIHRoZSBVSSBzdGF0ZSB3aXRoIHRoZSBuZXcgY29tbWl0IGluZm8uXG4gICAgICBhY3RpdmVTdGFjay5nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICAgIHRoaXMuX2xvYWRNb2RlU3RhdGUodHJ1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAnRXJyb3IgY3JlYXRpbmcgY29tbWl0JyxcbiAgICAgICAge2RldGFpbDogYERldGFpbHM6ICR7ZS5zdGRvdXR9YH0sXG4gICAgICApO1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuUkVBRFksXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBnZXRTdGF0ZSgpOiBTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICB9XG5cbiAgc2V0Q29tbWl0TW9kZShjb21taXRNb2RlOiBDb21taXRNb2RlVHlwZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdGF0ZS5jb21taXRNb2RlID09PSBjb21taXRNb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyYWNrKCdkaWZmLXZpZXctc3dpdGNoLWNvbW1pdC1tb2RlJywge1xuICAgICAgY29tbWl0TW9kZSxcbiAgICB9KTtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIGNvbW1pdE1vZGUsXG4gICAgICBjb21taXRNZXNzYWdlOiBudWxsLFxuICAgIH0pO1xuICAgIC8vIFdoZW4gdGhlIGNvbW1pdCBtb2RlIGNoYW5nZXMsIGxvYWQgdGhlIGFwcHJvcHJpYXRlIGNvbW1pdCBtZXNzYWdlLlxuICAgIHRoaXMuX2xvYWRNb2RlU3RhdGUodHJ1ZSk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVSZXBvc2l0b3JpZXMoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5U3RhY2sgb2YgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmFjdGl2YXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmRlYWN0aXZhdGUoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZShnZXRJbml0aWFsRmlsZUNoYW5nZVN0YXRlKCkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnlTdGFjayBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmNsZWFyKCk7XG4gICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2YgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmNsZWFyKCk7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld01vZGVsO1xuIl19