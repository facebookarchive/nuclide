"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRepositorySubscriptions = createRepositorySubscriptions;
exports.fetchStatuses = fetchStatuses;
exports.fetchStackStatuses = fetchStackStatuses;
exports.fetchHeadStatuses = fetchHeadStatuses;
exports.getAdditionalLogFiles = getAdditionalLogFiles;
exports.fetchDiffInfo = fetchDiffInfo;
exports.getLockFilesInstantaneousExistance = getLockFilesInstantaneousExistance;
exports.createBookmark = createBookmark;
exports.deleteBookmark = deleteBookmark;
exports.renameBookmark = renameBookmark;
exports.fetchActiveBookmark = fetchActiveBookmark;
exports.fetchBookmarks = fetchBookmarks;
exports.fetchFileContentAtRevision = fetchFileContentAtRevision;
exports.batchFetchFileContentsAtRevision = batchFetchFileContentsAtRevision;
exports.fetchFilesChangedAtRevision = fetchFilesChangedAtRevision;
exports.fetchRevisionInfoBetweenHeadAndBase = fetchRevisionInfoBetweenHeadAndBase;
exports.fetchSmartlogRevisions = fetchSmartlogRevisions;
exports.getBaseRevision = getBaseRevision;
exports.getBlameAtHead = getBlameAtHead;
exports.getConfigValueAsync = getConfigValueAsync;
exports.getDifferentialRevisionForChangeSetId = getDifferentialRevisionForChangeSetId;
exports.getSmartlog = getSmartlog;
exports.commit = commit;
exports.editCommitMessage = editCommitMessage;
exports.amend = amend;
exports.restack = restack;
exports.revert = revert;
exports.checkout = checkout;
exports.show = show;
exports.diff = diff;
exports.purge = purge;
exports.uncommit = uncommit;
exports.strip = strip;
exports.checkoutForkBase = checkoutForkBase;
exports.rename = rename;
exports.remove = remove;
exports.forget = forget;
exports.add = add;
exports.getTemplateCommitMessage = getTemplateCommitMessage;
exports.getHeadCommitMessage = getHeadCommitMessage;
exports.log = log;
exports.fetchMergeConflicts = fetchMergeConflicts;
exports.markConflictedFile = markConflictedFile;
exports.continueOperation = continueOperation;
exports.abortOperation = abortOperation;
exports.resolveAllFiles = resolveAllFiles;
exports.rebase = rebase;
exports.reorderWithinStack = reorderWithinStack;
exports.pull = pull;
exports.copy = copy;
exports.getHeadId = getHeadId;
exports.getFullHashForRevision = getFullHashForRevision;
exports.fold = fold;
exports.runCommand = runCommand;
exports.observeExecution = observeExecution;
exports.gitDiffStrings = gitDiffStrings;
exports.HgRepositorySubscriptions = void 0;

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _nuclideWatchmanHelpers() {
  const data = require("../../../modules/nuclide-watchman-helpers");

  _nuclideWatchmanHelpers = function () {
    return data;
  };

  return data;
}

function _gitDiff() {
  const data = require("./git-diff");

  _gitDiff = function () {
    return data;
  };

  return data;
}

var _fs = _interopRequireDefault(require("fs"));

