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

exports.processArcanistOutput = processArcanistOutput;

var promptToCleanDirtyChanges = _asyncToGenerator(function* (repository, commitMessage, shouldRebaseOnAmend) {
  var checkingStatusNotification = atom.notifications.addInfo('Running `hg status` to check dirty changes to Add/Amend/Revert', { dismissable: true });
  yield repository.getStatuses([repository.getProjectDirectory()]);
  checkingStatusNotification.dismiss();

  var dirtyFileChanges = getDirtyFileChanges(repository);

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
    if (untrackedChoice === 0) /* Cancel */{
        return null;
      } else if (untrackedChoice === 1) /* Add */{
        yield repository.addAll(Array.from(untrackedChanges.keys()));
        shouldAmend = true;
      } else if (untrackedChoice === 2) /* Allow Untracked */{
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
    if (cleanChoice === 0) /* Cancel */{
        return null;
      } else if (cleanChoice === 1) /* Revert */{
        var canRevertFilePaths = Array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
          return fileChange[1] !== (_constants2 || _constants()).FileChangeStatus.UNTRACKED;
        }).map(function (fileChange) {
          return fileChange[0];
        });
        yield repository.revert(canRevertFilePaths);
      } else if (cleanChoice === 2) /* Amend */{
        shouldAmend = true;
      }
  }
  if (shouldAmend) {
    yield repository.amend(commitMessage, getAmendMode(shouldRebaseOnAmend)).toArray().toPromise();
    amended = true;
  }
  return {
    amended: amended,
    allowUntracked: allowUntracked
  };
});

exports.promptToCleanDirtyChanges = promptToCleanDirtyChanges;
exports.getHeadRevision = getHeadRevision;
exports.getHeadToForkBaseRevisions = getHeadToForkBaseRevisions;
exports.getDirtyFileChanges = getDirtyFileChanges;
exports.getSelectedFileChanges = getSelectedFileChanges;
exports.getHgDiff = getHgDiff;
exports.formatFileDiffRevisionTitle = formatFileDiffRevisionTitle;
exports.getAmendMode = getAmendMode;
exports.getRevisionUpdateMessage = getRevisionUpdateMessage;
exports.viewModeToDiffOption = viewModeToDiffOption;
exports.createPhabricatorRevision = createPhabricatorRevision;
exports.updatePhabricatorRevision = updatePhabricatorRevision;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideArcanistRpcLibUtils2;

function _nuclideArcanistRpcLibUtils() {
  return _nuclideArcanistRpcLibUtils2 = require('../../nuclide-arcanist-rpc/lib/utils');
}

var _nuclideHgRpc2;

function _nuclideHgRpc() {
  return _nuclideHgRpc2 = require('../../nuclide-hg-rpc');
}

var _commonsNodeObservable2;

