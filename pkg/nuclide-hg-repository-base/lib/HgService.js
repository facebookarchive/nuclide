'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import path from 'path';
import fs from 'fs';
import {debounce} from '../../nuclide-commons';
import DelayedEventManager from './DelayedEventManager';
import {WatchmanClient} from '../../nuclide-watchman-helpers';

import {HgStatusOption} from './hg-constants';
import {Observable, Subject} from 'rxjs';
import {parseHgBlameOutput} from './hg-blame-output-parser';
import {parseMultiFileHgDiffUnifiedOutput} from './hg-diff-output-parser';
import {
  expressionForCommonAncestor,
  expressionForRevisionsBeforeHead,
  fetchRevisionInfoBetweenRevisions,
} from './hg-revision-expression-helpers';
import {
  fetchFileContentAtRevision,
  fetchFilesChangedAtRevision,
} from './hg-revision-state-helpers';
import {hgAsyncExecute} from './hg-utils';
import {fsPromise} from '../../nuclide-commons';
import {getPath} from '../../nuclide-remote-uri';

import {readArcConfig} from '../../nuclide-arcanist-base';
import {getLogger} from '../../nuclide-logging';

const logger = getLogger();
const DEFAULT_FORK_BASE_NAME = 'default';

const WATCHMAN_SUBSCRIPTION_NAME_PRIMARY = 'hg-repository-watchman-subscription-primary';
const WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK = 'hg-repository-watchman-subscription-hgbookmark';
const WATCHMAN_SUBSCRIPTION_NAME_ARC_BUILD_LOCK = 'arc-build-lock';
const EVENT_DELAY_IN_MS = 1000;

// If Watchman reports that many files have changed, it's not really useful to report this.
// This is typically caused by a large rebase or a Watchman re-crawl.
// We'll just report that the repository state changed, which should trigger a full client refresh.
const FILES_CHANGED_LIMIT = 1000;

// Mercurial (as of v3.7.2) [strips lines][1] matching the following prefix when a commit message is
// created by an editor invoked by Mercurial. Because Nuclide is not invoked by Mercurial, Nuclide
// must mimic the same stripping.
//
// Note: `(?m)` converts to `/m` in JavaScript-flavored RegExp to mean 'multiline'.
//
// [1] https://selenic.com/hg/file/3.7.2/mercurial/cmdutil.py#l2734
const COMMIT_MESSAGE_STRIP_LINE = /^HG:.*(\n|$)/gm;

/**
 * These are status codes used by Mercurial's output.
 * Documented in http://selenic.com/hg/help/status.
 */
export type StatusCodeIdValue = 'A' | 'C' | 'I' | 'M' | '!' | 'R' | '?';

/**
 * Internally, the HgRepository uses the string StatusCodeId to do bookkeeping.
 * However, GitRepository uses numbers to represent its statuses, and returns
 * statuses as numbers. In order to keep our status 'types' the same, we map the
 * string StatusCodeId to numbers.
 * The numbers themselves should not matter; they are meant to be passed
 * to ::isStatusNew/::isStatusModified to be interpreted.
 */
export type StatusCodeNumberValue = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type HgStatusOptionValue = 1 | 2 | 3;

export type LineDiff = {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
};

export type DiffInfo = {
  added: number;
  deleted: number;
  lineDiffs: Array<LineDiff>;
};

export type RevisionInfo = {
  id: number;
  hash: string;
  title: string;
  author: string;
  date: Date;
  description: string;
  // List of bookmarks at this revision.
  bookmarks: Array<string>;
};

export type AsyncExecuteRet = {
  command?: string;
  errorMessage?: string;
  exitCode: number;
  stderr: string;
  stdout: string;
};

export type RevisionFileCopy = {
  from: NuclideUri;
  to: NuclideUri;
};

export type RevisionFileChanges = {
  all: Array<NuclideUri>;
  added: Array<NuclideUri>;
  deleted: Array<NuclideUri>;
  copied: Array<RevisionFileCopy>;
  modified: Array<NuclideUri>;
};