function _hgConstants() {
  const data = require("./hg-constants");

  _hgConstants = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _hgDiffOutputParser() {
  const data = require("./hg-diff-output-parser");

  _hgDiffOutputParser = function () {
    return data;
  };

  return data;
}

function _hgRevisionExpressionHelpers() {
  const data = require("./hg-revision-expression-helpers");

  _hgRevisionExpressionHelpers = function () {
    return data;
  };

  return data;
}

function StateHelpers() {
  const data = _interopRequireWildcard(require("./hg-revision-state-helpers"));

  StateHelpers = function () {
    return data;
  };

  return data;
}

function _hgUtils() {
  const data = require("./hg-utils");

  _hgUtils = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _debounce() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/debounce"));

  _debounce = function () {
    return data;
  };

  return data;
}

function BookmarkHelpers() {
  const data = _interopRequireWildcard(require("./hg-bookmark-helpers"));

  BookmarkHelpers = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _watchFileCreationAndDeletion() {
  const data = require("./watchFileCreationAndDeletion");

  _watchFileCreationAndDeletion = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-hg-rpc');
const DEFAULT_ARC_PROJECT_FORK_BASE = 'remote/master';
const DEFAULT_FORK_BASE_NAME = 'default';
const WATCHMAN_SUBSCRIPTION_NAME_PRIMARY = 'hg-repository-watchman-subscription-primary';
const WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK = 'hg-repository-watchman-subscription-hgbookmark';
const WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARKS = 'hg-repository-watchman-subscription-hgbookmarks';
const WATCHMAN_HG_DIR_STATE = 'hg-repository-watchman-subscription-dirstate';
const WATCHMAN_SUBSCRIPTION_NAME_CONFLICTS = 'hg-repository-watchman-subscription-conflicts';
const WATCHMAN_SUBSCRIPTION_NAME_PROGRESS = 'hg-repository-watchman-subscription-progress';
const WATCHMAN_SUBSCRIPTION_NAME_LOCK_FILES = 'hg-repository-watchman-subscription-lock-files';
const CHECK_CONFLICT_DELAY_MS = 2000;
const COMMIT_CHANGE_DEBOUNCE_MS = 1000; // If Watchman reports that many files have changed, it's not really useful to report this.
// This is typically caused by a large rebase or a Watchman re-crawl.
// We'll just report that the repository state changed, which should trigger a full client refresh.

const FILES_CHANGED_LIMIT = 1000;
const NUM_FETCH_STATUSES_LIMIT = 200; // Suffixes of hg error messages that indicate that an error is safe to ignore,
// and should not warrant a user-visible error. These generally happen
// when performing an hg operation on a non-existent or untracked file.

const IGNORABLE_ERROR_SUFFIXES = ['abort: no files to copy', 'No such file or directory', 'does not exist!'];
/**
 * These are status codes used by Mercurial's output.
 * Documented in http://selenic.com/hg/help/status.
 */

async function logWhenSubscriptionEstablished(sub, subName) {
  await sub;
  logger.debug(`Watchman subscription ${subName} established.`);
}

async function getForkBaseName(directoryPath) {
  try {
    // $FlowFB
    const {
      readArcConfig
    } = require("../../fb-arcanist-rpc");

    const arcConfig = await readArcConfig(directoryPath);

    if (arcConfig != null) {
      return arcConfig['arc.feature.start.default'] || arcConfig['arc.land.onto.default'] || DEFAULT_ARC_PROJECT_FORK_BASE;
    }
  } catch (err) {}

  return DEFAULT_FORK_BASE_NAME;
}
/**
 * @return Array of additional watch expressions to apply to the primary
 *   watchman subscription.
 */


function getPrimaryWatchmanSubscriptionRefinements() {
  let refinements = [];

  try {
    // $FlowFB
    refinements = require("./fb/config").primaryWatchSubscriptionRefinements;
  } catch (e) {// purposely blank
  }

  return refinements;
}

function resolvePathForPlatform(path) {
  // hg resolve on win has a bug where it returns path with both unix
  // and win separators (T22157755). We normalize the path here.
  if (process.platform === 'win32') {
    return path.replace(/\//g, '\\');
  }

  return path;
}
/** @return .hg/store directory for the specified Hg working directory root. */


async function findStoreDirectory(workingDirectory) {
  // If .hg/sharedpath is present, then this directory is using the Hg "share"
  // extension, in which case it is sharing the store with the .hg folder
  // specified by .hg/sharedpath.
  //
  // Note that we could be extra paranoid and watch for changes to
  // .hg/sharedpath, but that seems too rare to be worth the extra complexity.
  const sharedpath = _nuclideUri().default.join(workingDirectory, '.hg', 'sharedpath');

  let hgFolderWithStore;

  try {
    hgFolderWithStore = await _fsPromise().default.readFile(sharedpath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      // .hg/sharedpath does not exist: use .hg in workingDirectory.
      hgFolderWithStore = _nuclideUri().default.join(workingDirectory, '.hg');
    } else {
      throw error;
    }
  }

  return _nuclideUri().default.join(hgFolderWithStore, 'store');
}

class HgRepositorySubscriptions {
  // used to limit lifespan of other observables
  static async create(workingDirectory) {
    const repoSubscriptions = new HgRepositorySubscriptions(workingDirectory);
    await repoSubscriptions._subscribeToWatchman();
    return repoSubscriptions;
  } // DO NOT USE DIRECTLY: Use the static `create` instead.


  constructor(workingDirectory) {
    this._workingDirectory = workingDirectory;
    this._filesDidChangeObserver = new _RxMin.Subject();
    this._hgActiveBookmarkDidChangeObserver = new _RxMin.Subject();
    this._lockFilesDidChange = _RxMin.Observable.empty();
    this._hgBookmarksDidChangeObserver = new _RxMin.Subject();
    this._hgRepoStateDidChangeObserver = new _RxMin.Subject();
    this._hgConflictStateDidChangeObserver = new _RxMin.Subject();
    this._hgRepoCommitsDidChangeObserver = new _RxMin.Subject();
    this._hgOperationProgressDidChangeObserver = new _RxMin.Subject();
    this._isInConflict = false;
    this._debouncedCheckConflictChange = (0, _debounce().default)(() => {
      this._checkConflictChange();
    }, CHECK_CONFLICT_DELAY_MS);
    this._disposeObserver = new _RxMin.ReplaySubject();
  }

  async dispose() {
    this._disposeObserver.next();

    this._disposeObserver.complete();

    this._filesDidChangeObserver.complete();

    this._hgRepoStateDidChangeObserver.complete();

    this._hgActiveBookmarkDidChangeObserver.complete();

    this._hgBookmarksDidChangeObserver.complete();

    this._hgConflictStateDidChangeObserver.complete();

    if (this._hgStoreDirWatcher != null) {
      this._hgStoreDirWatcher.close();

      this._hgStoreDirWatcher = null;
    }

    await this._cleanUpWatchman();
  }

  async _subscribeToWatchman() {
    // Using a local variable here to allow better type refinement.
    const watchmanClient = new (_nuclideWatchmanHelpers().WatchmanClient)();
    this._watchmanClient = watchmanClient;
    const workingDirectory = this._workingDirectory;
    let primarySubscriptionExpression = ['allof', ['not', ['dirname', '.hg']], // Hg appears to modify temporary files that begin with these
    // prefixes, every time a file is saved.
    ['not', ['match', 'hg-checkexec-*', 'wholename']], ['not', ['match', 'hg-checklink-*', 'wholename']], // This watchman subscription is used to determine when and which
    // files to fetch new statuses for. There is no reason to include
    // directories in these updates, and in fact they may make us overfetch
    // statuses. (See diff summary of D2021498.)
    // This line restricts this subscription to only return files.
    ['type', 'f']];
    primarySubscriptionExpression = primarySubscriptionExpression.concat(getPrimaryWatchmanSubscriptionRefinements()); // Subscribe to changes to files unrelated to source control.

    const primarySubscriptionPromise = watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_PRIMARY, {
      fields: ['name', 'exists', 'new'],
      expression: primarySubscriptionExpression,
      defer: ['hg.update'],
      empty_on_fresh_instance: true
    });
    logWhenSubscriptionEstablished(primarySubscriptionPromise, WATCHMAN_SUBSCRIPTION_NAME_PRIMARY); // Subscribe to changes to files unrelated to source control.

    const conflictStateSubscriptionPromise = watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_CONFLICTS, {
      fields: ['name', 'exists', 'new'],
      expression: ['name', '.hg/merge', 'wholename'],
      defer: ['hg.update'],
      empty_on_fresh_instance: true
    });
    logWhenSubscriptionEstablished(conflictStateSubscriptionPromise, WATCHMAN_SUBSCRIPTION_NAME_CONFLICTS); // Subscribe to changes to the active Mercurial bookmark.

    const hgActiveBookmarkSubscriptionPromise = watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK, {
      fields: ['name', 'exists'],
      expression: ['name', '.hg/bookmarks.current', 'wholename'],
      defer: ['hg.update'],
      empty_on_fresh_instance: true
    });
    logWhenSubscriptionEstablished(hgActiveBookmarkSubscriptionPromise, WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK); // Subscribe to changes in Mercurial bookmarks.

    const hgBookmarksSubscriptionPromise = watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARKS, {
      fields: ['name', 'exists'],
      expression: ['name', '.hg/bookmarks', 'wholename'],
      defer: ['hg.update'],
      empty_on_fresh_instance: true
    });
    logWhenSubscriptionEstablished(hgBookmarksSubscriptionPromise, WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARKS);
    const dirStateSubscriptionPromise = watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_HG_DIR_STATE, {
      fields: ['name'],
      expression: ['name', '.hg/dirstate', 'wholename'],
      defer: ['hg.update'],
      empty_on_fresh_instance: true
    });
    logWhenSubscriptionEstablished(dirStateSubscriptionPromise, WATCHMAN_HG_DIR_STATE);
    const progressSubscriptionPromise = watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_PROGRESS, {
      fields: ['name'],
      expression: ['name', '.hg/progress', 'wholename'],
      empty_on_fresh_instance: true,
      defer_vcs: false
    });
    logWhenSubscriptionEstablished(progressSubscriptionPromise, WATCHMAN_SUBSCRIPTION_NAME_PROGRESS);
    this._lockFilesDidChange = (0, _watchFileCreationAndDeletion().subscribeToFilesCreateAndDelete)(watchmanClient, workingDirectory, _hgConstants().LockFilesList, WATCHMAN_SUBSCRIPTION_NAME_LOCK_FILES).publish().refCount(); // Those files' changes indicate a commit-changing action has been applied to the repository,
    // Watchman currently (v4.7) ignores `.hg/store` file updates.
    // Hence, we here use node's filesystem watchers instead.

    const hgStoreDirectory = await findStoreDirectory(workingDirectory);
    const commitChangeIndicators = ['00changelog.i', 'obsstore', 'inhibit'];

    try {
      this._hgStoreDirWatcher = _fs.default.watch(hgStoreDirectory, (event, fileName) => {
        if (commitChangeIndicators.indexOf(fileName) === -1) {
          this._commitsDidChange();
        }
      });
      (0, _log4js().getLogger)('nuclide-hg-rpc').debug('Node watcher created for .hg/store.');
    } catch (error) {
      (0, _log4js().getLogger)('nuclide-hg-rpc').error('Error when creating node watcher for hg store', error);
    }

    const [primarySubscription, hgActiveBookmarkSubscription, hgBookmarksSubscription, dirStateSubscription, conflictStateSubscription, progressSubscription] = await Promise.all([primarySubscriptionPromise, hgActiveBookmarkSubscriptionPromise, hgBookmarksSubscriptionPromise, dirStateSubscriptionPromise, conflictStateSubscriptionPromise, progressSubscriptionPromise]);
    primarySubscription.on('change', this._filesDidChange.bind(this));
    hgActiveBookmarkSubscription.on('change', this._hgActiveBookmarkDidChange.bind(this));
    hgBookmarksSubscription.on('change', this._hgBookmarksDidChange.bind(this));
    dirStateSubscription.on('change', this._emitHgRepoStateChanged.bind(this));
    conflictStateSubscription.on('change', this._debouncedCheckConflictChange);
    progressSubscription.on('change', this._hgOperationProgressDidChange.bind(this));
  }

  async _cleanUpWatchman() {
    if (this._watchmanClient != null) {
      await this._watchmanClient.dispose();
      this._watchmanClient = null;
    }
  }
  /**
   * @param fileChanges The latest changed watchman files.
   */


  _filesDidChange(fileChanges) {
    if (fileChanges.length > FILES_CHANGED_LIMIT) {
      this._emitHgRepoStateChanged();

      return;
    }

    const workingDirectory = this._workingDirectory;
    const changedFiles = fileChanges.map(change => _nuclideUri().default.join(workingDirectory, change.name));

    this._filesDidChangeObserver.next(changedFiles);
  }

  _commitsDidChange() {
    this._hgRepoCommitsDidChangeObserver.next();
  }

  _checkMergeDirectoryExists() {
    return _fsPromise().default.exists(_nuclideUri().default.join(this._workingDirectory, '.hg', 'merge'));
  }

  async _checkConflictChange() {
    const mergeDirectoryExists = await this._checkMergeDirectoryExists();
    this._isInConflict = mergeDirectoryExists;

    this._hgConflictStateDidChangeObserver.next(mergeDirectoryExists);
  }

  _emitHgRepoStateChanged() {
    this._hgRepoStateDidChangeObserver.next();
  }

  _hgActiveBookmarkDidChange() {
    this._hgActiveBookmarkDidChangeObserver.next();
  }

  _hgBookmarksDidChange() {
    this._hgBookmarksDidChangeObserver.next();
  }

  _hgOperationProgressDidChange() {
    this._hgOperationProgressDidChangeObserver.next();
  }
  /**
   * Observes one of more files has changed. Applies to all files except
   * .hgignore files. (See ::onHgIgnoreFileDidChange.)
   * @return A Observable which emits the changed file paths.
   */


  observeFilesDidChange() {
    return this._filesDidChangeObserver.publish();
  }
  /**
   * Observes that a Mercurial repository commits state have changed
   * (e.g. commit, amend, histedit, strip, rebase) that would require refetching from the service.
   */


  observeHgCommitsDidChange() {
    return this._hgRepoCommitsDidChangeObserver // Upon rebase, this can fire once per added commit!
    // Apply a generous debounce to avoid overloading the RPC connection.
    .let((0, _observable().fastDebounce)(COMMIT_CHANGE_DEBOUNCE_MS)).publish();
  }
  /**
   * Observes that a Mercurial event has occurred (e.g. histedit) that would
   * potentially invalidate any data cached from responses from this service.
   */


  observeHgRepoStateDidChange() {
    return this._hgRepoStateDidChangeObserver.publish();
  }
  /**
   * Observes when a Mercurial repository enters and exits a rebase state.
   */


  observeHgConflictStateDidChange() {
    this._checkConflictChange();

    return this._hgConflictStateDidChangeObserver.publish();
  }
  /**
   * Observes when the Mercurial operation progress has changed
   */


  observeHgOperationProgressDidChange() {
    return this._hgOperationProgressDidChangeObserver.let((0, _observable().fastDebounce)(50)).switchMap(() => _RxMin.Observable.fromPromise(_fsPromise().default.readFile(_nuclideUri().default.join(this._workingDirectory, '.hg', 'progress'), 'utf8')).catch(() => {
      (0, _log4js().getLogger)('nuclide-hg-rpc').error('.hg/progress changed but could not be read');
      return _RxMin.Observable.empty();
    }).filter(content => content.length > 0).map(content => JSON.parse(content)).catch(() => {
      (0, _log4js().getLogger)('nuclide-hg-rpc').error('.hg/progress changed but its contents could not be parsed as JSON');
      return _RxMin.Observable.empty();
    })).publish();
  }
  /**
   * Observes that the active Mercurial bookmark has changed.
   */


  observeActiveBookmarkDidChange() {
    return this._hgActiveBookmarkDidChangeObserver.publish();
  }
  /**
   * Observes that the Mercurial working directory lock has changed.
   */


  observeLockFilesDidChange() {
    return this._lockFilesDidChange.takeUntil(this._disposeObserver).publish();
  }
  /**
   * Observes that Mercurial bookmarks have changed.
   */


  observeBookmarksDidChange() {
    return this._hgBookmarksDidChangeObserver.publish();
  }

}