function _commonsNodeObservable() {
  return _commonsNodeObservable2 = require('../../commons-node/observable');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _stripAnsi2;

function _stripAnsi() {
  return _stripAnsi2 = _interopRequireDefault(require('strip-ansi'));
}

var _electron2;

function _electron() {
  return _electron2 = require('electron');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var MAX_DIALOG_FILE_STATUS_COUNT = 20;

function processArcanistOutput(stream_) {
  var _Observable;

  var stream = stream_;
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
        messages.push({ level: 'log', text: (0, (_stripAnsi2 || _stripAnsi()).default)(decodedJSON.message) });
        break;
      case 'phutil:err':
        messages.push({ level: 'error', text: (0, (_stripAnsi2 || _stripAnsi()).default)(decodedJSON.message) });
        break;
      case 'error':
        throw new Error('Arc Error: ' + decodedJSON.message);
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
    levelStreams.push((0, (_commonsNodeObservable2 || _commonsNodeObservable()).bufferUntil)(levelStream, function (message) {
      return message.text.endsWith('\n');
    }));
  };

  for (var _level of ['log', 'error']) {
    _loop(_level);
  }

  return (_Observable = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable).merge.apply(_Observable, levelStreams).map(function (messages) {
    return {
      level: messages[0].level,
      text: messages.map(function (message) {
        return message.text;
      }).join('')
    };
  }).catch(function (error) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.throw(new Error('Failed publish to Phabricator\n' + 'You could have missed test plan or mistyped reviewers.\n' + 'Please fix and try again.'));
  });
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

function getHeadRevision(revisions) {
  return revisions.find(function (revision) {
    return revision.isHead;
  });
}

/**
 * Merges the file change statuses of the dirty filesystem state with
 * the revision changes, where dirty changes and more recent revisions
 * take priority in deciding which status a file is in.
 */
function mergeFileStatuses(dirtyStatus, revisionsFileChanges) {
  var mergedStatus = new Map(dirtyStatus);
  var mergedFilePaths = new Set(mergedStatus.keys());

  function mergeStatusPaths(filePaths, changeStatusValue) {
    for (var filePath of filePaths) {
      if (!mergedFilePaths.has(filePath)) {
        mergedStatus.set(filePath, changeStatusValue);
        mergedFilePaths.add(filePath);
      }
    }
  }

  // More recent revision changes takes priority in specifying a files' statuses.
  var latestToOldestRevisionsChanges = revisionsFileChanges.slice().reverse();
  for (var revisionFileChanges of latestToOldestRevisionsChanges) {
    var added = revisionFileChanges.added;
    var modified = revisionFileChanges.modified;
    var deleted = revisionFileChanges.deleted;

    mergeStatusPaths(added, (_constants2 || _constants()).FileChangeStatus.ADDED);
    mergeStatusPaths(modified, (_constants2 || _constants()).FileChangeStatus.MODIFIED);
    mergeStatusPaths(deleted, (_constants2 || _constants()).FileChangeStatus.REMOVED);
  }

  return mergedStatus;
}

function getHeadToForkBaseRevisions(revisions) {
  // `headToForkBaseRevisions` should have the public commit at the fork base as the first.
  // and the rest of the current `HEAD` stack in order with the `HEAD` being last.
  var headRevision = getHeadRevision(revisions);
  if (headRevision == null) {
    return [];
  }

  var CommitPhase = (_nuclideHgRpc2 || _nuclideHgRpc()).hgConstants.CommitPhase;

  var hashToRevisionInfo = new Map(revisions.map(function (revision) {
    return [revision.hash, revision];
  }));
  var headToForkBaseRevisions = [];
  var parentRevision = headRevision;
  while (parentRevision != null && parentRevision.phase !== CommitPhase.PUBLIC) {
    headToForkBaseRevisions.unshift(parentRevision);
    parentRevision = hashToRevisionInfo.get(parentRevision.parents[0]);
  }
  if (parentRevision != null) {
    headToForkBaseRevisions.unshift(parentRevision);
  }
  return headToForkBaseRevisions;
}

function getDirtyFileChanges(repository) {
  var dirtyFileChanges = new Map();
  var statuses = repository.getAllPathStatuses();
  for (var filePath in statuses) {
    var changeStatus = (_constants2 || _constants()).HgStatusToFileChangeStatus[statuses[filePath]];
    if (changeStatus != null) {
      dirtyFileChanges.set(filePath, changeStatus);
    }
  }
  return dirtyFileChanges;
}

function fetchFileChangesForRevisions(repository, revisions) {
  var _Observable2;

  if (revisions.length === 0) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of([]);
  }
  // Revision ids are unique and don't change, except when the revision is amended/rebased.
  // Hence, it's cached here to avoid service calls when working on a stack of commits.
  // $FlowFixMe(matthewwithanm) Type this.
  return (_Observable2 = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable).forkJoin.apply(_Observable2, _toConsumableArray(revisions.map(function (revision) {
    return repository.fetchFilesChangedAtRevision('' + revision.id);
  })));
}

function getSelectedFileChanges(repository, diffOption, revisions, compareCommitId) {
  var dirtyFileChanges = getDirtyFileChanges(repository);

  if (diffOption === (_constants2 || _constants()).DiffOption.DIRTY || diffOption === (_constants2 || _constants()).DiffOption.COMPARE_COMMIT && compareCommitId == null) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(dirtyFileChanges);
  }
  var headToForkBaseRevisions = getHeadToForkBaseRevisions(revisions);
  if (headToForkBaseRevisions.length <= 1) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(dirtyFileChanges);
  }

  var beforeCommitId = diffOption === (_constants2 || _constants()).DiffOption.LAST_COMMIT ? headToForkBaseRevisions[headToForkBaseRevisions.length - 2].id : compareCommitId;

  (0, (_assert2 || _assert()).default)(beforeCommitId != null, 'compareCommitId cannot be null!');
  return getSelectedFileChangesToCommit(repository, headToForkBaseRevisions, beforeCommitId, dirtyFileChanges);
}

function getSelectedFileChangesToCommit(repository, headToForkBaseRevisions, beforeCommitId, dirtyFileChanges) {
  var latestToOldesRevisions = headToForkBaseRevisions.slice().reverse();
  return fetchFileChangesForRevisions(repository, latestToOldesRevisions.filter(function (revision) {
    return revision.id > beforeCommitId;
  })).map(function (revisionChanges) {
    return mergeFileStatuses(dirtyFileChanges, revisionChanges);
  });
}

function getHgDiff(repository, filePath, headToForkBaseRevisions, diffOption, compareId) {
  // When `compareCommitId` is null, the `HEAD` commit contents is compared
  // to the filesystem, otherwise it compares that commit to filesystem.
  var headCommit = getHeadRevision(headToForkBaseRevisions);
  if (headCommit == null) {
    throw new Error('Cannot fetch hg diff for revisions without head');
  }
  var headCommitId = headCommit.id;
  var compareCommitId = undefined;
  switch (diffOption) {
    case (_constants2 || _constants()).DiffOption.DIRTY:
      compareCommitId = headCommitId;
      break;
    case (_constants2 || _constants()).DiffOption.LAST_COMMIT:
      compareCommitId = headToForkBaseRevisions.length > 1 ? headToForkBaseRevisions[headToForkBaseRevisions.length - 2].id : headCommitId;
      break;
    case (_constants2 || _constants()).DiffOption.COMPARE_COMMIT:
      compareCommitId = compareId || headCommitId;
      break;
    default:
      throw new Error('Invalid Diff Option: ' + diffOption);
  }

  var revisionInfo = headToForkBaseRevisions.find(function (revision) {
    return revision.id === compareCommitId;
  });
  (0, (_assert2 || _assert()).default)(revisionInfo, 'Diff Viw Fetcher: revision with id ' + compareCommitId + ' not found');

  return repository.fetchFileContentAtRevision(filePath, '' + compareCommitId)
  // If the file didn't exist on the previous revision,
  // Return the no such file at revision message.
  .catch(function (error) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(error.message || '');
  }).map(function (committedContents) {
    return {
      committedContents: committedContents,
      revisionInfo: revisionInfo
    };
  });
}

