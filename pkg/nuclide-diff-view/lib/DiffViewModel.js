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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideArcanistClient = require('../../nuclide-arcanist-client');

var _nuclideArcanistClient2 = _interopRequireDefault(_nuclideArcanistClient);

var _atom = require('atom');

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

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
    var _type = repository ? repository.getType() : 'no repository';
    throw new Error('Diff view only supports `Mercurial` repositories, ' + ('but found `' + _type + '` at path: `' + filePath + '`'));
  }
  return repository;
}

function notifyRevisionStatus(phabRevision, statusMessage) {
  var message = 'Revision ' + statusMessage;
  if (phabRevision == null) {
    atom.notifications.addSuccess(message);
    return;
  }
  var id = phabRevision.id;
  var url = phabRevision.url;

  message = 'Revision \'' + id + '\' ' + statusMessage;
  atom.notifications.addSuccess(message, {
    dismissable: true,
    buttons: [{
      className: 'icon icon-globe',
      onDidClick: function onDidClick() {
        _shell2['default'].openExternal(url);
      },
      text: 'Open in Phabricator'
    }]
  });
}

var DiffViewModel = (function () {
  function DiffViewModel() {
    var _this = this;

    _classCallCheck(this, DiffViewModel);

    this._emitter = new _atom.Emitter();
    this._subscriptions = new _atom.CompositeDisposable();
    this._activeSubscriptions = new _atom.CompositeDisposable();
    this._uiProviders = [];
    this._repositoryStacks = new Map();
    this._repositorySubscriptions = new Map();
    this._isActive = false;
    this._publishUpdates = new _reactivexRxjs2['default'].Subject();
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
        this._setActiveRepositoryStack(Array.from(this._repositoryStacks.values())[0]);
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
      var dirtyFileChanges = _nuclideCommons.map.union.apply(_nuclideCommons.map, _toConsumableArray(Array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
        return repositoryStack.getDirtyFileChanges();
      })));
      this._updateCompareChangedStatus(dirtyFileChanges);
    }
  }, {
    key: '_updateCommitMergeFileChanges',
    value: function _updateCommitMergeFileChanges() {
      var commitMergeFileChanges = _nuclideCommons.map.union.apply(_nuclideCommons.map, _toConsumableArray(Array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
        return repositoryStack.getCommitMergeFileChanges();
      })));
      var lastCommitMergeFileChanges = _nuclideCommons.map.union.apply(_nuclideCommons.map, _toConsumableArray(Array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
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
      var loadModeState = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

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
      if (loadModeState) {
        this._loadModeState(false);
      }
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
      var dirtyFilePaths = Array.from(repositoryStack.getDirtyFileChanges().keys());
      // Try to match dirty file changes in the selected directory,
      // Then lookup for changes in the project directory.
      var matchedFilePaths = [getMatchingFileChange(dirtyFilePaths, directoryPath), getMatchingFileChange(dirtyFilePaths, projectDirectory)];
      return matchedFilePaths[0] || matchedFilePaths[1];
    }
  }, {
    key: 'diffEntity',
    value: function diffEntity(entityOption) {
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
        } else if (this._activeRepositoryStack == null) {
          // This can only happen none of the project folders are Mercurial repositories.
          // However, this is caught earlier with a better error message.
          throw new Error('No active repository stack and non-diffable entity:' + JSON.stringify(entityOption));
        } else {
          (0, _nuclideLogging.getLogger)().error('Non diffable entity:', entityOption);
        }
      }
      var viewMode = entityOption.viewMode;
      var commitMode = entityOption.commitMode;

      if (viewMode !== this._state.viewMode || commitMode !== this._state.commitMode) {
        if (viewMode === _constants.DiffMode.COMMIT_MODE) {
          (0, _assert2['default'])(commitMode, 'DIFF: Commit Mode not set!');
          this.setViewMode(_constants.DiffMode.COMMIT_MODE, false);
          this.setCommitMode(commitMode, false);
          this._loadModeState(true);
        } else if (viewMode) {
          this.setViewMode(viewMode);
        }
      }
      if (diffPath != null) {
        // Diff the file after setting the view mode to compare against the right thing.
        this._diffFilePath(diffPath);
      }
    }
  }, {
    key: '_diffFilePath',
    value: function _diffFilePath(filePath) {
      var _this4 = this;

      if (filePath === this._activeFileState.filePath) {
        return;
      }
      this._activeSubscriptions.dispose();
      this._activeSubscriptions = new _atom.CompositeDisposable();
      // TODO(most): Show progress indicator: t8991676
      var buffer = (0, _nuclideAtomHelpers.bufferForUri)(filePath);
      var file = buffer.file;

      if (file != null) {
        this._activeSubscriptions.add(file.onDidChange((0, _nuclideCommons.debounce)(function () {
          return _this4._onDidFileChange(filePath)['catch'](_notifications.notifyInternalError);
        }, FILE_CHANGE_DEBOUNCE_MS, false)));
      }
      this._activeSubscriptions.add(buffer.onDidChangeModified(this.emitActiveBufferChangeModified.bind(this)));
      // Modified events could be late that it doesn't capture the latest edits/ state changes.
      // Hence, it's safe to re-emit changes when stable from changes.
      this._activeSubscriptions.add(buffer.onDidStopChanging(this.emitActiveBufferChangeModified.bind(this)));
      // Update `savedContents` on buffer save requests.
      this._activeSubscriptions.add(buffer.onWillSave(function () {
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
    key: 'getPublishUpdates',
    value: function getPublishUpdates() {
      return this._publishUpdates;
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
      var commitMessage = publishMode === _constants.PublishMode.CREATE ? publishMessage : null;
      var cleanResult = yield this._promptToCleanDirtyChanges(commitMessage);
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
            var createdPhabricatorRevision = yield this._createPhabricatorRevision(publishMessage, amended);
            notifyRevisionStatus(createdPhabricatorRevision, 'created');
            break;
          case _constants.PublishMode.UPDATE:
            var updatedPhabricatorRevision = yield this._updatePhabricatorRevision(publishMessage, allowUntracked);
            notifyRevisionStatus(updatedPhabricatorRevision, 'updated');
            break;
          default:
            throw new Error('Unknown publish mode \'' + publishMode + '\'');
        }
        // Wait a bit until the user sees the success push message.
        yield _nuclideCommons.promises.awaitMilliSeconds(2000);
        // Populate Publish UI with the most recent data after a successful push.
        this._loadModeState(true);
      } catch (error) {
        (0, _notifications.notifyInternalError)(error, true /*persist the error (user dismissable)*/);
        this._setState(_extends({}, this._state, {
          publishModeState: _constants.PublishModeState.PUBLISH_ERROR
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
      var untrackedChanges = new Map(Array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
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
            yield activeStack.add(Array.from(untrackedChanges.keys()));
            shouldAmend = true;
          } else if (untrackedChoice === 2) /*Allow Untracked*/{
            allowUntracked = true;
          }
      }
      var revertableChanges = new Map(Array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
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
            var canRevertFilePaths = Array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
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
      var filePath = this._getArcanistFilePath();
      var lastCommitMessage = yield this._loadActiveRepositoryLatestCommitMessage();
      var activeRepositoryStack = this._activeRepositoryStack;
      (0, _assert2['default'])(activeRepositoryStack, 'No active repository stack');
      if (!amended && publishMessage !== lastCommitMessage) {
        (0, _nuclideLogging.getLogger)().info('Amending commit with the updated message');
        yield activeRepositoryStack.amend(publishMessage);
        atom.notifications.addSuccess('Commit amended with the updated message');
      }

      this._publishUpdates.next({ level: 'log', text: 'Creating new revision...\n' });
      var stream = _nuclideArcanistClient2['default'].createPhabricatorRevision(filePath);
      yield this._processArcanistOutput(stream);
      // Invalidate the current revisions state because the current commit info has changed.
      activeRepositoryStack.getRevisionsStatePromise();

      var _ref7 = yield this._getActiveHeadRevisionDetails();

      var phabricatorRevision = _ref7.phabricatorRevision;

      return phabricatorRevision;
    })
  }, {
    key: '_updatePhabricatorRevision',
    value: _asyncToGenerator(function* (publishMessage, allowUntracked) {
      var filePath = this._getArcanistFilePath();

      var _ref8 = yield this._getActiveHeadRevisionDetails();

      var phabricatorRevision = _ref8.phabricatorRevision;

      (0, _assert2['default'])(phabricatorRevision != null, 'A phabricator revision must exist to update!');
      var updateTemplate = getRevisionUpdateMessage(phabricatorRevision).trim();
      var userUpdateMessage = publishMessage.replace(updateTemplate, '').trim();
      if (userUpdateMessage.length === 0) {
        throw new Error('Cannot update revision with empty message');
      }

      this._publishUpdates.next({
        level: 'log',
        text: 'Updating revision `' + phabricatorRevision.id + '`...\n'
      });
      var stream = _nuclideArcanistClient2['default'].updatePhabricatorRevision(filePath, userUpdateMessage, allowUntracked);
      yield this._processArcanistOutput(stream);
      return phabricatorRevision;
    })
  }, {
    key: '_processArcanistOutput',
    value: _asyncToGenerator(function* (stream) {
      var _Rx$Observable,
          _this5 = this;

      stream = stream
      // Split stream into single lines.
      .flatMap(function (message) {
        var lines = [];
        for (var fd of ['stderr', 'stdout']) {
          var out = message[fd];
          if (out != null) {
            out = out.replace(/\n$/, '');
            for (var line of out.split('\n')) {
              lines.push(_defineProperty({}, fd, line));
            }
          }
        }
        return lines;
      })
      // Unpack JSON
      .flatMap(function (message) {
        var stdout = message.stdout;
        var messages = [];
        if (stdout != null) {
          var decodedJSON = null;
          try {
            decodedJSON = JSON.parse(stdout);
          } catch (err) {
            messages.push({ type: 'phutil:out', message: stdout + '\n' });
            (0, _nuclideLogging.getLogger)().error('Invalid JSON encountered: ' + stdout);
          }
          if (decodedJSON != null) {
            messages.push(decodedJSON);
          }
        }
        if (message.stderr != null) {
          messages.push({ type: 'phutil:err', message: message.stderr + '\n' });
        }
        return messages;
      })
      // Process message type.
      .flatMap(function (decodedJSON) {
        var messages = [];
        switch (decodedJSON.type) {
          case 'phutil:out':
          case 'phutil:out:raw':
            messages.push({ level: 'log', text: decodedJSON.message });
            break;
          case 'phutil:err':
            messages.push({ level: 'error', text: decodedJSON.message });
            break;
          case 'error':
            throw new Error(decodedJSON.message);
          default:
            (0, _nuclideLogging.getLogger)().info('Unhandled message type:', decodedJSON.type, 'Message payload:', decodedJSON.message);
            break;
        }
        return messages;
      })
      // Split messages on new line characters.
      .flatMap(function (message) {
        var splitMessages = [];
        // Split on newlines without removing new line characters.  This will remove empty
        // strings but that's OK.
        for (var part of message.text.split(/^/m)) {
          splitMessages.push({ level: message.level, text: part });
        }
        return splitMessages;
      });
      var levelStreams = [];

      var _loop = function (_level) {
        var levelStream = stream.filter(function (message) {
          return message.level === _level;
        }).share();
        levelStreams.push((0, _nuclideCommons.bufferUntil)(levelStream, function (message) {
          return message.text.endsWith('\n');
        }));
      };

      for (var _level of ['log', 'error']) {
        _loop(_level);
      }
      yield (_Rx$Observable = _reactivexRxjs2['default'].Observable).merge.apply(_Rx$Observable, levelStreams)['do'](function (messages) {
        if (messages.length > 0) {
          _this5._publishUpdates.next({
            level: messages[0].level,
            text: messages.map(function (message) {
              return message.text;
            }).join('')
          });
        }
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

      var _ref9 = yield this._getActiveHeadRevisionDetails();

      var headRevision = _ref9.headRevision;
      var phabricatorRevision = _ref9.phabricatorRevision;

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
      var loadModeState = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

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
      if (loadModeState) {
        // When the commit mode changes, load the appropriate commit message.
        this._loadModeState(true);
      }
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
      this._activeSubscriptions.dispose();
    }
  }]);

  return DiffViewModel;
})();

module.exports = DiffViewModel;
//# sourceMappingURL=data:application/json;base64,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QUFFO0FBQ3ZDLFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUN6QyxZQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO09BQ3BDO0FBQ0QsVUFBSSxDQUFDLG1CQUFtQixDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQztLQUN2RDs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFdBQUssSUFBTSxlQUFlLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQzdELHVCQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDM0I7QUFDRCxVQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDL0IsV0FBSyxJQUFNLFlBQVksSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDakUsb0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN4QjtBQUNELFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QyxVQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDckM7OztTQXRtQ0csYUFBYTs7O0FBeW1DbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdNb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge1xuICBGaWxlQ2hhbmdlU3RhdGUsXG4gIFJldmlzaW9uc1N0YXRlLFxuICBGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsXG4gIENvbW1pdE1vZGVUeXBlLFxuICBDb21taXRNb2RlU3RhdGVUeXBlLFxuICBQdWJsaXNoTW9kZVR5cGUsXG4gIFB1Ymxpc2hNb2RlU3RhdGVUeXBlLFxuICBEaWZmTW9kZVR5cGUsXG4gIERpZmZPcHRpb25UeXBlLFxufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7UGhhYnJpY2F0b3JSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL251Y2xpZGUtYXJjYW5pc3QtY2xpZW50JztcbmltcG9ydCB0eXBlIHtcbiAgVUlQcm92aWRlcixcbiAgVUlFbGVtZW50LFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpZmYtdWktcHJvdmlkZXItaW50ZXJmYWNlcyc7XG5cbnR5cGUgRmlsZURpZmZTdGF0ZSA9IHtcbiAgcmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm87XG4gIGNvbW1pdHRlZENvbnRlbnRzOiBzdHJpbmc7XG4gIGZpbGVzeXN0ZW1Db250ZW50czogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgRGlmZkVudGl0eU9wdGlvbnMgPSB7XG4gIGZpbGU/OiBOdWNsaWRlVXJpO1xuICBkaXJlY3Rvcnk/OiBOdWNsaWRlVXJpO1xuICB2aWV3TW9kZT86IERpZmZNb2RlVHlwZTtcbiAgY29tbWl0TW9kZT86IENvbW1pdE1vZGVUeXBlO1xufTtcblxuaW1wb3J0IGFyY2FuaXN0IGZyb20gJy4uLy4uL251Y2xpZGUtYXJjYW5pc3QtY2xpZW50JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgc2hlbGwgZnJvbSAnc2hlbGwnO1xuaW1wb3J0IHtcbiAgRGlmZk1vZGUsXG4gIERpZmZPcHRpb24sXG4gIENvbW1pdE1vZGUsXG4gIENvbW1pdE1vZGVTdGF0ZSxcbiAgUHVibGlzaE1vZGUsXG4gIFB1Ymxpc2hNb2RlU3RhdGUsXG4gIEZpbGVDaGFuZ2VTdGF0dXMsXG4gIEZpbGVDaGFuZ2VTdGF0dXNUb1ByZWZpeCxcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1naXQtYnJpZGdlJztcbmltcG9ydCB7dHJhY2ssIHRyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1Db250ZW50c30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2J1ZmZlclVudGlsLCBtYXAsIGRlYm91bmNlLCBwcm9taXNlc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCBSZXBvc2l0b3J5U3RhY2sgZnJvbSAnLi9SZXBvc2l0b3J5U3RhY2snO1xuaW1wb3J0IFJ4IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQge1xuICBub3RpZnlJbnRlcm5hbEVycm9yLFxuICBub3RpZnlGaWxlc3lzdGVtT3ZlcnJpZGVVc2VyRWRpdHMsXG59IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XG5pbXBvcnQge2J1ZmZlckZvclVyaSwgbG9hZEJ1ZmZlckZvclVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5cbmNvbnN0IHtzZXJpYWxpemVBc3luY0NhbGx9ID0gcHJvbWlzZXM7XG5cbmNvbnN0IEFDVElWRV9GSUxFX1VQREFURV9FVkVOVCA9ICdhY3RpdmUtZmlsZS11cGRhdGUnO1xuY29uc3QgQ0hBTkdFX1JFVklTSU9OU19FVkVOVCA9ICdkaWQtY2hhbmdlLXJldmlzaW9ucyc7XG5jb25zdCBBQ1RJVkVfQlVGRkVSX0NIQU5HRV9NT0RJRklFRF9FVkVOVCA9ICdhY3RpdmUtYnVmZmVyLWNoYW5nZS1tb2RpZmllZCc7XG5jb25zdCBESURfVVBEQVRFX1NUQVRFX0VWRU5UID0gJ2RpZC11cGRhdGUtc3RhdGUnO1xuXG5mdW5jdGlvbiBnZXRSZXZpc2lvblVwZGF0ZU1lc3NhZ2UocGhhYnJpY2F0b3JSZXZpc2lvbjogUGhhYnJpY2F0b3JSZXZpc2lvbkluZm8pOiBzdHJpbmcge1xuICByZXR1cm4gYFxuXG4jIFVwZGF0aW5nICR7cGhhYnJpY2F0b3JSZXZpc2lvbi5pZH1cbiNcbiMgRW50ZXIgYSBicmllZiBkZXNjcmlwdGlvbiBvZiB0aGUgY2hhbmdlcyBpbmNsdWRlZCBpbiB0aGlzIHVwZGF0ZS5cbiMgVGhlIGZpcnN0IGxpbmUgaXMgdXNlZCBhcyBzdWJqZWN0LCBuZXh0IGxpbmVzIGFzIGNvbW1lbnQuYDtcbn1cblxuY29uc3QgRklMRV9DSEFOR0VfREVCT1VOQ0VfTVMgPSAyMDA7XG5jb25zdCBNQVhfRElBTE9HX0ZJTEVfU1RBVFVTX0NPVU5UID0gMjA7XG5cbi8vIFJldHVybnMgYSBzdHJpbmcgd2l0aCBhbGwgbmV3bGluZSBzdHJpbmdzLCAnXFxcXG4nLCBjb252ZXJ0ZWQgdG8gbGl0ZXJhbCBuZXdsaW5lcywgJ1xcbicuXG5mdW5jdGlvbiBjb252ZXJ0TmV3bGluZXMobWVzc2FnZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG1lc3NhZ2UucmVwbGFjZSgvXFxcXG4vZywgJ1xcbicpO1xufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsRmlsZUNoYW5nZVN0YXRlKCk6IEZpbGVDaGFuZ2VTdGF0ZSB7XG4gIHJldHVybiB7XG4gICAgZnJvbVJldmlzaW9uVGl0bGU6ICdObyBmaWxlIHNlbGVjdGVkJyxcbiAgICB0b1JldmlzaW9uVGl0bGU6ICdObyBmaWxlIHNlbGVjdGVkJyxcbiAgICBmaWxlUGF0aDogJycsXG4gICAgb2xkQ29udGVudHM6ICcnLFxuICAgIG5ld0NvbnRlbnRzOiAnJyxcbiAgICBjb21wYXJlUmV2aXNpb25JbmZvOiBudWxsLFxuICB9O1xufVxuXG5mdW5jdGlvbiB2aWV3TW9kZVRvRGlmZk9wdGlvbih2aWV3TW9kZTogRGlmZk1vZGVUeXBlKTogRGlmZk9wdGlvblR5cGUge1xuICBzd2l0Y2ggKHZpZXdNb2RlKSB7XG4gICAgY2FzZSBEaWZmTW9kZS5DT01NSVRfTU9ERTpcbiAgICAgIHJldHVybiBEaWZmT3B0aW9uLkRJUlRZO1xuICAgIGNhc2UgRGlmZk1vZGUuUFVCTElTSF9NT0RFOlxuICAgICAgcmV0dXJuIERpZmZPcHRpb24uTEFTVF9DT01NSVQ7XG4gICAgY2FzZSBEaWZmTW9kZS5CUk9XU0VfTU9ERTpcbiAgICAgIHJldHVybiBEaWZmT3B0aW9uLkNPTVBBUkVfQ09NTUlUO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VucmVjb2duaXplZCB2aWV3IG1vZGUhJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RmlsZVN0YXR1c0xpc3RNZXNzYWdlKGZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPik6IHN0cmluZyB7XG4gIGxldCBtZXNzYWdlID0gJyc7XG4gIGlmIChmaWxlQ2hhbmdlcy5zaXplIDwgTUFYX0RJQUxPR19GSUxFX1NUQVRVU19DT1VOVCkge1xuICAgIGZvciAoY29uc3QgW2ZpbGVQYXRoLCBzdGF0dXNDb2RlXSBvZiBmaWxlQ2hhbmdlcykge1xuICAgICAgbWVzc2FnZSArPSAnXFxuJ1xuICAgICAgICArIEZpbGVDaGFuZ2VTdGF0dXNUb1ByZWZpeFtzdGF0dXNDb2RlXVxuICAgICAgICArIGF0b20ucHJvamVjdC5yZWxhdGl2aXplKGZpbGVQYXRoKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbWVzc2FnZSA9IGBcXG4gbW9yZSB0aGFuICR7TUFYX0RJQUxPR19GSUxFX1NUQVRVU19DT1VOVH0gZmlsZXMgKGNoZWNrIHVzaW5nIFxcYGhnIHN0YXR1c1xcYClgO1xuICB9XG4gIHJldHVybiBtZXNzYWdlO1xufVxuXG5mdW5jdGlvbiBoZ1JlcG9zaXRvcnlGb3JQYXRoKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogSGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgLy8gQ2FsbGluZyBhdG9tLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeSBnZXRzIHRoZSByZWFsIHBhdGggb2YgdGhlIGRpcmVjdG9yeSxcbiAgLy8gd2hpY2ggaXMgYW5vdGhlciByb3VuZC10cmlwIGFuZCBjYWxscyB0aGUgcmVwb3NpdG9yeSBwcm92aWRlcnMgdG8gZ2V0IGFuIGV4aXN0aW5nIHJlcG9zaXRvcnkuXG4gIC8vIEluc3RlYWQsIHRoZSBmaXJzdCBtYXRjaCBvZiB0aGUgZmlsdGVyaW5nIGhlcmUgaXMgdGhlIG9ubHkgcG9zc2libGUgbWF0Y2guXG4gIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aCk7XG4gIGlmIChyZXBvc2l0b3J5ID09IG51bGwgfHwgcmVwb3NpdG9yeS5nZXRUeXBlKCkgIT09ICdoZycpIHtcbiAgICBjb25zdCB0eXBlID0gcmVwb3NpdG9yeSA/IHJlcG9zaXRvcnkuZ2V0VHlwZSgpIDogJ25vIHJlcG9zaXRvcnknO1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBEaWZmIHZpZXcgb25seSBzdXBwb3J0cyBcXGBNZXJjdXJpYWxcXGAgcmVwb3NpdG9yaWVzLCBgICtcbiAgICAgIGBidXQgZm91bmQgXFxgJHt0eXBlfVxcYCBhdCBwYXRoOiBcXGAke2ZpbGVQYXRofVxcYGBcbiAgICApO1xuICB9XG4gIHJldHVybiAocmVwb3NpdG9yeTogYW55KTtcbn1cblxuZnVuY3Rpb24gbm90aWZ5UmV2aXNpb25TdGF0dXMoXG4gIHBoYWJSZXZpc2lvbjogP1BoYWJyaWNhdG9yUmV2aXNpb25JbmZvLFxuICBzdGF0dXNNZXNzYWdlOiBzdHJpbmcsXG4pOiB2b2lkIHtcbiAgbGV0IG1lc3NhZ2UgPSBgUmV2aXNpb24gJHtzdGF0dXNNZXNzYWdlfWA7XG4gIGlmIChwaGFiUmV2aXNpb24gPT0gbnVsbCkge1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKG1lc3NhZ2UpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB7aWQsIHVybH0gPSBwaGFiUmV2aXNpb247XG4gIG1lc3NhZ2UgPSBgUmV2aXNpb24gJyR7aWR9JyAke3N0YXR1c01lc3NhZ2V9YDtcbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MobWVzc2FnZSwge1xuICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgIGJ1dHRvbnM6IFt7XG4gICAgICBjbGFzc05hbWU6ICdpY29uIGljb24tZ2xvYmUnLFxuICAgICAgb25EaWRDbGljaygpIHsgc2hlbGwub3BlbkV4dGVybmFsKHVybCk7IH0sXG4gICAgICB0ZXh0OiAnT3BlbiBpbiBQaGFicmljYXRvcicsXG4gICAgfV0sXG4gIH0pO1xufVxuXG50eXBlIFN0YXRlID0ge1xuICB2aWV3TW9kZTogRGlmZk1vZGVUeXBlO1xuICBjb21taXRNZXNzYWdlOiA/c3RyaW5nO1xuICBjb21taXRNb2RlOiBDb21taXRNb2RlVHlwZTtcbiAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGVUeXBlO1xuICBwdWJsaXNoTWVzc2FnZTogP3N0cmluZztcbiAgcHVibGlzaE1vZGU6IFB1Ymxpc2hNb2RlVHlwZTtcbiAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZVR5cGU7XG4gIGhlYWRSZXZpc2lvbjogP1JldmlzaW9uSW5mbztcbiAgZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIGNvbW1pdE1lcmdlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBsYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIHNlbGVjdGVkRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBzaG93Tm9uSGdSZXBvczogYm9vbGVhbjtcbn07XG5cbmNsYXNzIERpZmZWaWV3TW9kZWwge1xuXG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGl2ZVN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9hY3RpdmVGaWxlU3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZTtcbiAgX2FjdGl2ZVJlcG9zaXRvcnlTdGFjazogP1JlcG9zaXRvcnlTdGFjaztcbiAgX25ld0VkaXRvcjogP1RleHRFZGl0b3I7XG4gIF91aVByb3ZpZGVyczogQXJyYXk8VUlQcm92aWRlcj47XG4gIF9yZXBvc2l0b3J5U3RhY2tzOiBNYXA8SGdSZXBvc2l0b3J5Q2xpZW50LCBSZXBvc2l0b3J5U3RhY2s+O1xuICBfcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnM6IE1hcDxIZ1JlcG9zaXRvcnlDbGllbnQsIENvbXBvc2l0ZURpc3Bvc2FibGU+O1xuICBfaXNBY3RpdmU6IGJvb2xlYW47XG4gIF9zdGF0ZTogU3RhdGU7XG4gIF9wdWJsaXNoVXBkYXRlczogUnguU3ViamVjdDtcbiAgX3NlcmlhbGl6ZWRVcGRhdGVBY3RpdmVGaWxlRGlmZjogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl91aVByb3ZpZGVycyA9IFtdO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9wdWJsaXNoVXBkYXRlcyA9IG5ldyBSeC5TdWJqZWN0KCk7XG4gICAgdGhpcy5fc3RhdGUgPSB7XG4gICAgICB2aWV3TW9kZTogRGlmZk1vZGUuQlJPV1NFX01PREUsXG4gICAgICBjb21taXRNZXNzYWdlOiBudWxsLFxuICAgICAgY29tbWl0TW9kZTogQ29tbWl0TW9kZS5DT01NSVQsXG4gICAgICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZS5SRUFEWSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlOiBudWxsLFxuICAgICAgcHVibGlzaE1vZGU6IFB1Ymxpc2hNb2RlLkNSRUFURSxcbiAgICAgIHB1Ymxpc2hNb2RlU3RhdGU6IFB1Ymxpc2hNb2RlU3RhdGUuUkVBRFksXG4gICAgICBoZWFkUmV2aXNpb246IG51bGwsXG4gICAgICBkaXJ0eUZpbGVDaGFuZ2VzOiBuZXcgTWFwKCksXG4gICAgICBjb21taXRNZXJnZUZpbGVDaGFuZ2VzOiBuZXcgTWFwKCksXG4gICAgICBsYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlczogbmV3IE1hcCgpLFxuICAgICAgc2VsZWN0ZWRGaWxlQ2hhbmdlczogbmV3IE1hcCgpLFxuICAgICAgc2hvd05vbkhnUmVwb3M6IHRydWUsXG4gICAgfTtcbiAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlQWN0aXZlRmlsZURpZmYgPSBzZXJpYWxpemVBc3luY0NhbGwoKCkgPT4gdGhpcy5fdXBkYXRlQWN0aXZlRmlsZURpZmYoKSk7XG4gICAgdGhpcy5fdXBkYXRlUmVwb3NpdG9yaWVzKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHModGhpcy5fdXBkYXRlUmVwb3NpdG9yaWVzLmJpbmQodGhpcykpKTtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoZ2V0SW5pdGlhbEZpbGVDaGFuZ2VTdGF0ZSgpKTtcbiAgICB0aGlzLl9jaGVja0N1c3RvbUNvbmZpZygpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICB9XG5cbiAgYXN5bmMgX2NoZWNrQ3VzdG9tQ29uZmlnKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBjb25maWcgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBjb25maWcgPSByZXF1aXJlKCcuL2ZiL2NvbmZpZycpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoY29uZmlnID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXdhaXQgY29uZmlnLmFwcGx5Q29uZmlnKCk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZVJlcG9zaXRvcmllcygpOiB2b2lkIHtcbiAgICBjb25zdCByZXBvc2l0b3JpZXMgPSBuZXcgU2V0KFxuICAgICAgYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpLmZpbHRlcihcbiAgICAgICAgcmVwb3NpdG9yeSA9PiByZXBvc2l0b3J5ICE9IG51bGwgJiYgcmVwb3NpdG9yeS5nZXRUeXBlKCkgPT09ICdoZydcbiAgICAgIClcbiAgICApO1xuICAgIC8vIERpc3Bvc2UgcmVtb3ZlZCBwcm9qZWN0cyByZXBvc2l0b3JpZXMsIGlmIGFueS5cbiAgICBmb3IgKGNvbnN0IFtyZXBvc2l0b3J5LCByZXBvc2l0b3J5U3RhY2tdIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MpIHtcbiAgICAgIGlmIChyZXBvc2l0b3JpZXMuaGFzKHJlcG9zaXRvcnkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PT0gcmVwb3NpdG9yeVN0YWNrKSB7XG4gICAgICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXBvc2l0b3J5U3RhY2suZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5kZWxldGUocmVwb3NpdG9yeSk7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuZ2V0KHJlcG9zaXRvcnkpO1xuICAgICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5kZWxldGUocmVwb3NpdG9yeSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSBuZXcgcHJvamVjdCByZXBvc2l0b3JpZXMsIGlmIGFueS5cbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnkgb2YgcmVwb3NpdG9yaWVzKSB7XG4gICAgICBpZiAodGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5oYXMocmVwb3NpdG9yeSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSAoKHJlcG9zaXRvcnk6IGFueSk6IEhnUmVwb3NpdG9yeUNsaWVudCk7XG4gICAgICB0aGlzLl9jcmVhdGVSZXBvc2l0b3J5U3RhY2soaGdSZXBvc2l0b3J5KTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgYWN0aXZlIHJlcG9zaXRvcnkgc3RhY2ssIGlmIG5lZWRlZC5cbiAgICAvLyBUaGlzIHdpbGwgbWFrZSBzdXJlIHdlIGhhdmUgYSByZXBvc2l0b3J5IHN0YWNrIGFjdGl2ZSB3aGVuZXZlciB3ZSBoYXZlXG4gICAgLy8gYSBtZXJjdXJpYWwgcmVwb3NpdG9yeSBhZGRlZCB0byB0aGUgcHJvamVjdC5cbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09IG51bGwgJiYgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5zaXplID4gMCkge1xuICAgICAgdGhpcy5fc2V0QWN0aXZlUmVwb3NpdG9yeVN0YWNrKFxuICAgICAgICBBcnJheS5mcm9tKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpWzBdLFxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlRGlydHlDaGFuZ2VkU3RhdHVzKCk7XG4gIH1cblxuICBfY3JlYXRlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCk6IFJlcG9zaXRvcnlTdGFjayB7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gbmV3IFJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5KTtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZFVwZGF0ZURpcnR5RmlsZUNoYW5nZXMoXG4gICAgICAgIHRoaXMuX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cy5iaW5kKHRoaXMpXG4gICAgICApLFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkVXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyhcbiAgICAgICAgdGhpcy5fdXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcy5iaW5kKHRoaXMpXG4gICAgICApLFxuICAgICAgcmVwb3NpdG9yeVN0YWNrLm9uRGlkQ2hhbmdlUmV2aXNpb25zKHJldmlzaW9uc1N0YXRlID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhyZXBvc2l0b3J5U3RhY2ssIHJldmlzaW9uc1N0YXRlLCB0cnVlKVxuICAgICAgICAgIC5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5zZXQocmVwb3NpdG9yeSwgcmVwb3NpdG9yeVN0YWNrKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5zZXQocmVwb3NpdG9yeSwgc3Vic2NyaXB0aW9ucyk7XG4gICAgaWYgKHRoaXMuX2lzQWN0aXZlKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suYWN0aXZhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcG9zaXRvcnlTdGFjaztcbiAgfVxuXG4gIF91cGRhdGVEaXJ0eUNoYW5nZWRTdGF0dXMoKTogdm9pZCB7XG4gICAgY29uc3QgZGlydHlGaWxlQ2hhbmdlcyA9IG1hcC51bmlvbihcbiAgICAgIC4uLkFycmF5LmZyb20odGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSlcbiAgICAgIC5tYXAocmVwb3NpdG9yeVN0YWNrID0+IHJlcG9zaXRvcnlTdGFjay5nZXREaXJ0eUZpbGVDaGFuZ2VzKCkpXG4gICAgKTtcbiAgICB0aGlzLl91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cyhkaXJ0eUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIF91cGRhdGVDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSBtYXAudW5pb24oXG4gICAgICAuLi5BcnJheS5mcm9tKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpXG4gICAgICAubWFwKHJlcG9zaXRvcnlTdGFjayA9PiByZXBvc2l0b3J5U3RhY2suZ2V0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcygpKVxuICAgICk7XG4gICAgY29uc3QgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSBtYXAudW5pb24oXG4gICAgICAuLi5BcnJheS5mcm9tKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpXG4gICAgICAubWFwKHJlcG9zaXRvcnlTdGFjayA9PiByZXBvc2l0b3J5U3RhY2suZ2V0TGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMoKSlcbiAgICApO1xuICAgIHRoaXMuX3VwZGF0ZUNvbXBhcmVDaGFuZ2VkU3RhdHVzKFxuICAgICAgbnVsbCxcbiAgICAgIGNvbW1pdE1lcmdlRmlsZUNoYW5nZXMsXG4gICAgICBsYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyxcbiAgICApO1xuICB9XG5cbiAgX3VwZGF0ZUNvbXBhcmVDaGFuZ2VkU3RhdHVzKFxuICAgIGRpcnR5RmlsZUNoYW5nZXM/OiA/TWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4sXG4gICAgY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcz86ID9NYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPixcbiAgICBsYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcz86ID9NYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPixcbiAgKTogdm9pZCB7XG4gICAgaWYgKGRpcnR5RmlsZUNoYW5nZXMgPT0gbnVsbCkge1xuICAgICAgZGlydHlGaWxlQ2hhbmdlcyA9IHRoaXMuX3N0YXRlLmRpcnR5RmlsZUNoYW5nZXM7XG4gICAgfVxuICAgIGlmIChjb21taXRNZXJnZUZpbGVDaGFuZ2VzID09IG51bGwpIHtcbiAgICAgIGNvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSB0aGlzLl9zdGF0ZS5jb21taXRNZXJnZUZpbGVDaGFuZ2VzO1xuICAgIH1cbiAgICBpZiAobGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPT0gbnVsbCkge1xuICAgICAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSB0aGlzLl9zdGF0ZS5sYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcztcbiAgICB9XG4gICAgbGV0IHNlbGVjdGVkRmlsZUNoYW5nZXM7XG4gICAgbGV0IHNob3dOb25IZ1JlcG9zO1xuICAgIGxldCBhY3RpdmVSZXBvc2l0b3J5U2VsZWN0b3IgPSAoKSA9PiB0cnVlO1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgIT0gbnVsbCkge1xuICAgICAgY29uc3QgcHJvamVjdERpcmVjdG9yeSA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRSZXBvc2l0b3J5KCkuZ2V0UHJvamVjdERpcmVjdG9yeSgpO1xuICAgICAgYWN0aXZlUmVwb3NpdG9yeVNlbGVjdG9yID0gKGZpbGVQYXRoOiBOdWNsaWRlVXJpKSA9PlxuICAgICAgICByZW1vdGVVcmkuY29udGFpbnMocHJvamVjdERpcmVjdG9yeSwgZmlsZVBhdGgpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHRoaXMuX3N0YXRlLnZpZXdNb2RlKSB7XG4gICAgICBjYXNlIERpZmZNb2RlLkNPTU1JVF9NT0RFOlxuICAgICAgICAvLyBDb21taXQgbW9kZSBvbmx5IHNob3dzIHRoZSBjaGFuZ2VzIG9mIHRoZSBhY3RpdmUgcmVwb3NpdG9yeS5cbiAgICAgICAgc2VsZWN0ZWRGaWxlQ2hhbmdlcyA9IG1hcC5maWx0ZXIoZGlydHlGaWxlQ2hhbmdlcywgYWN0aXZlUmVwb3NpdG9yeVNlbGVjdG9yKTtcbiAgICAgICAgc2hvd05vbkhnUmVwb3MgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpZmZNb2RlLlBVQkxJU0hfTU9ERTpcbiAgICAgICAgLy8gUHVibGlzaCBtb2RlIG9ubHkgc2hvd3MgdGhlIGNoYW5nZXMgb2YgdGhlIGFjdGl2ZSByZXBvc2l0b3J5LlxuICAgICAgICBzZWxlY3RlZEZpbGVDaGFuZ2VzID0gbWFwLmZpbHRlcihsYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcywgYWN0aXZlUmVwb3NpdG9yeVNlbGVjdG9yKTtcbiAgICAgICAgc2hvd05vbkhnUmVwb3MgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpZmZNb2RlLkJST1dTRV9NT0RFOlxuICAgICAgICAvLyBCcm9zd2UgbW9kZSBzaG93cyBhbGwgY2hhbmdlcyBmcm9tIGFsbCByZXBvc2l0b3JpZXMuXG4gICAgICAgIHNlbGVjdGVkRmlsZUNoYW5nZXMgPSBjb21taXRNZXJnZUZpbGVDaGFuZ2VzO1xuICAgICAgICBzaG93Tm9uSGdSZXBvcyA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlY29nbml6ZWQgdmlldyBtb2RlIScpO1xuICAgIH1cbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIGRpcnR5RmlsZUNoYW5nZXMsXG4gICAgICBjb21taXRNZXJnZUZpbGVDaGFuZ2VzLFxuICAgICAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMsXG4gICAgICBzZWxlY3RlZEZpbGVDaGFuZ2VzLFxuICAgICAgc2hvd05vbkhnUmVwb3MsXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhcbiAgICByZXBvc2l0b3J5U3RhY2s6IFJlcG9zaXRvcnlTdGFjayxcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICAgcmVsb2FkRmlsZURpZmZTdGF0ZTogYm9vbGVhbixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHJlcG9zaXRvcnlTdGFjayAhPT0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyYWNrKCdkaWZmLXZpZXctdXBkYXRlLXRpbWVsaW5lLXJldmlzaW9ucycsIHtcbiAgICAgIHJldmlzaW9uc0NvdW50OiBgJHtyZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMubGVuZ3RofWAsXG4gICAgfSk7XG4gICAgdGhpcy5fb25VcGRhdGVSZXZpc2lvbnNTdGF0ZShyZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGFjdGl2ZSBmaWxlLCBpZiBjaGFuZ2VkLlxuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaWYgKCFmaWxlUGF0aCB8fCAhcmVsb2FkRmlsZURpZmZTdGF0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlQWN0aXZlRmlsZURpZmYoKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVBY3RpdmVGaWxlRGlmZigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gQ2FwdHVyZSB0aGUgdmlldyBzdGF0ZSBiZWZvcmUgdGhlIHVwZGF0ZSBzdGFydHMuXG4gICAgY29uc3Qge3ZpZXdNb2RlLCBjb21taXRNb2RlfSA9IHRoaXMuX3N0YXRlO1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgIH0gPSBhd2FpdCB0aGlzLl9mZXRjaEZpbGVEaWZmKGZpbGVQYXRoKTtcbiAgICBpZiAoXG4gICAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUuZmlsZVBhdGggIT09IGZpbGVQYXRoIHx8XG4gICAgICB0aGlzLl9zdGF0ZS52aWV3TW9kZSAhPT0gdmlld01vZGUgfHxcbiAgICAgIHRoaXMuX3N0YXRlLmNvbW1pdE1vZGUgIT09IGNvbW1pdE1vZGVcbiAgICApIHtcbiAgICAgIC8vIFRoZSBzdGF0ZSBoYXZlIGNoYW5nZWQgc2luY2UgdGhlIHVwZGF0ZSBzdGFydGVkLCBhbmQgdGhlcmUgbXVzdCBiZSBhbm90aGVyXG4gICAgICAvLyBzY2hlZHVsZWQgdXBkYXRlLiBIZW5jZSwgd2UgcmV0dXJuIGVhcmx5IHRvIGFsbG93IGl0IHRvIGdvIHRocm91Z2guXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZTdGF0ZUlmQ2hhbmdlZChcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgKTtcbiAgfVxuXG4gIF9vblVwZGF0ZVJldmlzaW9uc1N0YXRlKHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG4gICAgdGhpcy5fbG9hZE1vZGVTdGF0ZSh0cnVlKTtcbiAgfVxuXG4gIHNldFB1Ymxpc2hNZXNzYWdlKHB1Ymxpc2hNZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0Q29tbWl0TWVzc2FnZShjb21taXRNZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIGNvbW1pdE1lc3NhZ2UsXG4gICAgfSk7XG4gIH1cblxuICBzZXRWaWV3TW9kZSh2aWV3TW9kZTogRGlmZk1vZGVUeXBlLCBsb2FkTW9kZVN0YXRlPzogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBpZiAodmlld01vZGUgPT09IHRoaXMuX3N0YXRlLnZpZXdNb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyYWNrKCdkaWZmLXZpZXctc3dpdGNoLW1vZGUnLCB7XG4gICAgICB2aWV3TW9kZSxcbiAgICB9KTtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHZpZXdNb2RlLFxuICAgIH0pO1xuICAgIHRoaXMuX3VwZGF0ZUNvbXBhcmVDaGFuZ2VkU3RhdHVzKCk7XG4gICAgaWYgKGxvYWRNb2RlU3RhdGUpIHtcbiAgICAgIHRoaXMuX2xvYWRNb2RlU3RhdGUoZmFsc2UpO1xuICAgIH1cbiAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlQWN0aXZlRmlsZURpZmYoKTtcbiAgfVxuXG4gIF9sb2FkTW9kZVN0YXRlKHJlc2V0U3RhdGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAocmVzZXRTdGF0ZSkge1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TWVzc2FnZTogbnVsbCxcbiAgICAgICAgcHVibGlzaE1lc3NhZ2U6IG51bGwsXG4gICAgICB9KTtcbiAgICB9XG4gICAgc3dpdGNoICh0aGlzLl9zdGF0ZS52aWV3TW9kZSkge1xuICAgICAgY2FzZSBEaWZmTW9kZS5DT01NSVRfTU9ERTpcbiAgICAgICAgdGhpcy5fbG9hZENvbW1pdE1vZGVTdGF0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlmZk1vZGUuUFVCTElTSF9NT0RFOlxuICAgICAgICB0aGlzLl9sb2FkUHVibGlzaE1vZGVTdGF0ZSgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfZmluZEZpbGVQYXRoVG9EaWZmSW5EaXJlY3RvcnkoZGlyZWN0b3J5UGF0aDogTnVjbGlkZVVyaSk6ID9zdHJpbmcge1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX2dldFJlcG9zaXRvcnlTdGFja0ZvclBhdGgoZGlyZWN0b3J5UGF0aCk7XG4gICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gcmVwb3NpdG9yeVN0YWNrLmdldFJlcG9zaXRvcnkoKTtcbiAgICBjb25zdCBwcm9qZWN0RGlyZWN0b3J5ID0gaGdSZXBvc2l0b3J5LmdldFByb2plY3REaXJlY3RvcnkoKTtcblxuICAgIGZ1bmN0aW9uIGdldE1hdGNoaW5nRmlsZUNoYW5nZShcbiAgICAgIGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4sXG4gICAgICBwYXJlbnRQYXRoOiBOdWNsaWRlVXJpLFxuICAgICk6ID9OdWNsaWRlVXJpIHtcbiAgICAgIHJldHVybiBmaWxlUGF0aHMuZmlsdGVyKGZpbGVQYXRoID0+IHJlbW90ZVVyaS5jb250YWlucyhwYXJlbnRQYXRoLCBmaWxlUGF0aCkpWzBdO1xuICAgIH1cbiAgICBjb25zdCBkaXJ0eUZpbGVQYXRocyA9IEFycmF5LmZyb20ocmVwb3NpdG9yeVN0YWNrLmdldERpcnR5RmlsZUNoYW5nZXMoKS5rZXlzKCkpO1xuICAgIC8vIFRyeSB0byBtYXRjaCBkaXJ0eSBmaWxlIGNoYW5nZXMgaW4gdGhlIHNlbGVjdGVkIGRpcmVjdG9yeSxcbiAgICAvLyBUaGVuIGxvb2t1cCBmb3IgY2hhbmdlcyBpbiB0aGUgcHJvamVjdCBkaXJlY3RvcnkuXG4gICAgY29uc3QgbWF0Y2hlZEZpbGVQYXRocyA9IFtcbiAgICAgIGdldE1hdGNoaW5nRmlsZUNoYW5nZShkaXJ0eUZpbGVQYXRocywgZGlyZWN0b3J5UGF0aCksXG4gICAgICBnZXRNYXRjaGluZ0ZpbGVDaGFuZ2UoZGlydHlGaWxlUGF0aHMsIHByb2plY3REaXJlY3RvcnkpLFxuICAgIF07XG4gICAgcmV0dXJuIG1hdGNoZWRGaWxlUGF0aHNbMF0gfHwgbWF0Y2hlZEZpbGVQYXRoc1sxXTtcbiAgfVxuXG4gIGRpZmZFbnRpdHkoZW50aXR5T3B0aW9uOiBEaWZmRW50aXR5T3B0aW9ucyk6IHZvaWQge1xuICAgIGxldCBkaWZmUGF0aCA9IG51bGw7XG4gICAgaWYgKGVudGl0eU9wdGlvbi5maWxlICE9IG51bGwpIHtcbiAgICAgIGRpZmZQYXRoID0gZW50aXR5T3B0aW9uLmZpbGU7XG4gICAgfSBlbHNlIGlmIChlbnRpdHlPcHRpb24uZGlyZWN0b3J5ICE9IG51bGwpIHtcbiAgICAgIGRpZmZQYXRoID0gdGhpcy5fZmluZEZpbGVQYXRoVG9EaWZmSW5EaXJlY3RvcnkoZW50aXR5T3B0aW9uLmRpcmVjdG9yeSk7XG4gICAgfVxuXG4gICAgaWYgKGRpZmZQYXRoID09IG51bGwpIHtcbiAgICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChlbnRpdHlPcHRpb24uZmlsZSB8fCBlbnRpdHlPcHRpb24uZGlyZWN0b3J5IHx8ICcnKTtcbiAgICAgIGlmIChcbiAgICAgICAgcmVwb3NpdG9yeSAhPSBudWxsICYmXG4gICAgICAgIHJlcG9zaXRvcnkuZ2V0VHlwZSgpID09PSAnaGcnICYmXG4gICAgICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuaGFzKChyZXBvc2l0b3J5OiBhbnkpKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuZ2V0KChyZXBvc2l0b3J5OiBhbnkpKTtcbiAgICAgICAgaW52YXJpYW50KHJlcG9zaXRvcnlTdGFjayk7XG4gICAgICAgIHRoaXMuX3NldEFjdGl2ZVJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5U3RhY2spO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPT0gbnVsbCkge1xuICAgICAgICAvLyBUaGlzIGNhbiBvbmx5IGhhcHBlbiBub25lIG9mIHRoZSBwcm9qZWN0IGZvbGRlcnMgYXJlIE1lcmN1cmlhbCByZXBvc2l0b3JpZXMuXG4gICAgICAgIC8vIEhvd2V2ZXIsIHRoaXMgaXMgY2F1Z2h0IGVhcmxpZXIgd2l0aCBhIGJldHRlciBlcnJvciBtZXNzYWdlLlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ05vIGFjdGl2ZSByZXBvc2l0b3J5IHN0YWNrIGFuZCBub24tZGlmZmFibGUgZW50aXR5OicgK1xuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGVudGl0eU9wdGlvbilcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldExvZ2dlcigpLmVycm9yKCdOb24gZGlmZmFibGUgZW50aXR5OicsIGVudGl0eU9wdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHt2aWV3TW9kZSwgY29tbWl0TW9kZX0gPSBlbnRpdHlPcHRpb247XG4gICAgaWYgKHZpZXdNb2RlICE9PSB0aGlzLl9zdGF0ZS52aWV3TW9kZSB8fCBjb21taXRNb2RlICE9PSB0aGlzLl9zdGF0ZS5jb21taXRNb2RlKSB7XG4gICAgICBpZiAodmlld01vZGUgPT09ICBEaWZmTW9kZS5DT01NSVRfTU9ERSkge1xuICAgICAgICBpbnZhcmlhbnQoY29tbWl0TW9kZSwgJ0RJRkY6IENvbW1pdCBNb2RlIG5vdCBzZXQhJyk7XG4gICAgICAgIHRoaXMuc2V0Vmlld01vZGUoRGlmZk1vZGUuQ09NTUlUX01PREUsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5zZXRDb21taXRNb2RlKGNvbW1pdE1vZGUsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fbG9hZE1vZGVTdGF0ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSBpZiAodmlld01vZGUpIHtcbiAgICAgICAgdGhpcy5zZXRWaWV3TW9kZSh2aWV3TW9kZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkaWZmUGF0aCAhPSBudWxsKSB7XG4gICAgICAvLyBEaWZmIHRoZSBmaWxlIGFmdGVyIHNldHRpbmcgdGhlIHZpZXcgbW9kZSB0byBjb21wYXJlIGFnYWluc3QgdGhlIHJpZ2h0IHRoaW5nLlxuICAgICAgdGhpcy5fZGlmZkZpbGVQYXRoKGRpZmZQYXRoKTtcbiAgICB9XG4gIH1cblxuXG4gIF9kaWZmRmlsZVBhdGgoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBpZiAoZmlsZVBhdGggPT09IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZS5maWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAvLyBUT0RPKG1vc3QpOiBTaG93IHByb2dyZXNzIGluZGljYXRvcjogdDg5OTE2NzZcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHtmaWxlfSA9IGJ1ZmZlcjtcbiAgICBpZiAoZmlsZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zLmFkZChmaWxlLm9uRGlkQ2hhbmdlKGRlYm91bmNlKFxuICAgICAgICAoKSA9PiB0aGlzLl9vbkRpZEZpbGVDaGFuZ2UoZmlsZVBhdGgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpLFxuICAgICAgICBGSUxFX0NIQU5HRV9ERUJPVU5DRV9NUyxcbiAgICAgICAgZmFsc2UsXG4gICAgICApKSk7XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuYWRkKGJ1ZmZlci5vbkRpZENoYW5nZU1vZGlmaWVkKFxuICAgICAgdGhpcy5lbWl0QWN0aXZlQnVmZmVyQ2hhbmdlTW9kaWZpZWQuYmluZCh0aGlzKSxcbiAgICApKTtcbiAgICAvLyBNb2RpZmllZCBldmVudHMgY291bGQgYmUgbGF0ZSB0aGF0IGl0IGRvZXNuJ3QgY2FwdHVyZSB0aGUgbGF0ZXN0IGVkaXRzLyBzdGF0ZSBjaGFuZ2VzLlxuICAgIC8vIEhlbmNlLCBpdCdzIHNhZmUgdG8gcmUtZW1pdCBjaGFuZ2VzIHdoZW4gc3RhYmxlIGZyb20gY2hhbmdlcy5cbiAgICB0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zLmFkZChidWZmZXIub25EaWRTdG9wQ2hhbmdpbmcoXG4gICAgICB0aGlzLmVtaXRBY3RpdmVCdWZmZXJDaGFuZ2VNb2RpZmllZC5iaW5kKHRoaXMpLFxuICAgICkpO1xuICAgIC8vIFVwZGF0ZSBgc2F2ZWRDb250ZW50c2Agb24gYnVmZmVyIHNhdmUgcmVxdWVzdHMuXG4gICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoYnVmZmVyLm9uV2lsbFNhdmUoXG4gICAgICAoKSA9PiB0aGlzLl9vbldpbGxTYXZlQWN0aXZlQnVmZmVyKGJ1ZmZlciksXG4gICAgKSk7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1vcGVuLWZpbGUnLCB7ZmlsZVBhdGh9KTtcbiAgICB0aGlzLl91cGRhdGVBY3RpdmVEaWZmU3RhdGUoZmlsZVBhdGgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmlsZS1jaGFuZ2UtdXBkYXRlJylcbiAgYXN5bmMgX29uRGlkRmlsZUNoYW5nZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVGaWxlU3RhdGUuZmlsZVBhdGggIT09IGZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpbGVzeXN0ZW1Db250ZW50cyA9IGF3YWl0IGdldEZpbGVTeXN0ZW1Db250ZW50cyhmaWxlUGF0aCk7XG4gICAgY29uc3Qge1xuICAgICAgb2xkQ29udGVudHM6IGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgY29tcGFyZVJldmlzaW9uSW5mbzogcmV2aXNpb25JbmZvLFxuICAgIH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaW52YXJpYW50KHJldmlzaW9uSW5mbywgJ0RpZmYgVmlldzogUmV2aXNpb24gaW5mbyBtdXN0IGJlIGRlZmluZWQgdG8gdXBkYXRlIGNoYW5nZWQgc3RhdGUnKTtcbiAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgICk7XG4gIH1cblxuICBlbWl0QWN0aXZlQnVmZmVyQ2hhbmdlTW9kaWZpZWQoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5UKTtcbiAgfVxuXG4gIG9uRGlkQWN0aXZlQnVmZmVyQ2hhbmdlTW9kaWZpZWQoXG4gICAgY2FsbGJhY2s6ICgpID0+IG1peGVkLFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQUNUSVZFX0JVRkZFUl9DSEFOR0VfTU9ESUZJRURfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGlzQWN0aXZlQnVmZmVyTW9kaWZpZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIHJldHVybiBidWZmZXIuaXNNb2RpZmllZCgpO1xuICB9XG5cbiAgX3VwZGF0ZURpZmZTdGF0ZUlmQ2hhbmdlZChcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb21taXR0ZWRDb250ZW50czogc3RyaW5nLFxuICAgIGZpbGVzeXN0ZW1Db250ZW50czogc3RyaW5nLFxuICAgIHJldmlzaW9uSW5mbzogUmV2aXNpb25JbmZvLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7XG4gICAgICBmaWxlUGF0aDogYWN0aXZlRmlsZVBhdGgsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgfSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBpZiAoZmlsZVBhdGggIT09IGFjdGl2ZUZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIGNvbnN0IHVwZGF0ZWREaWZmU3RhdGUgPSB7XG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICB9O1xuICAgIGludmFyaWFudChzYXZlZENvbnRlbnRzLCAnc2F2ZWRDb250ZW50cyBpcyBub3QgZGVmaW5lZCB3aGlsZSB1cGRhdGluZyBkaWZmIHN0YXRlIScpO1xuICAgIGlmIChzYXZlZENvbnRlbnRzID09PSBuZXdDb250ZW50cyB8fCBmaWxlc3lzdGVtQ29udGVudHMgPT09IG5ld0NvbnRlbnRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgdXBkYXRlZERpZmZTdGF0ZSxcbiAgICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgICk7XG4gICAgfVxuICAgIC8vIFRoZSB1c2VyIGhhdmUgZWRpdGVkIHNpbmNlIHRoZSBsYXN0IHVwZGF0ZS5cbiAgICBpZiAoZmlsZXN5c3RlbUNvbnRlbnRzID09PSBzYXZlZENvbnRlbnRzKSB7XG4gICAgICAvLyBUaGUgY2hhbmdlcyBoYXZlbid0IHRvdWNoZWQgdGhlIGZpbGVzeXN0ZW0sIGtlZXAgdXNlciBlZGl0cy5cbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICB7Li4udXBkYXRlZERpZmZTdGF0ZSwgZmlsZXN5c3RlbUNvbnRlbnRzOiBuZXdDb250ZW50c30sXG4gICAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgY29tbWl0dGVkIGFuZCBmaWxlc3lzdGVtIHN0YXRlIGhhdmUgY2hhbmdlZCwgbm90aWZ5IG9mIG92ZXJyaWRlLlxuICAgICAgbm90aWZ5RmlsZXN5c3RlbU92ZXJyaWRlVXNlckVkaXRzKGZpbGVQYXRoKTtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVEaWZmU3RhdGUoXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICB1cGRhdGVkRGlmZlN0YXRlLFxuICAgICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHNldE5ld0NvbnRlbnRzKG5ld0NvbnRlbnRzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoey4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSwgbmV3Q29udGVudHN9KTtcbiAgfVxuXG4gIHNldFJldmlzaW9uKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiB2b2lkIHtcbiAgICB0cmFjaygnZGlmZi12aWV3LXNldC1yZXZpc2lvbicpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaztcbiAgICBpbnZhcmlhbnQocmVwb3NpdG9yeVN0YWNrLCAnVGhlcmUgbXVzdCBiZSBhbiBhY3RpdmUgcmVwb3NpdG9yeSBzdGFjayEnKTtcbiAgICB0aGlzLl9hY3RpdmVGaWxlU3RhdGUgPSB7Li4udGhpcy5fYWN0aXZlRmlsZVN0YXRlLCBjb21wYXJlUmV2aXNpb25JbmZvOiByZXZpc2lvbn07XG4gICAgcmVwb3NpdG9yeVN0YWNrLnNldFJldmlzaW9uKHJldmlzaW9uKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIGdldEFjdGl2ZUZpbGVTdGF0ZSgpOiBGaWxlQ2hhbmdlU3RhdGUge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gIH1cblxuICBnZXRQdWJsaXNoVXBkYXRlcygpOiBSeC5TdWJqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5fcHVibGlzaFVwZGF0ZXM7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlQWN0aXZlRGlmZlN0YXRlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaWxlRGlmZlN0YXRlID0gYXdhaXQgdGhpcy5fZmV0Y2hGaWxlRGlmZihmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBmaWxlRGlmZlN0YXRlLFxuICAgICAgZmlsZURpZmZTdGF0ZS5maWxlc3lzdGVtQ29udGVudHMsXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVEaWZmU3RhdGUoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgZmlsZURpZmZTdGF0ZTogRmlsZURpZmZTdGF0ZSxcbiAgICBzYXZlZENvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzOiBvbGRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50czogbmV3Q29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfSA9IGZpbGVEaWZmU3RhdGU7XG4gICAgY29uc3Qge2hhc2gsIGJvb2ttYXJrc30gPSByZXZpc2lvbkluZm87XG4gICAgY29uc3QgbmV3RmlsZVN0YXRlID0ge1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRDb250ZW50cyxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgIGNvbXBhcmVSZXZpc2lvbkluZm86IHJldmlzaW9uSW5mbyxcbiAgICAgIGZyb21SZXZpc2lvblRpdGxlOiBgJHtoYXNofWAgKyAoYm9va21hcmtzLmxlbmd0aCA9PT0gMCA/ICcnIDogYCAtICgke2Jvb2ttYXJrcy5qb2luKCcsICcpfSlgKSxcbiAgICAgIHRvUmV2aXNpb25UaXRsZTogJ0ZpbGVzeXN0ZW0gLyBFZGl0b3InLFxuICAgIH07XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKG5ld0ZpbGVTdGF0ZSk7XG4gICAgLy8gVE9ETyhtb3N0KTogRml4OiB0aGlzIGFzc3VtZXMgdGhhdCB0aGUgZWRpdG9yIGNvbnRlbnRzIGFyZW4ndCBjaGFuZ2VkIHdoaWxlXG4gICAgLy8gZmV0Y2hpbmcgdGhlIGNvbW1lbnRzLCB0aGF0J3Mgb2theSBub3cgYmVjYXVzZSB3ZSBkb24ndCBmZXRjaCB0aGVtLlxuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZUlubGluZUNvbXBvbmVudHMoKTtcbiAgfVxuXG4gIF9zZXRBY3RpdmVGaWxlU3RhdGUoc3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQsIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5oZy1zdGF0ZS11cGRhdGUnKVxuICBhc3luYyBfZmV0Y2hGaWxlRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8RmlsZURpZmZTdGF0ZT4ge1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX2dldFJlcG9zaXRvcnlTdGFja0ZvclBhdGgoZmlsZVBhdGgpO1xuICAgIGNvbnN0IFtoZ0RpZmZdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmZldGNoSGdEaWZmKGZpbGVQYXRoLCB2aWV3TW9kZVRvRGlmZk9wdGlvbih0aGlzLl9zdGF0ZS52aWV3TW9kZSkpLFxuICAgICAgdGhpcy5fc2V0QWN0aXZlUmVwb3NpdG9yeVN0YWNrKHJlcG9zaXRvcnlTdGFjayksXG4gICAgXSk7XG4gICAgLy8gSW50ZW50aW9uYWxseSBmZXRjaCB0aGUgZmlsZXN5c3RlbSBjb250ZW50cyBhZnRlciBnZXR0aW5nIHRoZSBjb21taXR0ZWQgY29udGVudHNcbiAgICAvLyB0byBtYWtlIHN1cmUgd2UgaGF2ZSB0aGUgbGF0ZXN0IGZpbGVzeXN0ZW0gdmVyc2lvbi5cbiAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBsb2FkQnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uaGdEaWZmLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzOiBidWZmZXIuZ2V0VGV4dCgpLFxuICAgIH07XG4gIH1cblxuICBfZ2V0UmVwb3NpdG9yeVN0YWNrRm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFJlcG9zaXRvcnlTdGFjayB7XG4gICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gaGdSZXBvc2l0b3J5Rm9yUGF0aChmaWxlUGF0aCk7XG4gICAgY29uc3QgcmVwb3NpdG9yeVN0YWNrID0gdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5nZXQoaGdSZXBvc2l0b3J5KTtcbiAgICBpbnZhcmlhbnQocmVwb3NpdG9yeVN0YWNrLCAnVGhlcmUgbXVzdCBiZSBhbiByZXBvc2l0b3J5IHN0YWNrIGZvciBhIGdpdmVuIHJlcG9zaXRvcnkhJyk7XG4gICAgcmV0dXJuIHJlcG9zaXRvcnlTdGFjaztcbiAgfVxuXG4gIGFzeW5jIF9zZXRBY3RpdmVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeVN0YWNrOiBSZXBvc2l0b3J5U3RhY2spOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09PSByZXBvc2l0b3J5U3RhY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID0gcmVwb3NpdG9yeVN0YWNrO1xuICAgIGlmICghdGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCByZXBvc2l0b3J5U3RhY2suZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgdGhpcy5fdXBkYXRlQ2hhbmdlZFJldmlzaW9ucyhyZXBvc2l0b3J5U3RhY2ssIHJldmlzaW9uc1N0YXRlLCBmYWxzZSk7XG4gIH1cblxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnNhdmUtZmlsZScpXG4gIHNhdmVBY3RpdmVGaWxlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1zYXZlLWZpbGUnLCB7ZmlsZVBhdGh9KTtcbiAgICByZXR1cm4gdGhpcy5fc2F2ZUZpbGUoZmlsZVBhdGgpLmNhdGNoKG5vdGlmeUludGVybmFsRXJyb3IpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcucHVibGlzaC1kaWZmJylcbiAgYXN5bmMgcHVibGlzaERpZmYocHVibGlzaE1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgcHVibGlzaE1lc3NhZ2UsXG4gICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLkFXQUlUSU5HX1BVQkxJU0gsXG4gICAgfSk7XG4gICAgY29uc3Qge3B1Ymxpc2hNb2RlfSA9IHRoaXMuX3N0YXRlO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctcHVibGlzaCcsIHtcbiAgICAgIHB1Ymxpc2hNb2RlLFxuICAgIH0pO1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBwdWJsaXNoTW9kZSA9PT0gUHVibGlzaE1vZGUuQ1JFQVRFID8gcHVibGlzaE1lc3NhZ2UgOiBudWxsO1xuICAgIGNvbnN0IGNsZWFuUmVzdWx0ID0gYXdhaXQgdGhpcy5fcHJvbXB0VG9DbGVhbkRpcnR5Q2hhbmdlcyhjb21taXRNZXNzYWdlKTtcbiAgICBpZiAoY2xlYW5SZXN1bHQgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5SRUFEWSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7YW1lbmRlZCwgYWxsb3dVbnRyYWNrZWR9ID0gY2xlYW5SZXN1bHQ7XG4gICAgdHJ5IHtcbiAgICAgIHN3aXRjaCAocHVibGlzaE1vZGUpIHtcbiAgICAgICAgY2FzZSBQdWJsaXNoTW9kZS5DUkVBVEU6XG4gICAgICAgICAgLy8gQ3JlYXRlIHVzZXMgYHZlcmJhdGltYCBhbmQgYG5gIGFuc3dlciBidWZmZXJcbiAgICAgICAgICAvLyBhbmQgdGhhdCBpbXBsaWVzIHRoYXQgdW50cmFja2VkIGZpbGVzIHdpbGwgYmUgaWdub3JlZC5cbiAgICAgICAgICBjb25zdCBjcmVhdGVkUGhhYnJpY2F0b3JSZXZpc2lvbiA9IGF3YWl0IHRoaXMuX2NyZWF0ZVBoYWJyaWNhdG9yUmV2aXNpb24oXG4gICAgICAgICAgICBwdWJsaXNoTWVzc2FnZSxcbiAgICAgICAgICAgIGFtZW5kZWQsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBub3RpZnlSZXZpc2lvblN0YXR1cyhjcmVhdGVkUGhhYnJpY2F0b3JSZXZpc2lvbiwgJ2NyZWF0ZWQnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQdWJsaXNoTW9kZS5VUERBVEU6XG4gICAgICAgICAgY29uc3QgdXBkYXRlZFBoYWJyaWNhdG9yUmV2aXNpb24gPSBhd2FpdCB0aGlzLl91cGRhdGVQaGFicmljYXRvclJldmlzaW9uKFxuICAgICAgICAgICAgcHVibGlzaE1lc3NhZ2UsXG4gICAgICAgICAgICBhbGxvd1VudHJhY2tlZCxcbiAgICAgICAgICApO1xuICAgICAgICAgIG5vdGlmeVJldmlzaW9uU3RhdHVzKHVwZGF0ZWRQaGFicmljYXRvclJldmlzaW9uLCAndXBkYXRlZCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwdWJsaXNoIG1vZGUgJyR7cHVibGlzaE1vZGV9J2ApO1xuICAgICAgfVxuICAgICAgLy8gV2FpdCBhIGJpdCB1bnRpbCB0aGUgdXNlciBzZWVzIHRoZSBzdWNjZXNzIHB1c2ggbWVzc2FnZS5cbiAgICAgIGF3YWl0IHByb21pc2VzLmF3YWl0TWlsbGlTZWNvbmRzKDIwMDApO1xuICAgICAgLy8gUG9wdWxhdGUgUHVibGlzaCBVSSB3aXRoIHRoZSBtb3N0IHJlY2VudCBkYXRhIGFmdGVyIGEgc3VjY2Vzc2Z1bCBwdXNoLlxuICAgICAgdGhpcy5fbG9hZE1vZGVTdGF0ZSh0cnVlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbm90aWZ5SW50ZXJuYWxFcnJvcihlcnJvciwgdHJ1ZSAvKnBlcnNpc3QgdGhlIGVycm9yICh1c2VyIGRpc21pc3NhYmxlKSovKTtcbiAgICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICAgIHB1Ymxpc2hNb2RlU3RhdGU6IFB1Ymxpc2hNb2RlU3RhdGUuUFVCTElTSF9FUlJPUixcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9wcm9tcHRUb0NsZWFuRGlydHlDaGFuZ2VzKFxuICAgIGNvbW1pdE1lc3NhZ2U6ID9zdHJpbmcsXG4gICk6IFByb21pc2U8P3thbGxvd1VudHJhY2tlZDogYm9vbGVhbjsgYW1lbmRlZDogYm9vbGVhbjt9PiB7XG4gICAgY29uc3QgYWN0aXZlU3RhY2sgPSB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2s7XG4gICAgaW52YXJpYW50KGFjdGl2ZVN0YWNrICE9IG51bGwsICdObyBhY3RpdmUgcmVwb3NpdG9yeSBzdGFjayB3aGVuIGNsZWFuaW5nIGRpcnR5IGNoYW5nZXMnKTtcbiAgICBjb25zdCBkaXJ0eUZpbGVDaGFuZ2VzID0gYWN0aXZlU3RhY2suZ2V0RGlydHlGaWxlQ2hhbmdlcygpO1xuICAgIGxldCBzaG91bGRBbWVuZCA9IGZhbHNlO1xuICAgIGxldCBhbWVuZGVkID0gZmFsc2U7XG4gICAgbGV0IGFsbG93VW50cmFja2VkID0gZmFsc2U7XG4gICAgaWYgKGRpcnR5RmlsZUNoYW5nZXMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYW1lbmRlZCxcbiAgICAgICAgYWxsb3dVbnRyYWNrZWQsXG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCB1bnRyYWNrZWRDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiA9IG5ldyBNYXAoXG4gICAgICBBcnJheS5mcm9tKGRpcnR5RmlsZUNoYW5nZXMuZW50cmllcygpKVxuICAgICAgICAuZmlsdGVyKGZpbGVDaGFuZ2UgPT4gZmlsZUNoYW5nZVsxXSA9PT0gRmlsZUNoYW5nZVN0YXR1cy5VTlRSQUNLRUQpXG4gICAgKTtcbiAgICBpZiAodW50cmFja2VkQ2hhbmdlcy5zaXplID4gMCkge1xuICAgICAgY29uc3QgdW50cmFja2VkQ2hvaWNlID0gYXRvbS5jb25maXJtKHtcbiAgICAgICAgbWVzc2FnZTogJ1lvdSBoYXZlIHVudHJhY2tlZCBmaWxlcyBpbiB5b3VyIHdvcmtpbmcgY29weTonLFxuICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IGdldEZpbGVTdGF0dXNMaXN0TWVzc2FnZSh1bnRyYWNrZWRDaGFuZ2VzKSxcbiAgICAgICAgYnV0dG9uczogWydDYW5jZWwnLCAnQWRkJywgJ0FsbG93IFVudHJhY2tlZCddLFxuICAgICAgfSk7XG4gICAgICBnZXRMb2dnZXIoKS5pbmZvKCdVbnRyYWNrZWQgY2hhbmdlcyBjaG9pY2U6JywgdW50cmFja2VkQ2hvaWNlKTtcbiAgICAgIGlmICh1bnRyYWNrZWRDaG9pY2UgPT09IDApIC8qQ2FuY2VsKi8ge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodW50cmFja2VkQ2hvaWNlID09PSAxKSAvKkFkZCovIHtcbiAgICAgICAgYXdhaXQgYWN0aXZlU3RhY2suYWRkKEFycmF5LmZyb20odW50cmFja2VkQ2hhbmdlcy5rZXlzKCkpKTtcbiAgICAgICAgc2hvdWxkQW1lbmQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh1bnRyYWNrZWRDaG9pY2UgPT09IDIpIC8qQWxsb3cgVW50cmFja2VkKi8ge1xuICAgICAgICBhbGxvd1VudHJhY2tlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJldmVydGFibGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiA9IG5ldyBNYXAoXG4gICAgICBBcnJheS5mcm9tKGRpcnR5RmlsZUNoYW5nZXMuZW50cmllcygpKVxuICAgICAgICAuZmlsdGVyKGZpbGVDaGFuZ2UgPT4gZmlsZUNoYW5nZVsxXSAhPT0gRmlsZUNoYW5nZVN0YXR1cy5VTlRSQUNLRUQpXG4gICAgKTtcbiAgICBpZiAocmV2ZXJ0YWJsZUNoYW5nZXMuc2l6ZSA+IDApIHtcbiAgICAgIGNvbnN0IGNsZWFuQ2hvaWNlID0gYXRvbS5jb25maXJtKHtcbiAgICAgICAgbWVzc2FnZTogJ1lvdSBoYXZlIHVuY29tbWl0dGVkIGNoYW5nZXMgaW4geW91ciB3b3JraW5nIGNvcHk6JyxcbiAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBnZXRGaWxlU3RhdHVzTGlzdE1lc3NhZ2UocmV2ZXJ0YWJsZUNoYW5nZXMpLFxuICAgICAgICBidXR0b25zOiBbJ0NhbmNlbCcsICdSZXZlcnQnLCAnQW1lbmQnXSxcbiAgICAgIH0pO1xuICAgICAgZ2V0TG9nZ2VyKCkuaW5mbygnRGlydHkgY2hhbmdlcyBjbGVhbiBjaG9pY2U6JywgY2xlYW5DaG9pY2UpO1xuICAgICAgaWYgKGNsZWFuQ2hvaWNlID09PSAwKSAvKkNhbmNlbCovIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2UgaWYgKGNsZWFuQ2hvaWNlID09PSAxKSAvKlJldmVydCovIHtcbiAgICAgICAgY29uc3QgY2FuUmV2ZXJ0RmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPiA9XG4gICAgICAgICAgQXJyYXkuZnJvbShkaXJ0eUZpbGVDaGFuZ2VzLmVudHJpZXMoKSlcbiAgICAgICAgICAuZmlsdGVyKGZpbGVDaGFuZ2UgPT4gZmlsZUNoYW5nZVsxXSAhPT0gRmlsZUNoYW5nZVN0YXR1cy5VTlRSQUNLRUQpXG4gICAgICAgICAgLm1hcChmaWxlQ2hhbmdlID0+IGZpbGVDaGFuZ2VbMF0pO1xuICAgICAgICBhd2FpdCBhY3RpdmVTdGFjay5yZXZlcnQoY2FuUmV2ZXJ0RmlsZVBhdGhzKTtcbiAgICAgIH0gZWxzZSBpZiAoY2xlYW5DaG9pY2UgPT09IDIpIC8qQW1lbmQqLyB7XG4gICAgICAgIHNob3VsZEFtZW5kID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNob3VsZEFtZW5kKSB7XG4gICAgICBhd2FpdCBhY3RpdmVTdGFjay5hbWVuZChjb21taXRNZXNzYWdlKTtcbiAgICAgIGFtZW5kZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgYW1lbmRlZCxcbiAgICAgIGFsbG93VW50cmFja2VkLFxuICAgIH07XG4gIH1cblxuICBfZ2V0QXJjYW5pc3RGaWxlUGF0aCgpOiBzdHJpbmcge1xuICAgIGxldCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGlmIChmaWxlUGF0aCA9PT0gJycgJiYgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrICE9IG51bGwpIHtcbiAgICAgIGZpbGVQYXRoID0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmdldFJlcG9zaXRvcnkoKS5nZXRQcm9qZWN0RGlyZWN0b3J5KCk7XG4gICAgfVxuICAgIHJldHVybiBmaWxlUGF0aDtcbiAgfVxuXG4gIGFzeW5jIF9jcmVhdGVQaGFicmljYXRvclJldmlzaW9uKFxuICAgIHB1Ymxpc2hNZXNzYWdlOiBzdHJpbmcsXG4gICAgYW1lbmRlZDogYm9vbGVhbixcbiAgKTogUHJvbWlzZTw/UGhhYnJpY2F0b3JSZXZpc2lvbkluZm8+IHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMuX2dldEFyY2FuaXN0RmlsZVBhdGgoKTtcbiAgICBjb25zdCBsYXN0Q29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2xvYWRBY3RpdmVSZXBvc2l0b3J5TGF0ZXN0Q29tbWl0TWVzc2FnZSgpO1xuICAgIGNvbnN0IGFjdGl2ZVJlcG9zaXRvcnlTdGFjayA9IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaztcbiAgICBpbnZhcmlhbnQoYWN0aXZlUmVwb3NpdG9yeVN0YWNrLCAnTm8gYWN0aXZlIHJlcG9zaXRvcnkgc3RhY2snKTtcbiAgICBpZiAoIWFtZW5kZWQgJiYgcHVibGlzaE1lc3NhZ2UgIT09IGxhc3RDb21taXRNZXNzYWdlKSB7XG4gICAgICBnZXRMb2dnZXIoKS5pbmZvKCdBbWVuZGluZyBjb21taXQgd2l0aCB0aGUgdXBkYXRlZCBtZXNzYWdlJyk7XG4gICAgICBhd2FpdCBhY3RpdmVSZXBvc2l0b3J5U3RhY2suYW1lbmQocHVibGlzaE1lc3NhZ2UpO1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ0NvbW1pdCBhbWVuZGVkIHdpdGggdGhlIHVwZGF0ZWQgbWVzc2FnZScpO1xuICAgIH1cblxuICAgIHRoaXMuX3B1Ymxpc2hVcGRhdGVzLm5leHQoe2xldmVsOiAnbG9nJywgdGV4dDogJ0NyZWF0aW5nIG5ldyByZXZpc2lvbi4uLlxcbid9KTtcbiAgICBjb25zdCBzdHJlYW0gPSBhcmNhbmlzdC5jcmVhdGVQaGFicmljYXRvclJldmlzaW9uKGZpbGVQYXRoKTtcbiAgICBhd2FpdCB0aGlzLl9wcm9jZXNzQXJjYW5pc3RPdXRwdXQoc3RyZWFtKTtcbiAgICAvLyBJbnZhbGlkYXRlIHRoZSBjdXJyZW50IHJldmlzaW9ucyBzdGF0ZSBiZWNhdXNlIHRoZSBjdXJyZW50IGNvbW1pdCBpbmZvIGhhcyBjaGFuZ2VkLlxuICAgIGFjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICBjb25zdCB7cGhhYnJpY2F0b3JSZXZpc2lvbn0gID0gYXdhaXQgdGhpcy5fZ2V0QWN0aXZlSGVhZFJldmlzaW9uRGV0YWlscygpO1xuICAgIHJldHVybiBwaGFicmljYXRvclJldmlzaW9uO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZVBoYWJyaWNhdG9yUmV2aXNpb24oXG4gICAgcHVibGlzaE1lc3NhZ2U6IHN0cmluZyxcbiAgICBhbGxvd1VudHJhY2tlZDogYm9vbGVhbixcbiAgKTogUHJvbWlzZTxQaGFicmljYXRvclJldmlzaW9uSW5mbz4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gdGhpcy5fZ2V0QXJjYW5pc3RGaWxlUGF0aCgpO1xuICAgIGNvbnN0IHtwaGFicmljYXRvclJldmlzaW9ufSA9IGF3YWl0IHRoaXMuX2dldEFjdGl2ZUhlYWRSZXZpc2lvbkRldGFpbHMoKTtcbiAgICBpbnZhcmlhbnQocGhhYnJpY2F0b3JSZXZpc2lvbiAhPSBudWxsLCAnQSBwaGFicmljYXRvciByZXZpc2lvbiBtdXN0IGV4aXN0IHRvIHVwZGF0ZSEnKTtcbiAgICBjb25zdCB1cGRhdGVUZW1wbGF0ZSA9IGdldFJldmlzaW9uVXBkYXRlTWVzc2FnZShwaGFicmljYXRvclJldmlzaW9uKS50cmltKCk7XG4gICAgY29uc3QgdXNlclVwZGF0ZU1lc3NhZ2UgPSBwdWJsaXNoTWVzc2FnZS5yZXBsYWNlKHVwZGF0ZVRlbXBsYXRlLCAnJykudHJpbSgpO1xuICAgIGlmICh1c2VyVXBkYXRlTWVzc2FnZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHVwZGF0ZSByZXZpc2lvbiB3aXRoIGVtcHR5IG1lc3NhZ2UnKTtcbiAgICB9XG5cbiAgICB0aGlzLl9wdWJsaXNoVXBkYXRlcy5uZXh0KHtcbiAgICAgIGxldmVsOiAnbG9nJyxcbiAgICAgIHRleHQ6IGBVcGRhdGluZyByZXZpc2lvbiBcXGAke3BoYWJyaWNhdG9yUmV2aXNpb24uaWR9XFxgLi4uXFxuYCxcbiAgICB9KTtcbiAgICBjb25zdCBzdHJlYW0gPSBhcmNhbmlzdC51cGRhdGVQaGFicmljYXRvclJldmlzaW9uKGZpbGVQYXRoLCB1c2VyVXBkYXRlTWVzc2FnZSwgYWxsb3dVbnRyYWNrZWQpO1xuICAgIGF3YWl0IHRoaXMuX3Byb2Nlc3NBcmNhbmlzdE91dHB1dChzdHJlYW0pO1xuICAgIHJldHVybiBwaGFicmljYXRvclJldmlzaW9uO1xuICB9XG5cbiAgYXN5bmMgX3Byb2Nlc3NBcmNhbmlzdE91dHB1dChzdHJlYW06IFJ4Lk9ic2VydmFibGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBzdHJlYW0gPSBzdHJlYW1cbiAgICAgIC8vIFNwbGl0IHN0cmVhbSBpbnRvIHNpbmdsZSBsaW5lcy5cbiAgICAgIC5mbGF0TWFwKChtZXNzYWdlOiB7c3RkZXJyPzogc3RyaW5nOyBzdGRvdXQ/OiBzdHJpbmd9KSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgZmQgb2YgWydzdGRlcnInLCAnc3Rkb3V0J10pIHtcbiAgICAgICAgICBsZXQgb3V0ID0gbWVzc2FnZVtmZF07XG4gICAgICAgICAgaWYgKG91dCAhPSBudWxsKSB7XG4gICAgICAgICAgICBvdXQgPSBvdXQucmVwbGFjZSgvXFxuJC8sICcnKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBvdXQuc3BsaXQoJ1xcbicpKSB7XG4gICAgICAgICAgICAgIGxpbmVzLnB1c2goe1tmZF06IGxpbmV9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmVzO1xuICAgICAgfSlcbiAgICAgIC8vIFVucGFjayBKU09OXG4gICAgICAuZmxhdE1hcCgobWVzc2FnZToge3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nfSkgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBtZXNzYWdlLnN0ZG91dDtcbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBbXTtcbiAgICAgICAgaWYgKHN0ZG91dCAhPSBudWxsKSB7XG4gICAgICAgICAgbGV0IGRlY29kZWRKU09OID0gbnVsbDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGVjb2RlZEpTT04gPSBKU09OLnBhcnNlKHN0ZG91dCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKHt0eXBlOiAncGh1dGlsOm91dCcsIG1lc3NhZ2U6IHN0ZG91dCArICdcXG4nfSk7XG4gICAgICAgICAgICBnZXRMb2dnZXIoKS5lcnJvcignSW52YWxpZCBKU09OIGVuY291bnRlcmVkOiAnICsgc3Rkb3V0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGRlY29kZWRKU09OICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goZGVjb2RlZEpTT04pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWVzc2FnZS5zdGRlcnIgIT0gbnVsbCkge1xuICAgICAgICAgIG1lc3NhZ2VzLnB1c2goe3R5cGU6ICdwaHV0aWw6ZXJyJywgbWVzc2FnZTogbWVzc2FnZS5zdGRlcnIgKyAnXFxuJ30pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXNzYWdlcztcbiAgICAgIH0pXG4gICAgICAvLyBQcm9jZXNzIG1lc3NhZ2UgdHlwZS5cbiAgICAgIC5mbGF0TWFwKChkZWNvZGVkSlNPTjoge3R5cGU6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nfSkgPT4ge1xuICAgICAgICBjb25zdCBtZXNzYWdlcyA9IFtdO1xuICAgICAgICBzd2l0Y2ggKGRlY29kZWRKU09OLnR5cGUpIHtcbiAgICAgICAgICBjYXNlICdwaHV0aWw6b3V0JzpcbiAgICAgICAgICBjYXNlICdwaHV0aWw6b3V0OnJhdyc6XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKHtsZXZlbDogJ2xvZycsIHRleHQ6IGRlY29kZWRKU09OLm1lc3NhZ2V9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3BodXRpbDplcnInOlxuICAgICAgICAgICAgbWVzc2FnZXMucHVzaCh7bGV2ZWw6ICdlcnJvcicsIHRleHQ6IGRlY29kZWRKU09OLm1lc3NhZ2V9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihkZWNvZGVkSlNPTi5tZXNzYWdlKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZ2V0TG9nZ2VyKCkuaW5mbyhcbiAgICAgICAgICAgICAgJ1VuaGFuZGxlZCBtZXNzYWdlIHR5cGU6JyxcbiAgICAgICAgICAgICAgZGVjb2RlZEpTT04udHlwZSxcbiAgICAgICAgICAgICAgJ01lc3NhZ2UgcGF5bG9hZDonLFxuICAgICAgICAgICAgICBkZWNvZGVkSlNPTi5tZXNzYWdlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXNzYWdlcztcbiAgICAgIH0pXG4gICAgICAvLyBTcGxpdCBtZXNzYWdlcyBvbiBuZXcgbGluZSBjaGFyYWN0ZXJzLlxuICAgICAgLmZsYXRNYXAoKG1lc3NhZ2U6IHtsZXZlbDogc3RyaW5nOyB0ZXh0OiBzdHJpbmd9KSA9PiB7XG4gICAgICAgIGNvbnN0IHNwbGl0TWVzc2FnZXMgPSBbXTtcbiAgICAgICAgLy8gU3BsaXQgb24gbmV3bGluZXMgd2l0aG91dCByZW1vdmluZyBuZXcgbGluZSBjaGFyYWN0ZXJzLiAgVGhpcyB3aWxsIHJlbW92ZSBlbXB0eVxuICAgICAgICAvLyBzdHJpbmdzIGJ1dCB0aGF0J3MgT0suXG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiBtZXNzYWdlLnRleHQuc3BsaXQoL14vbSkpIHtcbiAgICAgICAgICBzcGxpdE1lc3NhZ2VzLnB1c2goe2xldmVsOiBtZXNzYWdlLmxldmVsLCB0ZXh0OiBwYXJ0fSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNwbGl0TWVzc2FnZXM7XG4gICAgICB9KTtcbiAgICBjb25zdCBsZXZlbFN0cmVhbXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGxldmVsIG9mIFsnbG9nJywgJ2Vycm9yJ10pIHtcbiAgICAgIGNvbnN0IGxldmVsU3RyZWFtID0gc3RyZWFtXG4gICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgKG1lc3NhZ2U6IHtsZXZlbDogc3RyaW5nOyB0ZXh0OiBzdHJpbmd9KSA9PiBtZXNzYWdlLmxldmVsID09PSBsZXZlbFxuICAgICAgICApXG4gICAgICAgIC5zaGFyZSgpO1xuICAgICAgbGV2ZWxTdHJlYW1zLnB1c2goYnVmZmVyVW50aWwobGV2ZWxTdHJlYW0sIG1lc3NhZ2UgPT4gbWVzc2FnZS50ZXh0LmVuZHNXaXRoKCdcXG4nKSkpO1xuICAgIH1cbiAgICBhd2FpdCBSeC5PYnNlcnZhYmxlLm1lcmdlKC4uLmxldmVsU3RyZWFtcylcbiAgICAgIC5kbyhcbiAgICAgICAgKG1lc3NhZ2VzOiBBcnJheTx7bGV2ZWw6IHN0cmluZzsgdGV4dDogc3RyaW5nfT4pID0+IHtcbiAgICAgICAgICBpZiAobWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5fcHVibGlzaFVwZGF0ZXMubmV4dCh7XG4gICAgICAgICAgICAgIGxldmVsOiBtZXNzYWdlc1swXS5sZXZlbCxcbiAgICAgICAgICAgICAgdGV4dDogbWVzc2FnZXMubWFwKG1lc3NhZ2UgPT4gbWVzc2FnZS50ZXh0KS5qb2luKCcnKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIClcbiAgICAgIC50b1Byb21pc2UoKTtcbiAgfVxuXG4gIF9vbldpbGxTYXZlQWN0aXZlQnVmZmVyKGJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSxcbiAgICAgIHNhdmVkQ29udGVudHM6IGJ1ZmZlci5nZXRUZXh0KCksXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfc2F2ZUZpbGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIGlmIChidWZmZXIgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBmaWxlIGJ1ZmZlciB0byBzYXZlOiBcXGAke2ZpbGVQYXRofVxcYGApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYnVmZmVyLnNhdmUoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHNhdmUgZmlsZSBidWZmZXI6IFxcYCR7ZmlsZVBhdGh9XFxgIC0gJHtlcnIudG9TdHJpbmcoKX1gKTtcbiAgICB9XG4gIH1cblxuICBvbkRpZFVwZGF0ZVN0YXRlKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihESURfVVBEQVRFX1NUQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvblJldmlzaW9uc1VwZGF0ZShjYWxsYmFjazogKHN0YXRlOiA/UmV2aXNpb25zU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25BY3RpdmVGaWxlVXBkYXRlcyhjYWxsYmFjazogKHN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlSW5saW5lQ29tcG9uZW50cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaW5saW5lQ29tcG9uZW50cyA9IGF3YWl0IHRoaXMuX2ZldGNoSW5saW5lQ29tcG9uZW50cyhmaWxlUGF0aCk7XG4gICAgaWYgKGZpbGVQYXRoICE9PSB0aGlzLl9hY3RpdmVGaWxlU3RhdGUuZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHsuLi50aGlzLl9hY3RpdmVGaWxlU3RhdGUsIGlubGluZUNvbXBvbmVudHN9KTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZldGNoLWNvbW1lbnRzJylcbiAgYXN5bmMgX2ZldGNoSW5saW5lQ29tcG9uZW50cyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8QXJyYXk8VUlFbGVtZW50Pj4ge1xuICAgIC8vIFRPRE8obW9zdCk6IEZpeCBVSSByZW5kZXJpbmcgYW5kIHJlLWludHJvZHVjZTogdDgxNzQzMzJcbiAgICAvLyBwcm92aWRlci5jb21wb3NlVWlFbGVtZW50cyhmaWxlUGF0aClcbiAgICBjb25zdCB1aUVsZW1lbnRQcm9taXNlcyA9IHRoaXMuX3VpUHJvdmlkZXJzLm1hcChcbiAgICAgIHByb3ZpZGVyID0+IFByb21pc2UucmVzb2x2ZShbXSksXG4gICAgKTtcbiAgICBjb25zdCB1aUNvbXBvbmVudExpc3RzID0gYXdhaXQgUHJvbWlzZS5hbGwodWlFbGVtZW50UHJvbWlzZXMpO1xuICAgIC8vIEZsYXR0ZW4gdWlDb21wb25lbnRMaXN0cyBmcm9tIGxpc3Qgb2YgbGlzdHMgb2YgY29tcG9uZW50cyB0byBhIGxpc3Qgb2YgY29tcG9uZW50cy5cbiAgICBjb25zdCB1aUNvbXBvbmVudHMgPSBbXS5jb25jYXQuYXBwbHkoW10sIHVpQ29tcG9uZW50TGlzdHMpO1xuICAgIHJldHVybiB1aUNvbXBvbmVudHM7XG4gIH1cblxuICBzZXRVaVByb3ZpZGVycyh1aVByb3ZpZGVyczogQXJyYXk8VUlQcm92aWRlcj4pOiB2b2lkIHtcbiAgICB0aGlzLl91aVByb3ZpZGVycyA9IHVpUHJvdmlkZXJzO1xuICAgIHRoaXMuX3VwZGF0ZUlubGluZUNvbXBvbmVudHMoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIGFzeW5jIF9sb2FkQ29tbWl0TW9kZVN0YXRlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuTE9BRElOR19DT01NSVRfTUVTU0FHRSxcbiAgICB9KTtcblxuICAgIGxldCBjb21taXRNZXNzYWdlID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMuX3N0YXRlLmNvbW1pdE1lc3NhZ2UgIT0gbnVsbCkge1xuICAgICAgICBjb21taXRNZXNzYWdlID0gdGhpcy5fc3RhdGUuY29tbWl0TWVzc2FnZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fc3RhdGUuY29tbWl0TW9kZSA9PT0gQ29tbWl0TW9kZS5DT01NSVQpIHtcbiAgICAgICAgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2xvYWRBY3RpdmVSZXBvc2l0b3J5VGVtcGxhdGVDb21taXRNZXNzYWdlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fbG9hZEFjdGl2ZVJlcG9zaXRvcnlMYXRlc3RDb21taXRNZXNzYWdlKCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgICBjb21taXRNZXNzYWdlLFxuICAgICAgICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZS5SRUFEWSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9sb2FkUHVibGlzaE1vZGVTdGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgcHVibGlzaE1lc3NhZ2UgPSB0aGlzLl9zdGF0ZS5wdWJsaXNoTWVzc2FnZTtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNb2RlOiBQdWJsaXNoTW9kZS5DUkVBVEUsXG4gICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLkxPQURJTkdfUFVCTElTSF9NRVNTQUdFLFxuICAgICAgcHVibGlzaE1lc3NhZ2U6IG51bGwsXG4gICAgICBoZWFkUmV2aXNpb246IG51bGwsXG4gICAgfSk7XG4gICAgY29uc3Qge2hlYWRSZXZpc2lvbiwgcGhhYnJpY2F0b3JSZXZpc2lvbn0gPSBhd2FpdCB0aGlzLl9nZXRBY3RpdmVIZWFkUmV2aXNpb25EZXRhaWxzKCk7XG4gICAgaWYgKHB1Ymxpc2hNZXNzYWdlID09IG51bGwpIHtcbiAgICAgIHB1Ymxpc2hNZXNzYWdlID0gcGhhYnJpY2F0b3JSZXZpc2lvbiAhPSBudWxsXG4gICAgICAgID8gZ2V0UmV2aXNpb25VcGRhdGVNZXNzYWdlKHBoYWJyaWNhdG9yUmV2aXNpb24pXG4gICAgICAgIDogaGVhZFJldmlzaW9uLmRlc2NyaXB0aW9uO1xuICAgIH1cbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNb2RlOiBwaGFicmljYXRvclJldmlzaW9uICE9IG51bGwgPyBQdWJsaXNoTW9kZS5VUERBVEUgOiBQdWJsaXNoTW9kZS5DUkVBVEUsXG4gICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLlJFQURZLFxuICAgICAgcHVibGlzaE1lc3NhZ2UsXG4gICAgICBoZWFkUmV2aXNpb24sXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfZ2V0QWN0aXZlSGVhZFJldmlzaW9uRGV0YWlscygpOiBQcm9taXNlPHtcbiAgICBoZWFkUmV2aXNpb246IFJldmlzaW9uSW5mbztcbiAgICBwaGFicmljYXRvclJldmlzaW9uOiA/UGhhYnJpY2F0b3JSZXZpc2lvbkluZm87XG4gIH0+IHtcbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZSA9IGF3YWl0IHRoaXMuZ2V0QWN0aXZlUmV2aXNpb25zU3RhdGUoKTtcbiAgICBpZiAocmV2aXNpb25zU3RhdGUgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgTG9hZCBQdWJsaXNoIFZpZXc6IE5vIGFjdGl2ZSBmaWxlIG9yIHJlcG9zaXRvcnknKTtcbiAgICB9XG4gICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICBpbnZhcmlhbnQocmV2aXNpb25zLmxlbmd0aCA+IDAsICdEaWZmIFZpZXcgRXJyb3I6IFplcm8gUmV2aXNpb25zJyk7XG4gICAgY29uc3QgaGVhZFJldmlzaW9uID0gcmV2aXNpb25zW3JldmlzaW9ucy5sZW5ndGggLSAxXTtcbiAgICBjb25zdCBwaGFicmljYXRvclJldmlzaW9uID0gYXJjYW5pc3QuZ2V0UGhhYnJpY2F0b3JSZXZpc2lvbkZyb21Db21taXRNZXNzYWdlKFxuICAgICAgaGVhZFJldmlzaW9uLmRlc2NyaXB0aW9uLFxuICAgICk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhlYWRSZXZpc2lvbixcbiAgICAgIHBoYWJyaWNhdG9yUmV2aXNpb24sXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIF9sb2FkQWN0aXZlUmVwb3NpdG9yeUxhdGVzdENvbW1pdE1lc3NhZ2UoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGlmZiBWaWV3OiBObyBhY3RpdmUgZmlsZSBvciByZXBvc2l0b3J5IG9wZW4nKTtcbiAgICB9XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLmdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCk7XG4gICAgaW52YXJpYW50KHJldmlzaW9uc1N0YXRlLCAnRGlmZiBWaWV3IEludGVybmFsIEVycm9yOiByZXZpc2lvbnNTdGF0ZSBjYW5ub3QgYmUgbnVsbCcpO1xuICAgIGNvbnN0IHtyZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG4gICAgaW52YXJpYW50KHJldmlzaW9ucy5sZW5ndGggPiAwLCAnRGlmZiBWaWV3IEVycm9yOiBDYW5ub3QgYW1lbmQgbm9uLWV4aXN0aW5nIGNvbW1pdCcpO1xuICAgIHJldHVybiByZXZpc2lvbnNbcmV2aXNpb25zLmxlbmd0aCAtIDFdLmRlc2NyaXB0aW9uO1xuICB9XG5cbiAgYXN5bmMgX2xvYWRBY3RpdmVSZXBvc2l0b3J5VGVtcGxhdGVDb21taXRNZXNzYWdlKCk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEaWZmIFZpZXc6IE5vIGFjdGl2ZSBmaWxlIG9yIHJlcG9zaXRvcnkgb3BlbicpO1xuICAgIH1cbiAgICBsZXQgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgICAvLyBDb21taXQgdGVtcGxhdGVzIHRoYXQgaW5jbHVkZSBuZXdsaW5lIHN0cmluZ3MsICdcXFxcbicgaW4gSmF2YVNjcmlwdCwgbmVlZCB0byBjb252ZXJ0IHRoZWlyXG4gICAgLy8gc3RyaW5ncyB0byBsaXRlcmFsIG5ld2xpbmVzLCAnXFxuJyBpbiBKYXZhU2NyaXB0LCB0byBiZSByZW5kZXJlZCBhcyBsaW5lIGJyZWFrcy5cbiAgICBpZiAoY29tbWl0TWVzc2FnZSAhPSBudWxsKSB7XG4gICAgICBjb21taXRNZXNzYWdlID0gY29udmVydE5ld2xpbmVzKGNvbW1pdE1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gY29tbWl0TWVzc2FnZTtcbiAgfVxuXG4gIGFzeW5jIGdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCk6IFByb21pc2U8P1JldmlzaW9uc1N0YXRlPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsIHx8ICF0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2suZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gIH1cblxuICBfc2V0U3RhdGUobmV3U3RhdGU6IFN0YXRlKSB7XG4gICAgdGhpcy5fc3RhdGUgPSBuZXdTdGF0ZTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoRElEX1VQREFURV9TVEFURV9FVkVOVCk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5jb21taXQnKVxuICBhc3luYyBjb21taXQobWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKG1lc3NhZ2UgPT09ICcnKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0NvbW1pdCBhYm9ydGVkJywge2RldGFpbDogJ0NvbW1pdCBtZXNzYWdlIGVtcHR5J30pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgY29tbWl0TWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIGNvbW1pdE1vZGVTdGF0ZTogQ29tbWl0TW9kZVN0YXRlLkFXQUlUSU5HX0NPTU1JVCxcbiAgICB9KTtcblxuICAgIGNvbnN0IHtjb21taXRNb2RlfSA9IHRoaXMuX3N0YXRlO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctY29tbWl0Jywge1xuICAgICAgY29tbWl0TW9kZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFjdGl2ZVN0YWNrID0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrO1xuICAgIHRyeSB7XG4gICAgICBpbnZhcmlhbnQoYWN0aXZlU3RhY2ssICdObyBhY3RpdmUgcmVwb3NpdG9yeSBzdGFjaycpO1xuICAgICAgc3dpdGNoIChjb21taXRNb2RlKSB7XG4gICAgICAgIGNhc2UgQ29tbWl0TW9kZS5DT01NSVQ6XG4gICAgICAgICAgYXdhaXQgYWN0aXZlU3RhY2suY29tbWl0KG1lc3NhZ2UpO1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb21taXQgY3JlYXRlZCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIENvbW1pdE1vZGUuQU1FTkQ6XG4gICAgICAgICAgYXdhaXQgYWN0aXZlU3RhY2suYW1lbmQobWVzc2FnZSk7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ0NvbW1pdCBhbWVuZGVkJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIEZvcmNlIHRyaWdnZXIgYW4gdXBkYXRlIHRvIHRoZSByZXZpc2lvbnMgdG8gdXBkYXRlIHRoZSBVSSBzdGF0ZSB3aXRoIHRoZSBuZXcgY29tbWl0IGluZm8uXG4gICAgICBhY3RpdmVTdGFjay5nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICAgIHRoaXMuX2xvYWRNb2RlU3RhdGUodHJ1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAnRXJyb3IgY3JlYXRpbmcgY29tbWl0JyxcbiAgICAgICAge2RldGFpbDogYERldGFpbHM6ICR7ZS5zdGRvdXR9YH0sXG4gICAgICApO1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuUkVBRFksXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBnZXRTdGF0ZSgpOiBTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICB9XG5cbiAgc2V0Q29tbWl0TW9kZShjb21taXRNb2RlOiBDb21taXRNb2RlVHlwZSwgbG9hZE1vZGVTdGF0ZT86IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0YXRlLmNvbW1pdE1vZGUgPT09IGNvbW1pdE1vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJhY2soJ2RpZmYtdmlldy1zd2l0Y2gtY29tbWl0LW1vZGUnLCB7XG4gICAgICBjb21taXRNb2RlLFxuICAgIH0pO1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgY29tbWl0TW9kZSxcbiAgICAgIGNvbW1pdE1lc3NhZ2U6IG51bGwsXG4gICAgfSk7XG4gICAgaWYgKGxvYWRNb2RlU3RhdGUpIHtcbiAgICAgIC8vIFdoZW4gdGhlIGNvbW1pdCBtb2RlIGNoYW5nZXMsIGxvYWQgdGhlIGFwcHJvcHJpYXRlIGNvbW1pdCBtZXNzYWdlLlxuICAgICAgdGhpcy5fbG9hZE1vZGVTdGF0ZSh0cnVlKTtcbiAgICB9XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVSZXBvc2l0b3JpZXMoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5U3RhY2sgb2YgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmFjdGl2YXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmRlYWN0aXZhdGUoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZShnZXRJbml0aWFsRmlsZUNoYW5nZVN0YXRlKCkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBmb3IgKGNvbnN0IHJlcG9zaXRvcnlTdGFjayBvZiB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKSB7XG4gICAgICByZXBvc2l0b3J5U3RhY2suZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmNsZWFyKCk7XG4gICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2YgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmNsZWFyKCk7XG4gICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld01vZGVsO1xuIl19