exports.HgRepositorySubscriptions = HgRepositorySubscriptions;

function createRepositorySubscriptions(workingDirectory) {
  return HgRepositorySubscriptions.create(workingDirectory);
}
/**
 * Section: File and Repository Status
 */

/**
 * Shells out of the `hg status` to get the statuses of the paths.
 */


function fetchStatuses(workingDirectory, toRevision) {
  const execOptions = {
    cwd: workingDirectory
  };
  const args = ['status', '-Tjson'];

  if (toRevision != null) {
    args.push('--rev', toRevision);
  }

  return (0, _hgUtils().hgRunCommand)(args, execOptions).map(stdout => {
    const statusMap = new Map();
    const statuses = JSON.parse(stdout);

    for (const status of (0, _collection().takeIterable)(statuses, NUM_FETCH_STATUSES_LIMIT)) {
      statusMap.set(_nuclideUri().default.join(workingDirectory, status.path), status.status);
    }

    return statusMap;
  }).publish();
}
/**
 * Like fetchStatuses, but first calculates the root of the current
 * stack and fetches changes since that revision.
 */


function fetchStackStatuses(workingDirectory) {
  // Note: an alternative which doesn't depend upon reading .arcconfig in getForkBaseName is:
  //   return fetchStatuses(workingDirectory, ('ancestor(ancestor((not public()) and (:: .))^ or .)')
  // Both the code below and the alternative above have identical performance.
  return _RxMin.Observable.fromPromise(getForkBaseName(workingDirectory)) // e.g. "master"
  .switchMap(forkBaseName => {
    const root = (0, _hgRevisionExpressionHelpers().expressionForCommonAncestor)(forkBaseName); // e.g. "ancestor(master, .)"

    return fetchStatuses(workingDirectory, root).refCount();
  }).publish();
}
/**
 * Like fetchStatuses, but first checks whether the head is public. If so, returns
 * changes *since* the head. If not, returns changes *including* the head.
 */


