'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HgService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let logWhenSubscriptionEstablished = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (sub, subName) {
    yield sub;
    logger.debug(`Watchman subscription ${subName} established.`);
  });

  return function logWhenSubscriptionEstablished(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let getForkBaseName = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (directoryPath) {
    try {
      // $FlowFB
      const { readArcConfig } = require('../../fb-arcanist-rpc');
      const arcConfig = yield readArcConfig(directoryPath);
      if (arcConfig != null) {
        return arcConfig['arc.feature.start.default'] || arcConfig['arc.land.onto.default'] || DEFAULT_ARC_PROJECT_FORK_BASE;
      }
    } catch (err) {}
    return DEFAULT_FORK_BASE_NAME;
  });

  return function getForkBaseName(_x3) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * @return Array of additional watch expressions to apply to the primary
 *   watchman subscription.
 */


var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = require('nuclide-watchman-helpers');
}

var _fs = _interopRequireDefault(require('fs'));

var _hgConstants;

function _load_hgConstants() {
  return _hgConstants = require('./hg-constants');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _hgDiffOutputParser;

function _load_hgDiffOutputParser() {
  return _hgDiffOutputParser = require('./hg-diff-output-parser');
}

var _hgRevisionExpressionHelpers;

function _load_hgRevisionExpressionHelpers() {
  return _hgRevisionExpressionHelpers = require('./hg-revision-expression-helpers');
}

var _hgRevisionStateHelpers;

function _load_hgRevisionStateHelpers() {
  return _hgRevisionStateHelpers = require('./hg-revision-state-helpers');
}

var _hgUtils;

function _load_hgUtils() {
  return _hgUtils = require('./hg-utils');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

var _hgBookmarkHelpers;

function _load_hgBookmarkHelpers() {
  return _hgBookmarkHelpers = require('./hg-bookmark-helpers');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _watchFileCreationAndDeletion;

function _load_watchFileCreationAndDeletion() {
  return _watchFileCreationAndDeletion = require('./watchFileCreationAndDeletion');
}

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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc');
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
const COMMIT_CHANGE_DEBOUNCE_MS = 1000;

// If Watchman reports that many files have changed, it's not really useful to report this.
// This is typically caused by a large rebase or a Watchman re-crawl.
// We'll just report that the repository state changed, which should trigger a full client refresh.
const FILES_CHANGED_LIMIT = 1000;

// Suffixes of hg error messages that indicate that an error is safe to ignore,
// and should not warrant a user-visible error. These generally happen
// when performing an hg operation on a non-existent or untracked file.
const IGNORABLE_ERROR_SUFFIXES = ['abort: no files to copy', 'No such file or directory', 'does not exist!'];

/**
 * These are status codes used by Mercurial's output.
 * Documented in http://selenic.com/hg/help/status.
 */


/**
 * Internally, the HgRepository uses the string StatusCodeId to do bookkeeping.
 * However, GitRepository uses numbers to represent its statuses, and returns
 * statuses as numbers. In order to keep our status 'types' the same, we map the
 * string StatusCodeId to numbers.
 * The numbers themselves should not matter; they are meant to be passed
 * to ::isStatusNew/::isStatusModified to be interpreted.
 */


// Information about file for local, base and other commit that caused the conflict


// Information about the output file
function getPrimaryWatchmanSubscriptionRefinements() {
  let refinements = [];
  try {
    // $FlowFB
    refinements = require('./fb/config').primaryWatchSubscriptionRefinements;
  } catch (e) {
    // purposely blank
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

class HgService {
  // used to limit lifespan of other observables

  constructor(workingDirectory) {
    this._workingDirectory = workingDirectory;
    this._filesDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._hgActiveBookmarkDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._lockFilesDidChange = _rxjsBundlesRxMinJs.Observable.empty();
    this._hgBookmarksDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._hgRepoStateDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._hgConflictStateDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._hgRepoCommitsDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._hgOperationProgressDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._isInConflict = false;
    this._debouncedCheckConflictChange = (0, (_debounce || _load_debounce()).default)(() => {
      this._checkConflictChange();
    }, CHECK_CONFLICT_DELAY_MS);
    this._disposeObserver = new _rxjsBundlesRxMinJs.ReplaySubject();
    this._watchmanSubscriptionPromise = this._subscribeToWatchman();
  }

  waitForWatchmanSubscriptions() {
    return this._watchmanSubscriptionPromise;
  }

  dispose() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._disposeObserver.next();
      _this._disposeObserver.complete();
      _this._filesDidChangeObserver.complete();
      _this._hgRepoStateDidChangeObserver.complete();
      _this._hgActiveBookmarkDidChangeObserver.complete();
      _this._hgBookmarksDidChangeObserver.complete();
      _this._hgConflictStateDidChangeObserver.complete();
      if (_this._hgStoreDirWatcher != null) {
        _this._hgStoreDirWatcher.close();
        _this._hgStoreDirWatcher = null;
      }
      yield _this._cleanUpWatchman();
    })();
  }

  // Wrapper to help mocking during tests.
  _hgAsyncExecute(args, options) {
    return (0, (_hgUtils || _load_hgUtils()).hgAsyncExecute)(args, options);
  }

  _hgObserveExecution(args, options) {
    // TODO(T17463635)
    return (0, (_hgUtils || _load_hgUtils()).hgObserveExecution)(args, options);
  }

  _hgRunCommand(args, options) {
    return (0, (_hgUtils || _load_hgUtils()).hgRunCommand)(args, options);
  }

  /**
   * Section: File and Repository Status
   */

  /**
   * Shells out of the `hg status` to get the statuses of the paths.
   */
  fetchStatuses(toRevision) {
    const execOptions = {
      cwd: this._workingDirectory
    };
    const args = ['status', '-Tjson'];
    if (toRevision != null) {
      args.push('--rev', toRevision);
    }

    return (0, (_hgUtils || _load_hgUtils()).hgRunCommand)(args, execOptions).map(stdout => {
      const statusMap = new Map();
      const statuses = JSON.parse(stdout);
      for (const status of statuses) {
        statusMap.set((_nuclideUri || _load_nuclideUri()).default.join(this._workingDirectory, status.path), status.status);
      }
      return statusMap;
    }).publish();
  }

  /**
   * Like fetchStatuses, but first calculates the root of the current
   * stack and fetches changes since that revision.
   */
  fetchStackStatuses() {
    // Note: an alternative which doesn't depend upon reading .arcconfig in getForkBaseName is:
    //   return this.fetchStatuses('ancestor(ancestor((not public()) and (:: .))^ or .)')
    // Both the code below and the alternative above have identical performance.

    return _rxjsBundlesRxMinJs.Observable.fromPromise(getForkBaseName(this._workingDirectory)) // e.g. "master"
    .switchMap(forkBaseName => {
      const root = (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForCommonAncestor)(forkBaseName); // e.g. "ancestor(master, .)"
      return this.fetchStatuses(root).refCount();
    }).publish();
  }

  /**
   * Like fetchStatuses, but first checks whether the head is public. If so, returns
   * changes *since* the head. If not, returns changes *including* the head.
   */
  fetchHeadStatuses() {
    return this.fetchStatuses('ancestor(. or (. and (not public()))^)');
  }

  getAdditionalLogFiles(deadline) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const options = { cwd: _this2._workingDirectory };
      const base = yield (0, (_promise || _load_promise()).timeoutAfterDeadline)(deadline, getForkBaseName(_this2._workingDirectory)); // e.g. master
      const root = (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForCommonAncestor)(base); // ancestor(master, .)

      // The ID of the root
      const getId = (() => {
        var _ref3 = (0, _asyncToGenerator.default)(function* () {
          try {
            const args = ['id', '--rev', root];
            const output = yield _this2._hgAsyncExecute(args, options);
            return output.stdout ? output.stdout.trim() : '<id unknown>';
          } catch (e) {
            return `<id error: ${e.stderr}`;
          }
        });

        return function getId() {
          return _ref3.apply(this, arguments);
        };
      })();

      // Diff from base to current working directory
      const getDiff = (() => {
        var _ref4 = (0, _asyncToGenerator.default)(function* () {
          try {
            const args = ['diff', '--unified', '0', '-r', root];
            const output = yield _this2._hgAsyncExecute(args, options);
            return output.stdout ? output.stdout.trim() : '<diff unknown>';
          } catch (e) {
            return `<diff error: ${e.stderr}>`;
          }
        });

        return function getDiff() {
          return _ref4.apply(this, arguments);
        };
      })();

      // Summary of changes from base to current working directory
      const getStatus = (() => {
        var _ref5 = (0, _asyncToGenerator.default)(function* () {
          const statuses = yield _this2.fetchStatuses(root).refCount().toPromise();
          let result = '';
          for (const [filepath, status] of statuses) {
            result += `${status} ${filepath}\n`;
          }
          return result;
        });

        return function getStatus() {
          return _ref5.apply(this, arguments);
        };
      })();

      const [id, diff, status] = yield Promise.all([(0, (_promise || _load_promise()).timeoutAfterDeadline)(deadline, getId()).catch(function (e) {
        return `id ${e.message}\n${e.stack}`;
      }), (0, (_promise || _load_promise()).timeoutAfterDeadline)(deadline, getDiff()).catch(function (e) {
        return 'diff ' + (0, (_string || _load_string()).stringifyError)(e);
      }), (0, (_promise || _load_promise()).timeoutAfterDeadline)(deadline, getStatus()).catch(function (e) {
        return 'status ' + (0, (_string || _load_string()).stringifyError)(e);
      })]);

      const results = [];

      // If the user is on a public revision, there's no need to provide hgdiff.
      results.push({
        title: `${_this2._workingDirectory}:hg`,
        data: `hg update -r ${id}\n` + (status === '' ? '' : 'hg import --no-commit hgdiff\n') + `\n${status}`
      });
      if (status !== '') {
        results.push({
          title: `${_this2._workingDirectory}:hgdiff`,
          data: diff
        });
      }

      return results;
    })();
  }

  _subscribeToWatchman() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Using a local variable here to allow better type refinement.
      const watchmanClient = new (_nuclideWatchmanHelpers || _load_nuclideWatchmanHelpers()).WatchmanClient();
      _this3._watchmanClient = watchmanClient;
      const workingDirectory = _this3._workingDirectory;

      let primarySubscriptionExpression = ['allof', ['not', ['dirname', '.hg']],
      // Hg appears to modify temporary files that begin with these
      // prefixes, every time a file is saved.
      ['not', ['match', 'hg-checkexec-*', 'wholename']], ['not', ['match', 'hg-checklink-*', 'wholename']],
      // This watchman subscription is used to determine when and which
      // files to fetch new statuses for. There is no reason to include
      // directories in these updates, and in fact they may make us overfetch
      // statuses. (See diff summary of D2021498.)
      // This line restricts this subscription to only return files.
      ['type', 'f']];
      primarySubscriptionExpression = primarySubscriptionExpression.concat(getPrimaryWatchmanSubscriptionRefinements());

      // Subscribe to changes to files unrelated to source control.
      const primarySubscriptionPromise = watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_PRIMARY, {
        fields: ['name', 'exists', 'new'],
        expression: primarySubscriptionExpression,
        defer: ['hg.update'],
        empty_on_fresh_instance: true
      });
      logWhenSubscriptionEstablished(primarySubscriptionPromise, WATCHMAN_SUBSCRIPTION_NAME_PRIMARY);

      // Subscribe to changes to files unrelated to source control.
      const conflictStateSubscriptionPromise = watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_CONFLICTS, {
        fields: ['name', 'exists', 'new'],
        expression: ['name', '.hg/merge', 'wholename'],
        defer: ['hg.update'],
        empty_on_fresh_instance: true
      });
      logWhenSubscriptionEstablished(conflictStateSubscriptionPromise, WATCHMAN_SUBSCRIPTION_NAME_CONFLICTS);

      // Subscribe to changes to the active Mercurial bookmark.
      const hgActiveBookmarkSubscriptionPromise = watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK, {
        fields: ['name', 'exists'],
        expression: ['name', '.hg/bookmarks.current', 'wholename'],
        defer: ['hg.update'],
        empty_on_fresh_instance: true
      });
      logWhenSubscriptionEstablished(hgActiveBookmarkSubscriptionPromise, WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK);

      // Subscribe to changes in Mercurial bookmarks.
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

      _this3._lockFilesDidChange = (0, (_watchFileCreationAndDeletion || _load_watchFileCreationAndDeletion()).subscribeToFilesCreateAndDelete)(watchmanClient, workingDirectory, (_hgConstants || _load_hgConstants()).LockFilesList, WATCHMAN_SUBSCRIPTION_NAME_LOCK_FILES).publish().refCount();

      // Those files' changes indicate a commit-changing action has been applied to the repository,
      // Watchman currently (v4.7) ignores `.hg/store` file updates.
      // Hence, we here use node's filesystem watchers instead.
      const hgStoreDirectory = (_nuclideUri || _load_nuclideUri()).default.join(workingDirectory, '.hg', 'store');
      const commitChangeIndicators = ['00changelog.i', 'obsstore', 'inhibit'];
      try {
        _this3._hgStoreDirWatcher = _fs.default.watch(hgStoreDirectory, function (event, fileName) {
          if (commitChangeIndicators.indexOf(fileName) === -1) {
            _this3._commitsDidChange();
          }
        });
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').debug('Node watcher created for .hg/store.');
      } catch (error) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error('Error when creating node watcher for hg store', error);
      }

      const [primarySubscription, hgActiveBookmarkSubscription, hgBookmarksSubscription, dirStateSubscription, conflictStateSubscription, progressSubscription] = yield Promise.all([primarySubscriptionPromise, hgActiveBookmarkSubscriptionPromise, hgBookmarksSubscriptionPromise, dirStateSubscriptionPromise, conflictStateSubscriptionPromise, progressSubscriptionPromise]);

      primarySubscription.on('change', _this3._filesDidChange.bind(_this3));
      hgActiveBookmarkSubscription.on('change', _this3._hgActiveBookmarkDidChange.bind(_this3));
      hgBookmarksSubscription.on('change', _this3._hgBookmarksDidChange.bind(_this3));
      dirStateSubscription.on('change', _this3._emitHgRepoStateChanged.bind(_this3));
      conflictStateSubscription.on('change', _this3._debouncedCheckConflictChange);
      progressSubscription.on('change', _this3._hgOperationProgressDidChange.bind(_this3));
    })();
  }

  _cleanUpWatchman() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this4._watchmanClient != null) {
        yield _this4._watchmanClient.dispose();
        _this4._watchmanClient = null;
      }
    })();
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
    const changedFiles = fileChanges.map(change => (_nuclideUri || _load_nuclideUri()).default.join(workingDirectory, change.name));
    this._filesDidChangeObserver.next(changedFiles);
  }

  _commitsDidChange() {
    this._hgRepoCommitsDidChangeObserver.next();
  }

  _checkMergeDirectoryExists() {
    return (_fsPromise || _load_fsPromise()).default.exists((_nuclideUri || _load_nuclideUri()).default.join(this._workingDirectory, '.hg', 'merge'));
  }

  _checkConflictChange() {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const mergeDirectoryExists = yield _this5._checkMergeDirectoryExists();
      if (_this5._isInConflict) {
        if (!mergeDirectoryExists) {
          _this5._isInConflict = false;
          _this5._hgConflictStateDidChangeObserver.next(false);
        }
        return;
      } else if (mergeDirectoryExists) {
        // Detect if the repository is in a conflict state.
        const mergeConflicts = yield _this5._fetchMergeConflicts();
        if (mergeConflicts != null) {
          _this5._isInConflict = true;
          _this5._hgConflictStateDidChangeObserver.next(true);
        }
      }
    })();
  }

  _fetchMergeConflicts() {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this6.fetchMergeConflicts().refCount().toPromise();
    })();
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
    return this._hgRepoCommitsDidChangeObserver
    // Upon rebase, this can fire once per added commit!
    // Apply a generous debounce to avoid overloading the RPC connection.
    .let((0, (_observable || _load_observable()).fastDebounce)(COMMIT_CHANGE_DEBOUNCE_MS)).publish();
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
    return this._hgOperationProgressDidChangeObserver.switchMap(() => _rxjsBundlesRxMinJs.Observable.fromPromise((_fsPromise || _load_fsPromise()).default.readFile((_nuclideUri || _load_nuclideUri()).default.join(this._workingDirectory, '.hg', 'progress'), 'utf8')).catch(() => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error('.hg/progress changed but could not be read');
      return _rxjsBundlesRxMinJs.Observable.empty();
    }).filter(content => content.length > 0).map(content => JSON.parse(content)).catch(() => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error('.hg/progress changed but its contents could not be parsed as JSON');
      return _rxjsBundlesRxMinJs.Observable.empty();
    })).publish();
  }

  /**
   * Shells out to `hg diff` to retrieve line diff information for the paths.
   * @param An Array of NuclideUri (absolute paths) for which to fetch diff info.
   * @return A map of each NuclideUri (absolute path) to its DiffInfo.
   *   Each path is presumed to be in the repo.
   *   If the `hg diff` call fails, this method returns null.
   *   If a path has no changes, it will not appear in the returned Map.
   */
  fetchDiffInfo(filePaths) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // '--unified 0' gives us 0 lines of context around each change (we don't
      // care about the context).
      // '--noprefix' omits the a/ and b/ prefixes from filenames.
      // '--nodates' avoids appending dates to the file path line.
      const args = ['diff', '--unified', '0', '--noprefix', '--nodates'].concat(filePaths);
      const options = {
        cwd: _this7._workingDirectory
      };
      let output;
      try {
        output = yield _this7._hgAsyncExecute(args, options);
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error(`Error when running hg diff for paths: ${filePaths.toString()} \n\tError: ${e.stderr}`);
        return null;
      }
      const pathToDiffInfo = (0, (_hgDiffOutputParser || _load_hgDiffOutputParser()).parseMultiFileHgDiffUnifiedOutput)(output.stdout);
      const absolutePathToDiffInfo = new Map();
      for (const [filePath, diffInfo] of pathToDiffInfo) {
        absolutePathToDiffInfo.set((_nuclideUri || _load_nuclideUri()).default.join(_this7._workingDirectory, filePath), diffInfo);
      }
      return absolutePathToDiffInfo;
    })();
  }

  /**
   * Section: Bookmarks
   */

  createBookmark(name, revision) {
    const args = [];
    // flowlint-next-line sketchy-null-string:off
    if (revision) {
      args.push('--rev', revision);
    }
    args.push(name);

    return this._runSimpleInWorkingDirectory('bookmark', args);
  }

  deleteBookmark(name) {
    return this._runSimpleInWorkingDirectory('bookmarks', ['--delete', name]);
  }

  renameBookmark(name, nextName) {
    return this._runSimpleInWorkingDirectory('bookmarks', ['--rename', name, nextName]);
  }

  /**
   * @return The name of the current bookmark.
   */
  fetchActiveBookmark() {
    return (0, (_hgBookmarkHelpers || _load_hgBookmarkHelpers()).fetchActiveBookmark)((_nuclideUri || _load_nuclideUri()).default.join(this._workingDirectory, '.hg'));
  }

  /**
   * @return An Array of bookmarks for this repository.
   */
  fetchBookmarks() {
    return (0, (_hgBookmarkHelpers || _load_hgBookmarkHelpers()).fetchBookmarks)((_nuclideUri || _load_nuclideUri()).default.join(this._workingDirectory, '.hg'));
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

  /**
   * Section: Repository State at Specific Revisions
   */

  /**
   * @param filePath: The full path to the file of interest.
   * @param revision: An expression that hg can understand, specifying the
   * revision at which we want to see the file content.
   */
  fetchFileContentAtRevision(filePath, revision) {
    return (0, (_hgRevisionStateHelpers || _load_hgRevisionStateHelpers()).fetchFileContentAtRevision)(filePath, revision, this._workingDirectory);
  }

  fetchFilesChangedAtRevision(revision) {
    return (0, (_hgRevisionStateHelpers || _load_hgRevisionStateHelpers()).fetchFilesChangedAtRevision)(revision, this._workingDirectory);
  }

  /**
   * Fetch the revision details between the current head and the the common ancestor
   * of head and master in the repository.
   * @return an array with the revision info (`title`, `author`, `date` and `id`)
   * or `null` if no common ancestor was found.
   */
  fetchRevisionInfoBetweenHeadAndBase() {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const forkBaseName = yield getForkBaseName(_this8._workingDirectory);
      const revisionsInfo = yield (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).fetchRevisionInfoBetweenRevisions)((0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForCommonAncestor)(forkBaseName), (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForRevisionsBeforeHead)(0), _this8._workingDirectory);
      return revisionsInfo;
    })();
  }

  fetchSmartlogRevisions() {
    return (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).fetchSmartlogRevisions)(this._workingDirectory);
  }

  /**
   * Resolve the revision details of the base branch
   */
  getBaseRevision() {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const forkBaseName = yield getForkBaseName(_this9._workingDirectory);
      return (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).fetchRevisionInfo)((0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForCommonAncestor)(forkBaseName), _this9._workingDirectory);
    })();
  }

  /**
   * Gets the blame for the filePath at the current revision.
   * It returns null for uncommitted changes (but cannot detect unsaved changes)
   * @param filePath The file to get blame information for.
   * @return An Array that maps a line number (0-indexed) to the revision info.
   */
  getBlameAtHead(filePath) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let revisionsByLine;
      try {
        revisionsByLine = (yield _this10._hgAsyncExecute(['blame', '-c', // Query the hash
        '-T', '{lines % "{node|short}\n"}', // Just display the hash per line
        '-r', 'wdir()', // Blank out uncommitted changes
        filePath], { cwd: _this10._workingDirectory })).stdout.split('\n');
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error(`LocalHgServiceBase failed to fetch blame for file: ${filePath}. Error: ${e.stderr}`);
        throw e;
      }

      const uniqueRevisions = [...new Set(revisionsByLine.filter(function (e) {
        return e;
      }))];

      let revisionsArray;
      try {
        revisionsArray = yield (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).fetchRevisionsInfo)(uniqueRevisions.join('+'), _this10._workingDirectory, { hidden: true, shouldLimit: false }).toPromise();
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error(`LocalHgServiceBase failed to fetch blame for file: ${filePath}. Error: ${e.stderr}`);
        throw e;
      }

      const revisionsByHash = {};
      revisionsArray.forEach(function (revision) {
        revisionsByHash[revision.hash] = revision;
      });

      return revisionsByLine.map(function (hash) {
        return revisionsByHash[hash];
      });
    })();
  }

  /**
   * Returns the value of the config item at `key`.
   * @param key Name of config item
   */
  getConfigValueAsync(key) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['config', key];
      const execOptions = {
        cwd: _this11._workingDirectory
      };
      try {
        return (yield _this11._hgAsyncExecute(args, execOptions)).stdout.trim();
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error(`Failed to fetch Hg config for key ${key}.  Error: ${e.toString()}`);
        return null;
      }
    })();
  }

  /**
   * Gets the Differential Revision id (aka DXXXXXX) id for the specified changeSetId, if it exists.
   * Otherwise, returns null.
   * This implementation relies on the "phabdiff" template being available as defined in:
   * https://bitbucket.org/facebook/hg-experimental/src/fbf23b3f96bade5986121a7c57d7400585d75f54/phabdiff.py.
   */
  getDifferentialRevisionForChangeSetId(changeSetId) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['log', '-T', '{phabdiff}\n', '--limit', '1', '--rev', changeSetId];
      const execOptions = {
        cwd: _this12._workingDirectory
      };
      try {
        const output = yield _this12._hgAsyncExecute(args, execOptions);
        const stdout = output.stdout.trim();
        return stdout ? stdout : null;
      } catch (e) {
        // This should not happen: `hg log` does not error even if it does not recognize the template.
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error(`Failed when trying to get differential revision for: ${changeSetId}`);
        return null;
      }
    })();
  }

  /**
   * Get the output of the experimental smartlog extension from Mercurial:
   * https://bitbucket.org/facebook/hg-experimental/#markdown-header-smartlog.
   * @param ttyOutput If true, return the output as if stdout were attached to a tty.
   * @param concise true to run `hg smartlog`; false to run `hg ssl`.
   * @return The output from running the command.
   */
  getSmartlog(ttyOutput, concise) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // disable the pager extension so that 'hg ssl' terminates. We can't just use
      // HGPLAIN because we have not found a way to get colored output when we do.
      const args = ['--config', 'extensions.pager=!', concise ? 'ssl' : 'smartlog'];
      const execOptions = {
        cwd: _this13._workingDirectory,
        NO_HGPLAIN: concise, // `hg ssl` is likely user-defined.
        TTY_OUTPUT: ttyOutput
      };
      return _this13._hgAsyncExecute(args, execOptions);
    })();
  }

  _commitCode(message, args) {
    // TODO(T17463635)
    let editMergeConfigs;
    return _rxjsBundlesRxMinJs.Observable.fromPromise((0, _asyncToGenerator.default)(function* () {
      if (message == null) {
        return args;
      } else {
        return [...args, '-m', (0, (_hgUtils || _load_hgUtils()).formatCommitMessage)(message)];
      }
    })()).switchMap(argumentsWithCommitFile => {
      const execArgs = argumentsWithCommitFile;
      const execOptions = {
        cwd: this._workingDirectory
      };
      if (editMergeConfigs != null) {
        execArgs.push(...editMergeConfigs.args);
        execOptions.HGEDITOR = editMergeConfigs.hgEditor;
      }
      return this._hgObserveExecution(execArgs, execOptions);
    });
  }

  /**
   * Commit code to version control.
   * @param message Commit message.
   * @param filePaths List of changed files to commit. If empty, all will be committed
   */
  commit(message, filePaths = []) {
    // TODO(T17463635)
    return this._commitCode(message, ['commit', ...filePaths]).publish();
  }

  /*
   * Edit commit message associated with a revision
   * @param revision Hash of the revision to be updated
   * @param message New commit message
   * @return Process update message while running metaedit
   */
  editCommitMessage(revision, message) {
    const args = ['metaedit', '-r', revision, '-m', message];
    const execOptions = {
      cwd: this._workingDirectory
    };
    return this._hgObserveExecution(args, execOptions).publish();
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
  amend(message, amendMode, filePaths = []) {
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
    return this._commitCode(message, args).publish();
  }

  restack() {
    const args = ['rebase', '--restack'];
    const execOptions = {
      cwd: this._workingDirectory
    };
    return this._hgObserveExecution(args, execOptions).publish();
  }

  splitRevision() {
    // TODO(T17463635)
    let editMergeConfigs;
    return _rxjsBundlesRxMinJs.Observable.fromPromise((0, _asyncToGenerator.default)(function* () {
      editMergeConfigs = yield (0, (_hgUtils || _load_hgUtils()).getInteractiveCommitEditorConfig)();
    })()).switchMap(() => {
      if (!(editMergeConfigs != null)) {
        throw new Error('editMergeConfigs cannot be null');
      }

      const execOptions = {
        cwd: this._workingDirectory,
        HGEDITOR: editMergeConfigs.hgEditor
      };
      return this._hgObserveExecution([...editMergeConfigs.args, 'split'], execOptions);
    }).publish();
  }

  revert(filePaths, toRevision) {
    const args = [...filePaths];
    if (toRevision != null) {
      args.push('--rev', toRevision);
    }
    return this._runSimpleInWorkingDirectory('revert', args);
  }

  _runSimpleInWorkingDirectory(action, args) {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const options = {
        cwd: _this14._workingDirectory
      };
      const cmd = [action].concat(args);
      try {
        yield _this14._hgAsyncExecute(cmd, options);
      } catch (e) {
        const errorString = e.stderr || e.message || e.toString();
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error('hg %s failed with [%s] arguments: %s', action, args.toString(), errorString);
        throw new Error(errorString);
      }
    })();
  }

  /**
   * @param revision This could be a changeset ID, name of a bookmark, revision number, etc.
   * @param create Currently, this parameter is ignored.
   * @param options.
   */
  checkout(revision, create, options) {
    // TODO(T17463635)
    const args = ['checkout', revision];
    if (options && options.clean) {
      args.push('--clean');
    }
    const executionOptions = {
      cwd: this._workingDirectory
    };
    return (0, (_hgUtils || _load_hgUtils()).hgObserveExecution)(args, executionOptions).switchMap((_hgUtils || _load_hgUtils()).processExitCodeAndThrow).publish();
  }

  show(revision) {
    const args = ['show', `${revision}`, '-Tjson'];
    const execOptions = {
      cwd: this._workingDirectory
    };
    return (0, (_hgUtils || _load_hgUtils()).hgRunCommand)(args, execOptions).map(stdout => {
      return JSON.parse(stdout)[0];
    }).publish();
  }

  diff(revision, unified, diffCommitted, noPrefix, noDates) {
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
      cwd: this._workingDirectory
    };
    return (0, (_hgUtils || _load_hgUtils()).hgRunCommand)(args, execOptions).publish();
  }

  /**
   * Removes files not tracked by Mercurial.
   */
  purge() {
    return this._runSimpleInWorkingDirectory('purge', []);
  }

  /**
   * Undoes the effect of a local commit, specifically the working directory parent.
   */
  uncommit() {
    return this._runSimpleInWorkingDirectory('uncommit', []);
  }

  /**
   * @param revision This could be a changeset ID, name of a bookmark, revision number, etc.
   */
  strip(revision) {
    return this._runSimpleInWorkingDirectory('strip', [revision]);
  }

  /**
   * @param revision This could be a changeset ID, name of a bookmark, revision number, etc.
   * @param create Currently, this parameter is ignored.
   */
  checkoutForkBase() {
    var _this15 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const forkBaseName = yield getForkBaseName(_this15._workingDirectory);
      yield _this15._runSimpleInWorkingDirectory('checkout', [forkBaseName]);
    })();
  }

  /*
   * Silence errors from hg calls that don't include any tracked files - these
   * are generally harmless and should not create an error notification.
   * This checks the error string in order to avoid potentially slow hg pre-checks.
   */
  _rethrowErrorIfHelpful(e) {
    if (!IGNORABLE_ERROR_SUFFIXES.some(s => e.message.endsWith(s + '\n'))) {
      throw e;
    }
  }

  /**
   * Rename/move files versioned under Hg.
   * @param filePaths Which files should be renamed/moved.
   * @param destPath What should the file be renamed/moved to.
   */
  rename(filePaths, destPath, after) {
    var _this16 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = [...filePaths.map(function (p) {
        return (_nuclideUri || _load_nuclideUri()).default.getPath(p);
      }), // Sources
      (_nuclideUri || _load_nuclideUri()).default.getPath(destPath)];
      if (after) {
        args.unshift('--after');
      }
      try {
        yield _this16._runSimpleInWorkingDirectory('rename', args);
      } catch (e) {
        if (after) {
          _this16._rethrowErrorIfHelpful(e);
        } else {
          throw e;
        }
      }
    })();
  }

  /**
   * Remove a file versioned under Hg.
   * @param filePath Which file should be removed.
   */
  remove(filePaths, after) {
    var _this17 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['-f', ...filePaths.map(function (p) {
        return (_nuclideUri || _load_nuclideUri()).default.getPath(p);
      })];
      if (after) {
        args.unshift('--after');
      }

      try {
        yield _this17._runSimpleInWorkingDirectory('remove', args);
      } catch (e) {
        if (after) {
          _this17._rethrowErrorIfHelpful(e);
        } else {
          throw e;
        }
      }
    })();
  }

  /**
   * Mark the specified files so they will no longer be tracked by hg after the next commit.
   * The file will remain in the working directory.
   * @param filePath Which file(s) should be forgotten.
   */
  forget(filePaths) {
    var _this18 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = [...filePaths.map(function (p) {
        return (_nuclideUri || _load_nuclideUri()).default.getPath(p);
      })];
      try {
        yield _this18._runSimpleInWorkingDirectory('forget', args);
      } catch (e) {
        throw e;
      }
    })();
  }

  /**
   * Version a new file under Hg.
   * @param filePath Which file should be versioned.
   */
  add(filePaths) {
    return this._runSimpleInWorkingDirectory('add', filePaths);
  }

  getTemplateCommitMessage() {
    var _this19 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['debugcommitmessage'];
      const execOptions = {
        cwd: _this19._workingDirectory
      };

      try {
        const { stdout } = yield _this19._hgAsyncExecute(args, execOptions);
        return stdout;
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error('Failed when trying to get template commit message');
        return null;
      }
    })();
  }

  getHeadCommitMessage() {
    var _this20 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['log', '-T', '{desc}\n', '--limit', '1', '--rev', (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForRevisionsBeforeHead)(0)];
      const execOptions = {
        cwd: _this20._workingDirectory
      };
      try {
        const output = yield _this20._hgAsyncExecute(args, execOptions);
        const stdout = output.stdout.trim();
        return stdout || null;
      } catch (e) {
        // This should not happen: `hg log` does not error even if it does not recognize the template.
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').error('Failed when trying to get head commit message');
        return null;
      }
    })();
  }

  log(filePaths, limit) {
    var _this21 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['log', '-Tjson'];
      if (limit != null && limit > 0) {
        args.push('--limit', String(limit));
      }
      for (const filePath of filePaths) {
        args.push(filePath);
      }

      const execOptions = {
        cwd: _this21._workingDirectory
      };
      const result = yield _this21._hgAsyncExecute(args, execOptions);
      const entries = JSON.parse(result.stdout);
      return { entries };
    })();
  }

  fetchMergeConflicts() {
    const args = ['resolve', '--tool=internal:dumpjson', '--all', '--config', 'extensions.conflictinfo='];
    const execOptions = {
      cwd: this._workingDirectory
    };
    return this._hgRunCommand(args, execOptions).map(data => {
      const parsedData = JSON.parse(data)[0];
      if (parsedData.command == null) {
        return null;
      }
      const conflicts = parsedData.conflicts.map(conflict => {
        const { local, other } = conflict;
        let status;
        conflict.output.path = resolvePathForPlatform(conflict.output.path);
        if (local.exists && other.exists) {
          status = (_hgConstants || _load_hgConstants()).MergeConflictStatus.BOTH_CHANGED;
        } else if (local.exists) {
          status = (_hgConstants || _load_hgConstants()).MergeConflictStatus.DELETED_IN_THEIRS;
        } else {
          status = (_hgConstants || _load_hgConstants()).MergeConflictStatus.DELETED_IN_OURS;
        }

        return Object.assign({}, conflict, {
          status
        });
      });
      return Object.assign({}, parsedData, {
        conflicts
      });
    })
    // `resolve --all` returns a non-zero exit code when there's no conflicts.
    .catch(() => _rxjsBundlesRxMinJs.Observable.of(null)).publish();
  }

  markConflictedFile(filePath, resolved) {
    // TODO(T17463635)
    // -m marks file as resolved, -u marks file as unresolved
    const fileStatus = resolved ? '-m' : '-u';
    const args = ['resolve', fileStatus, filePath];
    const execOptions = {
      cwd: this._workingDirectory
    };
    return this._hgObserveExecution(args, execOptions).switchMap((_hgUtils || _load_hgUtils()).processExitCodeAndThrow).publish();
  }

  continueOperation(args) {
    // TODO(T17463635)

    const execOptions = {
      cwd: this._workingDirectory
    };
    return this._hgObserveExecution(args, execOptions).switchMap((_hgUtils || _load_hgUtils()).processExitCodeAndThrow).publish();
  }

  abortOperation(commandWithOptions) {
    const execOptions = {
      cwd: this._workingDirectory
    };
    return (0, (_hgUtils || _load_hgUtils()).hgRunCommand)(commandWithOptions, execOptions).publish();
  }

  resolveAllFiles() {
    const args = ['resolve', '--all'];
    const execOptions = {
      cwd: this._workingDirectory
    };
    return this._hgObserveExecution(args, execOptions).switchMap((_hgUtils || _load_hgUtils()).processExitCodeAndThrow).publish();
  }

  rebase(destination, source) {
    // TODO(T17463635)

    const args = ['rebase', '-d', destination];
    if (source != null) {
      args.push('-s', source);
    }
    const execOptions = {
      cwd: this._workingDirectory
    };
    return this._hgObserveExecution(args, execOptions).publish();
  }

  /**
   *  Given a list of the new order of revisions, use histedit to rearrange
   *  history to match the input. Note that you must be checked out on the
   *  stack above where any reordering takes place, and there can be no
   *  branches off of any revision in the stack except the top one.
   */
  reorderWithinStack(orderedRevisions) {
    const args = ['histedit', '--commands', '-'];
    const commandsJson = JSON.stringify({
      histedit: orderedRevisions.map(hash => {
        return {
          node: hash,
          action: (_hgConstants || _load_hgConstants()).HisteditActions.PICK
        };
      })
    });

    const execOptions = {
      cwd: this._workingDirectory,
      input: commandsJson
    };
    return this._hgRunCommand(args, execOptions).publish();
  }

  pull(options) {
    // TODO(T17463635)
    const args = ['pull', ...options];
    const execOptions = {
      cwd: this._workingDirectory
    };

    return this._hgObserveExecution(args, execOptions).publish();
  }

  /**
   * Copy files versioned under Hg.
   * @param filePaths Which files should be copied.
   * @param destPath What should the new file be named to.
   */
  copy(filePaths, destPath, after) {
    var _this22 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = [...filePaths.map(function (p) {
        return (_nuclideUri || _load_nuclideUri()).default.getPath(p);
      }), // Sources
      (_nuclideUri || _load_nuclideUri()).default.getPath(destPath)];
      if (after) {
        args.unshift('--after');
      }
      try {
        yield _this22._runSimpleInWorkingDirectory('copy', args);
      } catch (e) {
        if (after) {
          _this22._rethrowErrorIfHelpful(e);
        } else {
          throw e;
        }
      }
    })();
  }

  /**
   * Gets the current head revision hash
   */
  getHeadId() {
    const args = ['log', '--template', '{node}', '--limit', '1'];
    const execOptions = {
      cwd: this._workingDirectory
    };
    return this._hgRunCommand(args, execOptions).publish();
  }

  /**
   * @param from This could be a changeset ID, name of a bookmark, revision number, etc.
   * @param to This could be a changeset ID, name of a bookmark, revision number, etc.
   * @param message New message for the resulting folded commit.
   */
  fold(from, to, message) {
    const args = ['fold', '--exact', `${from}::${to}`, '--message', message];

    const execOptions = {
      cwd: this._workingDirectory
    };

    return this._hgRunCommand(args, execOptions).publish();
  }
}
exports.HgService = HgService;