function formatFileDiffRevisionTitle(revisionInfo) {
  var hash = revisionInfo.hash;
  var bookmarks = revisionInfo.bookmarks;

  return '' + hash + (bookmarks.length === 0 ? '' : ' - (' + bookmarks.join(', ') + ')');
}

function getAmendMode(shouldRebaseOnAmend) {
  if (shouldRebaseOnAmend) {
    return (_nuclideHgRpc2 || _nuclideHgRpc()).hgConstants.AmendMode.REBASE;
  } else {
    return (_nuclideHgRpc2 || _nuclideHgRpc()).hgConstants.AmendMode.CLEAN;
  }
}

function getRevisionUpdateMessage(phabricatorRevision) {
  return '\n\n# Updating ' + phabricatorRevision.name + '\n#\n# Enter a brief description of the changes included in this update.\n# The first line is used as subject, next lines as comment.';
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

// TODO(most): Cleanup to avoid using `.do()` and have side effects:
// (notifications & publish updates).

function createPhabricatorRevision(repository, publishUpdates, headCommitMessage, publishMessage, amended, lintExcuse) {
  var filePath = repository.getProjectDirectory();
  var amendStream = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
  if (!amended && publishMessage !== headCommitMessage) {
    (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().info('Amending commit with the updated message');
    // We intentionally amend in clean mode here, because creating the revision
    // amends the commit message (with the revision url), breaking the stack on top of it.
    // Consider prompting for `hg amend --fixup` after to rebase the stack when needed.
    amendStream = repository.amend(publishMessage, (_nuclideHgRpc2 || _nuclideHgRpc()).hgConstants.AmendMode.CLEAN).do({
      complete: function complete() {
        return atom.notifications.addSuccess('Commit amended with the updated message');
      }
    });
  }

  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat(
  // Amend head, if needed.
  amendStream,
  // Create a new revision.
  (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.defer(function () {
    var stream = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(filePath).createPhabricatorRevision(filePath, lintExcuse).refCount();

    return processArcanistOutput(stream).startWith({ level: 'log', text: 'Creating new revision...\n' }).do(function (message) {
      return publishUpdates.next(message);
    });
  }), (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.defer(function () {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise(repository.async.getHeadCommitMessage()).do(function (commitMessage) {
      var phabricatorRevision = (0, (_nuclideArcanistRpcLibUtils2 || _nuclideArcanistRpcLibUtils()).getPhabricatorRevisionFromCommitMessage)(commitMessage || '');
      if (phabricatorRevision != null) {
        notifyRevisionStatus(phabricatorRevision, 'created');
      }
    });
  })).ignoreElements();
}

// TODO(most): Cleanup to avoid using `.do()` and have side effects:
// (notifications & publish updates).

function updatePhabricatorRevision(repository, publishUpdates, headCommitMessage, publishMessage, allowUntracked, lintExcuse) {
  var filePath = repository.getProjectDirectory();

  var phabricatorRevision = (0, (_nuclideArcanistRpcLibUtils2 || _nuclideArcanistRpcLibUtils()).getPhabricatorRevisionFromCommitMessage)(headCommitMessage);
  if (phabricatorRevision == null) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.throw(new Error('A phabricator revision must exist to update!'));
  }

  var updateTemplate = getRevisionUpdateMessage(phabricatorRevision).trim();
  var userUpdateMessage = publishMessage.replace(updateTemplate, '').trim();
  if (userUpdateMessage.length === 0) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.throw(new Error('Cannot update revision with empty message'));
  }

  var stream = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(filePath).updatePhabricatorRevision(filePath, userUpdateMessage, allowUntracked, lintExcuse).refCount();

  return processArcanistOutput(stream).startWith({ level: 'log', text: 'Updating revision `' + phabricatorRevision.name + '`...\n' }).do({
    next: function next(message) {
      return publishUpdates.next(message);
    },
    complete: function complete() {
      return notifyRevisionStatus(phabricatorRevision, 'updated');
    }
  }).ignoreElements();
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
    buttons: [{
      className: 'icon icon-globe',
      onDidClick: function onDidClick() {
        (_electron2 || _electron()).shell.openExternal(url);
      },
      text: 'Open in Phabricator'
    }],
    nativeFriendly: true
  });
}