function fetchHeadStatuses(workingDirectory) {
  return fetchStatuses(workingDirectory, 'ancestor(. or (. and (not public()))^)');
}

async function getAdditionalLogFiles(workingDirectory, deadline) {
  const options = {
    cwd: workingDirectory
  };
  const base = await (0, _promise().timeoutAfterDeadline)(deadline, getForkBaseName(workingDirectory)); // e.g. master

  const root = (0, _hgRevisionExpressionHelpers().expressionForCommonAncestor)(base); // ancestor(master, .)
  // The ID of the root

  const getId = async () => {
    try {
      const args = ['id', '--rev', root];
      const output = await (0, _hgUtils().hgAsyncExecute)(args, options);
      return output.stdout ? output.stdout.trim() : '<id unknown>';
    } catch (e) {
      return `<id error: ${e.stderr}`;
    }
  }; // Diff from base to current working directory


  const getDiff = async () => {
    try {
      const args = ['diff', '--unified', '0', '-r', root];
      const output = await (0, _hgUtils().hgAsyncExecute)(args, options);
      return output.stdout ? output.stdout.trim() : '<diff unknown>';
    } catch (e) {
      return `<diff error: ${e.stderr}>`;
    }
  }; // Summary of changes from base to current working directory


  const getStatus = async () => {
    const statuses = await fetchStatuses(workingDirectory, root).refCount().toPromise();
    let result = '';

    for (const [filepath, status] of statuses) {
      result += `${status} ${filepath}\n`;
    }

    return result;
  };

  const [id, hgDiff, status] = await Promise.all([(0, _promise().timeoutAfterDeadline)(deadline, getId()).catch(e => `id ${e.message}\n${e.stack}`), (0, _promise().timeoutAfterDeadline)(deadline, getDiff()).catch(e => 'diff ' + (0, _string().stringifyError)(e)), (0, _promise().timeoutAfterDeadline)(deadline, getStatus()).catch(e => 'status ' + (0, _string().stringifyError)(e))]);
  const results = []; // If the user is on a public revision, there's no need to provide hgdiff.

  results.push({
    title: `${workingDirectory}:hg`,
    data: `hg update -r ${id}\n` + (status === '' ? '' : 'hg import --no-commit hgdiff\n') + `\n${status}`
  });

  if (status !== '') {
    results.push({
      title: `${workingDirectory}:hgdiff`,
      data: hgDiff
    });
  }

  return results;
}
/**
 * Shells out to `hg diff` to retrieve line diff information for the paths.
 * @param An Array of NuclideUri (absolute paths) for which to fetch diff info.
 * @return A map of each NuclideUri (absolute path) to its DiffInfo.
 *   Each path is presumed to be in the repo.
 *   If the `hg diff` call fails, this method returns null.
 *   If a path has no changes, it will not appear in the returned Map.
 */