async function getForkBaseName(directoryPath: string): Promise<string> {
  const arcConfig = await readArcConfig(directoryPath);
  if (arcConfig != null) {
    return arcConfig['arc.feature.start.default'] || arcConfig['arc.land.onto.default'];
  }
  return DEFAULT_FORK_BASE_NAME;
}

function getArcBuildLockFile(): ?string {
  let lockFile;
  try {
    lockFile = require('./fb/config').arcBuildLockFile;
  } catch (e) {
    // purposely blank
  }
  return lockFile;
}

/**
 * @return Array of additional watch expressions to apply to the primary
 *   watchman subscription.
 */
function getPrimaryWatchmanSubscriptionRefinements(): Array<mixed> {
  let refinements = [];
  try {
    refinements = require('./fb/config').primaryWatchSubscriptionRefinements;
  } catch (e) {
    // purposely blank
  }
  return refinements;
}

export class HgService {

  _delayedEventManager: DelayedEventManager;
  _lockFileHeld: boolean;
  _shouldUseDirstate: boolean;
  _watchmanClient: ?WatchmanClient;
  _hgDirWatcher: ?fs.FSWatcher;
  _allowEventsAgain: ?() => ?void;

  _workingDirectory: string;
  _filesDidChangeObserver: Subject;
  _hgIgnoreFileDidChangeObserver: Subject;
  _hgRepoStateDidChangeObserver: Subject;
  _hgBookmarkDidChangeObserver: Subject;

  constructor(workingDirectory: string) {
    this._workingDirectory = workingDirectory;
    this._filesDidChangeObserver = new Subject();
    this._hgIgnoreFileDidChangeObserver = new Subject();
    this._hgRepoStateDidChangeObserver = new Subject();
    this._hgBookmarkDidChangeObserver = new Subject();
    this._delayedEventManager = new DelayedEventManager(setTimeout, clearTimeout);
    this._lockFileHeld = false;
    this._shouldUseDirstate = true;
    this._subscribeToWatchman().catch(error => {
      logger.error('Failed to subscribe to watchman error: ', error);
    });
  }

  async dispose(): Promise<void> {
    this._filesDidChangeObserver.complete();
    this._hgIgnoreFileDidChangeObserver.complete();
    this._hgRepoStateDidChangeObserver.complete();
    this._hgBookmarkDidChangeObserver.complete();
    if (this._hgDirWatcher != null) {
      this._hgDirWatcher.close();
      this._hgDirWatcher = null;
    }
    await this._cleanUpWatchman();
    this._delayedEventManager.dispose();
    if (this._dirstateDelayedEventManager) {
      this._dirstateDelayedEventManager.dispose();
    }
  }

  // Wrapper to help mocking during tests.
  _hgAsyncExecute(args: Array<string>, options: any): Promise<any> {
    return hgAsyncExecute(args, options);
  }

  /**
   * Section: File and Repository Status
   */

  /**
   * Shells out of the `hg status` to get the statuses of the paths. All paths
   * are presumed to be within the repo. (If any single path is not within the repo,
   * this method will return an empty map.)
   * @param options An Object with the following fields:
   *   * `hgStatusOption`: an HgStatusOption
   */
  async fetchStatuses(
    filePaths: Array<NuclideUri>,
    options: ?any,
  ): Promise<Map<NuclideUri, StatusCodeIdValue>> {
    const statusMap = new Map();

    let args = ['status', '-Tjson'];
    if (options && ('hgStatusOption' in options)) {
      if (options.hgStatusOption === HgStatusOption.ONLY_IGNORED) {
        args.push('--ignored');
      } else if (options.hgStatusOption === HgStatusOption.ALL_STATUSES) {
        args.push('--all');
      }
    }
    args = args.concat(filePaths);
    const execOptions = {
      cwd: this._workingDirectory,
    };
    let output;
    try {
      output = await this._hgAsyncExecute(args, execOptions);
    } catch (e) {
      return statusMap;
    }

    const statuses = JSON.parse(output.stdout);
    statuses.forEach(status => {
      statusMap.set(
        path.join(this._workingDirectory, status.path),
        status.status,
      );
    });
    return statusMap;
  }

