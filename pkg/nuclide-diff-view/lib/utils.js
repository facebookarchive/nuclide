'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promptToCleanDirtyChanges = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let promptToCleanDirtyChanges = exports.promptToCleanDirtyChanges = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (repository, commitMessage, shouldRebaseOnAmend, publishUpdates) {
    const dirtyFileChanges = (0, (_vcs || _load_vcs()).getDirtyFileChanges)(repository);

    let shouldAmend = false;
    let amended = false;
    let allowUntracked = false;
    if (dirtyFileChanges.size === 0) {
      return {
        amended,
        allowUntracked
      };
    }
    const untrackedChanges = new Map(Array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
      return fileChange[1] === (_vcs || _load_vcs()).FileChangeStatus.UNTRACKED;
    }));
    if (untrackedChanges.size > 0) {
      const untrackedChoice = atom.confirm({
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
    const revertableChanges = new Map(Array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
      return fileChange[1] !== (_vcs || _load_vcs()).FileChangeStatus.UNTRACKED;
    }));
    if (revertableChanges.size > 0) {
      const cleanChoice = atom.confirm({
        message: 'You have uncommitted changes in your working copy:',
        detailedMessage: getFileStatusListMessage(revertableChanges),
        buttons: ['Cancel', 'Revert', 'Amend']
      });
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Dirty changes clean choice:', cleanChoice);
      if (cleanChoice === 0) /* Cancel */{
          return null;
        } else if (cleanChoice === 1) /* Revert */{
          const canRevertFilePaths = Array.from(dirtyFileChanges.entries()).filter(function (fileChange) {
            return fileChange[1] !== (_vcs || _load_vcs()).FileChangeStatus.UNTRACKED;
          }).map(function (fileChange) {
            return fileChange[0];
          });
          yield repository.revert(canRevertFilePaths);
        } else if (cleanChoice === 2) /* Amend */{
          shouldAmend = true;
        }
    }
    if (shouldAmend) {
      yield amendWithErrorOnFailure(repository, commitMessage, getAmendMode(shouldRebaseOnAmend), publishUpdates).toPromise();
      amended = true;
    }
    return {
      amended,
      allowUntracked
    };
  });

  return function promptToCleanDirtyChanges(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

exports.processArcanistOutput = processArcanistOutput;
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
exports.formatDiffViewUrl = formatDiffViewUrl;

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _vcs;

function _load_vcs() {
  return _vcs = require('../../commons-atom/vcs');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-arcanist-rpc/lib/utils');
}

var _nuclideHgRpc;

function _load_nuclideHgRpc() {
  return _nuclideHgRpc = require('../../nuclide-hg-rpc');
}

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _streamProcessToConsoleMessages;

function _load_streamProcessToConsoleMessages() {
  return _streamProcessToConsoleMessages = require('../../commons-atom/streamProcessToConsoleMessages');
}

var _stripAnsi;

function _load_stripAnsi() {
  return _stripAnsi = _interopRequireDefault(require('strip-ansi'));
}

var _electron = require('electron');

var _url = _interopRequireDefault(require('url'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const MAX_DIALOG_FILE_STATUS_COUNT = 20;

function processArcanistOutput(stream_) {
  let stream = stream_;
  stream = stream
  // Split stream into single lines.
  .flatMap(message => {
    const lines = [];
    for (const fd of ['stderr', 'stdout']) {
      let out = message[fd];
      if (out != null) {
        out = out.replace(/\n$/, '');
        for (const line of out.split('\n')) {
          lines.push({ [fd]: line });
        }
      }
    }
    return lines;
  })
  // Unpack JSON
  .flatMap(message => {
    const stdout = message.stdout;
    const messages = [];
    if (stdout != null) {
      let decodedJSON = null;
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
  .flatMap(decodedJSON => {
    const messages = [];
    switch (decodedJSON.type) {
      case 'phutil:out':
      case 'phutil:out:raw':
      case 'phutil:err':
        messages.push({ level: 'log', text: (0, (_stripAnsi || _load_stripAnsi()).default)(decodedJSON.message) });
        break;
      case 'error':
        messages.push({ level: 'error', text: (0, (_stripAnsi || _load_stripAnsi()).default)(decodedJSON.message) });
        break;
      default:
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Unhandled message type:', decodedJSON.type, 'Message payload:', decodedJSON.message);
        messages.push({ level: 'log', text: (0, (_stripAnsi || _load_stripAnsi()).default)(decodedJSON.message) });
        break;
    }
    return messages;
  })
  // Split messages on new line characters.
  .flatMap(message => {
    const splitMessages = [];
    // Split on newlines without removing new line characters.  This will remove empty
    // strings but that's OK.
    for (const part of message.text.split(/^/m)) {
      splitMessages.push({ level: message.level, text: part });
    }
    return splitMessages;
  });
  const levelStreams = [];
  for (const level of ['log', 'error']) {
    const levelStream = stream.filter(message => message.level === level).share();
    levelStreams.push((0, (_observable || _load_observable()).bufferUntil)(levelStream, message => message.text.endsWith('\n')));
  }

  return _rxjsBundlesRxMinJs.Observable.merge(...levelStreams).map(messages => ({
    level: messages[0].level,
    text: messages.map(message => message.text).join('')
  })).catch(error => {
    return _rxjsBundlesRxMinJs.Observable.throw(new Error('Check the console ouput for issues.'));
  });
}

function getFileStatusListMessage(fileChanges) {
  let message = '';
  if (fileChanges.size < MAX_DIALOG_FILE_STATUS_COUNT) {
    for (const [filePath, statusCode] of fileChanges) {
      message += '\n' + (_vcs || _load_vcs()).FileChangeStatusToPrefix[statusCode] + atom.project.relativize(filePath);
    }
  } else {
    message = `\n more than ${MAX_DIALOG_FILE_STATUS_COUNT} files (check using \`hg status\`)`;
  }
  return message;
}

function getHeadRevision(revisions) {
  return revisions.find(revision => revision.isHead);
}

function getHeadToForkBaseRevisions(revisions) {
  // `headToForkBaseRevisions` should have the public commit at the fork base as the first.
  // and the rest of the current `HEAD` stack in order with the `HEAD` being last.
  const headRevision = getHeadRevision(revisions);
  if (headRevision == null) {
    return [];
  }
  const { CommitPhase } = (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants;
  const hashToRevisionInfo = new Map(revisions.map(revision => [revision.hash, revision]));
  const headToForkBaseRevisions = [];
  let parentRevision = headRevision;
  while (parentRevision != null && parentRevision.phase !== CommitPhase.PUBLIC) {
    headToForkBaseRevisions.unshift(parentRevision);
    parentRevision = hashToRevisionInfo.get(parentRevision.parents[0]);
  }
  if (parentRevision != null) {
    headToForkBaseRevisions.unshift(parentRevision);
  }
  return headToForkBaseRevisions;
}

function getSelectedFileChanges(repository, diffOption, revisions, compareCommitId) {
  const dirtyFileChanges = (0, (_vcs || _load_vcs()).getDirtyFileChanges)(repository);

  if (diffOption === (_constants || _load_constants()).DiffOption.DIRTY || diffOption === (_constants || _load_constants()).DiffOption.COMPARE_COMMIT && compareCommitId == null) {
    return _rxjsBundlesRxMinJs.Observable.of(dirtyFileChanges);
  }
  const headToForkBaseRevisions = getHeadToForkBaseRevisions(revisions);
  if (headToForkBaseRevisions.length <= 1) {
    return _rxjsBundlesRxMinJs.Observable.of(dirtyFileChanges);
  }

  const beforeCommitId = diffOption === (_constants || _load_constants()).DiffOption.LAST_COMMIT ? headToForkBaseRevisions[headToForkBaseRevisions.length - 2].id : compareCommitId;

  if (beforeCommitId == null) {
    return _rxjsBundlesRxMinJs.Observable.throw(new Error('compareCommitId cannot be null!'));
  }
  if (headToForkBaseRevisions.find(rev => rev.id === beforeCommitId) == null) {
    return _rxjsBundlesRxMinJs.Observable.of(dirtyFileChanges);
  }
  return getSelectedFileChangesToCommit(repository, beforeCommitId);
}

function getSelectedFileChangesToCommit(repository, beforeCommitId) {
  return repository.fetchFilesChangedSinceRevision(`${beforeCommitId}`).map(fileStatusCodes => {
    const fileChanges = new Map();
    for (const [filePath, statusCode] of fileStatusCodes) {
      fileChanges.set(filePath, (_vcs || _load_vcs()).HgStatusToFileChangeStatus[statusCode]);
    }
    return fileChanges;
  }).catch(error => {
    // Cannot get status during transient states (rebase / commit),
    // because the `compareId` in hand could be hidden.
    return _rxjsBundlesRxMinJs.Observable.never();
  });
}

function getHgDiff(repository, filePath, headToForkBaseRevisions, diffOption, compareId) {
  // When `compareCommitId` is null, the `HEAD` commit contents is compared
  // to the filesystem, otherwise it compares that commit to filesystem.
  const headCommit = getHeadRevision(headToForkBaseRevisions);
  if (headCommit == null) {
    return _rxjsBundlesRxMinJs.Observable.throw(new Error('Cannot fetch hg diff for revisions without head'));
  }
  const headCommitId = headCommit.id;
  let compareCommitId;
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
      return _rxjsBundlesRxMinJs.Observable.throw(new Error(`Invalid Diff Option: ${diffOption}`));
  }

  const revisionInfo = headToForkBaseRevisions.find(revision => revision.id === compareCommitId);
  if (revisionInfo == null) {
    return _rxjsBundlesRxMinJs.Observable.throw(new Error(`Diff Viw Fetcher: revision with id ${compareCommitId} not found`));
  }

  return repository.fetchFileContentAtRevision(filePath, `${compareCommitId}`)
  // If the file didn't exist on the previous revision,
  // Return the no such file at revision message.
  .catch(error => _rxjsBundlesRxMinJs.Observable.of('')).map(committedContents => ({
    committedContents,
    revisionInfo
  }));
}

function formatFileDiffRevisionTitle(revisionInfo) {
  const { hash, bookmarks } = revisionInfo;
  return `${hash}` + (bookmarks.length === 0 ? '' : ` - (${bookmarks.join(', ')})`);
}

function getAmendMode(shouldRebaseOnAmend) {
  if (shouldRebaseOnAmend) {
    return (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.AmendMode.REBASE;
  } else {
    return (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.AmendMode.CLEAN;
  }
}

function getRevisionUpdateMessage(phabricatorRevision) {
  return `

# Updating ${phabricatorRevision.name}
#
# Enter a brief description of the changes included in this update.
# The first line is used as subject, next lines as comment.`;
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
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Unrecognized diff view mode: ${viewMode}`);
      return (_constants || _load_constants()).DiffOption.DIRTY;
  }
}

function amendWithErrorOnFailure(repository, commitMessage, amendMode, publishUpdates) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    // Defer the update till amend flow start time.
    publishUpdates.next({ text: 'Amending commit with your changes', level: 'info' });
    return _rxjsBundlesRxMinJs.Observable.empty();
  }).concat(repository.amend(commitMessage, (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.AmendMode.CLEAN).flatMap(message => {
    // Side Effect: streaming progress to console.
    (0, (_streamProcessToConsoleMessages || _load_streamProcessToConsoleMessages()).pipeProcessMessagesToConsole)('Amend', publishUpdates, message);

    if (message.kind === 'exit' && message.exitCode !== 0) {
      return _rxjsBundlesRxMinJs.Observable.throw(new Error('Failed to amend commit - aborting publish!'));
    }
    return _rxjsBundlesRxMinJs.Observable.empty();
  })).ignoreElements();
}

// TODO(most): Cleanup to avoid using `.do()` and have side effects:
// (notifications & publish updates).
function createPhabricatorRevision(repository, publishUpdates, headCommitMessage, publishMessage, amended, isPrepareMode, lintExcuse) {
  const filePath = repository.getProjectDirectory();
  let amendStream = _rxjsBundlesRxMinJs.Observable.empty();
  if (!amended && publishMessage !== headCommitMessage) {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Amending commit with the updated message');
    // We intentionally amend in clean mode here, because creating the revision
    // amends the commit message (with the revision url), breaking the stack on top of it.
    // Consider prompting for `hg amend --fixup` after to rebase the stack when needed.
    amendStream = amendWithErrorOnFailure(repository, publishMessage, (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.AmendMode.CLEAN, publishUpdates);
  }

  return _rxjsBundlesRxMinJs.Observable.concat(
  // Amend head, if needed.
  amendStream,
  // Create a new revision.
  _rxjsBundlesRxMinJs.Observable.defer(() => {
    const stream = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(filePath).createPhabricatorRevision(filePath, isPrepareMode, lintExcuse).refCount();

    return processArcanistOutput(stream).startWith({ level: 'info', text: 'Creating new revision...\n' }).do(message => publishUpdates.next(message));
  }), _rxjsBundlesRxMinJs.Observable.defer(() => _rxjsBundlesRxMinJs.Observable.fromPromise(repository.getHeadCommitMessage()).do(commitMessage => {
    const phabricatorRevision = (0, (_utils || _load_utils()).getPhabricatorRevisionFromCommitMessage)(commitMessage || '');
    if (phabricatorRevision != null) {
      notifyRevisionStatus(phabricatorRevision, 'created');
    }
  }))).ignoreElements();
}

// TODO(most): Cleanup to avoid using `.do()` and have side effects:
// (notifications & publish updates).
function updatePhabricatorRevision(repository, publishUpdates, headCommitMessage, publishMessage, allowUntracked, lintExcuse, verbatimModeEnabled) {
  const filePath = repository.getProjectDirectory();

  const phabricatorRevision = (0, (_utils || _load_utils()).getPhabricatorRevisionFromCommitMessage)(headCommitMessage);
  if (phabricatorRevision == null) {
    return _rxjsBundlesRxMinJs.Observable.throw(new Error('A phabricator revision must exist to update!'));
  }

  const updateTemplate = getRevisionUpdateMessage(phabricatorRevision).trim();
  const userUpdateMessage = publishMessage.replace(updateTemplate, '').trim();
  if (userUpdateMessage.length === 0) {
    return _rxjsBundlesRxMinJs.Observable.throw(new Error('Cannot update revision with empty message'));
  }

  const stream = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(filePath).updatePhabricatorRevision(filePath, userUpdateMessage, allowUntracked, lintExcuse, verbatimModeEnabled).refCount();

  return processArcanistOutput(stream).startWith({ level: 'info', text: `Updating revision \`${phabricatorRevision.name}\`...\n` }).do({
    next: message => publishUpdates.next(message),
    complete: () => notifyRevisionStatus(phabricatorRevision, 'updated')
  }).ignoreElements();
}

function notifyRevisionStatus(phabRevision, statusMessage) {
  let message = `Revision ${statusMessage}`;
  if (phabRevision == null) {
    atom.notifications.addSuccess(message, { nativeFriendly: true });
    return;
  }
  const { name, url: revisionUrl } = phabRevision;
  message = `Revision '${name}' ${statusMessage}`;
  atom.notifications.addSuccess(message, {
    buttons: [{
      className: 'icon icon-globe',
      onDidClick() {
        _electron.shell.openExternal(revisionUrl);
      },
      text: 'Open in Phabricator'
    }],
    nativeFriendly: true
  });
}

function formatDiffViewUrl(diffEntityOptions_) {
  let diffEntityOptions = diffEntityOptions_;
  if (diffEntityOptions == null) {
    diffEntityOptions = { file: '' };
  }
  return _url.default.format({
    protocol: 'atom',
    host: 'nuclide',
    pathname: 'diff-view',
    slashes: true,
    query: diffEntityOptions
  });
}