async function fetchDiffInfo(workingDirectory, filePaths) {
  // '--unified 0' gives us 0 lines of context around each change (we don't
  // care about the context).
  // '--noprefix' omits the a/ and b/ prefixes from filenames.
  // '--nodates' avoids appending dates to the file path line.
  const args = ['diff', '--unified', '0', '--noprefix', '--nodates'].concat(filePaths);
  const options = {
    cwd: workingDirectory
  };
  let output;

  try {
    output = await (0, _hgUtils().hgAsyncExecute)(args, options);
  } catch (e) {
    (0, _log4js().getLogger)('nuclide-hg-rpc').error(`Error when running hg diff for paths: ${filePaths.toString()} \n\tError: ${e.stderr}`);
    return null;
  }

  const pathToDiffInfo = (0, _hgDiffOutputParser().parseMultiFileHgDiffUnifiedOutput)(output.stdout);
  const absolutePathToDiffInfo = new Map();

  for (const [filePath, diffInfo] of pathToDiffInfo) {
    absolutePathToDiffInfo.set(_nuclideUri().default.join(workingDirectory, filePath), diffInfo);
  }

  return absolutePathToDiffInfo;
}

function getLockFilesInstantaneousExistance(workingDirectory) {
  return (0, _watchFileCreationAndDeletion().getFilesInstantaneousExistance)(workingDirectory, _hgConstants().LockFilesList).toPromise();
}
/**
 * Section: Bookmarks
 */


function createBookmark(workingDirectory, name, revision) {
  const args = []; // flowlint-next-line sketchy-null-string:off

  if (revision) {
    args.push('--rev', revision);
  }

  args.push(name);
  return _runSimpleInWorkingDirectory(workingDirectory, 'bookmark', args);
}

function deleteBookmark(workingDirectory, name) {
  return _runSimpleInWorkingDirectory(workingDirectory, 'bookmarks', ['--delete', name]);
}

function renameBookmark(workingDirectory, name, nextName) {
  return _runSimpleInWorkingDirectory(workingDirectory, 'bookmarks', ['--rename', name, nextName]);
}
/**
 * @return The name of the current bookmark.
 */


function fetchActiveBookmark(workingDirectory) {
  return BookmarkHelpers().fetchActiveBookmark(_nuclideUri().default.join(workingDirectory, '.hg'));
}
/**
 * @return An Array of bookmarks for this repository.
 */


function fetchBookmarks(workingDirectory) {
  return BookmarkHelpers().fetchBookmarks(_nuclideUri().default.join(workingDirectory, '.hg'));
}
/**
 * Section: Repository State at Specific Revisions
 */

/**
 * @param filePath: The full path to the file of interest.
 * @param revision: An expression that hg can understand, specifying the
 * revision at which we want to see the file content.
 */


function fetchFileContentAtRevision(workingDirectory, filePath, revision) {
  return StateHelpers().fetchFileContentAtRevision(filePath, revision, workingDirectory);
}

function batchFetchFileContentsAtRevision(workingDirectory, filePaths, revision) {
  return StateHelpers().batchFetchFileContentsAtRevision(filePaths, revision, workingDirectory);
}

function fetchFilesChangedAtRevision(workingDirectory, revision) {
  return StateHelpers().fetchFilesChangedAtRevision(revision, workingDirectory);
}
/**
 * Fetch the revision details between the current head and the the common ancestor
 * of head and master in the repository.
 * @return an array with the revision info (`title`, `author`, `date` and `id`)
 * or `null` if no common ancestor was found.
 */


async function fetchRevisionInfoBetweenHeadAndBase(workingDirectory) {
  const forkBaseName = await getForkBaseName(workingDirectory);
  const revisionsInfo = await (0, _hgRevisionExpressionHelpers().fetchRevisionInfoBetweenRevisions)((0, _hgRevisionExpressionHelpers().expressionForCommonAncestor)(forkBaseName), (0, _hgRevisionExpressionHelpers().expressionForRevisionsBeforeHead)(0), workingDirectory);
  return revisionsInfo;
}

function fetchSmartlogRevisions(workingDirectory) {
  return (0, _hgRevisionExpressionHelpers().fetchSmartlogRevisions)(workingDirectory);
}
/**
 * Resolve the revision details of the base branch
 */


async function getBaseRevision(workingDirectory) {
  const forkBaseName = await getForkBaseName(workingDirectory);
  return (0, _hgRevisionExpressionHelpers().fetchRevisionInfo)((0, _hgRevisionExpressionHelpers().expressionForCommonAncestor)(forkBaseName), workingDirectory);
}
/**
 * Gets the blame for the filePath at the current revision.
 * It returns null for uncommitted changes (but cannot detect unsaved changes)
 * @param filePath The file to get blame information for.
 * @return An Array that maps a line number (0-indexed) to the revision info.
 */


