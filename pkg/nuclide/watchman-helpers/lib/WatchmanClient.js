Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fbWatchman = require('fb-watchman');

var _fbWatchman2 = _interopRequireDefault(_fbWatchman);

var _commons = require('../../commons');

var _path3 = require('./path');

var _WatchmanSubscription = require('./WatchmanSubscription');

var _WatchmanSubscription2 = _interopRequireDefault(_WatchmanSubscription);

var _logging = require('../../logging');

var logger = (0, _logging.getLogger)();
var WATCHMAN_SETTLE_TIME_MS = 2500;

var WatchmanClient = (function () {
  function WatchmanClient() {
    var _this = this;

    _classCallCheck(this, WatchmanClient);

    this._initWatchmanClient();
    this._serializedReconnect = _commons.promises.serializeAsyncCall(function () {
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
      return new _fbWatchman2['default'].Client({
        watchmanBinaryPath: yield (0, _path3.getWatchmanBinaryPath)()
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

      var watchSubscriptions = _commons.array.from(this._subscriptions.values());
      yield Promise.all(watchSubscriptions.map(_asyncToGenerator(function* (subscription) {
        yield _this3._watchProject(subscription.path);
        // We have already missed the change events from the disconnect time,
        // watchman could have died, so the last clock result is not valid.
        yield _commons.promises.awaitMilliSeconds(WATCHMAN_SETTLE_TIME_MS);
        // Register the subscriptions after the filesystem settles.
        subscription.options.since = yield _this3._clock(subscription.root);
        yield _this3._subscribe(subscription.root, subscription.name, subscription.options);
      })));
    })
  }, {
    key: '_getSubscription',
    value: function _getSubscription(entryPath) {
      return this._subscriptions.get(_path2['default'].normalize(entryPath));
    }
  }, {
    key: '_setSubscription',
    value: function _setSubscription(entryPath, subscription) {
      this._subscriptions.set(_path2['default'].normalize(entryPath), subscription);
    }
  }, {
    key: '_deleteSubscription',
    value: function _deleteSubscription(entryPath) {
      this._subscriptions['delete'](_path2['default'].normalize(entryPath));
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
          var options = _commons.object.assign({
            fields: ['name', 'new', 'exists', 'mode'],
            since: clock
          }, subscriptionOptions || {});
          if (relativePath && !options.expression) {
            // Passing an 'undefined' expression causes an exception in fb-watchman.
            options.expression = ['dirname', relativePath];
          }
          // relativePath is undefined if watchRoot is the same as directoryPath.
          var _subscription = new _WatchmanSubscription2['default'](
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
      return !!this._getSubscription(entryPath);
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
        relative_root: relative_path,
        // Do not wait for Watchman to sync. We can subscribe to updates for this.
        sync_timeout: 0
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
        })['catch'](reject);
      });
    }
  }]);

  return WatchmanClient;
})();

