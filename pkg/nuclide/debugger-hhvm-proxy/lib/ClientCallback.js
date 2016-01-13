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

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _rx = require('rx');

function createMessage(method, params) {
  var result = { method: method };
  if (params) {
    result.params = params;
  }
  return result;
}

/**
 * This class provides a central callback channel to communicate with debugger client.
 * Currently it provides three callback channels:
 * 1. Chrome server messages.
 * 2. Atom UI notification.
 * 3. Chrome console user messages.
 */

var ClientCallback = (function () {
  // For atom UI notifications.

  function ClientCallback() {
    _classCallCheck(this, ClientCallback);

    this._serverMessageObservable = new _rx.Subject();
    this._notificationObservable = new _rx.Subject();
  }

  _createClass(ClientCallback, [{
    key: 'getNotificationObservable',
    value: function getNotificationObservable() {
      return this._notificationObservable;
    }
  }, {
    key: 'getServerMessageObservable',
    value: function getServerMessageObservable() {
      return this._serverMessageObservable;
    }
  }, {
    key: 'sendUserMessage',
    value: function sendUserMessage(type, message) {
      _utils2['default'].log('sendUserMessage(' + type + '): ' + JSON.stringify(message));
      if (type === 'notification') {
        this._notificationObservable.onNext({
          type: message.type,
          message: message.message
        });
      } else if (type === 'console') {
        this.sendMethod('Console.messageAdded', {
          message: message
        });
      } else {
        _utils2['default'].logError('Unknown UserMessageType: ' + type);
      }
    }
  }, {
    key: 'unknownMethod',
    value: function unknownMethod(id, domain, method, params) {
      var message = 'Unknown chrome dev tools method: ' + domain + '.' + method;
      _utils2['default'].log(message);
      this.replyWithError(id, message);
    }
  }, {
    key: 'replyWithError',
    value: function replyWithError(id, error) {
      this.replyToCommand(id, {}, error);
    }
  }, {
    key: 'replyToCommand',
    value: function replyToCommand(id, result, error) {
      var value = { id: id, result: result };
      if (error) {
        value.error = error;
      }
      this._sendJsonObject(value);
    }
  }, {
    key: 'sendMethod',
    value: function sendMethod(method, params) {
      this._sendJsonObject(createMessage(method, params));
    }
  }, {
    key: '_sendJsonObject',
    value: function _sendJsonObject(value) {
      var message = JSON.stringify(value);
      _utils2['default'].log('Sending JSON: ' + message);
      this._serverMessageObservable.onNext(message);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._notificationObservable.onCompleted();
      this._serverMessageObservable.onCompleted();
    }
  }]);

  return ClientCallback;
})();

