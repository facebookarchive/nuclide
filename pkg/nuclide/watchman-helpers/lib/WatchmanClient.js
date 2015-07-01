'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var watchman = require('fb-watchman');
var WatchmanSubscription = require('./WatchmanSubscription');
var {ensureTrailingSeparator} = require('nuclide-commons').paths;
var logger = require('nuclide-logging').getLogger();
var {getWatchmanBinaryPath} = require('./main');

type WatchmanSubscriptionResponse = {
  root: string;
  subscription: string;
  files: Array<FileChange>;
};

type FileChange = {
  name: string;
  new: boolean;
  exists: boolean;
  mode: number;
};

class WatchmanClient {
  constructor() {
    this._initWatchmanClient();
    this._subscriptions = {};
    this._watchmanVersionPromise = this.version();
  }

  dispose() {
    if (this._clientPromise) {
      this._clientPromise.then(client => client.end());
    }
  }

  _initWatchmanClient() {
    this._clientPromise = this._createClientPromise();
    this._clientPromise.then(client => {
      client.on('end', () => this._onClientEnd());
      client.on('error', error => logger.error('Error while talking to watchman: ', error));
      client.on('subscription', response => this._onSubscriptionResult(response));
    });
  }

  async _createClientPromise(): Promise<watchman.Client> {
    return new watchman.Client({
      watchmanBinaryPath: await getWatchmanBinaryPath(),
    });
  }

  _onClientEnd() {
    logger.warn('Watchman client ended, creating a new client!');
    this._clientPromise.then(client => {
      client.removeAllListeners('end');
      client.removeAllListeners('error');
      client.removeAllListeners('subscription');
    });
    this._initWatchmanClient();
    this._restoreSubscriptions();
  }

  async _restoreSubscriptions() {
    var watchPromises = [];
    for (var key in this._subscriptions) {
      watchPromises.push(this._subscriptions[key]);
    }
    await Promise.all(watchPromises.map(async (subscription) => {
      subscription.options.since = await this._clock(subscription.root);
      await this._watchProject(subscription.path);
      await this._subscribe(subscription.root, subscription.name, subscription.options);
    }));
  }

  _onSubscriptionResult(response: WatchmanSubscriptionResponse) {
    var subscription = this._subscriptions[response.subscription];
    if (!subscription) {
      return logger.error('Subscription not found for response:!', response);
    }
    subscription.emit('change', response.files);
  }

  async watchDirectoryRecursive(localDirectoryPath: string) : Promise<WatchmanSubscription> {
    var directoryPath = ensureTrailingSeparator(localDirectoryPath);
    var existingSubscription = this._subscriptions[directoryPath];
    if (existingSubscription) {
      existingSubscription.subscriptionCount++;
      return existingSubscription;
    } else {
      var {watch: watchRoot, relative_path: relativePath} = await this._watchProject(directoryPath);
      var clock = await this._clock(watchRoot);
      var options = {
        fields: ['name', 'new', 'exists', 'mode'],
        since: clock,
      };
      if (relativePath) {
        // Passing an 'undefined' expression causes an exception in fb-watchman.
        options.expression = ['dirname', relativePath];
      }
      // relativePath is undefined if watchRoot is the same as directoryPath.
      var subscription = this._subscriptions[directoryPath] =
          new WatchmanSubscription(
            /*subscriptionRoot*/ watchRoot,
            /*pathFromSubscriptionRootToSubscriptionPath*/ relativePath,
            /*subscriptionPath*/ directoryPath,
            /*subscriptionCount*/ 1,
            /*subscriptionOptions*/ options
          );
      await this._subscribe(watchRoot, directoryPath, options);
      return subscription;
    }
  }

  hasSubscription(entryPath: string): boolean {
    return !!this._subscriptions[entryPath];
  }

  async unwatch(entryPath: string): Promise {
    if (!this._subscriptions[entryPath]) {
      return logger.error('No watcher entity found with path:', entryPath);
    }
    var subscription = this._subscriptions[entryPath];
    if (--subscription.subscriptionCount === 0) {

      await this._unsubscribe(subscription.path, subscription.name);
      // Don't delete the watcher if there are other users for it.
      if (!subscription.pathFromSubscriptionRootToSubscriptionPath) {
        await this._deleteWatcher(entryPath);
      }
      delete this._subscriptions[entryPath];
    }
  }

  async _watchList(): Promise<Array<string>> {
    var {roots} = await this._command('watch-list');
    return roots;
  }

  _deleteWatcher(entryPath: string): Promise {
    return this._command('watch-del', entryPath);
  }

  _unsubscribe(subscriptionPath: string, subscriptionName: string) {
    return this._command('unsubscribe', subscriptionPath, subscriptionName);
  }

  async _watch(directoryPath: string): Promise {
    var response = await this._command('watch', directoryPath);
    if (response.warning) {
      logger.log('watchman warning: ', response.warning);
    }
  }

  async _watchProject(directoryPath: string): Promise<any> {
    var watchmanVersion = await this._watchmanVersionPromise;
    if (!watchmanVersion || watchmanVersion < '3.1.0') {
      throw new Error('Watchman version: ' + watchmanVersion + ' does not support watch-project');
    }
    var response = await this._command('watch-project', directoryPath);
    if (response.warning) {
      logger.log('watchman warning: ', response.warning);
    }
    return response;
  }

  async _clock(directoryPath: string): Promise<string> {
    var {clock} = await this._command('clock', directoryPath);
    return clock;
  }

  async version(): Promise<string> {
    var {version} = await this._command('version');
    return version;
  }

  _subscribe(
        watchRoot: string,
        subscriptionName: ?string,
        options: ?WatchmanSubscriptionOptions = {}
      ): Promise<WatchmanSubscription> {
    return this._command('subscribe', watchRoot, subscriptionName, options);
  }

  /*
   * Promisify calls to watchman client.
   */
  _command(...args): Promise<any> {
    return new Promise((resolve, reject) => {
      this._clientPromise.then(client => {
        client.command(args, (error, response) =>
            error ? reject(error) : resolve(response));
      }).catch(reject);
    });
  }
}

module.exports = WatchmanClient;
