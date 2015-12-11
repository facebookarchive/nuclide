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
import watchman from 'fb-watchman';
import {array, promises} from '../../commons';
import {getWatchmanBinaryPath} from './main';
import WatchmanSubscription from './WatchmanSubscription';
import {getLogger} from '../../logging';

const logger = getLogger();
const WATCHMAN_SETTLE_TIME_MS = 2500;

import type {WatchmanSubscriptionOptions} from './WatchmanSubscription';

type WatchmanSubscriptionResponse = {
  root: string;
  subscription: string;
  files: Array<FileChange>;
};

export type FileChange = {
  name: string;
  new: boolean;
  exists: boolean;
  mode: number;
};

class WatchmanClient {
  _subscriptions: Map<string, WatchmanSubscription>;
  _clientPromise: Promise<watchman.Client>;
  _watchmanVersionPromise: Promise<string>;
  _serializedReconnect: () => Promise<void>;

  constructor() {
    this._initWatchmanClient();
    this._serializedReconnect = promises.serializeAsyncCall(() => this._reconnectClient());
    this._subscriptions = new Map();
    this._watchmanVersionPromise = this.version();
  }

  async dispose(): Promise<void> {
    (await this._clientPromise).end();
  }

  async _initWatchmanClient(): Promise<void> {
    this._clientPromise = this._createClientPromise();

    const client = await this._clientPromise;
    client.on('end', this._serializedReconnect);
    client.on('error', error => {
      logger.error('Error while talking to watchman: ', error);
      // Those are errors in deserializing a stream of changes.
      // The only possible recovery here is reconnecting a new client,
      // but the failed to serialize events will be missed.
      // t9353878
      this._serializedReconnect();
    });
    client.on('subscription', this._onSubscriptionResult.bind(this));
  }

  async _createClientPromise(): Promise<watchman.Client> {
    return new watchman.Client({
      watchmanBinaryPath: await getWatchmanBinaryPath(),
    });
  }

  async _reconnectClient(): Promise<void> {
    logger.error('Watchman client disconnected, reconnecting a new client!');
    const oldClient = await this._clientPromise;
    oldClient.removeAllListeners('end');
    oldClient.removeAllListeners('error');
    oldClient.removeAllListeners('subscription');
    oldClient.end();
    await this._initWatchmanClient();
    await this._restoreSubscriptions();
  }

  async _restoreSubscriptions(): Promise<void> {
    const watchSubscriptions = array.from(this._subscriptions.values());
    await Promise.all(watchSubscriptions.map(async (subscription: WatchmanSubscription) => {
      await this._watchProject(subscription.path);
      // We have already missed the change events from the disconnect time,
      // watchman could have died, so the last clock result is not valid.
      await promises.awaitMilliSeconds(WATCHMAN_SETTLE_TIME_MS);
      // Register the subscriptions after the filesystem settles.
      subscription.options.since = await this._clock(subscription.root);
      await this._subscribe(subscription.root, subscription.name, subscription.options);
    }));
  }

  _getSubscription(entryPath: string): ?WatchmanSubscription {
    return this._subscriptions.get(path.normalize(entryPath));
  }

  _setSubscription(entryPath: string, subscription: WatchmanSubscription): void {
    this._subscriptions.set(path.normalize(entryPath), subscription);
  }

  _deleteSubscription(entryPath: string): void {
    this._subscriptions.delete(path.normalize(entryPath));
  }

  _onSubscriptionResult(response: WatchmanSubscriptionResponse): void {
    const subscription = this._getSubscription(response.subscription);
    if (subscription == null) {
      logger.error('Subscription not found for response:!', response);
      return;
    }
    subscription.emit('change', response.files);
  }

  async watchDirectoryRecursive(localDirectoryPath: string): Promise<WatchmanSubscription> {
    const existingSubscription = this._getSubscription(localDirectoryPath);
    if (existingSubscription) {
      existingSubscription.subscriptionCount++;
      return existingSubscription;
    } else {
      const {
        watch: watchRoot,
        relative_path: relativePath,
      } = await this._watchProject(localDirectoryPath);
      const clock = await this._clock(watchRoot);
      const options: WatchmanSubscriptionOptions = {
        fields: ['name', 'new', 'exists', 'mode'],
        since: clock,
      };
      if (relativePath) {
        // Passing an 'undefined' expression causes an exception in fb-watchman.
        options.expression = ['dirname', relativePath];
      }
      // relativePath is undefined if watchRoot is the same as directoryPath.
      const subscription = new WatchmanSubscription(
        /*subscriptionRoot*/ watchRoot,
        /*pathFromSubscriptionRootToSubscriptionPath*/ relativePath,
        /*subscriptionPath*/ localDirectoryPath,
        /*subscriptionCount*/ 1,
        /*subscriptionOptions*/ options,
      );
      this._setSubscription(localDirectoryPath, subscription);
      await this._subscribe(watchRoot, localDirectoryPath, options);
      return subscription;
    }
  }

  hasSubscription(entryPath: string): boolean {
    return !!this._getSubscription(entryPath);
  }

  async unwatch(entryPath: string): Promise<void> {
    const subscription = this._getSubscription(entryPath);

    if (subscription == null) {
      logger.error('No watcher entity found with path:', entryPath);
      return;
    }

    if (--subscription.subscriptionCount === 0) {
      await this._unsubscribe(subscription.path, subscription.name);
      // Don't delete the watcher if there are other users for it.
      if (!subscription.pathFromSubscriptionRootToSubscriptionPath) {
        await this._deleteWatcher(entryPath);
      }
      this._deleteSubscription(entryPath);
    }
  }

  async _watchList(): Promise<Array<string>> {
    const {roots} = await this._command('watch-list');
    return roots;
  }

  _deleteWatcher(entryPath: string): Promise {
    return this._command('watch-del', entryPath);
  }

  _unsubscribe(subscriptionPath: string, subscriptionName: string): Promise {
    return this._command('unsubscribe', subscriptionPath, subscriptionName);
  }

  async _watch(directoryPath: string): Promise {
    const response = await this._command('watch', directoryPath);
    if (response.warning) {
      logger.error('watchman warning: ', response.warning);
    }
  }

  async _watchProject(directoryPath: string): Promise<any> {
    const watchmanVersion = await this._watchmanVersionPromise;
    if (!watchmanVersion || watchmanVersion < '3.1.0') {
      throw new Error('Watchman version: ' + watchmanVersion + ' does not support watch-project');
    }
    const response = await this._command('watch-project', directoryPath);
    if (response.warning) {
      logger.error('watchman warning: ', response.warning);
    }
    return response;
  }

  async _clock(directoryPath: string): Promise<string> {
    const {clock} = await this._command('clock', directoryPath);
    return clock;
  }

  async version(): Promise<string> {
    const {version} = await this._command('version');
    return version;
  }

  _subscribe(
    watchRoot: string,
    subscriptionName: ?string,
    options: WatchmanSubscriptionOptions,
  ): Promise<WatchmanSubscription> {
    return this._command('subscribe', watchRoot, subscriptionName, options);
  }

  /*
   * Promisify calls to watchman client.
   */
  _command(...args: Array<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this._clientPromise.then(client => {
        client.command(args, (error, response) =>
            error ? reject(error) : resolve(response));
      }).catch(reject);
    });
  }
}

module.exports = WatchmanClient;