  async _subscribeToWatchman(): Promise<void> {
    let arcBuildSubscription = null;

    const hgIgnoreChange = () => {
      // There are three events that may outdate the status of ignored files.
      // 1. The .hgignore file changes. In this case, we want to run a fresh 'hg status -i'.
      // 2. A file is added that meets the criteria under .hgignore. In this case, we can
      //    scope the 'hg status -i' call to just the added file.
      // 3. A file that was previously ignored, has been deleted. (A bit debatable in this
      //    case what ::isPathIgnored should return if the file doesn't exist. But let's
      //    at least keep the local cache updated.) In this case, we just want to remove
      //    the deleted file if it is in the cache.
      // Case 1 is covered by the response to WATCHMAN_SUBSCRIPTION_NAME_HGIGNORE firing.
      // Cases 2 and 3 are covered by the response to WATCHMAN_SUBSCRIPTION_NAME_PRIMARY firing.
      this._delayedEventManager.addEvent(
        this._hgIgnoreFileDidChange.bind(this),
        EVENT_DELAY_IN_MS,
      );
    };

    const lockFileChange = exists => {
      if (exists) {
        // TODO: Implement a timer to unset this, in case watchman update
        // fails to notify of the removal of the lock. I haven't seen this
        // in practice but it's better to be safe.
        this._lockFileHeld = true;
        // The lock being created is a definitive start to a Mercurial action/arc build.
        // Block the effects from any dirstate change, which is a fuzzier signal.
        this._shouldUseDirstate = false;
        this._delayedEventManager.setCanAcceptEvents(false);
        this._delayedEventManager.cancelAllEvents();
      } else {
        this._lockFileHeld = false;
        this._delayedEventManager.setCanAcceptEvents(true);
        // The lock being deleted is a definitive end to a Mercurial action/arc build.
        // Block the effects from any dirstate change, which is a fuzzier signal.
        this._shouldUseDirstate = false;
      }
      this._hgLockDidChange(exists);
    };

    const dirStateChange = () => {
      // We don't know whether the change to the dirstate is at the middle or end
      // of a Mercurial action. But we would rather have false positives (ignore
      // some user-generated events that occur near a Mercurial event) than false
      // negatives (register irrelevant Mercurial events).
      // Each time this watchman update fires, we will make the LocalHgService
      // ignore events for a certain grace period.

      // A lock file is a more reliable signal, so defer to it.
      if (this._lockFileHeld) {
        return;
      }

      this._shouldUseDirstate = true;
      this._delayedEventManager.setCanAcceptEvents(false);
      this._delayedEventManager.cancelAllEvents();

      // Using a local variable here to allow better type refinement.
      let allowEventsAgain = this._allowEventsAgain;
      if (!allowEventsAgain) {
        allowEventsAgain = debounce(() => {
          if (this._shouldUseDirstate) {
            this._delayedEventManager.setCanAcceptEvents(true);
            this._hgDirstateDidChange();
          }
        },
        EVENT_DELAY_IN_MS,
        /* immediate */ false);
        this._allowEventsAgain = allowEventsAgain;
      }
      allowEventsAgain();
    };

    // Using a local variable here to allow better type refinement.
    const watchmanClient = new WatchmanClient();
    this._watchmanClient = watchmanClient;
    const workingDirectory = this._workingDirectory;

    let primarySubscriptionExpression: Array<mixed> = ['allof',
      ['not', ['dirname', '.hg']],
      ['not', ['name', '.hgignore', 'wholename']],
      // Hg appears to modify temporary files that begin with these
      // prefixes, every time a file is saved.
      // TODO (t7832809) Remove this when it is unnecessary.
      ['not', ['match', 'hg-checkexec-*', 'wholename']],
      ['not', ['match', 'hg-checklink-*', 'wholename']],
      // This watchman subscription is used to determine when and which
      // files to fetch new statuses for. There is no reason to include
      // directories in these updates, and in fact they may make us overfetch
      // statuses. (See diff summary of D2021498.)
      // This line restricts this subscription to only return files.
      ['type', 'f'],
    ];
    primarySubscriptionExpression =
      primarySubscriptionExpression.concat(getPrimaryWatchmanSubscriptionRefinements());

    // Subscribe to changes to files unrelated to source control.
    const primarySubscribtion = await watchmanClient.watchDirectoryRecursive(
      workingDirectory,
      WATCHMAN_SUBSCRIPTION_NAME_PRIMARY,
      {
        fields: ['name', 'exists', 'new'],
        expression: primarySubscriptionExpression,
      },
    );
    logger.debug(`Watchman subscription ${WATCHMAN_SUBSCRIPTION_NAME_PRIMARY} established.`);

    // TODO(most): Replace the usage of node watchers when watchman is ready
    //  with the advanced option: "defer": "hg.update"
    // Watchman currently (v4.5) doesn't report `.hg` file updates until it reaches
    // a stable filesystem (not respecting `defer_vcs` option) and
    // that doesn't happen with big mercurial updates (the primary use of state file watchers).
    // Hence, we here use node's filesystem watchers instead.
    const lockFilePath = path.join(workingDirectory, '.hg', 'wslock');
    try {
      this._hgDirWatcher = fs.watch(path.join(workingDirectory, '.hg'), (event, fileName) => {
        if (fileName === 'wslock') {
          // The synchronous exist check is used to avoid the race condition of
          // fast updates, when the watcher is called twice as the file is created/removed.
          // That may lead to a sequence calls: lockFileChange(false) then lockFileChange(true),
          // stopping future events from being sent to the client.
          lockFileChange(fs.existsSync(lockFilePath));
        } else if (fileName === 'dirstate') {
          dirStateChange();
        } else if (fileName === '.hgignore') {
          hgIgnoreChange();
        }
      });
      logger.debug(`Node watcher created for lock/dirstate/bookmarks files.`);
    } catch (error) {
      getLogger().error(`Error when creating node watcher for hg state files`, error);
    }

    // Subscribe to changes in the current Hg bookmark.
    const hgBookmarkSubscription = await watchmanClient.watchDirectoryRecursive(
      workingDirectory,
      WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK,
      {
        fields: ['name', 'exists'],
        expression: ['name', '.hg/bookmarks.current', 'wholename'],
        defer_vcs: false,
      },
    );
    logger.debug(`Watchman subscription ${WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK} established.`);

    // Subscribe to changes to a file that appears to be the 'arc build' lock file.
    const arcBuildLockFile = getArcBuildLockFile();
    if (arcBuildLockFile != null) {
      arcBuildSubscription = await watchmanClient.watchDirectoryRecursive(
        workingDirectory,
        WATCHMAN_SUBSCRIPTION_NAME_ARC_BUILD_LOCK,
        {
          fields: ['name', 'exists'],
          expression: ['name', arcBuildLockFile, 'wholename'],
        },
      );
      logger.debug(
        `Watchman subscription ${WATCHMAN_SUBSCRIPTION_NAME_ARC_BUILD_LOCK} established.`
      );
    }

    // Mercurial creates the .hg/wlock file before it modifies the working directory,
    // and deletes it when it's done. We want to ignore the watchman updates
    // caused by these modifications, so we do two things:
    // 1. The first level of defense is to watch for the creation and deletion of
    // the wlock and ignore events accordingly.
    // However, the watchman update for the files that have changed
    // due to the Mercurial action may arrive before the update for the wlock
    // file.
    // To work around this, we introduce an artificial delay for the watchman
    // updates for our files of interest, which allows time for a wlock watchman
    // update (if any) to arrive and cancel them.
    // This may occasionally result in a false positive: cancelling events that
    // were generated by a user action (not Mercurial) that occur shortly before
    // Mercurial modifies the working directory. But this should be fine,
    // because the client of LocalHgService should be reacting to the
    // 'onHgRepoStateDidChange' event that follows the Mercurial event.
    // 2. The wlock is surest way to detect the beginning and end of events. But
    // because it is a transient file, watchman may not pick up on it, especially
    // if the Mercurial action is quick (e.g. a commit, as opposed to a rebase).
    // In this case we fall back on watching the dirstate, which is a persistent
    // file that is written to whenever Mercurial updates the state of the working
    // directory (except reverts -- but this will also modify the state of the
    // relevant files). The dirstate gets modified in the middle of an update
    // and at the end, but not the beginning. Therefore it's a bit noisier of
    // a signal, and is prone to both false positives and negatives.
    primarySubscribtion.on('change', files => {
      this._delayedEventManager.addEvent(
        this._filesDidChange.bind(this, files),
        EVENT_DELAY_IN_MS,
      );
    });

    if (arcBuildSubscription != null) {
      arcBuildSubscription.on('change', lockFileChange);
    }

    hgBookmarkSubscription.on('change', this._hgBookmarkDidChange.bind(this));
  }

