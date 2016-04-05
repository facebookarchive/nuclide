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
 * Currently it provides four callback channels:
 * 1. Chrome server messages.
 * 2. Atom UI notification.
 * 3. Chrome console user messages.
 * 4. Output window messages.
 */

var ClientCallback = (function () {
  // For output window messages.

  function ClientCallback() {
    _classCallCheck(this, ClientCallback);

    this._serverMessageObservable = new _rx.Subject();
    this._notificationObservable = new _rx.Subject();
    this._outputWindowObservable = new _rx.Subject();
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
    key: 'getOutputWindowObservable',
    value: function getOutputWindowObservable() {
      return this._outputWindowObservable;
    }
  }, {
    key: 'sendUserMessage',
    value: function sendUserMessage(type, message) {
      _utils2['default'].log('sendUserMessage(' + type + '): ' + JSON.stringify(message));
      switch (type) {
        case 'notification':
          this._notificationObservable.onNext({
            type: message.type,
            message: message.message
          });
          break;
        case 'console':
          this.sendMethod(this._serverMessageObservable, 'Console.messageAdded', {
            message: message
          });
          break;
        case 'outputWindow':
          this.sendMethod(this._outputWindowObservable, 'Console.messageAdded', {
            message: message
          });
          break;
        default:
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
      this._sendJsonObject(this._serverMessageObservable, value);
    }
  }, {
    key: 'sendMethod',
    value: function sendMethod(observable, method, params) {
      this._sendJsonObject(observable, createMessage(method, params));
    }
  }, {
    key: '_sendJsonObject',
    value: function _sendJsonObject(observable, value) {
      var message = JSON.stringify(value);
      _utils2['default'].log('Sending JSON: ' + message);
      observable.onNext(message);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._notificationObservable.onCompleted();
      this._serverMessageObservable.onCompleted();
      this._outputWindowObservable.onCompleted();
    }
  }]);

  return ClientCallback;
})();

