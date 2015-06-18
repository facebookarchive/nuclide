'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {debounce} = require('nuclide-commons');
var DelayedEventManager = require('./DelayedEventManager');
var watchman = require('fb-watchman');
var fs = require('fs');
var LocalHgServiceBase = require('./LocalHgServiceBase');
var logger = require('nuclide-logging').getLogger();
var {getWatchmanBinaryPath} = require('nuclide-watchman-helpers');
var path = require('path');

var WATCHMAN_SUBSCRIPTION_NAME_PRIMARY = 'hg-repository-watchman-subscription-primary';
var WATCHMAN_SUBSCRIPTION_NAME_HGIGNORE = 'hg-repository-watchman-subscription-hgignore';
var WATCHMAN_SUBSCRIPTION_NAME_HGLOCK = 'hg-repository-watchman-subscription-hglock';
var WATCHMAN_SUBSCRIPTION_NAME_HGDIRSTATE = 'hg-repository-watchman-subscription-hgdirstate';
var WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK = 'hg-repository-watchman-subscription-hgbookmark';
var EVENT_DELAY_IN_MS = 1000;

import type LocalHgServiceOptions from './hg-types';

// To make LocalHgServiceBase more easily testable, the watchman dependency is
// broken out. We add the watchman dependency here.
class LocalHgService extends LocalHgServiceBase {
  constructor(options: LocalHgServiceOptions) {
    super(options);
    this._delayedEventManager = new DelayedEventManager(setTimeout, clearTimeout);
    this._wlockHeld = false;
    this._shouldUseDirstate = true;
    this._subscribeToWatchman();
  }

  destroy() {
    this._cleanUpWatchman();
    this._delayedEventManager.dispose();
    if (this._dirstateDelayedEventManager) {
      this._dirstateDelayedEventManager.dispose();
    }
    super.destroy();
  }