  async _cleanUpWatchman(): Promise<void> {
    if (this._watchmanClient != null) {
      await this._watchmanClient.dispose();
      this._watchmanClient = null;
    }
  }

  /**
   * @param fileChanges The latest changed watchman files.
   */
  _filesDidChange(fileChanges: Array<any>): void {
    if (fileChanges.length > FILES_CHANGED_LIMIT) {
      this._emitHgRepoStateChanged();
      return;
    }

    const workingDirectory = this._workingDirectory;
    const changedFiles = fileChanges.map(change => path.join(workingDirectory, change.name));
    this._filesDidChangeObserver.next(changedFiles);
  }

  _hgIgnoreFileDidChange(): void {
    this._hgIgnoreFileDidChangeObserver.next();
  }

  _hgLockDidChange(lockExists: boolean): void {
    if (!lockExists) {
      this._emitHgRepoStateChanged();
    }
  }

  _hgDirstateDidChange(): void {
    this._emitHgRepoStateChanged();
  }

  _emitHgRepoStateChanged(): void {
    this._hgRepoStateDidChangeObserver.next();
  }

  _hgBookmarkDidChange(): void {
    this._hgBookmarkDidChangeObserver.next();
  }

  /**
   * Observes one of more files has changed. Applies to all files except
   * .hgignore files. (See ::onHgIgnoreFileDidChange.)
   * @return A Observable which emits the changed file paths.
   */
  observeFilesDidChange(): Observable<Array<NuclideUri>> {
    return this._filesDidChangeObserver;
  }