exports.ClientCallback = ClientCallback;
// For server messages.
//# sourceMappingURL=data:application/json;base64,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TSxtQkFBUztBQUNkLFVBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMzQyxVQUFJLENBQUMsd0JBQXdCLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDN0M7OztTQWhFVSxjQUFjIiwiZmlsZSI6IkNsaWVudENhbGxiYWNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncngnO1xuXG5pbXBvcnQgdHlwZSB7Tm90aWZpY2F0aW9uTWVzc2FnZX0gZnJvbSAnLi9IaHZtRGVidWdnZXJQcm94eVNlcnZpY2UnO1xuXG5leHBvcnQgdHlwZSBVc2VyTWVzc2FnZVR5cGUgPSAnbm90aWZpY2F0aW9uJyB8ICdjb25zb2xlJztcbmV4cG9ydCB0eXBlIE5vdGlmaWNhdGlvblR5cGUgPSAnaW5mbycgfCAnd2FybmluZycgfCAnZXJyb3InIHwgJ2ZhdGFsRXJyb3InO1xuXG5mdW5jdGlvbiBjcmVhdGVNZXNzYWdlKG1ldGhvZDogc3RyaW5nLCBwYXJhbXM6ID9PYmplY3QpOiBPYmplY3Qge1xuICBjb25zdCByZXN1bHQ6IE9iamVjdCA9IHttZXRob2R9O1xuICBpZiAocGFyYW1zKSB7XG4gICAgcmVzdWx0LnBhcmFtcyA9IHBhcmFtcztcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRoaXMgY2xhc3MgcHJvdmlkZXMgYSBjZW50cmFsIGNhbGxiYWNrIGNoYW5uZWwgdG8gY29tbXVuaWNhdGUgd2l0aCBkZWJ1Z2dlciBjbGllbnQuXG4gKiBDdXJyZW50bHkgaXQgcHJvdmlkZXMgdGhyZWUgY2FsbGJhY2sgY2hhbm5lbHM6XG4gKiAxLiBDaHJvbWUgc2VydmVyIG1lc3NhZ2VzLlxuICogMi4gQXRvbSBVSSBub3RpZmljYXRpb24uXG4gKiAzLiBDaHJvbWUgY29uc29sZSB1c2VyIG1lc3NhZ2VzLlxuICovXG5leHBvcnQgY2xhc3MgQ2xpZW50Q2FsbGJhY2sge1xuICBfc2VydmVyTWVzc2FnZU9ic2VydmFibGU6IFN1YmplY3Q7ICAvLyBGb3Igc2VydmVyIG1lc3NhZ2VzLlxuICBfbm90aWZpY2F0aW9uT2JzZXJ2YWJsZTogU3ViamVjdDsgICAvLyBGb3IgYXRvbSBVSSBub3RpZmljYXRpb25zLlxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3NlcnZlck1lc3NhZ2VPYnNlcnZhYmxlID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLl9ub3RpZmljYXRpb25PYnNlcnZhYmxlID0gbmV3IFN1YmplY3QoKTtcbiAgfVxuXG4gIGdldE5vdGlmaWNhdGlvbk9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxOb3RpZmljYXRpb25NZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMuX25vdGlmaWNhdGlvbk9ic2VydmFibGU7XG4gIH1cblxuICBnZXRTZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZTtcbiAgfVxuXG4gIHNlbmRVc2VyTWVzc2FnZSh0eXBlOiBVc2VyTWVzc2FnZVR5cGUsIG1lc3NhZ2U6IE9iamVjdCk6IHZvaWQge1xuICAgIGxvZ2dlci5sb2coYHNlbmRVc2VyTWVzc2FnZSgke3R5cGV9KTogJHtKU09OLnN0cmluZ2lmeShtZXNzYWdlKX1gKTtcbiAgICBpZiAodHlwZSA9PT0gJ25vdGlmaWNhdGlvbicpIHtcbiAgICAgIHRoaXMuX25vdGlmaWNhdGlvbk9ic2VydmFibGUub25OZXh0KHtcbiAgICAgICAgdHlwZTogbWVzc2FnZS50eXBlLFxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLm1lc3NhZ2UsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjb25zb2xlJykge1xuICAgICAgdGhpcy5zZW5kTWV0aG9kKCdDb25zb2xlLm1lc3NhZ2VBZGRlZCcsIHtcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIubG9nRXJyb3IoYFVua25vd24gVXNlck1lc3NhZ2VUeXBlOiAke3R5cGV9YCk7XG4gICAgfVxuICB9XG5cbiAgdW5rbm93bk1ldGhvZChpZDogbnVtYmVyLCBkb21haW46IHN0cmluZywgbWV0aG9kOiBzdHJpbmcsIHBhcmFtczogP09iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSAnVW5rbm93biBjaHJvbWUgZGV2IHRvb2xzIG1ldGhvZDogJyArIGRvbWFpbiArICcuJyArIG1ldGhvZDtcbiAgICBsb2dnZXIubG9nKG1lc3NhZ2UpO1xuICAgIHRoaXMucmVwbHlXaXRoRXJyb3IoaWQsIG1lc3NhZ2UpO1xuICB9XG5cbiAgcmVwbHlXaXRoRXJyb3IoaWQ6IG51bWJlciwgZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucmVwbHlUb0NvbW1hbmQoaWQsIHt9LCBlcnJvcik7XG4gIH1cblxuICByZXBseVRvQ29tbWFuZChpZDogbnVtYmVyLCByZXN1bHQ6IE9iamVjdCwgZXJyb3I6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB2YWx1ZTogT2JqZWN0ID0ge2lkLCByZXN1bHR9O1xuICAgIGlmIChlcnJvcikge1xuICAgICAgdmFsdWUuZXJyb3IgPSBlcnJvcjtcbiAgICB9XG4gICAgdGhpcy5fc2VuZEpzb25PYmplY3QodmFsdWUpO1xuICB9XG5cbiAgc2VuZE1ldGhvZChtZXRob2Q6IHN0cmluZywgcGFyYW1zOiA/T2JqZWN0KSB7XG4gICAgdGhpcy5fc2VuZEpzb25PYmplY3QoY3JlYXRlTWVzc2FnZShtZXRob2QsIHBhcmFtcykpO1xuICB9XG5cbiAgX3NlbmRKc29uT2JqZWN0KHZhbHVlOiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIGxvZ2dlci5sb2coJ1NlbmRpbmcgSlNPTjogJyArIG1lc3NhZ2UpO1xuICAgIHRoaXMuX3NlcnZlck1lc3NhZ2VPYnNlcnZhYmxlLm9uTmV4dChtZXNzYWdlKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fbm90aWZpY2F0aW9uT2JzZXJ2YWJsZS5vbkNvbXBsZXRlZCgpO1xuICAgIHRoaXMuX3NlcnZlck1lc3NhZ2VPYnNlcnZhYmxlLm9uQ29tcGxldGVkKCk7XG4gIH1cbn1cbiJdfQ==