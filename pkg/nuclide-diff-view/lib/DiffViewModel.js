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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideArcanistBaseLibUtils2;

function _nuclideArcanistBaseLibUtils() {
  return _nuclideArcanistBaseLibUtils2 = require('../../nuclide-arcanist-base/lib/utils');
}

var _nuclideArcanistClient2;

function _nuclideArcanistClient() {
  return _nuclideArcanistClient2 = _interopRequireDefault(require('../../nuclide-arcanist-client'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _shell2;

function _shell() {
  return _shell2 = _interopRequireDefault(require('shell'));
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../nuclide-hg-git-bridge');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _RepositoryStack2;

function _RepositoryStack() {
  return _RepositoryStack2 = _interopRequireDefault(require('./RepositoryStack'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var _notifications2;

function _notifications() {
  return _notifications2 = require('./notifications');
}

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../commons-atom/text-editor');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var ACTIVE_FILE_UPDATE_EVENT = 'active-file-update';
var CHANGE_REVISIONS_EVENT = 'did-change-revisions';
var ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT = 'active-buffer-change-modified';
var DID_UPDATE_STATE_EVENT = 'did-update-state';

function getRevisionUpdateMessage(phabricatorRevision) {
  return '\n\n# Updating ' + phabricatorRevision.name + '\n#\n# Enter a brief description of the changes included in this update.\n# The first line is used as subject, next lines as comment.';
}

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
    case (_constants2 || _constants()).DiffMode.COMMIT_MODE:
      return (_constants2 || _constants()).DiffOption.DIRTY;
    case (_constants2 || _constants()).DiffMode.PUBLISH_MODE:
      return (_constants2 || _constants()).DiffOption.LAST_COMMIT;
    case (_constants2 || _constants()).DiffMode.BROWSE_MODE:
      return (_constants2 || _constants()).DiffOption.COMPARE_COMMIT;
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

      message += '\n' + (_constants2 || _constants()).FileChangeStatusToPrefix[statusCode] + atom.project.relativize(filePath);
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
  var repository = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(filePath);
  if (repository == null || repository.getType() !== 'hg') {
    var _type = repository ? repository.getType() : 'no repository';
    throw new Error('Diff view only supports `Mercurial` repositories, ' + ('but found `' + _type + '` at path: `' + filePath + '`'));
  }
  return repository;
}

function notifyRevisionStatus(phabRevision, statusMessage) {
  var message = 'Revision ' + statusMessage;
  if (phabRevision == null) {
    atom.notifications.addSuccess(message, { nativeFriendly: true });
    return;
  }
  var name = phabRevision.name;
  var url = phabRevision.url;

  message = 'Revision \'' + name + '\' ' + statusMessage;
  atom.notifications.addSuccess(message, {
    dismissable: true,
    buttons: [{
      className: 'icon icon-globe',
      onDidClick: function onDidClick() {
        (_shell2 || _shell()).default.openExternal(url);
      },
      text: 'Open in Phabricator'
    }],
    nativeFriendly: true
  });
}

var DiffViewModel = (function () {
  function DiffViewModel() {
    var _this = this;

    _classCallCheck(this, DiffViewModel);

    this._emitter = new (_atom2 || _atom()).Emitter();
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._activeSubscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._uiProviders = [];
    this._repositoryStacks = new Map();
    this._repositorySubscriptions = new Map();
    this._isActive = false;
    this._publishUpdates = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Subject();
    this._state = {
      viewMode: (_constants2 || _constants()).DiffMode.BROWSE_MODE,
      commitMessage: null,
      commitMode: (_constants2 || _constants()).CommitMode.COMMIT,
      commitModeState: (_constants2 || _constants()).CommitModeState.READY,
      publishMessage: null,
      publishMode: (_constants2 || _constants()).PublishMode.CREATE,
      publishModeState: (_constants2 || _constants()).PublishModeState.READY,
      headRevision: null,
      dirtyFileChanges: new Map(),
      selectedFileChanges: new Map(),
      showNonHgRepos: true
    };
    this._serializedUpdateActiveFileDiff = (0, (_commonsNodePromise2 || _commonsNodePromise()).serializeAsyncCall)(function () {
      return _this._updateActiveFileDiff();
    });
    this._setActiveFileState(getInitialFileChangeState());
    this._updateRepositories();
    this._subscriptions.add(atom.project.onDidChangePaths(this._updateRepositories.bind(this)));
  }

  _createDecoratedClass(DiffViewModel, [{
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
        this._repositoryStacks.delete(repository);
        var subscriptions = this._repositorySubscriptions.get(repository);
        (0, (_assert2 || _assert()).default)(subscriptions);
        subscriptions.dispose();
        this._repositorySubscriptions.delete(repository);
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
      this._updateSelectedFileChanges();
      // Clear the active diff state if it was from a repo that's now removed.
      var filePath = this._activeFileState.filePath;

      if (filePath && !repositories.has((0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(filePath))) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().info('Diff View\'s active buffer was belonging to a removed project.\n' + 'Clearing the UI state.');
        this._activeSubscriptions.dispose();
        this._setActiveFileState(getInitialFileChangeState());
      }
    }
  }, {
    key: '_createRepositoryStack',
    value: function _createRepositoryStack(repository) {
      var _this2 = this;

      var repositoryStack = new (_RepositoryStack2 || _RepositoryStack()).default(repository, viewModeToDiffOption(this._state.viewMode));
      var subscriptions = new (_atom2 || _atom()).CompositeDisposable();
      subscriptions.add(repositoryStack.onDidUpdateDirtyFileChanges(this._updateDirtyChangedStatus.bind(this)), repositoryStack.onDidUpdateSelectedFileChanges(this._updateSelectedFileChanges.bind(this)), repositoryStack.onDidChangeRevisions(function (revisionsState) {
        _this2._updateChangedRevisions(repositoryStack, revisionsState, true).catch((_notifications2 || _notifications()).notifyInternalError);
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
      var dirtyFileChanges = (0, (_commonsNodeCollection2 || _commonsNodeCollection()).mapUnion).apply(undefined, _toConsumableArray(Array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
        return repositoryStack.getDirtyFileChanges();
      })));
      this._updateViewChangedFilesStatus(dirtyFileChanges);
    }
  }, {
    key: 'getActiveStackDirtyFileChanges',
    value: function getActiveStackDirtyFileChanges() {
      if (this._activeRepositoryStack == null) {
        return new Map();
      } else {
        return this._activeRepositoryStack.getDirtyFileChanges();
      }
    }
  }, {
    key: '_updateSelectedFileChanges',
    value: function _updateSelectedFileChanges() {
      var selectedFileChanges = (0, (_commonsNodeCollection2 || _commonsNodeCollection()).mapUnion).apply(undefined, _toConsumableArray(Array.from(this._repositoryStacks.values()).map(function (repositoryStack) {
        return repositoryStack.getSelectedFileChanges();
      })));
      this._updateViewChangedFilesStatus(null, selectedFileChanges);
    }
  }, {
    key: '_updateViewChangedFilesStatus',
    value: function _updateViewChangedFilesStatus(dirtyFileChanges, selectedFileChanges) {
      var _this3 = this;

      if (dirtyFileChanges == null) {
        dirtyFileChanges = this._state.dirtyFileChanges;
      }
      if (selectedFileChanges == null) {
        selectedFileChanges = this._state.selectedFileChanges;
      }
      var filteredFileChanges = undefined;
      var showNonHgRepos = undefined;
      var activeRepositorySelector = function activeRepositorySelector() {
        return true;
      };
      if (this._activeRepositoryStack != null) {
        (function () {
          var projectDirectory = _this3._activeRepositoryStack.getRepository().getProjectDirectory();
          activeRepositorySelector = function (filePath) {
            return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.contains(projectDirectory, filePath);
          };
        })();
      }
      switch (this._state.viewMode) {
        case (_constants2 || _constants()).DiffMode.COMMIT_MODE:
        case (_constants2 || _constants()).DiffMode.PUBLISH_MODE:
          // Commit mode only shows the changes of the active repository.
          filteredFileChanges = (0, (_commonsNodeCollection2 || _commonsNodeCollection()).mapFilter)(selectedFileChanges, activeRepositorySelector);
          // Publish mode only shows the changes of the active repository.
          filteredFileChanges = (0, (_commonsNodeCollection2 || _commonsNodeCollection()).mapFilter)(selectedFileChanges, activeRepositorySelector);
          showNonHgRepos = false;
          break;
        case (_constants2 || _constants()).DiffMode.BROWSE_MODE:
          // Broswe mode shows all changes from all repositories.
          filteredFileChanges = selectedFileChanges;
          showNonHgRepos = true;
          break;
        default:
          throw new Error('Unrecognized view mode!');
      }
      this._setState(_extends({}, this._state, {
        dirtyFileChanges: dirtyFileChanges,
        selectedFileChanges: filteredFileChanges,
        showNonHgRepos: showNonHgRepos
      }));
    }
  }, {
    key: '_updateChangedRevisions',
    value: _asyncToGenerator(function* (repositoryStack, revisionsState, reloadFileDiffState) {
      if (repositoryStack !== this._activeRepositoryStack) {
        return;
      }
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-update-timeline-revisions', {
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
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-switch-mode', {
        viewMode: viewMode
      });
      this._setState(_extends({}, this._state, {
        viewMode: viewMode
      }));
      if (this._activeRepositoryStack != null) {
        this._activeRepositoryStack.setDiffOption(viewModeToDiffOption(this._state.viewMode));
      }
      this._updateViewChangedFilesStatus();
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
        case (_constants2 || _constants()).DiffMode.COMMIT_MODE:
          this._loadCommitModeState();
          break;
        case (_constants2 || _constants()).DiffMode.PUBLISH_MODE:
          this._loadPublishModeState().catch((_notifications2 || _notifications()).notifyInternalError);
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
          return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.contains(parentPath, filePath);
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
        var repository = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(entityOption.file || entityOption.directory || '');
        if (repository != null && repository.getType() === 'hg' && this._repositoryStacks.has(repository)) {
          var repositoryStack = this._repositoryStacks.get(repository);
          (0, (_assert2 || _assert()).default)(repositoryStack);
          this._setActiveRepositoryStack(repositoryStack);
        } else if (this._activeRepositoryStack == null) {
          // This can only happen none of the project folders are Mercurial repositories.
          // However, this is caught earlier with a better error message.
          throw new Error('No active repository stack and non-diffable entity:' + JSON.stringify(entityOption));
        } else {
          (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Non diffable entity:', entityOption);
        }
      }
      var viewMode = entityOption.viewMode;
      var commitMode = entityOption.commitMode;

      if (viewMode !== this._state.viewMode || commitMode !== this._state.commitMode) {
        if (viewMode === (_constants2 || _constants()).DiffMode.COMMIT_MODE) {
          (0, (_assert2 || _assert()).default)(commitMode, 'DIFF: Commit Mode not set!');
          this.setViewMode((_constants2 || _constants()).DiffMode.COMMIT_MODE, false);
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
      this._setActiveFileState(_extends({}, getInitialFileChangeState(), {
        filePath: filePath
      }));
      this._activeSubscriptions.dispose();
      this._activeSubscriptions = new (_atom2 || _atom()).CompositeDisposable();
      // TODO(most): Show progress indicator: t8991676
      var buffer = (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).bufferForUri)(filePath);
      this._activeSubscriptions.add(buffer.onDidReload(function () {
        return _this4._onActiveBufferReload(filePath, buffer).catch((_notifications2 || _notifications()).notifyInternalError);
      }));
      this._activeSubscriptions.add(buffer.onDidDestroy(function () {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().info('Diff View\'s active buffer has been destroyed.\n' + 'The underlying file could have been removed.');
        _this4._activeSubscriptions.dispose();
        _this4._setActiveFileState(getInitialFileChangeState());
      }));
      this._activeSubscriptions.add(buffer.onDidChangeModified(this.emitActiveBufferChangeModified.bind(this)));
      // Modified events could be late that it doesn't capture the latest edits / state changes.
      // Hence, it's safe to re-emit changes when stable from changes.
      this._activeSubscriptions.add(buffer.onDidStopChanging(this.emitActiveBufferChangeModified.bind(this)));
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-open-file', { filePath: filePath });
      this._updateActiveDiffState(filePath).catch((_notifications2 || _notifications()).notifyInternalError);
    }
  }, {
    key: '_onActiveBufferReload',
    value: _asyncToGenerator(function* (filePath, buffer) {
      var _activeFileState = this._activeFileState;
      var committedContents = _activeFileState.oldContents;
      var revisionInfo = _activeFileState.compareRevisionInfo;

      if (revisionInfo == null) {
        // The file could be just loaded.
        return;
      }
      yield this._updateDiffStateIfChanged(filePath, committedContents, buffer.getText(), revisionInfo);
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

      var buffer = (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).bufferForUri)(filePath);
      return buffer.isModified();
    }
  }, {
    key: '_updateDiffStateIfChanged',
    value: _asyncToGenerator(function* (filePath, committedContents, filesystemContents, revisionInfo) {
      if (this._activeFileState.filePath !== filePath) {
        return;
      }
      var updatedDiffState = {
        committedContents: committedContents,
        filesystemContents: filesystemContents,
        revisionInfo: revisionInfo
      };
      return this._updateDiffState(filePath, updatedDiffState);
    })
  }, {
    key: 'setNewContents',
    value: function setNewContents(newContents) {
      this._setActiveFileState(_extends({}, this._activeFileState, { newContents: newContents }));
    }
  }, {
    key: 'setRevision',
    value: function setRevision(revision) {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-set-revision');
      var repositoryStack = this._activeRepositoryStack;
      (0, (_assert2 || _assert()).default)(repositoryStack, 'There must be an active repository stack!');
      this._activeFileState = _extends({}, this._activeFileState, { compareRevisionInfo: revision });
      repositoryStack.setRevision(revision).catch((_notifications2 || _notifications()).notifyInternalError);
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
      yield this._updateDiffState(filePath, fileDiffState);
    })
  }, {
    key: '_updateDiffState',
    value: _asyncToGenerator(function* (filePath, fileDiffState) {
      var oldContents = fileDiffState.committedContents;
      var newContents = fileDiffState.filesystemContents;
      var revisionInfo = fileDiffState.revisionInfo;
      var hash = revisionInfo.hash;
      var bookmarks = revisionInfo.bookmarks;

      var newFileState = {
        filePath: filePath,
        oldContents: oldContents,
        newContents: newContents,
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
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('diff-view.hg-state-update')],
    value: _asyncToGenerator(function* (filePath) {
      var repositoryStack = this._getRepositoryStackForPath(filePath);

      var _ref6 = yield Promise.all([repositoryStack.fetchHgDiff(filePath), this._setActiveRepositoryStack(repositoryStack)]);

      var _ref62 = _slicedToArray(_ref6, 1);

      var hgDiff = _ref62[0];

      // Intentionally fetch the filesystem contents after getting the committed contents
      // to make sure we have the latest filesystem version.
      var buffer = yield (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).loadBufferForUri)(filePath);
      return _extends({}, hgDiff, {
        filesystemContents: buffer.getText()
      });
    })
  }, {
    key: '_getRepositoryStackForPath',
    value: function _getRepositoryStackForPath(filePath) {
      var hgRepository = hgRepositoryForPath(filePath);
      var repositoryStack = this._repositoryStacks.get(hgRepository);
      (0, (_assert2 || _assert()).default)(repositoryStack, 'There must be an repository stack for a given repository!');
      return repositoryStack;
    }
  }, {
    key: '_setActiveRepositoryStack',
    value: _asyncToGenerator(function* (repositoryStack) {
      if (this._activeRepositoryStack === repositoryStack) {
        return;
      }
      this._activeRepositoryStack = repositoryStack;
      repositoryStack.setDiffOption(viewModeToDiffOption(this._state.viewMode));
      if (!this._isActive) {
        return;
      }
      var revisionsState = yield repositoryStack.getCachedRevisionsStatePromise();
      this._updateChangedRevisions(repositoryStack, revisionsState, false);
    })
  }, {
    key: 'saveActiveFile',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('diff-view.save-file')],
    value: function saveActiveFile() {
      var filePath = this._activeFileState.filePath;

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-save-file', { filePath: filePath });
      return this._saveFile(filePath).catch((_notifications2 || _notifications()).notifyInternalError);
    }
  }, {
    key: 'publishDiff',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('diff-view.publish-diff')],
    value: _asyncToGenerator(function* (publishMessage) {
      this._setState(_extends({}, this._state, {
        publishMessage: publishMessage,
        publishModeState: (_constants2 || _constants()).PublishModeState.AWAITING_PUBLISH
      }));
      var publishMode = this._state.publishMode;

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-publish', {
        publishMode: publishMode
      });
      var commitMessage = publishMode === (_constants2 || _constants()).PublishMode.CREATE ? publishMessage : null;
      var cleanResult = undefined;
      try {
        cleanResult = yield this._promptToCleanDirtyChanges(commitMessage);
      } catch (error) {
        atom.notifications.addError('Error clearning dirty changes', {
          detail: error.message,
          dismissable: true,
          nativeFriendly: true
        });
      }
      if (cleanResult == null) {
        this._setState(_extends({}, this._state, {
          publishModeState: (_constants2 || _constants()).PublishModeState.READY
        }));
        return;
      }
      var _cleanResult = cleanResult;
      var amended = _cleanResult.amended;
      var allowUntracked = _cleanResult.allowUntracked;

      try {
        switch (publishMode) {
          case (_constants2 || _constants()).PublishMode.CREATE:
            // Create uses `verbatim` and `n` answer buffer
            // and that implies that untracked files will be ignored.
            var createdPhabricatorRevision = yield this._createPhabricatorRevision(publishMessage, amended);
            notifyRevisionStatus(createdPhabricatorRevision, 'created');
            break;
          case (_constants2 || _constants()).PublishMode.UPDATE:
            var updatedPhabricatorRevision = yield this._updatePhabricatorRevision(publishMessage, allowUntracked);
            notifyRevisionStatus(updatedPhabricatorRevision, 'updated');
            break;
          default:
            throw new Error('Unknown publish mode \'' + publishMode + '\'');
        }
        // Populate Publish UI with the most recent data after a successful push.
        this._setState(_extends({}, this._state, {
          publishModeState: (_constants2 || _constants()).PublishModeState.READY
        }));
        this.setViewMode((_constants2 || _constants()).DiffMode.BROWSE_MODE);
      } catch (error) {
        atom.notifications.addError('Couldn\'t Publish to Phabricator', {
          detail: error.message,
          nativeFriendly: true
        });
        this._setState(_extends({}, this._state, {
          publishModeState: (_constants2 || _constants()).PublishModeState.PUBLISH_ERROR
        }));
      }
    })
  }, {
    key: '_promptToCleanDirtyChanges',
    value: _asyncToGenerator(function* (commitMessage) {
      var activeStack = this._activeRepositoryStack;
      (0, (_assert2 || _assert()).default)(activeStack != null, 'No active repository stack when cleaning dirty changes');

      var hgRepo = activeStack.getRepository();
      var checkingStatusNotification = atom.notifications.addInfo('Running `hg status` to check dirty changes to Add/Amend/Revert', { dismissable: true });
      yield hgRepo.getStatuses([hgRepo.getProjectDirectory()]);
      checkingStatusNotification.dismiss();

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
        return fileChange[1] === (_constants2 || _constants()).FileChangeStatus.UNTRACKED;
      }));
      if (untrackedChanges.size > 0) {
        var untrackedChoice = atom.confirm({
          message: 'You have untracked files in your working copy:',
          detailedMessage: getFileStatusListMessage(untrackedChanges),
          buttons: ['Cancel', 'Add', 'Allow Untracked']
        });
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().info('Untracked changes choice:', untrackedChoice);
        if (untrackedChoice === 0) /*Cancel*/{
            return null;
          } else if (untrackedChoice === 1) /*Add*/{
            yield activeStack.addAll(Array.from(untrackedChanges.keys()));
            shouldAmend = true;
          } else if (untrackedChoice === 2) /*Allow Untracked*/{
            allowUntracked = true;
          }
      }
      var revertableChanges = new Map(Array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
        return fileChange[1] !== (_constants2 || _constants()).FileChangeStatus.UNTRACKED;
      }));
      if (revertableChanges.size > 0) {
        var cleanChoice = atom.confirm({
          message: 'You have uncommitted changes in your working copy:',
          detailedMessage: getFileStatusListMessage(revertableChanges),
          buttons: ['Cancel', 'Revert', 'Amend']
        });
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().info('Dirty changes clean choice:', cleanChoice);
        if (cleanChoice === 0) /*Cancel*/{
            return null;
          } else if (cleanChoice === 1) /*Revert*/{
            var canRevertFilePaths = Array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
              return fileChange[1] !== (_constants2 || _constants()).FileChangeStatus.UNTRACKED;
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
      (0, (_assert2 || _assert()).default)(activeRepositoryStack, 'No active repository stack');
      if (!amended && publishMessage !== lastCommitMessage) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().info('Amending commit with the updated message');
        yield activeRepositoryStack.amend(publishMessage);
        atom.notifications.addSuccess('Commit amended with the updated message');
      }

      this._publishUpdates.next({ level: 'log', text: 'Creating new revision...\n' });
      var stream = (_nuclideArcanistClient2 || _nuclideArcanistClient()).default.createPhabricatorRevision(filePath);
      yield this._processArcanistOutput(stream);
      var asyncHgRepo = activeRepositoryStack.getRepository().async;
      var headCommitMessagePromise = asyncHgRepo.getHeadCommitMessage();
      // Invalidate the current revisions state because the current commit info has changed.
      activeRepositoryStack.getRevisionsStatePromise();
      var commitMessage = yield headCommitMessagePromise;
      if (commitMessage == null) {
        return null;
      }
      return (0, (_nuclideArcanistBaseLibUtils2 || _nuclideArcanistBaseLibUtils()).getPhabricatorRevisionFromCommitMessage)(commitMessage);
    })
  }, {
    key: '_updatePhabricatorRevision',
    value: _asyncToGenerator(function* (publishMessage, allowUntracked) {
      var filePath = this._getArcanistFilePath();

      var _ref7 = yield this._getActiveHeadRevisionDetails();

      var phabricatorRevision = _ref7.phabricatorRevision;

      (0, (_assert2 || _assert()).default)(phabricatorRevision != null, 'A phabricator revision must exist to update!');
      var updateTemplate = getRevisionUpdateMessage(phabricatorRevision).trim();
      var userUpdateMessage = publishMessage.replace(updateTemplate, '').trim();
      if (userUpdateMessage.length === 0) {
        throw new Error('Cannot update revision with empty message');
      }

      this._publishUpdates.next({
        level: 'log',
        text: 'Updating revision `' + phabricatorRevision.name + '`...\n'
      });
      var stream = (_nuclideArcanistClient2 || _nuclideArcanistClient()).default.updatePhabricatorRevision(filePath, userUpdateMessage, allowUntracked);
      yield this._processArcanistOutput(stream);
      return phabricatorRevision;
    })
  }, {
    key: '_processArcanistOutput',
    value: _asyncToGenerator(function* (stream) {
      var _default$Observable,
          _this5 = this;

      var fatalError = false;
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
            (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Invalid JSON encountered: ' + stdout);
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
            messages.push({ level: 'error', text: decodedJSON.message });
            fatalError = true;
            break;
          default:
            (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().info('Unhandled message type:', decodedJSON.type, 'Message payload:', decodedJSON.message);
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
        levelStreams.push((0, (_commonsNodeStream2 || _commonsNodeStream()).bufferUntil)(levelStream, function (message) {
          return message.text.endsWith('\n');
        }));
      };

      for (var _level of ['log', 'error']) {
        _loop(_level);
      }
      yield (_default$Observable = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable).merge.apply(_default$Observable, levelStreams).do(function (messages) {
        if (messages.length > 0) {
          _this5._publishUpdates.next({
            level: messages[0].level,
            text: messages.map(function (message) {
              return message.text;
            }).join('')
          });
        }
      }).toPromise().catch(function (error) {
        fatalError = true;
      });

      if (fatalError) {
        throw new Error('Failed publish to Phabricator\n' + 'You could have missed test plan or mistyped reviewers.\n' + 'Please fix and try again.');
      }
    })
  }, {
    key: '_saveFile',
    value: _asyncToGenerator(function* (filePath) {
      var buffer = (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).bufferForUri)(filePath);
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
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('diff-view.fetch-comments')],
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
      this._updateInlineComponents().catch((_notifications2 || _notifications()).notifyInternalError);
    }
  }, {
    key: '_loadCommitModeState',
    value: _asyncToGenerator(function* () {
      this._setState(_extends({}, this._state, {
        commitModeState: (_constants2 || _constants()).CommitModeState.LOADING_COMMIT_MESSAGE
      }));

      var commitMessage = null;
      try {
        if (this._state.commitMessage != null) {
          commitMessage = this._state.commitMessage;
        } else if (this._state.commitMode === (_constants2 || _constants()).CommitMode.COMMIT) {
          commitMessage = yield this._loadActiveRepositoryTemplateCommitMessage();
        } else {
          commitMessage = yield this._loadActiveRepositoryLatestCommitMessage();
        }
      } catch (error) {
        (0, (_notifications2 || _notifications()).notifyInternalError)(error);
      } finally {
        this._setState(_extends({}, this._state, {
          commitMessage: commitMessage,
          commitModeState: (_constants2 || _constants()).CommitModeState.READY
        }));
      }
    })
  }, {
    key: '_loadPublishModeState',
    value: _asyncToGenerator(function* () {
      if (this._state.publishModeState === (_constants2 || _constants()).PublishModeState.AWAITING_PUBLISH) {
        // That must be an a update triggered by an `amend` operation,
        // done as part of diffing.
        return;
      }
      var publishMessage = this._state.publishMessage;
      this._setState(_extends({}, this._state, {
        publishMode: (_constants2 || _constants()).PublishMode.CREATE,
        publishModeState: (_constants2 || _constants()).PublishModeState.LOADING_PUBLISH_MESSAGE,
        publishMessage: null,
        headRevision: null
      }));

      var _ref8 = yield this._getActiveHeadRevisionDetails();

      var headRevision = _ref8.headRevision;
      var phabricatorRevision = _ref8.phabricatorRevision;

      if (publishMessage == null || publishMessage.length === 0) {
        publishMessage = phabricatorRevision != null ? getRevisionUpdateMessage(phabricatorRevision) : headRevision.description;
      }
      this._setState(_extends({}, this._state, {
        publishMode: phabricatorRevision != null ? (_constants2 || _constants()).PublishMode.UPDATE : (_constants2 || _constants()).PublishMode.CREATE,
        publishModeState: (_constants2 || _constants()).PublishModeState.READY,
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

      (0, (_assert2 || _assert()).default)(revisions.length > 0, 'Diff View Error: Zero Revisions');
      var headRevision = revisions[revisions.length - 1];
      var phabricatorRevision = (0, (_nuclideArcanistBaseLibUtils2 || _nuclideArcanistBaseLibUtils()).getPhabricatorRevisionFromCommitMessage)(headRevision.description);
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
      (0, (_assert2 || _assert()).default)(revisionsState, 'Diff View Internal Error: revisionsState cannot be null');
      var revisions = revisionsState.revisions;

      (0, (_assert2 || _assert()).default)(revisions.length > 0, 'Diff View Error: Cannot amend non-existing commit');
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
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('diff-view.commit')],
    value: _asyncToGenerator(function* (message) {
      if (message === '') {
        atom.notifications.addError('Commit aborted', { detail: 'Commit message empty' });
        return;
      }

      this._setState(_extends({}, this._state, {
        commitMessage: message,
        commitModeState: (_constants2 || _constants()).CommitModeState.AWAITING_COMMIT
      }));

      var commitMode = this._state.commitMode;

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-commit', {
        commitMode: commitMode
      });

      var activeStack = this._activeRepositoryStack;
      try {
        (0, (_assert2 || _assert()).default)(activeStack, 'No active repository stack');
        switch (commitMode) {
          case (_constants2 || _constants()).CommitMode.COMMIT:
            yield activeStack.commit(message);
            atom.notifications.addSuccess('Commit created', { nativeFriendly: true });
            break;
          case (_constants2 || _constants()).CommitMode.AMEND:
            yield activeStack.amend(message);
            atom.notifications.addSuccess('Commit amended', { nativeFriendly: true });
            break;
        }

        // Force trigger an update to the revisions to update the UI state with the new commit info.
        activeStack.getRevisionsStatePromise();
        this.setViewMode((_constants2 || _constants()).DiffMode.BROWSE_MODE);
      } catch (e) {
        atom.notifications.addError('Error creating commit', {
          detail: 'Details: ' + e.message,
          nativeFriendly: true
        });
        this._setState(_extends({}, this._state, {
          commitModeState: (_constants2 || _constants()).CommitModeState.READY
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
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-switch-commit-mode', {
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
      this._activeSubscriptions.dispose();
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