  /**
   * Observes that a .hgignore file has changed.
   * @return A Observable which client could subscribe to.
   */
  observeHgIgnoreFileDidChange(): Observable<void> {
    return this._hgIgnoreFileDidChangeObserver;
  }

  /**
   * Observes that a Mercurial event has occurred (e.g. histedit) that would
   * potentially invalidate any data cached from responses from this service.
   */
  observeHgRepoStateDidChange(): Observable<void> {
    return this._hgRepoStateDidChangeObserver;
  }

  /**
   * Shells out to `hg diff` to retrieve line diff information for the paths.
   * @param An Array of NuclideUri (absolute paths) for which to fetch diff info.
   * @return A map of each NuclideUri (absolute path) to its DiffInfo.
   *   Each path is presumed to be in the repo.
   *   If the `hg diff` call fails, this method returns null.
   *   If a path has no changes, it will not appear in the returned Map.
   */
  async fetchDiffInfo(filePaths: Array<NuclideUri>): Promise<?Map<NuclideUri, DiffInfo>> {
    // '--unified 0' gives us 0 lines of context around each change (we don't
    // care about the context).
    // '--noprefix' omits the a/ and b/ prefixes from filenames.
    // '--nodates' avoids appending dates to the file path line.
    const args = ['diff', '--unified', '0', '--noprefix', '--nodates'].concat(filePaths);
    const options = {
      cwd: this._workingDirectory,
    };
    let output;
    try {
      output = await this._hgAsyncExecute(args, options);
    } catch (e) {
      getLogger().error(
          `Error when running hg diff for paths: ${filePaths} \n\tError: ${e.stderr}`);
      return null;
    }
    const pathToDiffInfo = parseMultiFileHgDiffUnifiedOutput(output.stdout);
    const absolutePathToDiffInfo = new Map();
    for (const [filePath, diffInfo] of pathToDiffInfo) {
      absolutePathToDiffInfo.set(
        path.join(this._workingDirectory, filePath),
        diffInfo,
      );
    }
    return absolutePathToDiffInfo;
  }

  /**
   * Section: Bookmarks
   */