async function getBlameAtHead(workingDirectory, filePath) {
  let revisionsByLine;

  try {
    revisionsByLine = (await (0, _hgUtils().hgAsyncExecute)(['blame', '-c', // Query the hash
    '-T', '{lines % "{node|short}\n"}', // Just display the hash per line
    '-r', 'wdir()', // Blank out uncommitted changes
    filePath], {
      cwd: workingDirectory
    })).stdout.split('\n');
  } catch (e) {
    (0, _log4js().getLogger)('nuclide-hg-rpc').error(`LocalHgServiceBase failed to fetch blame for file: ${filePath}. Error: ${e.stderr}`);
    throw e;
  }

  const uniqueRevisions = [...new Set(revisionsByLine.filter(e => e))];
  let revisionsArray;

  try {
    revisionsArray = await (0, _hgRevisionExpressionHelpers().fetchRevisionsInfo)(uniqueRevisions.join('+'), workingDirectory, {
      hidden: true,
      shouldLimit: false
    }).toPromise();
  } catch (e) {
    (0, _log4js().getLogger)('nuclide-hg-rpc').error(`LocalHgServiceBase failed to fetch blame for file: ${filePath}. Error: ${e.stderr}`);
    throw e;
  }

  const revisionsByHash = {};
  revisionsArray.forEach(revision => {
    revisionsByHash[revision.hash] = revision;
  });
  return revisionsByLine.map(hash => revisionsByHash[hash]);
}
/**
 * Returns the value of the config item at `key`.
 * @param key Name of config item
 */


async function getConfigValueAsync(workingDirectory, key) {
  const args = ['config', key];
  const execOptions = {
    cwd: workingDirectory
  };

  try {
    return (await (0, _hgUtils().hgAsyncExecute)(args, execOptions)).stdout.trim();
  } catch (e) {
    (0, _log4js().getLogger)('nuclide-hg-rpc').error(`Failed to fetch Hg config for key ${key}.  Error: ${e.toString()}`);
    return null;
  }
}
/**
 * Gets the Differential Revision id (aka DXXXXXX) id for the specified changeSetId, if it exists.
 * Otherwise, returns null.
 * This implementation relies on the "phabdiff" template being available as defined in:
 * https://bitbucket.org/facebook/hg-experimental/src/fbf23b3f96bade5986121a7c57d7400585d75f54/phabdiff.py.
 */


async function getDifferentialRevisionForChangeSetId(workingDirectory, changeSetId) {
  const args = ['log', '-T', '{phabdiff}\n', '--limit', '1', '--rev', changeSetId];
  const execOptions = {
    cwd: workingDirectory
  };

  try {
    const output = await (0, _hgUtils().hgAsyncExecute)(args, execOptions);
    const stdout = output.stdout.trim();
    return stdout ? stdout : null;
  } catch (e) {
    // This should not happen: `hg log` does not error even if it does not recognize the template.
    (0, _log4js().getLogger)('nuclide-hg-rpc').error(`Failed when trying to get differential revision for: ${changeSetId}`);
    return null;
  }
}
/**
 * Get the output of the experimental smartlog extension from Mercurial:
 * https://bitbucket.org/facebook/hg-experimental/#markdown-header-smartlog.
 * @param ttyOutput If true, return the output as if stdout were attached to a tty.
 * @param concise true to run `hg smartlog`; false to run `hg ssl`.
 * @return The output from running the command.
 */


async function getSmartlog(workingDirectory, ttyOutput, concise) {
  // disable the pager extension so that 'hg ssl' terminates. We can't just use
  // HGPLAIN because we have not found a way to get colored output when we do.
  const args = ['--config', 'extensions.pager=!', concise ? 'ssl' : 'smartlog'];
  const execOptions = {
    cwd: workingDirectory,
    NO_HGPLAIN: concise,
    // `hg ssl` is likely user-defined.
    TTY_OUTPUT: ttyOutput
  };
  return (0, _hgUtils().hgAsyncExecute)(args, execOptions);
}

function _commitCode(workingDirectory, message, args) {
  // TODO(T17463635)
  let editMergeConfigs;
  return _RxMin.Observable.fromPromise((async () => {
    if (message == null) {
      return args;
    } else {
      return [...args, '-m', (0, _hgUtils().formatCommitMessage)(message)];
    }
  })()).switchMap(argumentsWithCommitFile => {
    const execArgs = argumentsWithCommitFile;
    const execOptions = {
      cwd: workingDirectory
    };

    if (editMergeConfigs != null) {
      execArgs.push(...editMergeConfigs.args);
      execOptions.HGEDITOR = editMergeConfigs.hgEditor;
    }

    return (0, _hgUtils().hgObserveExecution)(execArgs, execOptions);
  });
}
/**
 * Commit code to version control.
 * @param message Commit message.
 * @param filePaths List of changed files to commit. If empty, all will be committed
 */


function commit(workingDirectory, message, filePaths = []) {
  // TODO(T17463635)
  return _commitCode(workingDirectory, message, ['commit', ...filePaths]).publish();
}
/*
   * Edit commit message associated with a revision
   * @param revision Hash of the revision to be updated
   * @param message New commit message
   * @return Process update message while running metaedit
   */


function editCommitMessage(workingDirectory, revision, message) {
  const args = ['metaedit', '-r', revision, '-m', message];
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgObserveExecution)(args, execOptions).publish();
}
/**
 * Amend code changes to the latest commit.
 * @param message Commit message.  Message will remain unchaged if not provided.
 * @param amendMode Decide the amend functionality to apply.
 *  Clean to just amend.
 *  Rebase to amend and rebase the stacked diffs.
 *  Fixup to fix the stacked commits, rebasing them on top of this commit.
 * @param filePaths List of changed files to commit. If empty, all will be committed
 */


function amend(workingDirectory, message, amendMode, filePaths = []) {
  // TODO(T17463635)
  const args = ['amend', ...filePaths];

  switch (amendMode) {
    case 'Clean':
      break;

    case 'Rebase':
      args.push('--rebase');
      break;

    case 'Fixup':
      args.push('--fixup');
      break;

    default:
      amendMode;
      throw new Error('Unexpected AmendMode');
  }

  return _commitCode(workingDirectory, message, args).publish();
}