module.exports = WatchmanClient;
//# sourceMappingURL=data:application/json;base64,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QUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUN0RDtBQUNELGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7NkJBRVcsV0FBQyxhQUFxQixFQUFtQjtrQkFDbkMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUM7O1VBQXBELEtBQUssU0FBTCxLQUFLOztBQUNaLGFBQU8sS0FBSyxDQUFDO0tBQ2Q7Ozs2QkFFWSxhQUFvQjtrQkFDYixNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDOztVQUF6QyxPQUFPLFNBQVAsT0FBTzs7QUFDZCxhQUFPLE9BQU8sQ0FBQztLQUNoQjs7O1dBRVMsb0JBQ1IsU0FBaUIsRUFDakIsZ0JBQXlCLEVBQ3pCLE9BQW9DLEVBQ0w7QUFDL0IsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDekU7Ozs7Ozs7V0FLTyxvQkFBb0M7Ozt3Q0FBaEMsSUFBSTtBQUFKLFlBQUk7OztBQUNkLGFBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLGVBQUssY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUNqQyxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsVUFBQyxLQUFLLEVBQUUsUUFBUTttQkFDakMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1dBQUEsQ0FBQyxDQUFDO1NBQ2hELENBQUMsU0FBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ2xCLENBQUMsQ0FBQztLQUNKOzs7U0E1T0csY0FBYzs7O0FBK09wQixNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJXYXRjaG1hbkNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHdhdGNobWFuIGZyb20gJ2ZiLXdhdGNobWFuJztcbmltcG9ydCB7b2JqZWN0LCBhcnJheSwgcHJvbWlzZXN9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtnZXRXYXRjaG1hbkJpbmFyeVBhdGh9IGZyb20gJy4vcGF0aCc7XG5pbXBvcnQgV2F0Y2htYW5TdWJzY3JpcHRpb24gZnJvbSAnLi9XYXRjaG1hblN1YnNjcmlwdGlvbic7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuY29uc3QgV0FUQ0hNQU5fU0VUVExFX1RJTUVfTVMgPSAyNTAwO1xuXG5pbXBvcnQgdHlwZSB7V2F0Y2htYW5TdWJzY3JpcHRpb25PcHRpb25zfSBmcm9tICcuL1dhdGNobWFuU3Vic2NyaXB0aW9uJztcblxudHlwZSBXYXRjaG1hblN1YnNjcmlwdGlvblJlc3BvbnNlID0ge1xuICByb290OiBzdHJpbmc7XG4gIHN1YnNjcmlwdGlvbjogc3RyaW5nO1xuICBmaWxlcz86IEFycmF5PEZpbGVDaGFuZ2U+O1xuICAnc3RhdGUtZW50ZXInPzogc3RyaW5nO1xuICAnc3RhdGUtbGVhdmUnPzogc3RyaW5nO1xuICBtZXRhZGF0YT86IE9iamVjdDtcbn07XG5cbmV4cG9ydCB0eXBlIEZpbGVDaGFuZ2UgPSB7XG4gIG5hbWU6IHN0cmluZztcbiAgbmV3OiBib29sZWFuO1xuICBleGlzdHM6IGJvb2xlYW47XG4gIG1vZGU6IG51bWJlcjtcbn07XG5cbmNsYXNzIFdhdGNobWFuQ2xpZW50IHtcbiAgX3N1YnNjcmlwdGlvbnM6IE1hcDxzdHJpbmcsIFdhdGNobWFuU3Vic2NyaXB0aW9uPjtcbiAgX2NsaWVudFByb21pc2U6IFByb21pc2U8d2F0Y2htYW4uQ2xpZW50PjtcbiAgX3dhdGNobWFuVmVyc2lvblByb21pc2U6IFByb21pc2U8c3RyaW5nPjtcbiAgX3NlcmlhbGl6ZWRSZWNvbm5lY3Q6ICgpID0+IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5faW5pdFdhdGNobWFuQ2xpZW50KCk7XG4gICAgdGhpcy5fc2VyaWFsaXplZFJlY29ubmVjdCA9IHByb21pc2VzLnNlcmlhbGl6ZUFzeW5jQ2FsbCgoKSA9PiB0aGlzLl9yZWNvbm5lY3RDbGllbnQoKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl93YXRjaG1hblZlcnNpb25Qcm9taXNlID0gdGhpcy52ZXJzaW9uKCk7XG4gIH1cblxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IHRoaXMuX2NsaWVudFByb21pc2U7XG4gICAgY2xpZW50LnJlbW92ZUFsbExpc3RlbmVycygpOyAvLyBkaXNhYmxlIHJlY29ubmVjdGlvblxuICAgIGNsaWVudC5lbmQoKTtcbiAgfVxuXG4gIGFzeW5jIF9pbml0V2F0Y2htYW5DbGllbnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fY2xpZW50UHJvbWlzZSA9IHRoaXMuX2NyZWF0ZUNsaWVudFByb21pc2UoKTtcblxuICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IHRoaXMuX2NsaWVudFByb21pc2U7XG4gICAgY2xpZW50Lm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICBjbGllbnQucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgICB0aGlzLl9zZXJpYWxpemVkUmVjb25uZWN0KCk7XG4gICAgfSk7XG4gICAgY2xpZW50Lm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIGxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgdGFsa2luZyB0byB3YXRjaG1hbjogJywgZXJyb3IpO1xuICAgICAgLy8gSWYgV2F0Y2htYW4gZW5jb3VudGVycyBhbiBlcnJvciBpbiB0aGUgbWlkZGxlIG9mIGEgY29tbWFuZCwgaXQgbWF5IG5ldmVyIGZpbmlzaCFcbiAgICAgIC8vIFRoZSBjbGllbnQgbXVzdCBiZSBpbW1lZGlhdGVseSBraWxsZWQgaGVyZSBzbyB0aGF0IHRoZSBjb21tYW5kIGZhaWxzIGFuZFxuICAgICAgLy8gYHNlcmlhbGl6ZUFzeW5jQ2FsbGAgY2FuIGJlIHVuYmxvY2tlZC4gT3RoZXJ3aXNlLCB3ZSBlbmQgdXAgaW4gYSBkZWFkbG9jay5cbiAgICAgIGNsaWVudC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICAgIGNsaWVudC5lbmQoKTtcbiAgICAgIC8vIFRob3NlIGFyZSBlcnJvcnMgaW4gZGVzZXJpYWxpemluZyBhIHN0cmVhbSBvZiBjaGFuZ2VzLlxuICAgICAgLy8gVGhlIG9ubHkgcG9zc2libGUgcmVjb3ZlcnkgaGVyZSBpcyByZWNvbm5lY3RpbmcgYSBuZXcgY2xpZW50LFxuICAgICAgLy8gYnV0IHRoZSBmYWlsZWQgdG8gc2VyaWFsaXplIGV2ZW50cyB3aWxsIGJlIG1pc3NlZC5cbiAgICAgIC8vIHQ5MzUzODc4XG4gICAgICB0aGlzLl9zZXJpYWxpemVkUmVjb25uZWN0KCk7XG4gICAgfSk7XG4gICAgY2xpZW50Lm9uKCdzdWJzY3JpcHRpb24nLCB0aGlzLl9vblN1YnNjcmlwdGlvblJlc3VsdC5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGFzeW5jIF9jcmVhdGVDbGllbnRQcm9taXNlKCk6IFByb21pc2U8d2F0Y2htYW4uQ2xpZW50PiB7XG4gICAgcmV0dXJuIG5ldyB3YXRjaG1hbi5DbGllbnQoe1xuICAgICAgd2F0Y2htYW5CaW5hcnlQYXRoOiBhd2FpdCBnZXRXYXRjaG1hbkJpbmFyeVBhdGgoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9yZWNvbm5lY3RDbGllbnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmVycm9yKCdXYXRjaG1hbiBjbGllbnQgZGlzY29ubmVjdGVkLCByZWNvbm5lY3RpbmcgYSBuZXcgY2xpZW50IScpO1xuICAgIGF3YWl0IHRoaXMuX2luaXRXYXRjaG1hbkNsaWVudCgpO1xuICAgIGF3YWl0IHRoaXMuX3Jlc3RvcmVTdWJzY3JpcHRpb25zKCk7XG4gIH1cblxuICBhc3luYyBfcmVzdG9yZVN1YnNjcmlwdGlvbnMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgd2F0Y2hTdWJzY3JpcHRpb25zID0gYXJyYXkuZnJvbSh0aGlzLl9zdWJzY3JpcHRpb25zLnZhbHVlcygpKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbCh3YXRjaFN1YnNjcmlwdGlvbnMubWFwKGFzeW5jIChzdWJzY3JpcHRpb246IFdhdGNobWFuU3Vic2NyaXB0aW9uKSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLl93YXRjaFByb2plY3Qoc3Vic2NyaXB0aW9uLnBhdGgpO1xuICAgICAgLy8gV2UgaGF2ZSBhbHJlYWR5IG1pc3NlZCB0aGUgY2hhbmdlIGV2ZW50cyBmcm9tIHRoZSBkaXNjb25uZWN0IHRpbWUsXG4gICAgICAvLyB3YXRjaG1hbiBjb3VsZCBoYXZlIGRpZWQsIHNvIHRoZSBsYXN0IGNsb2NrIHJlc3VsdCBpcyBub3QgdmFsaWQuXG4gICAgICBhd2FpdCBwcm9taXNlcy5hd2FpdE1pbGxpU2Vjb25kcyhXQVRDSE1BTl9TRVRUTEVfVElNRV9NUyk7XG4gICAgICAvLyBSZWdpc3RlciB0aGUgc3Vic2NyaXB0aW9ucyBhZnRlciB0aGUgZmlsZXN5c3RlbSBzZXR0bGVzLlxuICAgICAgc3Vic2NyaXB0aW9uLm9wdGlvbnMuc2luY2UgPSBhd2FpdCB0aGlzLl9jbG9jayhzdWJzY3JpcHRpb24ucm9vdCk7XG4gICAgICBhd2FpdCB0aGlzLl9zdWJzY3JpYmUoc3Vic2NyaXB0aW9uLnJvb3QsIHN1YnNjcmlwdGlvbi5uYW1lLCBzdWJzY3JpcHRpb24ub3B0aW9ucyk7XG4gICAgfSkpO1xuICB9XG5cbiAgX2dldFN1YnNjcmlwdGlvbihlbnRyeVBhdGg6IHN0cmluZyk6ID9XYXRjaG1hblN1YnNjcmlwdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N1YnNjcmlwdGlvbnMuZ2V0KHBhdGgubm9ybWFsaXplKGVudHJ5UGF0aCkpO1xuICB9XG5cbiAgX3NldFN1YnNjcmlwdGlvbihlbnRyeVBhdGg6IHN0cmluZywgc3Vic2NyaXB0aW9uOiBXYXRjaG1hblN1YnNjcmlwdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuc2V0KHBhdGgubm9ybWFsaXplKGVudHJ5UGF0aCksIHN1YnNjcmlwdGlvbik7XG4gIH1cblxuICBfZGVsZXRlU3Vic2NyaXB0aW9uKGVudHJ5UGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kZWxldGUocGF0aC5ub3JtYWxpemUoZW50cnlQYXRoKSk7XG4gIH1cblxuICBfb25TdWJzY3JpcHRpb25SZXN1bHQocmVzcG9uc2U6IFdhdGNobWFuU3Vic2NyaXB0aW9uUmVzcG9uc2UpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9nZXRTdWJzY3JpcHRpb24ocmVzcG9uc2Uuc3Vic2NyaXB0aW9uKTtcbiAgICBpZiAoc3Vic2NyaXB0aW9uID09IG51bGwpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignU3Vic2NyaXB0aW9uIG5vdCBmb3VuZCBmb3IgcmVzcG9uc2U6IScsIHJlc3BvbnNlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc3BvbnNlLmZpbGVzKSkge1xuICAgICAgLy8gVE9ETyhtb3N0KTogdXNlIHN0YXRlIG1lc3NhZ2VzIHRvIGRlY2lkZSBvbiB3aGVuIHRvIHNlbmQgdXBkYXRlcy5cbiAgICAgIGNvbnN0IHN0YXRlRW50ZXIgPSByZXNwb25zZVsnc3RhdGUtZW50ZXInXTtcbiAgICAgIGNvbnN0IHN0YXRlTGVhdmUgPSByZXNwb25zZVsnc3RhdGUtbGVhdmUnXTtcbiAgICAgIGNvbnN0IHN0YXRlTWVzc2FnZSA9IHN0YXRlRW50ZXIgIT0gbnVsbFxuICAgICAgICA/IGBFbnRlcmluZyAke3N0YXRlRW50ZXJ9YFxuICAgICAgICA6IGBMZWF2aW5nICR7c3RhdGVMZWF2ZX1gXG4gICAgICA7XG4gICAgICBsb2dnZXIuaW5mbyhgU3Vic2NyaXB0aW9uIHN0YXRlOiAke3N0YXRlTWVzc2FnZX1gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3Vic2NyaXB0aW9uLmVtaXQoJ2NoYW5nZScsIHJlc3BvbnNlLmZpbGVzKTtcbiAgfVxuXG4gIGFzeW5jIHdhdGNoRGlyZWN0b3J5UmVjdXJzaXZlKFxuICAgIGxvY2FsRGlyZWN0b3J5UGF0aDogc3RyaW5nLFxuICAgIHN1YnNjcmlwdGlvbk5hbWU/OiBzdHJpbmcgPSBsb2NhbERpcmVjdG9yeVBhdGgsXG4gICAgc3Vic2NyaXB0aW9uT3B0aW9ucz86IFdhdGNobWFuU3Vic2NyaXB0aW9uT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxXYXRjaG1hblN1YnNjcmlwdGlvbj4ge1xuICAgIGNvbnN0IGV4aXN0aW5nU3Vic2NyaXB0aW9uID0gdGhpcy5fZ2V0U3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbk5hbWUpO1xuICAgIGlmIChleGlzdGluZ1N1YnNjcmlwdGlvbikge1xuICAgICAgZXhpc3RpbmdTdWJzY3JpcHRpb24uc3Vic2NyaXB0aW9uQ291bnQrKztcbiAgICAgIHJldHVybiBleGlzdGluZ1N1YnNjcmlwdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qge1xuICAgICAgICB3YXRjaDogd2F0Y2hSb290LFxuICAgICAgICByZWxhdGl2ZV9wYXRoOiByZWxhdGl2ZVBhdGgsXG4gICAgICB9ID0gYXdhaXQgdGhpcy5fd2F0Y2hQcm9qZWN0KGxvY2FsRGlyZWN0b3J5UGF0aCk7XG4gICAgICBjb25zdCBjbG9jayA9IGF3YWl0IHRoaXMuX2Nsb2NrKHdhdGNoUm9vdCk7XG4gICAgICBjb25zdCBvcHRpb25zOiBXYXRjaG1hblN1YnNjcmlwdGlvbk9wdGlvbnMgPSBvYmplY3QuYXNzaWduKHtcbiAgICAgICAgZmllbGRzOiBbJ25hbWUnLCAnbmV3JywgJ2V4aXN0cycsICdtb2RlJ10sXG4gICAgICAgIHNpbmNlOiBjbG9jayxcbiAgICAgIH0sIHN1YnNjcmlwdGlvbk9wdGlvbnMgfHwge30pO1xuICAgICAgaWYgKHJlbGF0aXZlUGF0aCAmJiAhb3B0aW9ucy5leHByZXNzaW9uKSB7XG4gICAgICAgIC8vIFBhc3NpbmcgYW4gJ3VuZGVmaW5lZCcgZXhwcmVzc2lvbiBjYXVzZXMgYW4gZXhjZXB0aW9uIGluIGZiLXdhdGNobWFuLlxuICAgICAgICBvcHRpb25zLmV4cHJlc3Npb24gPSBbJ2Rpcm5hbWUnLCByZWxhdGl2ZVBhdGhdO1xuICAgICAgfVxuICAgICAgLy8gcmVsYXRpdmVQYXRoIGlzIHVuZGVmaW5lZCBpZiB3YXRjaFJvb3QgaXMgdGhlIHNhbWUgYXMgZGlyZWN0b3J5UGF0aC5cbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IG5ldyBXYXRjaG1hblN1YnNjcmlwdGlvbihcbiAgICAgICAgLypzdWJzY3JpcHRpb25Sb290Ki8gd2F0Y2hSb290LFxuICAgICAgICAvKnBhdGhGcm9tU3Vic2NyaXB0aW9uUm9vdFRvU3Vic2NyaXB0aW9uUGF0aCovIHJlbGF0aXZlUGF0aCxcbiAgICAgICAgLypzdWJzY3JpcHRpb25QYXRoKi8gbG9jYWxEaXJlY3RvcnlQYXRoLFxuICAgICAgICAvKnN1YnNjcmlwdGlvbk5hbWUqLyBzdWJzY3JpcHRpb25OYW1lLFxuICAgICAgICAvKnN1YnNjcmlwdGlvbkNvdW50Ki8gMSxcbiAgICAgICAgLypzdWJzY3JpcHRpb25PcHRpb25zKi8gb3B0aW9ucyxcbiAgICAgICk7XG4gICAgICB0aGlzLl9zZXRTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uTmFtZSwgc3Vic2NyaXB0aW9uKTtcbiAgICAgIGF3YWl0IHRoaXMuX3N1YnNjcmliZSh3YXRjaFJvb3QsIHN1YnNjcmlwdGlvbk5hbWUsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbjtcbiAgICB9XG4gIH1cblxuICBoYXNTdWJzY3JpcHRpb24oZW50cnlQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl9nZXRTdWJzY3JpcHRpb24oZW50cnlQYXRoKTtcbiAgfVxuXG4gIGFzeW5jIHVud2F0Y2goZW50cnlQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9nZXRTdWJzY3JpcHRpb24oZW50cnlQYXRoKTtcblxuICAgIGlmIChzdWJzY3JpcHRpb24gPT0gbnVsbCkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdObyB3YXRjaGVyIGVudGl0eSBmb3VuZCB3aXRoIHBhdGg6JywgZW50cnlQYXRoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoLS1zdWJzY3JpcHRpb24uc3Vic2NyaXB0aW9uQ291bnQgPT09IDApIHtcbiAgICAgIGF3YWl0IHRoaXMuX3Vuc3Vic2NyaWJlKHN1YnNjcmlwdGlvbi5wYXRoLCBzdWJzY3JpcHRpb24ubmFtZSk7XG4gICAgICAvLyBEb24ndCBkZWxldGUgdGhlIHdhdGNoZXIgaWYgdGhlcmUgYXJlIG90aGVyIHVzZXJzIGZvciBpdC5cbiAgICAgIGlmICghc3Vic2NyaXB0aW9uLnBhdGhGcm9tU3Vic2NyaXB0aW9uUm9vdFRvU3Vic2NyaXB0aW9uUGF0aCkge1xuICAgICAgICBhd2FpdCB0aGlzLl9kZWxldGVXYXRjaGVyKGVudHJ5UGF0aCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9kZWxldGVTdWJzY3JpcHRpb24oZW50cnlQYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGlzdCBhbGwgKHdhdGNoZWQpIGZpbGVzIGluIHRoZSBnaXZlbiBkaXJlY3RvcnkuXG4gICAqIFBhdGhzIHdpbGwgYmUgcmVsYXRpdmUuXG4gICAqL1xuICBhc3luYyBsaXN0RmlsZXMoZW50cnlQYXRoOiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgICBjb25zdCB7d2F0Y2gsIHJlbGF0aXZlX3BhdGh9ID0gYXdhaXQgdGhpcy5fd2F0Y2hQcm9qZWN0KGVudHJ5UGF0aCk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fY29tbWFuZCgncXVlcnknLCB3YXRjaCwge1xuICAgICAgZXhwcmVzc2lvbjogWyd0eXBlJywgJ2YnXSwgLy8gYWxsIGZpbGVzXG4gICAgICBmaWVsZHM6IFsnbmFtZSddLCAgICAgICAgICAvLyBuYW1lcyBvbmx5XG4gICAgICByZWxhdGl2ZV9yb290OiByZWxhdGl2ZV9wYXRoLFxuICAgICAgLy8gRG8gbm90IHdhaXQgZm9yIFdhdGNobWFuIHRvIHN5bmMuIFdlIGNhbiBzdWJzY3JpYmUgdG8gdXBkYXRlcyBmb3IgdGhpcy5cbiAgICAgIHN5bmNfdGltZW91dDogMCxcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0LmZpbGVzO1xuICB9XG5cbiAgYXN5bmMgX3dhdGNoTGlzdCgpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgICBjb25zdCB7cm9vdHN9ID0gYXdhaXQgdGhpcy5fY29tbWFuZCgnd2F0Y2gtbGlzdCcpO1xuICAgIHJldHVybiByb290cztcbiAgfVxuXG4gIF9kZWxldGVXYXRjaGVyKGVudHJ5UGF0aDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1hbmQoJ3dhdGNoLWRlbCcsIGVudHJ5UGF0aCk7XG4gIH1cblxuICBfdW5zdWJzY3JpYmUoc3Vic2NyaXB0aW9uUGF0aDogc3RyaW5nLCBzdWJzY3JpcHRpb25OYW1lOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fY29tbWFuZCgndW5zdWJzY3JpYmUnLCBzdWJzY3JpcHRpb25QYXRoLCBzdWJzY3JpcHRpb25OYW1lKTtcbiAgfVxuXG4gIGFzeW5jIF93YXRjaChkaXJlY3RvcnlQYXRoOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NvbW1hbmQoJ3dhdGNoJywgZGlyZWN0b3J5UGF0aCk7XG4gICAgaWYgKHJlc3BvbnNlLndhcm5pbmcpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignd2F0Y2htYW4gd2FybmluZzogJywgcmVzcG9uc2Uud2FybmluZyk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3dhdGNoUHJvamVjdChkaXJlY3RvcnlQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHdhdGNobWFuVmVyc2lvbiA9IGF3YWl0IHRoaXMuX3dhdGNobWFuVmVyc2lvblByb21pc2U7XG4gICAgaWYgKCF3YXRjaG1hblZlcnNpb24gfHwgd2F0Y2htYW5WZXJzaW9uIDwgJzMuMS4wJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdXYXRjaG1hbiB2ZXJzaW9uOiAnICsgd2F0Y2htYW5WZXJzaW9uICsgJyBkb2VzIG5vdCBzdXBwb3J0IHdhdGNoLXByb2plY3QnKTtcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jb21tYW5kKCd3YXRjaC1wcm9qZWN0JywgZGlyZWN0b3J5UGF0aCk7XG4gICAgaWYgKHJlc3BvbnNlLndhcm5pbmcpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignd2F0Y2htYW4gd2FybmluZzogJywgcmVzcG9uc2Uud2FybmluZyk7XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfVxuXG4gIGFzeW5jIF9jbG9jayhkaXJlY3RvcnlQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtjbG9ja30gPSBhd2FpdCB0aGlzLl9jb21tYW5kKCdjbG9jaycsIGRpcmVjdG9yeVBhdGgpO1xuICAgIHJldHVybiBjbG9jaztcbiAgfVxuXG4gIGFzeW5jIHZlcnNpb24oKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7dmVyc2lvbn0gPSBhd2FpdCB0aGlzLl9jb21tYW5kKCd2ZXJzaW9uJyk7XG4gICAgcmV0dXJuIHZlcnNpb247XG4gIH1cblxuICBfc3Vic2NyaWJlKFxuICAgIHdhdGNoUm9vdDogc3RyaW5nLFxuICAgIHN1YnNjcmlwdGlvbk5hbWU6ID9zdHJpbmcsXG4gICAgb3B0aW9uczogV2F0Y2htYW5TdWJzY3JpcHRpb25PcHRpb25zLFxuICApOiBQcm9taXNlPFdhdGNobWFuU3Vic2NyaXB0aW9uPiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1hbmQoJ3N1YnNjcmliZScsIHdhdGNoUm9vdCwgc3Vic2NyaXB0aW9uTmFtZSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKlxuICAgKiBQcm9taXNpZnkgY2FsbHMgdG8gd2F0Y2htYW4gY2xpZW50LlxuICAgKi9cbiAgX2NvbW1hbmQoLi4uYXJnczogQXJyYXk8YW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2NsaWVudFByb21pc2UudGhlbihjbGllbnQgPT4ge1xuICAgICAgICBjbGllbnQuY29tbWFuZChhcmdzLCAoZXJyb3IsIHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZShyZXNwb25zZSkpO1xuICAgICAgfSkuY2F0Y2gocmVqZWN0KTtcbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdhdGNobWFuQ2xpZW50O1xuIl19