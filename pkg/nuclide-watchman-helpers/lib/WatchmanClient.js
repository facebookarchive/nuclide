Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _fbWatchman2;

function _fbWatchman() {
  return _fbWatchman2 = _interopRequireDefault(require('fb-watchman'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _path2;

function _path() {
  return _path2 = require('./path');
}

var _WatchmanSubscription2;

function _WatchmanSubscription() {
  return _WatchmanSubscription2 = _interopRequireDefault(require('./WatchmanSubscription'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();
var WATCHMAN_SETTLE_TIME_MS = 2500;

var WatchmanClient = (function () {
  function WatchmanClient() {
    var _this = this;

    _classCallCheck(this, WatchmanClient);

    this._initWatchmanClient();
    this._serializedReconnect = (0, (_commonsNodePromise2 || _commonsNodePromise()).serializeAsyncCall)(function () {
      return _this._reconnectClient();
    });
    this._subscriptions = new Map();
    this._watchmanVersionPromise = this.version();
  }

  _createClass(WatchmanClient, [{
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      var client = yield this._clientPromise;
      client.removeAllListeners(); // disable reconnection
      client.end();
    })
  }, {
    key: '_initWatchmanClient',
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      this._clientPromise = this._createClientPromise();

      var client = yield this._clientPromise;
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
      client.on('subscription', this._onSubscriptionResult.bind(this));
    })
  }, {
    key: '_createClientPromise',
    value: _asyncToGenerator(function* () {
      return new (_fbWatchman2 || _fbWatchman()).default.Client({
        watchmanBinaryPath: yield (0, (_path2 || _path()).getWatchmanBinaryPath)()
      });
    })
  }, {
    key: '_reconnectClient',
    value: _asyncToGenerator(function* () {
      logger.error('Watchman client disconnected, reconnecting a new client!');
      yield this._initWatchmanClient();
      yield this._restoreSubscriptions();
    })
  }, {
    key: '_restoreSubscriptions',
    value: _asyncToGenerator(function* () {
      var _this3 = this;

      var watchSubscriptions = Array.from(this._subscriptions.values());
      yield Promise.all(watchSubscriptions.map(_asyncToGenerator(function* (subscription) {
        yield _this3._watchProject(subscription.path);
        // We have already missed the change events from the disconnect time,
        // watchman could have died, so the last clock result is not valid.
        yield (0, (_commonsNodePromise2 || _commonsNodePromise()).sleep)(WATCHMAN_SETTLE_TIME_MS);
        // Register the subscriptions after the filesystem settles.
        subscription.options.since = yield _this3._clock(subscription.root);
        yield _this3._subscribe(subscription.root, subscription.name, subscription.options);
      })));
    })
  }, {
    key: '_getSubscription',
    value: function _getSubscription(entryPath) {
      return this._subscriptions.get((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.normalize(entryPath));
    }
  }, {
    key: '_setSubscription',
    value: function _setSubscription(entryPath, subscription) {
      this._subscriptions.set((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.normalize(entryPath), subscription);
    }
  }, {
    key: '_deleteSubscription',
    value: function _deleteSubscription(entryPath) {
      this._subscriptions.delete((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.normalize(entryPath));
    }
  }, {
    key: '_onSubscriptionResult',
    value: function _onSubscriptionResult(response) {
      var subscription = this._getSubscription(response.subscription);
      if (subscription == null) {
        logger.error('Subscription not found for response:!', response);
        return;
      }
      if (!Array.isArray(response.files)) {
        // TODO(most): use state messages to decide on when to send updates.
        var stateEnter = response['state-enter'];
        var stateLeave = response['state-leave'];
        var stateMessage = stateEnter != null ? 'Entering ' + stateEnter : 'Leaving ' + stateLeave;
        logger.info('Subscription state: ' + stateMessage);
        return;
      }
      subscription.emit('change', response.files);
    }
  }, {
    key: 'watchDirectoryRecursive',
    value: _asyncToGenerator(function* (localDirectoryPath, subscriptionName, subscriptionOptions) {
      if (subscriptionName === undefined) subscriptionName = localDirectoryPath;
      return yield* (function* () {
        var existingSubscription = this._getSubscription(subscriptionName);
        if (existingSubscription) {
          existingSubscription.subscriptionCount++;
          return existingSubscription;
        } else {
          var _ref = yield this._watchProject(localDirectoryPath);

          var watchRoot = _ref.watch;
          var relativePath = _ref.relative_path;

          var clock = yield this._clock(watchRoot);
          var options = _extends({}, subscriptionOptions, {
            fields: ['name', 'new', 'exists', 'mode'],
            since: clock
          });
          if (relativePath && !options.expression) {
            // Passing an 'undefined' expression causes an exception in fb-watchman.
            options.expression = ['dirname', relativePath];
          }
          // relativePath is undefined if watchRoot is the same as directoryPath.
          var _subscription = new (_WatchmanSubscription2 || _WatchmanSubscription()).default(
          /*subscriptionRoot*/watchRoot,
          /*pathFromSubscriptionRootToSubscriptionPath*/relativePath,
          /*subscriptionPath*/localDirectoryPath,
          /*subscriptionName*/subscriptionName,
          /*subscriptionCount*/1,
          /*subscriptionOptions*/options);
          this._setSubscription(subscriptionName, _subscription);
          yield this._subscribe(watchRoot, subscriptionName, options);
          return _subscription;
        }
      }).apply(this, arguments);
    })
  }, {
    key: 'hasSubscription',
    value: function hasSubscription(entryPath) {
      return Boolean(this._getSubscription(entryPath));
    }
  }, {
    key: 'unwatch',
    value: _asyncToGenerator(function* (entryPath) {
      var subscription = this._getSubscription(entryPath);

      if (subscription == null) {
        logger.error('No watcher entity found with path:', entryPath);
        return;
      }

      if (--subscription.subscriptionCount === 0) {
        yield this._unsubscribe(subscription.path, subscription.name);
        // Don't delete the watcher if there are other users for it.
        if (!subscription.pathFromSubscriptionRootToSubscriptionPath) {
          yield this._deleteWatcher(entryPath);
        }
        this._deleteSubscription(entryPath);
      }
    })

    /**
     * List all (watched) files in the given directory.
     * Paths will be relative.
     */
  }, {
    key: 'listFiles',
    value: _asyncToGenerator(function* (entryPath) {
      var _ref2 = yield this._watchProject(entryPath);

      var watch = _ref2.watch;
      var relative_path = _ref2.relative_path;

      var result = yield this._command('query', watch, {
        expression: ['type', 'f'], // all files
        fields: ['name'], // names only
        relative_root: relative_path
      });
      return result.files;
    })
  }, {
    key: '_watchList',
    value: _asyncToGenerator(function* () {
      var _ref3 = yield this._command('watch-list');

      var roots = _ref3.roots;

      return roots;
    })
  }, {
    key: '_deleteWatcher',
    value: function _deleteWatcher(entryPath) {
      return this._command('watch-del', entryPath);
    }
  }, {
    key: '_unsubscribe',
    value: function _unsubscribe(subscriptionPath, subscriptionName) {
      return this._command('unsubscribe', subscriptionPath, subscriptionName);
    }
  }, {
    key: '_watch',
    value: _asyncToGenerator(function* (directoryPath) {
      var response = yield this._command('watch', directoryPath);
      if (response.warning) {
        logger.error('watchman warning: ', response.warning);
      }
    })
  }, {
    key: '_watchProject',
    value: _asyncToGenerator(function* (directoryPath) {
      var watchmanVersion = yield this._watchmanVersionPromise;
      if (!watchmanVersion || watchmanVersion < '3.1.0') {
        throw new Error('Watchman version: ' + watchmanVersion + ' does not support watch-project');
      }
      var response = yield this._command('watch-project', directoryPath);
      if (response.warning) {
        logger.error('watchman warning: ', response.warning);
      }
      return response;
    })
  }, {
    key: '_clock',
    value: _asyncToGenerator(function* (directoryPath) {
      var _ref4 = yield this._command('clock', directoryPath);

      var clock = _ref4.clock;

      return clock;
    })
  }, {
    key: 'version',
    value: _asyncToGenerator(function* () {
      var _ref5 = yield this._command('version');

      var version = _ref5.version;

      return version;
    })
  }, {
    key: '_subscribe',
    value: function _subscribe(watchRoot, subscriptionName, options) {
      return this._command('subscribe', watchRoot, subscriptionName, options);
    }

    /*
     * Promisify calls to watchman client.
     */
  }, {
    key: '_command',
    value: function _command() {
      var _this4 = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return new Promise(function (resolve, reject) {
        _this4._clientPromise.then(function (client) {
          client.command(args, function (error, response) {
            return error ? reject(error) : resolve(response);
          });
        }).catch(reject);
      });
    }
  }]);

  return WatchmanClient;
})();

module.exports = WatchmanClient;