function restack(workingDirectory) {
  const args = ['rebase', '--restack'];
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgObserveExecution)(args, execOptions).publish();
}

function revert(workingDirectory, filePaths, toRevision) {
  const args = [...filePaths];

  if (toRevision != null) {
    args.push('--rev', toRevision);
  }

  return _runSimpleInWorkingDirectory(workingDirectory, 'revert', args);
}

async function _runSimpleInWorkingDirectory(workingDirectory, action, args) {
  const options = {
    cwd: workingDirectory
  };
  const cmd = [action].concat(args);

  try {
    await (0, _hgUtils().hgAsyncExecute)(cmd, options);
  } catch (e) {
    const errorString = e.stderr || e.message || e.toString();
    (0, _log4js().getLogger)('nuclide-hg-rpc').error('hg %s failed with [%s] arguments: %s', action, args.toString(), errorString);
    throw new Error(errorString);
  }
}
/**
 * @param revision This could be a changeset ID, name of a bookmark, revision number, etc.
 * @param create Currently, this parameter is ignored.
 * @param options.
 */


function checkout(workingDirectory, revision, create, options) {
  // TODO(T17463635)
  const args = ['checkout', revision];

  if (options && options.clean) {
    args.push('--clean');
  }

  const executionOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgObserveExecution)(args, executionOptions).publish();
}

function show(workingDirectory, revision) {
  const args = ['show', `${revision}`, '--git', '-Tjson'];
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgRunCommand)(args, execOptions).map(stdout => {
    return JSON.parse(stdout)[0];
  }).publish();
}

function diff(workingDirectory, revision, unified, diffCommitted, noPrefix, noDates) {
  const args = ['diff', diffCommitted ? '-c' : '-r', revision];

  if (unified != null) {
    args.push('--unified', `${unified}`);
  }

  if (noPrefix) {
    args.push('--noprefix');
  }

  if (noDates) {
    args.push('--nodates');
  }

  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgRunCommand)(args, execOptions).publish();
}
/**
 * Removes files not tracked by Mercurial.
 */


function purge(workingDirectory) {
  return _runSimpleInWorkingDirectory(workingDirectory, 'purge', []);
}
/**
 * Undoes the effect of a local commit, specifically the working directory parent.
 */


function uncommit(workingDirectory) {
  return _runSimpleInWorkingDirectory(workingDirectory, 'uncommit', []);
}
/**
 * @param revision This could be a changeset ID, name of a bookmark, revision number, etc.
 */


function strip(workingDirectory, revision) {
  return _runSimpleInWorkingDirectory(workingDirectory, 'hide', [revision]);
}
/**
 * @param revision This could be a changeset ID, name of a bookmark, revision number, etc.
 * @param create Currently, this parameter is ignored.
 */


async function checkoutForkBase(workingDirectory) {
  const forkBaseName = await getForkBaseName(workingDirectory);
  await _runSimpleInWorkingDirectory(workingDirectory, 'checkout', [forkBaseName]);
}
/*
 * Silence errors from hg calls that don't include any tracked files - these
 * are generally harmless and should not create an error notification.
 * This checks the error string in order to avoid potentially slow hg pre-checks.
 */


function _rethrowErrorIfHelpful(e) {
  if (!IGNORABLE_ERROR_SUFFIXES.some(s => e.message.endsWith(s + '\n'))) {
    throw e;
  }
}
/**
 * Rename/move files versioned under Hg.
 * @param filePaths Which files should be renamed/moved.
 * @param destPath What should the file be renamed/moved to.
 */


async function rename(workingDirectory, filePaths, destPath, after) {
  const args = [...filePaths.map(p => _nuclideUri().default.getPath(p)), // Sources
  _nuclideUri().default.getPath(destPath)];

  if (after) {
    args.unshift('--after');
  }

  try {
    await _runSimpleInWorkingDirectory(workingDirectory, 'rename', args);
  } catch (e) {
    if (after) {
      _rethrowErrorIfHelpful(e);
    } else {
      throw e;
    }
  }
}
/**
 * Remove a file versioned under Hg.
 * @param filePath Which file should be removed.
 */


async function remove(workingDirectory, filePaths, after) {
  const args = ['-f', ...filePaths.map(p => _nuclideUri().default.getPath(p))];

  if (after) {
    args.unshift('--after');
  }

  try {
    await _runSimpleInWorkingDirectory(workingDirectory, 'remove', args);
  } catch (e) {
    if (after) {
      _rethrowErrorIfHelpful(e);
    } else {
      throw e;
    }
  }
}
/**
 * Mark the specified files so they will no longer be tracked by hg after the next commit.
 * The file will remain in the working directory.
 * @param filePath Which file(s) should be forgotten.
 */


async function forget(workingDirectory, filePaths) {
  const args = [...filePaths.map(p => _nuclideUri().default.getPath(p))];

  try {
    await _runSimpleInWorkingDirectory(workingDirectory, 'forget', args);
  } catch (e) {
    throw e;
  }
}
/**
 * Version a new file under Hg.
 * @param filePath Which file should be versioned.
 */


function add(workingDirectory, filePaths) {
  return _runSimpleInWorkingDirectory(workingDirectory, 'add', filePaths);
}

async function getTemplateCommitMessage(workingDirectory) {
  const args = ['debugcommitmessage'];
  const execOptions = {
    cwd: workingDirectory
  };

  try {
    const {
      stdout
    } = await (0, _hgUtils().hgAsyncExecute)(args, execOptions);
    return stdout;
  } catch (e) {
    (0, _log4js().getLogger)('nuclide-hg-rpc').error('Failed when trying to get template commit message');
    return null;
  }
}

async function getHeadCommitMessage(workingDirectory) {
  const args = ['log', '-T', '{desc}\n', '--limit', '1', '--rev', (0, _hgRevisionExpressionHelpers().expressionForRevisionsBeforeHead)(0)];
  const execOptions = {
    cwd: workingDirectory
  };

  try {
    const output = await (0, _hgUtils().hgAsyncExecute)(args, execOptions);
    const stdout = output.stdout.trim();
    return stdout || null;
  } catch (e) {
    // This should not happen: `hg log` does not error even if it does not recognize the template.
    (0, _log4js().getLogger)('nuclide-hg-rpc').error('Failed when trying to get head commit message');
    return null;
  }
}

