'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _fbWatchman;

function _load_fbWatchman() {
  return _fbWatchman = _interopRequireDefault(require('fb-watchman'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _path;

function _load_path() {
  return _path = require('./path');
}

var _WatchmanSubscription;

function _load_WatchmanSubscription() {
  return _WatchmanSubscription = _interopRequireDefault(require('./WatchmanSubscription'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-watchman-helpers'); /**
                                                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                                                        * All rights reserved.
                                                                                        *
                                                                                        * This source code is licensed under the license found in the LICENSE file in
                                                                                        * the root directory of this source tree.
                                                                                        *
                                                                                        * 
                                                                                        * @format
                                                                                        */

const WATCHMAN_SETTLE_TIME_MS = 2500;

class WatchmanClient {

  constructor() {
    this._initWatchmanClient();
    this._serializedReconnect = (0, (_promise || _load_promise()).serializeAsyncCall)(() => this._reconnectClient());
    this._subscriptions = new Map();
  }

  dispose() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const client = yield _this._clientPromise;
      client.removeAllListeners(); // disable reconnection
      client.end();
    })();
  }

  _initWatchmanClient() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this2._clientPromise = _this2._createClientPromise();

      const client = yield _this2._clientPromise;
      client.on('end', function () {
        logger.info('Watchman client ended');
        client.removeAllListeners();
        _this2._serializedReconnect();
      });
      client.on('error', function (error) {
        logger.error('Error while talking to watchman: ', error);
        // If Watchman encounters an error in the middle of a command, it may never finish!
        // The client must be immediately killed here so that the command fails and
        // `serializeAsyncCall` can be unblocked. Otherwise, we end up in a deadlock.
        client.removeAllListeners();
        client.end();
        // Those are errors in deserializing a stream of changes.
        // The only possible recovery here is reconnecting a new client,
        // but the failed to serialize events will be missed.
        // t9353878
        _this2._serializedReconnect();
      });
      client.on('subscription', _this2._onSubscriptionResult.bind(_this2));
    })();
  }

  _createClientPromise() {
    return (0, _asyncToGenerator.default)(function* () {
      return new (_fbWatchman || _load_fbWatchman()).default.Client({
        watchmanBinaryPath: yield (0, (_path || _load_path()).getWatchmanBinaryPath)()
      });
    })();
  }

  _reconnectClient() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      logger.error('Watchman client disconnected, reconnecting a new client!');
      yield _this3._initWatchmanClient();
      logger.info('Watchman client re-initialized, restoring subscriptions');
      yield _this3._restoreSubscriptions();
    })();
  }

  _restoreSubscriptions() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const watchSubscriptions = Array.from(_this4._subscriptions.values());
      yield Promise.all(watchSubscriptions.map((() => {
        var _ref = (0, _asyncToGenerator.default)(function* (subscription) {
          yield _this4._watchProject(subscription.path);
          // We have already missed the change events from the disconnect time,
          // watchman could have died, so the last clock result is not valid.
          yield (0, (_promise || _load_promise()).sleep)(WATCHMAN_SETTLE_TIME_MS);
          // Register the subscriptions after the filesystem settles.
          subscription.options.since = yield _this4._clock(subscription.root);
          yield _this4._subscribe(subscription.root, subscription.name, subscription.options);
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })()));
    })();
  }

  _getSubscription(entryPath) {
    return this._subscriptions.get((_nuclideUri || _load_nuclideUri()).default.normalize(entryPath));
  }

  _setSubscription(entryPath, subscription) {
    this._subscriptions.set((_nuclideUri || _load_nuclideUri()).default.normalize(entryPath), subscription);
  }

  _deleteSubscription(entryPath) {
    this._subscriptions.delete((_nuclideUri || _load_nuclideUri()).default.normalize(entryPath));
  }

  _onSubscriptionResult(response) {
    const subscription = this._getSubscription(response.subscription);
    if (subscription == null) {
      logger.error('Subscription not found for response:!', response);
      return;
    }
    if (!Array.isArray(response.files)) {
      if (response.canceled === true) {
        logger.info(`Watch for ${response.root} was deleted.`);
        // Ending the client will trigger a reconnect.
        this._clientPromise.then(client => client.end());
        return;
      }
      // TODO(most): use state messages to decide on when to send updates.
      const stateEnter = response['state-enter'];
      const stateLeave = response['state-leave'];
      const stateMessage = stateEnter != null ? `Entering ${stateEnter}` : `Leaving ${(0, (_string || _load_string()).maybeToString)(stateLeave)}`;
      logger.info(`Subscription state: ${stateMessage}`);
      return;
    }
    subscription.emit('change', response.files);
  }

  watchDirectoryRecursive(localDirectoryPath, subscriptionName = localDirectoryPath, subscriptionOptions) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const existingSubscription = _this5._getSubscription(subscriptionName);
      if (existingSubscription) {
        existingSubscription.subscriptionCount++;
        return existingSubscription;
      } else {
        const {
          watch: watchRoot,
          relative_path: relativePath
        } = yield _this5._watchProject(localDirectoryPath);
        const clock = yield _this5._clock(watchRoot);
        const options = Object.assign({}, subscriptionOptions, {
          fields: ['name', 'new', 'exists', 'mode'],
          since: clock
        });
        if (relativePath && !options.expression) {
          options.relative_root = relativePath;
        }
        // Try this thing out where we always set empty_on_fresh_instance. Eden will be a lot happier
        // if we never ask Watchman to do something that results in a glob(**) near the root.
        options.empty_on_fresh_instance = true;

        // relativePath is undefined if watchRoot is the same as directoryPath.
        const subscription = new (_WatchmanSubscription || _load_WatchmanSubscription()).default(
        /* subscriptionRoot */watchRoot,
        /* pathFromSubscriptionRootToSubscriptionPath */relativePath,
        /* subscriptionPath */localDirectoryPath,
        /* subscriptionName */subscriptionName,
        /* subscriptionCount */1,
        /* subscriptionOptions */options);
        _this5._setSubscription(subscriptionName, subscription);
        yield _this5._subscribe(watchRoot, subscriptionName, options);
        return subscription;
      }
    })();
  }

  hasSubscription(entryPath) {
    return Boolean(this._getSubscription(entryPath));
  }

  unwatch(entryPath) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const subscription = _this6._getSubscription(entryPath);

      if (subscription == null) {
        logger.error('No watcher entity found with path:', entryPath);
        return;
      }

      if (--subscription.subscriptionCount === 0) {
        yield _this6._unsubscribe(subscription.path, subscription.name);
        _this6._deleteSubscription(entryPath);
      }
    })();
  }

  /**
   * List all (watched) files in the given directory.
   * Paths will be relative.
   */
  listFiles(entryPath, options = {}) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { watch, relative_path } = yield _this7._watchProject(entryPath);
      const result = yield _this7._command('query', watch, Object.assign({
        expression: ['allof', ['type', 'f'], // all files
        ['exists']],
        // Providing `path` will let watchman use path generator, and will perform
        // a tree walk with respect to the relative_root and path provided.
        // Path generator will do less work unless the root path of the repository
        // is passed in as an entry path.
        path: [''],
        fields: ['name'], // names only
        relative_root: relative_path
      }, options));
      return result.files;
    })();
  }

  _watchList() {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { roots } = yield _this8._command('watch-list');
      return roots;
    })();
  }

  _unsubscribe(subscriptionPath, subscriptionName) {
    return this._command('unsubscribe', subscriptionPath, subscriptionName);
  }

  _watch(directoryPath) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this9._command('watch', directoryPath);
      if (response.warning) {
        logger.error('watchman warning: ', response.warning);
      }
    })();
  }

  _watchProject(directoryPath) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this10._command('watch-project', directoryPath);
      if (response.warning) {
        logger.error('watchman warning: ', response.warning);
      }
      return response;
    })();
  }

  _clock(directoryPath) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { clock } = yield _this11._command('clock', directoryPath);
      return clock;
    })();
  }

  _subscribe(watchRoot, subscriptionName, options) {
    return this._command('subscribe', watchRoot, subscriptionName, options);
  }

  /*
   * Promisify calls to watchman client.
   */
  _command(...args) {
    return new Promise((resolve, reject) => {
      this._clientPromise.then(client => {
        client.command(args, (error, response) => error ? reject(error) : resolve(response));
      }).catch(reject);
    });
  }
}
exports.default = WatchmanClient;