exports.ClientCallback = ClientCallback;
// For server messages.
// For atom UI notifications.
//# sourceMappingURL=data:application/json;base64,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RUFBRSxNQUFjLEVBQUUsTUFBZSxFQUFFO0FBQzFFLFVBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUNqRTs7O1dBRWMseUJBQUMsVUFBOEIsRUFBRSxLQUFhLEVBQVE7QUFDbkUsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0Qyx5QkFBTyxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDdkMsQUFBRSxnQkFBVSxDQUFtQixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDaEQ7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNDLFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUM1QyxVQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDNUM7OztTQS9FVSxjQUFjIiwiZmlsZSI6IkNsaWVudENhbGxiYWNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncngnO1xuXG5pbXBvcnQgdHlwZSB7Tm90aWZpY2F0aW9uTWVzc2FnZX0gZnJvbSAnLi4nO1xuXG5leHBvcnQgdHlwZSBVc2VyTWVzc2FnZVR5cGUgPSAnbm90aWZpY2F0aW9uJyB8ICdjb25zb2xlJyB8ICdvdXRwdXRXaW5kb3cnO1xuZXhwb3J0IHR5cGUgTm90aWZpY2F0aW9uVHlwZSA9ICdpbmZvJyB8ICd3YXJuaW5nJyB8ICdlcnJvcicgfCAnZmF0YWxFcnJvcic7XG5cbmZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2UobWV0aG9kOiBzdHJpbmcsIHBhcmFtczogP09iamVjdCk6IE9iamVjdCB7XG4gIGNvbnN0IHJlc3VsdDogT2JqZWN0ID0ge21ldGhvZH07XG4gIGlmIChwYXJhbXMpIHtcbiAgICByZXN1bHQucGFyYW1zID0gcGFyYW1zO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVGhpcyBjbGFzcyBwcm92aWRlcyBhIGNlbnRyYWwgY2FsbGJhY2sgY2hhbm5lbCB0byBjb21tdW5pY2F0ZSB3aXRoIGRlYnVnZ2VyIGNsaWVudC5cbiAqIEN1cnJlbnRseSBpdCBwcm92aWRlcyBmb3VyIGNhbGxiYWNrIGNoYW5uZWxzOlxuICogMS4gQ2hyb21lIHNlcnZlciBtZXNzYWdlcy5cbiAqIDIuIEF0b20gVUkgbm90aWZpY2F0aW9uLlxuICogMy4gQ2hyb21lIGNvbnNvbGUgdXNlciBtZXNzYWdlcy5cbiAqIDQuIE91dHB1dCB3aW5kb3cgbWVzc2FnZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGllbnRDYWxsYmFjayB7XG4gIF9zZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZTogU3ViamVjdDsgIC8vIEZvciBzZXJ2ZXIgbWVzc2FnZXMuXG4gIF9ub3RpZmljYXRpb25PYnNlcnZhYmxlOiBTdWJqZWN0OyAgIC8vIEZvciBhdG9tIFVJIG5vdGlmaWNhdGlvbnMuXG4gIF9vdXRwdXRXaW5kb3dPYnNlcnZhYmxlOiBTdWJqZWN0OyAgIC8vIEZvciBvdXRwdXQgd2luZG93IG1lc3NhZ2VzLlxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3NlcnZlck1lc3NhZ2VPYnNlcnZhYmxlID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLl9ub3RpZmljYXRpb25PYnNlcnZhYmxlID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLl9vdXRwdXRXaW5kb3dPYnNlcnZhYmxlID0gbmV3IFN1YmplY3QoKTtcbiAgfVxuXG4gIGdldE5vdGlmaWNhdGlvbk9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxOb3RpZmljYXRpb25NZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMuX25vdGlmaWNhdGlvbk9ic2VydmFibGU7XG4gIH1cblxuICBnZXRTZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZTtcbiAgfVxuXG4gIGdldE91dHB1dFdpbmRvd09ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fb3V0cHV0V2luZG93T2JzZXJ2YWJsZTtcbiAgfVxuXG4gIHNlbmRVc2VyTWVzc2FnZSh0eXBlOiBVc2VyTWVzc2FnZVR5cGUsIG1lc3NhZ2U6IE9iamVjdCk6IHZvaWQge1xuICAgIGxvZ2dlci5sb2coYHNlbmRVc2VyTWVzc2FnZSgke3R5cGV9KTogJHtKU09OLnN0cmluZ2lmeShtZXNzYWdlKX1gKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ25vdGlmaWNhdGlvbic6XG4gICAgICAgIHRoaXMuX25vdGlmaWNhdGlvbk9ic2VydmFibGUub25OZXh0KHtcbiAgICAgICAgICB0eXBlOiBtZXNzYWdlLnR5cGUsXG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZS5tZXNzYWdlLFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjb25zb2xlJzpcbiAgICAgICAgdGhpcy5zZW5kTWV0aG9kKHRoaXMuX3NlcnZlck1lc3NhZ2VPYnNlcnZhYmxlLCAnQ29uc29sZS5tZXNzYWdlQWRkZWQnLCB7XG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb3V0cHV0V2luZG93JzpcbiAgICAgICAgdGhpcy5zZW5kTWV0aG9kKHRoaXMuX291dHB1dFdpbmRvd09ic2VydmFibGUsICdDb25zb2xlLm1lc3NhZ2VBZGRlZCcsIHtcbiAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsb2dnZXIubG9nRXJyb3IoYFVua25vd24gVXNlck1lc3NhZ2VUeXBlOiAke3R5cGV9YCk7XG4gICAgfVxuICB9XG5cbiAgdW5rbm93bk1ldGhvZChpZDogbnVtYmVyLCBkb21haW46IHN0cmluZywgbWV0aG9kOiBzdHJpbmcsIHBhcmFtczogP09iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSAnVW5rbm93biBjaHJvbWUgZGV2IHRvb2xzIG1ldGhvZDogJyArIGRvbWFpbiArICcuJyArIG1ldGhvZDtcbiAgICBsb2dnZXIubG9nKG1lc3NhZ2UpO1xuICAgIHRoaXMucmVwbHlXaXRoRXJyb3IoaWQsIG1lc3NhZ2UpO1xuICB9XG5cbiAgcmVwbHlXaXRoRXJyb3IoaWQ6IG51bWJlciwgZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucmVwbHlUb0NvbW1hbmQoaWQsIHt9LCBlcnJvcik7XG4gIH1cblxuICByZXBseVRvQ29tbWFuZChpZDogbnVtYmVyLCByZXN1bHQ6IE9iamVjdCwgZXJyb3I6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB2YWx1ZTogT2JqZWN0ID0ge2lkLCByZXN1bHR9O1xuICAgIGlmIChlcnJvcikge1xuICAgICAgdmFsdWUuZXJyb3IgPSBlcnJvcjtcbiAgICB9XG4gICAgdGhpcy5fc2VuZEpzb25PYmplY3QodGhpcy5fc2VydmVyTWVzc2FnZU9ic2VydmFibGUsIHZhbHVlKTtcbiAgfVxuXG4gIHNlbmRNZXRob2Qob2JzZXJ2YWJsZTogT2JzZXJ2YWJsZTxzdHJpbmc+LCBtZXRob2Q6IHN0cmluZywgcGFyYW1zOiA/T2JqZWN0KSB7XG4gICAgdGhpcy5fc2VuZEpzb25PYmplY3Qob2JzZXJ2YWJsZSwgY3JlYXRlTWVzc2FnZShtZXRob2QsIHBhcmFtcykpO1xuICB9XG5cbiAgX3NlbmRKc29uT2JqZWN0KG9ic2VydmFibGU6IE9ic2VydmFibGU8c3RyaW5nPiwgdmFsdWU6IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgbG9nZ2VyLmxvZygnU2VuZGluZyBKU09OOiAnICsgbWVzc2FnZSk7XG4gICAgKChvYnNlcnZhYmxlIDogYW55KSA6IFN1YmplY3QpLm9uTmV4dChtZXNzYWdlKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fbm90aWZpY2F0aW9uT2JzZXJ2YWJsZS5vbkNvbXBsZXRlZCgpO1xuICAgIHRoaXMuX3NlcnZlck1lc3NhZ2VPYnNlcnZhYmxlLm9uQ29tcGxldGVkKCk7XG4gICAgdGhpcy5fb3V0cHV0V2luZG93T2JzZXJ2YWJsZS5vbkNvbXBsZXRlZCgpO1xuICB9XG59XG4iXX0=