  /**
   * @return The name of the current bookmark.
   */
  fetchCurrentBookmark(): Promise<string> {
    const {fetchCurrentBookmark} = require('./hg-bookmark-helpers');
    return fetchCurrentBookmark(path.join(this._workingDirectory, '.hg'));
  }

  /**
   * Observes that the Mercurial bookmark has changed.
   */
  observeHgBookmarkDidChange(): Observable<void> {
    return this._hgBookmarkDidChangeObserver;
  }

  /**
   * Section: Repository State at Specific Revisions
   */

  /**
   * @param filePath: The full path to the file of interest.
   * @param revision: An expression that hg can understand, specifying the
   * revision at which we want to see the file content.
   */
  fetchFileContentAtRevision(filePath: NuclideUri, revision: ?string): Promise<?string> {
    return fetchFileContentAtRevision(filePath, revision, this._workingDirectory);
  }

  fetchFilesChangedAtRevision(revision: string): Promise<?RevisionFileChanges> {
    return fetchFilesChangedAtRevision(revision, this._workingDirectory);
  }

  /**
   * Fetch the revision details between the current head and the the common ancestor
   * of head and master in the repository.
   * @return an array with the revision info (`title`, `author`, `date` and `id`)
   * or `null` if no common ancestor was found.
   */
  async fetchRevisionInfoBetweenHeadAndBase(): Promise<?Array<RevisionInfo>> {
    const fokBaseName = await getForkBaseName(this._workingDirectory);
    const revisionsInfo = await fetchRevisionInfoBetweenRevisions(
      expressionForCommonAncestor(fokBaseName),
      expressionForRevisionsBeforeHead(0),
      this._workingDirectory,
    );
    return revisionsInfo;
  }

  /**
   * Gets the blame for the filePath at the current revision, including uncommitted changes
   * (but not unsaved changes).
   * @param filePath The file to get blame information for.
   * @return A Map that maps a line number (0-indexed) to the name that line blames to.
   *   The name is of the form: "Firstname Lastname <username@email.com> ChangeSetID".
   *   The Firstname Lastname may not appear sometimes.
   *   If no blame information is available, returns an empty Map.
   */
  async getBlameAtHead(filePath: NuclideUri): Promise<Map<string, string>> {
    const args =
      ['blame', '-r', 'wdir()', '-Tjson', '--changeset', '--user', '--line-number', filePath];
    const execOptions = {
      cwd: this._workingDirectory,
    };
    let output;
    try {
      output = await this._hgAsyncExecute(args, execOptions);
    } catch (e) {
      getLogger().error(
          `LocalHgServiceBase failed to fetch blame for file: ${filePath}. Error: ${e.stderr}`);
      throw e;
    }
    return parseHgBlameOutput(output.stdout);
  }

  /**
   * Returns the value of the config item at `key`.
   * @param key Name of config item
   */
  async getConfigValueAsync(key: string): Promise<?string> {
    const args = ['config', key];
    const execOptions = {
      cwd: this._workingDirectory,
    };
    try {
      return (await this._hgAsyncExecute(args, execOptions)).stdout;
    } catch (e) {
      getLogger().error(
        `Failed to fetch Hg config for key ${key}.  Error: ${e.toString()}`
      );
      return null;
    }
  }

  /**
   * Gets the Differential Revision id (aka DXXXXXX) id for the specified changeSetId, if it exists.
   * Otherwise, returns null.
   * This implementation relies on the "phabdiff" template being available as defined in:
   * https://bitbucket.org/facebook/hg-experimental/src/fbf23b3f96bade5986121a7c57d7400585d75f54/phabdiff.py.
   */
  async getDifferentialRevisionForChangeSetId(changeSetId: string): Promise<?string> {
    const args = ['log', '-T', '{phabdiff}\n', '--limit', '1', '--rev', changeSetId];
    const execOptions = {
      cwd: this._workingDirectory,
    };
    try {
      const output = await this._hgAsyncExecute(args, execOptions);
      const stdout = output.stdout.trim();
      return stdout ? stdout : null;
    } catch (e) {
      // This should not happen: `hg log` does not error even if it does not recognize the template.
      getLogger().error(`Failed when trying to get differential revision for: ${changeSetId}`);
      return null;
    }
  }

