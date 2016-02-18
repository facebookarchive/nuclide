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
      (yield this._clientPromise).end();
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
  }, {
    key: '_watchList',
    value: _asyncToGenerator(function* () {
      var _ref2 = yield this._command('watch-list');

      var roots = _ref2.roots;

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
      var _ref3 = yield this._command('clock', directoryPath);

      var clock = _ref3.clock;

      return clock;
    })
  }, {
    key: 'version',
    value: _asyncToGenerator(function* () {
      var _ref4 = yield this._command('version');

      var version = _ref4.version;

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
//# sourceMappingURL=data:application/json;base64,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QUFRLENBQUM7V0FBQSxDQUFDLENBQUM7U0FDaEQsQ0FBQyxTQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDbEIsQ0FBQyxDQUFDO0tBQ0o7OztTQS9NRyxjQUFjOzs7QUFrTnBCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDIiwiZmlsZSI6IldhdGNobWFuQ2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgd2F0Y2htYW4gZnJvbSAnZmItd2F0Y2htYW4nO1xuaW1wb3J0IHtvYmplY3QsIGFycmF5LCBwcm9taXNlc30gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge2dldFdhdGNobWFuQmluYXJ5UGF0aH0gZnJvbSAnLi9wYXRoJztcbmltcG9ydCBXYXRjaG1hblN1YnNjcmlwdGlvbiBmcm9tICcuL1dhdGNobWFuU3Vic2NyaXB0aW9uJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5jb25zdCBXQVRDSE1BTl9TRVRUTEVfVElNRV9NUyA9IDI1MDA7XG5cbmltcG9ydCB0eXBlIHtXYXRjaG1hblN1YnNjcmlwdGlvbk9wdGlvbnN9IGZyb20gJy4vV2F0Y2htYW5TdWJzY3JpcHRpb24nO1xuXG50eXBlIFdhdGNobWFuU3Vic2NyaXB0aW9uUmVzcG9uc2UgPSB7XG4gIHJvb3Q6IHN0cmluZyxcbiAgc3Vic2NyaXB0aW9uOiBzdHJpbmcsXG4gIGZpbGVzOiBBcnJheTxGaWxlQ2hhbmdlPixcbn07XG5cbmV4cG9ydCB0eXBlIEZpbGVDaGFuZ2UgPSB7XG4gIG5hbWU6IHN0cmluZyxcbiAgbmV3OiBib29sZWFuLFxuICBleGlzdHM6IGJvb2xlYW4sXG4gIG1vZGU6IG51bWJlcixcbn07XG5cbmNsYXNzIFdhdGNobWFuQ2xpZW50IHtcbiAgX3N1YnNjcmlwdGlvbnM6IE1hcDxzdHJpbmcsIFdhdGNobWFuU3Vic2NyaXB0aW9uPjtcbiAgX2NsaWVudFByb21pc2U6IFByb21pc2U8d2F0Y2htYW4uQ2xpZW50PjtcbiAgX3dhdGNobWFuVmVyc2lvblByb21pc2U6IFByb21pc2U8c3RyaW5nPjtcbiAgX3NlcmlhbGl6ZWRSZWNvbm5lY3Q6ICgpID0+IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5faW5pdFdhdGNobWFuQ2xpZW50KCk7XG4gICAgdGhpcy5fc2VyaWFsaXplZFJlY29ubmVjdCA9IHByb21pc2VzLnNlcmlhbGl6ZUFzeW5jQ2FsbCgoKSA9PiB0aGlzLl9yZWNvbm5lY3RDbGllbnQoKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl93YXRjaG1hblZlcnNpb25Qcm9taXNlID0gdGhpcy52ZXJzaW9uKCk7XG4gIH1cblxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIChhd2FpdCB0aGlzLl9jbGllbnRQcm9taXNlKS5lbmQoKTtcbiAgfVxuXG4gIGFzeW5jIF9pbml0V2F0Y2htYW5DbGllbnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fY2xpZW50UHJvbWlzZSA9IHRoaXMuX2NyZWF0ZUNsaWVudFByb21pc2UoKTtcblxuICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IHRoaXMuX2NsaWVudFByb21pc2U7XG4gICAgY2xpZW50Lm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICBjbGllbnQucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgICB0aGlzLl9zZXJpYWxpemVkUmVjb25uZWN0KCk7XG4gICAgfSk7XG4gICAgY2xpZW50Lm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIGxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgdGFsa2luZyB0byB3YXRjaG1hbjogJywgZXJyb3IpO1xuICAgICAgLy8gSWYgV2F0Y2htYW4gZW5jb3VudGVycyBhbiBlcnJvciBpbiB0aGUgbWlkZGxlIG9mIGEgY29tbWFuZCwgaXQgbWF5IG5ldmVyIGZpbmlzaCFcbiAgICAgIC8vIFRoZSBjbGllbnQgbXVzdCBiZSBpbW1lZGlhdGVseSBraWxsZWQgaGVyZSBzbyB0aGF0IHRoZSBjb21tYW5kIGZhaWxzIGFuZFxuICAgICAgLy8gYHNlcmlhbGl6ZUFzeW5jQ2FsbGAgY2FuIGJlIHVuYmxvY2tlZC4gT3RoZXJ3aXNlLCB3ZSBlbmQgdXAgaW4gYSBkZWFkbG9jay5cbiAgICAgIGNsaWVudC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICAgIGNsaWVudC5lbmQoKTtcbiAgICAgIC8vIFRob3NlIGFyZSBlcnJvcnMgaW4gZGVzZXJpYWxpemluZyBhIHN0cmVhbSBvZiBjaGFuZ2VzLlxuICAgICAgLy8gVGhlIG9ubHkgcG9zc2libGUgcmVjb3ZlcnkgaGVyZSBpcyByZWNvbm5lY3RpbmcgYSBuZXcgY2xpZW50LFxuICAgICAgLy8gYnV0IHRoZSBmYWlsZWQgdG8gc2VyaWFsaXplIGV2ZW50cyB3aWxsIGJlIG1pc3NlZC5cbiAgICAgIC8vIHQ5MzUzODc4XG4gICAgICB0aGlzLl9zZXJpYWxpemVkUmVjb25uZWN0KCk7XG4gICAgfSk7XG4gICAgY2xpZW50Lm9uKCdzdWJzY3JpcHRpb24nLCB0aGlzLl9vblN1YnNjcmlwdGlvblJlc3VsdC5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGFzeW5jIF9jcmVhdGVDbGllbnRQcm9taXNlKCk6IFByb21pc2U8d2F0Y2htYW4uQ2xpZW50PiB7XG4gICAgcmV0dXJuIG5ldyB3YXRjaG1hbi5DbGllbnQoe1xuICAgICAgd2F0Y2htYW5CaW5hcnlQYXRoOiBhd2FpdCBnZXRXYXRjaG1hbkJpbmFyeVBhdGgoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9yZWNvbm5lY3RDbGllbnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmVycm9yKCdXYXRjaG1hbiBjbGllbnQgZGlzY29ubmVjdGVkLCByZWNvbm5lY3RpbmcgYSBuZXcgY2xpZW50IScpO1xuICAgIGF3YWl0IHRoaXMuX2luaXRXYXRjaG1hbkNsaWVudCgpO1xuICAgIGF3YWl0IHRoaXMuX3Jlc3RvcmVTdWJzY3JpcHRpb25zKCk7XG4gIH1cblxuICBhc3luYyBfcmVzdG9yZVN1YnNjcmlwdGlvbnMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgd2F0Y2hTdWJzY3JpcHRpb25zID0gYXJyYXkuZnJvbSh0aGlzLl9zdWJzY3JpcHRpb25zLnZhbHVlcygpKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbCh3YXRjaFN1YnNjcmlwdGlvbnMubWFwKGFzeW5jIChzdWJzY3JpcHRpb246IFdhdGNobWFuU3Vic2NyaXB0aW9uKSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLl93YXRjaFByb2plY3Qoc3Vic2NyaXB0aW9uLnBhdGgpO1xuICAgICAgLy8gV2UgaGF2ZSBhbHJlYWR5IG1pc3NlZCB0aGUgY2hhbmdlIGV2ZW50cyBmcm9tIHRoZSBkaXNjb25uZWN0IHRpbWUsXG4gICAgICAvLyB3YXRjaG1hbiBjb3VsZCBoYXZlIGRpZWQsIHNvIHRoZSBsYXN0IGNsb2NrIHJlc3VsdCBpcyBub3QgdmFsaWQuXG4gICAgICBhd2FpdCBwcm9taXNlcy5hd2FpdE1pbGxpU2Vjb25kcyhXQVRDSE1BTl9TRVRUTEVfVElNRV9NUyk7XG4gICAgICAvLyBSZWdpc3RlciB0aGUgc3Vic2NyaXB0aW9ucyBhZnRlciB0aGUgZmlsZXN5c3RlbSBzZXR0bGVzLlxuICAgICAgc3Vic2NyaXB0aW9uLm9wdGlvbnMuc2luY2UgPSBhd2FpdCB0aGlzLl9jbG9jayhzdWJzY3JpcHRpb24ucm9vdCk7XG4gICAgICBhd2FpdCB0aGlzLl9zdWJzY3JpYmUoc3Vic2NyaXB0aW9uLnJvb3QsIHN1YnNjcmlwdGlvbi5uYW1lLCBzdWJzY3JpcHRpb24ub3B0aW9ucyk7XG4gICAgfSkpO1xuICB9XG5cbiAgX2dldFN1YnNjcmlwdGlvbihlbnRyeVBhdGg6IHN0cmluZyk6ID9XYXRjaG1hblN1YnNjcmlwdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N1YnNjcmlwdGlvbnMuZ2V0KHBhdGgubm9ybWFsaXplKGVudHJ5UGF0aCkpO1xuICB9XG5cbiAgX3NldFN1YnNjcmlwdGlvbihlbnRyeVBhdGg6IHN0cmluZywgc3Vic2NyaXB0aW9uOiBXYXRjaG1hblN1YnNjcmlwdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuc2V0KHBhdGgubm9ybWFsaXplKGVudHJ5UGF0aCksIHN1YnNjcmlwdGlvbik7XG4gIH1cblxuICBfZGVsZXRlU3Vic2NyaXB0aW9uKGVudHJ5UGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kZWxldGUocGF0aC5ub3JtYWxpemUoZW50cnlQYXRoKSk7XG4gIH1cblxuICBfb25TdWJzY3JpcHRpb25SZXN1bHQocmVzcG9uc2U6IFdhdGNobWFuU3Vic2NyaXB0aW9uUmVzcG9uc2UpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9nZXRTdWJzY3JpcHRpb24ocmVzcG9uc2Uuc3Vic2NyaXB0aW9uKTtcbiAgICBpZiAoc3Vic2NyaXB0aW9uID09IG51bGwpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignU3Vic2NyaXB0aW9uIG5vdCBmb3VuZCBmb3IgcmVzcG9uc2U6IScsIHJlc3BvbnNlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3Vic2NyaXB0aW9uLmVtaXQoJ2NoYW5nZScsIHJlc3BvbnNlLmZpbGVzKTtcbiAgfVxuXG4gIGFzeW5jIHdhdGNoRGlyZWN0b3J5UmVjdXJzaXZlKFxuICAgIGxvY2FsRGlyZWN0b3J5UGF0aDogc3RyaW5nLFxuICAgIHN1YnNjcmlwdGlvbk5hbWU/OiBzdHJpbmcgPSBsb2NhbERpcmVjdG9yeVBhdGgsXG4gICAgc3Vic2NyaXB0aW9uT3B0aW9ucz86IFdhdGNobWFuU3Vic2NyaXB0aW9uT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxXYXRjaG1hblN1YnNjcmlwdGlvbj4ge1xuICAgIGNvbnN0IGV4aXN0aW5nU3Vic2NyaXB0aW9uID0gdGhpcy5fZ2V0U3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbk5hbWUpO1xuICAgIGlmIChleGlzdGluZ1N1YnNjcmlwdGlvbikge1xuICAgICAgZXhpc3RpbmdTdWJzY3JpcHRpb24uc3Vic2NyaXB0aW9uQ291bnQrKztcbiAgICAgIHJldHVybiBleGlzdGluZ1N1YnNjcmlwdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qge1xuICAgICAgICB3YXRjaDogd2F0Y2hSb290LFxuICAgICAgICByZWxhdGl2ZV9wYXRoOiByZWxhdGl2ZVBhdGgsXG4gICAgICB9ID0gYXdhaXQgdGhpcy5fd2F0Y2hQcm9qZWN0KGxvY2FsRGlyZWN0b3J5UGF0aCk7XG4gICAgICBjb25zdCBjbG9jayA9IGF3YWl0IHRoaXMuX2Nsb2NrKHdhdGNoUm9vdCk7XG4gICAgICBjb25zdCBvcHRpb25zOiBXYXRjaG1hblN1YnNjcmlwdGlvbk9wdGlvbnMgPSBvYmplY3QuYXNzaWduKHtcbiAgICAgICAgZmllbGRzOiBbJ25hbWUnLCAnbmV3JywgJ2V4aXN0cycsICdtb2RlJ10sXG4gICAgICAgIHNpbmNlOiBjbG9jayxcbiAgICAgIH0sIHN1YnNjcmlwdGlvbk9wdGlvbnMgfHwge30pO1xuICAgICAgaWYgKHJlbGF0aXZlUGF0aCAmJiAhb3B0aW9ucy5leHByZXNzaW9uKSB7XG4gICAgICAgIC8vIFBhc3NpbmcgYW4gJ3VuZGVmaW5lZCcgZXhwcmVzc2lvbiBjYXVzZXMgYW4gZXhjZXB0aW9uIGluIGZiLXdhdGNobWFuLlxuICAgICAgICBvcHRpb25zLmV4cHJlc3Npb24gPSBbJ2Rpcm5hbWUnLCByZWxhdGl2ZVBhdGhdO1xuICAgICAgfVxuICAgICAgLy8gcmVsYXRpdmVQYXRoIGlzIHVuZGVmaW5lZCBpZiB3YXRjaFJvb3QgaXMgdGhlIHNhbWUgYXMgZGlyZWN0b3J5UGF0aC5cbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IG5ldyBXYXRjaG1hblN1YnNjcmlwdGlvbihcbiAgICAgICAgLypzdWJzY3JpcHRpb25Sb290Ki8gd2F0Y2hSb290LFxuICAgICAgICAvKnBhdGhGcm9tU3Vic2NyaXB0aW9uUm9vdFRvU3Vic2NyaXB0aW9uUGF0aCovIHJlbGF0aXZlUGF0aCxcbiAgICAgICAgLypzdWJzY3JpcHRpb25QYXRoKi8gbG9jYWxEaXJlY3RvcnlQYXRoLFxuICAgICAgICAvKnN1YnNjcmlwdGlvbk5hbWUqLyBzdWJzY3JpcHRpb25OYW1lLFxuICAgICAgICAvKnN1YnNjcmlwdGlvbkNvdW50Ki8gMSxcbiAgICAgICAgLypzdWJzY3JpcHRpb25PcHRpb25zKi8gb3B0aW9ucyxcbiAgICAgICk7XG4gICAgICB0aGlzLl9zZXRTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uTmFtZSwgc3Vic2NyaXB0aW9uKTtcbiAgICAgIGF3YWl0IHRoaXMuX3N1YnNjcmliZSh3YXRjaFJvb3QsIHN1YnNjcmlwdGlvbk5hbWUsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbjtcbiAgICB9XG4gIH1cblxuICBoYXNTdWJzY3JpcHRpb24oZW50cnlQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl9nZXRTdWJzY3JpcHRpb24oZW50cnlQYXRoKTtcbiAgfVxuXG4gIGFzeW5jIHVud2F0Y2goZW50cnlQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9nZXRTdWJzY3JpcHRpb24oZW50cnlQYXRoKTtcblxuICAgIGlmIChzdWJzY3JpcHRpb24gPT0gbnVsbCkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdObyB3YXRjaGVyIGVudGl0eSBmb3VuZCB3aXRoIHBhdGg6JywgZW50cnlQYXRoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoLS1zdWJzY3JpcHRpb24uc3Vic2NyaXB0aW9uQ291bnQgPT09IDApIHtcbiAgICAgIGF3YWl0IHRoaXMuX3Vuc3Vic2NyaWJlKHN1YnNjcmlwdGlvbi5wYXRoLCBzdWJzY3JpcHRpb24ubmFtZSk7XG4gICAgICAvLyBEb24ndCBkZWxldGUgdGhlIHdhdGNoZXIgaWYgdGhlcmUgYXJlIG90aGVyIHVzZXJzIGZvciBpdC5cbiAgICAgIGlmICghc3Vic2NyaXB0aW9uLnBhdGhGcm9tU3Vic2NyaXB0aW9uUm9vdFRvU3Vic2NyaXB0aW9uUGF0aCkge1xuICAgICAgICBhd2FpdCB0aGlzLl9kZWxldGVXYXRjaGVyKGVudHJ5UGF0aCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9kZWxldGVTdWJzY3JpcHRpb24oZW50cnlQYXRoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfd2F0Y2hMaXN0KCk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICAgIGNvbnN0IHtyb290c30gPSBhd2FpdCB0aGlzLl9jb21tYW5kKCd3YXRjaC1saXN0Jyk7XG4gICAgcmV0dXJuIHJvb3RzO1xuICB9XG5cbiAgX2RlbGV0ZVdhdGNoZXIoZW50cnlQYXRoOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fY29tbWFuZCgnd2F0Y2gtZGVsJywgZW50cnlQYXRoKTtcbiAgfVxuXG4gIF91bnN1YnNjcmliZShzdWJzY3JpcHRpb25QYXRoOiBzdHJpbmcsIHN1YnNjcmlwdGlvbk5hbWU6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl9jb21tYW5kKCd1bnN1YnNjcmliZScsIHN1YnNjcmlwdGlvblBhdGgsIHN1YnNjcmlwdGlvbk5hbWUpO1xuICB9XG5cbiAgYXN5bmMgX3dhdGNoKGRpcmVjdG9yeVBhdGg6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fY29tbWFuZCgnd2F0Y2gnLCBkaXJlY3RvcnlQYXRoKTtcbiAgICBpZiAocmVzcG9uc2Uud2FybmluZykge1xuICAgICAgbG9nZ2VyLmVycm9yKCd3YXRjaG1hbiB3YXJuaW5nOiAnLCByZXNwb25zZS53YXJuaW5nKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfd2F0Y2hQcm9qZWN0KGRpcmVjdG9yeVBhdGg6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3Qgd2F0Y2htYW5WZXJzaW9uID0gYXdhaXQgdGhpcy5fd2F0Y2htYW5WZXJzaW9uUHJvbWlzZTtcbiAgICBpZiAoIXdhdGNobWFuVmVyc2lvbiB8fCB3YXRjaG1hblZlcnNpb24gPCAnMy4xLjAnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dhdGNobWFuIHZlcnNpb246ICcgKyB3YXRjaG1hblZlcnNpb24gKyAnIGRvZXMgbm90IHN1cHBvcnQgd2F0Y2gtcHJvamVjdCcpO1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NvbW1hbmQoJ3dhdGNoLXByb2plY3QnLCBkaXJlY3RvcnlQYXRoKTtcbiAgICBpZiAocmVzcG9uc2Uud2FybmluZykge1xuICAgICAgbG9nZ2VyLmVycm9yKCd3YXRjaG1hbiB3YXJuaW5nOiAnLCByZXNwb25zZS53YXJuaW5nKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9XG5cbiAgYXN5bmMgX2Nsb2NrKGRpcmVjdG9yeVBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qge2Nsb2NrfSA9IGF3YWl0IHRoaXMuX2NvbW1hbmQoJ2Nsb2NrJywgZGlyZWN0b3J5UGF0aCk7XG4gICAgcmV0dXJuIGNsb2NrO1xuICB9XG5cbiAgYXN5bmMgdmVyc2lvbigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHt2ZXJzaW9ufSA9IGF3YWl0IHRoaXMuX2NvbW1hbmQoJ3ZlcnNpb24nKTtcbiAgICByZXR1cm4gdmVyc2lvbjtcbiAgfVxuXG4gIF9zdWJzY3JpYmUoXG4gICAgd2F0Y2hSb290OiBzdHJpbmcsXG4gICAgc3Vic2NyaXB0aW9uTmFtZTogP3N0cmluZyxcbiAgICBvcHRpb25zOiBXYXRjaG1hblN1YnNjcmlwdGlvbk9wdGlvbnMsXG4gICk6IFByb21pc2U8V2F0Y2htYW5TdWJzY3JpcHRpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fY29tbWFuZCgnc3Vic2NyaWJlJywgd2F0Y2hSb290LCBzdWJzY3JpcHRpb25OYW1lLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qXG4gICAqIFByb21pc2lmeSBjYWxscyB0byB3YXRjaG1hbiBjbGllbnQuXG4gICAqL1xuICBfY29tbWFuZCguLi5hcmdzOiBBcnJheTxhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY2xpZW50UHJvbWlzZS50aGVuKGNsaWVudCA9PiB7XG4gICAgICAgIGNsaWVudC5jb21tYW5kKGFyZ3MsIChlcnJvciwgcmVzcG9uc2UpID0+XG4gICAgICAgICAgICBlcnJvciA/IHJlamVjdChlcnJvcikgOiByZXNvbHZlKHJlc3BvbnNlKSk7XG4gICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gV2F0Y2htYW5DbGllbnQ7XG4iXX0=