async function log(workingDirectory, filePaths, limit) {
  const args = ['log', '-Tjson'];

  if (limit != null && limit > 0) {
    args.push('--limit', String(limit));
  }

  for (const filePath of filePaths) {
    args.push(filePath);
  }

  const execOptions = {
    cwd: workingDirectory
  };
  const result = await (0, _hgUtils().hgAsyncExecute)(args, execOptions);
  const entries = JSON.parse(result.stdout);
  return {
    entries
  };
}

function fetchMergeConflicts(workingDirectory) {
  const args = ['resolve', '--tool=internal:dumpjson', '--all', '--config', 'extensions.conflictinfo='];
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgRunCommand)(args, execOptions).map(data => {
    const parsedData = JSON.parse(data)[0];

    if (parsedData.command == null) {
      return null;
    }

    const conflicts = parsedData.conflicts.map(conflict => {
      const {
        local,
        other
      } = conflict;
      let status;
      conflict.output.path = resolvePathForPlatform(conflict.output.path);

      if (local.exists && other.exists) {
        status = _hgConstants().MergeConflictStatus.BOTH_CHANGED;
      } else if (local.exists) {
        status = _hgConstants().MergeConflictStatus.DELETED_IN_THEIRS;
      } else {
        status = _hgConstants().MergeConflictStatus.DELETED_IN_OURS;
      }

      return Object.assign({}, conflict, {
        status
      });
    });
    return Object.assign({}, parsedData, {
      conflicts
    });
  }) // `resolve --all` returns a non-zero exit code when there's no conflicts.
  .catch(() => _RxMin.Observable.of(null)).publish();
}

function markConflictedFile(workingDirectory, filePath, resolved) {
  // TODO(T17463635)
  // -m marks file as resolved, -u marks file as unresolved
  const fileStatus = resolved ? '-m' : '-u';
  const args = ['resolve', fileStatus, filePath];
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgObserveExecution)(args, execOptions).publish();
}

function continueOperation(workingDirectory, args) {
  // TODO(T17463635)
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgObserveExecution)(args, execOptions).publish();
}

function abortOperation(workingDirectory, commandWithOptions) {
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgRunCommand)(commandWithOptions, execOptions).publish();
}

function resolveAllFiles(workingDirectory) {
  const args = ['resolve', '--all'];
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgObserveExecution)(args, execOptions).publish();
}

function rebase(workingDirectory, destination, source) {
  // TODO(T17463635)
  const args = ['rebase', '-d', destination];

  if (source != null) {
    args.push('-s', source);
  }

  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgObserveExecution)(args, execOptions).publish();
}
/**
 *  Given a list of the new order of revisions, use histedit to rearrange
 *  history to match the input. Note that you must be checked out on the
 *  stack above where any reordering takes place, and there can be no
 *  branches off of any revision in the stack except the top one.
 */


function reorderWithinStack(workingDirectory, orderedRevisions) {
  const args = ['histedit', '--commands', '-'];
  const commandsJson = JSON.stringify({
    histedit: orderedRevisions.map(hash => {
      return {
        node: hash,
        action: _hgConstants().HisteditActions.PICK
      };
    })
  });
  const execOptions = {
    cwd: workingDirectory,
    input: commandsJson
  };
  return (0, _hgUtils().hgRunCommand)(args, execOptions).publish();
}

function pull(workingDirectory, options) {
  // TODO(T17463635)
  const args = ['pull', ...options];
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgObserveExecution)(args, execOptions).publish();
}
/**
 * Copy files versioned under Hg.
 * @param filePaths Which files should be copied.
 * @param destPath What should the new file be named to.
 */


async function copy(workingDirectory, filePaths, destPath, after) {
  const args = [...filePaths.map(p => _nuclideUri().default.getPath(p)), // Sources
  _nuclideUri().default.getPath(destPath)];

  if (after) {
    args.unshift('--after');
  }

  try {
    await _runSimpleInWorkingDirectory(workingDirectory, 'copy', args);
  } catch (e) {
    if (after) {
      _rethrowErrorIfHelpful(e);
    } else {
      throw e;
    }
  }
}
/**
 * Gets the current head revision hash
 */


function getHeadId(workingDirectory, useShortHash = false) {
  const template = useShortHash ? '{node|short}' : '{node}';
  const args = ['log', '--template', template, '--limit', '1'];
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgRunCommand)(args, execOptions).publish();
}
/**
 * Given a short hash or revset, returns the full 40-char hash.
 */


async function getFullHashForRevision(workingDirectory, rev) {
  const args = ['log', '--template', '{node}', '--limit', '1', '-r', rev];
  const options = {
    cwd: workingDirectory
  };
  const output = await (0, _hgUtils().hgAsyncExecute)(args, options);
  return output.stdout ? output.stdout.trim() : null;
}
/**
 * @param from This could be a changeset ID, name of a bookmark, revision number, etc.
 * @param to This could be a changeset ID, name of a bookmark, revision number, etc.
 * @param message New message for the resulting folded commit.
 */


function fold(workingDirectory, from, to, message) {
  const args = ['fold', '--exact', `${from}::${to}`, '--message', message];
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgRunCommand)(args, execOptions).publish();
}

function runCommand(workingDirectory, args) {
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgRunCommand)(args, execOptions).publish();
}

function observeExecution(workingDirectory, args) {
  const execOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgObserveExecution)(args, execOptions).publish();
} // not really Hg functionality, but this was chosen to be the best current home
// for this method as it spawns processes and should live in an remote service


function gitDiffStrings(oldContents, newContents) {
  return (0, _gitDiff().gitDiffStrings)(oldContents, newContents).publish();
}