  /**
   * Get the output of the experimental smartlog extension from Mercurial:
   * https://bitbucket.org/facebook/hg-experimental/#markdown-header-smartlog.
   * @param ttyOutput If true, return the output as if stdout were attached to a tty.
   * @param concise true to run `hg smartlog`; false to run `hg sl`.
   * @return The output from running the command.
   */
  async getSmartlog(ttyOutput: boolean, concise: boolean): Promise<AsyncExecuteRet> {
    // disable the pager extension so that 'hg sl' terminates. We can't just use
    // HGPLAIN because we have not found a way to get colored output when we do.
    const args = ['--config', 'extensions.pager=!', concise ? 'sl' : 'smartlog'];
    const execOptions = {
      cwd: this._workingDirectory,
      NO_HGPLAIN: concise, // `hg sl` is likely user-defined.
      TTY_OUTPUT: ttyOutput,
    };
    return await this._hgAsyncExecute(args, execOptions);
  }

  async _commitCode(
    message: ?string,
    extraArgs?: Array<string> = [],
  ): Promise<void> {
    const args = ['commit'];
    let tempFile = null;
    if (message != null) {
      tempFile = await fsPromise.tempfile();
      const strippedMessage = message.replace(COMMIT_MESSAGE_STRIP_LINE, '');
      await fsPromise.writeFile(tempFile, strippedMessage);
      args.push('-l', tempFile);
    }
    const execOptions = {
      cwd: this._workingDirectory,
    };
    try {
      await this._hgAsyncExecute(args.concat(extraArgs), execOptions);
    } finally {
      if (tempFile != null) {
        await fsPromise.unlink(tempFile);
      }
    }
  }

  /**
   * Commit code to version control.
   * @param message Commit message.
   */
  commit(message: string): Promise<void> {
    return this._commitCode(message);
  }

  /**
   * Amend code changes to the latest commit.
   * @param message Commit message.  Message will remain unchaged if not provided.
   */
  amend(message: ?string): Promise<void> {
    const extraArgs = ['--amend'];
    if (message == null) {
      extraArgs.push('--reuse-message', '.');
    }
    return this._commitCode(message, extraArgs);
  }

  revert(filePaths: Array<NuclideUri>): Promise<void> {
    return this._runSimpleInWorkingDirectory('revert', filePaths);
  }

  async _runSimpleInWorkingDirectory(
    action: string,
    args: Array<string>,
  ): Promise<void> {
    const options = {
      cwd: this._workingDirectory,
    };
    const cmd = [action].concat(args);
    try {
      await this._hgAsyncExecute(cmd, options);
    } catch (e) {
      const errorString = e.stderr || e.message || e.toString();
      getLogger().error(
        'hg %s failed with [%s] arguments: %s',
        action,
        args.toString(),
        errorString,
      );
      throw new Error(errorString);
    }
  }

  /**
   * @param revision This could be a changeset ID, name of a bookmark, revision number, etc.
   * @param create Currently, this parameter is ignored.
   */
  checkout(revision: string, create: boolean): Promise<void> {
    return this._runSimpleInWorkingDirectory('checkout', [revision]);
  }

  /**
   * Rename a file versioned under Hg.
   * @param oldFilePath Which file should be renamed.
   * @param newFilePath What should the file be renamed to.
   */
  rename(oldFilePath: NuclideUri, newFilePath: NuclideUri): Promise<void> {
    return this._runSimpleInWorkingDirectory(
      'rename',
      [getPath(oldFilePath), getPath(newFilePath)],
    );
  }

  /**
   * Remove a file versioned under Hg.
   * @param filePath Which file should be removed.
   */
  remove(filePath: NuclideUri): Promise<void> {
    return this._runSimpleInWorkingDirectory('remove', ['-f', getPath(filePath)]);
  }

  /**
   * Version a new file under Hg.
   * @param filePath Which file should be versioned.
   */
  add(filePaths: Array<NuclideUri>): Promise<void> {
    return this._runSimpleInWorkingDirectory('add', filePaths);
  }

}
