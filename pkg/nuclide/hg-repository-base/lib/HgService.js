'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';
import {debounce} from '../../commons';
import DelayedEventManager from './DelayedEventManager';
import HgServiceBase from './HgServiceBase';
import {WatchmanClient} from '../../watchman-helpers';
import {getLogger} from '../../logging';

const logger = getLogger();

const WATCHMAN_SUBSCRIPTION_NAME_PRIMARY = 'hg-repository-watchman-subscription-primary';
const WATCHMAN_SUBSCRIPTION_NAME_HGIGNORE = 'hg-repository-watchman-subscription-hgignore';
const WATCHMAN_SUBSCRIPTION_NAME_HGLOCK = 'hg-repository-watchman-subscription-hglock';
const WATCHMAN_SUBSCRIPTION_NAME_HGDIRSTATE = 'hg-repository-watchman-subscription-hgdirstate';
const WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK = 'hg-repository-watchman-subscription-hgbookmark';
const WATCHMAN_SUBSCRIPTION_NAME_ARC_BUILD_LOCK = 'arc-build-lock';
const EVENT_DELAY_IN_MS = 1000;

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

// To make HgServiceBase more easily testable, the watchman dependency is
// broken out. We add the watchman dependency here.
export class HgService extends HgServiceBase {

  _delayedEventManager: DelayedEventManager;
  _lockFileHeld: boolean;
  _shouldUseDirstate: boolean;
  _watchmanClient: ?WatchmanClient;
  _allowEventsAgain: ?() => ?void;

  constructor(workingDirectory: string) {
    super(workingDirectory);
    this._delayedEventManager = new DelayedEventManager(setTimeout, clearTimeout);
    this._lockFileHeld = false;
    this._shouldUseDirstate = true;
    this._subscribeToWatchman().catch(error => {
      logger.error('Failed to subscribe to watchman error: ', error);
    });
  }

  async dispose(): Promise<void> {
    await this._cleanUpWatchman();
    this._delayedEventManager.dispose();
    if (this._dirstateDelayedEventManager) {
      this._dirstateDelayedEventManager.dispose();
    }
    return super.dispose();
  }

  async _subscribeToWatchman(): Promise<void> {
    // Using a local variable here to allow better type refinement.
    const watchmanClient = new WatchmanClient();
    this._watchmanClient = watchmanClient;
    const workingDirectory = this.getWorkingDirectory();

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

    // Subscribe to changes to .hgignore files.
    const hgIgnoreSubscription = await watchmanClient.watchDirectoryRecursive(
      workingDirectory,
      WATCHMAN_SUBSCRIPTION_NAME_HGIGNORE,
      {
        fields: ['name'],
        expression: ['name', '.hgignore', 'wholename'],
      },
    );
    logger.debug(`Watchman subscription ${WATCHMAN_SUBSCRIPTION_NAME_HGIGNORE} established.`);

    // Subscribe to changes to the source control lock file.
    const hgLockSubscription = await watchmanClient.watchDirectoryRecursive(
      workingDirectory,
      WATCHMAN_SUBSCRIPTION_NAME_HGLOCK,
      {
        fields: ['name', 'exists'],
        expression: ['name', '.hg/wlock', 'wholename'],
        defer_vcs: false,
      },
    );
    logger.debug(`Watchman subscription ${WATCHMAN_SUBSCRIPTION_NAME_HGLOCK} established.`);

    // Subscribe to changes to the source control directory state file.
    const hgDirSrateSubscription = await watchmanClient.watchDirectoryRecursive(
      workingDirectory,
      WATCHMAN_SUBSCRIPTION_NAME_HGDIRSTATE,
      {
        fields: ['name', 'exists'],
        expression: ['name', '.hg/dirstate', 'wholename'],
        defer_vcs: false,
      },
    );

    logger.debug(`Watchman subscription ${WATCHMAN_SUBSCRIPTION_NAME_HGDIRSTATE} established.`);

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
    let arcBuildSubscription = null;
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
    hgIgnoreSubscription.on('change', files => {
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
    });

    const lockFileChange = files => {
      const [lockfile] = files;
      if (lockfile.exists) {
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
      this._hgLockDidChange(lockfile.exists);
    };
    hgLockSubscription.on('change', lockFileChange);
    if (arcBuildSubscription != null) {
      arcBuildSubscription.on('change', lockFileChange);
    }

    hgDirSrateSubscription.on('change', files => {
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
    });

    hgBookmarkSubscription.on('change', this._hgBookmarkDidChange.bind(this));
  }

  async _cleanUpWatchman(): Promise<void> {
    const watchmanClient = this._watchmanClient;
    if (watchmanClient != null) {
      await watchmanClient.dispose();
    }
  }

  /**
   * @param fileChanges The latest changed watchman files.
   */
  _filesDidChange(fileChanges: Array<any>): void {
    const workingDirectory = this.getWorkingDirectory();
    const changedFiles = fileChanges.map(change => path.join(workingDirectory, change.name));
    this._filesDidChangeObserver.onNext(changedFiles);
  }

  _hgIgnoreFileDidChange(): void {
    this._hgIgnoreFileDidChangeObserver.onNext();
  }

  _hgLockDidChange(lockExists: boolean): void {
    if (!lockExists) {
      this._emitHgRepoStateChanged();
    }
  }

  _hgDirstateDidChange(): void {
    this._emitHgRepoStateChanged();
  }

  _emitHgRepoStateChanged() {
    this._hgRepoStateDidChangeObserver.onNext();
  }

  _hgBookmarkDidChange(): void {
    this._hgBookmarkDidChangeObserver.onNext();
  }

}
