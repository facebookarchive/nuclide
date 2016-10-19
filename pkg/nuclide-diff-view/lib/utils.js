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
  var dirtyFileChanges = (0, (_commonsNodeVcs2 || _load_commonsNodeVcs2()).getDirtyFileChanges)(repository);

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
    return fileChange[1] === (_commonsNodeVcs || _load_commonsNodeVcs()).FileChangeStatus.UNTRACKED;
  }));
  if (untrackedChanges.size > 0) {
    var untrackedChoice = atom.confirm({
      message: 'You have untracked files in your working copy:',
      detailedMessage: getFileStatusListMessage(untrackedChanges),
      buttons: ['Cancel', 'Add', 'Allow Untracked']
    });
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Untracked changes choice:', untrackedChoice);
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
    return fileChange[1] !== (_commonsNodeVcs || _load_commonsNodeVcs()).FileChangeStatus.UNTRACKED;
  }));
  if (revertableChanges.size > 0) {
    var cleanChoice = atom.confirm({
      message: 'You have uncommitted changes in your working copy:',
      detailedMessage: getFileStatusListMessage(revertableChanges),
      buttons: ['Cancel', 'Revert', 'Amend']
    });
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Dirty changes clean choice:', cleanChoice);
    if (cleanChoice === 0) /* Cancel */{
        return null;
      } else if (cleanChoice === 1) /* Revert */{
        var canRevertFilePaths = Array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
          return fileChange[1] !== (_commonsNodeVcs || _load_commonsNodeVcs()).FileChangeStatus.UNTRACKED;
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

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _commonsNodeVcs;

function _load_commonsNodeVcs() {
  return _commonsNodeVcs = require('../../commons-node/vcs');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideArcanistRpcLibUtils;

function _load_nuclideArcanistRpcLibUtils() {
  return _nuclideArcanistRpcLibUtils = require('../../nuclide-arcanist-rpc/lib/utils');
}

var _nuclideHgRpc;

function _load_nuclideHgRpc() {
  return _nuclideHgRpc = require('../../nuclide-hg-rpc');
}

var _commonsNodeObservable;

function _load_commonsNodeObservable() {
  return _commonsNodeObservable = require('../../commons-node/observable');
}

var _commonsNodeVcs2;

function _load_commonsNodeVcs2() {
  return _commonsNodeVcs2 = require('../../commons-node/vcs');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _stripAnsi;

function _load_stripAnsi() {
  return _stripAnsi = _interopRequireDefault(require('strip-ansi'));
}

var _electron;

function _load_electron() {
  return _electron = require('electron');
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
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Invalid JSON encountered: ' + stdout);
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
        messages.push({ level: 'log', text: (0, (_stripAnsi || _load_stripAnsi()).default)(decodedJSON.message) });
        break;
      case 'phutil:err':
        messages.push({ level: 'error', text: (0, (_stripAnsi || _load_stripAnsi()).default)(decodedJSON.message) });
        break;
      case 'error':
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(new Error('Arc Error: ' + decodedJSON.message));
      default:
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Unhandled message type:', decodedJSON.type, 'Message payload:', decodedJSON.message);
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
    levelStreams.push((0, (_commonsNodeObservable || _load_commonsNodeObservable()).bufferUntil)(levelStream, function (message) {
      return message.text.endsWith('\n');
    }));
  };

  for (var _level of ['log', 'error']) {
    _loop(_level);
  }

  return (_Observable = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable).merge.apply(_Observable, levelStreams).map(function (messages) {
    return {
      level: messages[0].level,
      text: messages.map(function (message) {
        return message.text;
      }).join('')
    };
  }).catch(function (error) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(new Error('Failed publish to Phabricator\n' + 'You could have missed test plan or mistyped reviewers.\n' + 'Please fix and try again.'));
  });
}

function getFileStatusListMessage(fileChanges) {
  var message = '';
  if (fileChanges.size < MAX_DIALOG_FILE_STATUS_COUNT) {
    for (var _ref3 of fileChanges) {
      var _ref2 = _slicedToArray(_ref3, 2);

      var filePath = _ref2[0];
      var statusCode = _ref2[1];

      message += '\n' + (_commonsNodeVcs || _load_commonsNodeVcs()).FileChangeStatusToPrefix[statusCode] + atom.project.relativize(filePath);
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

    mergeStatusPaths(added, (_commonsNodeVcs || _load_commonsNodeVcs()).FileChangeStatus.ADDED);
    mergeStatusPaths(modified, (_commonsNodeVcs || _load_commonsNodeVcs()).FileChangeStatus.MODIFIED);
    mergeStatusPaths(deleted, (_commonsNodeVcs || _load_commonsNodeVcs()).FileChangeStatus.REMOVED);
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

  var CommitPhase = (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.CommitPhase;

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

function fetchFileChangesForRevisions(repository, revisions) {
  var _Observable2;

  if (revisions.length === 0) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of([]);
  }
  // Revision ids are unique and don't change, except when the revision is amended/rebased.
  // Hence, it's cached here to avoid service calls when working on a stack of commits.
  // $FlowFixMe(matthewwithanm) Type this.
  return (_Observable2 = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable).forkJoin.apply(_Observable2, _toConsumableArray(revisions.map(function (revision) {
    return repository.fetchFilesChangedAtRevision('' + revision.id);
  })));
}

function getSelectedFileChanges(repository, diffOption, revisions, compareCommitId) {
  var dirtyFileChanges = (0, (_commonsNodeVcs2 || _load_commonsNodeVcs2()).getDirtyFileChanges)(repository);

  if (diffOption === (_constants || _load_constants()).DiffOption.DIRTY || diffOption === (_constants || _load_constants()).DiffOption.COMPARE_COMMIT && compareCommitId == null) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(dirtyFileChanges);
  }
  var headToForkBaseRevisions = getHeadToForkBaseRevisions(revisions);
  if (headToForkBaseRevisions.length <= 1) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(dirtyFileChanges);
  }

  var beforeCommitId = diffOption === (_constants || _load_constants()).DiffOption.LAST_COMMIT ? headToForkBaseRevisions[headToForkBaseRevisions.length - 2].id : compareCommitId;

  if (beforeCommitId == null) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(new Error('compareCommitId cannot be null!'));
  }
  if (headToForkBaseRevisions.find(function (rev) {
    return rev.id === beforeCommitId;
  }) == null) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(dirtyFileChanges);
  }
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
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(new Error('Cannot fetch hg diff for revisions without head'));
  }
  var headCommitId = headCommit.id;
  var compareCommitId = undefined;
  switch (diffOption) {
    case (_constants || _load_constants()).DiffOption.DIRTY:
      compareCommitId = headCommitId;
      break;
    case (_constants || _load_constants()).DiffOption.LAST_COMMIT:
      compareCommitId = headToForkBaseRevisions.length > 1 ? headToForkBaseRevisions[headToForkBaseRevisions.length - 2].id : headCommitId;
      break;
    case (_constants || _load_constants()).DiffOption.COMPARE_COMMIT:
      compareCommitId = compareId || headCommitId;
      break;
    default:
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(new Error('Invalid Diff Option: ' + diffOption));
  }

  var revisionInfo = headToForkBaseRevisions.find(function (revision) {
    return revision.id === compareCommitId;
  });
  if (revisionInfo == null) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(new Error('Diff Viw Fetcher: revision with id ' + compareCommitId + ' not found'));
  }

  return repository.fetchFileContentAtRevision(filePath, '' + compareCommitId)
  // If the file didn't exist on the previous revision,
  // Return the no such file at revision message.
  .catch(function (error) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of('');
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
    return (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.AmendMode.REBASE;
  } else {
    return (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.AmendMode.CLEAN;
  }
}

function getRevisionUpdateMessage(phabricatorRevision) {
  return '\n\n# Updating ' + phabricatorRevision.name + '\n#\n# Enter a brief description of the changes included in this update.\n# The first line is used as subject, next lines as comment.';
}

function viewModeToDiffOption(viewMode) {
  switch (viewMode) {
    case (_constants || _load_constants()).DiffMode.COMMIT_MODE:
      return (_constants || _load_constants()).DiffOption.DIRTY;
    case (_constants || _load_constants()).DiffMode.PUBLISH_MODE:
      return (_constants || _load_constants()).DiffOption.LAST_COMMIT;
    case (_constants || _load_constants()).DiffMode.BROWSE_MODE:
      return (_constants || _load_constants()).DiffOption.COMPARE_COMMIT;
    default:
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Unrecognized diff view mode: ' + viewMode);
      return (_constants || _load_constants()).DiffOption.DIRTY;
  }
}

// TODO(most): Cleanup to avoid using `.do()` and have side effects:
// (notifications & publish updates).

function createPhabricatorRevision(repository, publishUpdates, headCommitMessage, publishMessage, amended, isPrepareMode, lintExcuse) {
  var filePath = repository.getProjectDirectory();
  var amendStream = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
  if (!amended && publishMessage !== headCommitMessage) {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Amending commit with the updated message');
    // We intentionally amend in clean mode here, because creating the revision
    // amends the commit message (with the revision url), breaking the stack on top of it.
    // Consider prompting for `hg amend --fixup` after to rebase the stack when needed.
    amendStream = repository.amend(publishMessage, (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.AmendMode.CLEAN).do({
      complete: function complete() {
        return atom.notifications.addSuccess('Commit amended with the updated message');
      }
    });
  }

  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat(
  // Amend head, if needed.
  amendStream,
  // Create a new revision.
  (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.defer(function () {
    var stream = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(filePath).createPhabricatorRevision(filePath, isPrepareMode, lintExcuse).refCount();

    return processArcanistOutput(stream).startWith({ level: 'log', text: 'Creating new revision...\n' }).do(function (message) {
      return publishUpdates.next(message);
    });
  }), (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.defer(function () {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(repository.getHeadCommitMessage()).do(function (commitMessage) {
      var phabricatorRevision = (0, (_nuclideArcanistRpcLibUtils || _load_nuclideArcanistRpcLibUtils()).getPhabricatorRevisionFromCommitMessage)(commitMessage || '');
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

  var phabricatorRevision = (0, (_nuclideArcanistRpcLibUtils || _load_nuclideArcanistRpcLibUtils()).getPhabricatorRevisionFromCommitMessage)(headCommitMessage);
  if (phabricatorRevision == null) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(new Error('A phabricator revision must exist to update!'));
  }

  var updateTemplate = getRevisionUpdateMessage(phabricatorRevision).trim();
  var userUpdateMessage = publishMessage.replace(updateTemplate, '').trim();
  if (userUpdateMessage.length === 0) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(new Error('Cannot update revision with empty message'));
  }

  var stream = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(filePath).updatePhabricatorRevision(filePath, userUpdateMessage, allowUntracked, lintExcuse).refCount();

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
        (_electron || _load_electron()).shell.openExternal(url);
      },
      text: 'Open in Phabricator'
    }],
    nativeFriendly: true
  });
}