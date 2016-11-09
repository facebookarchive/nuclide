'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _fbWatchman;

function _load_fbWatchman() {
  return _fbWatchman = _interopRequireDefault(require('fb-watchman'));
}

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _path;

function _load_path() {
  return _path = require('./path');
}

var _WatchmanSubscription;

function _load_WatchmanSubscription() {
  return _WatchmanSubscription = _interopRequireDefault(require('./WatchmanSubscription'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();
const WATCHMAN_SETTLE_TIME_MS = 2500;

let WatchmanClient = class WatchmanClient {

  constructor() {
    this._initWatchmanClient();
    this._serializedReconnect = (0, (_promise || _load_promise()).serializeAsyncCall)(() => this._reconnectClient());
    this._subscriptions = new Map();
    this._watchmanVersionPromise = this.version();
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
        logger.info(`Watch for ${ response.root } was deleted.`);
        // Ending the client will trigger a reconnect.
        this._clientPromise.then(client => client.end());
        return;
      }
      // TODO(most): use state messages to decide on when to send updates.
      const stateEnter = response['state-enter'];
      const stateLeave = response['state-leave'];
      const stateMessage = stateEnter != null ? `Entering ${ stateEnter }` : `Leaving ${ (0, (_string || _load_string()).maybeToString)(stateLeave) }`;
      logger.info(`Subscription state: ${ stateMessage }`);
      return;
    }
    subscription.emit('change', response.files);
  }

  watchDirectoryRecursive(localDirectoryPath) {
    var _arguments = arguments,
        _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let subscriptionName = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : localDirectoryPath;
      let subscriptionOptions = _arguments[2];

      const existingSubscription = _this5._getSubscription(subscriptionName);
      if (existingSubscription) {
        existingSubscription.subscriptionCount++;
        return existingSubscription;
      } else {
        var _ref2 = yield _this5._watchProject(localDirectoryPath);

        const watchRoot = _ref2.watch,
              relativePath = _ref2.relative_path;

        const clock = yield _this5._clock(watchRoot);
        const options = Object.assign({}, subscriptionOptions, {
          fields: ['name', 'new', 'exists', 'mode'],
          since: clock
        });
        if (relativePath && !options.expression) {
          // Passing an 'undefined' expression causes an exception in fb-watchman.
          options.expression = ['dirname', relativePath];
        }
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
  listFiles(entryPath) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      var _ref3 = yield _this7._watchProject(entryPath);

      const watch = _ref3.watch,
            relative_path = _ref3.relative_path;

      const result = yield _this7._command('query', watch, {
        expression: ['type', 'f'], // all files
        fields: ['name'], // names only
        relative_root: relative_path
      });
      return result.files;
    })();
  }

  _watchList() {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      var _ref4 = yield _this8._command('watch-list');

      const roots = _ref4.roots;

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
      const watchmanVersion = yield _this10._watchmanVersionPromise;
      if (!watchmanVersion || watchmanVersion < '3.1.0') {
        throw new Error('Watchman version: ' + watchmanVersion + ' does not support watch-project');
      }
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
      var _ref5 = yield _this11._command('clock', directoryPath);

      const clock = _ref5.clock;

      return clock;
    })();
  }

  version() {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      var _ref6 = yield _this12._command('version');

      const version = _ref6.version;

      return version;
    })();
  }

  _subscribe(watchRoot, subscriptionName, options) {
    return this._command('subscribe', watchRoot, subscriptionName, options);
  }

  /*
   * Promisify calls to watchman client.
   */
  _command() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Promise((resolve, reject) => {
      this._clientPromise.then(client => {
        client.command(args, (error, response) => error ? reject(error) : resolve(response));
      }).catch(reject);
    });
  }
};


module.exports = WatchmanClient;