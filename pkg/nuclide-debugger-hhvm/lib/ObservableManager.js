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

var _reactivexRxjs = require('@reactivex/rxjs');

var _nuclideCommons = require('../../nuclide-commons');

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
      this._disposables.add(new _nuclideCommons.DisposableSubscription(this._notifications.subscribe(this._handleNotificationMessage.bind(this), this._handleNotificationError.bind(this), this._handleNotificationEnd.bind(this))));
      this._disposables.add(new _nuclideCommons.DisposableSubscription(this._serverMessages.subscribe(this._handleServerMessage.bind(this), this._handleServerError.bind(this), this._handleServerEnd.bind(this))));
      this._registerOutputWindowLogging();
      // Register a merged observable from shared streams that we can listen to for the onComplete.
      var sharedNotifications = this._notifications.share();
      var sharedServerMessages = this._serverMessages.share();
      var sharedOutputWindow = this._outputWindowMessages.share();
      _reactivexRxjs.Observable.merge(sharedNotifications, sharedServerMessages, sharedOutputWindow).subscribe({
        complete: this._onCompleted.bind(this)
      });
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
        shared.subscribe({
          complete: this._handleOutputWindowEnd.bind(this)
        });
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
//# sourceMappingURL=data:application/json;base64,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QXlDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RFLGNBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxnQkFBTTs7QUFBQSxBQUVSO0FBQ0Usa0JBQVEsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDeEQsZ0JBQU07QUFBQSxPQUNUO0tBQ0Y7OztXQUV1QixrQ0FBQyxLQUFhLEVBQVE7QUFDNUMsY0FBUSxDQUFDLG1DQUFtQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0tBQ3ZEOzs7V0FFcUIsa0NBQVM7QUFDN0IsU0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7S0FDeEM7OztXQUVtQiw4QkFBQyxPQUFlLEVBQVE7QUFDMUMsU0FBRyxDQUFDLDJCQUEyQixHQUFHLE9BQU8sQ0FBQyxDQUFDO0FBQzNDLFVBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM1Qzs7O1dBRWlCLDRCQUFDLEtBQWEsRUFBUTtBQUN0QyxjQUFRLENBQUMseUJBQXlCLEdBQUcsS0FBSyxDQUFDLENBQUM7S0FDN0M7OztXQUVlLDRCQUFTO0FBQ3ZCLFNBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0tBQ2xDOzs7V0FFVyx3QkFBUztBQUNuQixVQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxFQUFFO0FBQzlCLFlBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztPQUN0QjtBQUNELFNBQUcsQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO0tBQ25GOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztTQXJJVSxpQkFBaUIiLCJmaWxlIjoiT2JzZXJ2YWJsZU1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtnZXRPdXRwdXRTZXJ2aWNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWNvbW1vbi9saWIvT3V0cHV0U2VydmljZU1hbmFnZXInO1xuaW1wb3J0IHV0aWxzIGZyb20gJy4vdXRpbHMnO1xuY29uc3Qge2xvZywgbG9nRXJyb3J9ID0gdXRpbHM7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQge0Rpc3Bvc2FibGVTdWJzY3JpcHRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbnR5cGUgTm90aWZpY2F0aW9uTWVzc2FnZSA9IHtcbiAgdHlwZTogJ2luZm8nIHwgJ3dhcm5pbmcnIHwgJ2Vycm9yJyB8ICdmYXRhbEVycm9yJztcbiAgbWVzc2FnZTogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBUaGUgT2JzZXJ2YWJsZU1hbmFnZXIga2VlcHMgdHJhY2sgb2YgdGhlIHN0cmVhbXMgd2UgdXNlIHRvIHRhbGsgdG8gdGhlIHNlcnZlci1zaWRlIG51Y2xpZGVcbiAqIGRlYnVnZ2VyLiAgQ3VycmVudGx5IGl0IG1hbmFnZXMgMyBzdHJlYW1zOlxuICogICAxLiBBIG5vdGlmaWNhdGlvbiBzdHJlYW0gdG8gY29tbXVuaWNhdGUgZXZlbnRzIHRvIGF0b20ncyBub3RpZmljYXRpb24gc3lzdGVtLlxuICogICAyLiBBIHNlcnZlciBtZXNzYWdlIHN0cmVhbSB0byBjb21tdW5pY2F0ZSBldmVudHMgdG8gdGhlIGRlYnVnZ2VyIFVJLlxuICogICAzLiBBbiBvdXRwdXQgd2luZG93IHN0cmVhbSB0byBjb21tdW5pY2F0ZSBldmVudHMgdG8gdGhlIGNsaWVudCdzIG91dHB1dCB3aW5kb3cuXG4gKiBUaGUgbWFuYWdlciBhbHNvIGFsbG93cyB0d28gY2FsbGJhY2sgdG8gYmUgcGFzc2VkLlxuICogICAxLiBzZW5kU2VydmVyTWVzc2FnZVRvQ2hyb21lVWkgdGFrZXMgYSBzdHJpbmcgYW5kIHNlbmRzIGl0IHRvIHRoZSBjaHJvbWUgZGVidWdnZXIgVUkuXG4gKiAgIDIuIG9uU2Vzc2lvbkVuZCBpcyBvcHRpb25hbCwgYW5kIGlzIGNhbGxlZCB3aGVuIGFsbCB0aGUgbWFuYWdlZCBvYnNlcnZhYmxlcyBjb21wbGV0ZS5cbiAqIFRoZSBPYnNlcnZhYmxlTWFuYWdlciB0YWtlcyBvd25lcnNoaXAgb2YgaXRzIG9ic2VydmFibGVzLCBhbmQgZGlzcG9zZXMgdGhlbSB3aGVuIGl0cyBkaXNwb3NlXG4gKiBtZXRob2QgaXMgY2FsbGVkLlxuICovXG5leHBvcnQgY2xhc3MgT2JzZXJ2YWJsZU1hbmFnZXIge1xuICBfbm90aWZpY2F0aW9uczogT2JzZXJ2YWJsZTxOb3RpZmljYXRpb25NZXNzYWdlPjtcbiAgX3NlcnZlck1lc3NhZ2VzOiBPYnNlcnZhYmxlPHN0cmluZz47XG4gIF9vdXRwdXRXaW5kb3dNZXNzYWdlczogT2JzZXJ2YWJsZTxPYmplY3Q+O1xuICBfc2VuZFNlcnZlck1lc3NhZ2VUb0Nocm9tZVVpOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkO1xuICBfb25TZXNzaW9uRW5kOiA/KCkgPT4gbWl4ZWQ7XG4gIF9kaXNwb3NhYmxlczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5vdGlmaWNhdGlvbnM6IE9ic2VydmFibGU8Tm90aWZpY2F0aW9uTWVzc2FnZT4sXG4gICAgc2VydmVyTWVzc2FnZXM6IE9ic2VydmFibGU8c3RyaW5nPixcbiAgICBvdXRwdXRXaW5kb3dNZXNzYWdlczogT2JzZXJ2YWJsZTxPYmplY3Q+LFxuICAgIHNlbmRTZXJ2ZXJNZXNzYWdlVG9DaHJvbWVVaTogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCxcbiAgICBvblNlc3Npb25FbmQ/OiAoKSA9PiBtaXhlZCxcbiAgKSB7XG4gICAgdGhpcy5fbm90aWZpY2F0aW9ucyA9IG5vdGlmaWNhdGlvbnM7XG4gICAgdGhpcy5fc2VydmVyTWVzc2FnZXMgPSBzZXJ2ZXJNZXNzYWdlcztcbiAgICB0aGlzLl9vdXRwdXRXaW5kb3dNZXNzYWdlcyA9IG91dHB1dFdpbmRvd01lc3NhZ2VzO1xuICAgIHRoaXMuX3NlbmRTZXJ2ZXJNZXNzYWdlVG9DaHJvbWVVaSA9IHNlbmRTZXJ2ZXJNZXNzYWdlVG9DaHJvbWVVaTtcbiAgICB0aGlzLl9vblNlc3Npb25FbmQgPSBvblNlc3Npb25FbmQ7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmliZSgpO1xuICB9XG5cbiAgX3N1YnNjcmliZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGVTdWJzY3JpcHRpb24odGhpcy5fbm90aWZpY2F0aW9ucy5zdWJzY3JpYmUoXG4gICAgICB0aGlzLl9oYW5kbGVOb3RpZmljYXRpb25NZXNzYWdlLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVOb3RpZmljYXRpb25FcnJvci5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlTm90aWZpY2F0aW9uRW5kLmJpbmQodGhpcyksXG4gICAgKSkpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZVN1YnNjcmlwdGlvbih0aGlzLl9zZXJ2ZXJNZXNzYWdlcy5zdWJzY3JpYmUoXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJNZXNzYWdlLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJFcnJvci5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlU2VydmVyRW5kLmJpbmQodGhpcyksXG4gICAgKSkpO1xuICAgIHRoaXMuX3JlZ2lzdGVyT3V0cHV0V2luZG93TG9nZ2luZygpO1xuICAgIC8vIFJlZ2lzdGVyIGEgbWVyZ2VkIG9ic2VydmFibGUgZnJvbSBzaGFyZWQgc3RyZWFtcyB0aGF0IHdlIGNhbiBsaXN0ZW4gdG8gZm9yIHRoZSBvbkNvbXBsZXRlLlxuICAgIGNvbnN0IHNoYXJlZE5vdGlmaWNhdGlvbnMgPSB0aGlzLl9ub3RpZmljYXRpb25zLnNoYXJlKCk7XG4gICAgY29uc3Qgc2hhcmVkU2VydmVyTWVzc2FnZXMgPSB0aGlzLl9zZXJ2ZXJNZXNzYWdlcy5zaGFyZSgpO1xuICAgIGNvbnN0IHNoYXJlZE91dHB1dFdpbmRvdyA9IHRoaXMuX291dHB1dFdpbmRvd01lc3NhZ2VzLnNoYXJlKCk7XG4gICAgT2JzZXJ2YWJsZVxuICAgICAgLm1lcmdlKHNoYXJlZE5vdGlmaWNhdGlvbnMsIHNoYXJlZFNlcnZlck1lc3NhZ2VzLCBzaGFyZWRPdXRwdXRXaW5kb3cpXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgY29tcGxldGU6IHRoaXMuX29uQ29tcGxldGVkLmJpbmQodGhpcyksXG4gICAgICB9KTtcbiAgfVxuXG4gIF9yZWdpc3Rlck91dHB1dFdpbmRvd0xvZ2dpbmcoKTogdm9pZCB7XG4gICAgY29uc3QgYXBpID0gZ2V0T3V0cHV0U2VydmljZSgpO1xuICAgIGlmIChhcGkgIT0gbnVsbCkge1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSB0aGlzLl9vdXRwdXRXaW5kb3dNZXNzYWdlc1xuICAgICAgICAuZmlsdGVyKG1lc3NhZ2VPYmogPT4gbWVzc2FnZU9iai5tZXRob2QgPT09ICdDb25zb2xlLm1lc3NhZ2VBZGRlZCcpXG4gICAgICAgIC5tYXAobWVzc2FnZU9iaiA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxldmVsOiBtZXNzYWdlT2JqLnBhcmFtcy5tZXNzYWdlLmxldmVsLFxuICAgICAgICAgICAgdGV4dDogbWVzc2FnZU9iai5wYXJhbXMubWVzc2FnZS50ZXh0LFxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgY29uc3Qgc2hhcmVkID0gbWVzc2FnZXMuc2hhcmUoKTtcbiAgICAgIHNoYXJlZC5zdWJzY3JpYmUoe1xuICAgICAgICBjb21wbGV0ZTogdGhpcy5faGFuZGxlT3V0cHV0V2luZG93RW5kLmJpbmQodGhpcyksXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhcGkucmVnaXN0ZXJPdXRwdXRQcm92aWRlcih7XG4gICAgICAgIHNvdXJjZTogJ2hodm0gZGVidWdnZXInLFxuICAgICAgICBtZXNzYWdlczogc2hhcmVkLFxuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dFcnJvcignQ2Fubm90IGdldCBvdXRwdXQgd2luZG93IHNlcnZpY2UuJyk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZU91dHB1dFdpbmRvd0VuZCgpOiB2b2lkIHtcbiAgICBsb2coJ091dHB1dCB3aW5kb3cgb2JzZXJ2YWJsZSBlbmRlZC4nKTtcbiAgfVxuXG4gIF9oYW5kbGVOb3RpZmljYXRpb25NZXNzYWdlKG1lc3NhZ2U6IE5vdGlmaWNhdGlvbk1lc3NhZ2UpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgIGxvZygnTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBpbmZvOiAnICsgbWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8obWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgICBsb2coJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgd2FybmluZzogJyArIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIGxvZ0Vycm9yKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGVycm9yOiAnICsgbWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdmYXRhbEVycm9yJzpcbiAgICAgICAgbG9nRXJyb3IoJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgZmF0YWwgZXJyb3I6ICcgKyBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvcihtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbG9nRXJyb3IoJ1Vua25vd24gbWVzc2FnZTogJyArIEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZU5vdGlmaWNhdGlvbkVycm9yKGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2dFcnJvcignTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBlcnJvcjogJyArIGVycm9yKTtcbiAgfVxuXG4gIF9oYW5kbGVOb3RpZmljYXRpb25FbmQoKTogdm9pZCB7XG4gICAgbG9nKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGVuZHMuJyk7XG4gIH1cblxuICBfaGFuZGxlU2VydmVyTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2coJ1JlY2lldmVkIHNlcnZlciBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgdGhpcy5fc2VuZFNlcnZlck1lc3NhZ2VUb0Nocm9tZVVpKG1lc3NhZ2UpO1xuICB9XG5cbiAgX2hhbmRsZVNlcnZlckVycm9yKGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2dFcnJvcignUmVjZWl2ZWQgc2VydmVyIGVycm9yOiAnICsgZXJyb3IpO1xuICB9XG5cbiAgX2hhbmRsZVNlcnZlckVuZCgpOiB2b2lkIHtcbiAgICBsb2coJ1NlcnZlciBvYnNlcnZlcmFibGUgZW5kcy4nKTtcbiAgfVxuXG4gIF9vbkNvbXBsZXRlZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fb25TZXNzaW9uRW5kICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX29uU2Vzc2lvbkVuZCgpO1xuICAgIH1cbiAgICBsb2coJ0FsbCBvYnNlcnZhYmxlIHN0cmVhbXMgaGF2ZSBjb21wbGV0ZWQgYW5kIHNlc3Npb24gZW5kIGNhbGxiYWNrIHdhcyBjYWxsZWQuJyk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19