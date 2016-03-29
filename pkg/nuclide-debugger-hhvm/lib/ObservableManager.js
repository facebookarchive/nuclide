Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _nuclideDebuggerCommonLibOutputServiceManager = require('../../nuclide-debugger-common/lib/OutputServiceManager');

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _rx = require('rx');

var log = _utils2['default'].log;
var logError = _utils2['default'].logError;

/**
 * The ObservableManager keeps track of the streams we use to talk to the server-side nuclide
 * debugger.  Currently it manages 3 streams:
 *   1. A notification stream to communicate events to atom's notification system.
 *   2. A server message stream to communicate events to the debugger UI.
 *   3. An output window stream to communicate events to the client's output window.
 * The manager also allows two callback to be passed.
 *   1. sendServerMessageToChromeUi takes a string and sends it to the chrome debugger UI.
 *   2. onSessionEnd is optional, and is called when all the managed observables complete.
 * The ObservableManager takes ownership of its observables, and disposes them when its dispose
 * method is called.
 */

var ObservableManager = (function () {
  function ObservableManager(notifications, serverMessages, outputWindowMessages, sendServerMessageToChromeUi, onSessionEnd) {
    _classCallCheck(this, ObservableManager);

    this._notifications = notifications;
    this._serverMessages = serverMessages;
    this._outputWindowMessages = outputWindowMessages;
    this._sendServerMessageToChromeUi = sendServerMessageToChromeUi;
    this._onSessionEnd = onSessionEnd;
    this._disposables = new _atom.CompositeDisposable();
    this._subscribe();
  }

  _createClass(ObservableManager, [{
    key: '_subscribe',
    value: function _subscribe() {
      this._disposables.add(this._notifications.subscribe(this._handleNotificationMessage.bind(this), this._handleNotificationError.bind(this), this._handleNotificationEnd.bind(this)));
      this._disposables.add(this._serverMessages.subscribe(this._handleServerMessage.bind(this), this._handleServerError.bind(this), this._handleServerEnd.bind(this)));
      this._registerOutputWindowLogging();
      // Register a merged observable from shared streams that we can listen to for the onComplete.
      var sharedNotifications = this._notifications.share();
      var sharedServerMessages = this._serverMessages.share();
      var sharedOutputWindow = this._outputWindowMessages.share();
      _rx.Observable.merge(sharedNotifications, sharedServerMessages, sharedOutputWindow).subscribeOnCompleted(this._onCompleted.bind(this));
    }
  }, {
    key: '_registerOutputWindowLogging',
    value: function _registerOutputWindowLogging() {
      var api = (0, _nuclideDebuggerCommonLibOutputServiceManager.getOutputService)();
      if (api != null) {
        var messages = this._outputWindowMessages.filter(function (messageObj) {
          return messageObj.method === 'Console.messageAdded';
        }).map(function (messageObj) {
          return {
            level: messageObj.params.message.level,
            text: messageObj.params.message.text
          };
        });
        var shared = messages.share();
        shared.subscribeOnCompleted(this._handleOutputWindowEnd.bind(this));
        this._disposables.add(api.registerOutputProvider({
          source: 'hhvm debugger',
          messages: shared
        }));
      } else {
        logError('Cannot get output window service.');
      }
    }
  }, {
    key: '_handleOutputWindowEnd',
    value: function _handleOutputWindowEnd() {
      log('Output window observable ended.');
    }
  }, {
    key: '_handleNotificationMessage',
    value: function _handleNotificationMessage(message) {
      switch (message.type) {
        case 'info':
          log('Notification observerable info: ' + message.message);
          atom.notifications.addInfo(message.message);
          break;

        case 'warning':
          log('Notification observerable warning: ' + message.message);
          atom.notifications.addWarning(message.message);
          break;

        case 'error':
          logError('Notification observerable error: ' + message.message);
          atom.notifications.addError(message.message);
          break;

        case 'fatalError':
          logError('Notification observerable fatal error: ' + message.message);
          atom.notifications.addFatalError(message.message);
          break;

        default:
          logError('Unknown message: ' + JSON.stringify(message));
          break;
      }
    }
  }, {
    key: '_handleNotificationError',
    value: function _handleNotificationError(error) {
      logError('Notification observerable error: ' + error);
    }
  }, {
    key: '_handleNotificationEnd',
    value: function _handleNotificationEnd() {
      log('Notification observerable ends.');
    }
  }, {
    key: '_handleServerMessage',
    value: function _handleServerMessage(message) {
      log('Recieved server message: ' + message);
      this._sendServerMessageToChromeUi(message);
    }
  }, {
    key: '_handleServerError',
    value: function _handleServerError(error) {
      logError('Received server error: ' + error);
    }
  }, {
    key: '_handleServerEnd',
    value: function _handleServerEnd() {
      log('Server observerable ends.');
    }
  }, {
    key: '_onCompleted',
    value: function _onCompleted() {
      if (this._onSessionEnd != null) {
        this._onSessionEnd();
      }
      log('All observable streams have completed and session end callback was called.');
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return ObservableManager;
})();

exports.ObservableManager = ObservableManager;
//# sourceMappingURL=data:application/json;base64,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QyxPQUFPLENBQUMsQ0FBQztBQUNsRCxnQkFBTTs7QUFBQSxBQUVSO0FBQ0Usa0JBQVEsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDeEQsZ0JBQU07QUFBQSxPQUNUO0tBQ0Y7OztXQUV1QixrQ0FBQyxLQUFhLEVBQVE7QUFDNUMsY0FBUSxDQUFDLG1DQUFtQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0tBQ3ZEOzs7V0FFcUIsa0NBQVM7QUFDN0IsU0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7S0FDeEM7OztXQUVtQiw4QkFBQyxPQUFlLEVBQVE7QUFDMUMsU0FBRyxDQUFDLDJCQUEyQixHQUFHLE9BQU8sQ0FBQyxDQUFDO0FBQzNDLFVBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM1Qzs7O1dBRWlCLDRCQUFDLEtBQWEsRUFBUTtBQUN0QyxjQUFRLENBQUMseUJBQXlCLEdBQUcsS0FBSyxDQUFDLENBQUM7S0FDN0M7OztXQUVlLDRCQUFTO0FBQ3ZCLFNBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0tBQ2xDOzs7V0FFVyx3QkFBUztBQUNuQixVQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxFQUFFO0FBQzlCLFlBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztPQUN0QjtBQUNELFNBQUcsQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO0tBQ25GOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztTQWpJVSxpQkFBaUIiLCJmaWxlIjoiT2JzZXJ2YWJsZU1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtnZXRPdXRwdXRTZXJ2aWNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWNvbW1vbi9saWIvT3V0cHV0U2VydmljZU1hbmFnZXInO1xuaW1wb3J0IHV0aWxzIGZyb20gJy4vdXRpbHMnO1xuY29uc3Qge2xvZywgbG9nRXJyb3J9ID0gdXRpbHM7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxudHlwZSBOb3RpZmljYXRpb25NZXNzYWdlID0ge1xuICB0eXBlOiAnaW5mbycgfCAnd2FybmluZycgfCAnZXJyb3InIHwgJ2ZhdGFsRXJyb3InO1xuICBtZXNzYWdlOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIFRoZSBPYnNlcnZhYmxlTWFuYWdlciBrZWVwcyB0cmFjayBvZiB0aGUgc3RyZWFtcyB3ZSB1c2UgdG8gdGFsayB0byB0aGUgc2VydmVyLXNpZGUgbnVjbGlkZVxuICogZGVidWdnZXIuICBDdXJyZW50bHkgaXQgbWFuYWdlcyAzIHN0cmVhbXM6XG4gKiAgIDEuIEEgbm90aWZpY2F0aW9uIHN0cmVhbSB0byBjb21tdW5pY2F0ZSBldmVudHMgdG8gYXRvbSdzIG5vdGlmaWNhdGlvbiBzeXN0ZW0uXG4gKiAgIDIuIEEgc2VydmVyIG1lc3NhZ2Ugc3RyZWFtIHRvIGNvbW11bmljYXRlIGV2ZW50cyB0byB0aGUgZGVidWdnZXIgVUkuXG4gKiAgIDMuIEFuIG91dHB1dCB3aW5kb3cgc3RyZWFtIHRvIGNvbW11bmljYXRlIGV2ZW50cyB0byB0aGUgY2xpZW50J3Mgb3V0cHV0IHdpbmRvdy5cbiAqIFRoZSBtYW5hZ2VyIGFsc28gYWxsb3dzIHR3byBjYWxsYmFjayB0byBiZSBwYXNzZWQuXG4gKiAgIDEuIHNlbmRTZXJ2ZXJNZXNzYWdlVG9DaHJvbWVVaSB0YWtlcyBhIHN0cmluZyBhbmQgc2VuZHMgaXQgdG8gdGhlIGNocm9tZSBkZWJ1Z2dlciBVSS5cbiAqICAgMi4gb25TZXNzaW9uRW5kIGlzIG9wdGlvbmFsLCBhbmQgaXMgY2FsbGVkIHdoZW4gYWxsIHRoZSBtYW5hZ2VkIG9ic2VydmFibGVzIGNvbXBsZXRlLlxuICogVGhlIE9ic2VydmFibGVNYW5hZ2VyIHRha2VzIG93bmVyc2hpcCBvZiBpdHMgb2JzZXJ2YWJsZXMsIGFuZCBkaXNwb3NlcyB0aGVtIHdoZW4gaXRzIGRpc3Bvc2VcbiAqIG1ldGhvZCBpcyBjYWxsZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBPYnNlcnZhYmxlTWFuYWdlciB7XG4gIF9ub3RpZmljYXRpb25zOiBPYnNlcnZhYmxlPE5vdGlmaWNhdGlvbk1lc3NhZ2U+O1xuICBfc2VydmVyTWVzc2FnZXM6IE9ic2VydmFibGU8c3RyaW5nPjtcbiAgX291dHB1dFdpbmRvd01lc3NhZ2VzOiBPYnNlcnZhYmxlPE9iamVjdD47XG4gIF9zZW5kU2VydmVyTWVzc2FnZVRvQ2hyb21lVWk6IChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQ7XG4gIF9vblNlc3Npb25FbmQ6ID8oKSA9PiBtaXhlZDtcbiAgX2Rpc3Bvc2FibGVzOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbm90aWZpY2F0aW9uczogT2JzZXJ2YWJsZTxOb3RpZmljYXRpb25NZXNzYWdlPixcbiAgICBzZXJ2ZXJNZXNzYWdlczogT2JzZXJ2YWJsZTxzdHJpbmc+LFxuICAgIG91dHB1dFdpbmRvd01lc3NhZ2VzOiBPYnNlcnZhYmxlPE9iamVjdD4sXG4gICAgc2VuZFNlcnZlck1lc3NhZ2VUb0Nocm9tZVVpOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkLFxuICAgIG9uU2Vzc2lvbkVuZD86ICgpID0+IG1peGVkLFxuICApIHtcbiAgICB0aGlzLl9ub3RpZmljYXRpb25zID0gbm90aWZpY2F0aW9ucztcbiAgICB0aGlzLl9zZXJ2ZXJNZXNzYWdlcyA9IHNlcnZlck1lc3NhZ2VzO1xuICAgIHRoaXMuX291dHB1dFdpbmRvd01lc3NhZ2VzID0gb3V0cHV0V2luZG93TWVzc2FnZXM7XG4gICAgdGhpcy5fc2VuZFNlcnZlck1lc3NhZ2VUb0Nocm9tZVVpID0gc2VuZFNlcnZlck1lc3NhZ2VUb0Nocm9tZVVpO1xuICAgIHRoaXMuX29uU2Vzc2lvbkVuZCA9IG9uU2Vzc2lvbkVuZDtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlKCk7XG4gIH1cblxuICBfc3Vic2NyaWJlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9ub3RpZmljYXRpb25zLnN1YnNjcmliZShcbiAgICAgIHRoaXMuX2hhbmRsZU5vdGlmaWNhdGlvbk1lc3NhZ2UuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2hhbmRsZU5vdGlmaWNhdGlvbkVycm9yLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVOb3RpZmljYXRpb25FbmQuYmluZCh0aGlzKSxcbiAgICApKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQodGhpcy5fc2VydmVyTWVzc2FnZXMuc3Vic2NyaWJlKFxuICAgICAgdGhpcy5faGFuZGxlU2VydmVyTWVzc2FnZS5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlU2VydmVyRXJyb3IuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2hhbmRsZVNlcnZlckVuZC5iaW5kKHRoaXMpLFxuICAgICkpO1xuICAgIHRoaXMuX3JlZ2lzdGVyT3V0cHV0V2luZG93TG9nZ2luZygpO1xuICAgIC8vIFJlZ2lzdGVyIGEgbWVyZ2VkIG9ic2VydmFibGUgZnJvbSBzaGFyZWQgc3RyZWFtcyB0aGF0IHdlIGNhbiBsaXN0ZW4gdG8gZm9yIHRoZSBvbkNvbXBsZXRlLlxuICAgIGNvbnN0IHNoYXJlZE5vdGlmaWNhdGlvbnMgPSB0aGlzLl9ub3RpZmljYXRpb25zLnNoYXJlKCk7XG4gICAgY29uc3Qgc2hhcmVkU2VydmVyTWVzc2FnZXMgPSB0aGlzLl9zZXJ2ZXJNZXNzYWdlcy5zaGFyZSgpO1xuICAgIGNvbnN0IHNoYXJlZE91dHB1dFdpbmRvdyA9IHRoaXMuX291dHB1dFdpbmRvd01lc3NhZ2VzLnNoYXJlKCk7XG4gICAgT2JzZXJ2YWJsZVxuICAgICAgLm1lcmdlKHNoYXJlZE5vdGlmaWNhdGlvbnMsIHNoYXJlZFNlcnZlck1lc3NhZ2VzLCBzaGFyZWRPdXRwdXRXaW5kb3cpXG4gICAgICAuc3Vic2NyaWJlT25Db21wbGV0ZWQodGhpcy5fb25Db21wbGV0ZWQuYmluZCh0aGlzKSk7XG4gIH1cblxuICBfcmVnaXN0ZXJPdXRwdXRXaW5kb3dMb2dnaW5nKCk6IHZvaWQge1xuICAgIGNvbnN0IGFwaSA9IGdldE91dHB1dFNlcnZpY2UoKTtcbiAgICBpZiAoYXBpICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gdGhpcy5fb3V0cHV0V2luZG93TWVzc2FnZXNcbiAgICAgICAgLmZpbHRlcihtZXNzYWdlT2JqID0+IG1lc3NhZ2VPYmoubWV0aG9kID09PSAnQ29uc29sZS5tZXNzYWdlQWRkZWQnKVxuICAgICAgICAubWFwKG1lc3NhZ2VPYmogPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZXZlbDogbWVzc2FnZU9iai5wYXJhbXMubWVzc2FnZS5sZXZlbCxcbiAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2VPYmoucGFyYW1zLm1lc3NhZ2UudGV4dCxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIGNvbnN0IHNoYXJlZCA9IG1lc3NhZ2VzLnNoYXJlKCk7XG4gICAgICBzaGFyZWQuc3Vic2NyaWJlT25Db21wbGV0ZWQodGhpcy5faGFuZGxlT3V0cHV0V2luZG93RW5kLmJpbmQodGhpcykpO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGFwaS5yZWdpc3Rlck91dHB1dFByb3ZpZGVyKHtcbiAgICAgICAgc291cmNlOiAnaGh2bSBkZWJ1Z2dlcicsXG4gICAgICAgIG1lc3NhZ2VzOiBzaGFyZWQsXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ0Vycm9yKCdDYW5ub3QgZ2V0IG91dHB1dCB3aW5kb3cgc2VydmljZS4nKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlT3V0cHV0V2luZG93RW5kKCk6IHZvaWQge1xuICAgIGxvZygnT3V0cHV0IHdpbmRvdyBvYnNlcnZhYmxlIGVuZGVkLicpO1xuICB9XG5cbiAgX2hhbmRsZU5vdGlmaWNhdGlvbk1lc3NhZ2UobWVzc2FnZTogTm90aWZpY2F0aW9uTWVzc2FnZSk6IHZvaWQge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdpbmZvJzpcbiAgICAgICAgbG9nKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGluZm86ICcgKyBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnd2FybmluZyc6XG4gICAgICAgIGxvZygnTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSB3YXJuaW5nOiAnICsgbWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgbG9nRXJyb3IoJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgZXJyb3I6ICcgKyBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2ZhdGFsRXJyb3InOlxuICAgICAgICBsb2dFcnJvcignTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBmYXRhbCBlcnJvcjogJyArIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRGYXRhbEVycm9yKG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsb2dFcnJvcignVW5rbm93biBtZXNzYWdlOiAnICsgSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlTm90aWZpY2F0aW9uRXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ0Vycm9yKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGVycm9yOiAnICsgZXJyb3IpO1xuICB9XG5cbiAgX2hhbmRsZU5vdGlmaWNhdGlvbkVuZCgpOiB2b2lkIHtcbiAgICBsb2coJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgZW5kcy4nKTtcbiAgfVxuXG4gIF9oYW5kbGVTZXJ2ZXJNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZygnUmVjaWV2ZWQgc2VydmVyIG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICB0aGlzLl9zZW5kU2VydmVyTWVzc2FnZVRvQ2hyb21lVWkobWVzc2FnZSk7XG4gIH1cblxuICBfaGFuZGxlU2VydmVyRXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ0Vycm9yKCdSZWNlaXZlZCBzZXJ2ZXIgZXJyb3I6ICcgKyBlcnJvcik7XG4gIH1cblxuICBfaGFuZGxlU2VydmVyRW5kKCk6IHZvaWQge1xuICAgIGxvZygnU2VydmVyIG9ic2VydmVyYWJsZSBlbmRzLicpO1xuICB9XG5cbiAgX29uQ29tcGxldGVkKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9vblNlc3Npb25FbmQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fb25TZXNzaW9uRW5kKCk7XG4gICAgfVxuICAgIGxvZygnQWxsIG9ic2VydmFibGUgc3RyZWFtcyBoYXZlIGNvbXBsZXRlZCBhbmQgc2Vzc2lvbiBlbmQgY2FsbGJhY2sgd2FzIGNhbGxlZC4nKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG59XG4iXX0=