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
//# sourceMappingURL=data:application/json;base64,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YUFBTyxPQUFPLENBQUM7S0FDaEI7OztXQUVTLG9CQUNSLFNBQWlCLEVBQ2pCLGdCQUF5QixFQUN6QixPQUFvQyxFQUNMO0FBQy9CLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3pFOzs7Ozs7O1dBS08sb0JBQW9DOzs7d0NBQWhDLElBQUk7QUFBSixZQUFJOzs7QUFDZCxhQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxlQUFLLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDakMsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQUMsS0FBSyxFQUFFLFFBQVE7bUJBQ2pDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztXQUFBLENBQUMsQ0FBQztTQUNoRCxDQUFDLFNBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNsQixDQUFDLENBQUM7S0FDSjs7O1NBak9HLGNBQWM7OztBQW9PcEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMiLCJmaWxlIjoiV2F0Y2htYW5DbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB3YXRjaG1hbiBmcm9tICdmYi13YXRjaG1hbic7XG5pbXBvcnQge29iamVjdCwgYXJyYXksIHByb21pc2VzfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7Z2V0V2F0Y2htYW5CaW5hcnlQYXRofSBmcm9tICcuL3BhdGgnO1xuaW1wb3J0IFdhdGNobWFuU3Vic2NyaXB0aW9uIGZyb20gJy4vV2F0Y2htYW5TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmNvbnN0IFdBVENITUFOX1NFVFRMRV9USU1FX01TID0gMjUwMDtcblxuaW1wb3J0IHR5cGUge1dhdGNobWFuU3Vic2NyaXB0aW9uT3B0aW9uc30gZnJvbSAnLi9XYXRjaG1hblN1YnNjcmlwdGlvbic7XG5cbnR5cGUgV2F0Y2htYW5TdWJzY3JpcHRpb25SZXNwb25zZSA9IHtcbiAgcm9vdDogc3RyaW5nO1xuICBzdWJzY3JpcHRpb246IHN0cmluZztcbiAgZmlsZXM6IEFycmF5PEZpbGVDaGFuZ2U+O1xufTtcblxuZXhwb3J0IHR5cGUgRmlsZUNoYW5nZSA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICBuZXc6IGJvb2xlYW47XG4gIGV4aXN0czogYm9vbGVhbjtcbiAgbW9kZTogbnVtYmVyO1xufTtcblxuY2xhc3MgV2F0Y2htYW5DbGllbnQge1xuICBfc3Vic2NyaXB0aW9uczogTWFwPHN0cmluZywgV2F0Y2htYW5TdWJzY3JpcHRpb24+O1xuICBfY2xpZW50UHJvbWlzZTogUHJvbWlzZTx3YXRjaG1hbi5DbGllbnQ+O1xuICBfd2F0Y2htYW5WZXJzaW9uUHJvbWlzZTogUHJvbWlzZTxzdHJpbmc+O1xuICBfc2VyaWFsaXplZFJlY29ubmVjdDogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9pbml0V2F0Y2htYW5DbGllbnQoKTtcbiAgICB0aGlzLl9zZXJpYWxpemVkUmVjb25uZWN0ID0gcHJvbWlzZXMuc2VyaWFsaXplQXN5bmNDYWxsKCgpID0+IHRoaXMuX3JlY29ubmVjdENsaWVudCgpKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3dhdGNobWFuVmVyc2lvblByb21pc2UgPSB0aGlzLnZlcnNpb24oKTtcbiAgfVxuXG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2xpZW50ID0gYXdhaXQgdGhpcy5fY2xpZW50UHJvbWlzZTtcbiAgICBjbGllbnQucmVtb3ZlQWxsTGlzdGVuZXJzKCk7IC8vIGRpc2FibGUgcmVjb25uZWN0aW9uXG4gICAgY2xpZW50LmVuZCgpO1xuICB9XG5cbiAgYXN5bmMgX2luaXRXYXRjaG1hbkNsaWVudCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9jbGllbnRQcm9taXNlID0gdGhpcy5fY3JlYXRlQ2xpZW50UHJvbWlzZSgpO1xuXG4gICAgY29uc3QgY2xpZW50ID0gYXdhaXQgdGhpcy5fY2xpZW50UHJvbWlzZTtcbiAgICBjbGllbnQub24oJ2VuZCcsICgpID0+IHtcbiAgICAgIGNsaWVudC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICAgIHRoaXMuX3NlcmlhbGl6ZWRSZWNvbm5lY3QoKTtcbiAgICB9KTtcbiAgICBjbGllbnQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSB0YWxraW5nIHRvIHdhdGNobWFuOiAnLCBlcnJvcik7XG4gICAgICAvLyBJZiBXYXRjaG1hbiBlbmNvdW50ZXJzIGFuIGVycm9yIGluIHRoZSBtaWRkbGUgb2YgYSBjb21tYW5kLCBpdCBtYXkgbmV2ZXIgZmluaXNoIVxuICAgICAgLy8gVGhlIGNsaWVudCBtdXN0IGJlIGltbWVkaWF0ZWx5IGtpbGxlZCBoZXJlIHNvIHRoYXQgdGhlIGNvbW1hbmQgZmFpbHMgYW5kXG4gICAgICAvLyBgc2VyaWFsaXplQXN5bmNDYWxsYCBjYW4gYmUgdW5ibG9ja2VkLiBPdGhlcndpc2UsIHdlIGVuZCB1cCBpbiBhIGRlYWRsb2NrLlxuICAgICAgY2xpZW50LnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgY2xpZW50LmVuZCgpO1xuICAgICAgLy8gVGhvc2UgYXJlIGVycm9ycyBpbiBkZXNlcmlhbGl6aW5nIGEgc3RyZWFtIG9mIGNoYW5nZXMuXG4gICAgICAvLyBUaGUgb25seSBwb3NzaWJsZSByZWNvdmVyeSBoZXJlIGlzIHJlY29ubmVjdGluZyBhIG5ldyBjbGllbnQsXG4gICAgICAvLyBidXQgdGhlIGZhaWxlZCB0byBzZXJpYWxpemUgZXZlbnRzIHdpbGwgYmUgbWlzc2VkLlxuICAgICAgLy8gdDkzNTM4NzhcbiAgICAgIHRoaXMuX3NlcmlhbGl6ZWRSZWNvbm5lY3QoKTtcbiAgICB9KTtcbiAgICBjbGllbnQub24oJ3N1YnNjcmlwdGlvbicsIHRoaXMuX29uU3Vic2NyaXB0aW9uUmVzdWx0LmJpbmQodGhpcykpO1xuICB9XG5cbiAgYXN5bmMgX2NyZWF0ZUNsaWVudFByb21pc2UoKTogUHJvbWlzZTx3YXRjaG1hbi5DbGllbnQ+IHtcbiAgICByZXR1cm4gbmV3IHdhdGNobWFuLkNsaWVudCh7XG4gICAgICB3YXRjaG1hbkJpbmFyeVBhdGg6IGF3YWl0IGdldFdhdGNobWFuQmluYXJ5UGF0aCgpLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX3JlY29ubmVjdENsaWVudCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIuZXJyb3IoJ1dhdGNobWFuIGNsaWVudCBkaXNjb25uZWN0ZWQsIHJlY29ubmVjdGluZyBhIG5ldyBjbGllbnQhJyk7XG4gICAgYXdhaXQgdGhpcy5faW5pdFdhdGNobWFuQ2xpZW50KCk7XG4gICAgYXdhaXQgdGhpcy5fcmVzdG9yZVN1YnNjcmlwdGlvbnMoKTtcbiAgfVxuXG4gIGFzeW5jIF9yZXN0b3JlU3Vic2NyaXB0aW9ucygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB3YXRjaFN1YnNjcmlwdGlvbnMgPSBhcnJheS5mcm9tKHRoaXMuX3N1YnNjcmlwdGlvbnMudmFsdWVzKCkpO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKHdhdGNoU3Vic2NyaXB0aW9ucy5tYXAoYXN5bmMgKHN1YnNjcmlwdGlvbjogV2F0Y2htYW5TdWJzY3JpcHRpb24pID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuX3dhdGNoUHJvamVjdChzdWJzY3JpcHRpb24ucGF0aCk7XG4gICAgICAvLyBXZSBoYXZlIGFscmVhZHkgbWlzc2VkIHRoZSBjaGFuZ2UgZXZlbnRzIGZyb20gdGhlIGRpc2Nvbm5lY3QgdGltZSxcbiAgICAgIC8vIHdhdGNobWFuIGNvdWxkIGhhdmUgZGllZCwgc28gdGhlIGxhc3QgY2xvY2sgcmVzdWx0IGlzIG5vdCB2YWxpZC5cbiAgICAgIGF3YWl0IHByb21pc2VzLmF3YWl0TWlsbGlTZWNvbmRzKFdBVENITUFOX1NFVFRMRV9USU1FX01TKTtcbiAgICAgIC8vIFJlZ2lzdGVyIHRoZSBzdWJzY3JpcHRpb25zIGFmdGVyIHRoZSBmaWxlc3lzdGVtIHNldHRsZXMuXG4gICAgICBzdWJzY3JpcHRpb24ub3B0aW9ucy5zaW5jZSA9IGF3YWl0IHRoaXMuX2Nsb2NrKHN1YnNjcmlwdGlvbi5yb290KTtcbiAgICAgIGF3YWl0IHRoaXMuX3N1YnNjcmliZShzdWJzY3JpcHRpb24ucm9vdCwgc3Vic2NyaXB0aW9uLm5hbWUsIHN1YnNjcmlwdGlvbi5vcHRpb25zKTtcbiAgICB9KSk7XG4gIH1cblxuICBfZ2V0U3Vic2NyaXB0aW9uKGVudHJ5UGF0aDogc3RyaW5nKTogP1dhdGNobWFuU3Vic2NyaXB0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fc3Vic2NyaXB0aW9ucy5nZXQocGF0aC5ub3JtYWxpemUoZW50cnlQYXRoKSk7XG4gIH1cblxuICBfc2V0U3Vic2NyaXB0aW9uKGVudHJ5UGF0aDogc3RyaW5nLCBzdWJzY3JpcHRpb246IFdhdGNobWFuU3Vic2NyaXB0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5zZXQocGF0aC5ub3JtYWxpemUoZW50cnlQYXRoKSwgc3Vic2NyaXB0aW9uKTtcbiAgfVxuXG4gIF9kZWxldGVTdWJzY3JpcHRpb24oZW50cnlQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRlbGV0ZShwYXRoLm5vcm1hbGl6ZShlbnRyeVBhdGgpKTtcbiAgfVxuXG4gIF9vblN1YnNjcmlwdGlvblJlc3VsdChyZXNwb25zZTogV2F0Y2htYW5TdWJzY3JpcHRpb25SZXNwb25zZSk6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2dldFN1YnNjcmlwdGlvbihyZXNwb25zZS5zdWJzY3JpcHRpb24pO1xuICAgIGlmIChzdWJzY3JpcHRpb24gPT0gbnVsbCkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdTdWJzY3JpcHRpb24gbm90IGZvdW5kIGZvciByZXNwb25zZTohJywgcmVzcG9uc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzdWJzY3JpcHRpb24uZW1pdCgnY2hhbmdlJywgcmVzcG9uc2UuZmlsZXMpO1xuICB9XG5cbiAgYXN5bmMgd2F0Y2hEaXJlY3RvcnlSZWN1cnNpdmUoXG4gICAgbG9jYWxEaXJlY3RvcnlQYXRoOiBzdHJpbmcsXG4gICAgc3Vic2NyaXB0aW9uTmFtZT86IHN0cmluZyA9IGxvY2FsRGlyZWN0b3J5UGF0aCxcbiAgICBzdWJzY3JpcHRpb25PcHRpb25zPzogV2F0Y2htYW5TdWJzY3JpcHRpb25PcHRpb25zLFxuICApOiBQcm9taXNlPFdhdGNobWFuU3Vic2NyaXB0aW9uPiB7XG4gICAgY29uc3QgZXhpc3RpbmdTdWJzY3JpcHRpb24gPSB0aGlzLl9nZXRTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uTmFtZSk7XG4gICAgaWYgKGV4aXN0aW5nU3Vic2NyaXB0aW9uKSB7XG4gICAgICBleGlzdGluZ1N1YnNjcmlwdGlvbi5zdWJzY3JpcHRpb25Db3VudCsrO1xuICAgICAgcmV0dXJuIGV4aXN0aW5nU3Vic2NyaXB0aW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHdhdGNoOiB3YXRjaFJvb3QsXG4gICAgICAgIHJlbGF0aXZlX3BhdGg6IHJlbGF0aXZlUGF0aCxcbiAgICAgIH0gPSBhd2FpdCB0aGlzLl93YXRjaFByb2plY3QobG9jYWxEaXJlY3RvcnlQYXRoKTtcbiAgICAgIGNvbnN0IGNsb2NrID0gYXdhaXQgdGhpcy5fY2xvY2sod2F0Y2hSb290KTtcbiAgICAgIGNvbnN0IG9wdGlvbnM6IFdhdGNobWFuU3Vic2NyaXB0aW9uT3B0aW9ucyA9IG9iamVjdC5hc3NpZ24oe1xuICAgICAgICBmaWVsZHM6IFsnbmFtZScsICduZXcnLCAnZXhpc3RzJywgJ21vZGUnXSxcbiAgICAgICAgc2luY2U6IGNsb2NrLFxuICAgICAgfSwgc3Vic2NyaXB0aW9uT3B0aW9ucyB8fCB7fSk7XG4gICAgICBpZiAocmVsYXRpdmVQYXRoICYmICFvcHRpb25zLmV4cHJlc3Npb24pIHtcbiAgICAgICAgLy8gUGFzc2luZyBhbiAndW5kZWZpbmVkJyBleHByZXNzaW9uIGNhdXNlcyBhbiBleGNlcHRpb24gaW4gZmItd2F0Y2htYW4uXG4gICAgICAgIG9wdGlvbnMuZXhwcmVzc2lvbiA9IFsnZGlybmFtZScsIHJlbGF0aXZlUGF0aF07XG4gICAgICB9XG4gICAgICAvLyByZWxhdGl2ZVBhdGggaXMgdW5kZWZpbmVkIGlmIHdhdGNoUm9vdCBpcyB0aGUgc2FtZSBhcyBkaXJlY3RvcnlQYXRoLlxuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gbmV3IFdhdGNobWFuU3Vic2NyaXB0aW9uKFxuICAgICAgICAvKnN1YnNjcmlwdGlvblJvb3QqLyB3YXRjaFJvb3QsXG4gICAgICAgIC8qcGF0aEZyb21TdWJzY3JpcHRpb25Sb290VG9TdWJzY3JpcHRpb25QYXRoKi8gcmVsYXRpdmVQYXRoLFxuICAgICAgICAvKnN1YnNjcmlwdGlvblBhdGgqLyBsb2NhbERpcmVjdG9yeVBhdGgsXG4gICAgICAgIC8qc3Vic2NyaXB0aW9uTmFtZSovIHN1YnNjcmlwdGlvbk5hbWUsXG4gICAgICAgIC8qc3Vic2NyaXB0aW9uQ291bnQqLyAxLFxuICAgICAgICAvKnN1YnNjcmlwdGlvbk9wdGlvbnMqLyBvcHRpb25zLFxuICAgICAgKTtcbiAgICAgIHRoaXMuX3NldFN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb25OYW1lLCBzdWJzY3JpcHRpb24pO1xuICAgICAgYXdhaXQgdGhpcy5fc3Vic2NyaWJlKHdhdGNoUm9vdCwgc3Vic2NyaXB0aW9uTmFtZSwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gc3Vic2NyaXB0aW9uO1xuICAgIH1cbiAgfVxuXG4gIGhhc1N1YnNjcmlwdGlvbihlbnRyeVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX2dldFN1YnNjcmlwdGlvbihlbnRyeVBhdGgpO1xuICB9XG5cbiAgYXN5bmMgdW53YXRjaChlbnRyeVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2dldFN1YnNjcmlwdGlvbihlbnRyeVBhdGgpO1xuXG4gICAgaWYgKHN1YnNjcmlwdGlvbiA9PSBudWxsKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ05vIHdhdGNoZXIgZW50aXR5IGZvdW5kIHdpdGggcGF0aDonLCBlbnRyeVBhdGgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgtLXN1YnNjcmlwdGlvbi5zdWJzY3JpcHRpb25Db3VudCA9PT0gMCkge1xuICAgICAgYXdhaXQgdGhpcy5fdW5zdWJzY3JpYmUoc3Vic2NyaXB0aW9uLnBhdGgsIHN1YnNjcmlwdGlvbi5uYW1lKTtcbiAgICAgIC8vIERvbid0IGRlbGV0ZSB0aGUgd2F0Y2hlciBpZiB0aGVyZSBhcmUgb3RoZXIgdXNlcnMgZm9yIGl0LlxuICAgICAgaWYgKCFzdWJzY3JpcHRpb24ucGF0aEZyb21TdWJzY3JpcHRpb25Sb290VG9TdWJzY3JpcHRpb25QYXRoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuX2RlbGV0ZVdhdGNoZXIoZW50cnlQYXRoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2RlbGV0ZVN1YnNjcmlwdGlvbihlbnRyeVBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0IGFsbCAod2F0Y2hlZCkgZmlsZXMgaW4gdGhlIGdpdmVuIGRpcmVjdG9yeS5cbiAgICogUGF0aHMgd2lsbCBiZSByZWxhdGl2ZS5cbiAgICovXG4gIGFzeW5jIGxpc3RGaWxlcyhlbnRyeVBhdGg6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICAgIGNvbnN0IHt3YXRjaCwgcmVsYXRpdmVfcGF0aH0gPSBhd2FpdCB0aGlzLl93YXRjaFByb2plY3QoZW50cnlQYXRoKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jb21tYW5kKCdxdWVyeScsIHdhdGNoLCB7XG4gICAgICBleHByZXNzaW9uOiBbJ3R5cGUnLCAnZiddLCAvLyBhbGwgZmlsZXNcbiAgICAgIGZpZWxkczogWyduYW1lJ10sICAgICAgICAgIC8vIG5hbWVzIG9ubHlcbiAgICAgIHJlbGF0aXZlX3Jvb3Q6IHJlbGF0aXZlX3BhdGgsXG4gICAgICAvLyBEbyBub3Qgd2FpdCBmb3IgV2F0Y2htYW4gdG8gc3luYy4gV2UgY2FuIHN1YnNjcmliZSB0byB1cGRhdGVzIGZvciB0aGlzLlxuICAgICAgc3luY190aW1lb3V0OiAwLFxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQuZmlsZXM7XG4gIH1cblxuICBhc3luYyBfd2F0Y2hMaXN0KCk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICAgIGNvbnN0IHtyb290c30gPSBhd2FpdCB0aGlzLl9jb21tYW5kKCd3YXRjaC1saXN0Jyk7XG4gICAgcmV0dXJuIHJvb3RzO1xuICB9XG5cbiAgX2RlbGV0ZVdhdGNoZXIoZW50cnlQYXRoOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fY29tbWFuZCgnd2F0Y2gtZGVsJywgZW50cnlQYXRoKTtcbiAgfVxuXG4gIF91bnN1YnNjcmliZShzdWJzY3JpcHRpb25QYXRoOiBzdHJpbmcsIHN1YnNjcmlwdGlvbk5hbWU6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl9jb21tYW5kKCd1bnN1YnNjcmliZScsIHN1YnNjcmlwdGlvblBhdGgsIHN1YnNjcmlwdGlvbk5hbWUpO1xuICB9XG5cbiAgYXN5bmMgX3dhdGNoKGRpcmVjdG9yeVBhdGg6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY29tbWFuZCgnd2F0Y2gnLCBkaXJlY3RvcnlQYXRoKTtcbiAgICBpZiAocmVzcG9uc2Uud2FybmluZykge1xuICAgICAgbG9nZ2VyLmVycm9yKCd3YXRjaG1hbiB3YXJuaW5nOiAnLCByZXNwb25zZS53YXJuaW5nKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfd2F0Y2hQcm9qZWN0KGRpcmVjdG9yeVBhdGg6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3Qgd2F0Y2htYW5WZXJzaW9uID0gYXdhaXQgdGhpcy5fd2F0Y2htYW5WZXJzaW9uUHJvbWlzZTtcbiAgICBpZiAoIXdhdGNobWFuVmVyc2lvbiB8fCB3YXRjaG1hblZlcnNpb24gPCAnMy4xLjAnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dhdGNobWFuIHZlcnNpb246ICcgKyB3YXRjaG1hblZlcnNpb24gKyAnIGRvZXMgbm90IHN1cHBvcnQgd2F0Y2gtcHJvamVjdCcpO1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NvbW1hbmQoJ3dhdGNoLXByb2plY3QnLCBkaXJlY3RvcnlQYXRoKTtcbiAgICBpZiAocmVzcG9uc2Uud2FybmluZykge1xuICAgICAgbG9nZ2VyLmVycm9yKCd3YXRjaG1hbiB3YXJuaW5nOiAnLCByZXNwb25zZS53YXJuaW5nKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9XG5cbiAgYXN5bmMgX2Nsb2NrKGRpcmVjdG9yeVBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qge2Nsb2NrfSA9IGF3YWl0IHRoaXMuX2NvbW1hbmQoJ2Nsb2NrJywgZGlyZWN0b3J5UGF0aCk7XG4gICAgcmV0dXJuIGNsb2NrO1xuICB9XG5cbiAgYXN5bmMgdmVyc2lvbigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHt2ZXJzaW9ufSA9IGF3YWl0IHRoaXMuX2NvbW1hbmQoJ3ZlcnNpb24nKTtcbiAgICByZXR1cm4gdmVyc2lvbjtcbiAgfVxuXG4gIF9zdWJzY3JpYmUoXG4gICAgd2F0Y2hSb290OiBzdHJpbmcsXG4gICAgc3Vic2NyaXB0aW9uTmFtZTogP3N0cmluZyxcbiAgICBvcHRpb25zOiBXYXRjaG1hblN1YnNjcmlwdGlvbk9wdGlvbnMsXG4gICk6IFByb21pc2U8V2F0Y2htYW5TdWJzY3JpcHRpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fY29tbWFuZCgnc3Vic2NyaWJlJywgd2F0Y2hSb290LCBzdWJzY3JpcHRpb25OYW1lLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qXG4gICAqIFByb21pc2lmeSBjYWxscyB0byB3YXRjaG1hbiBjbGllbnQuXG4gICAqL1xuICBfY29tbWFuZCguLi5hcmdzOiBBcnJheTxhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY2xpZW50UHJvbWlzZS50aGVuKGNsaWVudCA9PiB7XG4gICAgICAgIGNsaWVudC5jb21tYW5kKGFyZ3MsIChlcnJvciwgcmVzcG9uc2UpID0+XG4gICAgICAgICAgICBlcnJvciA/IHJlamVjdChlcnJvcikgOiByZXNvbHZlKHJlc3BvbnNlKSk7XG4gICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gV2F0Y2htYW5DbGllbnQ7XG4iXX0=