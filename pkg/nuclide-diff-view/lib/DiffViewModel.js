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

var _RepositoryStack = require('./RepositoryStack');

var _RepositoryStack2 = _interopRequireDefault(_RepositoryStack);

var _notifications = require('./notifications');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideLogging = require('../../nuclide-logging');

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
      lastCommitMergeFileChanges: new Map(),
      selectedFileChanges: new Map()
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
      switch (this._state.viewMode) {
        case _constants.DiffMode.COMMIT_MODE:
          selectedFileChanges = dirtyFileChanges;
          break;
        case _constants.DiffMode.BROWSE_MODE:
          selectedFileChanges = commitMergeFileChanges;
          break;
        case _constants.DiffMode.PUBLISH_MODE:
          selectedFileChanges = lastCommitMergeFileChanges;
          break;
        default:
          throw new Error('Unrecognized view mode!');
      }
      this._setState(_extends({}, this._state, {
        dirtyFileChanges: dirtyFileChanges,
        commitMergeFileChanges: commitMergeFileChanges,
        lastCommitMergeFileChanges: lastCommitMergeFileChanges,
        selectedFileChanges: selectedFileChanges
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

      var _ref5 = yield this._fetchFileDiff(filePath);

      var committedContents = _ref5.committedContents;
      var filesystemContents = _ref5.filesystemContents;
      var revisionInfo = _ref5.revisionInfo;

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
      (0, _nuclideAnalytics.track)('diff-view-switch-mode', {
        viewMode: viewMode
      });
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
      var buffer = (0, _nuclideAtomHelpers.bufferForUri)(filePath);
      var file = buffer.file;

      if (file != null) {
        activeSubscriptions.add(file.onDidChange((0, _nuclideCommons.debounce)(function () {
          return _this2._onDidFileChange(filePath)['catch'](_notifications.notifyInternalError);
        }, FILE_CHANGE_DEBOUNCE_MS, false)));
      }
      activeSubscriptions.add(buffer.onDidChangeModified(this.emitActiveBufferChangeModified.bind(this)));
      // Modified events could be late that it doesn't capture the latest edits/ state changes.
      // Hence, it's safe to re-emit changes when stable from changes.
      activeSubscriptions.add(buffer.onDidStopChanging(this.emitActiveBufferChangeModified.bind(this)));
      // Update `savedContents` on buffer save requests.
      activeSubscriptions.add(buffer.onWillSave(function () {
        return _this2._onWillSaveActiveBuffer(buffer);
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
      // Calling atom.project.repositoryForDirectory gets the real path of the directory,
      // which is another round-trip and calls the repository providers to get an existing repository.
      // Instead, the first match of the filtering here is the only possible match.
      var repository = (0, _nuclideHgGitBridge.repositoryForPath)(filePath);
      if (repository == null || repository.getType() !== 'hg') {
        var type = repository ? repository.getType() : 'no repository';
        throw new Error('Diff view only supports `Mercurial` repositories, but found `' + type + '`');
      }

      var hgRepository = repository;
      var repositoryStack = this._repositoryStacks.get(hgRepository);
      (0, _assert2['default'])(repositoryStack, 'There must be an repository stack for a given repository!');

      var _ref6 = yield Promise.all([repositoryStack.fetchHgDiff(filePath), this._setActiveRepositoryStack(repositoryStack)]);

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
        this._loadModeState();
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
      var filePath = this._activeFileState.filePath;

      var lastCommitMessage = yield this._loadActiveRepositoryLatestCommitMessage();
      if (!amended && publishMessage !== lastCommitMessage) {
        (0, _nuclideLogging.getLogger)().info('Amending commit with the updated message');
        (0, _assert2['default'])(this._activeRepositoryStack);
        yield this._activeRepositoryStack.amend(publishMessage);
        atom.notifications.addSuccess('Commit amended with the updated message');
      }
      yield _nuclideArcanistClient2['default'].createPhabricatorRevision(filePath);
      atom.notifications.addSuccess('Revision created');
    })
  }, {
    key: '_updatePhabricatorRevision',
    value: _asyncToGenerator(function* (publishMessage, allowUntracked) {
      var filePath = this._activeFileState.filePath;

      var _ref7 = yield this._getActiveHeadRevisionDetails();

      var phabricatorRevision = _ref7.phabricatorRevision;

      (0, _assert2['default'])(phabricatorRevision != null, 'A phabricator revision must exist to update!');
      var updateTemplate = getRevisionUpdateMessage(phabricatorRevision).trim();
      var userUpdateMessage = publishMessage.replace(updateTemplate, '').trim();
      if (userUpdateMessage.length === 0) {
        throw new Error('Cannot update revision with empty message');
      }
      yield _nuclideArcanistClient2['default'].updatePhabricatorRevision(filePath, userUpdateMessage, allowUntracked);
      atom.notifications.addSuccess('Revision `' + phabricatorRevision.id + '` updated');
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

      var _ref8 = yield this._getActiveHeadRevisionDetails();

      var headRevision = _ref8.headRevision;
      var phabricatorRevision = _ref8.phabricatorRevision;

      this._setState(_extends({}, this._state, {
        publishMode: phabricatorRevision != null ? _constants.PublishMode.UPDATE : _constants.PublishMode.CREATE,
        publishModeState: _constants.PublishModeState.READY,
        publishMessage: phabricatorRevision != null ? getRevisionUpdateMessage(phabricatorRevision) : headRevision.description,
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
    decorators: [(0, _nuclideAnalytics.trackTiming)('diff-view.commit')],
    value: _asyncToGenerator(function* (message) {
      if (message === '') {
        atom.notifications.addError('Commit aborted', { detail: 'Commit message empty' });
        return;
      } else if (this._state.commitMode === _constants.CommitMode.COMMIT && message === this._state.commitMessage) {
        // When creating a new commit, the initial commit message is created from a template. The
        // message must differ from the template to be successful.
        atom.notifications.addError('Commit aborted', { detail: 'Commit message unchanged' });
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

        this._setState(_extends({}, this._state, {
          commitModeState: _constants.CommitModeState.LOADING_COMMIT_MESSAGE
        }));

        // Force trigger an update to the revisions to update the UI state with the new commit info.
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
      (0, _nuclideAnalytics.track)('diff-view-switch-commit-mode', {
        commitMode: commitMode
      });
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
//# sourceMappingURL=data:application/json;base64,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LHVCQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7T0FDNUI7S0FDRjs7O1dBRVMsc0JBQVM7QUFDakIsVUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDdkIsVUFBSSxJQUFJLENBQUMsc0JBQXNCLElBQUksSUFBSSxFQUFFO0FBQ3ZDLFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUN6QyxZQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO09BQ3BDO0FBQ0QsVUFBSSxDQUFDLG1CQUFtQixDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQztLQUN2RDs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFdBQUssSUFBTSxlQUFlLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQzdELHVCQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDM0I7QUFDRCxVQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDL0IsV0FBSyxJQUFNLFlBQVksSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDakUsb0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN4QjtBQUNELFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QyxVQUFJLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLEVBQUU7QUFDckMsWUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BDLFlBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7T0FDbEM7S0FDRjs7O1NBaDFCRyxhQUFhOzs7QUFtMUJuQixNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJEaWZmVmlld01vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWNsaWVudCc7XG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVDaGFuZ2VTdGF0ZSxcbiAgUmV2aXNpb25zU3RhdGUsXG4gIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSxcbiAgQ29tbWl0TW9kZVR5cGUsXG4gIENvbW1pdE1vZGVTdGF0ZVR5cGUsXG4gIFB1Ymxpc2hNb2RlVHlwZSxcbiAgUHVibGlzaE1vZGVTdGF0ZVR5cGUsXG4gIERpZmZNb2RlVHlwZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1BoYWJyaWNhdG9yUmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWFyY2FuaXN0LWNsaWVudCc7XG5cbnR5cGUgRmlsZURpZmZTdGF0ZSA9IHtcbiAgcmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm87XG4gIGNvbW1pdHRlZENvbnRlbnRzOiBzdHJpbmc7XG4gIGZpbGVzeXN0ZW1Db250ZW50czogc3RyaW5nO1xufTtcblxuaW1wb3J0IGFyY2FuaXN0IGZyb20gJy4uLy4uL251Y2xpZGUtYXJjYW5pc3QtY2xpZW50JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBEaWZmTW9kZSxcbiAgQ29tbWl0TW9kZSxcbiAgQ29tbWl0TW9kZVN0YXRlLFxuICBQdWJsaXNoTW9kZSxcbiAgUHVibGlzaE1vZGVTdGF0ZSxcbiAgRmlsZUNoYW5nZVN0YXR1cyxcbiAgRmlsZUNoYW5nZVN0YXR1c1RvUHJlZml4LFxufSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge3JlcG9zaXRvcnlGb3JQYXRofSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7Z2V0RmlsZVN5c3RlbUNvbnRlbnRzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7YXJyYXksIG1hcCwgZGVib3VuY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgUmVwb3NpdG9yeVN0YWNrIGZyb20gJy4vUmVwb3NpdG9yeVN0YWNrJztcbmltcG9ydCB7XG4gIG5vdGlmeUludGVybmFsRXJyb3IsXG4gIG5vdGlmeUZpbGVzeXN0ZW1PdmVycmlkZVVzZXJFZGl0cyxcbn0gZnJvbSAnLi9ub3RpZmljYXRpb25zJztcbmltcG9ydCB7YnVmZmVyRm9yVXJpLCBsb2FkQnVmZmVyRm9yVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcblxuY29uc3QgQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5UID0gJ2FjdGl2ZS1maWxlLXVwZGF0ZSc7XG5jb25zdCBDSEFOR0VfUkVWSVNJT05TX0VWRU5UID0gJ2RpZC1jaGFuZ2UtcmV2aXNpb25zJztcbmNvbnN0IEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5UID0gJ2FjdGl2ZS1idWZmZXItY2hhbmdlLW1vZGlmaWVkJztcbmNvbnN0IERJRF9VUERBVEVfU1RBVEVfRVZFTlQgPSAnZGlkLXVwZGF0ZS1zdGF0ZSc7XG5cbmZ1bmN0aW9uIGdldFJldmlzaW9uVXBkYXRlTWVzc2FnZShwaGFicmljYXRvclJldmlzaW9uOiBQaGFicmljYXRvclJldmlzaW9uSW5mbyk6IHN0cmluZyB7XG4gIHJldHVybiBgXG5cbiMgVXBkYXRpbmcgJHtwaGFicmljYXRvclJldmlzaW9uLmlkfVxuI1xuIyBFbnRlciBhIGJyaWVmIGRlc2NyaXB0aW9uIG9mIHRoZSBjaGFuZ2VzIGluY2x1ZGVkIGluIHRoaXMgdXBkYXRlLlxuIyBUaGUgZmlyc3QgbGluZSBpcyB1c2VkIGFzIHN1YmplY3QsIG5leHQgbGluZXMgYXMgY29tbWVudC5gO1xufVxuXG5jb25zdCBGSUxFX0NIQU5HRV9ERUJPVU5DRV9NUyA9IDIwMDtcbmNvbnN0IE1BWF9ESUFMT0dfRklMRV9TVEFUVVNfQ09VTlQgPSAyMDtcblxuLy8gUmV0dXJucyBhIHN0cmluZyB3aXRoIGFsbCBuZXdsaW5lIHN0cmluZ3MsICdcXFxcbicsIGNvbnZlcnRlZCB0byBsaXRlcmFsIG5ld2xpbmVzLCAnXFxuJy5cbmZ1bmN0aW9uIGNvbnZlcnROZXdsaW5lcyhtZXNzYWdlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbWVzc2FnZS5yZXBsYWNlKC9cXFxcbi9nLCAnXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxGaWxlQ2hhbmdlU3RhdGUoKTogRmlsZUNoYW5nZVN0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICBmcm9tUmV2aXNpb25UaXRsZTogJ05vIGZpbGUgc2VsZWN0ZWQnLFxuICAgIHRvUmV2aXNpb25UaXRsZTogJ05vIGZpbGUgc2VsZWN0ZWQnLFxuICAgIGZpbGVQYXRoOiAnJyxcbiAgICBvbGRDb250ZW50czogJycsXG4gICAgbmV3Q29udGVudHM6ICcnLFxuICAgIGNvbXBhcmVSZXZpc2lvbkluZm86IG51bGwsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVTdGF0dXNMaXN0TWVzc2FnZShmaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pOiBzdHJpbmcge1xuICBsZXQgbWVzc2FnZSA9ICcnO1xuICBpZiAoZmlsZUNoYW5nZXMuc2l6ZSA8IE1BWF9ESUFMT0dfRklMRV9TVEFUVVNfQ09VTlQpIHtcbiAgICBmb3IgKGNvbnN0IFtmaWxlUGF0aCwgc3RhdHVzQ29kZV0gb2YgZmlsZUNoYW5nZXMpIHtcbiAgICAgIG1lc3NhZ2UgKz0gJ1xcbidcbiAgICAgICAgKyBGaWxlQ2hhbmdlU3RhdHVzVG9QcmVmaXhbc3RhdHVzQ29kZV1cbiAgICAgICAgKyBhdG9tLnByb2plY3QucmVsYXRpdml6ZShmaWxlUGF0aCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG1lc3NhZ2UgPSBgXFxuIG1vcmUgdGhhbiAke01BWF9ESUFMT0dfRklMRV9TVEFUVVNfQ09VTlR9IGZpbGVzIChjaGVjayB1c2luZyBcXGBoZyBzdGF0dXNcXGApYDtcbiAgfVxuICByZXR1cm4gbWVzc2FnZTtcbn1cblxudHlwZSBTdGF0ZSA9IHtcbiAgdmlld01vZGU6IERpZmZNb2RlVHlwZTtcbiAgY29tbWl0TWVzc2FnZTogP3N0cmluZztcbiAgY29tbWl0TW9kZTogQ29tbWl0TW9kZVR5cGU7XG4gIGNvbW1pdE1vZGVTdGF0ZTogQ29tbWl0TW9kZVN0YXRlVHlwZTtcbiAgcHVibGlzaE1lc3NhZ2U6ID9zdHJpbmc7XG4gIHB1Ymxpc2hNb2RlOiBQdWJsaXNoTW9kZVR5cGU7XG4gIHB1Ymxpc2hNb2RlU3RhdGU6IFB1Ymxpc2hNb2RlU3RhdGVUeXBlO1xuICBoZWFkUmV2aXNpb246ID9SZXZpc2lvbkluZm87XG4gIGRpcnR5RmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBjb21taXRNZXJnZUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBzZWxlY3RlZEZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbn07XG5cbmNsYXNzIERpZmZWaWV3TW9kZWwge1xuXG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGl2ZVN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYWN0aXZlRmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGU7XG4gIF9hY3RpdmVSZXBvc2l0b3J5U3RhY2s6ID9SZXBvc2l0b3J5U3RhY2s7XG4gIF9uZXdFZGl0b3I6ID9UZXh0RWRpdG9yO1xuICBfdWlQcm92aWRlcnM6IEFycmF5PE9iamVjdD47XG4gIF9yZXBvc2l0b3J5U3RhY2tzOiBNYXA8SGdSZXBvc2l0b3J5Q2xpZW50LCBSZXBvc2l0b3J5U3RhY2s+O1xuICBfcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnM6IE1hcDxIZ1JlcG9zaXRvcnlDbGllbnQsIENvbXBvc2l0ZURpc3Bvc2FibGU+O1xuICBfaXNBY3RpdmU6IGJvb2xlYW47XG4gIF9zdGF0ZTogU3RhdGU7XG5cbiAgY29uc3RydWN0b3IodWlQcm92aWRlcnM6IEFycmF5PE9iamVjdD4pIHtcbiAgICB0aGlzLl91aVByb3ZpZGVycyA9IHVpUHJvdmlkZXJzO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIHZpZXdNb2RlOiBEaWZmTW9kZS5CUk9XU0VfTU9ERSxcbiAgICAgIGNvbW1pdE1lc3NhZ2U6IG51bGwsXG4gICAgICBjb21taXRNb2RlOiBDb21taXRNb2RlLkNPTU1JVCxcbiAgICAgIGNvbW1pdE1vZGVTdGF0ZTogQ29tbWl0TW9kZVN0YXRlLlJFQURZLFxuICAgICAgcHVibGlzaE1lc3NhZ2U6IG51bGwsXG4gICAgICBwdWJsaXNoTW9kZTogUHVibGlzaE1vZGUuQ1JFQVRFLFxuICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5SRUFEWSxcbiAgICAgIGhlYWRSZXZpc2lvbjogbnVsbCxcbiAgICAgIGRpcnR5RmlsZUNoYW5nZXM6IG5ldyBNYXAoKSxcbiAgICAgIGNvbW1pdE1lcmdlRmlsZUNoYW5nZXM6IG5ldyBNYXAoKSxcbiAgICAgIGxhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzOiBuZXcgTWFwKCksXG4gICAgICBzZWxlY3RlZEZpbGVDaGFuZ2VzOiBuZXcgTWFwKCksXG4gICAgfTtcbiAgICB0aGlzLl91cGRhdGVSZXBvc2l0b3JpZXMoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyh0aGlzLl91cGRhdGVSZXBvc2l0b3JpZXMuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZShnZXRJbml0aWFsRmlsZUNoYW5nZVN0YXRlKCkpO1xuICAgIHRoaXMuX2NoZWNrQ3VzdG9tQ29uZmlnKCkuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gIH1cblxuICBhc3luYyBfY2hlY2tDdXN0b21Db25maWcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGNvbmZpZyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGNvbmZpZyA9IHJlcXVpcmUoJy4vZmIvY29uZmlnJyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChjb25maWcgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhd2FpdCBjb25maWcuYXBwbHlDb25maWcoKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlUmVwb3NpdG9yaWVzKCk6IHZvaWQge1xuICAgIGNvbnN0IHJlcG9zaXRvcmllcyA9IG5ldyBTZXQoXG4gICAgICBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKCkuZmlsdGVyKFxuICAgICAgICByZXBvc2l0b3J5ID0+IHJlcG9zaXRvcnkgIT0gbnVsbCAmJiByZXBvc2l0b3J5LmdldFR5cGUoKSA9PT0gJ2hnJ1xuICAgICAgKVxuICAgICk7XG4gICAgLy8gRGlzcG9zZSByZW1vdmVkIHByb2plY3RzIHJlcG9zaXRvcmllcy5cbiAgICBmb3IgKGNvbnN0IFtyZXBvc2l0b3J5LCByZXBvc2l0b3J5U3RhY2tdIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MpIHtcbiAgICAgIGlmIChyZXBvc2l0b3JpZXMuaGFzKHJlcG9zaXRvcnkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgcmVwb3NpdG9yeVN0YWNrLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLmdldChyZXBvc2l0b3J5KTtcbiAgICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuZGVsZXRlKHJlcG9zaXRvcnkpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgcmVwb3NpdG9yeSBvZiByZXBvc2l0b3JpZXMpIHtcbiAgICAgIGlmICh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmhhcyhyZXBvc2l0b3J5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9ICgocmVwb3NpdG9yeTogYW55KTogSGdSZXBvc2l0b3J5Q2xpZW50KTtcbiAgICAgIHRoaXMuX2NyZWF0ZVJlcG9zaXRvcnlTdGFjayhoZ1JlcG9zaXRvcnkpO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZURpcnR5Q2hhbmdlZFN0YXR1cygpO1xuICB9XG5cbiAgX2NyZWF0ZVJlcG9zaXRvcnlTdGFjayhyZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQpOiBSZXBvc2l0b3J5U3RhY2sge1xuICAgIGNvbnN0IHJlcG9zaXRvcnlTdGFjayA9IG5ldyBSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeSk7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICByZXBvc2l0b3J5U3RhY2sub25EaWRVcGRhdGVEaXJ0eUZpbGVDaGFuZ2VzKFxuICAgICAgICB0aGlzLl91cGRhdGVEaXJ0eUNoYW5nZWRTdGF0dXMuYmluZCh0aGlzKVxuICAgICAgKSxcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZFVwZGF0ZUNvbW1pdE1lcmdlRmlsZUNoYW5nZXMoXG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvbW1pdE1lcmdlRmlsZUNoYW5nZXMuYmluZCh0aGlzKVxuICAgICAgKSxcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5vbkRpZENoYW5nZVJldmlzaW9ucyhyZXZpc2lvbnNTdGF0ZSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMocmVwb3NpdG9yeVN0YWNrLCByZXZpc2lvbnNTdGF0ZSwgdHJ1ZSlcbiAgICAgICAgICAuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gICAgICB9KSxcbiAgICApO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlTdGFja3Muc2V0KHJlcG9zaXRvcnksIHJlcG9zaXRvcnlTdGFjayk7XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN1YnNjcmlwdGlvbnMuc2V0KHJlcG9zaXRvcnksIHN1YnNjcmlwdGlvbnMpO1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmFjdGl2YXRlKCk7XG4gICAgfVxuICAgIHJldHVybiByZXBvc2l0b3J5U3RhY2s7XG4gIH1cblxuICBfdXBkYXRlRGlydHlDaGFuZ2VkU3RhdHVzKCk6IHZvaWQge1xuICAgIGNvbnN0IGRpcnR5RmlsZUNoYW5nZXMgPSBtYXAudW5pb24oLi4uYXJyYXlcbiAgICAgIC5mcm9tKHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpXG4gICAgICAubWFwKHJlcG9zaXRvcnlTdGFjayA9PiByZXBvc2l0b3J5U3RhY2suZ2V0RGlydHlGaWxlQ2hhbmdlcygpKVxuICAgICk7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGFyZUNoYW5nZWRTdGF0dXMoZGlydHlGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBfdXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcygpOiB2b2lkIHtcbiAgICBjb25zdCBjb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldENvbW1pdE1lcmdlRmlsZUNoYW5nZXMoKSlcbiAgICApO1xuICAgIGNvbnN0IGxhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gbWFwLnVuaW9uKC4uLmFycmF5XG4gICAgICAuZnJvbSh0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLnZhbHVlcygpKVxuICAgICAgLm1hcChyZXBvc2l0b3J5U3RhY2sgPT4gcmVwb3NpdG9yeVN0YWNrLmdldExhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCkpXG4gICAgKTtcbiAgICB0aGlzLl91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cyhcbiAgICAgIG51bGwsXG4gICAgICBjb21taXRNZXJnZUZpbGVDaGFuZ2VzLFxuICAgICAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMsXG4gICAgKTtcbiAgfVxuXG4gIF91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cyhcbiAgICBkaXJ0eUZpbGVDaGFuZ2VzPzogP01hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+LFxuICAgIGNvbW1pdE1lcmdlRmlsZUNoYW5nZXM/OiA/TWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4sXG4gICAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXM/OiA/TWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4sXG4gICk6IHZvaWQge1xuICAgIGlmIChkaXJ0eUZpbGVDaGFuZ2VzID09IG51bGwpIHtcbiAgICAgIGRpcnR5RmlsZUNoYW5nZXMgPSB0aGlzLl9zdGF0ZS5kaXJ0eUZpbGVDaGFuZ2VzO1xuICAgIH1cbiAgICBpZiAoY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyA9PSBudWxsKSB7XG4gICAgICBjb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gdGhpcy5fc3RhdGUuY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcztcbiAgICB9XG4gICAgaWYgKGxhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzID09IG51bGwpIHtcbiAgICAgIGxhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gdGhpcy5fc3RhdGUubGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXM7XG4gICAgfVxuICAgIGxldCBzZWxlY3RlZEZpbGVDaGFuZ2VzO1xuICAgIHN3aXRjaCAodGhpcy5fc3RhdGUudmlld01vZGUpIHtcbiAgICAgIGNhc2UgRGlmZk1vZGUuQ09NTUlUX01PREU6XG4gICAgICAgIHNlbGVjdGVkRmlsZUNoYW5nZXMgPSBkaXJ0eUZpbGVDaGFuZ2VzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlmZk1vZGUuQlJPV1NFX01PREU6XG4gICAgICAgIHNlbGVjdGVkRmlsZUNoYW5nZXMgPSBjb21taXRNZXJnZUZpbGVDaGFuZ2VzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlmZk1vZGUuUFVCTElTSF9NT0RFOlxuICAgICAgICBzZWxlY3RlZEZpbGVDaGFuZ2VzID0gbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlY29nbml6ZWQgdmlldyBtb2RlIScpO1xuICAgIH1cbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIGRpcnR5RmlsZUNoYW5nZXMsXG4gICAgICBjb21taXRNZXJnZUZpbGVDaGFuZ2VzLFxuICAgICAgbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMsXG4gICAgICBzZWxlY3RlZEZpbGVDaGFuZ2VzLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMoXG4gICAgcmVwb3NpdG9yeVN0YWNrOiBSZXBvc2l0b3J5U3RhY2ssXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICAgIHJlbG9hZEZpbGVEaWZmU3RhdGU6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChyZXBvc2l0b3J5U3RhY2sgIT09IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cmFjaygnZGlmZi12aWV3LXVwZGF0ZS10aW1lbGluZS1yZXZpc2lvbnMnLCB7XG4gICAgICByZXZpc2lvbnNDb3VudDogYCR7cmV2aXNpb25zU3RhdGUucmV2aXNpb25zLmxlbmd0aH1gLFxuICAgIH0pO1xuICAgIHRoaXMuX29uVXBkYXRlUmV2aXNpb25zU3RhdGUocmV2aXNpb25zU3RhdGUpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBhY3RpdmUgZmlsZSwgaWYgY2hhbmdlZC5cbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGlmICghZmlsZVBhdGggfHwgIXJlbG9hZEZpbGVEaWZmU3RhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge1xuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfSA9IGF3YWl0IHRoaXMuX2ZldGNoRmlsZURpZmYoZmlsZVBhdGgpO1xuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZTdGF0ZUlmQ2hhbmdlZChcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgKTtcbiAgfVxuXG4gIF9vblVwZGF0ZVJldmlzaW9uc1N0YXRlKHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG4gICAgdGhpcy5fbG9hZE1vZGVTdGF0ZSgpO1xuICB9XG5cbiAgc2V0UHVibGlzaE1lc3NhZ2UocHVibGlzaE1lc3NhZ2U6IHN0cmluZykge1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgcHVibGlzaE1lc3NhZ2UsXG4gICAgfSk7XG4gIH1cblxuICBzZXRWaWV3TW9kZSh2aWV3TW9kZTogRGlmZk1vZGVUeXBlKTogdm9pZCB7XG4gICAgaWYgKHZpZXdNb2RlID09PSB0aGlzLl9zdGF0ZS52aWV3TW9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cmFjaygnZGlmZi12aWV3LXN3aXRjaC1tb2RlJywge1xuICAgICAgdmlld01vZGUsXG4gICAgfSk7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICB2aWV3TW9kZSxcbiAgICB9KTtcbiAgICB0aGlzLl91cGRhdGVDb21wYXJlQ2hhbmdlZFN0YXR1cygpO1xuICAgIHRoaXMuX2xvYWRNb2RlU3RhdGUoKTtcbiAgfVxuXG4gIF9sb2FkTW9kZVN0YXRlKCk6IHZvaWQge1xuICAgIHN3aXRjaCAodGhpcy5fc3RhdGUudmlld01vZGUpIHtcbiAgICAgIGNhc2UgRGlmZk1vZGUuQ09NTUlUX01PREU6XG4gICAgICAgIHRoaXMuX2xvYWRDb21taXRNb2RlU3RhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpZmZNb2RlLlBVQkxJU0hfTU9ERTpcbiAgICAgICAgdGhpcy5fbG9hZFB1Ymxpc2hNb2RlU3RhdGUoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgYWN0aXZhdGVGaWxlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBjb25zdCBhY3RpdmVTdWJzY3JpcHRpb25zID0gdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgLy8gVE9ETyhtb3N0KTogU2hvdyBwcm9ncmVzcyBpbmRpY2F0b3I6IHQ4OTkxNjc2XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICBjb25zdCB7ZmlsZX0gPSBidWZmZXI7XG4gICAgaWYgKGZpbGUgIT0gbnVsbCkge1xuICAgICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoZmlsZS5vbkRpZENoYW5nZShkZWJvdW5jZShcbiAgICAgICAgKCkgPT4gdGhpcy5fb25EaWRGaWxlQ2hhbmdlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKSxcbiAgICAgICAgRklMRV9DSEFOR0VfREVCT1VOQ0VfTVMsXG4gICAgICAgIGZhbHNlLFxuICAgICAgKSkpO1xuICAgIH1cbiAgICBhY3RpdmVTdWJzY3JpcHRpb25zLmFkZChidWZmZXIub25EaWRDaGFuZ2VNb2RpZmllZChcbiAgICAgIHRoaXMuZW1pdEFjdGl2ZUJ1ZmZlckNoYW5nZU1vZGlmaWVkLmJpbmQodGhpcyksXG4gICAgKSk7XG4gICAgLy8gTW9kaWZpZWQgZXZlbnRzIGNvdWxkIGJlIGxhdGUgdGhhdCBpdCBkb2Vzbid0IGNhcHR1cmUgdGhlIGxhdGVzdCBlZGl0cy8gc3RhdGUgY2hhbmdlcy5cbiAgICAvLyBIZW5jZSwgaXQncyBzYWZlIHRvIHJlLWVtaXQgY2hhbmdlcyB3aGVuIHN0YWJsZSBmcm9tIGNoYW5nZXMuXG4gICAgYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQoYnVmZmVyLm9uRGlkU3RvcENoYW5naW5nKFxuICAgICAgdGhpcy5lbWl0QWN0aXZlQnVmZmVyQ2hhbmdlTW9kaWZpZWQuYmluZCh0aGlzKSxcbiAgICApKTtcbiAgICAvLyBVcGRhdGUgYHNhdmVkQ29udGVudHNgIG9uIGJ1ZmZlciBzYXZlIHJlcXVlc3RzLlxuICAgIGFjdGl2ZVN1YnNjcmlwdGlvbnMuYWRkKGJ1ZmZlci5vbldpbGxTYXZlKFxuICAgICAgKCkgPT4gdGhpcy5fb25XaWxsU2F2ZUFjdGl2ZUJ1ZmZlcihidWZmZXIpLFxuICAgICkpO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctb3Blbi1maWxlJywge2ZpbGVQYXRofSk7XG4gICAgdGhpcy5fdXBkYXRlQWN0aXZlRGlmZlN0YXRlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZpbGUtY2hhbmdlLXVwZGF0ZScpXG4gIGFzeW5jIF9vbkRpZEZpbGVDaGFuZ2UoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlRmlsZVN0YXRlLmZpbGVQYXRoICE9PSBmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaWxlc3lzdGVtQ29udGVudHMgPSBhd2FpdCBnZXRGaWxlU3lzdGVtQ29udGVudHMoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHtcbiAgICAgIG9sZENvbnRlbnRzOiBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGNvbXBhcmVSZXZpc2lvbkluZm86IHJldmlzaW9uSW5mbyxcbiAgICB9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIGludmFyaWFudChyZXZpc2lvbkluZm8sICdEaWZmIFZpZXc6IFJldmlzaW9uIGluZm8gbXVzdCBiZSBkZWZpbmVkIHRvIHVwZGF0ZSBjaGFuZ2VkIHN0YXRlJyk7XG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZlN0YXRlSWZDaGFuZ2VkKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICApO1xuICB9XG5cbiAgZW1pdEFjdGl2ZUJ1ZmZlckNoYW5nZU1vZGlmaWVkKCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChBQ1RJVkVfQlVGRkVSX0NIQU5HRV9NT0RJRklFRF9FVkVOVCk7XG4gIH1cblxuICBvbkRpZEFjdGl2ZUJ1ZmZlckNoYW5nZU1vZGlmaWVkKFxuICAgIGNhbGxiYWNrOiAoKSA9PiBtaXhlZCxcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKEFDVElWRV9CVUZGRVJfQ0hBTkdFX01PRElGSUVEX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBpc0FjdGl2ZUJ1ZmZlck1vZGlmaWVkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgY29uc3QgYnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICByZXR1cm4gYnVmZmVyLmlzTW9kaWZpZWQoKTtcbiAgfVxuXG4gIF91cGRhdGVEaWZmU3RhdGVJZkNoYW5nZWQoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29tbWl0dGVkQ29udGVudHM6IHN0cmluZyxcbiAgICBmaWxlc3lzdGVtQ29udGVudHM6IHN0cmluZyxcbiAgICByZXZpc2lvbkluZm86IFJldmlzaW9uSW5mbyxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge1xuICAgICAgZmlsZVBhdGg6IGFjdGl2ZUZpbGVQYXRoLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgIH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgaWYgKGZpbGVQYXRoICE9PSBhY3RpdmVGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICBjb25zdCB1cGRhdGVkRGlmZlN0YXRlID0ge1xuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfTtcbiAgICBpbnZhcmlhbnQoc2F2ZWRDb250ZW50cywgJ3NhdmVkQ29udGVudHMgaXMgbm90IGRlZmluZWQgd2hpbGUgdXBkYXRpbmcgZGlmZiBzdGF0ZSEnKTtcbiAgICBpZiAoc2F2ZWRDb250ZW50cyA9PT0gbmV3Q29udGVudHMgfHwgZmlsZXN5c3RlbUNvbnRlbnRzID09PSBuZXdDb250ZW50cykge1xuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIHVwZGF0ZWREaWZmU3RhdGUsXG4gICAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgICApO1xuICAgIH1cbiAgICAvLyBUaGUgdXNlciBoYXZlIGVkaXRlZCBzaW5jZSB0aGUgbGFzdCB1cGRhdGUuXG4gICAgaWYgKGZpbGVzeXN0ZW1Db250ZW50cyA9PT0gc2F2ZWRDb250ZW50cykge1xuICAgICAgLy8gVGhlIGNoYW5nZXMgaGF2ZW4ndCB0b3VjaGVkIHRoZSBmaWxlc3lzdGVtLCBrZWVwIHVzZXIgZWRpdHMuXG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgey4uLnVwZGF0ZWREaWZmU3RhdGUsIGZpbGVzeXN0ZW1Db250ZW50czogbmV3Q29udGVudHN9LFxuICAgICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGNvbW1pdHRlZCBhbmQgZmlsZXN5c3RlbSBzdGF0ZSBoYXZlIGNoYW5nZWQsIG5vdGlmeSBvZiBvdmVycmlkZS5cbiAgICAgIG5vdGlmeUZpbGVzeXN0ZW1PdmVycmlkZVVzZXJFZGl0cyhmaWxlUGF0aCk7XG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlRGlmZlN0YXRlKFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgdXBkYXRlZERpZmZTdGF0ZSxcbiAgICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBzZXROZXdDb250ZW50cyhuZXdDb250ZW50czogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHsuLi50aGlzLl9hY3RpdmVGaWxlU3RhdGUsIG5ld0NvbnRlbnRzfSk7XG4gIH1cblxuICBzZXRSZXZpc2lvbihyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogdm9pZCB7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1zZXQtcmV2aXNpb24nKTtcbiAgICBjb25zdCByZXBvc2l0b3J5U3RhY2sgPSB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2s7XG4gICAgaW52YXJpYW50KHJlcG9zaXRvcnlTdGFjaywgJ1RoZXJlIG11c3QgYmUgYW4gYWN0aXZlIHJlcG9zaXRvcnkgc3RhY2shJyk7XG4gICAgdGhpcy5fYWN0aXZlRmlsZVN0YXRlID0gey4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSwgY29tcGFyZVJldmlzaW9uSW5mbzogcmV2aXNpb259O1xuICAgIHJlcG9zaXRvcnlTdGFjay5zZXRSZXZpc2lvbihyZXZpc2lvbikuY2F0Y2gobm90aWZ5SW50ZXJuYWxFcnJvcik7XG4gIH1cblxuICBnZXRBY3RpdmVGaWxlU3RhdGUoKTogRmlsZUNoYW5nZVN0YXRlIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICB9XG5cbiAgYXN5bmMgX3VwZGF0ZUFjdGl2ZURpZmZTdGF0ZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmlsZURpZmZTdGF0ZSA9IGF3YWl0IHRoaXMuX2ZldGNoRmlsZURpZmYoZmlsZVBhdGgpO1xuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZTdGF0ZShcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgZmlsZURpZmZTdGF0ZSxcbiAgICAgIGZpbGVEaWZmU3RhdGUuZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICk7XG4gIH1cblxuICBhc3luYyBfdXBkYXRlRGlmZlN0YXRlKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGZpbGVEaWZmU3RhdGU6IEZpbGVEaWZmU3RhdGUsXG4gICAgc2F2ZWRDb250ZW50czogc3RyaW5nLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7XG4gICAgICBjb21taXR0ZWRDb250ZW50czogb2xkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHM6IG5ld0NvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgIH0gPSBmaWxlRGlmZlN0YXRlO1xuICAgIGNvbnN0IHtoYXNoLCBib29rbWFya3N9ID0gcmV2aXNpb25JbmZvO1xuICAgIGNvbnN0IG5ld0ZpbGVTdGF0ZSA9IHtcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgb2xkQ29udGVudHMsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgICBjb21wYXJlUmV2aXNpb25JbmZvOiByZXZpc2lvbkluZm8sXG4gICAgICBmcm9tUmV2aXNpb25UaXRsZTogYCR7aGFzaH1gICsgKGJvb2ttYXJrcy5sZW5ndGggPT09IDAgPyAnJyA6IGAgLSAoJHtib29rbWFya3Muam9pbignLCAnKX0pYCksXG4gICAgICB0b1JldmlzaW9uVGl0bGU6ICdGaWxlc3lzdGVtIC8gRWRpdG9yJyxcbiAgICB9O1xuICAgIHRoaXMuX3NldEFjdGl2ZUZpbGVTdGF0ZShuZXdGaWxlU3RhdGUpO1xuICAgIC8vIFRPRE8obW9zdCk6IEZpeDogdGhpcyBhc3N1bWVzIHRoYXQgdGhlIGVkaXRvciBjb250ZW50cyBhcmVuJ3QgY2hhbmdlZCB3aGlsZVxuICAgIC8vIGZldGNoaW5nIHRoZSBjb21tZW50cywgdGhhdCdzIG9rYXkgbm93IGJlY2F1c2Ugd2UgZG9uJ3QgZmV0Y2ggdGhlbS5cbiAgICBjb25zdCBpbmxpbmVDb21wb25lbnRzID0gYXdhaXQgdGhpcy5fZmV0Y2hJbmxpbmVDb21wb25lbnRzKCk7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHsuLi5uZXdGaWxlU3RhdGUsIGlubGluZUNvbXBvbmVudHN9KTtcbiAgfVxuXG4gIF9zZXRBY3RpdmVGaWxlU3RhdGUoc3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChBQ1RJVkVfRklMRV9VUERBVEVfRVZFTlQsIHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5oZy1zdGF0ZS11cGRhdGUnKVxuICBhc3luYyBfZmV0Y2hGaWxlRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8RmlsZURpZmZTdGF0ZT4ge1xuICAgIC8vIENhbGxpbmcgYXRvbS5wcm9qZWN0LnJlcG9zaXRvcnlGb3JEaXJlY3RvcnkgZ2V0cyB0aGUgcmVhbCBwYXRoIG9mIHRoZSBkaXJlY3RvcnksXG4gICAgLy8gd2hpY2ggaXMgYW5vdGhlciByb3VuZC10cmlwIGFuZCBjYWxscyB0aGUgcmVwb3NpdG9yeSBwcm92aWRlcnMgdG8gZ2V0IGFuIGV4aXN0aW5nIHJlcG9zaXRvcnkuXG4gICAgLy8gSW5zdGVhZCwgdGhlIGZpcnN0IG1hdGNoIG9mIHRoZSBmaWx0ZXJpbmcgaGVyZSBpcyB0aGUgb25seSBwb3NzaWJsZSBtYXRjaC5cbiAgICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgoZmlsZVBhdGgpO1xuICAgIGlmIChyZXBvc2l0b3J5ID09IG51bGwgfHwgcmVwb3NpdG9yeS5nZXRUeXBlKCkgIT09ICdoZycpIHtcbiAgICAgIGNvbnN0IHR5cGUgPSByZXBvc2l0b3J5ID8gcmVwb3NpdG9yeS5nZXRUeXBlKCkgOiAnbm8gcmVwb3NpdG9yeSc7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYERpZmYgdmlldyBvbmx5IHN1cHBvcnRzIFxcYE1lcmN1cmlhbFxcYCByZXBvc2l0b3JpZXMsIGJ1dCBmb3VuZCBcXGAke3R5cGV9XFxgYCk7XG4gICAgfVxuXG4gICAgY29uc3QgaGdSZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQgPSAocmVwb3NpdG9yeTogYW55KTtcbiAgICBjb25zdCByZXBvc2l0b3J5U3RhY2sgPSB0aGlzLl9yZXBvc2l0b3J5U3RhY2tzLmdldChoZ1JlcG9zaXRvcnkpO1xuICAgIGludmFyaWFudChyZXBvc2l0b3J5U3RhY2ssICdUaGVyZSBtdXN0IGJlIGFuIHJlcG9zaXRvcnkgc3RhY2sgZm9yIGEgZ2l2ZW4gcmVwb3NpdG9yeSEnKTtcbiAgICBjb25zdCBbaGdEaWZmXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5mZXRjaEhnRGlmZihmaWxlUGF0aCksXG4gICAgICB0aGlzLl9zZXRBY3RpdmVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeVN0YWNrKSxcbiAgICBdKTtcbiAgICAvLyBJbnRlbnRpb25hbGx5IGZldGNoIHRoZSBmaWxlc3lzdGVtIGNvbnRlbnRzIGFmdGVyIGdldHRpbmcgdGhlIGNvbW1pdHRlZCBjb250ZW50c1xuICAgIC8vIHRvIG1ha2Ugc3VyZSB3ZSBoYXZlIHRoZSBsYXRlc3QgZmlsZXN5c3RlbSB2ZXJzaW9uLlxuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGxvYWRCdWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5oZ0RpZmYsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHM6IGJ1ZmZlci5nZXRUZXh0KCksXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIF9zZXRBY3RpdmVSZXBvc2l0b3J5U3RhY2socmVwb3NpdG9yeVN0YWNrOiBSZXBvc2l0b3J5U3RhY2spOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09PSByZXBvc2l0b3J5U3RhY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID0gcmVwb3NpdG9yeVN0YWNrO1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgcmVwb3NpdG9yeVN0YWNrLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIHRoaXMuX3VwZGF0ZUNoYW5nZWRSZXZpc2lvbnMocmVwb3NpdG9yeVN0YWNrLCByZXZpc2lvbnNTdGF0ZSwgZmFsc2UpO1xuICB9XG5cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5zYXZlLWZpbGUnKVxuICBzYXZlQWN0aXZlRmlsZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gdGhpcy5fYWN0aXZlRmlsZVN0YXRlO1xuICAgIHRyYWNrKCdkaWZmLXZpZXctc2F2ZS1maWxlJywge2ZpbGVQYXRofSk7XG4gICAgcmV0dXJuIHRoaXMuX3NhdmVGaWxlKGZpbGVQYXRoKS5jYXRjaChub3RpZnlJbnRlcm5hbEVycm9yKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnB1Ymxpc2gtZGlmZicpXG4gIGFzeW5jIHB1Ymxpc2hEaWZmKHB1Ymxpc2hNZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlLFxuICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5BV0FJVElOR19QVUJMSVNILFxuICAgIH0pO1xuICAgIGNvbnN0IHtwdWJsaXNoTW9kZX0gPSB0aGlzLl9zdGF0ZTtcbiAgICB0cmFjaygnZGlmZi12aWV3LXB1Ymxpc2gnLCB7XG4gICAgICBwdWJsaXNoTW9kZSxcbiAgICB9KTtcbiAgICBjb25zdCBjbGVhblJlc3VsdCA9IGF3YWl0IHRoaXMuX3Byb21wdFRvQ2xlYW5EaXJ0eUNoYW5nZXMocHVibGlzaE1lc3NhZ2UpO1xuICAgIGlmIChjbGVhblJlc3VsdCA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLlJFQURZLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHthbWVuZGVkLCBhbGxvd1VudHJhY2tlZH0gPSBjbGVhblJlc3VsdDtcbiAgICB0cnkge1xuICAgICAgc3dpdGNoIChwdWJsaXNoTW9kZSkge1xuICAgICAgICBjYXNlIFB1Ymxpc2hNb2RlLkNSRUFURTpcbiAgICAgICAgICAvLyBDcmVhdGUgdXNlcyBgdmVyYmF0aW1gIGFuZCBgbmAgYW5zd2VyIGJ1ZmZlclxuICAgICAgICAgIC8vIGFuZCB0aGF0IGltcGxpZXMgdGhhdCB1bnRyYWNrZWQgZmlsZXMgd2lsbCBiZSBpZ25vcmVkLlxuICAgICAgICAgIGF3YWl0IHRoaXMuX2NyZWF0ZVBoYWJyaWNhdG9yUmV2aXNpb24ocHVibGlzaE1lc3NhZ2UsIGFtZW5kZWQpO1xuICAgICAgICAgIGludmFyaWFudCh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2ssICdObyBhY3RpdmUgcmVwb3NpdG9yeSBzdGFjaycpO1xuICAgICAgICAgIC8vIEludmFsaWRhdGUgdGhlIGN1cnJlbnQgcmV2aXNpb25zIHN0YXRlIGJlY2F1c2UgdGhlIGN1cnJlbnQgY29tbWl0IGluZm8gaGFzIGNoYW5nZWQuXG4gICAgICAgICAgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmdldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFB1Ymxpc2hNb2RlLlVQREFURTpcbiAgICAgICAgICBhd2FpdCB0aGlzLl91cGRhdGVQaGFicmljYXRvclJldmlzaW9uKHB1Ymxpc2hNZXNzYWdlLCBhbGxvd1VudHJhY2tlZCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHB1Ymxpc2ggbW9kZSAnJHtwdWJsaXNoTW9kZX0nYCk7XG4gICAgICB9XG4gICAgICAvLyBQb3B1bGF0ZSBQdWJsaXNoIFVJIHdpdGggdGhlIG1vc3QgcmVjZW50IGRhdGEgYWZ0ZXIgYSBzdWNjZXNzZnVsIHB1c2guXG4gICAgICB0aGlzLl9sb2FkTW9kZVN0YXRlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IsIHRydWUgLypwZXJzaXN0IHRoZSBlcnJvciAodXNlciBkaXNtaXNzYWJsZSkqLyk7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgICBwdWJsaXNoTW9kZVN0YXRlOiBQdWJsaXNoTW9kZVN0YXRlLlJFQURZLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3Byb21wdFRvQ2xlYW5EaXJ0eUNoYW5nZXMoXG4gICAgY29tbWl0TWVzc2FnZTogc3RyaW5nLFxuICApOiBQcm9taXNlPD97YWxsb3dVbnRyYWNrZWQ6IGJvb2xlYW47IGFtZW5kZWQ6IGJvb2xlYW47fT4ge1xuICAgIGNvbnN0IGFjdGl2ZVN0YWNrID0gdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrO1xuICAgIGludmFyaWFudChhY3RpdmVTdGFjayAhPSBudWxsLCAnTm8gYWN0aXZlIHJlcG9zaXRvcnkgc3RhY2sgd2hlbiBjbGVhbmluZyBkaXJ0eSBjaGFuZ2VzJyk7XG4gICAgY29uc3QgZGlydHlGaWxlQ2hhbmdlcyA9IGFjdGl2ZVN0YWNrLmdldERpcnR5RmlsZUNoYW5nZXMoKTtcbiAgICBsZXQgc2hvdWxkQW1lbmQgPSBmYWxzZTtcbiAgICBsZXQgYW1lbmRlZCA9IGZhbHNlO1xuICAgIGxldCBhbGxvd1VudHJhY2tlZCA9IGZhbHNlO1xuICAgIGlmIChkaXJ0eUZpbGVDaGFuZ2VzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFtZW5kZWQsXG4gICAgICAgIGFsbG93VW50cmFja2VkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgdW50cmFja2VkQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4gPSBuZXcgTWFwKFxuICAgICAgYXJyYXkuZnJvbShkaXJ0eUZpbGVDaGFuZ2VzLmVudHJpZXMoKSlcbiAgICAgICAgLmZpbHRlcihmaWxlQ2hhbmdlID0+IGZpbGVDaGFuZ2VbMV0gPT09IEZpbGVDaGFuZ2VTdGF0dXMuVU5UUkFDS0VEKVxuICAgICk7XG4gICAgaWYgKHVudHJhY2tlZENoYW5nZXMuc2l6ZSA+IDApIHtcbiAgICAgIGNvbnN0IHVudHJhY2tlZENob2ljZSA9IGF0b20uY29uZmlybSh7XG4gICAgICAgIG1lc3NhZ2U6ICdZb3UgaGF2ZSB1bnRyYWNrZWQgZmlsZXMgaW4geW91ciB3b3JraW5nIGNvcHk6JyxcbiAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBnZXRGaWxlU3RhdHVzTGlzdE1lc3NhZ2UodW50cmFja2VkQ2hhbmdlcyksXG4gICAgICAgIGJ1dHRvbnM6IFsnQ2FuY2VsJywgJ0FkZCcsICdBbGxvdyBVbnRyYWNrZWQnXSxcbiAgICAgIH0pO1xuICAgICAgZ2V0TG9nZ2VyKCkuaW5mbygnVW50cmFja2VkIGNoYW5nZXMgY2hvaWNlOicsIHVudHJhY2tlZENob2ljZSk7XG4gICAgICBpZiAodW50cmFja2VkQ2hvaWNlID09PSAwKSAvKkNhbmNlbCovIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2UgaWYgKHVudHJhY2tlZENob2ljZSA9PT0gMSkgLypBZGQqLyB7XG4gICAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLmFkZChhcnJheS5mcm9tKHVudHJhY2tlZENoYW5nZXMua2V5cygpKSk7XG4gICAgICAgIHNob3VsZEFtZW5kID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodW50cmFja2VkQ2hvaWNlID09PSAyKSAvKkFsbG93IFVudHJhY2tlZCovIHtcbiAgICAgICAgYWxsb3dVbnRyYWNrZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXZlcnRhYmxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4gPSBuZXcgTWFwKFxuICAgICAgYXJyYXkuZnJvbShkaXJ0eUZpbGVDaGFuZ2VzLmVudHJpZXMoKSlcbiAgICAgICAgLmZpbHRlcihmaWxlQ2hhbmdlID0+IGZpbGVDaGFuZ2VbMV0gIT09IEZpbGVDaGFuZ2VTdGF0dXMuVU5UUkFDS0VEKVxuICAgICk7XG4gICAgaWYgKHJldmVydGFibGVDaGFuZ2VzLnNpemUgPiAwKSB7XG4gICAgICBjb25zdCBjbGVhbkNob2ljZSA9IGF0b20uY29uZmlybSh7XG4gICAgICAgIG1lc3NhZ2U6ICdZb3UgaGF2ZSB1bmNvbW1pdHRlZCBjaGFuZ2VzIGluIHlvdXIgd29ya2luZyBjb3B5OicsXG4gICAgICAgIGRldGFpbGVkTWVzc2FnZTogZ2V0RmlsZVN0YXR1c0xpc3RNZXNzYWdlKHJldmVydGFibGVDaGFuZ2VzKSxcbiAgICAgICAgYnV0dG9uczogWydDYW5jZWwnLCAnUmV2ZXJ0JywgJ0FtZW5kJ10sXG4gICAgICB9KTtcbiAgICAgIGdldExvZ2dlcigpLmluZm8oJ0RpcnR5IGNoYW5nZXMgY2xlYW4gY2hvaWNlOicsIGNsZWFuQ2hvaWNlKTtcbiAgICAgIGlmIChjbGVhbkNob2ljZSA9PT0gMCkgLypDYW5jZWwqLyB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIGlmIChjbGVhbkNob2ljZSA9PT0gMSkgLypSZXZlcnQqLyB7XG4gICAgICAgIGNvbnN0IGNhblJldmVydEZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4gPSBhcnJheVxuICAgICAgICAgIC5mcm9tKGRpcnR5RmlsZUNoYW5nZXMuZW50cmllcygpKVxuICAgICAgICAgIC5maWx0ZXIoZmlsZUNoYW5nZSA9PiBmaWxlQ2hhbmdlWzFdICE9PSBGaWxlQ2hhbmdlU3RhdHVzLlVOVFJBQ0tFRClcbiAgICAgICAgICAubWFwKGZpbGVDaGFuZ2UgPT4gZmlsZUNoYW5nZVswXSk7XG4gICAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLnJldmVydChjYW5SZXZlcnRGaWxlUGF0aHMpO1xuICAgICAgfSBlbHNlIGlmIChjbGVhbkNob2ljZSA9PT0gMikgLypBbWVuZCovIHtcbiAgICAgICAgc2hvdWxkQW1lbmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2hvdWxkQW1lbmQpIHtcbiAgICAgIGF3YWl0IGFjdGl2ZVN0YWNrLmFtZW5kKGNvbW1pdE1lc3NhZ2UpO1xuICAgICAgYW1lbmRlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBhbWVuZGVkLFxuICAgICAgYWxsb3dVbnRyYWNrZWQsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIF9jcmVhdGVQaGFicmljYXRvclJldmlzaW9uKFxuICAgIHB1Ymxpc2hNZXNzYWdlOiBzdHJpbmcsXG4gICAgYW1lbmRlZDogYm9vbGVhbixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBjb25zdCBsYXN0Q29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2xvYWRBY3RpdmVSZXBvc2l0b3J5TGF0ZXN0Q29tbWl0TWVzc2FnZSgpO1xuICAgIGlmICghYW1lbmRlZCAmJiBwdWJsaXNoTWVzc2FnZSAhPT0gbGFzdENvbW1pdE1lc3NhZ2UpIHtcbiAgICAgIGdldExvZ2dlcigpLmluZm8oJ0FtZW5kaW5nIGNvbW1pdCB3aXRoIHRoZSB1cGRhdGVkIG1lc3NhZ2UnKTtcbiAgICAgIGludmFyaWFudCh0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2spO1xuICAgICAgYXdhaXQgdGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrLmFtZW5kKHB1Ymxpc2hNZXNzYWdlKTtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb21taXQgYW1lbmRlZCB3aXRoIHRoZSB1cGRhdGVkIG1lc3NhZ2UnKTtcbiAgICB9XG4gICAgYXdhaXQgYXJjYW5pc3QuY3JlYXRlUGhhYnJpY2F0b3JSZXZpc2lvbihmaWxlUGF0aCk7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ1JldmlzaW9uIGNyZWF0ZWQnKTtcbiAgfVxuXG4gIGFzeW5jIF91cGRhdGVQaGFicmljYXRvclJldmlzaW9uKFxuICAgIHB1Ymxpc2hNZXNzYWdlOiBzdHJpbmcsXG4gICAgYWxsb3dVbnRyYWNrZWQ6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLl9hY3RpdmVGaWxlU3RhdGU7XG4gICAgY29uc3Qge3BoYWJyaWNhdG9yUmV2aXNpb259ID0gYXdhaXQgdGhpcy5fZ2V0QWN0aXZlSGVhZFJldmlzaW9uRGV0YWlscygpO1xuICAgIGludmFyaWFudChwaGFicmljYXRvclJldmlzaW9uICE9IG51bGwsICdBIHBoYWJyaWNhdG9yIHJldmlzaW9uIG11c3QgZXhpc3QgdG8gdXBkYXRlIScpO1xuICAgIGNvbnN0IHVwZGF0ZVRlbXBsYXRlID0gZ2V0UmV2aXNpb25VcGRhdGVNZXNzYWdlKHBoYWJyaWNhdG9yUmV2aXNpb24pLnRyaW0oKTtcbiAgICBjb25zdCB1c2VyVXBkYXRlTWVzc2FnZSA9IHB1Ymxpc2hNZXNzYWdlLnJlcGxhY2UodXBkYXRlVGVtcGxhdGUsICcnKS50cmltKCk7XG4gICAgaWYgKHVzZXJVcGRhdGVNZXNzYWdlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXBkYXRlIHJldmlzaW9uIHdpdGggZW1wdHkgbWVzc2FnZScpO1xuICAgIH1cbiAgICBhd2FpdCBhcmNhbmlzdC51cGRhdGVQaGFicmljYXRvclJldmlzaW9uKGZpbGVQYXRoLCB1c2VyVXBkYXRlTWVzc2FnZSwgYWxsb3dVbnRyYWNrZWQpO1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKGBSZXZpc2lvbiBcXGAke3BoYWJyaWNhdG9yUmV2aXNpb24uaWR9XFxgIHVwZGF0ZWRgKTtcbiAgfVxuXG4gIF9vbldpbGxTYXZlQWN0aXZlQnVmZmVyKGJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0QWN0aXZlRmlsZVN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX2FjdGl2ZUZpbGVTdGF0ZSxcbiAgICAgIHNhdmVkQ29udGVudHM6IGJ1ZmZlci5nZXRUZXh0KCksXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfc2F2ZUZpbGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIGlmIChidWZmZXIgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBmaWxlIGJ1ZmZlciB0byBzYXZlOiBcXGAke2ZpbGVQYXRofVxcYGApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYnVmZmVyLnNhdmUoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHNhdmUgZmlsZSBidWZmZXI6IFxcYCR7ZmlsZVBhdGh9XFxgIC0gJHtlcnIudG9TdHJpbmcoKX1gKTtcbiAgICB9XG4gIH1cblxuICBvbkRpZFVwZGF0ZVN0YXRlKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihESURfVVBEQVRFX1NUQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvblJldmlzaW9uc1VwZGF0ZShjYWxsYmFjazogKHN0YXRlOiA/UmV2aXNpb25zU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25BY3RpdmVGaWxlVXBkYXRlcyhjYWxsYmFjazogKHN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQUNUSVZFX0ZJTEVfVVBEQVRFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1jb21tZW50cycpXG4gIGFzeW5jIF9mZXRjaElubGluZUNvbXBvbmVudHMoKTogUHJvbWlzZTxBcnJheTxPYmplY3Q+PiB7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IHRoaXMuX2FjdGl2ZUZpbGVTdGF0ZTtcbiAgICBjb25zdCB1aUVsZW1lbnRQcm9taXNlcyA9IHRoaXMuX3VpUHJvdmlkZXJzLm1hcChcbiAgICAgIHByb3ZpZGVyID0+IHByb3ZpZGVyLmNvbXBvc2VVaUVsZW1lbnRzKGZpbGVQYXRoKVxuICAgICk7XG4gICAgY29uc3QgdWlDb21wb25lbnRMaXN0cyA9IGF3YWl0IFByb21pc2UuYWxsKHVpRWxlbWVudFByb21pc2VzKTtcbiAgICAvLyBGbGF0dGVuIHVpQ29tcG9uZW50TGlzdHMgZnJvbSBsaXN0IG9mIGxpc3RzIG9mIGNvbXBvbmVudHMgdG8gYSBsaXN0IG9mIGNvbXBvbmVudHMuXG4gICAgY29uc3QgdWlDb21wb25lbnRzID0gW10uY29uY2F0LmFwcGx5KFtdLCB1aUNvbXBvbmVudExpc3RzKTtcbiAgICByZXR1cm4gdWlDb21wb25lbnRzO1xuICB9XG5cbiAgYXN5bmMgX2xvYWRDb21taXRNb2RlU3RhdGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBjb21taXRNb2RlU3RhdGU6IENvbW1pdE1vZGVTdGF0ZS5MT0FESU5HX0NPTU1JVF9NRVNTQUdFLFxuICAgIH0pO1xuXG4gICAgbGV0IGNvbW1pdE1lc3NhZ2U7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLl9zdGF0ZS5jb21taXRNb2RlID09PSBDb21taXRNb2RlLkNPTU1JVCkge1xuICAgICAgICBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fbG9hZEFjdGl2ZVJlcG9zaXRvcnlUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgICAgICAgLy8gQ29tbWl0IHRlbXBsYXRlcyB0aGF0IGluY2x1ZGUgbmV3bGluZSBzdHJpbmdzLCAnXFxcXG4nIGluIEphdmFTY3JpcHQsIG5lZWQgdG8gY29udmVydCB0aGVpclxuICAgICAgICAvLyBzdHJpbmdzIHRvIGxpdGVyYWwgbmV3bGluZXMsICdcXG4nIGluIEphdmFTY3JpcHQsIHRvIGJlIHJlbmRlcmVkIGFzIGxpbmUgYnJlYWtzLlxuICAgICAgICBpZiAoY29tbWl0TWVzc2FnZSAhPSBudWxsKSB7XG4gICAgICAgICAgY29tbWl0TWVzc2FnZSA9IGNvbnZlcnROZXdsaW5lcyhjb21taXRNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2xvYWRBY3RpdmVSZXBvc2l0b3J5TGF0ZXN0Q29tbWl0TWVzc2FnZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TWVzc2FnZSxcbiAgICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuUkVBRFksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfbG9hZFB1Ymxpc2hNb2RlU3RhdGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBwdWJsaXNoTW9kZTogUHVibGlzaE1vZGUuQ1JFQVRFLFxuICAgICAgcHVibGlzaE1vZGVTdGF0ZTogUHVibGlzaE1vZGVTdGF0ZS5MT0FESU5HX1BVQkxJU0hfTUVTU0FHRSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlOiBudWxsLFxuICAgICAgaGVhZFJldmlzaW9uOiBudWxsLFxuICAgIH0pO1xuICAgIGNvbnN0IHtoZWFkUmV2aXNpb24sIHBoYWJyaWNhdG9yUmV2aXNpb259ID0gYXdhaXQgdGhpcy5fZ2V0QWN0aXZlSGVhZFJldmlzaW9uRGV0YWlscygpO1xuICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuX3N0YXRlLFxuICAgICAgcHVibGlzaE1vZGU6IHBoYWJyaWNhdG9yUmV2aXNpb24gIT0gbnVsbCA/IFB1Ymxpc2hNb2RlLlVQREFURSA6IFB1Ymxpc2hNb2RlLkNSRUFURSxcbiAgICAgIHB1Ymxpc2hNb2RlU3RhdGU6IFB1Ymxpc2hNb2RlU3RhdGUuUkVBRFksXG4gICAgICBwdWJsaXNoTWVzc2FnZTogcGhhYnJpY2F0b3JSZXZpc2lvbiAhPSBudWxsXG4gICAgICAgID8gZ2V0UmV2aXNpb25VcGRhdGVNZXNzYWdlKHBoYWJyaWNhdG9yUmV2aXNpb24pXG4gICAgICAgIDogaGVhZFJldmlzaW9uLmRlc2NyaXB0aW9uLFxuICAgICAgaGVhZFJldmlzaW9uLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX2dldEFjdGl2ZUhlYWRSZXZpc2lvbkRldGFpbHMoKTogUHJvbWlzZTx7XG4gICAgaGVhZFJldmlzaW9uOiBSZXZpc2lvbkluZm87XG4gICAgcGhhYnJpY2F0b3JSZXZpc2lvbjogP1BoYWJyaWNhdG9yUmV2aXNpb25JbmZvO1xuICB9PiB7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLmdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCk7XG4gICAgaWYgKHJldmlzaW9uc1N0YXRlID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IExvYWQgUHVibGlzaCBWaWV3OiBObyBhY3RpdmUgZmlsZSBvciByZXBvc2l0b3J5Jyk7XG4gICAgfVxuICAgIGNvbnN0IHtyZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG4gICAgaW52YXJpYW50KHJldmlzaW9ucy5sZW5ndGggPiAwLCAnRGlmZiBWaWV3IEVycm9yOiBaZXJvIFJldmlzaW9ucycpO1xuICAgIGNvbnN0IGhlYWRSZXZpc2lvbiA9IHJldmlzaW9uc1tyZXZpc2lvbnMubGVuZ3RoIC0gMV07XG4gICAgY29uc3QgcGhhYnJpY2F0b3JSZXZpc2lvbiA9IGFyY2FuaXN0LmdldFBoYWJyaWNhdG9yUmV2aXNpb25Gcm9tQ29tbWl0TWVzc2FnZShcbiAgICAgIGhlYWRSZXZpc2lvbi5kZXNjcmlwdGlvbixcbiAgICApO1xuICAgIHJldHVybiB7XG4gICAgICBoZWFkUmV2aXNpb24sXG4gICAgICBwaGFicmljYXRvclJldmlzaW9uLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBfbG9hZEFjdGl2ZVJlcG9zaXRvcnlMYXRlc3RDb21taXRNZXNzYWdlKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZmYgVmlldzogTm8gYWN0aXZlIGZpbGUgb3IgcmVwb3NpdG9yeSBvcGVuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRBY3RpdmVSZXZpc2lvbnNTdGF0ZSgpO1xuICAgIGludmFyaWFudChyZXZpc2lvbnNTdGF0ZSwgJ0RpZmYgVmlldyBJbnRlcm5hbCBFcnJvcjogcmV2aXNpb25zU3RhdGUgY2Fubm90IGJlIG51bGwnKTtcbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIGludmFyaWFudChyZXZpc2lvbnMubGVuZ3RoID4gMCwgJ0RpZmYgVmlldyBFcnJvcjogQ2Fubm90IGFtZW5kIG5vbi1leGlzdGluZyBjb21taXQnKTtcbiAgICByZXR1cm4gcmV2aXNpb25zW3JldmlzaW9ucy5sZW5ndGggLSAxXS5kZXNjcmlwdGlvbjtcbiAgfVxuXG4gIF9sb2FkQWN0aXZlUmVwb3NpdG9yeVRlbXBsYXRlQ29tbWl0TWVzc2FnZSgpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGlmZiBWaWV3OiBObyBhY3RpdmUgZmlsZSBvciByZXBvc2l0b3J5IG9wZW4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTtcbiAgfVxuXG4gIGFzeW5jIGdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCk6IFByb21pc2U8P1JldmlzaW9uc1N0YXRlPiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjayA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgfVxuXG4gIF9zZXRTdGF0ZShuZXdTdGF0ZTogU3RhdGUpIHtcbiAgICB0aGlzLl9zdGF0ZSA9IG5ld1N0YXRlO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChESURfVVBEQVRFX1NUQVRFX0VWRU5UKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmNvbW1pdCcpXG4gIGFzeW5jIGNvbW1pdChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAobWVzc2FnZSA9PT0gJycpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignQ29tbWl0IGFib3J0ZWQnLCB7ZGV0YWlsOiAnQ29tbWl0IG1lc3NhZ2UgZW1wdHknfSk7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRoaXMuX3N0YXRlLmNvbW1pdE1vZGUgPT09IENvbW1pdE1vZGUuQ09NTUlUXG4gICAgICAmJiBtZXNzYWdlID09PSB0aGlzLl9zdGF0ZS5jb21taXRNZXNzYWdlXG4gICAgKSB7XG4gICAgICAvLyBXaGVuIGNyZWF0aW5nIGEgbmV3IGNvbW1pdCwgdGhlIGluaXRpYWwgY29tbWl0IG1lc3NhZ2UgaXMgY3JlYXRlZCBmcm9tIGEgdGVtcGxhdGUuIFRoZVxuICAgICAgLy8gbWVzc2FnZSBtdXN0IGRpZmZlciBmcm9tIHRoZSB0ZW1wbGF0ZSB0byBiZSBzdWNjZXNzZnVsLlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdDb21taXQgYWJvcnRlZCcsIHtkZXRhaWw6ICdDb21taXQgbWVzc2FnZSB1bmNoYW5nZWQnfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5fc3RhdGUsXG4gICAgICBjb21taXRNZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuQVdBSVRJTkdfQ09NTUlULFxuICAgIH0pO1xuXG4gICAgY29uc3Qge2NvbW1pdE1vZGV9ID0gdGhpcy5fc3RhdGU7XG4gICAgdHJhY2soJ2RpZmYtdmlldy1jb21taXQnLCB7XG4gICAgICBjb21taXRNb2RlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYWN0aXZlU3RhY2sgPSB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2s7XG4gICAgdHJ5IHtcbiAgICAgIGludmFyaWFudChhY3RpdmVTdGFjaywgJ05vIGFjdGl2ZSByZXBvc2l0b3J5IHN0YWNrJyk7XG4gICAgICBzd2l0Y2ggKGNvbW1pdE1vZGUpIHtcbiAgICAgICAgY2FzZSBDb21taXRNb2RlLkNPTU1JVDpcbiAgICAgICAgICBhd2FpdCBhY3RpdmVTdGFjay5jb21taXQobWVzc2FnZSk7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ0NvbW1pdCBjcmVhdGVkJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQ29tbWl0TW9kZS5BTUVORDpcbiAgICAgICAgICBhd2FpdCBhY3RpdmVTdGFjay5hbWVuZChtZXNzYWdlKTtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnQ29tbWl0IGFtZW5kZWQnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuTE9BRElOR19DT01NSVRfTUVTU0FHRSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBGb3JjZSB0cmlnZ2VyIGFuIHVwZGF0ZSB0byB0aGUgcmV2aXNpb25zIHRvIHVwZGF0ZSB0aGUgVUkgc3RhdGUgd2l0aCB0aGUgbmV3IGNvbW1pdCBpbmZvLlxuICAgICAgYWN0aXZlU3RhY2suZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAnRXJyb3IgY3JlYXRpbmcgY29tbWl0JyxcbiAgICAgICAge2RldGFpbDogYERldGFpbHM6ICR7ZS5zdGRvdXR9YH0sXG4gICAgICApO1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgY29tbWl0TW9kZVN0YXRlOiBDb21taXRNb2RlU3RhdGUuUkVBRFksXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBnZXRTdGF0ZSgpOiBTdGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICB9XG5cbiAgc2V0Q29tbWl0TW9kZShjb21taXRNb2RlOiBDb21taXRNb2RlVHlwZSk6IHZvaWQge1xuICAgIHRyYWNrKCdkaWZmLXZpZXctc3dpdGNoLWNvbW1pdC1tb2RlJywge1xuICAgICAgY29tbWl0TW9kZSxcbiAgICB9KTtcbiAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgIGNvbW1pdE1vZGUsXG4gICAgfSk7XG4gICAgLy8gV2hlbiB0aGUgY29tbWl0IG1vZGUgY2hhbmdlcywgbG9hZCB0aGUgYXBwcm9wcmlhdGUgY29tbWl0IG1lc3NhZ2UuXG4gICAgdGhpcy5fbG9hZENvbW1pdE1vZGVTdGF0ZSgpO1xuICB9XG5cbiAgYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlUmVwb3NpdG9yaWVzKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgcmVwb3NpdG9yeVN0YWNrIG9mIHRoaXMuX3JlcG9zaXRvcnlTdGFja3MudmFsdWVzKCkpIHtcbiAgICAgIHJlcG9zaXRvcnlTdGFjay5hY3RpdmF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fYWN0aXZlUmVwb3NpdG9yeVN0YWNrICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVJlcG9zaXRvcnlTdGFjay5kZWFjdGl2YXRlKCk7XG4gICAgICB0aGlzLl9hY3RpdmVSZXBvc2l0b3J5U3RhY2sgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9zZXRBY3RpdmVGaWxlU3RhdGUoZ2V0SW5pdGlhbEZpbGVDaGFuZ2VTdGF0ZSgpKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgZm9yIChjb25zdCByZXBvc2l0b3J5U3RhY2sgb2YgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy52YWx1ZXMoKSkge1xuICAgICAgcmVwb3NpdG9yeVN0YWNrLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fcmVwb3NpdG9yeVN0YWNrcy5jbGVhcigpO1xuICAgIGZvciAoY29uc3Qgc3Vic2NyaXB0aW9uIG9mIHRoaXMuX3JlcG9zaXRvcnlTdWJzY3JpcHRpb25zLnZhbHVlcygpKSB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXBvc2l0b3J5U3Vic2NyaXB0aW9ucy5jbGVhcigpO1xuICAgIGlmICh0aGlzLl9hY3RpdmVTdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlZpZXdNb2RlbDtcbiJdfQ==