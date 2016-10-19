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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var getForkBaseName = _asyncToGenerator(function* (directoryPath) {
  var arcConfig = yield (0, (_nuclideArcanistRpc || _load_nuclideArcanistRpc()).readArcConfig)(directoryPath);
  if (arcConfig != null) {
    return arcConfig['arc.feature.start.default'] || arcConfig['arc.land.onto.default'] || DEFAULT_ARC_PROJECT_FORK_BASE;
  }
  return DEFAULT_FORK_BASE_NAME;
}

/**
 * @return Array of additional watch expressions to apply to the primary
 *   watchman subscription.
 */
);

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = require('../../nuclide-watchman-helpers');
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireDefault(require('fs'));
}

var _hgConstants;

function _load_hgConstants() {
  return _hgConstants = require('./hg-constants');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _hgBlameOutputParser;

function _load_hgBlameOutputParser() {
  return _hgBlameOutputParser = require('./hg-blame-output-parser');
}

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

var _commonsNodeFsPromise;

function _load_commonsNodeFsPromise() {
  return _commonsNodeFsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodeDebounce;

function _load_commonsNodeDebounce() {
  return _commonsNodeDebounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _hgBookmarkHelpers;

function _load_hgBookmarkHelpers() {
  return _hgBookmarkHelpers = require('./hg-bookmark-helpers');
}

var _nuclideArcanistRpc;

function _load_nuclideArcanistRpc() {
  return _nuclideArcanistRpc = require('../../nuclide-arcanist-rpc');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _rxjsBundlesRxMinJs2;

function _load_rxjsBundlesRxMinJs2() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();
var DEFAULT_ARC_PROJECT_FORK_BASE = 'remote/master';
var DEFAULT_FORK_BASE_NAME = 'default';

var WATCHMAN_SUBSCRIPTION_NAME_PRIMARY = 'hg-repository-watchman-subscription-primary';
var WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK = 'hg-repository-watchman-subscription-hgbookmark';
var WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARKS = 'hg-repository-watchman-subscription-hgbookmarks';
var WATCHMAN_HG_DIR_STATE = 'hg-repository-watchman-subscription-dirstate';
var WATCHMAN_SUBSCRIPTION_NAME_CONFLICTS = 'hg-repository-watchman-subscription-conflicts';

var CHECK_CONFLICT_DELAY_MS = 2000;

// If Watchman reports that many files have changed, it's not really useful to report this.
// This is typically caused by a large rebase or a Watchman re-crawl.
// We'll just report that the repository state changed, which should trigger a full client refresh.
var FILES_CHANGED_LIMIT = 1000;

// Suffixes of hg error messages that indicate that an error is safe to ignore,
// and should not warrant a user-visible error. These generally happen
// when performing an hg operation on a non-existent or untracked file.
var IGNORABLE_ERROR_SUFFIXES = ['abort: no files to copy', 'No such file or directory', 'does not exist!'];

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
function getPrimaryWatchmanSubscriptionRefinements() {
  var refinements = [];
  try {
    // $FlowFB
    refinements = require('./fb/config').primaryWatchSubscriptionRefinements;
  } catch (e) {
    // purposely blank
  }
  return refinements;
}

var HgService = (function () {
  function HgService(workingDirectory) {
    var _this = this;

    _classCallCheck(this, HgService);

    this._workingDirectory = workingDirectory;
    this._filesDidChangeObserver = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._hgActiveBookmarkDidChangeObserver = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._hgBookmarksDidChangeObserver = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._hgRepoStateDidChangeObserver = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._hgConflictStateDidChangeObserver = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._hgRepoCommitsDidChangeObserver = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._isInConflict = false;
    this._debouncedCheckConflictChange = (0, (_commonsNodeDebounce || _load_commonsNodeDebounce()).default)(function () {
      _this._checkConflictChange();
    }, CHECK_CONFLICT_DELAY_MS);
    this._watchmanSubscriptionPromise = this._subscribeToWatchman();
  }

  _createClass(HgService, [{
    key: 'waitForWatchmanSubscriptions',
    value: function waitForWatchmanSubscriptions() {
      return this._watchmanSubscriptionPromise;
    }
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      this._filesDidChangeObserver.complete();
      this._hgRepoStateDidChangeObserver.complete();
      this._hgActiveBookmarkDidChangeObserver.complete();
      this._hgBookmarksDidChangeObserver.complete();
      this._hgConflictStateDidChangeObserver.complete();
      if (this._hgStoreDirWatcher != null) {
        this._hgStoreDirWatcher.close();
        this._hgStoreDirWatcher = null;
      }
      yield this._cleanUpWatchman();
    })

    // Wrapper to help mocking during tests.
  }, {
    key: '_hgAsyncExecute',
    value: function _hgAsyncExecute(args, options) {
      return (0, (_hgUtils || _load_hgUtils()).hgAsyncExecute)(args, options);
    }
  }, {
    key: '_hgObserveExecution',
    value: function _hgObserveExecution(args, options) {
      return (0, (_hgUtils || _load_hgUtils()).hgObserveExecution)(args, options);
    }

    /**
     * Section: File and Repository Status
     */

    /**
     * Shells out of the `hg status` to get the statuses of the paths.
     */
  }, {
    key: 'fetchStatuses',
    value: function fetchStatuses() {
      var _this2 = this;

      var execOptions = {
        cwd: this._workingDirectory
      };
      var args = ['status', '-Tjson'];

      return (0, (_hgUtils || _load_hgUtils()).hgRunCommand)(args, execOptions).map(function (stdout) {
        var statusMap = new Map();
        var statuses = JSON.parse(stdout);
        for (var _status of statuses) {
          statusMap.set((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(_this2._workingDirectory, _status.path), _status.status);
        }
        return statusMap;
      }).publish();
    }
  }, {
    key: '_subscribeToWatchman',
    value: _asyncToGenerator(function* () {
      var _this3 = this;

      // Using a local variable here to allow better type refinement.
      var watchmanClient = new (_nuclideWatchmanHelpers || _load_nuclideWatchmanHelpers()).WatchmanClient();
      this._watchmanClient = watchmanClient;
      var workingDirectory = this._workingDirectory;

      var primarySubscriptionExpression = ['allof', ['not', ['dirname', '.hg']],
      // Hg appears to modify temporary files that begin with these
      // prefixes, every time a file is saved.
      // TODO (t7832809) Remove this when it is unnecessary.
      ['not', ['match', 'hg-checkexec-*', 'wholename']], ['not', ['match', 'hg-checklink-*', 'wholename']],
      // This watchman subscription is used to determine when and which
      // files to fetch new statuses for. There is no reason to include
      // directories in these updates, and in fact they may make us overfetch
      // statuses. (See diff summary of D2021498.)
      // This line restricts this subscription to only return files.
      ['type', 'f']];
      primarySubscriptionExpression = primarySubscriptionExpression.concat(getPrimaryWatchmanSubscriptionRefinements());

      // Subscribe to changes to files unrelated to source control.
      var primarySubscribtion = yield watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_PRIMARY, {
        fields: ['name', 'exists', 'new'],
        expression: primarySubscriptionExpression,
        defer: ['hg.update']
      });
      logger.debug('Watchman subscription ' + WATCHMAN_SUBSCRIPTION_NAME_PRIMARY + ' established.');

      // Subscribe to changes to files unrelated to source control.
      var conflictStateSubscribtion = yield watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_CONFLICTS, {
        fields: ['name', 'exists', 'new'],
        expression: ['name', '.hg/merge', 'wholename'],
        defer: ['hg.update']
      });
      logger.debug('Watchman subscription ' + WATCHMAN_SUBSCRIPTION_NAME_CONFLICTS + ' established.');

      // Subscribe to changes to the active Mercurial bookmark.
      var hgActiveBookmarkSubscription = yield watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK, {
        fields: ['name', 'exists'],
        expression: ['name', '.hg/bookmarks.current', 'wholename'],
        defer: ['hg.update']
      });
      logger.debug('Watchman subscription ' + WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK + ' established.');

      // Subscribe to changes in Mercurial bookmarks.
      var hgBookmarksSubscription = yield watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARKS, {
        fields: ['name', 'exists'],
        expression: ['name', '.hg/bookmarks', 'wholename'],
        defer: ['hg.update']
      });
      logger.debug('Watchman subscription ' + WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARKS + ' established.');

      var dirStateSubscribtion = yield watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_HG_DIR_STATE, {
        fields: ['name'],
        expression: ['name', '.hg/dirstate', 'wholename'],
        defer: ['hg.update']
      });
      logger.debug('Watchman subscription ' + WATCHMAN_HG_DIR_STATE + ' established.');

      // Those files' changes indicate a commit-changing action has been applied to the repository,
      // Watchman currently (v4.7) ignores `.hg/store` file updates.
      // Hence, we here use node's filesystem watchers instead.
      var hgStoreDirectory = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(workingDirectory, '.hg', 'store');
      var commitChangeIndicators = ['00changelog.i', 'obsstore', 'inhibit'];
      try {
        this._hgStoreDirWatcher = (_fs || _load_fs()).default.watch(hgStoreDirectory, function (event, fileName) {
          if (commitChangeIndicators.indexOf(fileName) === -1) {
            _this3._commitsDidChange();
          }
        });
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().debug('Node watcher created for .hg/store.');
      } catch (error) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Error when creating node watcher for hg store', error);
      }

      primarySubscribtion.on('change', this._filesDidChange.bind(this));
      hgActiveBookmarkSubscription.on('change', this._hgActiveBookmarkDidChange.bind(this));
      hgBookmarksSubscription.on('change', this._hgBookmarksDidChange.bind(this));
      dirStateSubscribtion.on('change', this._emitHgRepoStateChanged.bind(this));
      conflictStateSubscribtion.on('change', this._debouncedCheckConflictChange);
    })
  }, {
    key: '_cleanUpWatchman',
    value: _asyncToGenerator(function* () {
      if (this._watchmanClient != null) {
        yield this._watchmanClient.dispose();
        this._watchmanClient = null;
      }
    })

    /**
     * @param fileChanges The latest changed watchman files.
     */
  }, {
    key: '_filesDidChange',
    value: function _filesDidChange(fileChanges) {
      if (fileChanges.length > FILES_CHANGED_LIMIT) {
        this._emitHgRepoStateChanged();
        return;
      }

      var workingDirectory = this._workingDirectory;
      var changedFiles = fileChanges.map(function (change) {
        return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(workingDirectory, change.name);
      });
      this._filesDidChangeObserver.next(changedFiles);
    }
  }, {
    key: '_commitsDidChange',
    value: function _commitsDidChange() {
      this._hgRepoCommitsDidChangeObserver.next();
    }
  }, {
    key: '_checkMergeDirectoryExists',
    value: function _checkMergeDirectoryExists() {
      return (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.exists((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(this._workingDirectory, '.hg', 'merge'));
    }
  }, {
    key: '_checkConflictChange',
    value: _asyncToGenerator(function* () {
      var mergeDirectoryExists = yield this._checkMergeDirectoryExists();
      if (this._isInConflict) {
        if (!mergeDirectoryExists) {
          this._isInConflict = false;
          this._hgConflictStateDidChangeObserver.next(false);
        }
        return;
      } else if (mergeDirectoryExists) {
        // Detect if the repository is in a conflict state.
        var mergeConflicts = yield this.fetchMergeConflicts();
        if (mergeConflicts.length > 0) {
          this._isInConflict = true;
          this._hgConflictStateDidChangeObserver.next(true);
        }
      }
    })
  }, {
    key: '_emitHgRepoStateChanged',
    value: function _emitHgRepoStateChanged() {
      this._hgRepoStateDidChangeObserver.next();
    }
  }, {
    key: '_hgActiveBookmarkDidChange',
    value: function _hgActiveBookmarkDidChange() {
      this._hgActiveBookmarkDidChangeObserver.next();
    }
  }, {
    key: '_hgBookmarksDidChange',
    value: function _hgBookmarksDidChange() {
      this._hgBookmarksDidChangeObserver.next();
    }

    /**
     * Observes one of more files has changed. Applies to all files except
     * .hgignore files. (See ::onHgIgnoreFileDidChange.)
     * @return A Observable which emits the changed file paths.
     */
  }, {
    key: 'observeFilesDidChange',
    value: function observeFilesDidChange() {
      return this._filesDidChangeObserver.publish();
    }

    /**
     * Observes that a Mercurial repository commits state have changed
     * (e.g. commit, amend, histedit, strip, rebase) that would require refetching from the service.
     */
  }, {
    key: 'observeHgCommitsDidChange',
    value: function observeHgCommitsDidChange() {
      return this._hgRepoCommitsDidChangeObserver.publish();
    }

    /**
     * Observes that a Mercurial event has occurred (e.g. histedit) that would
     * potentially invalidate any data cached from responses from this service.
     */
  }, {
    key: 'observeHgRepoStateDidChange',
    value: function observeHgRepoStateDidChange() {
      return this._hgRepoStateDidChangeObserver.publish();
    }

    /**
     * Observes when a Mercurial repository enters and exits a rebase state.
     */
  }, {
    key: 'observeHgConflictStateDidChange',
    value: function observeHgConflictStateDidChange() {
      this._checkConflictChange();
      return this._hgConflictStateDidChangeObserver.publish();
    }

    /**
     * Shells out to `hg diff` to retrieve line diff information for the paths.
     * @param An Array of NuclideUri (absolute paths) for which to fetch diff info.
     * @return A map of each NuclideUri (absolute path) to its DiffInfo.
     *   Each path is presumed to be in the repo.
     *   If the `hg diff` call fails, this method returns null.
     *   If a path has no changes, it will not appear in the returned Map.
     */
  }, {
    key: 'fetchDiffInfo',
    value: _asyncToGenerator(function* (filePaths) {
      // '--unified 0' gives us 0 lines of context around each change (we don't
      // care about the context).
      // '--noprefix' omits the a/ and b/ prefixes from filenames.
      // '--nodates' avoids appending dates to the file path line.
      var args = ['diff', '--unified', '0', '--noprefix', '--nodates'].concat(filePaths);
      var options = {
        cwd: this._workingDirectory
      };
      var output = undefined;
      try {
        output = yield this._hgAsyncExecute(args, options);
      } catch (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Error when running hg diff for paths: ' + filePaths.toString() + ' \n\tError: ' + e.stderr);
        return null;
      }
      var pathToDiffInfo = (0, (_hgDiffOutputParser || _load_hgDiffOutputParser()).parseMultiFileHgDiffUnifiedOutput)(output.stdout);
      var absolutePathToDiffInfo = new Map();
      for (var _ref3 of pathToDiffInfo) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var filePath = _ref2[0];
        var diffInfo = _ref2[1];

        absolutePathToDiffInfo.set((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(this._workingDirectory, filePath), diffInfo);
      }
      return absolutePathToDiffInfo;
    })

    /**
     * Section: Bookmarks
     */

  }, {
    key: 'createBookmark',
    value: function createBookmark(name, revision) {
      var args = [];
      if (revision) {
        args.push('--rev', revision);
      }
      args.push(name);

      return this._runSimpleInWorkingDirectory('bookmark', args);
    }
  }, {
    key: 'deleteBookmark',
    value: function deleteBookmark(name) {
      return this._runSimpleInWorkingDirectory('bookmarks', ['--delete', name]);
    }
  }, {
    key: 'renameBookmark',
    value: function renameBookmark(name, nextName) {
      return this._runSimpleInWorkingDirectory('bookmarks', ['--rename', name, nextName]);
    }

    /**
     * @return The name of the current bookmark.
     */
  }, {
    key: 'fetchActiveBookmark',
    value: function fetchActiveBookmark() {
      return (0, (_hgBookmarkHelpers || _load_hgBookmarkHelpers()).fetchActiveBookmark)((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(this._workingDirectory, '.hg'));
    }

    /**
     * @return An Array of bookmarks for this repository.
     */
  }, {
    key: 'fetchBookmarks',
    value: _asyncToGenerator(function* () {
      var args = ['bookmarks', '-Tjson'];
      var execOptions = {
        cwd: this._workingDirectory
      };

      var output = undefined;
      try {
        output = yield this._hgAsyncExecute(args, execOptions);
      } catch (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('LocalHgServiceBase failed to fetch bookmarks. Error: ' + e.stderr);
        throw e;
      }

      return JSON.parse(output.stdout);
    })

    /**
     * Observes that the active Mercurial bookmark has changed.
     */
  }, {
    key: 'observeActiveBookmarkDidChange',
    value: function observeActiveBookmarkDidChange() {
      return this._hgActiveBookmarkDidChangeObserver.publish();
    }

    /**
     * Observes that Mercurial bookmarks have changed.
     */
  }, {
    key: 'observeBookmarksDidChange',
    value: function observeBookmarksDidChange() {
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
  }, {
    key: 'fetchFileContentAtRevision',
    value: function fetchFileContentAtRevision(filePath, revision) {
      return (0, (_hgRevisionStateHelpers || _load_hgRevisionStateHelpers()).fetchFileContentAtRevision)(filePath, revision, this._workingDirectory);
    }
  }, {
    key: 'fetchFilesChangedAtRevision',
    value: function fetchFilesChangedAtRevision(revision) {
      return (0, (_hgRevisionStateHelpers || _load_hgRevisionStateHelpers()).fetchFilesChangedAtRevision)(revision, this._workingDirectory);
    }

    /**
     * Fetch the revision details between the current head and the the common ancestor
     * of head and master in the repository.
     * @return an array with the revision info (`title`, `author`, `date` and `id`)
     * or `null` if no common ancestor was found.
     */
  }, {
    key: 'fetchRevisionInfoBetweenHeadAndBase',
    value: _asyncToGenerator(function* () {
      var forkBaseName = yield getForkBaseName(this._workingDirectory);
      var revisionsInfo = yield (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).fetchRevisionInfoBetweenRevisions)((0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForCommonAncestor)(forkBaseName), (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForRevisionsBeforeHead)(0), this._workingDirectory);
      return revisionsInfo;
    })
  }, {
    key: 'fetchSmartlogRevisions',
    value: function fetchSmartlogRevisions() {
      return (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).fetchSmartlogRevisions)(this._workingDirectory);
    }

    /**
     * Resolve the revision details of the base branch
     */
  }, {
    key: 'getBaseRevision',
    value: _asyncToGenerator(function* () {
      var forkBaseName = yield getForkBaseName(this._workingDirectory);
      return yield (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).fetchRevisionInfo)((0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForCommonAncestor)(forkBaseName), this._workingDirectory);
    })

    /**
     * Gets the blame for the filePath at the current revision, including uncommitted changes
     * (but not unsaved changes).
     * @param filePath The file to get blame information for.
     * @return A Map that maps a line number (0-indexed) to the name that line blames to.
     *   The name is of the form: "Firstname Lastname <username@email.com> ChangeSetID".
     *   The Firstname Lastname may not appear sometimes.
     *   If no blame information is available, returns an empty Map.
     */
  }, {
    key: 'getBlameAtHead',
    value: _asyncToGenerator(function* (filePath) {
      var args = ['blame', '-r', 'wdir()', '-Tjson', '--changeset', '--user', '--line-number', filePath];
      var execOptions = {
        cwd: this._workingDirectory
      };
      var output = undefined;
      try {
        output = yield this._hgAsyncExecute(args, execOptions);
      } catch (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('LocalHgServiceBase failed to fetch blame for file: ' + filePath + '. Error: ' + e.stderr);
        throw e;
      }
      return (0, (_hgBlameOutputParser || _load_hgBlameOutputParser()).parseHgBlameOutput)(output.stdout);
    })

    /**
     * Returns the value of the config item at `key`.
     * @param key Name of config item
     */
  }, {
    key: 'getConfigValueAsync',
    value: _asyncToGenerator(function* (key) {
      var args = ['config', key];
      var execOptions = {
        cwd: this._workingDirectory
      };
      try {
        return (yield this._hgAsyncExecute(args, execOptions)).stdout.trim();
      } catch (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Failed to fetch Hg config for key ' + key + '.  Error: ' + e.toString());
        return null;
      }
    })

    /**
     * Gets the Differential Revision id (aka DXXXXXX) id for the specified changeSetId, if it exists.
     * Otherwise, returns null.
     * This implementation relies on the "phabdiff" template being available as defined in:
     * https://bitbucket.org/facebook/hg-experimental/src/fbf23b3f96bade5986121a7c57d7400585d75f54/phabdiff.py.
     */
  }, {
    key: 'getDifferentialRevisionForChangeSetId',
    value: _asyncToGenerator(function* (changeSetId) {
      var args = ['log', '-T', '{phabdiff}\n', '--limit', '1', '--rev', changeSetId];
      var execOptions = {
        cwd: this._workingDirectory
      };
      try {
        var output = yield this._hgAsyncExecute(args, execOptions);
        var _stdout = output.stdout.trim();
        return _stdout ? _stdout : null;
      } catch (e) {
        // This should not happen: `hg log` does not error even if it does not recognize the template.
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Failed when trying to get differential revision for: ' + changeSetId);
        return null;
      }
    })

    /**
     * Get the output of the experimental smartlog extension from Mercurial:
     * https://bitbucket.org/facebook/hg-experimental/#markdown-header-smartlog.
     * @param ttyOutput If true, return the output as if stdout were attached to a tty.
     * @param concise true to run `hg smartlog`; false to run `hg ssl`.
     * @return The output from running the command.
     */
  }, {
    key: 'getSmartlog',
    value: _asyncToGenerator(function* (ttyOutput, concise) {
      // disable the pager extension so that 'hg ssl' terminates. We can't just use
      // HGPLAIN because we have not found a way to get colored output when we do.
      var args = ['--config', 'extensions.pager=!', concise ? 'ssl' : 'smartlog'];
      var execOptions = {
        cwd: this._workingDirectory,
        NO_HGPLAIN: concise, // `hg ssl` is likely user-defined.
        TTY_OUTPUT: ttyOutput
      };
      return yield this._hgAsyncExecute(args, execOptions);
    })
  }, {
    key: '_commitCode',
    value: function _commitCode(message, args) {
      var _this4 = this;

      var tempFile = null;
      var editMergeConfigs = undefined;

      return (_rxjsBundlesRxMinJs2 || _load_rxjsBundlesRxMinJs2()).Observable.fromPromise(_asyncToGenerator(function* () {
        editMergeConfigs = yield (0, (_hgUtils || _load_hgUtils()).getEditMergeConfigs)();
        if (message == null) {
          return args;
        } else {
          tempFile = yield (0, (_hgUtils || _load_hgUtils()).createCommmitMessageTempFile)(message);
          return [].concat(args, ['-l', tempFile]);
        }
      })()).switchMap(function (argumentsWithCommitFile) {
        (0, (_assert || _load_assert()).default)(editMergeConfigs != null, 'editMergeConfigs cannot be null');
        var execOptions = {
          cwd: _this4._workingDirectory,
          HGEDITOR: editMergeConfigs.hgEditor
        };
        return _this4._hgObserveExecution([].concat(_toConsumableArray(editMergeConfigs.args), _toConsumableArray(argumentsWithCommitFile)), execOptions);
      }).finally(function () {
        if (tempFile != null) {
          (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.unlink(tempFile);
        }
      });
    }

    /**
     * Commit code to version control.
     * @param message Commit message.
     */
  }, {
    key: 'commit',
    value: function commit(message) {
      return this._commitCode(message, ['commit']).publish();
    }

    /**
     * Amend code changes to the latest commit.
     * @param message Commit message.  Message will remain unchaged if not provided.
     * @param amendMode Decide the amend functionality to apply.
     *  Clean to just amend.
     *  Rebase to amend and rebase the stacked diffs.
     *  Fixup to fix the stacked commits, rebasing them on top of this commit.
     */
  }, {
    key: 'amend',
    value: function amend(message, amendMode) {
      var args = ['amend'];
      switch (amendMode) {
        case (_hgConstants || _load_hgConstants()).AmendMode.CLEAN:
          break;
        case (_hgConstants || _load_hgConstants()).AmendMode.REBASE:
          args.push('--rebase');
          break;
        case (_hgConstants || _load_hgConstants()).AmendMode.FIXUP:
          args.push('--fixup');
          break;
        default:
          throw new Error('Unexpected AmendMode');
      }
      return this._commitCode(message, args).publish();
    }
  }, {
    key: 'revert',
    value: function revert(filePaths) {
      return this._runSimpleInWorkingDirectory('revert', filePaths);
    }
  }, {
    key: '_runSimpleInWorkingDirectory',
    value: _asyncToGenerator(function* (action, args) {
      var options = {
        cwd: this._workingDirectory
      };
      var cmd = [action].concat(args);
      try {
        yield this._hgAsyncExecute(cmd, options);
      } catch (e) {
        var errorString = e.stderr || e.message || e.toString();
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('hg %s failed with [%s] arguments: %s', action, args.toString(), errorString);
        throw new Error(errorString);
      }
    })

    /**
     * @param revision This could be a changeset ID, name of a bookmark, revision number, etc.
     * @param create Currently, this parameter is ignored.
     */
  }, {
    key: 'checkout',
    value: function checkout(revision, create) {
      return this._runSimpleInWorkingDirectory('checkout', [revision]);
    }

    /*
     * Silence errors from hg calls that don't include any tracked files - these
     * are generally harmless and should not create an error notification.
     * This checks the error string in order to avoid potentially slow hg pre-checks.
     */
  }, {
    key: '_rethrowErrorIfHelpful',
    value: function _rethrowErrorIfHelpful(e) {
      if (!IGNORABLE_ERROR_SUFFIXES.some(function (s) {
        return e.message.endsWith(s + '\n');
      })) {
        throw e;
      }
    }

    /**
     * Rename/move files versioned under Hg.
     * @param filePaths Which files should be renamed/moved.
     * @param destPath What should the file be renamed/moved to.
     */
  }, {
    key: 'rename',
    value: _asyncToGenerator(function* (filePaths, destPath, after) {
      var args = [].concat(_toConsumableArray(filePaths.map(function (p) {
        return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(p);
      })), [// Sources
      (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(destPath)]);
      // Dest
      if (after) {
        args.unshift('--after');
      }
      try {
        yield this._runSimpleInWorkingDirectory('rename', args);
      } catch (e) {
        if (after) {
          this._rethrowErrorIfHelpful(e);
        } else {
          throw e;
        }
      }
    })

    /**
     * Remove a file versioned under Hg.
     * @param filePath Which file should be removed.
     */
  }, {
    key: 'remove',
    value: _asyncToGenerator(function* (filePaths, after) {
      var args = ['-f'].concat(_toConsumableArray(filePaths.map(function (p) {
        return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(p);
      })));
      if (after) {
        args.unshift('--after');
      }

      try {
        yield this._runSimpleInWorkingDirectory('remove', args);
      } catch (e) {
        if (after) {
          this._rethrowErrorIfHelpful(e);
        } else {
          throw e;
        }
      }
    })

    /**
     * Version a new file under Hg.
     * @param filePath Which file should be versioned.
     */
  }, {
    key: 'add',
    value: function add(filePaths) {
      return this._runSimpleInWorkingDirectory('add', filePaths);
    }

    // TODO(t12228275) This is a stopgap hack, fix it. This takes the default
    // commit message from the hg commit message and since there is no change to
    // the commit message the commands errors out with error code : 255 and piggy
    // backs the stdout and stderr into an error message.
  }, {
    key: 'getTemplateCommitMessage',
    value: _asyncToGenerator(function* () {
      var editor = undefined;

      // Windows will need 'type' in place of 'cat'
      if (process.platform === 'win32') {
        editor = 'type';
      } else {
        editor = 'cat';
      }
      var args = ['commit', '--config', 'ui.editor=' + editor, '--config', 'ui.allowemptycommit=true'];
      var execOptions = {
        cwd: this._workingDirectory,
        HGEDITOR: ''
      };
      try {
        var _ref4 = yield this._hgAsyncExecute(args, execOptions);

        var _stdout2 = _ref4.stdout;

        // It is most certianly not going to come here ever, the hg commit
        // is always going to error since no change is made to the commit message.
        return _stdout2;
      } catch (e) {
        // Since no change was made stderr is returned and the service thinks the
        // command execution failed. This is to get the stdout part of the message.
        // If there is no match return null. This will need to go away soon.
        // The message format : stderr:<error> stdout:<stdout>
        var re = /stdout:(.[\n\r]*[\s\S]*)/;
        var _stdout3 = re.exec(e.message);

        if (_stdout3 === null) {
          // Return the message as is
          return e.message;
        }

        // Match exists, return the commit message
        return _stdout3[1].trim();
      }
    })
  }, {
    key: 'getHeadCommitMessage',
    value: _asyncToGenerator(function* () {
      var args = ['log', '-T', '{desc}\n', '--limit', '1', '--rev', (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForRevisionsBeforeHead)(0)];
      var execOptions = {
        cwd: this._workingDirectory
      };
      try {
        var output = yield this._hgAsyncExecute(args, execOptions);
        var _stdout4 = output.stdout.trim();
        return _stdout4 || null;
      } catch (e) {
        // This should not happen: `hg log` does not error even if it does not recognize the template.
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Failed when trying to get head commit message');
        return null;
      }
    })
  }, {
    key: 'log',
    value: _asyncToGenerator(function* (filePaths, limit) {
      var args = ['log', '-Tjson'];
      if (limit != null && limit > 0) {
        args.push('--limit', String(limit));
      }
      for (var filePath of filePaths) {
        args.push(filePath);
      }

      var execOptions = {
        cwd: this._workingDirectory
      };
      var result = yield this._hgAsyncExecute(args, execOptions);
      var entries = JSON.parse(result.stdout);
      return { entries: entries };
    })
  }, {
    key: 'fetchMergeConflicts',
    value: _asyncToGenerator(function* () {
      var _this5 = this;

      var _ref5 = yield this._hgAsyncExecute(['resolve', '--list', '-Tjson'], {
        cwd: this._workingDirectory
      });

      var stdout = _ref5.stdout;

      var fileListStatuses = JSON.parse(stdout);
      var conflictedFiles = fileListStatuses.filter(function (fileStatus) {
        return fileStatus.status === (_hgConstants || _load_hgConstants()).StatusCodeId.UNRESOLVED;
      });
      var origBackupPath = yield this._getOrigBackupPath();
      var conflicts = yield Promise.all(conflictedFiles.map(_asyncToGenerator(function* (conflictedFile) {
        var message = undefined;
        // Heuristic: If the `.orig` file doesn't exist, then it's deleted by the rebasing commit.
        if (yield _this5._checkOrigFile(origBackupPath, conflictedFile.path)) {
          message = (_hgConstants || _load_hgConstants()).MergeConflictStatus.BOTH_CHANGED;
        } else {
          message = (_hgConstants || _load_hgConstants()).MergeConflictStatus.DELETED_IN_THEIRS;
        }
        return {
          path: conflictedFile.path,
          message: message
        };
      })));
      return conflicts;
    })
  }, {
    key: '_getOrigBackupPath',
    value: _asyncToGenerator(function* () {
      if (this._origBackupPath == null) {
        var relativeBackupPath = yield this.getConfigValueAsync('ui.origbackuppath');
        if (relativeBackupPath == null) {
          this._origBackupPath = this._workingDirectory;
        } else {
          this._origBackupPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(this._workingDirectory, relativeBackupPath);
        }
      }
      return this._origBackupPath;
    })
  }, {
    key: '_checkOrigFile',
    value: _asyncToGenerator(function* (origBackupPath, filePath) {
      var origFilePath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(origBackupPath, filePath + '.orig');
      logger.info('origBackupPath:', origBackupPath);
      logger.info('filePath:', filePath);
      logger.info('origFilePath:', origFilePath);
      return yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.exists(origFilePath);
    })
  }, {
    key: 'resolveConflictedFile',
    value: function resolveConflictedFile(filePath) {
      return this._runSimpleInWorkingDirectory('resolve', ['-m', filePath]);
    }
  }, {
    key: 'continueRebase',
    value: function continueRebase() {
      return this._runSimpleInWorkingDirectory('rebase', ['--continue']);
    }
  }, {
    key: 'abortRebase',
    value: function abortRebase() {
      return this._runSimpleInWorkingDirectory('rebase', ['--abort']);
    }
  }, {
    key: 'rebase',
    value: function rebase(destination, source) {
      var args = ['rebase', '-d', destination];
      if (source != null) {
        args.push('-s', source);
      }
      var execOptions = {
        cwd: this._workingDirectory
      };

      return (0, (_hgUtils || _load_hgUtils()).hgObserveExecution)(args, execOptions).publish();
    }

    /**
     * Copy files versioned under Hg.
     * @param filePaths Which files should be copied.
     * @param destPath What should the new file be named to.
     */
  }, {
    key: 'copy',
    value: _asyncToGenerator(function* (filePaths, destPath, after) {
      var args = [].concat(_toConsumableArray(filePaths.map(function (p) {
        return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(p);
      })), [// Sources
      (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(destPath)]);
      // Dest
      if (after) {
        args.unshift('--after');
      }
      try {
        yield this._runSimpleInWorkingDirectory('copy', args);
      } catch (e) {
        if (after) {
          this._rethrowErrorIfHelpful(e);
        } else {
          throw e;
        }
      }
    })
  }]);

  return HgService;
})();

exports.HgService = HgService;