  async _subscribeToWatchman(): Promise<void> {
    this._watchmanClient = new watchman.Client({
      watchmanBinaryPath: await getWatchmanBinaryPath(),
    });
    var workingDirectory = this.getWorkingDirectory();
    this._watchmanClient.command(['watch', workingDirectory], (watchError, watchResp) => {
      if (watchError) {
        logger.error('Error initiating watchman watch: ' + watchError);
        return;
      }
      // By default, watchman will deliver a list of all current files when you
      // first subscribe. We don't want this behavior, so we issue a `clock`
      // command to give a logical time constraint on the subscription.
      // This is recommended by https://www.npmjs.com/package/fb-watchman.
      this._watchmanClient.command(['clock', workingDirectory], (clockError, clockResp) => {
        if (clockError) {
          logger.error('Failed to query watchman clock: ', clockError);
          return;
        }

        // Subscribe to changes to files unrelated to source control.
        this._watchmanClient.command([
          'subscribe',
          workingDirectory,
          WATCHMAN_SUBSCRIPTION_NAME_PRIMARY,
          {
            fields: ['name', 'exists', 'new'],
            expression: ['allof',
              ['not', ['dirname', '.hg']],
              ['not', ['name', '.hgignore', 'wholename']],
              // It seems to be a watchman's bug that even we configured `.buckd` and `buck-out`
              // to be ignored, watchman will still fire file change events for these two path.
              ['not', ['dirname', '.buckd']],
              ['not', ['dirname', 'buck-out']],
              // This watchman subscription is used to determine when and which
              // files to fetch new statuses for. There is no reason to include
              // directories in these updates, and in fact they may make us overfetch
              // statuses. (See diff summary of D2021498.)
              // This line restricts this subscription to only return files.
              ['type', 'f'],
            ],
            since: clockResp.clock,
          },
        ], (subscribeError, subscribeResp) => {
          if (subscribeError) {
            logger.error(
              `Failed to subscribe to ${WATCHMAN_SUBSCRIPTION_NAME_PRIMARY} with clock limit: `,
              subscribeError
            );
            return;
          }
          logger.debug(`Watchman subscription ${WATCHMAN_SUBSCRIPTION_NAME_PRIMARY} established.`);
        });

        // Subscribe to changes to .hgignore files.
        this._watchmanClient.command([
          'subscribe',
          workingDirectory,
          WATCHMAN_SUBSCRIPTION_NAME_HGIGNORE,
          {
            fields: ['name'],
            expression: ['name', '.hgignore', 'wholename'],
            since: clockResp.clock,
          },
        ], (subscribeError, subscribeResp) => {
          if (subscribeError) {
            logger.error(
              `Failed to subscribe to ${WATCHMAN_SUBSCRIPTION_NAME_HGIGNORE} with clock limit: `,
              subscribeError
            );
            return;
          }
          logger.debug(`Watchman subscription ${WATCHMAN_SUBSCRIPTION_NAME_HGIGNORE} established.`);
        });

        // Subscribe to changes to the source control lock file.
        this._watchmanClient.command([
          'subscribe',
          workingDirectory,
          WATCHMAN_SUBSCRIPTION_NAME_HGLOCK,
          {
            fields: ['name', 'exists'],
            expression: ['name', '.hg/wlock', 'wholename'],
            since: clockResp.clock,
            defer_vcs: false,
          },
        ], (subscribeError, subscribeResp) => {
          if (subscribeError) {
            logger.error(
              `Failed to subscribe to ${WATCHMAN_SUBSCRIPTION_NAME_HGLOCK} with clock limit: `,
              subscribeError
            );
            return;
          }
          logger.debug(`Watchman subscription ${WATCHMAN_SUBSCRIPTION_NAME_HGLOCK} established.`);
        });

        // Subscribe to changes to the source control directory state file.
        this._watchmanClient.command([
          'subscribe',
          workingDirectory,
          WATCHMAN_SUBSCRIPTION_NAME_HGDIRSTATE,
          {
            fields: ['name', 'exists'],
            expression: ['name', '.hg/dirstate', 'wholename'],
            since: clockResp.clock,
            defer_vcs: false,
          },
        ], (subscribeError, subscribeResp) => {
          if (subscribeError) {
            logger.error(
              `Failed to subscribe to ${WATCHMAN_SUBSCRIPTION_NAME_HGDIRSTATE} with clock limit: `,
              subscribeError
            );
            return;
          }
          logger.debug(`Watchman subscription ${WATCHMAN_SUBSCRIPTION_NAME_HGDIRSTATE} established.`);
        });

        // Subscribe to changes in the current Hg bookmark.
        this._watchmanClient.command([
          'subscribe',
          workingDirectory,
          WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK,
          {
            fields: ['name', 'exists'],
            expression: ['name', '.hg/bookmarks.current', 'wholename'],
            since: clockResp.clock,
            defer_vcs: false,
          },
        ], (subscribeError, subscribeResp) => {
          if (subscribeError) {
            logger.error(
              `Failed to subscribe to ${WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK} with clock limit: `,
              subscribeError
            );
            return;
          }
          logger.debug(`Watchman subscription ${WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK} established.`);
        });
      });

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
      this._watchmanClient.on('subscription', (update) => {
        if (update.subscription === WATCHMAN_SUBSCRIPTION_NAME_PRIMARY) {
          this._delayedEventManager.addEvent(
            this._filesDidChange.bind(this, update),
            EVENT_DELAY_IN_MS
          );
        } else if (update.subscription === WATCHMAN_SUBSCRIPTION_NAME_HGIGNORE) {
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
            EVENT_DELAY_IN_MS
          );
        } else if (update.subscription === WATCHMAN_SUBSCRIPTION_NAME_HGLOCK) {
          var wlock = update.files[0];
          if (wlock.exists) {
            // TODO: Implement a timer to unset this, in case watchman update
            // fails to notify of the removal of the lock. I haven't seen this
            // in practice but it's better to be safe.
            this._wlockHeld = true;
            // The wlock being created is a definitive start to a Mercurial action.
            // Block the effects from any dirstate change, which is a fuzzier signal.
            this._shouldUseDirstate = false;
            this._delayedEventManager.setCanAcceptEvents(false);
            this._delayedEventManager.cancelAllEvents();
          } else {
            this._wlockHeld = false;
            this._delayedEventManager.setCanAcceptEvents(true);
            // The wlock being deleted is a definitive end to a Mercurial action.
            // Block the effects from any dirstate change, which is a fuzzier signal.
            this._shouldUseDirstate = false;
          }
          this._hgLockDidChange(wlock.exists);
        } else if (update.subscription === WATCHMAN_SUBSCRIPTION_NAME_HGDIRSTATE) {
          // We don't know whether the change to the dirstate is at the middle or end
          // of a Mercurial action. But we would rather have false positives (ignore
          // some user-generated events that occur near a Mercurial event) than false
          // negatives (register irrelevant Mercurial events).
          // Each time this watchman update fires, we will make the LocalHgService
          // ignore events for a certain grace period.

          // The wlock is a more reliable signal, so defer to the wlock.
          if (this._wlockHeld) {
            return;
          }

          this._shouldUseDirstate = true;
          this._delayedEventManager.setCanAcceptEvents(false);
          this._delayedEventManager.cancelAllEvents();
          if (!this._allowEventsAgain) {
            this._allowEventsAgain = debounce(() => {
                if (this._shouldUseDirstate) {
                  this._delayedEventManager.setCanAcceptEvents(true);
                  this._hgDirstateDidChange();
                }
              },
              EVENT_DELAY_IN_MS
            );
          }
          this._allowEventsAgain();
        } else if (update.subscription === WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK) {
          this._hgBookmarkDidChange();
        }
      });
    });
  }

  _cleanUpWatchman(): void {
    if (this._watchmanClient) {
      this._watchmanClient.command(['unsubscribe', this.getWorkingDirectory(), WATCHMAN_SUBSCRIPTION_NAME_PRIMARY]);
      this._watchmanClient.command(['unsubscribe', this.getWorkingDirectory(), WATCHMAN_SUBSCRIPTION_NAME_HGIGNORE]);
      this._watchmanClient.command(['unsubscribe', this.getWorkingDirectory(), WATCHMAN_SUBSCRIPTION_NAME_HGLOCK]);
      this._watchmanClient.command(['unsubscribe', this.getWorkingDirectory(), WATCHMAN_SUBSCRIPTION_NAME_HGDIRSTATE]);
      this._watchmanClient.command(['unsubscribe', this.getWorkingDirectory(), WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK]);
      this._watchmanClient.end();
    }
  }

  /**
   * @param update The latest watchman update.
   */
  _filesDidChange(update: any): Promise<void> {
    var workingDirectory = this.getWorkingDirectory();
    var changedFiles = update.files.map(file => path.join(workingDirectory, file.name));
    this._emitter.emit('files-changed', changedFiles);
  }

  _hgIgnoreFileDidChange(): Promise<void> {
    this._emitter.emit('hg-ignore-changed');
  }

  _hgLockDidChange(wlockExists: boolean): void {
    if (!wlockExists) {
      this._emitHgRepoStateChanged();
    }
  }

  _hgDirstateDidChange(): void {
    this._emitHgRepoStateChanged();
  }

  _emitHgRepoStateChanged() {
    // Currently there is no use case for alerting clients of the beginning of
    // the state change, so this event only alerts them of the end.
    this._emitter.emit('hg-repo-state-changed');
  }

  _hgBookmarkDidChange(): void {
    this._emitter.emit('hg-bookmark-changed');
  }

}


module.exports = LocalHgService;
